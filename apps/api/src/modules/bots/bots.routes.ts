import { createRouter } from "@repo/shared";
import type { AppBindings } from "@/types";
import { adaptPostRoute, adaptPostHandler } from "./handlers/adapt-post.handler";
import { telegramWebhookRoute, telegramWebhookHandler } from "./handlers/telegram-webhook.handler";

export const botRoutes = createRouter<AppBindings>();

botRoutes.openapi(adaptPostRoute, adaptPostHandler);
botRoutes.openapi(telegramWebhookRoute, telegramWebhookHandler);
