import { createRoute, z } from "@hono/zod-openapi";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import { AccountsRepository, ConnectedAccountStatus, SocialPlatformEnum } from "@repo/db";
import { errorResponseSchemas, logger } from "@repo/shared";
import type { AppRouteHandler } from "@/types";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";

export const getAccountsRoute = createRoute({
  method: "get",
  middleware: [enforceUserMiddleware],
  path: "/v1/accounts",
  tags: ["Accounts"],
  summary: "List connected social accounts",
  description: "Retrieves all active social media connections for the authenticated creator",
  responses: {
    200: {
      description: "Successfully retrieved connected accounts",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string().openapi({ example: "Accounts retrieved successfully" }),
            payload: z.object({
              accounts: z.array(
                z.object({
                  id: z.string().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
                  platform: z.nativeEnum(SocialPlatformEnum).openapi({ example: SocialPlatformEnum.YOUTUBE }),
                  platformAccountId: z.string().openapi({ example: "UC_x5XG1OV2P6uZZ5FSM9Ttw" }),
                  username: z.string().openapi({ example: "@creators_studio" }),
                  displayName: z.string().nullable().openapi({ example: "Creator Studio" }),
                  avatarUrl: z.string().nullable().openapi({ example: "https://example.com/avatar.jpg" }),
                  profileUrl: z.string().nullable().openapi({ example: "https://youtube.com/@creators_studio" }),
                  status: z.nativeEnum(ConnectedAccountStatus).openapi({ example: ConnectedAccountStatus.ACTIVE }),
                  scopes: z.array(z.string()).openapi({ example: ["https://www.googleapis.com/auth/youtube.upload"] }),
                  lastHealthCheckAt: z.string().nullable().openapi({ example: "2026-09-21T12:00:00.000Z" }),
                  lastHealthStatus: z.string().nullable().openapi({ example: "200_OK" }),
                  createdAt: z.string().openapi({ example: "2026-09-21T10:00:00.000Z" }),
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

export type GetAccountsRoute = typeof getAccountsRoute;

export const getAccountsHandler: AppRouteHandler<GetAccountsRoute> = async (c) => {
  const user = c.get("user");

  try {
    const rawAccounts = await AccountsRepository.findAllByUserId(user.id);

    const accounts = rawAccounts.map((a) => ({
      id: a.id,
      platform: a.platform as SocialPlatformEnum,
      platformAccountId: a.platformAccountId,
      username: a.username,
      displayName: a.displayName,
      avatarUrl: a.avatarUrl,
      profileUrl: a.profileUrl,
      status: a.status as ConnectedAccountStatus,
      scopes: a.scopes,
      lastHealthCheckAt: a.lastHealthCheckAt ? a.lastHealthCheckAt.toISOString() : null,
      lastHealthStatus: a.lastHealthStatus,
      createdAt: a.createdAt.toISOString(),
    }));

    return c.json({
      message: "Accounts retrieved successfully",
      payload: { accounts },
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error fetching connected accounts", {
      module: "accounts",
      action: "getAccountsHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Internal Server Error" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};
