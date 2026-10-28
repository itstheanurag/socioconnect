import { enumToPgEnum } from "@repo/shared";
import { index, jsonb, pgEnum, pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { workspacesTable } from "@/schema/workspaces/workspaces.db";

export const auditSchema = pgSchema("audit");

export enum AuditActorTypeEnum {
  USER = "user",
  API_KEY = "api_key",
  SYSTEM = "system",
}

export const auditActorTypePgEnum = pgEnum("audit_actor_type", enumToPgEnum(AuditActorTypeEnum));

export const auditEventsTable = auditSchema.table(
  "audit_events",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspacesTable.id, { onDelete: "cascade" }),
    actorType: auditActorTypePgEnum("actor_type").notNull(),
    actorId: text("actor_id"),
    action: text("action").notNull(),
    resourceType: text("resource_type"),
    resourceId: text("resource_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    ip: text("ip"),
    userAgent: text("user_agent"),
    requestId: text("request_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("audit_events_workspace_id_idx").on(table.workspaceId),
    index("audit_events_action_idx").on(table.action),
    index("audit_events_resource_idx").on(table.resourceType, table.resourceId),
    index("audit_events_created_at_idx").on(table.createdAt),
  ],
);

export type AuditEvent = typeof auditEventsTable.$inferSelect;
export type NewAuditEvent = typeof auditEventsTable.$inferInsert;
export type UpdateAuditEvent = Partial<NewAuditEvent>;
