import { createRoute, z } from "@hono/zod-openapi";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import {
  SubscriptionsRepository,
  SubscriptionTierEnum,
  SubscriptionStatusEnum,
  BillingIntervalEnum,
  DEFAULT_PLAN_LIMITS,
} from "@repo/db";
import { errorResponseSchemas, logger } from "@repo/shared";
import type { AppRouteHandler } from "@/types";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";

// 1. Get Current Subscription & Usage
export const getCurrentSubscriptionRoute = createRoute({
  method: "get",
  middleware: [enforceUserMiddleware],
  path: "/v1/subscriptions/current",
  tags: ["Subscriptions"],
  summary: "Get current subscription & usage",
  description: "Retrieves active plan tier, limits, real-time usage meters, and billing cycle status",
  responses: {
    200: {
      description: "Subscription retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              id: z.string().uuid(),
              tier: z.nativeEnum(SubscriptionTierEnum),
              status: z.nativeEnum(SubscriptionStatusEnum),
              billingInterval: z.nativeEnum(BillingIntervalEnum),
              currentPeriodStart: z.string(),
              currentPeriodEnd: z.string(),
              cancelAtPeriodEnd: z.boolean(),
              canceledAt: z.string().nullable(),
              limits: z.object({
                maxChannels: z.number(),
                maxMonthlyDrops: z.number(),
                maxAiCredits: z.number(),
                maxCdnStorageBytes: z.number(),
                maxTeamMembers: z.number(),
                hasDedicatedScheduler: z.boolean(),
                hasPrioritySupport: z.boolean(),
                hasCustomBranding: z.boolean(),
              }),
              usage: z.object({
                channelsUsed: z.number(),
                monthlyDropsUsed: z.number(),
                aiCreditsUsed: z.number(),
                cdnStorageUsedBytes: z.number(),
                teamMembersUsed: z.number(),
              }),
              percentageUsed: z.object({
                channels: z.number(),
                drops: z.number(),
                aiCredits: z.number(),
                cdnStorage: z.number(),
              }),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type GetCurrentSubscriptionRoute = typeof getCurrentSubscriptionRoute;

export const getCurrentSubscriptionHandler: AppRouteHandler<GetCurrentSubscriptionRoute> = async (c) => {
  const user = c.get("user");

  try {
    const sub = await SubscriptionsRepository.getOrCreate(user.id);

    const channelPct = Math.min(100, Math.round((sub.usage.channelsUsed / sub.limits.maxChannels) * 100));
    const dropsPct = Math.min(100, Math.round((sub.usage.monthlyDropsUsed / sub.limits.maxMonthlyDrops) * 100));
    const aiPct = Math.min(100, Math.round((sub.usage.aiCreditsUsed / sub.limits.maxAiCredits) * 100));
    const storagePct = Math.min(100, Math.round((sub.usage.cdnStorageUsedBytes / sub.limits.maxCdnStorageBytes) * 100));

    return c.json({
      message: "Subscription retrieved successfully",
      payload: {
        id: sub.id,
        tier: sub.tier as SubscriptionTierEnum,
        status: sub.status as SubscriptionStatusEnum,
        billingInterval: sub.billingInterval as BillingIntervalEnum,
        currentPeriodStart: sub.currentPeriodStart.toISOString(),
        currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        canceledAt: sub.canceledAt ? sub.canceledAt.toISOString() : null,
        limits: sub.limits,
        usage: sub.usage,
        percentageUsed: {
          channels: channelPct,
          drops: dropsPct,
          aiCredits: aiPct,
          cdnStorage: storagePct,
        },
      },
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error retrieving subscription", {
      module: "subscriptions",
      action: "getCurrentSubscriptionHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Internal Server Error" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};

// 2. Get Plan Catalog
export const getPlansCatalogRoute = createRoute({
  method: "get",
  path: "/v1/subscriptions/plans",
  tags: ["Subscriptions"],
  summary: "List all subscription plans & pricing",
  description: "Returns the available subscription tiers, feature comparison matrix, and pricing options",
  responses: {
    200: {
      description: "Plans catalog retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              plans: z.array(
                z.object({
                  tier: z.nativeEnum(SubscriptionTierEnum),
                  name: z.string(),
                  description: z.string(),
                  popular: z.boolean().optional(),
                  monthlyPriceDollars: z.number(),
                  yearlyPriceDollars: z.number(),
                  limits: z.object({
                    maxChannels: z.number(),
                    maxMonthlyDrops: z.number(),
                    maxAiCredits: z.number(),
                    maxCdnStorageBytes: z.number(),
                    maxTeamMembers: z.number(),
                    hasDedicatedScheduler: z.boolean(),
                    hasPrioritySupport: z.boolean(),
                    hasCustomBranding: z.boolean(),
                  }),
                  features: z.array(z.string()),
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

export type GetPlansCatalogRoute = typeof getPlansCatalogRoute;

export const getPlansCatalogHandler: AppRouteHandler<GetPlansCatalogRoute> = async (c) => {
  const plans = [
    {
      tier: SubscriptionTierEnum.FREE,
      name: "Starter Free",
      description: "Essential multi-channel broadcasting for emerging creators",
      popular: false,
      monthlyPriceDollars: 0,
      yearlyPriceDollars: 0,
      limits: DEFAULT_PLAN_LIMITS[SubscriptionTierEnum.FREE],
      features: [
        "2 Connected social accounts",
        "15 Multi-channel drops / month",
        "10 AI adaptation credits",
        "1 GB Media vault storage",
        "Standard publishing engine",
      ],
    },
    {
      tier: SubscriptionTierEnum.SOLO,
      name: "Solo Creator",
      description: "Dedicated scheduling and community targeting for independent makers",
      popular: false,
      monthlyPriceDollars: 19,
      yearlyPriceDollars: 190,
      limits: DEFAULT_PLAN_LIMITS[SubscriptionTierEnum.SOLO],
      features: [
        "5 Connected social accounts",
        "75 Multi-channel drops / month",
        "100 AI adaptation credits",
        "10 GB Media vault storage",
        "Peak-time visual scheduler",
        "Target community & subreddit posting",
      ],
    },
    {
      tier: SubscriptionTierEnum.CREATOR_PRO,
      name: "Creator Pro",
      description: "The complete publishing OS for active creators and small creative teams",
      popular: true,
      monthlyPriceDollars: 49,
      yearlyPriceDollars: 490,
      limits: DEFAULT_PLAN_LIMITS[SubscriptionTierEnum.CREATOR_PRO],
      features: [
        "15 Connected social accounts",
        "300 Multi-channel drops / month",
        "500 AI adaptation credits",
        "50 GB Media vault storage",
        "3 Team member seats",
        "Custom creator watermark & branding",
        "Priority queue & fast retry engine",
      ],
    },
    {
      tier: SubscriptionTierEnum.STUDIO,
      name: "Studio",
      description: "High-volume orchestration for studios and multi-brand operators",
      popular: false,
      monthlyPriceDollars: 129,
      yearlyPriceDollars: 1290,
      limits: DEFAULT_PLAN_LIMITS[SubscriptionTierEnum.STUDIO],
      features: [
        "50 Connected social accounts",
        "1,500 Multi-channel drops / month",
        "2,500 AI adaptation credits",
        "250 GB Media vault storage",
        "10 Team member seats",
        "Custom branding & priority SLA",
        "Webhooks and API access",
      ],
    },
    {
      tier: SubscriptionTierEnum.AGENCY,
      name: "Agency",
      description: "Enterprise scale and dedicated infrastructure for agencies",
      popular: false,
      monthlyPriceDollars: 299,
      yearlyPriceDollars: 2990,
      limits: DEFAULT_PLAN_LIMITS[SubscriptionTierEnum.AGENCY],
      features: [
        "200 Connected social accounts",
        "10,000 Multi-channel drops / month",
        "10,000 AI adaptation credits",
        "1 TB Media vault storage",
        "30 Team member seats",
        "Dedicated account manager",
        "99.99% Guaranteed dispatch uptime",
      ],
    },
  ];

  return c.json({
    message: "Plans catalog retrieved successfully",
    payload: { plans },
  });
};
