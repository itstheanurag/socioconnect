import { and, desc, eq, isNull } from "drizzle-orm";
import { type DBTransaction, db } from "@/connection";
import { apiKeysTable, type ApiKey, type NewApiKey } from "@/schema";
import { logger } from "@repo/shared";

export namespace ApiKeysRepository {
  export async function create(
    payload: NewApiKey,
    options?: { tx?: DBTransaction },
  ): Promise<ApiKey> {
    const queryClient = options?.tx || db;
    const [created] = await queryClient.insert(apiKeysTable).values(payload).returning();

    logger.audit("api key created", {
      module: "api-keys",
      action: "repository:create",
      apiKeyId: created.id,
      workspaceId: created.workspaceId,
      createdByUserId: created.createdByUserId,
      scopes: created.scopes,
    });

    return created;
  }

  export async function findByPrefix(
    prefix: string,
    options?: { tx?: DBTransaction },
  ): Promise<ApiKey | null> {
    const queryClient = options?.tx || db;
    const key = await queryClient.query.apiKeysTable.findFirst({
      where: and(eq(apiKeysTable.prefix, prefix), isNull(apiKeysTable.revokedAt)),
    });
    return key ?? null;
  }

  export async function findById(
    id: string,
    options?: { tx?: DBTransaction },
  ): Promise<ApiKey | null> {
    const queryClient = options?.tx || db;
    const key = await queryClient.query.apiKeysTable.findFirst({
      where: and(eq(apiKeysTable.id, id), isNull(apiKeysTable.revokedAt)),
    });
    return key ?? null;
  }

  export async function listByWorkspace(
    workspaceId: string,
    options?: { tx?: DBTransaction },
  ): Promise<ApiKey[]> {
    const queryClient = options?.tx || db;
    return queryClient.query.apiKeysTable.findMany({
      where: and(eq(apiKeysTable.workspaceId, workspaceId), isNull(apiKeysTable.revokedAt)),
      orderBy: [desc(apiKeysTable.createdAt)],
    });
  }

  export async function revoke(
    id: string,
    workspaceId: string,
    options?: { tx?: DBTransaction },
  ): Promise<ApiKey | null> {
    const queryClient = options?.tx || db;
    const [revoked] = await queryClient
      .update(apiKeysTable)
      .set({ revokedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(apiKeysTable.id, id), eq(apiKeysTable.workspaceId, workspaceId)))
      .returning();

    if (revoked) {
      logger.audit("api key revoked", {
        module: "api-keys",
        action: "repository:revoke",
        apiKeyId: revoked.id,
        workspaceId,
      });
    }

    return revoked ?? null;
  }

  export async function touchLastUsed(id: string, options?: { tx?: DBTransaction }): Promise<void> {
    const queryClient = options?.tx || db;
    await queryClient
      .update(apiKeysTable)
      .set({ lastUsedAt: new Date(), updatedAt: new Date() })
      .where(eq(apiKeysTable.id, id));
  }
}
