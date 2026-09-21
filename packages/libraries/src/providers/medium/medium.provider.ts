import { BaseSocialProvider } from "../../base/base.provider";
import type { ProviderMetadata } from "../../types/provider.types";
import type {
  AuthCredentials,
  TokenRefreshResult,
  UserProfile,
  AuthUrlOptions,
  ExchangeCodeOptions,
} from "../../types/auth.types";
import type { UniversalPostPayload, ValidationResult, PublishResult } from "../../types/post.types";
import { MEDIUM_LIMITS, validateMediumPost } from "./medium.validator";
import type { MediumPostResponse, MediumUserResponse } from "./medium.types";

export class MediumProvider extends BaseSocialProvider {
  private clientId: string;
  private clientSecret: string;
  private apiBaseUrl = "https://api.medium.com/v1";

  constructor(clientId = "", clientSecret = "") {
    super();
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  public readonly metadata: ProviderMetadata = {
    id: "medium",
    name: "Medium",
    websiteUrl: "https://medium.com",
    docsUrl: "https://github.com/Medium/medium-api-docs",
    iconName: "medium",
    defaultScopes: ["basicProfile", "publishPost"],
    capabilities: {
      supportsText: true,
      supportsMarkdown: true,
      supportsTitle: true,
      requiresTitle: true,
      supportsImages: false,
      requiresImage: false,
      maxImages: 0,
      supportsVideos: false,
      requiresVideo: false,
      maxVideos: 0,
      supportsLinks: true,
      supportsTags: true,
      maxTags: 5,
      supportsScheduling: false,
      supportsDrafts: true,
      supportsPolls: false,
      supportsThreads: false,
    },
    limits: MEDIUM_LIMITS,
  };

  public getAuthUrl(options: AuthUrlOptions): string {
    const params = new URLSearchParams({
      client_id: this.clientId || options.additionalParams?.clientId || "",
      scope: (options.scopes || this.metadata.defaultScopes).join(","),
      state: options.state,
      response_type: "code",
      redirect_uri: options.redirectUri,
    });
    return `https://medium.com/m/oauth/authorize?${params.toString()}`;
  }

  public async exchangeCode(options: ExchangeCodeOptions): Promise<AuthCredentials> {
    const res = await this.http.request<{
      token_type: string;
      access_token: string;
      refresh_token: string;
      scope: string[];
      expires_at: number;
    }>("https://api.medium.com/v1/tokens", {
      method: "POST",
      body: new URLSearchParams({
        code: options.code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "authorization_code",
        redirect_uri: options.redirectUri,
      }),
    });

    const accessToken = res.data.access_token;
    const profile = await this.verifyCredentials({ accessToken });

    return {
      accessToken,
      refreshToken: res.data.refresh_token,
      expiresAt: res.data.expires_at ? new Date(res.data.expires_at) : undefined,
      scopes: res.data.scope,
      accountId: profile.id,
      accountHandle: profile.handle,
      accountName: profile.name,
      avatarUrl: profile.avatarUrl,
    };
  }

  public async refreshToken(
    refreshToken: string,
    _currentCredentials?: AuthCredentials,
  ): Promise<TokenRefreshResult> {
    const res = await this.http.request<{
      token_type: string;
      access_token: string;
      refresh_token: string;
      expires_at: number;
      scope: string[];
    }>("https://api.medium.com/v1/tokens", {
      method: "POST",
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "refresh_token",
      }),
    });

    return {
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token || refreshToken,
      expiresAt: res.data.expires_at ? new Date(res.data.expires_at) : undefined,
      scopes: res.data.scope,
    };
  }

  public async verifyCredentials(credentials: AuthCredentials): Promise<UserProfile> {
    const res = await this.http.request<MediumUserResponse>(`${this.apiBaseUrl}/me`, {
      method: "GET",
      bearerToken: credentials.accessToken,
    });

    return {
      id: res.data.data.id,
      handle: res.data.data.username,
      name: res.data.data.name || res.data.data.username,
      avatarUrl: res.data.data.imageUrl,
      profileUrl: res.data.data.url,
      rawProfile: res.data.data as unknown as Record<string, unknown>,
    };
  }

  public validatePost(payload: UniversalPostPayload): ValidationResult {
    return validateMediumPost(payload);
  }

  protected async executePublish(
    payload: UniversalPostPayload,
    credentials: AuthCredentials,
  ): Promise<PublishResult> {
    const authorId = credentials.accountId || (await this.verifyCredentials(credentials)).id;

    const cleanTags = (payload.tags || [])
      .map((t: string) => t.replace(/^#/, "").slice(0, 25))
      .filter(Boolean)
      .slice(0, 5);

    const publishStatus = payload.platformOptions?.publishStatus || "public";

    const body: Record<string, unknown> = {
      title: payload.title,
      contentFormat: "markdown",
      content: payload.content,
      tags: cleanTags,
      canonicalUrl: payload.platformOptions?.canonicalUrl || payload.linkUrl,
      publishStatus,
    };

    const res = await this.http.request<MediumPostResponse>(
      `${this.apiBaseUrl}/users/${authorId}/posts`,
      {
        method: "POST",
        bearerToken: credentials.accessToken,
        body,
      },
    );

    return {
      success: true,
      externalPostId: res.data.data.id,
      externalPostUrl: res.data.data.url,
      publishedAt: new Date(res.data.data.publishedAt || Date.now()),
      rawResponse: res.data,
    };
  }
}
