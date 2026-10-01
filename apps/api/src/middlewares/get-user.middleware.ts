import { logger, verifyJwt } from "@repo/shared";
import { type MiddlewareHandler } from "hono";
import { env } from "@/env";
import { SessionService, UsersService } from "@repo/db";
import { getCookie } from "hono/cookie";
import { type AppBindings } from "../types";

/**
 * Extract user from access token and attach to context.
 * Non-blocking: invalid/expired/malformed tokens are safely ignored on public routes.
 */
export const getUserMiddleware: MiddlewareHandler<AppBindings> = async (c, next) => {
  try {
    const authHeader = c.req.header("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : undefined;

    const cookieToken = getCookie(c, "access_token");
    const rawToken = cookieToken || (bearerToken && bearerToken !== "" ? bearerToken : null);

    // Basic JWT format check (must be string with 3 parts separated by dots)
    const isValidJwtFormat = typeof rawToken === "string" && rawToken.split(".").length === 3;

    if (isValidJwtFormat && rawToken) {
      try {
        const decodedToken = verifyJwt<{ userId: string; sessionId: string }>(
          rawToken,
          env.JWT_SECRET,
        );

        if (decodedToken && decodedToken.userId && decodedToken.sessionId) {
          const session = await SessionService.findById(decodedToken.sessionId);
          const user = await UsersService.findById(decodedToken.userId);

          if (user) {
            c.set("user", user);
          }
          if (session) {
            c.set("session", session);
          }
        }
      } catch {
        // Stale or invalid JWT - do not block public requests or throw 500
      }
    }

    return next();
  } catch (err) {
    
    logger.error("Error in getUserMiddleware:", {
      action: "getUserMiddleware",
      error: err,
      module: "users",
    });

    return next();
  }
};
