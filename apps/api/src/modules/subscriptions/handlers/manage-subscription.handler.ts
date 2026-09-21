import { createRoute, z } from "@hono/zod-openapi";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import { SubscriptionsRepository, SubscriptionStatusEnum } from "@repo/db";
import { errorResponseSchemas, logger } from "@repo/shared";
import type { AppRouteHandler } from "@/types";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";

// 1. Cancel Subscription (at period end)
export const cancelSubscriptionRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/subscriptions/cancel",
  tags: ["Subscriptions"],
  summary: "Cancel subscription at period end",
  description: "Sets the subscription to cancel when the current billing cycle expires",
  responses: {
    200: {
      description: "Subscription scheduled for cancellation",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              cancelAtPeriodEnd: z.boolean(),
              canceledAt: z.string(),
              currentPeriodEnd: z.string(),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type CancelSubscriptionRoute = typeof cancelSubscriptionRoute;

export const cancelSubscriptionHandler: AppRouteHandler<CancelSubscriptionRoute> = async (c) => {
  const user = c.get("user");

  try {
    const updated = await SubscriptionsRepository.cancelAtPeriodEnd(user.id);

    return c.json({
      message: "Subscription scheduled for cancellation at the end of the current billing cycle",
      payload: {
        cancelAtPeriodEnd: updated.cancelAtPeriodEnd,
        canceledAt: updated.canceledAt ? updated.canceledAt.toISOString() : new Date().toISOString(),
        currentPeriodEnd: updated.currentPeriodEnd.toISOString(),
      },
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error canceling subscription", {
      module: "subscriptions",
      action: "cancelSubscriptionHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Failed to cancel subscription" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};

// 2. Resume Subscription
export const resumeSubscriptionRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/subscriptions/resume",
  tags: ["Subscriptions"],
  summary: "Resume canceled subscription",
  description: "Reactivates a subscription that was scheduled to cancel at the end of the billing period",
  responses: {
    200: {
      description: "Subscription resumed successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              status: z.nativeEnum(SubscriptionStatusEnum),
              cancelAtPeriodEnd: z.boolean(),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type ResumeSubscriptionRoute = typeof resumeSubscriptionRoute;

export const resumeSubscriptionHandler: AppRouteHandler<ResumeSubscriptionRoute> = async (c) => {
  const user = c.get("user");

  try {
    const updated = await SubscriptionsRepository.resume(user.id);

    return c.json({
      message: "Subscription successfully resumed and will auto-renew",
      payload: {
        status: updated.status as SubscriptionStatusEnum,
        cancelAtPeriodEnd: updated.cancelAtPeriodEnd,
      },
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error resuming subscription", {
      module: "subscriptions",
      action: "resumeSubscriptionHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Failed to resume subscription" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};
