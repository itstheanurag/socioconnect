import { createRouter } from "@repo/shared";
import type { AppBindings } from "@/types";
import { getAllUsersRoute, getAllUsersHandler } from "./handlers";

export const userRoutes = createRouter<AppBindings>();

userRoutes.openapi(getAllUsersRoute, getAllUsersHandler);
