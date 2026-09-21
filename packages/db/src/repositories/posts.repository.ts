import { and, desc, eq, isNull, lte } from "drizzle-orm";
import { type DBTransaction, db } from "../connection";
import {
  postsTable,
  postDispatchesTable,
  type Post,
  type NewPost,
  type PostDispatch,
  type NewPostDispatch,
  PostStatusEnum,
  DispatchStatusEnum,
} from "../schema";
import { withMetrics } from "../utils/metrics-wrapper";
import { logger } from "@repo/shared";

export interface CreatePostInput {
  post: NewPost;
  dispatches: Array<Omit<NewPostDispatch, "postId">>;
}

export namespace PostsRepository {
  /**
   * Creates a post along with its multi-channel dispatches in a single transaction
   */
  export async function createWithDispatches(
    input: CreatePostInput,
    options?: { tx?: DBTransaction },
  ): Promise<{ post: Post; dispatches: PostDispatch[] }> {
    const execute = async (tx: DBTransaction) => {
      // 1. Create master post
      const [post] = await tx.insert(postsTable).values(input.post).returning();

      // 2. Create target dispatches
      const dispatchValues = input.dispatches.map((d) => ({
        ...d,
        postId: post.id,
      }));

      const dispatches =
        dispatchValues.length > 0
          ? await tx.insert(postDispatchesTable).values(dispatchValues).returning()
          : [];

      logger.audit("post created with dispatches", {
        module: "posts",
        action: "repository:createWithDispatches",
        postId: post.id,
        dispatchCount: dispatches.length,
      });

      return { post, dispatches };
    };

    if (options?.tx) {
      return await execute(options.tx);
    }

    return await db.transaction(execute);
  }

  /**
   * Finds a post by ID with all its dispatches
   */
  export async function findById(id: string, options?: { tx?: DBTransaction }) {
    const queryClient = options?.tx || db;
    return await withMetrics("select", "posts", async () =>
      queryClient.query.postsTable.findFirst({
        where: and(eq(postsTable.id, id), isNull(postsTable.deletedAt)),
        with: {
          dispatches: {
            with: {
              account: true,
              destination: true,
            },
          },
        },
      }),
    );
  }

  /**
   * Finds all posts for a user (with optional pagination & status filters)
   */
  export async function findAllByUserId(
    userId: string,
    filters?: {
      status?: PostStatusEnum;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    },
    options?: { tx?: DBTransaction },
  ) {
    const queryClient = options?.tx || db;
    return await withMetrics("select", "posts", async () =>
      queryClient.query.postsTable.findMany({
        where: and(
          eq(postsTable.userId, userId),
          isNull(postsTable.deletedAt),
          filters?.status ? eq(postsTable.status, filters.status) : undefined,
        ),
        orderBy: [desc(postsTable.createdAt)],
        limit: filters?.limit || 50,
        offset: filters?.offset || 0,
        with: {
          dispatches: {
            with: {
              account: true,
              destination: true,
            },
          },
        },
      }),
    );
  }

  /**
   * Finds all pending dispatches that are due for execution (Worker Queue)
   */
  export async function findDueDispatches(
    now: Date = new Date(),
    limit: number = 50,
    options?: { tx?: DBTransaction },
  ) {
    const queryClient = options?.tx || db;
    return await withMetrics("select", "post_dispatches", async () =>
      queryClient.query.postDispatchesTable.findMany({
        where: and(
          eq(postDispatchesTable.status, DispatchStatusEnum.PENDING),
          lte(postDispatchesTable.scheduledFor, now),
        ),
        limit,
        with: {
          post: true,
          account: true,
          destination: true,
        },
      }),
    );
  }

  /**
   * Updates dispatch execution outcome
   */
  export async function updateDispatchResult(
    dispatchId: string,
    result: {
      status: DispatchStatusEnum;
      externalPostId?: string;
      externalPostUrl?: string;
      errorDetails?: Record<string, unknown>;
      retryCount?: number;
      nextRetryAt?: Date;
    },
    options?: { tx?: DBTransaction },
  ): Promise<PostDispatch> {
    const queryClient = options?.tx || db;
    const [updated] = await queryClient
      .update(postDispatchesTable)
      .set({
        ...result,
        dispatchedAt: result.status === DispatchStatusEnum.SUCCESS ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(postDispatchesTable.id, dispatchId))
      .returning();

    // Check if all dispatches for parent post have concluded
    await syncMasterPostStatus(updated.postId, queryClient as any);

    return updated;
  }

  /**
   * Recalculates master post status based on child dispatches
   */
  async function syncMasterPostStatus(postId: string, tx: DBTransaction) {
    const allDispatches = await tx.query.postDispatchesTable.findMany({
      where: eq(postDispatchesTable.postId, postId),
    });

    if (allDispatches.length === 0) return;

    const isAllSuccess = allDispatches.every((d) => d.status === DispatchStatusEnum.SUCCESS);
    const isAllFailed = allDispatches.every((d) => d.status === DispatchStatusEnum.FAILED);
    const hasAnySuccess = allDispatches.some((d) => d.status === DispatchStatusEnum.SUCCESS);
    const hasAnyProcessing = allDispatches.some(
      (d) => d.status === DispatchStatusEnum.PENDING || d.status === DispatchStatusEnum.PROCESSING,
    );

    let newStatus = PostStatusEnum.DISPATCHING;

    if (isAllSuccess) {
      newStatus = PostStatusEnum.PUBLISHED;
    } else if (isAllFailed) {
      newStatus = PostStatusEnum.FAILED;
    } else if (hasAnySuccess && !hasAnyProcessing) {
      newStatus = PostStatusEnum.PARTIALLY_FAILED;
    }

    await tx
      .update(postsTable)
      .set({
        status: newStatus,
        publishedAt: isAllSuccess || hasAnySuccess ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(postsTable.id, postId));
  }
}

// Backward-compatibility alias
export const PostsService = PostsRepository;
