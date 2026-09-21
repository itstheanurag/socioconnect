import { createRouter } from "@repo/shared";
import type { AppBindings } from "@/types";
import {
  getNotificationsRoute,
  getNotificationsHandler,
  markNotificationReadRoute,
  markNotificationReadHandler,
  markAllNotificationsReadRoute,
  markAllNotificationsReadHandler,
} from "./handlers/get-notifications.handler";

export const notificationRoutes = createRouter<AppBindings>();

notificationRoutes.openapi(getNotificationsRoute, getNotificationsHandler);
notificationRoutes.openapi(markNotificationReadRoute, markNotificationReadHandler);
notificationRoutes.openapi(markAllNotificationsReadRoute, markAllNotificationsReadHandler);
