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
import { PINTEREST_LIMITS, validatePinterestPost } from "./pinterest.validator";
import type { PinterestPinResponse, PinterestUserResponse } from "./pinterest.types";

export class PinterestProvider extends BaseSocialProvider {
  private appId: string;
  private appSecret: string;
  private apiBaseUrl = "https://api.pinterest.com/v5";

  constructor(appId = "", appSecret = "") {
    super();
    this.appId = appId;
    this.appSecret = appSecret;
  }

  public readonly metadata: ProviderMetadata = {
    id: "pinterest",
    name: "Pinterest",
    websiteUrl: "https://pinterest.com",
    docsUrl: "https://developers.pinterest.com/docs/api/v5",
    iconName: "pinterest",
    defaultScopes: ["boards:read", "pins:read", "pins:write", "user_accounts:read"],
    capabilities: {
      supportsText: true,
      supportsMarkdown: false,
      supportsTitle: true,
      requiresTitle: false,
      supportsImages: true,
      requiresImage: true,
      maxImages: 1,
      supportsVideos: false,
      requiresVideo: false,
      maxVideos: 0,
      supportsLinks: true,
      supportsTags: false,
      maxTags: 0,
      supportsScheduling: false,
      supportsDrafts: false,
      supportsPolls: false,
      supportsThreads: false,
    },
    limits: PINTEREST_LIMITS,
  };

  public getAuthUrl(options: AuthUrlOptions): string {
    const params = new URLSearchParams({
      client_id: this.appId || options.additionalParams?.clientId || "",
      redirect_uri: options.redirectUri,
      response_type: "code",
      scope: (options.scopes || this.metadata.defaultScopes).join(","),
      state: options.state,
    });
    return `https://www.pinterest.com/oauth/?${params.toString()}`;
  }

  public async exchangeCode(options: ExchangeCodeOptions): Promise<AuthCredentials> {
    const basicAuth = Buffer.from(`${this.appId}:${this.appSecret}`).toString("base64");

    const res = await this.http.request<{
      access_token: string;
      token_type: string;
      expires_in: number;
      refresh_token: string;
      refresh_token_expires_in: number;
      scope: string;
    }>(`${this.apiBaseUrl}/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: options.code,
        redirect_uri: options.redirectUri,
      }),
    });

    const accessToken = res.data.access_token;
    const profile = await this.verifyCredentials({ accessToken });

    return {
      accessToken,
      refreshToken: res.data.refresh_token,
      expiresAt: new Date(Date.now() + res.data.expires_in * 1000),
      scopes: res.data.scope.split(","),
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
    const basicAuth = Buffer.from(`${this.appId}:${this.appSecret}`).toString("base64");

    const res = await this.http.request<{
      access_token: string;
      token_type: string;
      expires_in: number;
      refresh_token?: string;
      scope: string;
    }>(`${this.apiBaseUrl}/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    return {
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token || refreshToken,
      expiresIn: res.data.expires_in,
      expiresAt: new Date(Date.now() + res.data.expires_in * 1000),
      scopes: res.data.scope ? res.data.scope.split(",") : undefined,
    };
  }

  public async verifyCredentials(credentials: AuthCredentials): Promise<UserProfile> {
    const res = await this.http.request<PinterestUserResponse>(`${this.apiBaseUrl}/user_account`, {
      method: "GET",
      bearerToken: credentials.accessToken,
    });

    return {
      id: res.data.id || res.data.username,
      handle: res.data.username,
      name: res.data.username,
      avatarUrl: res.data.profile_image,
      profileUrl: `https://pinterest.com/${res.data.username}`,
      rawProfile: res.data as unknown as Record<string, unknown>,
    };
  }

  public validatePost(payload: UniversalPostPayload): ValidationResult {
    return validatePinterestPost(payload);
  }

  protected async executePublish(
    payload: UniversalPostPayload,
    credentials: AuthCredentials,
  ): Promise<PublishResult> {
    const boardId = payload.platformOptions?.boardId || "";
    const primaryMedia = payload.media?.[0];

    const pinBody: Record<string, unknown> = {
      board_id: boardId,
      title: payload.title,
      description: payload.content,
      link: payload.platformOptions?.pinLink || payload.linkUrl,
      media_source: {
        source_type: "image_url",
        url: primaryMedia?.url,
      },
    };

    const res = await this.http.request<PinterestPinResponse>(`${this.apiBaseUrl}/pins`, {
      method: "POST",
      bearerToken: credentials.accessToken,
      body: pinBody,
    });

    const pinId = res.data.id;
    const pinUrl = `https://www.pinterest.com/pin/${pinId}`;

    return {
      success: true,
      externalPostId: pinId,
      externalPostUrl: pinUrl,
      publishedAt: new Date(res.data.created_at || Date.now()),
      rawResponse: res.data,
    };
  }
}
