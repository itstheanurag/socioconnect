import { boolean, index, jsonb, pgEnum, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { enumToPgEnum } from "@repo/shared";
import { subscriptionsSchema } from "./index";
import { usersTable } from "../users/users.db";
import { invoicesTable } from "./invoices.db";

export enum SubscriptionTierEnum {
  FREE = "free",
  SOLO = "solo",
  CREATOR_PRO = "creator_pro",
  STUDIO = "studio",
  AGENCY = "agency",
}

export enum SubscriptionStatusEnum {
  TRIALING = "trialing",
  ACTIVE = "active",
  PAST_DUE = "past_due",
  CANCELED = "canceled",
  UNPAID = "unpaid",
  PAUSED = "paused",
}

export enum BillingIntervalEnum {
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

export interface SubscriptionLimits {
  maxChannels: number;
  maxMonthlyDrops: number;
  maxAiCredits: number;
  maxCdnStorageBytes: number;
  maxTeamMembers: number;
  hasDedicatedScheduler: boolean;
  hasPrioritySupport: boolean;
  hasCustomBranding: boolean;
}

export interface SubscriptionUsage {
  channelsUsed: number;
  monthlyDropsUsed: number;
  aiCreditsUsed: number;
  cdnStorageUsedBytes: number;
  teamMembersUsed: number;
}

export const subscriptionTierPgEnum = pgEnum(
  "subscription_tier",
  enumToPgEnum(SubscriptionTierEnum),
);

export const subscriptionStatusPgEnum = pgEnum(
  "subscription_status",
  enumToPgEnum(SubscriptionStatusEnum),
);

export const billingIntervalPgEnum = pgEnum(
  "billing_interval",
  enumToPgEnum(BillingIntervalEnum),
);

export const subscriptionsTable = subscriptionsSchema.table(
  "subscriptions",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    tier: subscriptionTierPgEnum("tier").notNull().default(SubscriptionTierEnum.FREE),
    status: subscriptionStatusPgEnum("status").notNull().default(SubscriptionStatusEnum.ACTIVE),
    billingInterval: billingIntervalPgEnum("billing_interval").notNull().default(BillingIntervalEnum.MONTHLY),

    externalCustomerId: text("external_customer_id"),
    externalSubscriptionId: text("external_subscription_id"),

    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }).notNull(),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }).notNull(),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    canceledAt: timestamp("canceled_at", { withTimezone: true }),
    trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),

    limits: jsonb("limits").$type<SubscriptionLimits>().notNull(),
    usage: jsonb("usage").$type<SubscriptionUsage>().notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("subscriptions_user_id_idx").on(table.userId),
    index("subscriptions_status_idx").on(table.status),
    index("subscriptions_tier_idx").on(table.tier),
    index("subscriptions_ext_sub_idx").on(table.externalSubscriptionId),
  ],
);

export const subscriptionsRelations = relations(subscriptionsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [subscriptionsTable.userId],
    references: [usersTable.id],
  }),
  invoices: many(invoicesTable),
}));

export type Subscription = typeof subscriptionsTable.$inferSelect;
export type NewSubscription = typeof subscriptionsTable.$inferInsert;
export type UpdateSubscription = Partial<NewSubscription>;
