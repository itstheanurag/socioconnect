import { integer, pgEnum, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { enumToPgEnum } from "@repo/shared";
import { subscriptionsSchema } from "./index";

export enum BillingWebhookStatusEnum {
  PROCESSING = "processing",
  PROCESSED = "processed",
  FAILED = "failed",
}

export const billingWebhookStatusPgEnum = pgEnum(
  "billing_webhook_status",
  enumToPgEnum(BillingWebhookStatusEnum),
);

/**
 * Idempotency ledger for payment-provider webhooks.
 *
 * Dodo Payments retries failed deliveries and can deliver the same event more
 * than once, so every event is claimed by its `webhook-id` before processing.
 */
export const billingWebhookEventsTable = subscriptionsSchema.table(
  "billing_webhook_events",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    webhookId: text("webhook_id").notNull(),
    eventType: text("event_type").notNull(),
    payloadHash: text("payload_hash").notNull(),
    status: billingWebhookStatusPgEnum("status")
      .notNull()
      .default(BillingWebhookStatusEnum.PROCESSING),
    attempts: integer("attempts").notNull().default(1),
    error: text("error"),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("billing_webhook_events_webhook_id_idx").on(table.webhookId)],
);

export type BillingWebhookEvent = typeof billingWebhookEventsTable.$inferSelect;
export type NewBillingWebhookEvent = typeof billingWebhookEventsTable.$inferInsert;
export type UpdateBillingWebhookEvent = Partial<NewBillingWebhookEvent>;
