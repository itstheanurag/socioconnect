import { createRoute, z } from "@hono/zod-openapi";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import {
  SubscriptionsRepository,
  SubscriptionTierEnum,
  BillingIntervalEnum,
} from "@repo/db";
import { errorResponseSchemas, logger } from "@repo/shared";
import type { AppRouteHandler } from "@/types";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";

export const checkoutSubscriptionRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/subscriptions/checkout",
  tags: ["Subscriptions"],
  summary: "Upgrade or buy subscription",
  description: "Creates a checkout session or directly upgrades subscription tier and allocates updated limits",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            tier: z.nativeEnum(SubscriptionTierEnum),
            interval: z.nativeEnum(BillingIntervalEnum).default(BillingIntervalEnum.MONTHLY),
            successUrl: z.string().url().optional(),
            cancelUrl: z.string().url().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Checkout or upgrade initialized successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              subscriptionId: z.string().uuid(),
              tier: z.nativeEnum(SubscriptionTierEnum),
              interval: z.nativeEnum(BillingIntervalEnum),
              checkoutUrl: z.string().nullable(),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type CheckoutSubscriptionRoute = typeof checkoutSubscriptionRoute;

export const checkoutSubscriptionHandler: AppRouteHandler<CheckoutSubscriptionRoute> = async (c) => {
  const { tier, interval, successUrl } = c.req.valid("json");
  const user = c.get("user");

  try {
    // Perform instant upgrade / provision
    const updated = await SubscriptionsRepository.updateTier(user.id, tier, interval, {
      customerId: `cus_${user.id.slice(0, 8)}`,
      subscriptionId: `sub_${Date.now()}`,
    });

    const checkoutUrl = successUrl || `https://socioconnect.app/app/usage?upgraded=true&tier=${tier}`;

    return c.json({
      message: `Successfully upgraded to ${tier} tier`,
      payload: {
        subscriptionId: updated.id,
        tier: updated.tier as SubscriptionTierEnum,
        interval: updated.billingInterval as BillingIntervalEnum,
        checkoutUrl,
      },
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error creating checkout / upgrading subscription", {
      module: "subscriptions",
      action: "checkoutSubscriptionHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Failed to process upgrade" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};
