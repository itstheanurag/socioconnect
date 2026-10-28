import { createRoute, z } from "@hono/zod-openapi";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import { SubscriptionsRepository, SubscriptionTierEnum, BillingIntervalEnum } from "@repo/db";
import { errorResponseSchemas, logger } from "@repo/shared";
import type { AppRouteHandler } from "@/types";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";
import { BillingProviderError, DodoPaymentsService } from "../services/dodo-payments.service";

export const checkoutSubscriptionRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/subscriptions/checkout",
  tags: ["Subscriptions"],
  summary: "Create a Dodo Payments checkout session",
  description:
    "Creates a hosted Dodo Payments checkout session for the selected plan. Entitlements are granted only after the subscription webhook is received.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            tier: z.enum(SubscriptionTierEnum),
            interval: z.enum(BillingIntervalEnum).default(BillingIntervalEnum.MONTHLY),
            successUrl: z.url().optional(),
            cancelUrl: z.url().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Checkout session created successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              sessionId: z.string(),
              checkoutUrl: z.string(),
              tier: z.enum(SubscriptionTierEnum),
              interval: z.enum(BillingIntervalEnum),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type CheckoutSubscriptionRoute = typeof checkoutSubscriptionRoute;

export const checkoutSubscriptionHandler: AppRouteHandler<CheckoutSubscriptionRoute> = async (
  c,
) => {
  const { tier, interval, successUrl, cancelUrl } = c.req.valid("json");
  const user = c.get("user");

  if (tier === SubscriptionTierEnum.FREE) {
    throw new HTTPException(StatusCodes.HTTP_400_BAD_REQUEST, {
      res: c.json(
        { message: "The free plan does not require checkout" },
        StatusCodes.HTTP_400_BAD_REQUEST,
      ),
    });
  }

  try {
    const existing = await SubscriptionsRepository.findByUserId(user.id);

    const session = await DodoPaymentsService.createCheckoutSession({
      userId: user.id,
      email: user.email,
      name: `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`,
      tier,
      interval,
      customerId: existing?.externalCustomerId,
      successUrl,
      cancelUrl,
    });

    if (!session.checkout_url) {
      throw new BillingProviderError(
        "Dodo Payments did not return a checkout URL",
        502,
        "BILLING_CHECKOUT_UNAVAILABLE",
      );
    }

    logger.audit("billing checkout session created", {
      module: "subscriptions",
      action: "checkoutSubscriptionHandler",
      userId: user.id,
      tier,
      interval,
      sessionId: session.session_id,
    });

    return c.json({
      message: "Checkout session created successfully",
      payload: {
        sessionId: session.session_id,
        checkoutUrl: session.checkout_url,
        tier,
        interval,
      },
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    if (err instanceof BillingProviderError) {
      logger.error("billing provider rejected checkout session", {
        module: "subscriptions",
        action: "checkoutSubscriptionHandler",
        error: err,
        code: err.code,
      });

      throw new HTTPException(err.statusCode as 400, {
        res: c.json({ message: err.message }, err.statusCode as 400),
      });
    }

    logger.error("Error creating checkout session", {
      module: "subscriptions",
      action: "checkoutSubscriptionHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json(
        { message: "Failed to create checkout session" },
        StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR,
      ),
    });
  }
};
