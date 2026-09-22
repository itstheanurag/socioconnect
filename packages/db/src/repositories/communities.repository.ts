import { and, desc, eq, inArray, isNull, lte } from "drizzle-orm";
import { type DBTransaction, db } from "../connection";
import {
  communityGroupsTable,
  communityAutomationsTable,
  type CommunityGroup,
  type NewCommunityGroup,
  type UpdateCommunityGroup,
  type CommunityAutomation,
  type NewCommunityAutomation,
  type UpdateCommunityAutomation,
  AutomationStatusEnum,
} from "../schema";
import { withMetrics } from "../utils/metrics-wrapper";
import { logger } from "@repo/shared";

export namespace CommunitiesRepository {
  // -------------------------------------------------------------
  // COMMUNITY GROUPS
  // -------------------------------------------------------------

  /**
   * Creates a new community cluster group
   */
  export async function createGroup(
    payload: NewCommunityGroup,
    options?: { tx?: DBTransaction },
  ): Promise<CommunityGroup> {
    const queryClient = options?.tx || db;
    const [group] = await queryClient
      .insert(communityGroupsTable)
      .values(payload)
      .returning();

    logger.audit("community group created", {
      module: "communities",
      action: "createGroup",
      groupId: group.id,
      userId: group.userId,
      platform: group.platform,
      destinationsCount: group.destinationIds.length,
    });

    return group;
  }

  /**
   * Finds a community group by ID
   */
  export async function findGroupById(
    id: string,
    userId?: string,
    options?: { tx?: DBTransaction },
  ) {
    const queryClient = options?.tx || db;
    return await withMetrics("select", "community_groups", async () =>
      queryClient.query.communityGroupsTable.findFirst({
        where: and(
          eq(communityGroupsTable.id, id),
          userId ? eq(communityGroupsTable.userId, userId) : undefined,
          isNull(communityGroupsTable.deletedAt),
        ),
        with: {
          account: true,
          automations: {
            where: isNull(communityAutomationsTable.deletedAt),
          },
        },
      }),
    );
  }

  /**
   * Lists all community groups for a user
   */
  export async function findAllGroupsByUserId(
    userId: string,
    options?: { tx?: DBTransaction },
  ) {
    const queryClient = options?.tx || db;
    return await withMetrics("select", "community_groups", async () =>
      queryClient.query.communityGroupsTable.findMany({
        where: and(
          eq(communityGroupsTable.userId, userId),
          isNull(communityGroupsTable.deletedAt),
        ),
        orderBy: [desc(communityGroupsTable.createdAt)],
        with: {
          account: true,
          automations: {
            where: isNull(communityAutomationsTable.deletedAt),
          },
        },
      }),
    );
  }

  /**
   * Updates a community group
   */
  export async function updateGroup(
    id: string,
    userId: string,
    updates: UpdateCommunityGroup,
    options?: { tx?: DBTransaction },
  ): Promise<CommunityGroup | undefined> {
    const queryClient = options?.tx || db;
    const [updated] = await queryClient
      .update(communityGroupsTable)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(communityGroupsTable.id, id),
          eq(communityGroupsTable.userId, userId),
          isNull(communityGroupsTable.deletedAt),
        ),
      )
      .returning();

    return updated;
  }

  /**
   * Soft deletes a community group
   */
  export async function deleteGroup(
    id: string,
    userId: string,
    options?: { tx?: DBTransaction },
  ): Promise<boolean> {
    const queryClient = options?.tx || db;
    const [deleted] = await queryClient
      .update(communityGroupsTable)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(communityGroupsTable.id, id),
          eq(communityGroupsTable.userId, userId),
          isNull(communityGroupsTable.deletedAt),
        ),
      )
      .returning();

    return !!deleted;
  }

  // -------------------------------------------------------------
  // COMMUNITY AUTOMATIONS
  // -------------------------------------------------------------

  /**
   * Creates an automated syndication schedule for a community group
   */
  export async function createAutomation(
    payload: NewCommunityAutomation,
    options?: { tx?: DBTransaction },
  ): Promise<CommunityAutomation> {
    const queryClient = options?.tx || db;
    const [automation] = await queryClient
      .insert(communityAutomationsTable)
      .values(payload)
      .returning();

    logger.audit("community automation created", {
      module: "communities",
      action: "createAutomation",
      automationId: automation.id,
      groupId: automation.groupId,
      userId: automation.userId,
      scheduleType: automation.scheduleType,
    });

    return automation;
  }

  /**
   * Finds an automation by ID
   */
  export async function findAutomationById(
    id: string,
    userId?: string,
    options?: { tx?: DBTransaction },
  ) {
    const queryClient = options?.tx || db;
    return await withMetrics("select", "community_automations", async () =>
      queryClient.query.communityAutomationsTable.findFirst({
        where: and(
          eq(communityAutomationsTable.id, id),
          userId ? eq(communityAutomationsTable.userId, userId) : undefined,
          isNull(communityAutomationsTable.deletedAt),
        ),
        with: {
          group: {
            with: {
              account: true,
            },
          },
        },
      }),
    );
  }

  /**
   * Lists all automations for a user
   */
  export async function findAllAutomationsByUserId(
    userId: string,
    options?: { tx?: DBTransaction },
  ) {
    const queryClient = options?.tx || db;
    return await withMetrics("select", "community_automations", async () =>
      queryClient.query.communityAutomationsTable.findMany({
        where: and(
          eq(communityAutomationsTable.userId, userId),
          isNull(communityAutomationsTable.deletedAt),
        ),
        orderBy: [desc(communityAutomationsTable.createdAt)],
        with: {
          group: {
            with: {
              account: true,
            },
          },
        },
      }),
    );
  }

  /**
   * Updates an automation rule
   */
  export async function updateAutomation(
    id: string,
    userId: string,
    updates: UpdateCommunityAutomation,
    options?: { tx?: DBTransaction },
  ): Promise<CommunityAutomation | undefined> {
    const queryClient = options?.tx || db;
    const [updated] = await queryClient
      .update(communityAutomationsTable)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(communityAutomationsTable.id, id),
          eq(communityAutomationsTable.userId, userId),
          isNull(communityAutomationsTable.deletedAt),
        ),
      )
      .returning();

    return updated;
  }

  /**
   * Soft deletes an automation
   */
  export async function deleteAutomation(
    id: string,
    userId: string,
    options?: { tx?: DBTransaction },
  ): Promise<boolean> {
    const queryClient = options?.tx || db;
    const [deleted] = await queryClient
      .update(communityAutomationsTable)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(communityAutomationsTable.id, id),
          eq(communityAutomationsTable.userId, userId),
          isNull(communityAutomationsTable.deletedAt),
        ),
      )
      .returning();

    return !!deleted;
  }

  /**
   * Advances automation run state and updates next run time
   */
  export async function recordAutomationExecution(
    id: string,
    nextRunAt: Date,
    nextTopicIndex?: number,
    options?: { tx?: DBTransaction },
  ): Promise<void> {
    const queryClient = options?.tx || db;
    const automation = await queryClient.query.communityAutomationsTable.findFirst({
      where: eq(communityAutomationsTable.id, id),
    });

    if (!automation) return;

    await queryClient
      .update(communityAutomationsTable)
      .set({
        lastRunAt: new Date(),
        nextRunAt,
        totalRuns: automation.totalRuns + 1,
        nextTopicIndex: nextTopicIndex !== undefined ? nextTopicIndex : automation.nextTopicIndex,
        updatedAt: new Date(),
      })
      .where(eq(communityAutomationsTable.id, id));
  }
}

// Backward-compatibility alias
export const CommunitiesService = CommunitiesRepository;
