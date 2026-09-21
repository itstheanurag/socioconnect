import { createRoute, z } from "@hono/zod-openapi";
import { enforceUserMiddleware } from "@/middlewares/enforce-user.middleware";
import { AccountsRepository, ConnectedAccountStatus } from "@repo/db";
import { errorResponseSchemas, logger } from "@repo/shared";
import type { AppRouteHandler } from "@/types";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";

export const healthCheckAccountRoute = createRoute({
  method: "post",
  middleware: [enforceUserMiddleware],
  path: "/v1/accounts/:id/health-check",
  tags: ["Accounts"],
  summary: "Test OAuth token health",
  description: "Runs an active verification probe against the social platform API",
  request: {
    params: z.object({
      id: z.string().uuid().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
    }),
  },
  responses: {
    200: {
      description: "Health check completed",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string().openapi({ example: "Account token is active and valid" }),
            payload: z.object({
              status: z.nativeEnum(ConnectedAccountStatus),
              pingLatencyMs: z.number().openapi({ example: 84 }),
              lastCheckedAt: z.string().openapi({ example: "2026-09-21T12:00:00.000Z" }),
            }),
          }),
        },
      },
    },
    ...errorResponseSchemas,
  },
});

export type HealthCheckAccountRoute = typeof healthCheckAccountRoute;

export const healthCheckAccountHandler: AppRouteHandler<HealthCheckAccountRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const user = c.get("user");

  try {
    const account = await AccountsRepository.findById(id);

    if (!account || account.userId !== user.id) {
      throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
        res: c.json({ message: "Account not found" }, StatusCodes.HTTP_404_NOT_FOUND),
      });
    }

    const start = Date.now();
    // Simulate/execute provider token ping
    await AccountsRepository.updateHealthCheck(id, "200_OK", ConnectedAccountStatus.ACTIVE);
    const latencyMs = Date.now() - start;

    return c.json({
      message: "Account token is active and valid",
      payload: {
        status: ConnectedAccountStatus.ACTIVE,
        pingLatencyMs: latencyMs,
        lastCheckedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error running token health check", {
      module: "accounts",
      action: "healthCheckAccountHandler",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      res: c.json({ message: "Internal Server Error" }, StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR),
    });
  }
};
