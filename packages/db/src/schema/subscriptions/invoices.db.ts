import { index, integer, pgEnum, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { enumToPgEnum } from "@repo/shared";
import { subscriptionsSchema } from "./index";
import { usersTable } from "../users/users.db";
import { subscriptionsTable } from "./subscriptions.db";

export enum InvoiceStatusEnum {
  DRAFT = "draft",
  OPEN = "open",
  PAID = "paid",
  VOID = "void",
  UNCOLLECTIBLE = "uncollectible",
}

export const invoiceStatusPgEnum = pgEnum(
  "invoice_status",
  enumToPgEnum(InvoiceStatusEnum),
);

export const invoicesTable = subscriptionsSchema.table(
  "invoices",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    subscriptionId: uuid("subscription_id")
      .notNull()
      .references(() => subscriptionsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    externalInvoiceId: text("external_invoice_id"),
    invoiceNumber: text("invoice_number").notNull(),
    amountDue: integer("amount_due").notNull(), // Amount in cents
    amountPaid: integer("amount_paid").notNull().default(0), // Amount in cents
    currency: text("currency").notNull().default("usd"),
    status: invoiceStatusPgEnum("status").notNull().default(InvoiceStatusEnum.OPEN),

    hostedInvoiceUrl: text("hosted_invoice_url"),
    invoicePdfUrl: text("invoice_pdf_url"),

    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("invoices_user_id_idx").on(table.userId),
    index("invoices_subscription_id_idx").on(table.subscriptionId),
    index("invoices_status_idx").on(table.status),
  ],
);

export const invoicesRelations = relations(invoicesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [invoicesTable.userId],
    references: [usersTable.id],
  }),
  subscription: one(subscriptionsTable, {
    fields: [invoicesTable.subscriptionId],
    references: [subscriptionsTable.id],
  }),
}));

export type Invoice = typeof invoicesTable.$inferSelect;
export type NewInvoice = typeof invoicesTable.$inferInsert;
export type UpdateInvoice = Partial<NewInvoice>;
