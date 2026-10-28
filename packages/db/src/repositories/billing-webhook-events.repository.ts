import { eq, sql } from "drizzle-orm";
import { db } from "@/connection";
import {
  billingWebhookEventsTable,
  BillingWebhookStatusEnum,
  type BillingWebhookEvent,
} from "@/schema";
import { logger } from "@repo/shared";

export namespace BillingWebhookEventsRepository {
  /**
   * Claims a webhook for processing.
   *
   * Returns `isDuplicate: true` when the same webhook ID has already been
   * processed successfully. Failed events are retried.
   */
  export async function begin(
    webhookId: string,
    eventType: string,
    payloadHash: string,
  ): Promise<{ isDuplicate: boolean; record: BillingWebhookEvent }> {
    const [inserted] = await db
      .insert(billingWebhookEventsTable)
      .values({ webhookId, eventType, payloadHash })
      .onConflictDoNothing({ target: billingWebhookEventsTable.webhookId })
      .returning();

    if (inserted) {
      return { isDuplicate: false, record: inserted };
    }

    const existing = await db.query.billingWebhookEventsTable.findFirst({
      where: eq(billingWebhookEventsTable.webhookId, webhookId),
    });

    if (!existing) {
      throw new Error(`Unable to claim webhook ${webhookId}`);
    }

    if (existing.status === BillingWebhookStatusEnum.PROCESSED) {
      return { isDuplicate: true, record: existing };
    }

    const [retried] = await db
      .update(billingWebhookEventsTable)
      .set({
        status: BillingWebhookStatusEnum.PROCESSING,
        attempts: sql`${billingWebhookEventsTable.attempts} + 1`,
        error: null,
        updatedAt: new Date(),
      })
      .where(eq(billingWebhookEventsTable.id, existing.id))
      .returning();

    logger.warn("retrying previously failed billing webhook", {
      module: "billing",
      action: "webhook:retry",
      webhookId,
      eventType,
      attempts: retried.attempts,
    });

    return { isDuplicate: false, record: retried };
  }

  export async function markProcessed(id: string): Promise<void> {
    await db
      .update(billingWebhookEventsTable)
      .set({
        status: BillingWebhookStatusEnum.PROCESSED,
        processedAt: new Date(),
        error: null,
        updatedAt: new Date(),
      })
      .where(eq(billingWebhookEventsTable.id, id));
  }

  export async function markFailed(id: string, error: string): Promise<void> {
    await db
      .update(billingWebhookEventsTable)
      .set({
        status: BillingWebhookStatusEnum.FAILED,
        error: error.slice(0, 2_000),
        updatedAt: new Date(),
      })
      .where(eq(billingWebhookEventsTable.id, id));
  }
}
