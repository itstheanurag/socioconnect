import { and, eq, isNull } from "drizzle-orm";
import { type DBTransaction, db } from "../connection";
import {
  connectedAccountsTable,
  type ConnectedAccount,
  type NewConnectedAccount,
  ConnectedAccountStatus,
} from "../schema";
import { withMetrics } from "../utils/metrics-wrapper";
import { logger } from "@repo/shared";

export namespace AccountsRepository {
  /**
   * Creates a new connected social account
   */
  export async function create(
    payload: NewConnectedAccount,
    options?: { tx?: DBTransaction },
  ): Promise<ConnectedAccount> {
    const queryClient = options?.tx || db;
    try {
      const result = await withMetrics("insert", "connected_accounts", async () =>
        queryClient.insert(connectedAccountsTable).values(payload).returning(),
      );
      const [account] = result;

      logger.audit("social account connected", {
        module: "accounts",
        action: "repository:create",
        platform: payload.platform,
        userId: payload.userId,
      });

      return account;
    } catch (err) {
      logger.error("error connecting social account", {
        module: "accounts",
        action: "repository:create",
        error: err,
      });
      throw err;
    }
  }

  /**
   * Upserts a connected social account (handles reconnects and token updates)
   */
  export async function upsert(
    payload: NewConnectedAccount,
    options?: { tx?: DBTransaction },
  ): Promise<ConnectedAccount> {
    const queryClient = options?.tx || db;
    try {
      const existing = await queryClient.query.connectedAccountsTable.findFirst({
        where: and(
          eq(connectedAccountsTable.userId, payload.userId),
          eq(connectedAccountsTable.platform, payload.platform),
          eq(connectedAccountsTable.platformAccountId, payload.platformAccountId),
        ),
      });

      if (existing) {
        const [updated] = await queryClient
          .update(connectedAccountsTable)
          .set({
            username: payload.username,
            displayName: payload.displayName,
            avatarUrl: payload.avatarUrl,
            profileUrl: payload.profileUrl,
            status: ConnectedAccountStatus.ACTIVE,
            accessToken: payload.accessToken,
            accessTokenIv: payload.accessTokenIv,
            accessTokenTag: payload.accessTokenTag,
            accessTokenExpiresAt: payload.accessTokenExpiresAt,
            refreshToken: payload.refreshToken || existing.refreshToken,
            refreshTokenIv: payload.refreshTokenIv || existing.refreshTokenIv,
            refreshTokenTag: payload.refreshTokenTag || existing.refreshTokenTag,
            refreshTokenExpiresAt: payload.refreshTokenExpiresAt || existing.refreshTokenExpiresAt,
            scopes: payload.scopes,
            metadata: payload.metadata,
            updatedAt: new Date(),
            deletedAt: null,
          })
          .where(eq(connectedAccountsTable.id, existing.id))
          .returning();

        return updated;
      }

      return await create(payload, options);
    } catch (err) {
      logger.error("error upserting connected social account", {
        module: "accounts",
        action: "repository:upsert",
        error: err,
      });
      throw err;
    }
  }

  /**
   * Finds a connected account by its ID
   */
  export async function findById(
    id: string,
    options?: { tx?: DBTransaction },
  ): Promise<ConnectedAccount | undefined> {
    const queryClient = options?.tx || db;
    return await withMetrics("select", "connected_accounts", async () =>
      queryClient.query.connectedAccountsTable.findFirst({
        where: and(eq(connectedAccountsTable.id, id), isNull(connectedAccountsTable.deletedAt)),
      }),
    );
  }

  /**
   * Finds all active connected accounts for a user
   */
  export async function findAllByUserId(
    userId: string,
    options?: { tx?: DBTransaction },
  ): Promise<ConnectedAccount[]> {
    const queryClient = options?.tx || db;
    return await withMetrics("select", "connected_accounts", async () =>
      queryClient.query.connectedAccountsTable.findMany({
        where: and(
          eq(connectedAccountsTable.userId, userId),
          isNull(connectedAccountsTable.deletedAt),
        ),
      }),
    );
  }

  /**
   * Updates tokens after a silent refresh
   */
  export async function updateTokens(
    id: string,
    tokens: {
      accessToken: string;
      accessTokenIv: string;
      accessTokenTag: string;
      accessTokenExpiresAt?: Date;
      refreshToken?: string;
      refreshTokenIv?: string;
      refreshTokenTag?: string;
      refreshTokenExpiresAt?: Date;
    },
    options?: { tx?: DBTransaction },
  ): Promise<ConnectedAccount> {
    const queryClient = options?.tx || db;
    const [updated] = await queryClient
      .update(connectedAccountsTable)
      .set({
        ...tokens,
        status: ConnectedAccountStatus.ACTIVE,
        updatedAt: new Date(),
      })
      .where(eq(connectedAccountsTable.id, id))
      .returning();

    return updated;
  }

  /**
   * Updates health check status
   */
  export async function updateHealthCheck(
    id: string,
    status: string,
    accountStatus: ConnectedAccountStatus = ConnectedAccountStatus.ACTIVE,
    options?: { tx?: DBTransaction },
  ): Promise<void> {
    const queryClient = options?.tx || db;
    await queryClient
      .update(connectedAccountsTable)
      .set({
        lastHealthCheckAt: new Date(),
        lastHealthStatus: status,
        status: accountStatus,
        updatedAt: new Date(),
      })
      .where(eq(connectedAccountsTable.id, id));
  }

  /**
   * Disconnects / revokes an account (soft delete)
   */
  export async function disconnect(
    id: string,
    userId: string,
    options?: { tx?: DBTransaction },
  ): Promise<boolean> {
    const queryClient = options?.tx || db;
    const [deleted] = await queryClient
      .update(connectedAccountsTable)
      .set({
        status: ConnectedAccountStatus.DISCONNECTED,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(connectedAccountsTable.id, id), eq(connectedAccountsTable.userId, userId)))
      .returning();

    return !!deleted;
  }
}

// Backward-compatibility alias
export const AccountsService = AccountsRepository;
