import { enumToPgEnum } from "@repo/shared";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgSchema,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { workspacesTable } from "@/schema/workspaces/workspaces.db";
import { apiKeysTable } from "@/schema/api-keys/api-keys.db";
import { postsTable } from "@/schema/posts/posts.db";

export const usageSchema = pgSchema("usage");

export enum UsageSourceEnum {
  WEB = "web",
  API = "api",
  MCP = "mcp",
  CLI = "cli",
  PLUGIN = "plugin",
  SYSTEM = "system",
}

export const usageSourcePgEnum = pgEnum("usage_source", enumToPgEnum(UsageSourceEnum));

export const usageEventsTable = usageSchema.table(
  "usage_events",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspacesTable.id, { onDelete: "cascade" }),
    apiKeyId: uuid("api_key_id").references(() => apiKeysTable.id, {
      onDelete: "set null",
    }),
    source: usageSourcePgEnum("source").notNull(),
    operation: text("operation").notNull(),
    quantity: integer("quantity").notNull().default(1),
    postId: uuid("post_id").references(() => postsTable.id, { onDelete: "set null" }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("usage_events_workspace_id_idx").on(table.workspaceId),
    index("usage_events_api_key_id_idx").on(table.apiKeyId),
    index("usage_events_operation_idx").on(table.operation),
    index("usage_events_created_at_idx").on(table.createdAt),
  ],
);

export type UsageEvent = typeof usageEventsTable.$inferSelect;
export type NewUsageEvent = typeof usageEventsTable.$inferInsert;
export type UpdateUsageEvent = Partial<NewUsageEvent>;
