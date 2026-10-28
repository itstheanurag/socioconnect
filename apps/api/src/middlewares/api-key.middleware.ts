import { type MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";
import { ApiKeysRepository, UsersRepository, WorkspacesRepository } from "@repo/db";
import { logger } from "@repo/shared";
import { type AppBindings } from "../types";
import { verifyApiKey } from "@/modules/api-keys/api-keys.service";

/**
 * Resolves `Authorization: Bearer sck_...` API keys and attaches the user,
 * workspace, and scopes to the request context.
 *
 * Must run after `getUserMiddleware`. Cookie/JWT requests pass through untouched.
 */
export const apiKeyMiddleware: MiddlewareHandler<AppBindings> = async (c, next) => {
  const authorization = c.req.header("Authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : undefined;

  if (!token?.startsWith("sck_")) {
    return next();
  }

  try {
    const apiKey = await verifyApiKey(token);
    if (!apiKey) {
      throw new HTTPException(StatusCodes.HTTP_401_UNAUTHORIZED, {
        res: c.json({ message: "Invalid or expired API key" }, StatusCodes.HTTP_401_UNAUTHORIZED),
      });
    }

    const [user, workspace] = await Promise.all([
      UsersRepository.findById(apiKey.createdByUserId),
      WorkspacesRepository.findById(apiKey.workspaceId),
    ]);

    if (!user || !workspace) {
      throw new HTTPException(StatusCodes.HTTP_401_UNAUTHORIZED, {
        res: c.json(
          { message: "API key owner or workspace no longer exists" },
          StatusCodes.HTTP_401_UNAUTHORIZED,
        ),
      });
    }

    c.set("user", user);
    c.set("auth", {
      type: "api_key",
      scopes: apiKey.scopes,
      workspaceId: apiKey.workspaceId,
      apiKeyId: apiKey.id,
      accountIds: apiKey.accountIds,
      rateLimitPerMinute: apiKey.rateLimitPerMinute,
    });

    await ApiKeysRepository.touchLastUsed(apiKey.id);

    return next();
  } catch (err) {
    if (err instanceof HTTPException) throw err;

    logger.error("Error resolving API key", {
      module: "api-keys",
      action: "middleware:resolve",
      error: err,
    });

    throw new HTTPException(StatusCodes.HTTP_401_UNAUTHORIZED, {
      res: c.json({ message: "Invalid API key" }, StatusCodes.HTTP_401_UNAUTHORIZED),
    });
  }
};
