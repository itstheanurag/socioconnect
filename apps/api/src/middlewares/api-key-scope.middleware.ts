import { type MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "@repo/config";
import { logger } from "@repo/shared";
import { type AppBindings } from "../types";

interface ScopePolicy {
  method: string | "*";
  pattern: RegExp;
  scope: string;
}

/**
 * Deny-by-default scope map for API-key requests.
 *
 * Session-authenticated requests are not affected. Any route not listed here is
 * unavailable to API keys, including billing changes and OAuth connection setup.
 */
const POLICIES: ScopePolicy[] = [
  { method: "GET", pattern: /^\/v1\/auth\/me$/, scope: "profile:read" },
  { method: "GET", pattern: /^\/v1\/users(?:\/.*)?$/, scope: "profile:read" },
  { method: "GET", pattern: /^\/v1\/workspaces(?:\/.*)?$/, scope: "profile:read" },

  { method: "GET", pattern: /^\/v1\/accounts(?:\/.*)?$/, scope: "accounts:read" },
  { method: "GET", pattern: /^\/v1\/platforms$/, scope: "accounts:read" },
  { method: "DELETE", pattern: /^\/v1\/accounts\/[^/]+$/, scope: "accounts:write" },
  {
    method: "POST",
    pattern: /^\/v1\/accounts\/[^/]+\/health-check$/,
    scope: "accounts:write",
  },
  {
    method: "POST",
    pattern: /^\/v1\/accounts\/[^/]+\/destinations\/sync$/,
    scope: "accounts:read",
  },

  { method: "GET", pattern: /^\/v1\/destinations(?:\/.*)?$/, scope: "accounts:read" },

  { method: "GET", pattern: /^\/v1\/posts(?:\/.*)?$/, scope: "posts:read" },
  { method: "POST", pattern: /^\/v1\/posts(?:\/.*)?$/, scope: "posts:write" },
  { method: "PATCH", pattern: /^\/v1\/posts(?:\/.*)?$/, scope: "posts:write" },
  { method: "PUT", pattern: /^\/v1\/posts(?:\/.*)?$/, scope: "posts:write" },
  { method: "DELETE", pattern: /^\/v1\/posts(?:\/.*)?$/, scope: "posts:write" },

  { method: "POST", pattern: /^\/v1\/publish-intents$/, scope: "posts:publish" },
  { method: "GET", pattern: /^\/v1\/publish-intents\/[^/]+$/, scope: "posts:read" },
  {
    method: "POST",
    pattern: /^\/v1\/publish-intents\/[^/]+\/confirm$/,
    scope: "posts:publish",
  },

  {
    method: "GET",
    pattern: /^\/v1\/dispatches\/[^/]+\/transactions$/,
    scope: "posts:read",
  },
  { method: "POST", pattern: /^\/v1\/dispatches\/[^/]+\/retry$/, scope: "posts:publish" },

  { method: "GET", pattern: /^\/v1\/analytics(?:\/.*)?$/, scope: "analytics:read" },

  { method: "POST", pattern: /^\/v1\/bots\/adapt$/, scope: "posts:write" },
  { method: "*", pattern: /^\/v1\/communities(?:\/.*)?$/, scope: "posts:write" },

  { method: "GET", pattern: /^\/v1\/media(?:\/.*)?$/, scope: "media:read" },
  { method: "POST", pattern: /^\/v1\/media(?:\/.*)?$/, scope: "media:write" },
  { method: "DELETE", pattern: /^\/v1\/media(?:\/.*)?$/, scope: "media:write" },

  { method: "GET", pattern: /^\/v1\/notifications(?:\/.*)?$/, scope: "notifications:read" },
  { method: "POST", pattern: /^\/v1\/notifications(?:\/.*)?$/, scope: "notifications:read" },

  { method: "GET", pattern: /^\/v1\/quotas(?:\/.*)?$/, scope: "usage:read" },
  { method: "GET", pattern: /^\/v1\/activity$/, scope: "usage:read" },
  { method: "GET", pattern: /^\/v1\/subscriptions\/current$/, scope: "usage:read" },
  { method: "GET", pattern: /^\/v1\/subscriptions\/invoices$/, scope: "usage:read" },
];

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
  if (PUBLIC_PATHS.has(path)) return true;
  return PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function requiredScope(method: string, path: string): string | null {
  const policy = POLICIES.find(
    (candidate) =>
      (candidate.method === "*" || candidate.method === method) && candidate.pattern.test(path),
  );
  return policy?.scope ?? null;
}

export const apiKeyScopeMiddleware: MiddlewareHandler<AppBindings> = async (c, next) => {
  const auth = c.var.auth;

  if (!auth || auth.type === "session") {
    return next();
  }

  const path = c.req.path;
  if (isPublicPath(path)) {
    return next();
  }

  const scope = requiredScope(c.req.method, path);
  if (!scope) {
    throw new HTTPException(StatusCodes.HTTP_403_FORBIDDEN, {
      res: c.json(
        {
          message: "This endpoint is not available to API keys",
          code: "API_KEY_ENDPOINT_FORBIDDEN",
        },
        StatusCodes.HTTP_403_FORBIDDEN,
      ),
    });
  }

  if (!auth.scopes?.includes(scope)) {
    logger.warn("api key missing required scope", {
      module: "api-keys",
      action: "middleware:scope",
      apiKeyId: auth.apiKeyId,
      scope,
      path,
    });

    throw new HTTPException(StatusCodes.HTTP_403_FORBIDDEN, {
      res: c.json(
        {
          message: `API key is missing the required scope: ${scope}`,
          code: "INSUFFICIENT_SCOPE",
          requiredScope: scope,
        },
        StatusCodes.HTTP_403_FORBIDDEN,
      ),
    });
  }

  return next();
};
