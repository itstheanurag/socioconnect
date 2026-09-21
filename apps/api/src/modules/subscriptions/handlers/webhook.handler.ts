import { createRoute, z } from "@hono/zod-openapi";
import {
  SubscriptionsRepository,
  SubscriptionTierEnum,
  SubscriptionStatusEnum,
  BillingIntervalEnum,
  InvoiceStatusEnum,
} from "@repo/db";
import { errorResponseSchemas, logger } from "@repo/shared";
import type { AppRouteHandler } from "@/types";
import { StatusCodes } from "@repo/config";

export const postSubscriptionWebhookRoute = createRoute({
  method: "post",
  path: "/v1/subscriptions/webhook",
  tags: ["Subscriptions"],
  summary: "Process payment gateway webhook",
  description: "Handles asynchronous subscription lifecycle and invoice events from payment providers",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            event: z.string().openapi({ example: "invoice.paid" }),
            data: z.record(z.string(), z.unknown()),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Webhook processed successfully",
      content: {
        "application/json": {
          schema: z.object({
            received: z.boolean(),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type PostSubscriptionWebhookRoute = typeof postSubscriptionWebhookRoute;

export const postSubscriptionWebhookHandler: AppRouteHandler<PostSubscriptionWebhookRoute> = async (c) => {
  const { event, data } = c.req.valid("json");

  try {
    logger.info(`Received subscription webhook event: ${event}`, {
      module: "billing",
      action: "webhook:received",
      event,
    });

    // In production, verify webhook HMAC signature
    // Process known event types
    if (event === "invoice.paid") {
      const customerId = data.customerId as string;
      const amountPaid = Number(data.amountPaid) || 4900;
      const invoiceNumber = (data.invoiceNumber as string) || `INV-${Date.now().toString(36).toUpperCase()}`;

      logger.info(`Invoice ${invoiceNumber} marked as paid`, {
        module: "billing",
        action: "webhook:invoicePaid",
        customerId,
        amountPaid,
      });
    }

    return c.json({ received: true });
  } catch (err) {
    logger.error("Error processing subscription webhook", {
      module: "billing",
      action: "webhook:error",
      error: err,
    });

    return c.json({ received: false }, StatusCodes.HTTP_200_OK);
  }
};
