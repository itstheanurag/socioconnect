import { env } from "./env";
import type { McpAuth } from "./auth";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T = Record<string, unknown>>(
  auth: McpAuth,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  options?: { body?: unknown; idempotencyKey?: string },
): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${auth.apiToken}`,
    "Content-Type": "application/json",
  };

  if (options?.idempotencyKey) {
    headers["Idempotency-Key"] = options.idempotencyKey;
  }

  let response: Response;
  try {
    response = await fetch(`${env.API_BASE_URL}${path}`, {
      method,
      headers,
      body: options?.body === undefined ? undefined : JSON.stringify(options.body),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    throw new ApiError(
      err instanceof Error ? `SocioConnect API unreachable: ${err.message}` : "API unreachable",
      502,
      "API_UNAVAILABLE",
    );
  }

  const text = await response.text();
  let body: unknown = null;
  if (text.length > 0) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const errorBody = body as { message?: string; code?: string } | null;
    throw new ApiError(
      errorBody?.message ?? `SocioConnect API returned ${response.status}`,
      response.status,
      errorBody?.code,
    );
  }

  return body as T;
}
