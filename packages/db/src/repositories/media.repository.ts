import { and, desc, eq, isNull } from "drizzle-orm";
import { type DBTransaction, db } from "../connection";
import { mediaAssetsTable, type MediaAsset, type NewMediaAsset, MediaTypeEnum } from "../schema";
import { withMetrics } from "../utils/metrics-wrapper";
import { logger } from "@repo/shared";

export namespace MediaRepository {
  /**
   * Records a new media asset
   */
  export async function create(
    payload: NewMediaAsset,
    options?: { tx?: DBTransaction },
  ): Promise<MediaAsset> {
    const queryClient = options?.tx || db;
    try {
      const result = await withMetrics("insert", "media_assets", async () =>
        queryClient.insert(mediaAssetsTable).values(payload).returning(),
      );
      const [media] = result;

      logger.audit("media asset recorded", {
        module: "media",
        action: "repository:create",
        mediaId: media.id,
        userId: media.userId,
      });

      return media;
    } catch (err) {
      logger.error("error recording media asset", {
        module: "media",
        action: "repository:create",
        error: err,
      });
      throw err;
    }
  }

  /**
   * Finds a media asset by ID
   */
  export async function findById(
    id: string,
    options?: { tx?: DBTransaction },
  ): Promise<MediaAsset | undefined> {
    const queryClient = options?.tx || db;
    return await withMetrics("select", "media_assets", async () =>
      queryClient.query.mediaAssetsTable.findFirst({
        where: and(eq(mediaAssetsTable.id, id), isNull(mediaAssetsTable.deletedAt)),
      }),
    );
  }

  /**
   * Finds all media assets for a user with pagination and optional type filter
   */
  export async function findAllByUserId(
    userId: string,
    options?: {
      type?: MediaTypeEnum;
      limit?: number;
      offset?: number;
      tx?: DBTransaction;
    },
  ): Promise<MediaAsset[]> {
    const queryClient = options?.tx || db;
    return await withMetrics("select", "media_assets", async () => {
      const conditions = [eq(mediaAssetsTable.userId, userId), isNull(mediaAssetsTable.deletedAt)];

      if (options?.type) {
        conditions.push(eq(mediaAssetsTable.type, options.type));
      }

      return queryClient.query.mediaAssetsTable.findMany({
        where: and(...conditions),
        orderBy: [desc(mediaAssetsTable.createdAt)],
        limit: options?.limit || 24,
        offset: options?.offset || 0,
      });
    });
  }

  /**
   * Soft-deletes a media asset
   */
  export async function deleteAsset(
    id: string,
    userId: string,
    options?: { tx?: DBTransaction },
  ): Promise<boolean> {
    const queryClient = options?.tx || db;
    const [deleted] = await queryClient
      .update(mediaAssetsTable)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(mediaAssetsTable.id, id),
          eq(mediaAssetsTable.userId, userId),
          isNull(mediaAssetsTable.deletedAt),
        ),
      )
      .returning();

    return !!deleted;
  }
}

// Backward-compatibility alias
export const MediaService = MediaRepository;
