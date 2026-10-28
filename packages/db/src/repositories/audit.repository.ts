import { and, desc, eq } from "drizzle-orm";
import { type DBTransaction, db } from "@/connection";
import { auditEventsTable, type AuditEvent, type NewAuditEvent } from "@/schema";

export namespace AuditRepository {
  export async function record(
    payload: NewAuditEvent,
    options?: { tx?: DBTransaction },
  ): Promise<AuditEvent> {
    const queryClient = options?.tx || db;
    const [event] = await queryClient.insert(auditEventsTable).values(payload).returning();
    return event;
  }

  export async function listByWorkspace(
    workspaceId: string,
    filters?: { action?: string; limit?: number; offset?: number },
    options?: { tx?: DBTransaction },
  ): Promise<AuditEvent[]> {
    const queryClient = options?.tx || db;
    const conditions = [eq(auditEventsTable.workspaceId, workspaceId)];
    if (filters?.action) {
      conditions.push(eq(auditEventsTable.action, filters.action));
    }

    return queryClient.query.auditEventsTable.findMany({
      where: and(...conditions),
      orderBy: [desc(auditEventsTable.createdAt)],
      limit: filters?.limit ?? 50,
      offset: filters?.offset ?? 0,
    });
  }
}
