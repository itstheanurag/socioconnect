import { createRoute, z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";
import { errorResponseSchemas, logger } from "@repo/shared";
import {
  AccountsRepository,
  DispatchStatusEnum,
  PostsRepository,
  PostStatusEnum,
  SocialPlatformEnum,
} from "@repo/db";
import type { AppRouteHandler } from "@/types";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import { isAccountAllowed } from "@/utils/authz";
import { recordAuditEvent } from "@/utils/events";
import { resolveWorkspaceId } from "@/utils/workspace";
import { WebhookService } from "@/modules/webhooks/webhooks.service";

const targetSchema = z.object({
  accountId: z.uuid(),
  platform: z.enum(SocialPlatformEnum),
  destinationId: z.uuid().optional(),
  scheduledFor: z.string().datetime().optional(),
  customContent: z.string().optional(),
  customTitle: z.string().optional(),
  platformOptions: z.record(z.string(), z.unknown()).optional(),
});

const editableStatuses = new Set([PostStatusEnum.DRAFT, PostStatusEnum.SCHEDULED]);

export const updatePostRoute = createRoute({
  method: "patch",
  middleware: [enforceUserMiddleware],
  path: "/v1/posts/{id}",
  tags: ["Posts"],
  summary: "Update a draft or scheduled post",
  description:
    "Updates post content and, for drafts, replaces destination targets. Published or dispatching posts cannot be edited.",
  request: {
    params: z.object({ id: z.uuid() }),
    body: {
      content: {
        "application/json": {
          schema: z
            .object({
              title: z.string().nullable().optional(),
              content: z.string().min(1).optional(),
              tags: z.array(z.string()).optional(),
              linkUrl: z.url().nullable().optional(),
              mediaIds: z.array(z.uuid()).optional(),
              targets: z.array(targetSchema).optional(),
            })
            .refine((value) => Object.values(value).some((item) => item !== undefined), {
              message: "At least one field must be provided",
            }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Post updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              postId: z.uuid(),
              status: z.enum(PostStatusEnum),
              updatedAt: z.string(),
              dispatchesCount: z.number(),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type UpdatePostRoute = typeof updatePostRoute;

export const updatePostHandler: AppRouteHandler<UpdatePostRoute> = async (c) => {
  const user = c.get("user");
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");

  try {
    const workspaceId = await resolveWorkspaceId(user.id, c.var.auth);
    const post = await PostsRepository.findById(id);

    if (
      !post ||
      post.userId !== user.id ||
      (post.workspaceId && post.workspaceId !== workspaceId)
    ) {
      throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
        res: c.json({ message: "Post not found" }, StatusCodes.HTTP_404_NOT_FOUND),
      });
    }

    if (!editableStatuses.has(post.status)) {
      throw new HTTPException(StatusCodes.HTTP_409_CONFLICT, {
        res: c.json(
          {
            message: `Post cannot be edited from status '${post.status}'`,
            code: "POST_NOT_EDITABLE",
          },
          StatusCodes.HTTP_409_CONFLICT,
        ),
      });
    }

    if (body.targets !== undefined && post.status !== PostStatusEnum.DRAFT) {
      throw new HTTPException(StatusCodes.HTTP_409_CONFLICT, {
        res: c.json(
          {
            message: "Targets can only be replaced while the post is a draft",
            code: "TARGETS_REQUIRE_DRAFT",
          },
          StatusCodes.HTTP_409_CONFLICT,
        ),
      });
    }

    let targets:
      | Array<{
          accountId: string;
          destinationId?: string;
          platform: SocialPlatformEnum;
          status: DispatchStatusEnum;
          scheduledFor: Date;
          customContent: string | null;
          customTitle: string | null;
          platformOptions: Record<string, unknown>;
          retryCount: number;
          maxRetries: number;
        }>
      | undefined;

    if (body.targets !== undefined) {
      targets = [];

      for (const target of body.targets) {
        const account = await AccountsRepository.findById(target.accountId);

        if (
          !account ||
          account.userId !== user.id ||
          (account.workspaceId && account.workspaceId !== workspaceId) ||
          !isAccountAllowed(c.var.auth, account.id)
        ) {
          throw new HTTPException(StatusCodes.HTTP_403_FORBIDDEN, {
            res: c.json(
              {
                message: "One or more target accounts are not allowed",
                code: "ACCOUNT_NOT_ALLOWED",
                accountId: target.accountId,
              },
              StatusCodes.HTTP_403_FORBIDDEN,
            ),
          });
        }

        if (account.platform !== target.platform) {
          throw new HTTPException(StatusCodes.HTTP_400_BAD_REQUEST, {
            res: c.json(
              {
                message: `Target platform does not match account platform '${account.platform}'`,
                code: "PLATFORM_MISMATCH",
                accountId: target.accountId,
              },
              StatusCodes.HTTP_400_BAD_REQUEST,
            ),
          });
        }

        targets.push({
          accountId: target.accountId,
          destinationId: target.destinationId,
          platform: target.platform,
          status: DispatchStatusEnum.DRAFT,
          scheduledFor: target.scheduledFor
            ? new Date(target.scheduledFor)
            : (post.scheduledAt ?? new Date()),
          customContent: target.customContent ?? null,
          customTitle: target.customTitle ?? null,
          platformOptions: target.platformOptions ?? {},
          retryCount: 0,
          maxRetries: 3,
        });
      }
    }

    const updated = await PostsRepository.updateDraft(id, {
      title: body.title,
      content: body.content,
      tags: body.tags,
      linkUrl: body.linkUrl,
      mediaIds: body.mediaIds,
      targets,
    });

    await recordAuditEvent(c, {
      action: "post.updated",
      resourceType: "post",
      resourceId: updated.post.id,
      metadata: {
        status: updated.post.status,
        dispatches: updated.dispatches.length,
        replacedTargets: body.targets !== undefined,
      },
    });
    await WebhookService.emit(workspaceId, "post.updated", {
      postId: updated.post.id,
      status: updated.post.status,
      dispatches: updated.dispatches.length,
      replacedTargets: body.targets !== undefined,
    });

    return c.json({
      message: "Post updated successfully",
      payload: {
        postId: updated.post.id,
        status: updated.post.status as PostStatusEnum,
        updatedAt: updated.post.updatedAt.toISOString(),
        dispatchesCount: updated.dispatches.length,
      },
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error updating post", {
      module: "posts",
      action: "updatePostHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Failed to update post" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};

export const cancelPostRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/posts/{id}/cancel",
  tags: ["Posts"],
  summary: "Cancel a draft or scheduled post",
  description:
    "Cancels a draft or scheduled post and all of its future dispatches. Dispatching and published posts cannot be cancelled.",
  request: {
    params: z.object({ id: z.uuid() }),
  },
  responses: {
    200: {
      description: "Post cancelled successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              postId: z.uuid(),
              status: z.enum(PostStatusEnum),
              cancelledAt: z.string(),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type CancelPostRoute = typeof cancelPostRoute;

export const cancelPostHandler: AppRouteHandler<CancelPostRoute> = async (c) => {
  const user = c.get("user");
  const { id } = c.req.valid("param");

  try {
    const workspaceId = await resolveWorkspaceId(user.id, c.var.auth);
    const post = await PostsRepository.findById(id);

    if (
      !post ||
      post.userId !== user.id ||
      (post.workspaceId && post.workspaceId !== workspaceId)
    ) {
      throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
        res: c.json({ message: "Post not found" }, StatusCodes.HTTP_404_NOT_FOUND),
      });
    }

    if (!editableStatuses.has(post.status)) {
      throw new HTTPException(StatusCodes.HTTP_409_CONFLICT, {
        res: c.json(
          {
            message: `Post cannot be cancelled from status '${post.status}'`,
            code: "POST_NOT_CANCELLABLE",
          },
          StatusCodes.HTTP_409_CONFLICT,
        ),
      });
    }

    const cancelled = await PostsRepository.cancelPost(id);

    await recordAuditEvent(c, {
      action: "post.cancelled",
      resourceType: "post",
      resourceId: cancelled.id,
      metadata: { previousStatus: post.status },
    });
    await WebhookService.emit(workspaceId, "post.cancelled", {
      postId: cancelled.id,
      previousStatus: post.status,
      status: cancelled.status,
    });

    return c.json({
      message: "Post cancelled successfully",
      payload: {
        postId: cancelled.id,
        status: cancelled.status as PostStatusEnum,
        cancelledAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error cancelling post", {
      module: "posts",
      action: "cancelPostHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Failed to cancel post" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};
