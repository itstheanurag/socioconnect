import { index, integer, jsonb, pgEnum, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { enumToPgEnum } from "@repo/shared";
import { postsSchema } from "./index";
import { postsTable } from "./posts.db";
import { postDispatchesTable } from "./post-dispatches.db";
import { connectedAccountsTable, socialPlatformPgEnum } from "../accounts/accounts.db";

export enum TransactionOutcomeEnum {
  SUCCESS = "success",
  RETRYABLE_FAILURE = "retryable_failure",
  PERMANENT_FAILURE = "permanent_failure",
  RATE_LIMITED = "rate_limited",
  TIMEOUT = "timeout",
}

export const transactionOutcomePgEnum = pgEnum(
  "transaction_outcome",
  enumToPgEnum(TransactionOutcomeEnum),
);

export const dispatchTransactionsTable = postsSchema.table(
  "dispatch_transactions",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    dispatchId: uuid("dispatch_id")
      .notNull()
      .references(() => postDispatchesTable.id, { onDelete: "cascade" }),
    postId: uuid("post_id")
      .notNull()
      .references(() => postsTable.id, { onDelete: "cascade" }),
    accountId: uuid("account_id")
      .notNull()
      .references(() => connectedAccountsTable.id, { onDelete: "cascade" }),

    platform: socialPlatformPgEnum("platform").notNull(),
    attemptNumber: integer("attempt_number").notNull(),
    outcome: transactionOutcomePgEnum("outcome").notNull(),

    httpStatusCode: integer("http_status_code"),
    externalPostId: text("external_post_id"),
    externalPostUrl: text("external_post_url"),

    requestPayload: jsonb("request_payload").$type<Record<string, unknown>>(),
    responsePayload: jsonb("response_payload").$type<Record<string, unknown>>(),

    errorCode: text("error_code"),
    errorMessage: text("error_message"),
    errorStack: text("error_stack"),

    latencyMs: integer("latency_ms").notNull().default(0),
    nextRetryAt: timestamp("next_retry_at", { withTimezone: true }),

    executedAt: timestamp("executed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("dispatch_tx_dispatch_id_idx").on(table.dispatchId),
    index("dispatch_tx_post_id_idx").on(table.postId),
    index("dispatch_tx_platform_idx").on(table.platform),
    index("dispatch_tx_outcome_idx").on(table.outcome),
    index("dispatch_tx_executed_at_idx").on(table.executedAt),
  ],
);

export const dispatchTransactionsRelations = relations(dispatchTransactionsTable, ({ one }) => ({
  dispatch: one(postDispatchesTable, {
    fields: [dispatchTransactionsTable.dispatchId],
    references: [postDispatchesTable.id],
  }),
  post: one(postsTable, {
    fields: [dispatchTransactionsTable.postId],
    references: [postsTable.id],
  }),
  account: one(connectedAccountsTable, {
    fields: [dispatchTransactionsTable.accountId],
    references: [connectedAccountsTable.id],
  }),
}));

export type DispatchTransaction = typeof dispatchTransactionsTable.$inferSelect;
export type NewDispatchTransaction = typeof dispatchTransactionsTable.$inferInsert;
