import { createRoute, z } from "@hono/zod-openapi";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import { AccountsRepository } from "@repo/db";
import { errorResponseSchemas, logger } from "@repo/shared";
import type { AppRouteHandler } from "@/types";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";

export const deleteAccountRoute = createRoute({
  method: "delete",
  middleware: [enforceUserMiddleware],
  path: "/v1/accounts/:id",
  tags: ["Accounts"],
  summary: "Disconnect social account",
  description: "Revokes and disconnects a social media account",
  request: {
    params: z.object({
      id: z.string().uuid().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
    }),
  },
  responses: {
    200: {
      description: "Account disconnected successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string().openapi({ example: "Account disconnected successfully" }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type DeleteAccountRoute = typeof deleteAccountRoute;

export const deleteAccountHandler: AppRouteHandler<DeleteAccountRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("user");

  try {
    const success = await AccountsRepository.disconnect(id, user.id);

    if (!success) {
      throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
        res: c.json(
          { message: "Account not found or already disconnected" },
          StatusCodes.HTTP_404_NOT_FOUND,
        ),
      });
    }

    return c.json({
      message: "Account disconnected successfully",
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error disconnecting account", {
      module: "accounts",
      action: "deleteAccountHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Internal Server Error" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};
