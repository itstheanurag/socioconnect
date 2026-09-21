import { createRoute, z } from "@hono/zod-openapi";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import {
  PostsRepository,
  PostStatusEnum,
  SocialPlatformEnum,
  DispatchStatusEnum,
  TimingStrategyEnum,
} from "@repo/db";
import { errorResponseSchemas, logger } from "@repo/shared";
import type { AppRouteHandler } from "@/types";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";

// 1. List Posts with Filtering
export const getPostsRoute = createRoute({
  method: "get",
  middleware: [enforceUserMiddleware],
  path: "/v1/posts",
  tags: ["Posts"],
  summary: "List posts and dispatches",
  description:
    "Retrieves creator's post history, scheduled queue, and multi-channel publication statuses",
  request: {
    query: z.object({
      status: z.nativeEnum(PostStatusEnum).optional(),
      page: z.coerce.number().optional().default(1),
      limit: z.coerce.number().optional().default(20),
    }),
  },
  responses: {
    200: {
      description: "Posts retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              posts: z.array(
                z.object({
                  id: z.string().uuid(),
                  title: z.string().nullable(),
                  content: z.string(),
                  tags: z.array(z.string()),
                  linkUrl: z.string().nullable(),
                  status: z.nativeEnum(PostStatusEnum),
                  timingStrategy: z.nativeEnum(TimingStrategyEnum),
                  scheduledAt: z.string().nullable(),
                  publishedAt: z.string().nullable(),
                  createdAt: z.string(),
                  dispatches: z.array(
                    z.object({
                      id: z.string().uuid(),
                      platform: z.nativeEnum(SocialPlatformEnum),
                      status: z.nativeEnum(DispatchStatusEnum),
                      scheduledFor: z.string(),
                      externalPostId: z.string().nullable(),
                      externalPostUrl: z.string().nullable(),
                      retryCount: z.number(),
                    }),
                  ),
                }),
              ),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type GetPostsRoute = typeof getPostsRoute;

export const getPostsHandler: AppRouteHandler<GetPostsRoute> = async (c) => {
  const { status, page, limit } = c.req.valid("query");
  const user = c.get("user");

  try {
    const rawPosts = await PostsRepository.findAllByUserId(user.id, {
      status,
      limit,
      offset: (page - 1) * limit,
    });

    const posts = rawPosts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      tags: p.tags,
      linkUrl: p.linkUrl,
      status: p.status as PostStatusEnum,
      timingStrategy: p.timingStrategy as TimingStrategyEnum,
      scheduledAt: p.scheduledAt ? p.scheduledAt.toISOString() : null,
      publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
      createdAt: p.createdAt.toISOString(),
      dispatches: p.dispatches.map((d) => ({
        id: d.id,
        platform: d.platform as SocialPlatformEnum,
        status: d.status as DispatchStatusEnum,
        scheduledFor: d.scheduledFor.toISOString(),
        externalPostId: d.externalPostId,
        externalPostUrl: d.externalPostUrl,
        retryCount: d.retryCount,
      })),
    }));

    return c.json({
      message: "Posts retrieved successfully",
      payload: { posts },
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error retrieving posts", {
      module: "posts",
      action: "getPostsHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Internal Server Error" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};

// 2. Get Post Details By ID
export const getPostByIdRoute = createRoute({
  method: "get",
  middleware: [enforceUserMiddleware],
  path: "/v1/posts/:id",
  tags: ["Posts"],
  summary: "Get post details by ID",
  description:
    "Retrieves complete post details, attached media, and per-destination dispatch audit logs",
  request: {
    params: z.object({
      id: z.string().uuid().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
    }),
  },
  responses: {
    200: {
      description: "Post retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              post: z.object({
                id: z.string().uuid(),
                title: z.string().nullable(),
                content: z.string(),
                tags: z.array(z.string()),
                linkUrl: z.string().nullable(),
                status: z.nativeEnum(PostStatusEnum),
                timingStrategy: z.nativeEnum(TimingStrategyEnum),
                scheduledAt: z.string().nullable(),
                publishedAt: z.string().nullable(),
                dispatches: z.array(z.record(z.string(), z.unknown())),
              }),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type GetPostByIdRoute = typeof getPostByIdRoute;

export const getPostByIdHandler: AppRouteHandler<GetPostByIdRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("user");

  try {
    const post = await PostsRepository.findById(id);

    if (!post || post.userId !== user.id) {
      throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
        res: c.json({ message: "Post not found" }, StatusCodes.HTTP_404_NOT_FOUND),
      });
    }

    return c.json({
      message: "Post retrieved successfully",
      payload: {
        post: {
          id: post.id,
          title: post.title,
          content: post.content,
          tags: post.tags,
          linkUrl: post.linkUrl,
          status: post.status as PostStatusEnum,
          timingStrategy: post.timingStrategy as TimingStrategyEnum,
          scheduledAt: post.scheduledAt ? post.scheduledAt.toISOString() : null,
          publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
          dispatches: post.dispatches as unknown as Record<string, unknown>[],
        },
      },
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error retrieving post by id", {
      module: "posts",
      action: "getPostByIdHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Internal Server Error" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};
