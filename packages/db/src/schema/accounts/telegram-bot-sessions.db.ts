import { index, jsonb, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { accountsSchema } from "./index";
import { connectedAccountsTable } from "./accounts.db";

export const telegramBotSessionsTable = accountsSchema.table(
  "telegram_bot_sessions",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => connectedAccountsTable.id, { onDelete: "cascade" }),
    channelUserId: text("channel_user_id").notNull(),
    session: jsonb("session").$type<Record<string, unknown>>().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("telegram_bot_session_user_idx").on(table.accountId, table.channelUserId),
    index("telegram_bot_session_expiry_idx").on(table.expiresAt),
  ],
);
