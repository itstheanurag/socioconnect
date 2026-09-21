import type { SocialPlatform, ProviderMetadata } from "../types/provider.types";
import type {
  AuthCredentials,
  TokenRefreshResult,
  UserProfile,
  AuthUrlOptions,
  ExchangeCodeOptions,
} from "../types/auth.types";
import type { UniversalPostPayload, ValidationResult, PublishResult } from "../types/post.types";
import type { NeedsReconnectError, TransientProviderError } from "../types/errors.types";
import { HttpClient } from "./http-client";

export abstract class BaseSocialProvider {
  /**
   * Metadata describing the provider, capabilities, and platform limits
   */
  public abstract readonly metadata: ProviderMetadata;

  /**
   * Dedicated HTTP client for API interactions
   */
  protected http: HttpClient;

  constructor(http?: HttpClient) {
    this.http = http || new HttpClient();
  }

  public get platform(): SocialPlatform {
    return this.metadata.id;
  }

  /**
   * Generates OAuth Authorization URL for user consent
   */
  public abstract getAuthUrl(options: AuthUrlOptions): string;

  /**
   * Exchanges OAuth authorization code for access and refresh tokens
   */
  public abstract exchangeCode(options: ExchangeCodeOptions): Promise<AuthCredentials>;

  /**
   * Refreshes access token using refresh token (Silent Reconnect)
   */
  public abstract refreshToken(
    refreshToken: string,
    currentCredentials?: AuthCredentials,
  ): Promise<TokenRefreshResult>;

  /**
   * Validates if current credentials are valid and active
   */
  public abstract verifyCredentials(credentials: AuthCredentials): Promise<UserProfile>;

  /**
   * Validates universal post payload against platform constraints
   */
  public abstract validatePost(payload: UniversalPostPayload): ValidationResult;

  /**
   * Publishes post to the platform
   */
  protected abstract executePublish(
    payload: UniversalPostPayload,
    credentials: AuthCredentials,
  ): Promise<PublishResult>;

  /**
   * High-level publish method with automated silent reconnect & credential validation
   */
  public async publishPost(
    payload: UniversalPostPayload,
    credentials: AuthCredentials,
    onTokenRefreshed?: (newTokens: TokenRefreshResult) => Promise<void>,
  ): Promise<PublishResult> {
    // 1. Pre-publish validation
    const validation = this.validatePost(payload);
    if (!validation.valid) {
      const criticalErrors = validation.errors
        .filter((e) => e.critical)
        .map((e) => e.message)
        .join("; ");
      throw new Error(`[${this.platform.toUpperCase()}] Validation failed: ${criticalErrors}`);
    }

    // 2. Token expiration check and silent reconnect
    let currentCreds = { ...credentials };
    if (this.isTokenExpiredOrNearExpiry(currentCreds)) {
      if (currentCreds.refreshToken) {
        try {
          const refreshed = await this.refreshToken(currentCreds.refreshToken, currentCreds);
          currentCreds = {
            ...currentCreds,
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken || currentCreds.refreshToken,
            expiresAt: refreshed.expiresAt,
          };
          if (onTokenRefreshed) {
            await onTokenRefreshed(refreshed);
          }
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          throw new Error(`[${this.platform.toUpperCase()}] Silent reconnect failed: ${errMsg}`);
        }
      }
    }

    // 3. Execute publish with automatic retry if 401/needs reconnect
    return this.executeWithSilentReconnect(
      currentCreds,
      (creds) => this.executePublish(payload, creds),
      onTokenRefreshed,
    );
  }

  /**
   * Checks if an access token is expired or within 5 minutes of expiring
   */
  protected isTokenExpiredOrNearExpiry(credentials: AuthCredentials): boolean {
    if (!credentials.expiresAt) return false;
    const expiryTime = new Date(credentials.expiresAt).getTime();
    const currentTime = Date.now();
    const bufferMs = 5 * 60 * 1000; // 5 minute buffer
    return expiryTime - currentTime < bufferMs;
  }

  /**
   * Wraps an API operation with an automatic token refresh if the request returns 401
   */
  protected async executeWithSilentReconnect<T>(
    credentials: AuthCredentials,
    operation: (creds: AuthCredentials) => Promise<T>,
    onTokenRefreshed?: (newTokens: TokenRefreshResult) => Promise<void>,
  ): Promise<T> {
    try {
      return await operation(credentials);
    } catch (error: unknown) {
      const isAuthError =
        (error as NeedsReconnectError).name === "NeedsReconnectError" ||
        (error as { statusCode?: number }).statusCode === 401 ||
        (error as { status?: number }).status === 401 ||
        (error instanceof Error && error.message.toLowerCase().includes("token expired"));

      if (isAuthError && credentials.refreshToken) {
        try {
          const refreshed = await this.refreshToken(credentials.refreshToken, credentials);
          const updatedCreds: AuthCredentials = {
            ...credentials,
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken || credentials.refreshToken,
            expiresAt: refreshed.expiresAt,
          };

          if (onTokenRefreshed) {
            await onTokenRefreshed(refreshed);
          }

          // Retry operation once with fresh token
          return await operation(updatedCreds);
        } catch (refreshErr) {
          throw new Error(
            `[${this.platform.toUpperCase()}] Token expired and silent refresh attempt failed: ${
              refreshErr instanceof Error ? refreshErr.message : String(refreshErr)
            }`,
          );
        }
      }
      throw error;
    }
  }

  /**
   * Validates credentials and automatically performs silent reconnect if expired
   */
  public async ensureValidCredentials(
    credentials: AuthCredentials,
    onTokenRefreshed?: (newTokens: TokenRefreshResult) => Promise<void>,
  ): Promise<AuthCredentials> {
    if (this.isTokenExpiredOrNearExpiry(credentials) && credentials.refreshToken) {
      const refreshed = await this.refreshToken(credentials.refreshToken, credentials);
      const updatedCreds: AuthCredentials = {
        ...credentials,
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken || credentials.refreshToken,
        expiresAt: refreshed.expiresAt,
      };
      if (onTokenRefreshed) {
        await onTokenRefreshed(refreshed);
      }
      return updatedCreds;
    }

    try {
      await this.verifyCredentials(credentials);
      return credentials;
    } catch (err: unknown) {
      if (credentials.refreshToken) {
        const refreshed = await this.refreshToken(credentials.refreshToken, credentials);
        const updatedCreds: AuthCredentials = {
          ...credentials,
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken || credentials.refreshToken,
          expiresAt: refreshed.expiresAt,
        };
        if (onTokenRefreshed) {
          await onTokenRefreshed(refreshed);
        }
        return updatedCreds;
      }
      throw err;
    }
  }
}
