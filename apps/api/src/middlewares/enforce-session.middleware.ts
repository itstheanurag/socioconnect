import { type MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";
import { type AppBindings } from "../types";

/**
 * API keys must never be able to mint or revoke other API keys, or change
 * billing. Sensitive account-management routes require a browser session.
 */
export const enforceSessionMiddleware: MiddlewareHandler<AppBindings> = async (c, next) => {
  if (c.var.auth?.type !== "session") {
    throw new HTTPException(StatusCodes.HTTP_403_FORBIDDEN, {
      res: c.json(
        {
          message: "This endpoint requires a signed-in browser session",
          code: "SESSION_REQUIRED",
        },
        StatusCodes.HTTP_403_FORBIDDEN,
      ),
    });
  }

  await next();
};
