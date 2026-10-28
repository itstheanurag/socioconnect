import { and, eq, lt } from "drizzle-orm";
import { type DBTransaction, db } from "@/connection";
import { idempotencyKeysTable, IdempotencyStateEnum, type IdempotencyKey } from "@/schema";

export type IdempotencyBeginResult =
  | { status: "new"; record: IdempotencyKey }
  | { status: "replay"; record: IdempotencyKey }
  | { status: "conflict"; record: IdempotencyKey }
  | { status: "in_progress"; record: IdempotencyKey };

export namespace IdempotencyRepository {
  async function find(
    workspaceId: string,
    key: string,
    endpoint: string,
    options?: { tx?: DBTransaction },
  ): Promise<IdempotencyKey | null> {
    const queryClient = options?.tx || db;
    const record = await queryClient.query.idempotencyKeysTable.findFirst({
      where: and(
        eq(idempotencyKeysTable.workspaceId, workspaceId),
        eq(idempotencyKeysTable.key, key),
        eq(idempotencyKeysTable.endpoint, endpoint),
      ),
    });
    return record ?? null;
  }

  /**
   * Claims an idempotency key for processing, or returns the previous result.
   */
  export async function begin(
    input: {
      workspaceId: string;
      key: string;
      endpoint: string;
      requestHash: string;
      ttlMs: number;
    },
    options?: { tx?: DBTransaction },
  ): Promise<IdempotencyBeginResult> {
    const queryClient = options?.tx || db;
    const now = new Date();

    await queryClient
      .delete(idempotencyKeysTable)
      .where(
        and(
          eq(idempotencyKeysTable.workspaceId, input.workspaceId),
          eq(idempotencyKeysTable.key, input.key),
          eq(idempotencyKeysTable.endpoint, input.endpoint),
          lt(idempotencyKeysTable.expiresAt, now),
        ),
      );

    const [inserted] = await queryClient
      .insert(idempotencyKeysTable)
      .values({
        workspaceId: input.workspaceId,
        key: input.key,
        endpoint: input.endpoint,
        requestHash: input.requestHash,
        expiresAt: new Date(now.getTime() + input.ttlMs),
      })
      .onConflictDoNothing({
        target: [
          idempotencyKeysTable.workspaceId,
          idempotencyKeysTable.key,
          idempotencyKeysTable.endpoint,
        ],
      })
      .returning();

    if (inserted) {
      return { status: "new", record: inserted };
    }

    const existing = await find(input.workspaceId, input.key, input.endpoint, options);
    if (!existing) {
      throw new Error("Unable to claim idempotency key");
    }

    if (existing.requestHash !== input.requestHash) {
      return { status: "conflict", record: existing };
    }

    if (
      existing.state === IdempotencyStateEnum.COMPLETED &&
      existing.responseStatus !== null &&
      existing.responseBody !== null
    ) {
      return { status: "replay", record: existing };
    }

    return { status: "in_progress", record: existing };
  }

  export async function complete(
    id: string,
    responseStatus: number,
    responseBody: string,
    options?: { tx?: DBTransaction },
  ): Promise<void> {
    const queryClient = options?.tx || db;
    await queryClient
      .update(idempotencyKeysTable)
      .set({
        state: IdempotencyStateEnum.COMPLETED,
        responseStatus,
        responseBody,
        updatedAt: new Date(),
      })
      .where(eq(idempotencyKeysTable.id, id));
  }

  /**
   * Removes a claim after a failed request so the client can retry with the same key.
   */
  export async function release(id: string, options?: { tx?: DBTransaction }): Promise<void> {
    const queryClient = options?.tx || db;
    await queryClient.delete(idempotencyKeysTable).where(eq(idempotencyKeysTable.id, id));
  }
}
