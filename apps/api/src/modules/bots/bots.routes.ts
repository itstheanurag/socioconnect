import { createRouter } from "@repo/shared";
import type { AppBindings } from "@/types";
import { adaptPostRoute, adaptPostHandler } from "./handlers/adapt-post.handler";

export const botRoutes = createRouter<AppBindings>();

botRoutes.openapi(adaptPostRoute, adaptPostHandler);
