import { index, integer, jsonb, pgEnum, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { enumToPgEnum } from "@repo/shared";
import { postsSchema } from "./index";
import { postsTable } from "./posts.db";
import { connectedAccountsTable, socialPlatformPgEnum } from "../accounts/accounts.db";
import { connectedDestinationsTable } from "../accounts/destinations.db";

export enum DispatchStatusEnum {
  PENDING = "pending",
  PROCESSING = "processing",
  SUCCESS = "success",
  FAILED = "failed",
  RATE_LIMITED = "rate_limited",
  CANCELLED = "cancelled",
}

export const dispatchStatusPgEnum = pgEnum(
  "dispatch_status",
  enumToPgEnum(DispatchStatusEnum),
);

export const postDispatchesTable = postsSchema.table(
  "post_dispatches",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => postsTable.id, { onDelete: "cascade" }),

    accountId: uuid("account_id")
      .notNull()
      .references(() => connectedAccountsTable.id, { onDelete: "cascade" }),

    // Optional: Target specific Subreddit, Discord channel, FB group/page, or Pinterest board
    destinationId: uuid("destination_id")
      .references(() => connectedDestinationsTable.id, { onDelete: "set null" }),

    platform: socialPlatformPgEnum("platform").notNull(),
    status: dispatchStatusPgEnum("status").notNull().default(DispatchStatusEnum.PENDING),

    // Staggered Peak Timing: individual platform dispatch target timestamp
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),

    // AI adapted copy specific to this destination (if adapted)
    customContent: text("custom_content"),
    customTitle: text("custom_title"),

    // Platform-specific options (flairId, isNsfw, boardId, etc.)
    platformOptions: jsonb("platform_options").$type<Record<string, unknown>>().default({}),

    // Published external identifiers
    externalPostId: text("external_post_id"),
    externalPostUrl: text("external_post_url"),

    // Autonomous retry engine
    retryCount: integer("retry_count").notNull().default(0),
    maxRetries: integer("max_retries").notNull().default(3),
    nextRetryAt: timestamp("next_retry_at", { withTimezone: true }),

    // Error diagnostic audit
    errorDetails: jsonb("error_details").$type<{
      message?: string;
      code?: string;
      statusCode?: number;
      timestamp?: string;
    }>(),

    dispatchedAt: timestamp("dispatched_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("dispatches_post_id_idx").on(table.postId),
    index("dispatches_account_id_idx").on(table.accountId),
    index("dispatches_destination_id_idx").on(table.destinationId),
    index("dispatches_status_idx").on(table.status),
    index("dispatches_scheduled_for_idx").on(table.scheduledFor),
    index("dispatches_next_retry_at_idx").on(table.nextRetryAt),
  ],
);

export const postDispatchesRelations = relations(postDispatchesTable, ({ one }) => ({
  post: one(postsTable, {
    fields: [postDispatchesTable.postId],
    references: [postsTable.id],
  }),
  account: one(connectedAccountsTable, {
    fields: [postDispatchesTable.accountId],
    references: [connectedAccountsTable.id],
  }),
  destination: one(connectedDestinationsTable, {
    fields: [postDispatchesTable.destinationId],
    references: [connectedDestinationsTable.id],
  }),
}));

export type PostDispatch = typeof postDispatchesTable.$inferSelect;
export type NewPostDispatch = typeof postDispatchesTable.$inferInsert;
export type UpdatePostDispatch = Partial<NewPostDispatch>;
