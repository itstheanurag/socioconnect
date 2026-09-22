import { createRouter } from "@repo/shared";
import type { AppBindings } from "@/types";
import {
  processDueDispatchesRoute,
  processDueDispatchesHandler,
  retryDispatchRoute,
  retryDispatchHandler,
  getDispatchTransactionsRoute,
  getDispatchTransactionsHandler,
} from "./handlers/process-dispatches.handler";

export const dispatchRoutes = createRouter<AppBindings>();

dispatchRoutes.openapi(processDueDispatchesRoute, processDueDispatchesHandler);
dispatchRoutes.openapi(retryDispatchRoute, retryDispatchHandler);
dispatchRoutes.openapi(getDispatchTransactionsRoute, getDispatchTransactionsHandler);
