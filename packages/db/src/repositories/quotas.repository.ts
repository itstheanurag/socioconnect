import { eq, sql } from "drizzle-orm";
import { type DBTransaction, db } from "../connection";
import { userQuotasTable, type UserQuota, PlanTierEnum } from "../schema";
import { withMetrics } from "../utils/metrics-wrapper";
import { logger } from "@repo/shared";

export namespace QuotasRepository {
  /**
   * Retrieves or initializes quota tracker for a user
   */
  export async function getOrCreate(
    userId: string,
    options?: { tx?: DBTransaction },
  ): Promise<UserQuota> {
    const queryClient = options?.tx || db;
    try {
      const existing = await queryClient.query.userQuotasTable.findFirst({
        where: eq(userQuotasTable.userId, userId),
      });

      if (existing) {
        // Check if billing cycle has lapsed
        const now = new Date();
        if (now > new Date(existing.cycleResetsAt)) {
          const nextCycle = new Date();
          nextCycle.setMonth(nextCycle.getMonth() + 1);

          const [resetQuota] = await queryClient
            .update(userQuotasTable)
            .set({
              monthlyDropsUsed: 0,
              aiAdaptationsUsed: 0,
              cycleResetsAt: nextCycle,
              updatedAt: new Date(),
            })
            .where(eq(userQuotasTable.id, existing.id))
            .returning();

          return resetQuota;
        }

        return existing;
      }

      // Initialize default Solo tier quota
      const cycleResetsAt = new Date();
      cycleResetsAt.setMonth(cycleResetsAt.getMonth() + 1);

      const [created] = await queryClient
        .insert(userQuotasTable)
        .values({
          userId,
          tier: PlanTierEnum.SOLO,
          maxChannels: 3,
          maxMonthlyDrops: 30,
          monthlyDropsUsed: 0,
          maxAiAdaptations: 25,
          aiAdaptationsUsed: 0,
          maxCdnStorageBytes: 5000000000, // 5 GB
          cdnStorageUsedBytes: 0,
          cycleResetsAt,
        })
        .returning();

      return created;
    } catch (err) {
      logger.error("error getting or creating user quota", {
        module: "quotas",
        action: "repository:getOrCreate",
        error: err,
      });
      throw err;
    }
  }

  /**
   * Increments monthly posts drop usage
   */
  export async function incrementDrops(
    userId: string,
    count: number = 1,
    options?: { tx?: DBTransaction },
  ): Promise<void> {
    const queryClient = options?.tx || db;
    await queryClient
      .update(userQuotasTable)
      .set({
        monthlyDropsUsed: sql`${userQuotasTable.monthlyDropsUsed} + ${count}`,
        updatedAt: new Date(),
      })
      .where(eq(userQuotasTable.userId, userId));
  }

  /**
   * Increments AI adaptations usage
   */
  export async function incrementAiAdaptations(
    userId: string,
    count: number = 1,
    options?: { tx?: DBTransaction },
  ): Promise<void> {
    const queryClient = options?.tx || db;
    await queryClient
      .update(userQuotasTable)
      .set({
        aiAdaptationsUsed: sql`${userQuotasTable.aiAdaptationsUsed} + ${count}`,
        updatedAt: new Date(),
      })
      .where(eq(userQuotasTable.userId, userId));
  }
}

// Backward-compatibility alias
export const QuotasService = QuotasRepository;
