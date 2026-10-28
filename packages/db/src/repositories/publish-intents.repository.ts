import { eq } from "drizzle-orm";
import { type DBTransaction, db } from "@/connection";
import {
  publishIntentsTable,
  PublishIntentStateEnum,
  type NewPublishIntent,
  type PublishIntent,
} from "@/schema";
import { logger } from "@repo/shared";

export namespace PublishIntentsRepository {
  export async function create(
    payload: NewPublishIntent,
    options?: { tx?: DBTransaction },
  ): Promise<PublishIntent> {
    const queryClient = options?.tx || db;
    const [created] = await queryClient.insert(publishIntentsTable).values(payload).returning();

    logger.audit("publish intent created", {
      module: "posts",
      action: "repository:createPublishIntent",
      publishIntentId: created.id,
      postId: created.postId,
      workspaceId: created.workspaceId,
      mode: created.mode,
    });

    return created;
  }

  export async function findById(
    id: string,
    options?: { tx?: DBTransaction },
  ): Promise<PublishIntent | null> {
    const queryClient = options?.tx || db;
    const intent = await queryClient.query.publishIntentsTable.findFirst({
      where: eq(publishIntentsTable.id, id),
    });
    return intent ?? null;
  }

  export async function markConfirmed(
    id: string,
    options?: { tx?: DBTransaction },
  ): Promise<PublishIntent> {
    const queryClient = options?.tx || db;
    const [updated] = await queryClient
      .update(publishIntentsTable)
      .set({
        state: PublishIntentStateEnum.CONFIRMED,
        confirmedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(publishIntentsTable.id, id))
      .returning();

    logger.audit("publish intent confirmed", {
      module: "posts",
      action: "repository:confirmPublishIntent",
      publishIntentId: updated.id,
      postId: updated.postId,
    });

    return updated;
  }

  export async function markExpired(
    id: string,
    options?: { tx?: DBTransaction },
  ): Promise<PublishIntent> {
    const queryClient = options?.tx || db;
    const [updated] = await queryClient
      .update(publishIntentsTable)
      .set({ state: PublishIntentStateEnum.EXPIRED, updatedAt: new Date() })
      .where(eq(publishIntentsTable.id, id))
      .returning();
    return updated;
  }
}
