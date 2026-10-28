import { relations } from "drizzle-orm";
import { index, pgSchema, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "@/schema/users/users.db";
import { workspacesTable } from "@/schema/workspaces/workspaces.db";

export const apiKeysSchema = pgSchema("api_keys");

export const apiKeysTable = apiKeysSchema.table(
  "api_keys",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspacesTable.id, { onDelete: "cascade" }),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    prefix: text("prefix").notNull(),
    keyHash: text("key_hash").notNull(),
    scopes: text("scopes").array().notNull().default([]),
    accountIds: uuid("account_ids").array().notNull().default([]),
    environment: text("environment").notNull().default("live"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("api_keys_prefix_idx").on(table.prefix),
    index("api_keys_workspace_id_idx").on(table.workspaceId),
    index("api_keys_created_by_user_id_idx").on(table.createdByUserId),
  ],
);

export const apiKeysRelations = relations(apiKeysTable, ({ one }) => ({
  workspace: one(workspacesTable, {
    fields: [apiKeysTable.workspaceId],
    references: [workspacesTable.id],
  }),
  createdBy: one(usersTable, {
    fields: [apiKeysTable.createdByUserId],
    references: [usersTable.id],
  }),
}));

export type ApiKey = typeof apiKeysTable.$inferSelect;
export type NewApiKey = typeof apiKeysTable.$inferInsert;
export type UpdateApiKey = Partial<NewApiKey>;
