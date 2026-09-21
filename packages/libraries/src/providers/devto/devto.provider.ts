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
import { DEVTO_LIMITS, validateDevToPost } from "./devto.validator";
import type { DevToArticleResponse, DevToUserResponse } from "./devto.types";

export class DevToProvider extends BaseSocialProvider {
  private apiBaseUrl = "https://dev.to/api";

  public readonly metadata: ProviderMetadata = {
    id: "devto",
    name: "Dev.to",
    websiteUrl: "https://dev.to",
    docsUrl: "https://developers.forem.com/api",
    iconName: "devto",
    defaultScopes: [],
    capabilities: {
      supportsText: true,
      supportsMarkdown: true,
      supportsTitle: true,
      requiresTitle: true,
      supportsImages: true,
      requiresImage: false,
      maxImages: 1,
      supportsVideos: false,
      requiresVideo: false,
      maxVideos: 0,
      supportsLinks: true,
      supportsTags: true,
      maxTags: 4,
      supportsScheduling: false,
      supportsDrafts: true,
      supportsPolls: false,
      supportsThreads: false,
    },
    limits: DEVTO_LIMITS,
  };

  public getAuthUrl(_options: AuthUrlOptions): string {
    return "https://dev.to/settings/extensions";
  }

  public async exchangeCode(options: ExchangeCodeOptions): Promise<AuthCredentials> {
    const apiKey = options.code;
    const profile = await this.verifyCredentials({ accessToken: apiKey });

    return {
      accessToken: apiKey,
      accountId: String(profile.id),
      accountHandle: profile.handle,
      accountName: profile.name,
      avatarUrl: profile.avatarUrl,
    };
  }

  public async refreshToken(
    _refreshToken: string,
    currentCredentials?: AuthCredentials,
  ): Promise<TokenRefreshResult> {
    if (currentCredentials) {
      await this.verifyCredentials(currentCredentials);
      return {
        accessToken: currentCredentials.accessToken,
      };
    }
    return {
      accessToken: "",
    };
  }

  public async verifyCredentials(credentials: AuthCredentials): Promise<UserProfile> {
    const res = await this.http.request<DevToUserResponse>(`${this.apiBaseUrl}/users/me`, {
      method: "GET",
      headers: {
        "api-key": credentials.accessToken,
      },
    });

    return {
      id: String(res.data.id),
      handle: res.data.username,
      name: res.data.name || res.data.username,
      avatarUrl: res.data.profile_image,
      profileUrl: `https://dev.to/${res.data.username}`,
      rawProfile: res.data as unknown as Record<string, unknown>,
    };
  }

  public validatePost(payload: UniversalPostPayload): ValidationResult {
    return validateDevToPost(payload);
  }

  protected async executePublish(
    payload: UniversalPostPayload,
    credentials: AuthCredentials,
  ): Promise<PublishResult> {
    const cleanTags = (payload.tags || [])
      .map((t: string) =>
        t
          .replace(/^#/, "")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, ""),
      )
      .filter(Boolean)
      .slice(0, 4);

    const isPublished = payload.platformOptions?.publishStatus !== "draft";
    const coverImage = payload.media?.[0]?.url;

    const articlePayload: Record<string, unknown> = {
      title: payload.title,
      body_markdown: payload.content,
      published: isPublished,
      tags: cleanTags,
      canonical_url: payload.platformOptions?.canonicalUrl || payload.linkUrl,
      main_image: coverImage,
      series: payload.platformOptions?.series,
    };

    const res = await this.http.request<DevToArticleResponse>(`${this.apiBaseUrl}/articles`, {
      method: "POST",
      headers: {
        "api-key": credentials.accessToken,
      },
      body: {
        article: articlePayload,
      },
    });

    return {
      success: true,
      externalPostId: String(res.data.id),
      externalPostUrl: res.data.url,
      publishedAt: new Date(res.data.published_at || Date.now()),
      rawResponse: res.data,
    };
  }
}
