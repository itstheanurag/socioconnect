import { createRoute, z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";
import { createRouter, errorResponseSchemas, logger } from "@repo/shared";
import {
  db,
  PostsRepository,
  PublishIntentActorEnum,
  PublishIntentModeEnum,
  PublishIntentStateEnum,
  PublishIntentsRepository,
  QuotasRepository,
} from "@repo/db";
import type { AppBindings, AppRouteHandler } from "@/types";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import { isAccountAllowed } from "@/utils/authz";
import { recordAuditEvent, recordUsageEvent } from "@/utils/events";
import { buildPreview, computeRevisionHash } from "./publish-intents.service";

const ACTIVE_POST_STATUSES = new Set(["draft", "scheduled"]);

const intentSchema = z.object({
  id: z.uuid(),
  postId: z.uuid(),
  state: z.enum(PublishIntentStateEnum),
  mode: z.enum(PublishIntentModeEnum),
  scheduledAt: z.string().nullable(),
  expiresAt: z.string(),
  confirmedAt: z.string().nullable(),
  createdAt: z.string(),
});

export const createPublishIntentRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/publish-intents",
  tags: ["Publish Intents"],
  summary: "Create a publish intent",
  description:
    "Validates a draft and returns a short-lived intent with a per-destination preview. Publishing or scheduling requires a second explicit confirm call.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            postId: z.uuid(),
            mode: z.enum(PublishIntentModeEnum),
            scheduledAt: z.string().datetime().optional(),
            timezone: z.string().optional(),
            expiresInSeconds: z.number().int().min(60).max(900).optional().default(600),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Publish intent created",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              intent: intentSchema,
              preview: z.record(z.string(), z.unknown()),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type CreatePublishIntentRoute = typeof createPublishIntentRoute;

export const createPublishIntentHandler: AppRouteHandler<CreatePublishIntentRoute> = async (c) => {
  const user = c.get("user");
  const auth = c.var.auth;
  const body = c.req.valid("json");

  try {
    const post = await PostsRepository.findById(body.postId);

    if (!post || post.userId !== user.id) {
      throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
        res: c.json({ message: "Post not found" }, StatusCodes.HTTP_404_NOT_FOUND),
      });
    }

    if (auth?.workspaceId && post.workspaceId && post.workspaceId !== auth.workspaceId) {
      throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
        res: c.json({ message: "Post not found" }, StatusCodes.HTTP_404_NOT_FOUND),
      });
    }

    if (!ACTIVE_POST_STATUSES.has(post.status)) {
      throw new HTTPException(StatusCodes.HTTP_409_CONFLICT, {
        res: c.json(
          {
            message: `Post cannot be published from status '${post.status}'`,
            code: "POST_NOT_PUBLISHABLE",
          },
          StatusCodes.HTTP_409_CONFLICT,
        ),
      });
    }

    if (post.dispatches.length === 0) {
      throw new HTTPException(StatusCodes.HTTP_400_BAD_REQUEST, {
        res: c.json(
          { message: "Post has no destination targets", code: "NO_DESTINATIONS" },
          StatusCodes.HTTP_400_BAD_REQUEST,
        ),
      });
    }

    const forbidden = (post.dispatches as Array<{ accountId: string }>).find(
      (dispatch) => !isAccountAllowed(auth, dispatch.accountId),
    );
    if (forbidden) {
      throw new HTTPException(StatusCodes.HTTP_403_FORBIDDEN, {
        res: c.json(
          {
            message: "This API key is not allowed to publish to one or more target accounts",
            code: "ACCOUNT_NOT_ALLOWED",
            accountId: forbidden.accountId,
          },
          StatusCodes.HTTP_403_FORBIDDEN,
        ),
      });
    }

    let scheduledAt: Date | null = null;
    if (body.mode === PublishIntentModeEnum.SCHEDULE) {
      if (!body.scheduledAt) {
        throw new HTTPException(StatusCodes.HTTP_400_BAD_REQUEST, {
          res: c.json(
            { message: "scheduledAt is required for schedule mode", code: "SCHEDULED_AT_REQUIRED" },
            StatusCodes.HTTP_400_BAD_REQUEST,
          ),
        });
      }

      scheduledAt = new Date(body.scheduledAt);
      if (scheduledAt <= new Date()) {
        throw new HTTPException(StatusCodes.HTTP_400_BAD_REQUEST, {
          res: c.json(
            { message: "scheduledAt must be in the future", code: "SCHEDULED_AT_IN_PAST" },
            StatusCodes.HTTP_400_BAD_REQUEST,
          ),
        });
      }
    }

    const workspaceId = post.workspaceId ?? auth?.workspaceId;
    if (!workspaceId) {
      throw new HTTPException(StatusCodes.HTTP_400_BAD_REQUEST, {
        res: c.json({ message: "Post has no workspace" }, StatusCodes.HTTP_400_BAD_REQUEST),
      });
    }

    const expiresAt = new Date(Date.now() + (body.expiresInSeconds ?? 600) * 1000);
    const intent = await PublishIntentsRepository.create({
      workspaceId,
      postId: post.id,
      createdByUserId: user.id,
      createdByType:
        auth?.type === "api_key" ? PublishIntentActorEnum.API_KEY : PublishIntentActorEnum.USER,
      createdByKeyId: auth?.apiKeyId ?? null,
      mode: body.mode,
      draftRevisionHash: computeRevisionHash(post),
      scheduledAt,
      expiresAt,
    });

    await recordAuditEvent(c, {
      action: "publish_intent.created",
      resourceType: "publish_intent",
      resourceId: intent.id,
      metadata: {
        postId: post.id,
        mode: intent.mode,
        scheduledAt: scheduledAt?.toISOString() ?? null,
        destinations: post.dispatches.length,
      },
    });

    return c.json(
      {
        message: "Publish intent created. Confirm it to publish or schedule.",
        payload: {
          intent: {
            id: intent.id,
            postId: intent.postId,
            state: intent.state as PublishIntentStateEnum,
            mode: intent.mode as PublishIntentModeEnum,
            scheduledAt: intent.scheduledAt ? intent.scheduledAt.toISOString() : null,
            expiresAt: intent.expiresAt.toISOString(),
            confirmedAt: null,
            createdAt: intent.createdAt.toISOString(),
          },
          preview: buildPreview(post) as unknown as Record<string, unknown>,
        },
      },
      StatusCodes.HTTP_201_CREATED,
    );
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error creating publish intent", {
      module: "posts",
      action: "createPublishIntentHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json(
        { message: "Failed to create publish intent" },
        StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR,
      ),
    });
  }
};

export const getPublishIntentRoute = createRoute({
  method: "get",
  middleware: [enforceUserMiddleware],
  path: "/v1/publish-intents/{id}",
  tags: ["Publish Intents"],
  summary: "Get a publish intent",
  request: {
    params: z.object({ id: z.uuid() }),
  },
  responses: {
    200: {
      description: "Publish intent retrieved",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              intent: intentSchema,
              preview: z.record(z.string(), z.unknown()).optional(),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type GetPublishIntentRoute = typeof getPublishIntentRoute;

export const getPublishIntentHandler: AppRouteHandler<GetPublishIntentRoute> = async (c) => {
  const user = c.get("user");
  const { id } = c.req.valid("param");
  const intent = await PublishIntentsRepository.findById(id);

  if (!intent || intent.createdByUserId !== user.id) {
    throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
      res: c.json({ message: "Publish intent not found" }, StatusCodes.HTTP_404_NOT_FOUND),
    });
  }

  let current = intent;
  if (current.state === PublishIntentStateEnum.PENDING && current.expiresAt < new Date()) {
    current = await PublishIntentsRepository.markExpired(current.id);
  }

  const post = await PostsRepository.findById(current.postId);

  return c.json({
    message: "Publish intent retrieved",
    payload: {
      intent: {
        id: current.id,
        postId: current.postId,
        state: current.state as PublishIntentStateEnum,
        mode: current.mode as PublishIntentModeEnum,
        scheduledAt: current.scheduledAt ? current.scheduledAt.toISOString() : null,
        expiresAt: current.expiresAt.toISOString(),
        confirmedAt: current.confirmedAt ? current.confirmedAt.toISOString() : null,
        createdAt: current.createdAt.toISOString(),
      },
      ...(post ? { preview: buildPreview(post) as unknown as Record<string, unknown> } : {}),
    },
  });
};

export const confirmPublishIntentRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/publish-intents/{id}/confirm",
  tags: ["Publish Intents"],
  summary: "Confirm a publish intent",
  description:
    "Publishes or schedules the post after verifying that the draft has not changed since the intent was created.",
  request: {
    params: z.object({ id: z.uuid() }),
  },
  responses: {
    200: {
      description: "Publish intent confirmed",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              intentId: z.uuid(),
              postId: z.uuid(),
              state: z.enum(PublishIntentStateEnum),
              mode: z.enum(PublishIntentModeEnum),
              postStatus: z.string(),
              scheduledAt: z.string().nullable(),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type ConfirmPublishIntentRoute = typeof confirmPublishIntentRoute;

export const confirmPublishIntentHandler: AppRouteHandler<ConfirmPublishIntentRoute> = async (
  c,
) => {
  const user = c.get("user");
  const auth = c.var.auth;
  const { id } = c.req.valid("param");

  try {
    const intent = await PublishIntentsRepository.findById(id);

    if (!intent || intent.createdByUserId !== user.id) {
      throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
        res: c.json({ message: "Publish intent not found" }, StatusCodes.HTTP_404_NOT_FOUND),
      });
    }

    if (intent.state !== PublishIntentStateEnum.PENDING) {
      throw new HTTPException(StatusCodes.HTTP_409_CONFLICT, {
        res: c.json(
          {
            message: `Publish intent is '${intent.state}' and cannot be confirmed`,
            code: "INTENT_NOT_PENDING",
          },
          StatusCodes.HTTP_409_CONFLICT,
        ),
      });
    }

    if (intent.expiresAt < new Date()) {
      await PublishIntentsRepository.markExpired(intent.id);
      throw new HTTPException(StatusCodes.HTTP_410_GONE, {
        res: c.json(
          { message: "Publish intent has expired", code: "INTENT_EXPIRED" },
          StatusCodes.HTTP_410_GONE,
        ),
      });
    }

    const post = await PostsRepository.findById(intent.postId);
    if (!post || post.userId !== user.id) {
      throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
        res: c.json({ message: "Post not found" }, StatusCodes.HTTP_404_NOT_FOUND),
      });
    }

    if (auth?.workspaceId && post.workspaceId && post.workspaceId !== auth.workspaceId) {
      throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
        res: c.json({ message: "Post not found" }, StatusCodes.HTTP_404_NOT_FOUND),
      });
    }

    if (computeRevisionHash(post) !== intent.draftRevisionHash) {
      throw new HTTPException(StatusCodes.HTTP_409_CONFLICT, {
        res: c.json(
          {
            message: "The draft changed after this intent was created. Create a new intent.",
            code: "DRAFT_CHANGED",
          },
          StatusCodes.HTTP_409_CONFLICT,
        ),
      });
    }

    const forbidden = (post.dispatches as Array<{ accountId: string }>).find(
      (dispatch) => !isAccountAllowed(auth, dispatch.accountId),
    );
    if (forbidden) {
      throw new HTTPException(StatusCodes.HTTP_403_FORBIDDEN, {
        res: c.json(
          {
            message: "This API key is not allowed to publish to one or more target accounts",
            code: "ACCOUNT_NOT_ALLOWED",
            accountId: forbidden.accountId,
          },
          StatusCodes.HTTP_403_FORBIDDEN,
        ),
      });
    }

    const scheduledAt =
      intent.mode === PublishIntentModeEnum.SCHEDULE ? intent.scheduledAt : new Date();

    if (!scheduledAt) {
      throw new HTTPException(StatusCodes.HTTP_409_CONFLICT, {
        res: c.json(
          { message: "Publish intent has no scheduled time", code: "INTENT_MISSING_SCHEDULE" },
          StatusCodes.HTTP_409_CONFLICT,
        ),
      });
    }

    const result = await db.transaction(async (tx) => {
      const activatedPost = await PostsRepository.activateForPublish(
        post.id,
        {
          mode: intent.mode === PublishIntentModeEnum.SCHEDULE ? "schedule" : "publish",
          scheduledAt,
        },
        { tx },
      );
      const confirmed = await PublishIntentsRepository.markConfirmed(intent.id, { tx });
      return { activatedPost, confirmed };
    });

    await QuotasRepository.incrementDrops(user.id, post.dispatches.length);

    await recordUsageEvent(c, {
      operation: "publish_operation",
      quantity: post.dispatches.length,
      postId: post.id,
      metadata: {
        intentId: intent.id,
        mode: intent.mode,
        destinations: post.dispatches.length,
      },
    });
    await recordAuditEvent(c, {
      action: "publish_intent.confirmed",
      resourceType: "publish_intent",
      resourceId: intent.id,
      metadata: {
        postId: post.id,
        mode: intent.mode,
        postStatus: result.activatedPost.status,
        destinations: post.dispatches.length,
      },
    });

    logger.audit("publish intent executed", {
      module: "posts",
      action: "confirmPublishIntentHandler",
      userId: user.id,
      postId: post.id,
      intentId: intent.id,
      mode: intent.mode,
    });

    return c.json({
      message:
        intent.mode === PublishIntentModeEnum.SCHEDULE
          ? "Post scheduled successfully"
          : "Post queued for publishing",
      payload: {
        intentId: result.confirmed.id,
        postId: result.activatedPost.id,
        state: result.confirmed.state as PublishIntentStateEnum,
        mode: result.confirmed.mode as PublishIntentModeEnum,
        postStatus: result.activatedPost.status,
        scheduledAt: result.activatedPost.scheduledAt
          ? result.activatedPost.scheduledAt.toISOString()
          : null,
      },
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error confirming publish intent", {
      module: "posts",
      action: "confirmPublishIntentHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json(
        { message: "Failed to confirm publish intent" },
        StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR,
      ),
    });
  }
};

export const publishIntentRoutes = createRouter<AppBindings>();

publishIntentRoutes.openapi(createPublishIntentRoute, createPublishIntentHandler);
publishIntentRoutes.openapi(getPublishIntentRoute, getPublishIntentHandler);
publishIntentRoutes.openapi(confirmPublishIntentRoute, confirmPublishIntentHandler);
