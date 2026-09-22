// Export connection utilities
export { db, connectDB, closeDB, initializeDB, type DBTransaction } from "./connection";

// Export schemas
export * from "./schema";

// Export repositories
export { UsersRepository, UsersService } from "./repositories/users.repository";
export { SessionRepository, SessionService } from "./repositories/session.repository";
export { AccountsRepository, AccountsService } from "./repositories/accounts.repository";
export {
  DestinationsRepository,
  DestinationsService,
} from "./repositories/destinations.repository";
export {
  PostsRepository,
  PostsService,
  type CreatePostInput,
} from "./repositories/posts.repository";
export { MediaRepository, MediaService } from "./repositories/media.repository";
export { QuotasRepository, QuotasService } from "./repositories/quotas.repository";
export {
  SubscriptionsRepository,
  SubscriptionsService,
  DEFAULT_PLAN_LIMITS,
} from "./repositories/subscriptions.repository";
export { AnalyticsRepository, AnalyticsService } from "./repositories/analytics.repository";
export {
  NotificationsRepository,
  NotificationsService,
} from "./repositories/notifications.repository";
export { CommunitiesRepository, CommunitiesService } from "./repositories/communities.repository";

// Export metrics utilities
export { withMetrics } from "./utils/metrics-wrapper";
