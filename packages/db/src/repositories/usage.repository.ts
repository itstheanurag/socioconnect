import { and, desc, eq, gte, sql } from "drizzle-orm";
import { type DBTransaction, db } from "@/connection";
import { usageEventsTable, type NewUsageEvent, type UsageEvent } from "@/schema";

export namespace UsageRepository {
  export async function record(
    payload: NewUsageEvent,
    options?: { tx?: DBTransaction },
  ): Promise<UsageEvent> {
    const queryClient = options?.tx || db;
    const [event] = await queryClient.insert(usageEventsTable).values(payload).returning();
    return event;
  }

  export async function listByWorkspace(
    workspaceId: string,
    filters?: { operation?: string; since?: Date; limit?: number; offset?: number },
    options?: { tx?: DBTransaction },
  ): Promise<UsageEvent[]> {
    const queryClient = options?.tx || db;
    const conditions = [eq(usageEventsTable.workspaceId, workspaceId)];

    if (filters?.operation) {
      conditions.push(eq(usageEventsTable.operation, filters.operation));
    }
    if (filters?.since) {
      conditions.push(gte(usageEventsTable.createdAt, filters.since));
    }

    return queryClient.query.usageEventsTable.findMany({
      where: and(...conditions),
      orderBy: [desc(usageEventsTable.createdAt)],
      limit: filters?.limit ?? 100,
      offset: filters?.offset ?? 0,
    });
  }

  export async function sumQuantity(
    workspaceId: string,
    operation: string,
    since?: Date,
    options?: { tx?: DBTransaction },
  ): Promise<number> {
    const queryClient = options?.tx || db;
    const conditions = [
      eq(usageEventsTable.workspaceId, workspaceId),
      eq(usageEventsTable.operation, operation),
    ];
    if (since) {
      conditions.push(gte(usageEventsTable.createdAt, since));
    }

    const [row] = await queryClient
      .select({ total: sql<string>`coalesce(sum(${usageEventsTable.quantity}), 0)` })
      .from(usageEventsTable)
      .where(and(...conditions));

    return Number(row?.total ?? 0);
  }
}
