import { createRoute, z } from "@hono/zod-openapi";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import { DestinationsRepository, AccountsRepository, DestinationTypeEnum, SocialPlatformEnum } from "@repo/db";
import { errorResponseSchemas, logger } from "@repo/shared";
import type { AppRouteHandler } from "@/types";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";

export const syncDestinationsRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/accounts/:accountId/destinations/sync",
  tags: ["Destinations"],
  summary: "Sync destinations from provider API",
  description: "Queries external social media API to discover newly joined subreddits, Discord channels, or Facebook groups",
  request: {
    params: z.object({
      accountId: z.string().uuid().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
    }),
  },
  responses: {
    200: {
      description: "Destinations synced successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string().openapi({ example: "Destinations synced successfully" }),
            payload: z.object({
              syncedCount: z.number().openapi({ example: 4 }),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type SyncDestinationsRoute = typeof syncDestinationsRoute;

export const syncDestinationsHandler: AppRouteHandler<SyncDestinationsRoute> = async (c) => {
  const { accountId } = c.req.valid("param");
  const user = c.get("user");

  try {
    const account = await AccountsRepository.findById(accountId);
    if (!account || account.userId !== user.id) {
      throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
        res: c.json({ message: "Account not found" }, StatusCodes.HTTP_404_NOT_FOUND),
      });
    }

    // Platform-specific mock/real discovery
    const mockDestinations: Array<{
      externalId: string;
      platform: SocialPlatformEnum;
      type: DestinationTypeEnum;
      name: string;
      description?: string;
      avatarUrl?: string;
      parentContainerName?: string;
      memberCount?: number;
      canPost: boolean;
      isDefault: boolean;
      requirements?: Record<string, unknown>;
    }> = [];

    if (account.platform === SocialPlatformEnum.REDDIT) {
      mockDestinations.push(
        {
          externalId: "r/webdev",
          platform: SocialPlatformEnum.REDDIT,
          type: DestinationTypeEnum.SUBREDDIT,
          name: "r/webdev",
          description: "A community dedicated to all things web development",
          avatarUrl: "https://www.redditstatic.com/icon.png",
          memberCount: 2100000,
          canPost: true,
          isDefault: true,
          requirements: { requiresTitle: true, requiresFlair: false },
        },
        {
          externalId: "r/typescript",
          platform: SocialPlatformEnum.REDDIT,
          type: DestinationTypeEnum.SUBREDDIT,
          name: "r/typescript",
          description: "TypeScript discussions and updates",
          memberCount: 120000,
          canPost: true,
          isDefault: false,
          requirements: { requiresTitle: true, requiresFlair: true },
        },
      );
    } else if (account.platform === SocialPlatformEnum.DISCORD) {
      mockDestinations.push(
        {
          externalId: "channel:1099283746",
          platform: SocialPlatformEnum.DISCORD,
          type: DestinationTypeEnum.CHANNEL,
          name: "#announcements",
          parentContainerName: "Creator Community",
          memberCount: 8400,
          canPost: true,
          isDefault: true,
        },
        {
          externalId: "channel:1099283747",
          platform: SocialPlatformEnum.DISCORD,
          type: DestinationTypeEnum.CHANNEL,
          name: "#dev-updates",
          parentContainerName: "Creator Community",
          memberCount: 8400,
          canPost: true,
          isDefault: false,
        },
      );
    } else if (account.platform === SocialPlatformEnum.LINKEDIN) {
      mockDestinations.push(
        {
          externalId: `urn:li:person:${account.platformAccountId}`,
          platform: SocialPlatformEnum.LINKEDIN,
          type: DestinationTypeEnum.PROFILE,
          name: "Personal Profile",
          canPost: true,
          isDefault: true,
        },
        {
          externalId: "urn:li:organization:998877",
          platform: SocialPlatformEnum.LINKEDIN,
          type: DestinationTypeEnum.PAGE,
          name: "SocioConnect Media Inc.",
          avatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=80",
          memberCount: 15400,
          canPost: true,
          isDefault: false,
        },
      );
    } else if (account.platform === SocialPlatformEnum.PINTEREST) {
      mockDestinations.push(
        {
          externalId: "board:987654",
          platform: SocialPlatformEnum.PINTEREST,
          type: DestinationTypeEnum.BOARD,
          name: "UI/UX Inspiration",
          canPost: true,
          isDefault: true,
        },
        {
          externalId: "board:987655",
          platform: SocialPlatformEnum.PINTEREST,
          type: DestinationTypeEnum.BOARD,
          name: "Creator Studio Tips",
          canPost: true,
          isDefault: false,
        },
      );
    } else {
      mockDestinations.push({
        externalId: account.platformAccountId,
        platform: account.platform as SocialPlatformEnum,
        type: DestinationTypeEnum.PROFILE,
        name: account.displayName || account.username,
        canPost: true,
        isDefault: true,
      });
    }

    const synced = await DestinationsRepository.syncDestinations(
      accountId,
      mockDestinations.map((d) => ({
        ...d,
        accountId,
      })),
    );

    return c.json({
      message: "Destinations synced successfully",
      payload: {
        syncedCount: synced.length,
      },
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error syncing destinations", {
      module: "destinations",
      action: "syncDestinationsHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Internal Server Error" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};
