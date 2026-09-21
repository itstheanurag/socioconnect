import { bigint, index, integer, pgEnum, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { enumToPgEnum } from "@repo/shared";
import { quotasSchema } from "./index";
import { usersTable } from "../users/users.db";

export enum PlanTierEnum {
  SOLO = "solo",
  CREATOR_PRO = "creator_pro",
  STUDIO = "studio",
}

export const planTierPgEnum = pgEnum(
  "plan_tier",
  enumToPgEnum(PlanTierEnum),
);

export const userQuotasTable = quotasSchema.table(
  "user_quotas",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    tier: planTierPgEnum("tier").notNull().default(PlanTierEnum.SOLO),

    maxChannels: integer("max_channels").notNull().default(3),
    maxMonthlyDrops: integer("max_monthly_drops").notNull().default(30),
    monthlyDropsUsed: integer("monthly_drops_used").notNull().default(0),

    maxAiAdaptations: integer("max_ai_adaptations").notNull().default(25),
    aiAdaptationsUsed: integer("ai_adaptations_used").notNull().default(0),

    maxCdnStorageBytes: bigint("max_cdn_storage_bytes", { mode: "number" }).notNull().default(5000000000), // 5 GB
    cdnStorageUsedBytes: bigint("cdn_storage_used_bytes", { mode: "number" }).notNull().default(0),

    cycleResetsAt: timestamp("cycle_resets_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_quotas_user_id_idx").on(table.userId),
    index("user_quotas_tier_idx").on(table.tier),
  ],
);

export const userQuotasRelations = relations(userQuotasTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userQuotasTable.userId],
    references: [usersTable.id],
  }),
}));

export type UserQuota = typeof userQuotasTable.$inferSelect;
export type NewUserQuota = typeof userQuotasTable.$inferInsert;
export type UpdateUserQuota = Partial<NewUserQuota>;
