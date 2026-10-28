import { createRouter } from "@repo/shared";
import type { AppBindings } from "@/types";
import {
  getCurrentSubscriptionRoute,
  getCurrentSubscriptionHandler,
  getPlansCatalogRoute,
  getPlansCatalogHandler,
  checkoutSubscriptionRoute,
  checkoutSubscriptionHandler,
  cancelSubscriptionRoute,
  cancelSubscriptionHandler,
  resumeSubscriptionRoute,
  resumeSubscriptionHandler,
  getInvoicesRoute,
  getInvoicesHandler,
  createPortalSessionRoute,
  createPortalSessionHandler,
  postSubscriptionWebhookRoute,
  postSubscriptionWebhookHandler,
} from "./handlers";

export const subscriptionRoutes = createRouter<AppBindings>();

subscriptionRoutes.openapi(getCurrentSubscriptionRoute, getCurrentSubscriptionHandler);
subscriptionRoutes.openapi(getPlansCatalogRoute, getPlansCatalogHandler);
subscriptionRoutes.openapi(checkoutSubscriptionRoute, checkoutSubscriptionHandler);
subscriptionRoutes.openapi(cancelSubscriptionRoute, cancelSubscriptionHandler);
subscriptionRoutes.openapi(resumeSubscriptionRoute, resumeSubscriptionHandler);
subscriptionRoutes.openapi(getInvoicesRoute, getInvoicesHandler);
subscriptionRoutes.openapi(createPortalSessionRoute, createPortalSessionHandler);
subscriptionRoutes.openapi(postSubscriptionWebhookRoute, postSubscriptionWebhookHandler);
