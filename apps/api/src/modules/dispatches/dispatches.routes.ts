import { createRouter } from "@repo/shared";
import type { AppBindings } from "@/types";
import {
  processDueDispatchesRoute,
  processDueDispatchesHandler,
  retryDispatchRoute,
  retryDispatchHandler,
} from "./handlers/process-dispatches.handler";

export const dispatchRoutes = createRouter<AppBindings>();

dispatchRoutes.openapi(processDueDispatchesRoute, processDueDispatchesHandler);
dispatchRoutes.openapi(retryDispatchRoute, retryDispatchHandler);
