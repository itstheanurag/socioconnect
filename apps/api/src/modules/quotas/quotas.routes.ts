import { createRouter } from "@repo/shared";
import type { AppBindings } from "@/types";
import { getQuotasSummaryRoute, getQuotasSummaryHandler } from "./handlers/get-quotas.handler";

export const quotaRoutes = createRouter<AppBindings>();

quotaRoutes.openapi(getQuotasSummaryRoute, getQuotasSummaryHandler);
