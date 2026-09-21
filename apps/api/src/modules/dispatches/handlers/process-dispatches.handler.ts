import { createRoute, z } from "@hono/zod-openapi";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import { PostsRepository, DispatchStatusEnum } from "@repo/db";
import { errorResponseSchemas, logger } from "@repo/shared";
import type { AppRouteHandler } from "@/types";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";

// 1. Process Due Dispatches (Outbox Runner)
export const processDueDispatchesRoute = createRoute({
  method: "post",
  path: "/v1/dispatches/process-due",
  tags: ["Dispatches"],
  summary: "Trigger outbox processor for due dispatches",
  description:
    "Queries all dispatches scheduled at or before now, executes platform publishing, handles retries, and audits state",
  responses: {
    200: {
      description: "Dispatches processed",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              processedCount: z.number(),
              successCount: z.number(),
              failedCount: z.number(),
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
    const dueDispatches = await PostsRepository.findDueDispatches(new Date(), 20);

    let successCount = 0;
    let failedCount = 0;

    for (const dispatch of dueDispatches) {
      try {
        // Mark as PROCESSING
        await PostsRepository.updateDispatchResult(dispatch.id, {
          status: DispatchStatusEnum.PROCESSING,
        });

        // Simulate publishing to platform API
        const mockExternalId = `ext_${dispatch.platform}_${Date.now()}`;
        const mockExternalUrl = `https://${dispatch.platform}.com/post/${mockExternalId}`;

        // Mark as SUCCESS
        await PostsRepository.updateDispatchResult(dispatch.id, {
          status: DispatchStatusEnum.SUCCESS,
          externalPostId: mockExternalId,
          externalPostUrl: mockExternalUrl,
        });

        successCount++;

        logger.audit("dispatch published successfully", {
          module: "dispatches",
          action: "processDueDispatches",
          dispatchId: dispatch.id,
          platform: dispatch.platform,
        });
      } catch (err) {
        failedCount++;
        const nextRetry = dispatch.retryCount + 1;
        const willRetry = nextRetry < dispatch.maxRetries;

        await PostsRepository.updateDispatchResult(dispatch.id, {
          status: willRetry ? DispatchStatusEnum.PENDING : DispatchStatusEnum.FAILED,
          retryCount: nextRetry,
          errorDetails: {
            message: err instanceof Error ? err.message : String(err),
            timestamp: new Date().toISOString(),
          },
          nextRetryAt: willRetry
            ? new Date(Date.now() + 1000 * 60 * Math.pow(2, nextRetry))
            : undefined,
        });
      }
    }

    return c.json({
      message: "Dispatches processing cycle complete",
      payload: {
        processedCount: dueDispatches.length,
        successCount,
        failedCount,
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

// 2. Retry a Failed Dispatch
export const retryDispatchRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/dispatches/:id/retry",
  tags: ["Dispatches"],
  summary: "Retry a failed dispatch",
  description: "Reschedules a failed channel dispatch for immediate re-execution",
  request: {
    params: z.object({
      id: z.string().uuid().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
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
              dispatchId: z.string().uuid(),
              status: z.nativeEnum(DispatchStatusEnum),
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
