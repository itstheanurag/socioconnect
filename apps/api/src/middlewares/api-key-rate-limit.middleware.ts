import { type MiddlewareHandler } from "hono";
import { StatusCodes } from "@repo/config";
import { type AppBindings } from "../types";

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();
const WINDOW_MS = 60_000;
const MAX_TRACKED_KEYS = 10_000;

function cleanup(now: number): void {
  if (windows.size < MAX_TRACKED_KEYS) return;
  for (const [key, value] of windows) {
    if (value.resetAt <= now) windows.delete(key);
  }
}

/**
 * Fixed-window per-key rate limiting.
 *
 * This is process-local. Replace the map with Redis when running more than one
 * API instance.
 */
export const apiKeyRateLimitMiddleware: MiddlewareHandler<AppBindings> = async (c, next) => {
  const auth = c.var.auth;
  if (!auth || auth.type !== "api_key" || !auth.apiKeyId) {
    return next();
  }

  const limit = auth.rateLimitPerMinute ?? 60;
  const now = Date.now();
  cleanup(now);

  let window = windows.get(auth.apiKeyId);
  if (!window || window.resetAt <= now) {
    window = { count: 0, resetAt: now + WINDOW_MS };
    windows.set(auth.apiKeyId, window);
  }

  window.count += 1;
  const remaining = Math.max(0, limit - window.count);
  const resetSeconds = Math.ceil(window.resetAt / 1000);

  c.header("X-RateLimit-Limit", String(limit));
  c.header("X-RateLimit-Remaining", String(remaining));
  c.header("X-RateLimit-Reset", String(resetSeconds));

  if (window.count > limit) {
    c.header("Retry-After", String(Math.max(1, Math.ceil((window.resetAt - now) / 1000))));
    return c.json(
      {
        message: "API key rate limit exceeded",
        code: "RATE_LIMITED",
        limit,
        retryAfterSeconds: Math.max(1, Math.ceil((window.resetAt - now) / 1000)),
      },
      StatusCodes.HTTP_429_TOO_MANY_REQUESTS,
    );
  }

  return next();
};
