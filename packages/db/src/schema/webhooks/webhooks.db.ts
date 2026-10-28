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
import { usersTable } from "@/schema/users/users.db";

export const webhooksSchema = pgSchema("webhooks");

export enum WebhookStatusEnum {
  ACTIVE = "active",
  DISABLED = "disabled",
}

export enum WebhookDeliveryStatusEnum {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

export const webhookStatusPgEnum = pgEnum(
  "webhook_status",
  enumToPgEnum(WebhookStatusEnum),
);

export const webhookDeliveryStatusPgEnum = pgEnum(
  "webhook_delivery_status",
  enumToPgEnum(WebhookDeliveryStatusEnum),
);

export const webhookEndpointsTable = webhooksSchema.table(
  "webhook_endpoints",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspacesTable.id, { onDelete: "cascade" }),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    description: text("description"),
    events: text("events").array().notNull().default([]),
    secretCiphertext: text("secret_ciphertext").notNull(),
    secretIv: text("secret_iv").notNull(),
    secretTag: text("secret_tag").notNull(),
    status: webhookStatusPgEnum("status").notNull().default(WebhookStatusEnum.ACTIVE),
    disabledAt: timestamp("disabled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("webhook_endpoints_workspace_id_idx").on(table.workspaceId),
    index("webhook_endpoints_status_idx").on(table.status),
  ],
);

export const webhookDeliveriesTable = webhooksSchema.table(
  "webhook_deliveries",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    endpointId: uuid("endpoint_id")
      .notNull()
      .references(() => webhookEndpointsTable.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspacesTable.id, { onDelete: "cascade" }),
    event: text("event").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    status: webhookDeliveryStatusPgEnum("status")
      .notNull()
      .default(WebhookDeliveryStatusEnum.PENDING),
    attempts: integer("attempts").notNull().default(0),
    responseStatus: integer("response_status"),
    responseBody: text("response_body"),
    error: text("error"),
    nextRetryAt: timestamp("next_retry_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("webhook_deliveries_endpoint_id_idx").on(table.endpointId),
    index("webhook_deliveries_workspace_id_idx").on(table.workspaceId),
    index("webhook_deliveries_status_idx").on(table.status),
    index("webhook_deliveries_next_retry_at_idx").on(table.nextRetryAt),
  ],
);

export type WebhookEndpoint = typeof webhookEndpointsTable.$inferSelect;
export type NewWebhookEndpoint = typeof webhookEndpointsTable.$inferInsert;
export type WebhookDelivery = typeof webhookDeliveriesTable.$inferSelect;
export type NewWebhookDelivery = typeof webhookDeliveriesTable.$inferInsert;
