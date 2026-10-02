import { and, eq, gt } from "drizzle-orm";
import { type DBTransaction, db } from "@/connection";
import { telegramBotSessionsTable } from "@/schema/accounts/telegram-bot-sessions.db";

export namespace TelegramBotSessionsRepository {
  export async function find(accountId: string, channelUserId: string, now = new Date()) {
    const row = await db.query.telegramBotSessionsTable.findFirst({
      where: and(
        eq(telegramBotSessionsTable.accountId, accountId),
        eq(telegramBotSessionsTable.channelUserId, channelUserId),
        gt(telegramBotSessionsTable.expiresAt, now),
      ),
    });
    return row?.session;
  }

  export async function save(
    accountId: string,
    channelUserId: string,
    session: Record<string, unknown>,
    expiresAt: Date,
    options?: { tx?: DBTransaction },
  ) {
    const queryClient = options?.tx || db;
    await queryClient
      .insert(telegramBotSessionsTable)
      .values({ accountId, channelUserId, session, expiresAt })
      .onConflictDoUpdate({
        target: [telegramBotSessionsTable.accountId, telegramBotSessionsTable.channelUserId],
        set: { session, expiresAt, updatedAt: new Date() },
      });
  }

  export async function remove(accountId: string, channelUserId: string, options?: { tx?: DBTransaction }) {
    const queryClient = options?.tx || db;
    await queryClient
      .delete(telegramBotSessionsTable)
      .where(
        and(
          eq(telegramBotSessionsTable.accountId, accountId),
          eq(telegramBotSessionsTable.channelUserId, channelUserId),
        ),
      );
  }
}
