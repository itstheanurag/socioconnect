import { createRoute, z } from "@hono/zod-openapi";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import { NotificationsRepository, NotificationTypeEnum, NotificationPriorityEnum } from "@repo/db";
import { errorResponseSchemas, logger } from "@repo/shared";
import type { AppRouteHandler } from "@/types";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";

// 1. List Notifications
export const getNotificationsRoute = createRoute({
  method: "get",
  middleware: [enforceUserMiddleware],
  path: "/v1/notifications",
  tags: ["Notifications"],
  summary: "List in-app notifications",
  description: "Retrieves notifications, dispatch alerts, quota warnings, and unread counts",
  request: {
    query: z.object({
      unreadOnly: z
        .string()
        .optional()
        .transform((val) => val === "true"),
      limit: z.coerce.number().optional().default(30),
    }),
  },
  responses: {
    200: {
      description: "Notifications retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              notifications: z.array(
                z.object({
                  id: z.string(),
                  type: z.nativeEnum(NotificationTypeEnum),
                  priority: z.nativeEnum(NotificationPriorityEnum),
                  title: z.string(),
                  message: z.string(),
                  linkUrl: z.string().nullable(),
                  isRead: z.boolean(),
                  readAt: z.string().nullable(),
                  createdAt: z.string(),
                }),
              ),
              unreadCount: z.number(),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type GetNotificationsRoute = typeof getNotificationsRoute;

export const getNotificationsHandler: AppRouteHandler<GetNotificationsRoute> = async (c) => {
  const { unreadOnly, limit } = c.req.valid("query");
  const user = c.get("user");

  try {
    const { notifications: rawNotifications, unreadCount } =
      await NotificationsRepository.findAllByUserId(user.id, {
        unreadOnly,
        limit,
      });

    const notifications = rawNotifications.map((n) => ({
      id: n.id,
      type: n.type as NotificationTypeEnum,
      priority: n.priority as NotificationPriorityEnum,
      title: n.title,
      message: n.message,
      linkUrl: n.linkUrl,
      isRead: n.isRead,
      readAt: n.readAt ? n.readAt.toISOString() : null,
      createdAt: n.createdAt.toISOString(),
    }));

    return c.json({
      message: "Notifications retrieved successfully",
      payload: {
        notifications,
        unreadCount,
      },
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error retrieving notifications", {
      module: "notifications",
      action: "getNotificationsHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Internal Server Error" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};

// 2. Mark Single Notification as Read
export const markNotificationReadRoute = createRoute({
  method: "patch",
  middleware: [enforceUserMiddleware],
  path: "/v1/notifications/:id/read",
  tags: ["Notifications"],
  summary: "Mark notification as read",
  description: "Updates read status of a notification",
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Notification marked as read",
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

export type MarkNotificationReadRoute = typeof markNotificationReadRoute;

export const markNotificationReadHandler: AppRouteHandler<MarkNotificationReadRoute> = async (
  c,
) => {
  const { id } = c.req.valid("param");
  const user = c.get("user");

  try {
    await NotificationsRepository.markAsRead(id, user.id);
    return c.json({ message: "Notification marked as read" });
  } catch (err) {
    logger.error("Error marking notification read", {
      module: "notifications",
      action: "markNotificationReadHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json(
        { message: "Failed to update notification" },
        StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR,
      ),
    });
  }
};

// 3. Mark All Notifications as Read
export const markAllNotificationsReadRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/notifications/read-all",
  tags: ["Notifications"],
  summary: "Mark all notifications as read",
  description: "Clears all unread badges across the creator workspace",
  responses: {
    200: {
      description: "All notifications marked as read",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              updatedCount: z.number(),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type MarkAllNotificationsReadRoute = typeof markAllNotificationsReadRoute;

export const markAllNotificationsReadHandler: AppRouteHandler<
  MarkAllNotificationsReadRoute
> = async (c) => {
  const user = c.get("user");

  try {
    const updatedCount = await NotificationsRepository.markAllAsRead(user.id);
    return c.json({
      message: "All notifications marked as read",
      payload: { updatedCount },
    });
  } catch (err) {
    logger.error("Error marking all notifications read", {
      module: "notifications",
      action: "markAllNotificationsReadHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json(
        { message: "Failed to update notifications" },
        StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR,
      ),
    });
  }
};
