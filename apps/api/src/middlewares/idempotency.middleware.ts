import { createHash } from "node:crypto";
import { type MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";
import { IdempotencyRepository, WorkspacesRepository } from "@repo/db";
import { logger } from "@repo/shared";
import { type AppBindings } from "../types";

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHED_BODY_BYTES = 1024 * 1024;

const PUBLIC_PATHS = new Set([
  "/health",
  "/metrics",
  "/docs",
  "/docs-json",
  "/v1/subscriptions/plans",
  "/v1/subscriptions/webhook",
]);

const PUBLIC_PREFIXES = ["/v1/oauth/", "/v1/accounts/oauth/", "/v1/bots/telegram/"];

function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.has(path) || PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function requestHash(method: string, path: string, body: string): string {
  return createHash("sha256").update(`${method}\n${path}\n${body}`).digest("hex");
}

/**
 * Caches successful write responses by `Idempotency-Key` and replays them on
 * retry. API-key writes must supply a key; browser-session writes may opt in.
 */
export const idempotencyMiddleware: MiddlewareHandler<AppBindings> = async (c, next) => {
  const method = c.req.method.toUpperCase();
  const path = c.req.path;

  if (!WRITE_METHODS.has(method) || isPublicPath(path)) {
    return next();
  }

  const auth = c.var.auth;
  const user = c.var.user;
  if (!auth || !user) {
    return next();
  }

  const idempotencyKey = c.req.header("Idempotency-Key");

  if (!idempotencyKey) {
    if (auth.type === "api_key") {
      throw new HTTPException(StatusCodes.HTTP_400_BAD_REQUEST, {
        res: c.json(
          {
            message: "API-key writes require an Idempotency-Key header",
            code: "IDEMPOTENCY_KEY_REQUIRED",
          },
          StatusCodes.HTTP_400_BAD_REQUEST,
        ),
      });
    }

    return next();
  }

  if (!/^[A-Za-z0-9._:-]{1,255}$/.test(idempotencyKey)) {
    throw new HTTPException(StatusCodes.HTTP_400_BAD_REQUEST, {
      res: c.json(
        {
          message:
            "Idempotency-Key must be 1-255 characters of letters, numbers, '.', '_', ':' or '-'",
          code: "INVALID_IDEMPOTENCY_KEY",
        },
        StatusCodes.HTTP_400_BAD_REQUEST,
      ),
    });
  }

  const workspaceId =
    auth.workspaceId ?? (await WorkspacesRepository.ensurePersonalWorkspace(user.id)).id;

  const body = await c.req.raw.clone().text();
  const endpoint = `${method} ${path}`;
  const hash = requestHash(method, path, body);

  const claim = await IdempotencyRepository.begin({
    workspaceId,
    key: idempotencyKey,
    endpoint,
    requestHash: hash,
    ttlMs: TTL_MS,
  });

  if (claim.status === "replay") {
    return c.body(claim.record.responseBody ?? "", claim.record.responseStatus as 200, {
      "content-type": "application/json",
      "Idempotent-Replayed": "true",
    });
  }

  if (claim.status === "conflict") {
    throw new HTTPException(StatusCodes.HTTP_409_CONFLICT, {
      res: c.json(
        {
          message: "This Idempotency-Key was already used with a different request body",
          code: "IDEMPOTENCY_CONFLICT",
        },
        StatusCodes.HTTP_409_CONFLICT,
      ),
    });
  }

  if (claim.status === "in_progress") {
    throw new HTTPException(StatusCodes.HTTP_409_CONFLICT, {
      res: c.json(
        {
          message: "A request with this Idempotency-Key is already in progress",
          code: "IDEMPOTENCY_IN_PROGRESS",
        },
        StatusCodes.HTTP_409_CONFLICT,
      ),
    });
  }

  try {
    await next();
  } catch (err) {
    await IdempotencyRepository.release(claim.record.id);
    throw err;
  }

  const status = c.res.status;

  if (status >= 500) {
    await IdempotencyRepository.release(claim.record.id);
    return;
  }

  try {
    const responseBody = await c.res.clone().text();
    const size = Buffer.byteLength(responseBody, "utf8");

    if (size > MAX_CACHED_BODY_BYTES) {
      await IdempotencyRepository.release(claim.record.id);
      return;
    }

    await IdempotencyRepository.complete(claim.record.id, status, responseBody);
  } catch (err) {
    logger.error("failed to cache idempotent response", {
      module: "api-keys",
      action: "middleware:idempotency",
      error: err,
      idempotencyKey,
    });
    await IdempotencyRepository.release(claim.record.id);
  }
};
