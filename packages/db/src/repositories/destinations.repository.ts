import { and, eq, inArray } from "drizzle-orm";
import { type DBTransaction, db } from "../connection";
import {
  connectedDestinationsTable,
  connectedAccountsTable,
  type ConnectedDestination,
  type NewConnectedDestination,
} from "../schema";
import { withMetrics } from "../utils/metrics-wrapper";
import { logger } from "@repo/shared";

export namespace DestinationsRepository {
  /**
   * Syncs and upserts discovered destinations for an account
   */
  export async function syncDestinations(
    accountId: string,
    destinations: NewConnectedDestination[],
    options?: { tx?: DBTransaction },
  ): Promise<ConnectedDestination[]> {
    const queryClient = options?.tx || db;
    try {
      const results: ConnectedDestination[] = [];

      for (const dest of destinations) {
        const existing = await queryClient.query.connectedDestinationsTable.findFirst({
          where: and(
            eq(connectedDestinationsTable.accountId, accountId),
            eq(connectedDestinationsTable.externalId, dest.externalId),
          ),
        });

        if (existing) {
          const [updated] = await queryClient
            .update(connectedDestinationsTable)
            .set({
              name: dest.name,
              description: dest.description,
              avatarUrl: dest.avatarUrl,
              parentContainerId: dest.parentContainerId,
              parentContainerName: dest.parentContainerName,
              memberCount: dest.memberCount,
              canPost: dest.canPost,
              requirements: dest.requirements,
              extra: dest.extra,
              lastSyncedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(connectedDestinationsTable.id, existing.id))
            .returning();

          results.push(updated);
        } else {
          const [inserted] = await queryClient
            .insert(connectedDestinationsTable)
            .values({
              ...dest,
              accountId,
            })
            .returning();

          results.push(inserted);
        }
      }

      logger.audit("destinations synced", {
        module: "destinations",
        action: "repository:syncDestinations",
        accountId,
        count: results.length,
      });

      return results;
    } catch (err) {
      logger.error("error syncing destinations", {
        module: "destinations",
        action: "repository:syncDestinations",
        error: err,
      });
      throw err;
    }
  }

  /**
   * Finds all destinations for a connected account
   */
  export async function findAllByAccountId(
    accountId: string,
    options?: { tx?: DBTransaction },
  ): Promise<ConnectedDestination[]> {
    const queryClient = options?.tx || db;
    return await withMetrics("select", "connected_destinations", async () =>
      queryClient.query.connectedDestinationsTable.findMany({
        where: eq(connectedDestinationsTable.accountId, accountId),
      }),
    );
  }

  /**
   * Finds all destinations for a user across all active connected accounts
   */
  export async function findAllByUserId(
    userId: string,
    options?: { tx?: DBTransaction },
  ): Promise<ConnectedDestination[]> {
    const queryClient = options?.tx || db;
    return await withMetrics("select", "connected_destinations", async () => {
      const userAccounts = await queryClient.query.connectedAccountsTable.findMany({
        where: eq(connectedAccountsTable.userId, userId),
      });

      if (userAccounts.length === 0) return [];

      const accountIds = userAccounts.map((a) => a.id);
      return queryClient.query.connectedDestinationsTable.findMany({
        where: inArray(connectedDestinationsTable.accountId, accountIds),
      });
    });
  }

  /**
   * Finds a destination by ID
   */
  export async function findById(
    id: string,
    options?: { tx?: DBTransaction },
  ): Promise<ConnectedDestination | undefined> {
    const queryClient = options?.tx || db;
    return await withMetrics("select", "connected_destinations", async () =>
      queryClient.query.connectedDestinationsTable.findFirst({
        where: eq(connectedDestinationsTable.id, id),
      }),
    );
  }

  /**
   * Sets a destination as default for an account
   */
  export async function setDefault(
    accountId: string,
    destinationId: string,
    options?: { tx?: DBTransaction },
  ): Promise<void> {
    const queryClient = options?.tx || db;
    // Clear existing defaults
    await queryClient
      .update(connectedDestinationsTable)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(eq(connectedDestinationsTable.accountId, accountId));

    // Set new default
    await queryClient
      .update(connectedDestinationsTable)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(
        and(
          eq(connectedDestinationsTable.accountId, accountId),
          eq(connectedDestinationsTable.id, destinationId),
        ),
      );
  }
}

// Backward-compatibility alias
export const DestinationsService = DestinationsRepository;
