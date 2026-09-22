import { createRoute, z } from "@hono/zod-openapi";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import {
  CommunitiesRepository,
  SocialPlatformEnum,
  type NewCommunityGroup,
} from "@repo/db";
import { errorResponseSchemas, logger } from "@repo/shared";
import type { AppRouteHandler } from "@/types";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";

// 1. List Community Groups
export const getCommunityGroupsRoute = createRoute({
  method: "get",
  middleware: [enforceUserMiddleware],
  path: "/v1/communities/groups",
  tags: ["Communities"],
  summary: "List user community groups",
  description: "Retrieves clustered subreddits, discord channels, or platform groups with linked automation status",
  responses: {
    200: {
      description: "Community groups retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              groups: z.array(
                z.object({
                  id: z.string().uuid(),
                  accountId: z.string().uuid(),
                  platform: z.nativeEnum(SocialPlatformEnum),
                  name: z.string(),
                  description: z.string().nullable(),
                  tags: z.array(z.string()),
                  destinationIds: z.array(z.string()),
                  staggerMinutes: z.number(),
                  isActive: z.boolean(),
                  automationsCount: z.number(),
                  createdAt: z.string(),
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

export type GetCommunityGroupsRoute = typeof getCommunityGroupsRoute;

export const getCommunityGroupsHandler: AppRouteHandler<GetCommunityGroupsRoute> = async (c) => {
  const user = c.get("user");

  try {
    const rawGroups = await CommunitiesRepository.findAllGroupsByUserId(user.id);

    const groups = rawGroups.map((g) => ({
      id: g.id,
      accountId: g.accountId,
      platform: g.platform as SocialPlatformEnum,
      name: g.name,
      description: g.description,
      tags: g.tags,
      destinationIds: g.destinationIds,
      staggerMinutes: g.staggerMinutes,
      isActive: g.isActive,
      automationsCount: g.automations?.length || 0,
      createdAt: g.createdAt.toISOString(),
    }));

    return c.json({
      message: "Community groups retrieved successfully",
      payload: { groups },
    });
  } catch (err) {
    logger.error("Error listing community groups", {
      module: "communities",
      action: "getCommunityGroupsHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Internal Server Error" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};

// 2. Create Community Group
export const createCommunityGroupRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/communities/groups",
  tags: ["Communities"],
  summary: "Create a community cluster group",
  description: "Clusters multiple subreddits, Discord channels, or platform destinations under an anti-spam staggered syndication rule",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            accountId: z.string().uuid(),
            platform: z.nativeEnum(SocialPlatformEnum),
            name: z.string().min(2).max(100),
            description: z.string().max(500).optional(),
            tags: z.array(z.string()).default([]),
            destinationIds: z.array(z.string().uuid()).min(1),
            staggerMinutes: z.number().min(0).max(120).default(5),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Community group created",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              group: z.object({
                id: z.string().uuid(),
                name: z.string(),
                platform: z.nativeEnum(SocialPlatformEnum),
                destinationIds: z.array(z.string()),
                staggerMinutes: z.number(),
              }),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type CreateCommunityGroupRoute = typeof createCommunityGroupRoute;

export const createCommunityGroupHandler: AppRouteHandler<CreateCommunityGroupRoute> = async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  try {
    const group = await CommunitiesRepository.createGroup({
      userId: user.id,
      accountId: body.accountId,
      platform: body.platform,
      name: body.name,
      description: body.description,
      tags: body.tags,
      destinationIds: body.destinationIds,
      staggerMinutes: body.staggerMinutes,
      isActive: true,
    });

    return c.json(
      {
        message: "Community cluster group created successfully",
        payload: {
          group: {
            id: group.id,
            name: group.name,
            platform: group.platform as SocialPlatformEnum,
            destinationIds: group.destinationIds,
            staggerMinutes: group.staggerMinutes,
          },
        },
      },
      StatusCodes.HTTP_201_CREATED,
    );
  } catch (err) {
    logger.error("Error creating community group", {
      module: "communities",
      action: "createCommunityGroupHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Failed to create community group" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};

// 3. Delete Community Group
export const deleteCommunityGroupRoute = createRoute({
  method: "delete",
  middleware: [enforceUserMiddleware],
  path: "/v1/communities/groups/:id",
  tags: ["Communities"],
  summary: "Delete community group",
  description: "Soft deletes a community group and stops active automation schedules",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Community group deleted successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type DeleteCommunityGroupRoute = typeof deleteCommunityGroupRoute;

export const deleteCommunityGroupHandler: AppRouteHandler<DeleteCommunityGroupRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("user");

  try {
    const success = await CommunitiesRepository.deleteGroup(id, user.id);

    if (!success) {
      throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
        res: c.json({ message: "Community group not found" }, StatusCodes.HTTP_404_NOT_FOUND),
      });
    }

    return c.json({
      message: "Community group deleted successfully",
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error deleting community group", {
      module: "communities",
      action: "deleteCommunityGroupHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Internal Server Error" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};
