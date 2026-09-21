import { createRouter } from "@repo/shared";
import type { AppBindings } from "@/types";
import {
  getCurrentSubscriptionRoute,
  getCurrentSubscriptionHandler,
  getPlansCatalogRoute,
  getPlansCatalogHandler,
} from "./handlers/get-subscription.handler";
import {
  checkoutSubscriptionRoute,
  checkoutSubscriptionHandler,
} from "./handlers/checkout-subscription.handler";
import {
  cancelSubscriptionRoute,
  cancelSubscriptionHandler,
  resumeSubscriptionRoute,
  resumeSubscriptionHandler,
} from "./handlers/manage-subscription.handler";
import { getInvoicesRoute, getInvoicesHandler } from "./handlers/invoices.handler";
import {
  postSubscriptionWebhookRoute,
  postSubscriptionWebhookHandler,
} from "./handlers/webhook.handler";

export const subscriptionRoutes = createRouter<AppBindings>();

subscriptionRoutes.openapi(getCurrentSubscriptionRoute, getCurrentSubscriptionHandler);
subscriptionRoutes.openapi(getPlansCatalogRoute, getPlansCatalogHandler);
subscriptionRoutes.openapi(checkoutSubscriptionRoute, checkoutSubscriptionHandler);
subscriptionRoutes.openapi(cancelSubscriptionRoute, cancelSubscriptionHandler);
subscriptionRoutes.openapi(resumeSubscriptionRoute, resumeSubscriptionHandler);
subscriptionRoutes.openapi(getInvoicesRoute, getInvoicesHandler);
subscriptionRoutes.openapi(postSubscriptionWebhookRoute, postSubscriptionWebhookHandler);
