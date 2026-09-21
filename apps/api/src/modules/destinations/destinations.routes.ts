import { createRouter } from "@repo/shared";
import type { AppBindings } from "@/types";
import {
  getAccountDestinationsRoute,
  getAccountDestinationsHandler,
  getAllUserDestinationsRoute,
  getAllUserDestinationsHandler,
} from "./handlers/get-destinations.handler";
import {
  syncDestinationsRoute,
  syncDestinationsHandler,
} from "./handlers/sync-destinations.handler";

export const destinationRoutes = createRouter<AppBindings>();

destinationRoutes.openapi(getAccountDestinationsRoute, getAccountDestinationsHandler);
destinationRoutes.openapi(getAllUserDestinationsRoute, getAllUserDestinationsHandler);
destinationRoutes.openapi(syncDestinationsRoute, syncDestinationsHandler);
