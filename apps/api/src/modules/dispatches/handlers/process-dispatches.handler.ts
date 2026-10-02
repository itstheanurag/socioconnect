import { createRoute, z } from "@hono/zod-openapi";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import {
  PostsRepository,
  AccountsRepository,
  MediaRepository,
  NotificationsRepository,
  DispatchStatusEnum,
  TransactionOutcomeEnum,
  NotificationTypeEnum,
  NotificationPriorityEnum,
  SocialPlatformEnum,
} from "@repo/db";
import { decrypt, encrypt, errorResponseSchemas, logger } from "@repo/shared";
import type { AppRouteHandler } from "@/types";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";
import type {
  AuthCredentials,
  PublishResult,
  SocialPlatform,
  TokenRefreshResult,
  UniversalPostPayload,
} from "@repo/libraries";
import { createSocialProviderRegistry, providerIdForPlatform } from "@/modules/provider-registry";
import { env } from "@/env";

const providerRegistry = createSocialProviderRegistry();

// Error classification helper
interface ExecutionError {
  message: string;
  statusCode?: number;
  code?: string;
  isRetryable: boolean;
  isRateLimit: boolean;
  rawResponse?: Record<string, unknown>;
  stack?: string;
  retryAfterSeconds?: number;
}

function classifyPlatformError(err: unknown, platform: string): ExecutionError {
  const errorObj = err as any;
  const message = errorObj?.message || String(err);
  const statusCode = errorObj?.statusCode || errorObj?.status || 0;
  const stack = errorObj?.stack || "";
  const rawResponse = errorObj?.response?.data || errorObj?.rawResponse || errorObj?.rawError || errorObj?.data;
  const classification = errorObj?.classification;

  // Rate Limiting (429)
  if (
    statusCode === 429 ||
    message.toLowerCase().includes("rate limit") ||
    message.toLowerCase().includes("too many requests")
  ) {
    return {
      message: `Rate limited by ${platform}: ${message}`,
      statusCode: 429,
      code: "RATE_LIMITED",
      isRetryable: true,
      isRateLimit: true,
      retryAfterSeconds: errorObj?.retryAfterSeconds,
      rawResponse,
      stack,
    };
  }

  // Authentication & Authorization (401, 403) - Permanent until user reconnects account
  if (
    statusCode === 401 ||
    statusCode === 403 ||
    classification === "NEEDS_RECONNECT" ||
    message.toLowerCase().includes("token expired") ||
    message.toLowerCase().includes("unauthorized")
  ) {
    return {
      message: `Authentication failed on ${platform}. Access token may be expired or revoked.`,
      statusCode,
      code: "AUTH_REVOKED",
      isRetryable: false,
      isRateLimit: false,
      rawResponse,
      stack,
    };
  }

  // Bad Request / Content Validation (400) - Permanent error in formatting/media
  if (
    statusCode === 400 ||
    statusCode === 422 ||
    classification === "VALIDATION_FAILED" ||
    classification === "PERMANENT_REJECTION"
  ) {
    return {
      message: `Content rejected by ${platform} API: ${message}`,
      statusCode,
      code: "VALIDATION_FAILED",
      isRetryable: false,
      isRateLimit: false,
      rawResponse,
      stack,
    };
  }

  // Server errors (500, 502, 503, 504) or network timeouts - Transient retryable
  const isRetryable = statusCode >= 500 || classification === "TRANSIENT_NETWORK";
  return {
    message: `${isRetryable ? "Transient error" : "Provider error"} from ${platform}: ${message}`,
    statusCode,
    code: isRetryable ? "TRANSIENT_SERVER_ERROR" : "PROVIDER_ERROR",
    isRetryable,
    isRateLimit: false,
    rawResponse,
    stack,
  };
}

// Compute exponential backoff with jitter
function calculateNextRetryTime(
  attemptNumber: number,
  isRateLimit: boolean,
  retryAfterSeconds?: number,
): Date {
  const baseDelaySeconds = retryAfterSeconds || (isRateLimit ? 120 : 30);
  const exponentialSeconds = Math.min(baseDelaySeconds * Math.pow(2, attemptNumber), 3600 * 4); // max 4 hours
  const jitterSeconds = Math.floor(Math.random() * 15);
  const delayMs = (exponentialSeconds + jitterSeconds) * 1000;
  return new Date(Date.now() + delayMs);
}

// 1. Process Due Dispatches (Autonomous Outbox Queue Worker)
export const processDueDispatchesRoute = createRoute({
  method: "post",
  path: "/v1/dispatches/process-due",
  tags: ["Dispatches"],
  summary: "Trigger outbox processor for due dispatches",
  description:
    "Atomically claims scheduled channel dispatches, executes platform APIs concurrently with full failure isolation, and records audit transactions",
  responses: {
    200: {
      description: "Dispatches processed",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              claimedCount: z.number(),
              successCount: z.number(),
              failedCount: z.number(),
              rateLimitedCount: z.number(),
              results: z.array(
                z.object({
                  dispatchId: z.string(),
                  platform: z.string(),
                  outcome: z.string(),
                  externalPostUrl: z.string().nullable(),
                  errorMessage: z.string().nullable(),
                }),
              ),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type ProcessDueDispatchesRoute = typeof processDueDispatchesRoute;

export const processDueDispatchesHandler: AppRouteHandler<ProcessDueDispatchesRoute> = async (
  c,
) => {
  try {
    // 1. Fetch due dispatches
    const dueDispatches = await PostsRepository.findDueDispatches(new Date(), 25);
    if (dueDispatches.length === 0) {
      return c.json({
        message: "No due dispatches to process",
        payload: {
          claimedCount: 0,
          successCount: 0,
          failedCount: 0,
          rateLimitedCount: 0,
          results: [],
        },
      });
    }

    // 2. Atomically claim dispatches to avoid worker race conditions
    const claimedIds = await PostsRepository.claimDispatchesForExecution(
      dueDispatches.map((d) => d.id),
    );
    const toProcess = dueDispatches.filter((d) => claimedIds.includes(d.id));

    // 3. Process each platform dispatch independently in parallel
    const executionPromises = toProcess.map(async (dispatch) => {
      const startTime = Date.now();
      const currentAttempt = dispatch.retryCount + 1;
      const requestPayload = {
        title: dispatch.customTitle || dispatch.post.title,
        content: dispatch.customContent || dispatch.post.content,
        mediaIds: dispatch.post.mediaIds,
        platformOptions: dispatch.platformOptions,
      };

      try {
        if (dispatch.account.status !== "active") {
          throw new Error(`Connected ${dispatch.platform} account is ${dispatch.account.status}`);
        }
        if (dispatch.account.userId !== dispatch.post.userId) {
          throw new Error("Connected account does not belong to the post owner");
        }
        if (
          dispatch.destination &&
          (dispatch.destination.accountId !== dispatch.accountId ||
            dispatch.destination.platform !== dispatch.platform)
        ) {
          throw new Error("Selected destination does not belong to the target account");
        }
        const provider = providerRegistry.get(
          providerIdForPlatform(dispatch.platform) as SocialPlatform,
        );
        const mediaFromVault = await Promise.all(
          (dispatch.post.mediaIds || []).map(async (mediaId) => {
            const asset = await MediaRepository.findById(mediaId);
            if (!asset || asset.userId !== dispatch.post.userId) {
              throw new Error(
                `Media asset ${mediaId} is missing or does not belong to the post owner`,
              );
            }
            if (asset.type === "audio") {
              throw new Error(
                `Media asset ${mediaId} is audio and cannot be attached to a social post`,
              );
            }
            return {
              id: asset.id,
              url: asset.url,
              type: asset.type,
              mimeType: asset.mimeType,
              sizeBytes: asset.sizeBytes || undefined,
              width: asset.width || undefined,
              height: asset.height || undefined,
              durationSeconds: asset.durationSeconds || undefined,
              thumbnailUrl: asset.thumbnailUrl || undefined,
              altText: asset.altText || undefined,
            };
          }),
        );
        const providerMedia = Array.isArray(dispatch.post.metadata?.providerMedia)
          ? (dispatch.post.metadata.providerMedia as UniversalPostPayload["media"])
          : [];
        const media = [...mediaFromVault, ...(providerMedia || [])];
        const credentials: AuthCredentials = {
          accessToken: decrypt(
            dispatch.account.accessToken,
            dispatch.account.accessTokenIv,
            dispatch.account.accessTokenTag,
            env.ENCRYPTION_KEY,
          ),
          refreshToken:
            dispatch.account.refreshToken &&
            dispatch.account.refreshTokenIv &&
            dispatch.account.refreshTokenTag
              ? decrypt(
                  dispatch.account.refreshToken,
                  dispatch.account.refreshTokenIv,
                  dispatch.account.refreshTokenTag,
                  env.ENCRYPTION_KEY,
                )
              : undefined,
          expiresAt: dispatch.account.accessTokenExpiresAt || undefined,
          accountId: dispatch.account.platformAccountId,
          accountHandle: dispatch.account.username,
          accountName: dispatch.account.displayName || undefined,
          avatarUrl: dispatch.account.avatarUrl || undefined,
          extra: {
            ...(dispatch.account.metadata || {}),
            ...(typeof dispatch.account.metadata?.telegramChatId === "string"
              ? { chatId: dispatch.account.metadata.telegramChatId }
              : {}),
            ...(dispatch.destination ? { chatId: dispatch.destination.externalId } : {}),
          },
        };
        const payload: UniversalPostPayload = {
          title: requestPayload.title || undefined,
          content: requestPayload.content,
          media,
          tags: dispatch.post.tags,
          linkUrl: dispatch.post.linkUrl || undefined,
          platformOptions: {
            ...dispatch.platformOptions,
            ...(dispatch.platform === SocialPlatformEnum.TELEGRAM && dispatch.destination
              ? { chatId: dispatch.destination.externalId }
              : {}),
          } as UniversalPostPayload["platformOptions"],
          idempotencyKey: dispatch.id,
        };
        const onTokenRefreshed = async (tokens: TokenRefreshResult) => {
          const access = encrypt(tokens.accessToken, env.ENCRYPTION_KEY);
          const refresh = tokens.refreshToken
            ? encrypt(tokens.refreshToken, env.ENCRYPTION_KEY)
            : undefined;
          await AccountsRepository.updateTokens(dispatch.accountId, {
            accessToken: access.data,
            accessTokenIv: access.iv,
            accessTokenTag: access.tag,
            accessTokenExpiresAt: tokens.expiresAt,
            ...(refresh
              ? {
                  refreshToken: refresh.data,
                  refreshTokenIv: refresh.iv,
                  refreshTokenTag: refresh.tag,
                }
              : {}),
          });
        };
        let result: PublishResult;
        if (dispatch.platform === SocialPlatformEnum.TIKTOK && dispatch.externalPostId) {
          const status = await provider.checkPublishStatus(
            dispatch.externalPostId,
            credentials,
            onTokenRefreshed,
          );
          if (status.status === "pending") {
            const nextCheckAt = new Date(Date.now() + 30_000);
            await PostsRepository.updateDispatchResult(dispatch.id, {
              status: DispatchStatusEnum.PENDING,
              nextRetryAt: nextCheckAt,
              errorDetails: { code: "PUBLISH_PROCESSING", message: "TikTok is processing the post" },
            });
            return {
              dispatchId: dispatch.id,
              platform: dispatch.platform,
              outcome: "processing",
              externalPostUrl: null,
              errorMessage: null,
            };
          }
          if (status.status === "failed") {
            const error = new Error(status.errorMessage || "TikTok could not publish the post");
            (error as Error & { statusCode: number }).statusCode = 400;
            throw error;
          }
          result = {
            success: true,
            externalPostId: status.externalPostId || dispatch.externalPostId,
            externalPostUrl: status.externalPostUrl,
            publishedAt: new Date(),
            rawResponse: status.rawResponse,
          };
        } else {
          result = await provider.publishPost(payload, credentials, onTokenRefreshed);
        }
        if (result.pending) {
          const nextCheckAt = new Date(Date.now() + 30_000);
          await PostsRepository.updateDispatchResult(dispatch.id, {
            status: DispatchStatusEnum.PENDING,
            externalPostId: result.externalPostId,
            nextRetryAt: nextCheckAt,
            errorDetails: { code: "PUBLISH_PROCESSING", message: "TikTok is processing the post" },
          });
          return {
            dispatchId: dispatch.id,
            platform: dispatch.platform,
            outcome: "processing",
            externalPostUrl: null,
            errorMessage: null,
          };
        }
        const externalPostId = result.externalPostId;
        const externalPostUrl = result.externalPostUrl || null;
        const latencyMs = Date.now() - startTime;
        const responsePayload =
          result.rawResponse && typeof result.rawResponse === "object" && !Array.isArray(result.rawResponse)
            ? (result.rawResponse as Record<string, unknown>)
            : { status: "OK", id: externalPostId, raw: result.rawResponse };

        // Mark dispatch SUCCESS
        await PostsRepository.updateDispatchResult(dispatch.id, {
          status: DispatchStatusEnum.SUCCESS,
          externalPostId,
          externalPostUrl: externalPostUrl || undefined,
          retryCount: currentAttempt,
        });

        // Record successful transaction log
        await PostsRepository.recordDispatchTransaction({
          dispatchId: dispatch.id,
          postId: dispatch.postId,
          accountId: dispatch.accountId,
          platform: dispatch.platform,
          attemptNumber: currentAttempt,
          outcome: TransactionOutcomeEnum.SUCCESS,
          httpStatusCode: 200,
          externalPostId,
          externalPostUrl,
          requestPayload,
          responsePayload,
          latencyMs,
        });

        return {
          dispatchId: dispatch.id,
          platform: dispatch.platform,
          outcome: "success",
          externalPostUrl,
          errorMessage: null,
        };
      } catch (err) {
        const latencyMs = Date.now() - startTime;
        const classified = classifyPlatformError(err, dispatch.platform);
        const willRetry = classified.isRetryable && currentAttempt < dispatch.maxRetries;
        const nextRetryAt = willRetry
          ? calculateNextRetryTime(
              currentAttempt,
              classified.isRateLimit,
              classified.retryAfterSeconds,
            )
          : undefined;

        const nextStatus = classified.isRateLimit
          ? DispatchStatusEnum.RATE_LIMITED
          : willRetry
            ? DispatchStatusEnum.PENDING
            : DispatchStatusEnum.FAILED;

        const outcome = classified.isRateLimit
          ? TransactionOutcomeEnum.RATE_LIMITED
          : willRetry
            ? TransactionOutcomeEnum.RETRYABLE_FAILURE
            : TransactionOutcomeEnum.PERMANENT_FAILURE;

        // Update dispatch outcome without affecting other platforms
        await PostsRepository.updateDispatchResult(dispatch.id, {
          status: nextStatus,
          ...(dispatch.platform === SocialPlatformEnum.TIKTOK && dispatch.externalPostId
            ? { externalPostId: null }
            : {}),
          retryCount: currentAttempt,
          nextRetryAt: nextRetryAt || null,
          errorDetails: {
            message: classified.message,
            statusCode: classified.statusCode,
            code: classified.code,
            timestamp: new Date().toISOString(),
          },
        });

        // Record audit transaction record in database
        await PostsRepository.recordDispatchTransaction({
          dispatchId: dispatch.id,
          postId: dispatch.postId,
          accountId: dispatch.accountId,
          platform: dispatch.platform,
          attemptNumber: currentAttempt,
          outcome,
          httpStatusCode: classified.statusCode,
          requestPayload,
          responsePayload: classified.rawResponse,
          errorCode: classified.code,
          errorMessage: classified.message,
          errorStack: classified.stack,
          latencyMs,
          nextRetryAt,
        });

        // If permanent failure or auth error, send in-app notification to creator
        if (!willRetry || classified.code === "AUTH_REVOKED") {
          try {
            await NotificationsRepository.create({
              userId: dispatch.account.userId,
              type:
                classified.code === "AUTH_REVOKED"
                  ? NotificationTypeEnum.TOKEN_EXPIRING
                  : NotificationTypeEnum.DISPATCH_FAILED,
              priority: NotificationPriorityEnum.HIGH,
              title: `Publishing failed on ${dispatch.platform.toUpperCase()}`,
              message: classified.message,
              linkUrl: `/app/connectors`,
              metadata: {
                dispatchId: dispatch.id,
                postId: dispatch.postId,
                platform: dispatch.platform,
              },
            });
          } catch (notifErr) {
            logger.error("Failed to create dispatch failure notification", {
              module: "dispatches",
              action: "createNotification",
              error: notifErr,
            });
          }
        }

        return {
          dispatchId: dispatch.id,
          platform: dispatch.platform,
          outcome: classified.isRateLimit
            ? "rate_limited"
            : willRetry
              ? "retry_scheduled"
              : "failed",
          externalPostUrl: null,
          errorMessage: classified.message,
        };
      }
    });

    const results = await Promise.all(executionPromises);

    const successCount = results.filter((r) => r.outcome === "success").length;
    const rateLimitedCount = results.filter((r) => r.outcome === "rate_limited").length;
    const failedCount = results.filter(
      (r) => r.outcome === "failed" || r.outcome === "retry_scheduled",
    ).length;

    return c.json({
      message: "Dispatches processing cycle complete",
      payload: {
        claimedCount: toProcess.length,
        successCount,
        failedCount,
        rateLimitedCount,
        results,
      },
    });
  } catch (err) {
    logger.error("Error processing due dispatches", {
      module: "dispatches",
      action: "processDueDispatchesHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json(
        { message: "Failed to process dispatches" },
        StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR,
      ),
    });
  }
};

// 2. Retry a Failed Dispatch (Isolated manual retry)
export const retryDispatchRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/dispatches/:id/retry",
  tags: ["Dispatches"],
  summary: "Retry an individual failed dispatch",
  description:
    "Reschedules a single platform dispatch for immediate re-execution without modifying sibling channels",
  request: {
    params: z.object({
      id: z.uuid().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
    }),
  },
  responses: {
    200: {
      description: "Dispatch queued for retry",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              dispatchId: z.uuid(),
              status: z.enum(DispatchStatusEnum),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type RetryDispatchRoute = typeof retryDispatchRoute;

export const retryDispatchHandler: AppRouteHandler<RetryDispatchRoute> = async (c) => {
  const { id } = c.req.valid("param");

  try {
    const updated = await PostsRepository.updateDispatchResult(id, {
      status: DispatchStatusEnum.PENDING,
      externalPostId: null,
      nextRetryAt: null,
      errorDetails: {},
    });

    return c.json({
      message: "Dispatch queued for immediate retry",
      payload: {
        dispatchId: updated.id,
        status: updated.status as DispatchStatusEnum,
      },
    });
  } catch (err) {
    logger.error("Error retrying dispatch", {
      module: "dispatches",
      action: "retryDispatchHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json(
        { message: "Failed to retry dispatch" },
        StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR,
      ),
    });
  }
};

// 3. List Audit Transactions for a Dispatch
export const getDispatchTransactionsRoute = createRoute({
  method: "get",
  middleware: [enforceUserMiddleware],
  path: "/v1/dispatches/:id/transactions",
  tags: ["Dispatches"],
  summary: "Get audit transaction history for a dispatch",
  description:
    "Retrieves complete immutable attempt logs, HTTP responses, error diagnostics, and latencies",
  request: {
    params: z.object({
      id: z.uuid(),
    }),
  },
  responses: {
    200: {
      description: "Transactions retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              transactions: z.array(
                z.object({
                  id: z.uuid(),
                  attemptNumber: z.number(),
                  outcome: z.enum(TransactionOutcomeEnum),
                  httpStatusCode: z.number().nullable(),
                  externalPostId: z.string().nullable(),
                  externalPostUrl: z.string().nullable(),
                  errorCode: z.string().nullable(),
                  errorMessage: z.string().nullable(),
                  latencyMs: z.number(),
                  nextRetryAt: z.string().nullable(),
                  executedAt: z.string(),
                }),
              ),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type GetDispatchTransactionsRoute = typeof getDispatchTransactionsRoute;

export const getDispatchTransactionsHandler: AppRouteHandler<GetDispatchTransactionsRoute> = async (
  c,
) => {
  const { id } = c.req.valid("param");

  try {
    const rawTransactions = await PostsRepository.getDispatchTransactions({ dispatchId: id });

    const transactions = rawTransactions.map((tx) => ({
      id: tx.id,
      attemptNumber: tx.attemptNumber,
      outcome: tx.outcome as TransactionOutcomeEnum,
      httpStatusCode: tx.httpStatusCode,
      externalPostId: tx.externalPostId,
      externalPostUrl: tx.externalPostUrl,
      errorCode: tx.errorCode,
      errorMessage: tx.errorMessage,
      latencyMs: tx.latencyMs,
      nextRetryAt: tx.nextRetryAt ? tx.nextRetryAt.toISOString() : null,
      executedAt: tx.executedAt.toISOString(),
    }));

    return c.json({
      message: "Transactions retrieved successfully",
      payload: { transactions },
    });
  } catch (err) {
    logger.error("Error retrieving dispatch transactions", {
      module: "dispatches",
      action: "getDispatchTransactionsHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json(
        { message: "Failed to retrieve transactions" },
        StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR,
      ),
    });
  }
};
