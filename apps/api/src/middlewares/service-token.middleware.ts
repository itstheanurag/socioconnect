import { type MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";
import { verifyServiceToken } from "@repo/shared";
import { UsersRepository, WorkspacesRepository } from "@repo/db";
import { env } from "@/env";
import { type AppBindings } from "../types";

/**
 * Accepts short-lived service tokens minted by the MCP gateway.
 *
 * This is an internal token exchange: the MCP server verifies the user's OAuth
 * token, then mints a token addressed to this API. The original OAuth token is
 * never forwarded.
 */
export const serviceTokenMiddleware: MiddlewareHandler<AppBindings> = async (c, next) => {
  const authorization = c.req.header("Authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : undefined;

  if (!token || token.startsWith("sck_")) {
    return next();
  }

  const secret = env.SERVICE_TOKEN_SECRET || env.JWT_SECRET;
  const claims = verifyServiceToken(token, secret);

  if (!claims) {
    return next();
  }

  const [user, workspace] = await Promise.all([
    UsersRepository.findById(claims.sub),
    WorkspacesRepository.findById(claims.workspace_id),
  ]);

  if (!user || !workspace) {
    throw new HTTPException(StatusCodes.HTTP_401_UNAUTHORIZED, {
      res: c.json(
        { message: "Service token is no longer valid" },
        StatusCodes.HTTP_401_UNAUTHORIZED,
      ),
    });
  }

  c.set("user", user);
  c.set("auth", {
    type: "oauth",
    scopes: claims.scope ? claims.scope.split(" ").filter(Boolean) : [],
    workspaceId: claims.workspace_id,
    oauthClientId: claims.client_id,
  });

  return next();
};
