import {
  ProviderError,
  NeedsReconnectError,
  RateLimitError,
  InvalidPayloadError,
  PermanentProviderError,
  TransientProviderError,
} from "../types/errors.types";

export interface HttpRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  bearerToken?: string;
  timeoutMs?: number;
  platform?: string;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Headers;
  rateLimit?: {
    limit?: number;
    remaining?: number;
    resetAt?: Date;
  };
}

export class HttpClient {
  private defaultTimeoutMs: number;
  private defaultPlatform: string;

  constructor(defaultTimeoutMs = 30000, defaultPlatform = "generic") {
    this.defaultTimeoutMs = defaultTimeoutMs;
    this.defaultPlatform = defaultPlatform;
  }

  public async request<T = unknown>(
    url: string,
    options: HttpRequestOptions = {},
  ): Promise<HttpResponse<T>> {
    const {
      method = "GET",
      headers = {},
      params,
      body,
      bearerToken,
      timeoutMs = this.defaultTimeoutMs,
      platform = this.defaultPlatform,
    } = options;

    let targetUrl = url;
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      }
      const qs = searchParams.toString();
      if (qs) {
        targetUrl += (url.includes("?") ? "&" : "?") + qs;
      }
    }

    const requestHeaders: Record<string, string> = {
      ...headers,
    };

    if (bearerToken) {
      requestHeaders["Authorization"] = `Bearer ${bearerToken}`;
    }

    let requestBody: BodyInit | undefined;
    if (body) {
      if (body instanceof FormData || body instanceof URLSearchParams) {
        requestBody = body;
      } else if (typeof body === "string") {
        requestBody = body;
      } else {
        requestHeaders["Content-Type"] = "application/json";
        requestBody = JSON.stringify(body);
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(targetUrl, {
        method,
        headers: requestHeaders,
        body: requestBody,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const rateLimit = this.extractRateLimitHeaders(response.headers);

      if (!response.ok) {
        const errorBody = await this.safeParseErrorBody(response);
        this.throwCategorizedError(platform, response.status, errorBody, rateLimit?.resetAt);
      }

      const contentType = response.headers.get("content-type") || "";
      let data: T;
      if (contentType.includes("application/json")) {
        data = (await response.json()) as T;
      } else {
        data = (await response.text()) as unknown as T;
      }

      return {
        data,
        status: response.status,
        headers: response.headers,
        rateLimit,
      };
    } catch (err: unknown) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === "AbortError") {
        throw new TransientProviderError(
          platform,
          `Request timed out after ${timeoutMs}ms to ${url}`,
        );
      }
      throw err;
    }
  }

  private extractRateLimitHeaders(headers: Headers) {
    const limit = headers.get("x-ratelimit-limit") || headers.get("ratelimit-limit");
    const remaining = headers.get("x-ratelimit-remaining") || headers.get("ratelimit-remaining");
    const reset =
      headers.get("x-ratelimit-reset") ||
      headers.get("ratelimit-reset") ||
      headers.get("retry-after");

    let resetAt: Date | undefined;
    if (reset) {
      const parsedNum = parseInt(reset, 10);
      if (!isNaN(parsedNum)) {
        resetAt =
          parsedNum > 1e9 ? new Date(parsedNum * 1000) : new Date(Date.now() + parsedNum * 1000);
      }
    }

    return {
      limit: limit ? parseInt(limit, 10) : undefined,
      remaining: remaining ? parseInt(remaining, 10) : undefined,
      resetAt,
    };
  }

  private async safeParseErrorBody(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      try {
        return await response.text();
      } catch {
        return "Unknown error";
      }
    }
  }

  private throwCategorizedError(
    platform: string,
    status: number,
    errorBody: unknown,
    resetAt?: Date,
  ): never {
    const message = typeof errorBody === "string" ? errorBody : JSON.stringify(errorBody);

    if (status === 401) {
      throw new NeedsReconnectError(platform, `Authentication failed (401): ${message}`, errorBody);
    }

    if (status === 429) {
      const retryAfter = resetAt
        ? Math.max(1, Math.ceil((resetAt.getTime() - Date.now()) / 1000))
        : 60;
      throw new RateLimitError(platform, retryAfter, errorBody);
    }

    if (status === 400 || status === 422) {
      throw new InvalidPayloadError(platform, [message], errorBody);
    }

    if (status >= 500) {
      throw new TransientProviderError(
        platform,
        `Provider server error (${status}): ${message}`,
        errorBody,
      );
    }

    throw new PermanentProviderError(
      platform,
      `Provider request failed (${status}): ${message}`,
      errorBody,
    );
  }
}
