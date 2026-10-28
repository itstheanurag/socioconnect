import { and, arrayContains, desc, eq, lte, or } from "drizzle-orm";
import { type DBTransaction, db } from "@/connection";
import {
  webhookDeliveriesTable,
  webhookEndpointsTable,
  WebhookDeliveryStatusEnum,
  WebhookStatusEnum,
  type NewWebhookDelivery,
  type NewWebhookEndpoint,
  type WebhookDelivery,
  type WebhookEndpoint,
} from "@/schema";

export namespace WebhookRepository {
  export async function createEndpoint(
    payload: NewWebhookEndpoint,
    options?: { tx?: DBTransaction },
  ): Promise<WebhookEndpoint> {
    const queryClient = options?.tx || db;
    const [endpoint] = await queryClient.insert(webhookEndpointsTable).values(payload).returning();
    return endpoint;
  }

  export async function listEndpoints(
    workspaceId: string,
    options?: { tx?: DBTransaction },
  ): Promise<WebhookEndpoint[]> {
    const queryClient = options?.tx || db;
    return queryClient.query.webhookEndpointsTable.findMany({
      where: and(
        eq(webhookEndpointsTable.workspaceId, workspaceId),
        eq(webhookEndpointsTable.status, WebhookStatusEnum.ACTIVE),
      ),
      orderBy: [desc(webhookEndpointsTable.createdAt)],
    });
  }

  export async function findEndpoint(
    id: string,
    workspaceId: string,
    options?: { tx?: DBTransaction },
  ): Promise<WebhookEndpoint | null> {
    const queryClient = options?.tx || db;
    const endpoint = await queryClient.query.webhookEndpointsTable.findFirst({
      where: and(
        eq(webhookEndpointsTable.id, id),
        eq(webhookEndpointsTable.workspaceId, workspaceId),
        eq(webhookEndpointsTable.status, WebhookStatusEnum.ACTIVE),
      ),
    });
    return endpoint ?? null;
  }

  export async function findActiveForEvent(
    workspaceId: string,
    event: string,
    options?: { tx?: DBTransaction },
  ): Promise<WebhookEndpoint[]> {
    const queryClient = options?.tx || db;
    return queryClient.query.webhookEndpointsTable.findMany({
      where: and(
        eq(webhookEndpointsTable.workspaceId, workspaceId),
        eq(webhookEndpointsTable.status, WebhookStatusEnum.ACTIVE),
        or(
          arrayContains(webhookEndpointsTable.events, [event]),
          arrayContains(webhookEndpointsTable.events, ["*"]),
        ),
      ),
    });
  }

  export async function disableEndpoint(
    id: string,
    workspaceId: string,
    options?: { tx?: DBTransaction },
  ): Promise<WebhookEndpoint | null> {
    const queryClient = options?.tx || db;
    const [endpoint] = await queryClient
      .update(webhookEndpointsTable)
      .set({
        status: WebhookStatusEnum.DISABLED,
        disabledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(eq(webhookEndpointsTable.id, id), eq(webhookEndpointsTable.workspaceId, workspaceId)),
      )
      .returning();
    return endpoint ?? null;
  }

  export async function createDelivery(
    payload: NewWebhookDelivery,
    options?: { tx?: DBTransaction },
  ): Promise<WebhookDelivery> {
    const queryClient = options?.tx || db;
    const [delivery] = await queryClient.insert(webhookDeliveriesTable).values(payload).returning();
    return delivery;
  }

  export async function updateDelivery(
    id: string,
    result: {
      status: WebhookDeliveryStatusEnum;
      attempts: number;
      responseStatus?: number | null;
      responseBody?: string | null;
      error?: string | null;
      nextRetryAt?: Date | null;
      deliveredAt?: Date | null;
    },
    options?: { tx?: DBTransaction },
  ): Promise<WebhookDelivery> {
    const queryClient = options?.tx || db;
    const [delivery] = await queryClient
      .update(webhookDeliveriesTable)
      .set({ ...result, updatedAt: new Date() })
      .where(eq(webhookDeliveriesTable.id, id))
      .returning();
    return delivery;
  }

  export async function findDueDeliveries(now: Date, limit = 50): Promise<WebhookDelivery[]> {
    return db.query.webhookDeliveriesTable.findMany({
      where: and(
        eq(webhookDeliveriesTable.status, WebhookDeliveryStatusEnum.FAILED),
        lte(webhookDeliveriesTable.nextRetryAt, now),
      ),
      orderBy: [webhookDeliveriesTable.nextRetryAt],
      limit,
    });
  }

  export async function listDeliveries(
    endpointId: string,
    workspaceId: string,
    limit = 20,
    options?: { tx?: DBTransaction },
  ): Promise<WebhookDelivery[]> {
    const queryClient = options?.tx || db;
    return queryClient.query.webhookDeliveriesTable.findMany({
      where: and(
        eq(webhookDeliveriesTable.endpointId, endpointId),
        eq(webhookDeliveriesTable.workspaceId, workspaceId),
      ),
      orderBy: [desc(webhookDeliveriesTable.createdAt)],
      limit,
    });
  }
}
