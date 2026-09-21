import { createRoute, z } from "@hono/zod-openapi";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import {
  PostsRepository,
  QuotasRepository,
  PostStatusEnum,
  TimingStrategyEnum,
  DispatchStatusEnum,
  SocialPlatformEnum,
} from "@repo/db";
import { errorResponseSchemas, logger } from "@repo/shared";
import type { AppRouteHandler } from "@/types";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";

export const createPostRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/posts",
  tags: ["Posts"],
  summary: "Create and dispatch or schedule a post",
  description:
    "Creates a master post and sets up target platform dispatches with optional destination targeting",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            title: z
              .string()
              .optional()
              .openapi({ example: "Deep Dive into Next.js 15 & Turbopack" }),
            content: z
              .string()
              .min(1)
              .openapi({ example: "Here is everything you need to know about Next.js 15..." }),
            tags: z.array(z.string()).optional().default([]),
            linkUrl: z.string().url().optional(),
            mediaIds: z.array(z.string().uuid()).optional().default([]),
            timingStrategy: z
              .nativeEnum(TimingStrategyEnum)
              .optional()
              .default(TimingStrategyEnum.SIMULTANEOUS),
            scheduledAt: z.string().datetime().optional(),
            targets: z
              .array(
                z.object({
                  accountId: z.string().uuid(),
                  platform: z.nativeEnum(SocialPlatformEnum),
                  destinationId: z.string().uuid().optional(), // Optional specific subreddit/channel/page
                  scheduledFor: z.string().datetime().optional(), // Specific staggered peak timing
                  customContent: z.string().optional(),
                  customTitle: z.string().optional(),
                  platformOptions: z.record(z.string(), z.unknown()).optional(),
                }),
              )
              .min(1),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Post created successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string().openapi({ example: "Post created successfully" }),
            payload: z.object({
              postId: z.string().uuid(),
              status: z.nativeEnum(PostStatusEnum),
              scheduledAt: z.string().nullable(),
              dispatchesCount: z.number(),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type CreatePostRoute = typeof createPostRoute;

export const createPostHandler: AppRouteHandler<CreatePostRoute> = async (c) => {
  const body = c.req.valid("json");
  const user = c.get("user");

  try {
    const scheduledDate = body.scheduledAt ? new Date(body.scheduledAt) : null;
    const initialStatus =
      scheduledDate && scheduledDate > new Date()
        ? PostStatusEnum.SCHEDULED
        : PostStatusEnum.DISPATCHING;

    const dispatches = body.targets.map((t) => ({
      accountId: t.accountId,
      destinationId: t.destinationId,
      platform: t.platform,
      status: DispatchStatusEnum.PENDING,
      scheduledFor: t.scheduledFor ? new Date(t.scheduledFor) : scheduledDate || new Date(),
      customContent: t.customContent || null,
      customTitle: t.customTitle || null,
      platformOptions: t.platformOptions || {},
      retryCount: 0,
      maxRetries: 3,
    }));

    const { post, dispatches: createdDispatches } = await PostsRepository.createWithDispatches({
      post: {
        userId: user.id,
        title: body.title || null,
        content: body.content,
        tags: body.tags,
        linkUrl: body.linkUrl || null,
        mediaIds: body.mediaIds,
        status: initialStatus,
        timingStrategy: body.timingStrategy,
        scheduledAt: scheduledDate,
      },
      dispatches,
    });

    // Increment user quota counter
    await QuotasRepository.incrementDrops(user.id, 1);

    return c.json(
      {
        message: "Post created successfully",
        payload: {
          postId: post.id,
          status: post.status as PostStatusEnum,
          scheduledAt: post.scheduledAt ? post.scheduledAt.toISOString() : null,
          dispatchesCount: createdDispatches.length,
        },
      },
      StatusCodes.HTTP_201_CREATED,
    );
  } catch (err) {
    logger.error("Error creating post", {
      module: "posts",
      action: "createPostHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Failed to create post" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};
