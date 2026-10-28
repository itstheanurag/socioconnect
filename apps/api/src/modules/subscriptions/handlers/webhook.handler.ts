import { createHash } from "node:crypto";
import { createRoute, z } from "@hono/zod-openapi";
import { BillingWebhookEventsRepository } from "@repo/db";
import { errorResponseSchemas, logger } from "@repo/shared";
import type { AppRouteHandler } from "@/types";
import { StatusCodes } from "@repo/config";
import { HTTPException } from "hono/http-exception";
import { dodoConfig } from "../dodo.config";
import {
  DODO_WEBHOOK_HEADERS,
  verifyDodoWebhookSignature,
} from "../services/dodo-webhook-verifier";
import { dodoWebhookEventSchema, processDodoWebhook } from "../services/dodo-webhook.service";

export const postSubscriptionWebhookRoute = createRoute({
  method: "post",
  path: "/v1/subscriptions/webhook",
  tags: ["Subscriptions"],
  summary: "Process Dodo Payments webhook",
  description:
    "Verifies the Standard Webhooks signature, deduplicates the event by webhook-id, and syncs subscription and invoice state. The raw request body is required for signature verification.",
  responses: {
    200: {
      description: "Webhook processed successfully",
      content: {
        "application/json": {
          schema: z.object({
            received: z.boolean(),
            duplicate: z.boolean().optional(),
          }),
        },
      },
    },
    [StatusCodes.HTTP_503_SERVICE_UNAVAILABLE]: {
      description: "Billing webhooks are not configured",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type PostSubscriptionWebhookRoute = typeof postSubscriptionWebhookRoute;

export const postSubscriptionWebhookHandler: AppRouteHandler<PostSubscriptionWebhookRoute> = async (
  c,
) => {
  const rawBody = await c.req.text();
  const webhookId = c.req.header(DODO_WEBHOOK_HEADERS.id);
  const timestamp = c.req.header(DODO_WEBHOOK_HEADERS.timestamp);
  const signature = c.req.header(DODO_WEBHOOK_HEADERS.signature);

  if (!webhookId || !timestamp || !signature) {
    logger.warn("billing webhook is missing required headers", {
      module: "billing",
      action: "webhook:missingHeaders",
    });
    throw new HTTPException(StatusCodes.HTTP_400_BAD_REQUEST, {
      res: c.json(
        { message: "Missing webhook signature headers" },
        StatusCodes.HTTP_400_BAD_REQUEST,
      ),
    });
  }

  if (!dodoConfig.skipWebhookVerification) {
    if (!dodoConfig.webhookKey) {
      logger.error("billing webhook key is not configured", {
        module: "billing",
        action: "webhook:notConfigured",
      });
      throw new HTTPException(StatusCodes.HTTP_503_SERVICE_UNAVAILABLE, {
        res: c.json(
          { message: "Billing webhook is not configured" },
          StatusCodes.HTTP_503_SERVICE_UNAVAILABLE,
        ),
      });
    }

    const isValid = verifyDodoWebhookSignature(
      rawBody,
      { id: webhookId, timestamp, signature },
      dodoConfig.webhookKey,
    );

    if (!isValid) {
      logger.warn("billing webhook signature verification failed", {
        module: "billing",
        action: "webhook:invalidSignature",
        webhookId,
      });
      throw new HTTPException(StatusCodes.HTTP_401_UNAUTHORIZED, {
        res: c.json({ message: "Invalid webhook signature" }, StatusCodes.HTTP_401_UNAUTHORIZED),
      });
    }
  } else {
    logger.warn("billing webhook signature verification is disabled", {
      module: "billing",
      action: "webhook:verificationSkipped",
      webhookId,
    });
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    throw new HTTPException(StatusCodes.HTTP_400_BAD_REQUEST, {
      res: c.json({ message: "Invalid JSON payload" }, StatusCodes.HTTP_400_BAD_REQUEST),
    });
  }

  const parsedEvent = dodoWebhookEventSchema.safeParse(parsedBody);
  if (!parsedEvent.success) {
    logger.warn("billing webhook payload failed validation", {
      module: "billing",
      action: "webhook:invalidPayload",
      webhookId,
      issues: parsedEvent.error.issues,
    });
    throw new HTTPException(StatusCodes.HTTP_400_BAD_REQUEST, {
      res: c.json({ message: "Invalid webhook payload" }, StatusCodes.HTTP_400_BAD_REQUEST),
    });
  }

  const event = parsedEvent.data;
  const payloadHash = createHash("sha256").update(rawBody).digest("hex");

  try {
    const claim = await BillingWebhookEventsRepository.begin(webhookId, event.type, payloadHash);

    if (claim.isDuplicate) {
      return c.json({ received: true, duplicate: true });
    }

    try {
      await processDodoWebhook(event);
      await BillingWebhookEventsRepository.markProcessed(claim.record.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown webhook processing error";
      await BillingWebhookEventsRepository.markFailed(claim.record.id, message);
      throw err;
    }

    logger.info(`processed billing webhook: ${event.type}`, {
      module: "billing",
      action: "webhook:processed",
      eventType: event.type,
      webhookId,
    });

    return c.json({ received: true });
  } catch (err) {
    logger.error("Error processing billing webhook", {
      module: "billing",
      action: "webhook:error",
      eventType: event.type,
      webhookId,
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json(
        { message: "Webhook processing failed" },
        StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR,
      ),
    });
  }
};
