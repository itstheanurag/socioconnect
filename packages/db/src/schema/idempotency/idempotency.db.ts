import { index, integer, pgSchema, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { workspacesTable } from "@/schema/workspaces/workspaces.db";

export const idempotencySchema = pgSchema("idempotency");

export enum IdempotencyStateEnum {
  PROCESSING = "processing",
  COMPLETED = "completed",
}

export const idempotencyKeysTable = idempotencySchema.table(
  "idempotency_keys",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspacesTable.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    endpoint: text("endpoint").notNull(),
    requestHash: text("request_hash").notNull(),
    state: text("state").notNull().default(IdempotencyStateEnum.PROCESSING),
    responseStatus: integer("response_status"),
    responseBody: text("response_body"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idempotency_keys_workspace_key_endpoint_idx").on(
      table.workspaceId,
      table.key,
      table.endpoint,
    ),
    index("idempotency_keys_expires_at_idx").on(table.expiresAt),
  ],
);

export type IdempotencyKey = typeof idempotencyKeysTable.$inferSelect;
export type NewIdempotencyKey = typeof idempotencyKeysTable.$inferInsert;
export type UpdateIdempotencyKey = Partial<NewIdempotencyKey>;
