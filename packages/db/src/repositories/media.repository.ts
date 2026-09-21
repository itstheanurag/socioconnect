import { and, eq, isNull } from "drizzle-orm";
import { type DBTransaction, db } from "../connection";
import { mediaAssetsTable, type MediaAsset, type NewMediaAsset } from "../schema";
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
   * Finds all media assets for a user
   */
  export async function findAllByUserId(
    userId: string,
    options?: { tx?: DBTransaction },
  ): Promise<MediaAsset[]> {
    const queryClient = options?.tx || db;
    return await withMetrics("select", "media_assets", async () =>
      queryClient.query.mediaAssetsTable.findMany({
        where: and(eq(mediaAssetsTable.userId, userId), isNull(mediaAssetsTable.deletedAt)),
      }),
    );
  }
}

// Backward-compatibility alias
export const MediaService = MediaRepository;
