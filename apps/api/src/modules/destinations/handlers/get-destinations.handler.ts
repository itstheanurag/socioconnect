import { createRoute, z } from "@hono/zod-openapi";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import {
  DestinationsRepository,
  AccountsRepository,
  DestinationTypeEnum,
  SocialPlatformEnum,
} from "@repo/db";
import { errorResponseSchemas, logger } from "@repo/shared";
import type { AppRouteHandler } from "@/types";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";

// 1. Get Destinations for a Specific Account
export const getAccountDestinationsRoute = createRoute({
  method: "get",
  middleware: [enforceUserMiddleware],
  path: "/v1/accounts/:accountId/destinations",
  tags: ["Destinations"],
  summary: "List target destinations for a connected account",
  description:
    "Retrieves all subreddits, Discord channels, Facebook groups/pages, LinkedIn organizations, or Pinterest boards",
  request: {
    params: z.object({
      accountId: z.string().uuid().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
    }),
  },
  responses: {
    200: {
      description: "Destinations retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string().openapi({ example: "Destinations retrieved successfully" }),
            payload: z.object({
              destinations: z.array(
                z.object({
                  id: z.string().openapi({ example: "dest_uuid_123" }),
                  externalId: z.string().openapi({ example: "r/webdev" }),
                  platform: z.nativeEnum(SocialPlatformEnum),
                  type: z.nativeEnum(DestinationTypeEnum),
                  name: z.string().openapi({ example: "r/webdev" }),
                  description: z.string().nullable(),
                  avatarUrl: z.string().nullable(),
                  parentContainerName: z.string().nullable(),
                  memberCount: z.number().nullable(),
                  canPost: z.boolean(),
                  isDefault: z.boolean(),
                  requirements: z.record(z.string(), z.unknown()).optional(),
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

export type GetAccountDestinationsRoute = typeof getAccountDestinationsRoute;

export const getAccountDestinationsHandler: AppRouteHandler<GetAccountDestinationsRoute> = async (
  c,
) => {
  const { accountId } = c.req.valid("param");
  const user = c.get("user");

  try {
    const account = await AccountsRepository.findById(accountId);
    if (!account || account.userId !== user.id) {
      throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
        res: c.json({ message: "Account not found" }, StatusCodes.HTTP_404_NOT_FOUND),
      });
    }

    const rawDestinations = await DestinationsRepository.findAllByAccountId(accountId);

    const destinations = rawDestinations.map((d) => ({
      id: d.id,
      externalId: d.externalId,
      platform: d.platform as SocialPlatformEnum,
      type: d.type as DestinationTypeEnum,
      name: d.name,
      description: d.description,
      avatarUrl: d.avatarUrl,
      parentContainerName: d.parentContainerName,
      memberCount: d.memberCount,
      canPost: d.canPost,
      isDefault: d.isDefault,
      requirements: (d.requirements as Record<string, unknown>) || {},
    }));

    return c.json({
      message: "Destinations retrieved successfully",
      payload: { destinations },
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error retrieving account destinations", {
      module: "destinations",
      action: "getAccountDestinationsHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Internal Server Error" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};

// 2. Get All Destinations Across All User Accounts
export const getAllUserDestinationsRoute = createRoute({
  method: "get",
  middleware: [enforceUserMiddleware],
  path: "/v1/destinations",
  tags: ["Destinations"],
  summary: "List all publishable destinations",
  description:
    "Retrieves all communities, subreddits, Discord channels, and groups available across all connected accounts",
  responses: {
    200: {
      description: "All destinations retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            payload: z.object({
              destinations: z.array(
                z.object({
                  id: z.string(),
                  accountId: z.string(),
                  externalId: z.string(),
                  platform: z.nativeEnum(SocialPlatformEnum),
                  type: z.nativeEnum(DestinationTypeEnum),
                  name: z.string(),
                  parentContainerName: z.string().nullable(),
                  canPost: z.boolean(),
                  isDefault: z.boolean(),
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

export type GetAllUserDestinationsRoute = typeof getAllUserDestinationsRoute;

export const getAllUserDestinationsHandler: AppRouteHandler<GetAllUserDestinationsRoute> = async (
  c,
) => {
  const user = c.get("user");

  try {
    const rawDestinations = await DestinationsRepository.findAllByUserId(user.id);

    const destinations = rawDestinations.map((d) => ({
      id: d.id,
      accountId: d.accountId,
      externalId: d.externalId,
      platform: d.platform as SocialPlatformEnum,
      type: d.type as DestinationTypeEnum,
      name: d.name,
      parentContainerName: d.parentContainerName,
      canPost: d.canPost,
      isDefault: d.isDefault,
    }));

    return c.json({
      message: "All destinations retrieved successfully",
      payload: { destinations },
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error retrieving user destinations", {
      module: "destinations",
      action: "getAllUserDestinationsHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Internal Server Error" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};
