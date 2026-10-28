import { createRoute, z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { createRouter, errorResponseSchemas } from "@repo/shared";
import { StatusCodes } from "@repo/config";
import type { AppBindings, AppRouteHandler } from "@/types";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import { recordAuditEvent } from "@/utils/events";
import { resolveWorkspaceId } from "@/utils/workspace";
import { WEBHOOK_EVENTS, WebhookService } from "./webhooks.service";

const endpointSchema = z.object({
  id: z.uuid(),
  url: z.string(),
  description: z.string().nullable(),
  events: z.array(z.string()),
  status: z.string(),
  createdAt: z.string(),
});

export const listWebhooksRoute = createRoute({
  method: "get",
  middleware: [enforceUserMiddleware],
  path: "/v1/webhooks",
  tags: ["Webhooks"],
  summary: "List outbound webhook endpoints",
  responses: {
    200: {
      description: "Webhooks retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({ webhooks: z.array(endpointSchema) }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type ListWebhooksRoute = typeof listWebhooksRoute;

export const listWebhooksHandler: AppRouteHandler<ListWebhooksRoute> = async (c) => {
  const user = c.get("user");
  const workspaceId = await resolveWorkspaceId(user.id, c.var.auth);
  const webhooks = await WebhookService.listEndpoints(workspaceId);

  return c.json({
    message: "Webhooks retrieved successfully",
    payload: { webhooks },
  });
};

export const createWebhookRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/webhooks",
  tags: ["Webhooks"],
  summary: "Create an outbound webhook",
  description:
    "Creates a webhook endpoint and returns its signing secret once. Use the secret to verify X-SocioConnect-Signature.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            url: z.string().url(),
            description: z.string().max(200).optional(),
            events: z.array(z.enum(WEBHOOK_EVENTS)).min(1).optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Webhook created successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              webhook: endpointSchema,
              secret: z.string(),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type CreateWebhookRoute = typeof createWebhookRoute;

export const createWebhookHandler: AppRouteHandler<CreateWebhookRoute> = async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");
  const workspaceId = await resolveWorkspaceId(user.id, c.var.auth);

  try {
    const created = await WebhookService.createEndpoint({
      workspaceId,
      createdByUserId: user.id,
      url: body.url,
      description: body.description,
      events: body.events ?? ["*"],
    });

    await recordAuditEvent(c, {
      action: "webhook.created",
      resourceType: "webhook",
      resourceId: created.endpoint.id,
      metadata: { url: created.endpoint.url, events: created.endpoint.events },
    });

    return c.json(
      {
        message: "Webhook created successfully. Copy the secret now; it is shown once.",
        payload: {
          webhook: created.endpoint,
          secret: created.secret,
        },
      },
      StatusCodes.HTTP_201_CREATED,
    );
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    throw new HTTPException(StatusCodes.HTTP_400_BAD_REQUEST, {
      res: c.json(
        {
          message: err instanceof Error ? err.message : "Invalid webhook",
          code: "INVALID_WEBHOOK",
        },
        StatusCodes.HTTP_400_BAD_REQUEST,
      ),
    });
  }
};

export const deleteWebhookRoute = createRoute({
  method: "delete",
  middleware: [enforceUserMiddleware],
  path: "/v1/webhooks/{id}",
  tags: ["Webhooks"],
  summary: "Delete an outbound webhook",
  request: { params: z.object({ id: z.uuid() }) },
  responses: {
    200: {
      description: "Webhook deleted",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type DeleteWebhookRoute = typeof deleteWebhookRoute;

export const deleteWebhookHandler: AppRouteHandler<DeleteWebhookRoute> = async (c) => {
  const user = c.get("user");
  const { id } = c.req.valid("param");
  const workspaceId = await resolveWorkspaceId(user.id, c.var.auth);
  const deleted = await WebhookService.deleteEndpoint(id, workspaceId);

  if (!deleted) {
    throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
      res: c.json({ message: "Webhook not found" }, StatusCodes.HTTP_404_NOT_FOUND),
    });
  }

  await recordAuditEvent(c, {
    action: "webhook.deleted",
    resourceType: "webhook",
    resourceId: id,
    metadata: { url: deleted.url },
  });

  return c.json({ message: "Webhook deleted successfully" });
};

export const testWebhookRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/webhooks/{id}/test",
  tags: ["Webhooks"],
  summary: "Send a test webhook delivery",
  request: { params: z.object({ id: z.uuid() }) },
  responses: {
    200: {
      description: "Test delivery attempted",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              status: z.string(),
              responseStatus: z.number().nullable(),
              error: z.string().nullable(),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type TestWebhookRoute = typeof testWebhookRoute;

export const testWebhookHandler: AppRouteHandler<TestWebhookRoute> = async (c) => {
  const user = c.get("user");
  const { id } = c.req.valid("param");
  const workspaceId = await resolveWorkspaceId(user.id, c.var.auth);
  const delivery = await WebhookService.testEndpoint(id, workspaceId);

  if (!delivery) {
    throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
      res: c.json({ message: "Webhook not found" }, StatusCodes.HTTP_404_NOT_FOUND),
    });
  }

  return c.json({
    message: "Test delivery attempted",
    payload: {
      status: delivery.status,
      responseStatus: delivery.responseStatus,
      error: delivery.error,
    },
  });
};

export const webhookRoutes = createRouter<AppBindings>();

webhookRoutes.openapi(listWebhooksRoute, listWebhooksHandler);
webhookRoutes.openapi(createWebhookRoute, createWebhookHandler);
webhookRoutes.openapi(deleteWebhookRoute, deleteWebhookHandler);
webhookRoutes.openapi(testWebhookRoute, testWebhookHandler);
