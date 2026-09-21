// Users Schema
export { usersSchema } from "./users";
export { type NewUser, usersTable, type UpdateUser, type User, UserRole } from "./users/users.db";
export {
  type SessionMetadata,
  type Session,
  type NewSession,
  type UpdateSession,
  SessionProvider,
  SessionStatus,
  sessionProviderEnum,
  sessionStatusEnum,
  sessionsRelations,
  sessionsTable,
} from "./users/sessions.db";

// Accounts & Destinations Schema
export { accountsSchema } from "./accounts";
export {
  connectedAccountsTable,
  connectedAccountsRelations,
  SocialPlatformEnum,
  ConnectedAccountStatus,
  socialPlatformPgEnum,
  accountStatusPgEnum,
  type ConnectedAccount,
  type NewConnectedAccount,
  type UpdateConnectedAccount,
} from "./accounts/accounts.db";
export {
  connectedDestinationsTable,
  connectedDestinationsRelations,
  DestinationTypeEnum,
  destinationTypePgEnum,
  type DestinationRequirementsData,
  type ConnectedDestination,
  type NewConnectedDestination,
  type UpdateConnectedDestination,
} from "./accounts/destinations.db";

// Posts & Dispatches Schema
export { postsSchema } from "./posts";
export {
  postsTable,
  postsRelations,
  PostStatusEnum,
  TimingStrategyEnum,
  postStatusPgEnum,
  timingStrategyPgEnum,
  type Post,
  type NewPost,
  type UpdatePost,
} from "./posts/posts.db";
export {
  postDispatchesTable,
  postDispatchesRelations,
  DispatchStatusEnum,
  dispatchStatusPgEnum,
  type PostDispatch,
  type NewPostDispatch,
  type UpdatePostDispatch,
} from "./posts/post-dispatches.db";

// Media Assets Schema
export { mediaSchema } from "./media";
export {
  mediaAssetsTable,
  mediaAssetsRelations,
  MediaTypeEnum,
  mediaTypePgEnum,
  type MediaAsset,
  type NewMediaAsset,
  type UpdateMediaAsset,
} from "./media/media.db";

// Quotas & Billing Schema
export { quotasSchema } from "./quotas";
export {
  userQuotasTable,
  userQuotasRelations,
  PlanTierEnum,
  planTierPgEnum,
  type UserQuota,
  type NewUserQuota,
  type UpdateUserQuota,
} from "./quotas/quotas.db";

// Subscriptions & Invoices Schema
export { subscriptionsSchema } from "./subscriptions";
export {
  subscriptionsTable,
  subscriptionsRelations,
  SubscriptionTierEnum,
  SubscriptionStatusEnum,
  BillingIntervalEnum,
  subscriptionTierPgEnum,
  subscriptionStatusPgEnum,
  billingIntervalPgEnum,
  type Subscription,
  type NewSubscription,
  type UpdateSubscription,
  type SubscriptionLimits,
  type SubscriptionUsage,
} from "./subscriptions/subscriptions.db";
export {
  invoicesTable,
  invoicesRelations,
  InvoiceStatusEnum,
  invoiceStatusPgEnum,
  type Invoice,
  type NewInvoice,
  type UpdateInvoice,
} from "./subscriptions/invoices.db";

// Analytics Schema
export { analyticsSchema } from "./analytics";
export {
  postAnalyticsTable,
  postAnalyticsRelations,
  accountAnalyticsDailyTable,
  accountAnalyticsDailyRelations,
  type PostAnalytics,
  type NewPostAnalytics,
  type AccountAnalyticsDaily,
  type NewAccountAnalyticsDaily,
} from "./analytics/analytics.db";

// Notifications Schema
export { notificationsSchema } from "./notifications";
export {
  notificationsTable,
  notificationsRelations,
  NotificationTypeEnum,
  NotificationPriorityEnum,
  notificationTypePgEnum,
  notificationPriorityPgEnum,
  type Notification,
  type NewNotification,
  type UpdateNotification,
} from "./notifications/notifications.db";
