import { createRouter } from "@repo/shared";
import type { AppBindings } from "@/types";
import {
  getAnalyticsOverviewRoute,
  getAnalyticsOverviewHandler,
  getAnalyticsTimeseriesRoute,
  getAnalyticsTimeseriesHandler,
} from "./handlers";

export const analyticsRoutes = createRouter<AppBindings>();

analyticsRoutes.openapi(getAnalyticsOverviewRoute, getAnalyticsOverviewHandler);
analyticsRoutes.openapi(getAnalyticsTimeseriesRoute, getAnalyticsTimeseriesHandler);
