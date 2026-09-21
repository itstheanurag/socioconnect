import { boolean, index, jsonb, pgEnum, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { enumToPgEnum } from "@repo/shared";
import { notificationsSchema } from "./index";
import { usersTable } from "../users/users.db";

export enum NotificationTypeEnum {
  DISPATCH_SUCCESS = "dispatch_success",
  DISPATCH_FAILED = "dispatch_failed",
  TOKEN_EXPIRING = "token_expiring",
  QUOTA_WARNING = "quota_warning",
  MILESTONE = "milestone",
  SYSTEM = "system",
}

export enum NotificationPriorityEnum {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
}

export const notificationTypePgEnum = pgEnum(
  "notification_type",
  enumToPgEnum(NotificationTypeEnum),
);

export const notificationPriorityPgEnum = pgEnum(
  "notification_priority",
  enumToPgEnum(NotificationPriorityEnum),
);

export const notificationsTable = notificationsSchema.table(
  "notifications",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    type: notificationTypePgEnum("type").notNull().default(NotificationTypeEnum.SYSTEM),
    priority: notificationPriorityPgEnum("priority")
      .notNull()
      .default(NotificationPriorityEnum.NORMAL),

    title: text("title").notNull(),
    message: text("message").notNull(),
    linkUrl: text("link_url"),

    isRead: boolean("is_read").notNull().default(false),
    readAt: timestamp("read_at", { withTimezone: true }),

    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_user_unread_idx").on(table.userId, table.isRead),
    index("notifications_created_at_idx").on(table.createdAt),
  ],
);

export const notificationsRelations = relations(notificationsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [notificationsTable.userId],
    references: [usersTable.id],
  }),
}));

export type Notification = typeof notificationsTable.$inferSelect;
export type NewNotification = typeof notificationsTable.$inferInsert;
export type UpdateNotification = Partial<NewNotification>;
