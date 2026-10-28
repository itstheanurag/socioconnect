import { and, eq, gt, isNull } from "drizzle-orm";
import { type DBTransaction, db } from "@/connection";
import {
  oauthAuthorizationCodesTable,
  oauthClientsTable,
  oauthRefreshTokensTable,
  type NewOAuthAuthorizationCode,
  type NewOAuthClient,
  type NewOAuthRefreshToken,
  type OAuthAuthorizationCode,
  type OAuthClient,
  type OAuthRefreshToken,
} from "@/schema";

export namespace OAuthRepository {
  export async function createClient(
    payload: NewOAuthClient,
    options?: { tx?: DBTransaction },
  ): Promise<OAuthClient> {
    const queryClient = options?.tx || db;
    const [client] = await queryClient.insert(oauthClientsTable).values(payload).returning();
    return client;
  }

  export async function findClient(
    clientId: string,
    options?: { tx?: DBTransaction },
  ): Promise<OAuthClient | null> {
    const queryClient = options?.tx || db;
    const client = await queryClient.query.oauthClientsTable.findFirst({
      where: eq(oauthClientsTable.clientId, clientId),
    });
    return client ?? null;
  }

  export async function createAuthorizationCode(
    payload: NewOAuthAuthorizationCode,
    options?: { tx?: DBTransaction },
  ): Promise<OAuthAuthorizationCode> {
    const queryClient = options?.tx || db;
    const [code] = await queryClient
      .insert(oauthAuthorizationCodesTable)
      .values(payload)
      .returning();
    return code;
  }

  /**
   * Atomically consumes an authorization code. A code can only be used once.
   */
  export async function consumeAuthorizationCode(
    codeHash: string,
    options?: { tx?: DBTransaction },
  ): Promise<OAuthAuthorizationCode | null> {
    const queryClient = options?.tx || db;
    const [code] = await queryClient
      .update(oauthAuthorizationCodesTable)
      .set({ consumedAt: new Date() })
      .where(
        and(
          eq(oauthAuthorizationCodesTable.codeHash, codeHash),
          isNull(oauthAuthorizationCodesTable.consumedAt),
          gt(oauthAuthorizationCodesTable.expiresAt, new Date()),
        ),
      )
      .returning();
    return code ?? null;
  }

  export async function createRefreshToken(
    payload: NewOAuthRefreshToken,
    options?: { tx?: DBTransaction },
  ): Promise<OAuthRefreshToken> {
    const queryClient = options?.tx || db;
    const [token] = await queryClient.insert(oauthRefreshTokensTable).values(payload).returning();
    return token;
  }

  export async function findRefreshToken(
    tokenHash: string,
    options?: { tx?: DBTransaction },
  ): Promise<OAuthRefreshToken | null> {
    const queryClient = options?.tx || db;
    const token = await queryClient.query.oauthRefreshTokensTable.findFirst({
      where: and(
        eq(oauthRefreshTokensTable.tokenHash, tokenHash),
        isNull(oauthRefreshTokensTable.revokedAt),
        gt(oauthRefreshTokensTable.expiresAt, new Date()),
      ),
    });
    return token ?? null;
  }

  export async function revokeRefreshToken(
    id: string,
    options?: { tx?: DBTransaction },
  ): Promise<void> {
    const queryClient = options?.tx || db;
    await queryClient
      .update(oauthRefreshTokensTable)
      .set({ revokedAt: new Date() })
      .where(eq(oauthRefreshTokensTable.id, id));
  }

  export async function touchRefreshToken(
    id: string,
    options?: { tx?: DBTransaction },
  ): Promise<void> {
    const queryClient = options?.tx || db;
    await queryClient
      .update(oauthRefreshTokensTable)
      .set({ lastUsedAt: new Date() })
      .where(eq(oauthRefreshTokensTable.id, id));
  }
}
