import { index, jsonb, pgEnum, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { enumToPgEnum } from "@repo/shared";
import { postsSchema } from "./index";
import { usersTable } from "../users/users.db";
import { postDispatchesTable } from "./post-dispatches.db";

export enum PostStatusEnum {
  DRAFT = "draft",
  SCHEDULED = "scheduled",
  DISPATCHING = "dispatching",
  PUBLISHED = "published",
  PARTIALLY_FAILED = "partially_failed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export enum TimingStrategyEnum {
  SIMULTANEOUS = "simultaneous",
  PEAK_HOURS = "peak_hours",
}

export const postStatusPgEnum = pgEnum("post_status", enumToPgEnum(PostStatusEnum));

export const timingStrategyPgEnum = pgEnum("timing_strategy", enumToPgEnum(TimingStrategyEnum));

export const postsTable = postsSchema.table(
  "posts",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    title: text("title"),
    content: text("content").notNull(),
    tags: text("tags").array().notNull().default([]),
    linkUrl: text("link_url"),
    mediaIds: uuid("media_ids").array().notNull().default([]),

    status: postStatusPgEnum("status").notNull().default(PostStatusEnum.DRAFT),
    timingStrategy: timingStrategyPgEnum("timing_strategy")
      .notNull()
      .default(TimingStrategyEnum.SIMULTANEOUS),

    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),

    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("posts_user_id_idx").on(table.userId),
    index("posts_status_idx").on(table.status),
    index("posts_scheduled_at_idx").on(table.scheduledAt),
    index("posts_created_at_idx").on(table.createdAt),
  ],
);

export const postsRelations = relations(postsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [postsTable.userId],
    references: [usersTable.id],
  }),
  dispatches: many(postDispatchesTable),
}));

export type Post = typeof postsTable.$inferSelect;
export type NewPost = typeof postsTable.$inferInsert;
export type UpdatePost = Partial<NewPost>;
