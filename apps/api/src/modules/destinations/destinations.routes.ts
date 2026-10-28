import { createRouter } from "@repo/shared";
import type { AppBindings } from "@/types";
import {
  getAccountDestinationsRoute,
  getAccountDestinationsHandler,
  getAllUserDestinationsRoute,
  getAllUserDestinationsHandler,
  syncDestinationsRoute,
  syncDestinationsHandler,
} from "./handlers";

export const destinationRoutes = createRouter<AppBindings>();

destinationRoutes.openapi(getAccountDestinationsRoute, getAccountDestinationsHandler);
destinationRoutes.openapi(getAllUserDestinationsRoute, getAllUserDestinationsHandler);
destinationRoutes.openapi(syncDestinationsRoute, syncDestinationsHandler);
