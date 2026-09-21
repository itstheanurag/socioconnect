export type ErrorClassification =
  | "VALIDATION_FAILED"
  | "NEEDS_RECONNECT"
  | "RATE_LIMITED"
  | "TRANSIENT_NETWORK"
  | "PERMANENT_REJECTION"
  | "UNKNOWN";

export class ProviderError extends Error {
  public readonly platform: string;
  public readonly classification: ErrorClassification;
  public readonly statusCode?: number;
  public readonly retryAfterSeconds?: number;
  public readonly rawError?: unknown;

  constructor(
    platform: string,
    message: string,
    classification: ErrorClassification = "UNKNOWN",
    options?: {
      statusCode?: number;
      retryAfterSeconds?: number;
      rawError?: unknown;
      cause?: Error;
    },
  ) {
    super(`[${platform.toUpperCase()}] ${message}`);
    this.name = "ProviderError";
    this.platform = platform;
    this.classification = classification;
    this.statusCode = options?.statusCode;
    this.retryAfterSeconds = options?.retryAfterSeconds;
    this.rawError = options?.rawError;
    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}

export class NeedsReconnectError extends ProviderError {
  constructor(
    platform: string,
    message = "Session expired or revoked. User must reconnect account.",
    rawError?: unknown,
  ) {
    super(platform, message, "NEEDS_RECONNECT", { statusCode: 401, rawError });
    this.name = "NeedsReconnectError";
  }
}

export class RateLimitError extends ProviderError {
  constructor(platform: string, retryAfterSeconds?: number, rawError?: unknown) {
    const msg = retryAfterSeconds
      ? `Rate limit exceeded. Try again in ${retryAfterSeconds} seconds.`
      : "Rate limit exceeded. Try again later.";
    super(platform, msg, "RATE_LIMITED", { statusCode: 429, retryAfterSeconds, rawError });
    this.name = "RateLimitError";
  }
}

export class InvalidPayloadError extends ProviderError {
  public readonly validationErrors: string[];

  constructor(platform: string, validationErrors: string[], rawError?: unknown) {
    super(platform, `Post validation failed: ${validationErrors.join("; ")}`, "VALIDATION_FAILED", {
      statusCode: 400,
      rawError,
    });
    this.name = "InvalidPayloadError";
    this.validationErrors = validationErrors;
  }
}

export class TransientProviderError extends ProviderError {
  constructor(platform: string, message: string, rawError?: unknown) {
    super(platform, message, "TRANSIENT_NETWORK", { statusCode: 503, rawError });
    this.name = "TransientProviderError";
  }
}

export class PermanentProviderError extends ProviderError {
  constructor(platform: string, message: string, rawError?: unknown) {
    super(platform, message, "PERMANENT_REJECTION", { statusCode: 400, rawError });
    this.name = "PermanentProviderError";
  }
}
