import { createRouter } from "@repo/shared";
import type { AppBindings } from "@/types";
import {
  adaptPostRoute,
  adaptPostHandler,
  telegramWebhookRoute,
  telegramWebhookHandler,
} from "./handlers";

export const botRoutes = createRouter<AppBindings>();

botRoutes.openapi(adaptPostRoute, adaptPostHandler);
botRoutes.openapi(telegramWebhookRoute, telegramWebhookHandler);
