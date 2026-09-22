import { boolean, index, integer, jsonb, pgEnum, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { enumToPgEnum } from "@repo/shared";
import { communitiesSchema } from "./index";
import { usersTable } from "../users/users.db";
import { connectedAccountsTable, socialPlatformPgEnum } from "../accounts/accounts.db";

export enum AutomationScheduleTypeEnum {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  CUSTOM_CRON = "custom_cron",
  ROTATION_POOL = "rotation_pool",
}

export enum AutomationStatusEnum {
  ACTIVE = "active",
  PAUSED = "paused",
  ARCHIVED = "archived",
}

export const automationScheduleTypePgEnum = pgEnum(
  "automation_schedule_type",
  enumToPgEnum(AutomationScheduleTypeEnum),
);

export const automationStatusPgEnum = pgEnum(
  "automation_status",
  enumToPgEnum(AutomationStatusEnum),
);

// 1. Community Groups Table (Clusters of subreddits, discord channels, pages on a platform)
export const communityGroupsTable = communitiesSchema.table(
  "community_groups",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    accountId: uuid("account_id")
      .notNull()
      .references(() => connectedAccountsTable.id, { onDelete: "cascade" }),

    platform: socialPlatformPgEnum("platform").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    tags: text("tags").array().notNull().default([]),

    // Target destinations within this platform (e.g. 5 subreddit destination IDs or 10 Discord channel destination IDs)
    destinationIds: uuid("destination_ids").array().notNull().default([]),

    // Anti-Spam Safe Dispatch: Stagger minutes between posting to each destination in the cluster
    staggerMinutes: integer("stagger_minutes").notNull().default(5),
    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("community_groups_user_id_idx").on(table.userId),
    index("community_groups_account_id_idx").on(table.accountId),
    index("community_groups_platform_idx").on(table.platform),
  ],
);

// 2. Automated Posting Rules / Syndication Campaigns for Community Groups
export const communityAutomationsTable = communitiesSchema.table(
  "community_automations",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => communityGroupsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    title: text("title").notNull(),
    scheduleType: automationScheduleTypePgEnum("schedule_type")
      .notNull()
      .default(AutomationScheduleTypeEnum.WEEKLY),

    // E.g. Cron expression ("0 14 * * 1") or human-readable schedule specification
    cronSchedule: text("cron_schedule").notNull().default("0 14 * * 1"),
    timezone: text("timezone").notNull().default("UTC"),

    // Content Template with tokens e.g. "Weekly #buildinpublic update: {{content}}"
    contentTemplate: text("content_template").notNull(),
    titleTemplate: text("title_template"),

    // Rotational Content / Topic Ideas Pool
    topicPool: jsonb("topic_pool").$type<string[]>().default([]),
    nextTopicIndex: integer("next_topic_index").notNull().default(0),

    // Auto AI tone adaptation per destination in group
    autoAdaptTone: boolean("auto_adapt_tone").notNull().default(true),

    // Destination-specific overrides (flairs, tags, thread settings)
    platformOptions: jsonb("platform_options").$type<Record<string, unknown>>().default({}),

    status: automationStatusPgEnum("status").notNull().default(AutomationStatusEnum.ACTIVE),
    lastRunAt: timestamp("last_run_at", { withTimezone: true }),
    nextRunAt: timestamp("next_run_at", { withTimezone: true }),
    totalRuns: integer("total_runs").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("community_automations_group_id_idx").on(table.groupId),
    index("community_automations_user_id_idx").on(table.userId),
    index("community_automations_status_idx").on(table.status),
    index("community_automations_next_run_at_idx").on(table.nextRunAt),
  ],
);

// Relations
export const communityGroupsRelations = relations(
  communityGroupsTable,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [communityGroupsTable.userId],
      references: [usersTable.id],
    }),
    account: one(connectedAccountsTable, {
      fields: [communityGroupsTable.accountId],
      references: [connectedAccountsTable.id],
    }),
    automations: many(communityAutomationsTable),
  }),
);

export const communityAutomationsRelations = relations(
  communityAutomationsTable,
  ({ one }) => ({
    group: one(communityGroupsTable, {
      fields: [communityAutomationsTable.groupId],
      references: [communityGroupsTable.id],
    }),
    user: one(usersTable, {
      fields: [communityAutomationsTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export type CommunityGroup = typeof communityGroupsTable.$inferSelect;
export type NewCommunityGroup = typeof communityGroupsTable.$inferInsert;
export type UpdateCommunityGroup = Partial<NewCommunityGroup>;

export type CommunityAutomation = typeof communityAutomationsTable.$inferSelect;
export type NewCommunityAutomation = typeof communityAutomationsTable.$inferInsert;
export type UpdateCommunityAutomation = Partial<NewCommunityAutomation>;
