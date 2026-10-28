import { createRouter } from "@repo/shared";
import type { AppBindings } from "@/types";
import {
  getAccountsRoute,
  getAccountsHandler,
  getOAuthUrlRoute,
  getOAuthUrlHandler,
  postOAuthCallbackRoute,
  postOAuthCallbackHandler,
  deleteAccountRoute,
  deleteAccountHandler,
  healthCheckAccountRoute,
  healthCheckAccountHandler,
} from "./handlers";

export const accountRoutes = createRouter<AppBindings>();

accountRoutes.openapi(getAccountsRoute, getAccountsHandler);
accountRoutes.openapi(getOAuthUrlRoute, getOAuthUrlHandler);
accountRoutes.openapi(postOAuthCallbackRoute, postOAuthCallbackHandler);
accountRoutes.openapi(deleteAccountRoute, deleteAccountHandler);
accountRoutes.openapi(healthCheckAccountRoute, healthCheckAccountHandler);
