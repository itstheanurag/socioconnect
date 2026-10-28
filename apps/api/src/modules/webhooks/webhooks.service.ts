import { createHmac, randomBytes, randomUUID } from "node:crypto";
import {
  WebhookDeliveryStatusEnum,
  WebhookRepository,
  WebhookStatusEnum,
  type WebhookDelivery,
  type WebhookEndpoint,
} from "@repo/db";
import { decrypt, encrypt, logger } from "@repo/shared";
import { env } from "@/env";

export const WEBHOOK_EVENTS = [
  "post.created",
  "post.updated",
  "post.cancelled",
  "post.published",
  "post.failed",
  "publish_intent.created",
  "publish_intent.confirmed",
  "dispatch.retried",
  "dispatch.succeeded",
  "dispatch.failed",
  "webhook.test",
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export interface PublicWebhookEndpoint {
  id: string;
  url: string;
  description: string | null;
  events: string[];
  status: string;
  createdAt: string;
}

export function sanitizeEndpoint(endpoint: WebhookEndpoint): PublicWebhookEndpoint {
  return {
    id: endpoint.id,
    url: endpoint.url,
    description: endpoint.description,
    events: endpoint.events,
    status: endpoint.status,
    createdAt: endpoint.createdAt.toISOString(),
  };
}

export function validateWebhookUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Webhook URL is invalid");
  }

  if (url.username || url.password || url.hash) {
    throw new Error("Webhook URL must not contain credentials or fragments");
  }

  const isLocalhost = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);

  if (env.NODE_ENV === "production") {
    if (url.protocol !== "https:") {
      throw new Error("Webhook URL must use HTTPS");
    }
  } else if (url.protocol !== "https:" && !(url.protocol === "http:" && isLocalhost)) {
    throw new Error("Webhook URL must use HTTPS or localhost HTTP in development");
  }

  return url.toString();
}

export function signWebhook(
  secret: string,
  timestamp: string,
  body: string,
): string {
  return createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
}

function createSecret(): string {
  return `whsec_${randomBytes(32).toString("base64url")}`;
}

export const WebhookService = {
  async createEndpoint(input: {
    workspaceId: string;
    createdByUserId: string;
    url: string;
    description?: string;
    events: string[];
  }) {
    const url = validateWebhookUrl(input.url);
    const events = input.events.length > 0 ? input.events : ["*"];
    if (events.includes("*") === false) {
      const invalid = events.filter(
        (event) => !(WEBHOOK_EVENTS as readonly string[]).includes(event),
      );
      if (invalid.length > 0) {
        throw new Error(`Unsupported webhook events: ${invalid.join(", ")}`);
      }
    }

    const secret = createSecret();
    const encrypted = encrypt(secret, env.ENCRYPTION_KEY);

    const endpoint = await WebhookRepository.createEndpoint({
      workspaceId: input.workspaceId,
      createdByUserId: input.createdByUserId,
      url,
      description: input.description ?? null,
      events,
      secretCiphertext: encrypted.data,
      secretIv: encrypted.iv,
      secretTag: encrypted.tag,
      status: WebhookStatusEnum.ACTIVE,
    });

    return { endpoint: sanitizeEndpoint(endpoint), secret };
  },

  async listEndpoints(workspaceId: string) {
    const endpoints = await WebhookRepository.listEndpoints(workspaceId);
    return endpoints.map(sanitizeEndpoint);
  },

  async deleteEndpoint(id: string, workspaceId: string) {
    const endpoint = await WebhookRepository.disableEndpoint(id, workspaceId);
    return endpoint ? sanitizeEndpoint(endpoint) : null;
  },

  /**
   * Creates durable delivery rows and attempts delivery in the background.
   * Pending rows can be retried by a worker using `nextRetryAt`.
   */
  async emit(
    workspaceId: string,
    event: WebhookEvent,
    data: Record<string, unknown>,
  ): Promise<void> {
    try {
      const endpoints = await WebhookRepository.findActiveForEvent(workspaceId, event);
      if (endpoints.length === 0) return;

      const createdAt = new Date().toISOString();

      for (const endpoint of endpoints) {
        const deliveryId = randomUUID();
        const payload = {
          id: deliveryId,
          type: event,
          createdAt,
          workspaceId,
          data,
        };

        const delivery = await WebhookRepository.createDelivery({
          id: deliveryId,
          endpointId: endpoint.id,
          workspaceId,
          event,
          payload,
          status: WebhookDeliveryStatusEnum.PENDING,
        });

        void deliver(delivery, endpoint).catch((err) => {
          logger.error("webhook delivery failed", {
            module: "webhooks",
            action: "service:deliver",
            error: err,
            deliveryId: delivery.id,
          });
        });
      }
    } catch (err) {
      logger.error("failed to emit webhook event", {
        module: "webhooks",
        action: "service:emit",
        error: err,
        event,
      });
    }
  },

  async testEndpoint(id: string, workspaceId: string) {
    const endpoint = await WebhookRepository.findEndpoint(id, workspaceId);
    if (!endpoint) return null;

    const deliveryId = randomUUID();
    const delivery = await WebhookRepository.createDelivery({
      id: deliveryId,
      endpointId: endpoint.id,
      workspaceId,
      event: "webhook.test",
      payload: {
        id: deliveryId,
        type: "webhook.test",
        createdAt: new Date().toISOString(),
        workspaceId,
        data: { message: "SocioConnect webhook test" },
      },
      status: WebhookDeliveryStatusEnum.PENDING,
    });

    return deliver(delivery, endpoint);
  },
};

async function deliver(
  delivery: WebhookDelivery,
  endpoint: WebhookEndpoint,
): Promise<WebhookDelivery> {
  const secret = decrypt(
    endpoint.secretCiphertext,
    endpoint.secretIv,
    endpoint.secretTag,
    env.ENCRYPTION_KEY,
  );
  const body = JSON.stringify(delivery.payload);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = signWebhook(secret, timestamp, body);
  const attempts = delivery.attempts + 1;

  try {
    const response = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-SocioConnect-Id": delivery.id,
        "X-SocioConnect-Event": delivery.event,
        "X-SocioConnect-Timestamp": timestamp,
        "X-SocioConnect-Signature": `v1,${signature}`,
      },
      body,
      signal: AbortSignal.timeout(10_000),
    });

    const text = await response.text().catch(() => "");
    const success = response.status >= 200 && response.status < 300;

    return WebhookRepository.updateDelivery(delivery.id, {
      status: success
        ? WebhookDeliveryStatusEnum.SUCCESS
        : WebhookDeliveryStatusEnum.FAILED,
      attempts,
      responseStatus: response.status,
      responseBody: text.slice(0, 2_000) || null,
      error: success ? null : `Endpoint returned ${response.status}`,
      nextRetryAt: success ? null : new Date(Date.now() + 5 * 60 * 1000),
      deliveredAt: success ? new Date() : null,
    });
  } catch (err) {
    return WebhookRepository.updateDelivery(delivery.id, {
      status: WebhookDeliveryStatusEnum.FAILED,
      attempts,
      responseStatus: null,
      responseBody: null,
      error: err instanceof Error ? err.message : "Delivery failed",
      nextRetryAt: new Date(Date.now() + 5 * 60 * 1000),
      deliveredAt: null,
    });
  }
}
