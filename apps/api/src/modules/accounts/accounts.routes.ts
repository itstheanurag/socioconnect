import { createRouter } from "@repo/shared";
import type { AppBindings } from "@/types";
import { getAccountsRoute, getAccountsHandler } from "./handlers/get-accounts.handler";
import {
  getOAuthUrlRoute,
  getOAuthUrlHandler,
  postOAuthCallbackRoute,
  postOAuthCallbackHandler,
} from "./handlers/oauth-connect.handler";
import { deleteAccountRoute, deleteAccountHandler } from "./handlers/delete-account.handler";
import { healthCheckAccountRoute, healthCheckAccountHandler } from "./handlers/health-check.handler";

export const accountRoutes = createRouter<AppBindings>();

accountRoutes.openapi(getAccountsRoute, getAccountsHandler);
accountRoutes.openapi(getOAuthUrlRoute, getOAuthUrlHandler);
accountRoutes.openapi(postOAuthCallbackRoute, postOAuthCallbackHandler);
accountRoutes.openapi(deleteAccountRoute, deleteAccountHandler);
accountRoutes.openapi(healthCheckAccountRoute, healthCheckAccountHandler);
