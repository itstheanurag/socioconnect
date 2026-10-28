import { createRoute, z } from "@hono/zod-openapi";
import { createRouter, errorResponseSchemas, logger } from "@repo/shared";
import { AuditActorTypeEnum, AuditRepository, UsageRepository } from "@repo/db";
import type { AppBindings, AppRouteHandler } from "@/types";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import { resolveWorkspaceId } from "@/utils/workspace";

export const getActivityRoute = createRoute({
  method: "get",
  middleware: [enforceUserMiddleware],
  path: "/v1/activity",
  tags: ["Activity"],
  summary: "Get workspace agent activity",
  description:
    "Returns recent audit events and this month's publish/draft usage for the current workspace.",
  request: {
    query: z.object({
      limit: z.coerce.number().int().min(1).max(50).optional().default(20),
    }),
  },
  responses: {
    200: {
      description: "Activity retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              events: z.array(
                z.object({
                  id: z.uuid(),
                  actorType: z.enum(AuditActorTypeEnum),
                  actorId: z.string().nullable(),
                  action: z.string(),
                  resourceType: z.string().nullable(),
                  resourceId: z.string().nullable(),
                  metadata: z.record(z.string(), z.unknown()),
                  createdAt: z.string(),
                }),
              ),
              usage: z.object({
                publishesThisMonth: z.number(),
                draftsThisMonth: z.number(),
                aiCreditsThisMonth: z.number(),
              }),
              generatedAt: z.string(),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type GetActivityRoute = typeof getActivityRoute;

export const getActivityHandler: AppRouteHandler<GetActivityRoute> = async (c) => {
  const user = c.get("user");
  const { limit } = c.req.valid("query");

  try {
    const workspaceId = await resolveWorkspaceId(user.id, c.var.auth);
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const [events, publishesThisMonth, draftsThisMonth, aiCreditsThisMonth] = await Promise.all([
      AuditRepository.listByWorkspace(workspaceId, { limit }),
      UsageRepository.sumQuantity(workspaceId, "publish_operation", monthStart),
      UsageRepository.sumQuantity(workspaceId, "draft_created", monthStart),
      UsageRepository.sumQuantity(workspaceId, "ai_credit", monthStart),
    ]);

    return c.json({
      message: "Activity retrieved successfully",
      payload: {
        events: events.map((event) => ({
          id: event.id,
          actorType: event.actorType as AuditActorTypeEnum,
          actorId: event.actorId,
          action: event.action,
          resourceType: event.resourceType,
          resourceId: event.resourceId,
          metadata: event.metadata ?? {},
          createdAt: event.createdAt.toISOString(),
        })),
        usage: {
          publishesThisMonth,
          draftsThisMonth,
          aiCreditsThisMonth,
        },
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    logger.error("Error retrieving activity", {
      module: "analytics",
      action: "getActivityHandler",
      error: err,
    });
    throw err;
  }
};

export const activityRoutes = createRouter<AppBindings>();

activityRoutes.openapi(getActivityRoute, getActivityHandler);
