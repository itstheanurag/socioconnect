import {
  bigint,
  index,
  integer,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { analyticsSchema } from "./index";
import { usersTable } from "../users/users.db";
import { postsTable } from "../posts/posts.db";
import { postDispatchesTable } from "../posts/post-dispatches.db";
import {
  connectedAccountsTable,
  socialPlatformPgEnum,
  SocialPlatformEnum,
} from "../accounts/accounts.db";

export const postAnalyticsTable = analyticsSchema.table(
  "post_analytics",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => postsTable.id, { onDelete: "cascade" }),
    dispatchId: uuid("dispatch_id").references(() => postDispatchesTable.id, {
      onDelete: "cascade",
    }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    platform: socialPlatformPgEnum("platform").notNull(),
    views: bigint("views", { mode: "number" }).notNull().default(0),
    likes: integer("likes").notNull().default(0),
    comments: integer("comments").notNull().default(0),
    shares: integer("shares").notNull().default(0),
    clicks: integer("clicks").notNull().default(0),
    engagementRate: real("engagement_rate").notNull().default(0),

    recordedAt: timestamp("recorded_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("post_analytics_user_id_idx").on(table.userId),
    index("post_analytics_post_id_idx").on(table.postId),
    index("post_analytics_platform_idx").on(table.platform),
  ],
);

export const postAnalyticsRelations = relations(postAnalyticsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [postAnalyticsTable.userId],
    references: [usersTable.id],
  }),
  post: one(postsTable, {
    fields: [postAnalyticsTable.postId],
    references: [postsTable.id],
  }),
  dispatch: one(postDispatchesTable, {
    fields: [postAnalyticsTable.dispatchId],
    references: [postDispatchesTable.id],
  }),
}));

export const accountAnalyticsDailyTable = analyticsSchema.table(
  "account_analytics_daily",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => connectedAccountsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    platform: socialPlatformPgEnum("platform").notNull(),
    date: text("date").notNull(), // Format: YYYY-MM-DD

    followersTotal: integer("followers_total").notNull().default(0),
    followersGained: integer("followers_gained").notNull().default(0),
    impressionsTotal: bigint("impressions_total", { mode: "number" }).notNull().default(0),
    engagementsTotal: integer("engagements_total").notNull().default(0),
    postsPublished: integer("posts_published").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("account_analytics_acc_date_idx").on(table.accountId, table.date),
    index("account_analytics_user_id_idx").on(table.userId),
    index("account_analytics_date_idx").on(table.date),
  ],
);

export const accountAnalyticsDailyRelations = relations(accountAnalyticsDailyTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [accountAnalyticsDailyTable.userId],
    references: [usersTable.id],
  }),
  account: one(connectedAccountsTable, {
    fields: [accountAnalyticsDailyTable.accountId],
    references: [connectedAccountsTable.id],
  }),
}));

export type PostAnalytics = typeof postAnalyticsTable.$inferSelect;
export type NewPostAnalytics = typeof postAnalyticsTable.$inferInsert;
export type AccountAnalyticsDaily = typeof accountAnalyticsDailyTable.$inferSelect;
export type NewAccountAnalyticsDaily = typeof accountAnalyticsDailyTable.$inferInsert;
