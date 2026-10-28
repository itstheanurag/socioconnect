import { createRoute, z } from "@hono/zod-openapi";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import { SubscriptionsRepository, AccountsRepository, SubscriptionTierEnum } from "@repo/db";
import { errorResponseSchemas, logger } from "@repo/shared";
import type { AppRouteHandler } from "@/types";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";
import { resolveWorkspaceId } from "@/utils/workspace";

export const getQuotasSummaryRoute = createRoute({
  method: "get",
  middleware: [enforceUserMiddleware],
  path: "/v1/quotas/summary",
  tags: ["Quotas"],
  summary: "Get creator usage and plan quotas",
  description:
    "Retrieves active channels, monthly drops used, AI adaptations balance, and billing cycle status",
  responses: {
    200: {
      description: "Quotas retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              tier: z.enum(SubscriptionTierEnum),
              channels: z.object({
                connected: z.number().openapi({ example: 6 }),
                max: z.number().openapi({ example: 10 }),
              }),
              monthlyDrops: z.object({
                used: z.number().openapi({ example: 18 }),
                max: z.number().openapi({ example: 100 }),
              }),
              aiAdaptations: z.object({
                used: z.number().openapi({ example: 7 }),
                max: z.number().openapi({ example: 50 }),
              }),
              cdnStorage: z.object({
                usedBytes: z.number().openapi({ example: 840000000 }),
                maxBytes: z.number().openapi({ example: 25000000000 }),
              }),
              cycleResetsAt: z.string().openapi({ example: "2026-10-01T00:00:00.000Z" }),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type GetQuotasSummaryRoute = typeof getQuotasSummaryRoute;

export const getQuotasSummaryHandler: AppRouteHandler<GetQuotasSummaryRoute> = async (c) => {
  const user = c.get("user");

  try {
    const workspaceId = await resolveWorkspaceId(user.id, c.var.auth);
    const subscription = await SubscriptionsRepository.getOrCreateForWorkspace(workspaceId);
    const connectedAccounts = await AccountsRepository.findAllByWorkspaceId(workspaceId);

    return c.json({
      message: "Quotas retrieved successfully",
      payload: {
        tier: subscription.tier as SubscriptionTierEnum,
        channels: {
          connected: connectedAccounts.length,
          max: subscription.limits.maxChannels,
        },
        monthlyDrops: {
          used: subscription.usage.monthlyDropsUsed,
          max: subscription.limits.maxMonthlyDrops,
        },
        aiAdaptations: {
          used: subscription.usage.aiCreditsUsed,
          max: subscription.limits.maxAiCredits,
        },
        cdnStorage: {
          usedBytes: subscription.usage.cdnStorageUsedBytes,
          maxBytes: subscription.limits.maxCdnStorageBytes,
        },
        cycleResetsAt: subscription.currentPeriodEnd.toISOString(),
      },
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error retrieving quotas summary", {
      module: "quotas",
      action: "getQuotasSummaryHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Internal Server Error" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};
