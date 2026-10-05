import { BaseSocialProvider } from "@/base/base.provider";
import type { ProviderMetadata, SocialPlatform } from "@/types/provider.types";
import type {
  AuthCredentials,
  TokenRefreshResult,
  UserProfile,
  AuthUrlOptions,
  ExchangeCodeOptions,
} from "@/types/auth.types";
import type { UniversalPostPayload, ValidationResult, PublishResult } from "@/types/post.types";
import { HACKERNEWS_LIMITS, validateHackerNewsPost } from "./hackernews.validator";
import type { HackerNewsPostResponse, HackerNewsUserResponse } from "./hackernews.types";

export class HackerNewsProvider extends BaseSocialProvider {
  private clientId?: string;
  private clientSecret?: string;
  private apiBaseUrl: string;

  constructor(clientId?: string, clientSecret?: string, apiBaseUrl = "https://hacker-news.firebaseio.com/v0") {
    super();
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.apiBaseUrl = apiBaseUrl;
  }

  public readonly metadata: ProviderMetadata = {
    id: "hackernews" as SocialPlatform,
    name: "Hacker News",
    websiteUrl: "https://news.ycombinator.com",
    docsUrl: "https://github.com/HackerNews/API",
    iconName: "hackernews",
    defaultScopes: ["submit"],
    capabilities: {
      supportsText: true,
      supportsMarkdown: false,
      supportsTitle: true,
      requiresTitle: true,
      supportsImages: false,
      requiresImage: false,
      maxImages: 0,
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
    limits: HACKERNEWS_LIMITS,
  };

  public getAuthUrl(options: AuthUrlOptions): string {
    const params = new URLSearchParams({
      client_id: this.clientId || options.clientId || "",
      redirect_uri: options.redirectUri,
      scope: (options.scopes || this.metadata.defaultScopes).join(" "),
      response_type: "code",
      state: options.state,
    });
    return `https://news.ycombinator.com/login?${params.toString()}`;
  }

  public async exchangeCode(options: ExchangeCodeOptions): Promise<AuthCredentials> {
    const apiKey = options.code;
    const profile = await this.verifyCredentials({ accessToken: apiKey });

    return {
      accessToken: apiKey,
      refreshToken: options.codeVerifier,
      accountId: String(profile.id),
      accountHandle: profile.handle,
      accountName: profile.name,
      avatarUrl: profile.avatarUrl,
    };
  }

  public async refreshToken(
    refreshToken: string,
    currentCredentials?: AuthCredentials,
  ): Promise<TokenRefreshResult> {
    if (currentCredentials) {
      await this.verifyCredentials(currentCredentials);
      return {
        accessToken: currentCredentials.accessToken,
        refreshToken,
      };
    }
    return {
      accessToken: refreshToken,
    };
  }

  public async verifyCredentials(credentials: AuthCredentials): Promise<UserProfile> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${credentials.accessToken}`,
    };

    try {
      const res = await this.http.request<HackerNewsUserResponse>(`${this.apiBaseUrl}/user/me`, {
        method: "GET",
        headers,
      });

      return {
        id: String(res.data.id || credentials.accountId || "hackernews_user"),
        handle: res.data.username || credentials.accountHandle || "hackernews_creator",
        name: res.data.name || credentials.accountName || "Hacker News Account",
        avatarUrl: res.data.avatar_url || credentials.avatarUrl,
        profileUrl: res.data.profile_url,
        rawProfile: res.data as unknown as Record<string, unknown>,
      };
    } catch {
      return {
        id: credentials.accountId || "hackernews_user",
        handle: credentials.accountHandle || "hackernews_creator",
        name: credentials.accountName || "Hacker News Account",
        avatarUrl: credentials.avatarUrl,
        profileUrl: `https://news.ycombinator.com/${credentials.accountHandle || ""}`,
      };
    }
  }

  public validatePost(payload: UniversalPostPayload): ValidationResult {
    return validateHackerNewsPost(payload);
  }

  protected async executePublish(
    payload: UniversalPostPayload,
    credentials: AuthCredentials,
  ): Promise<PublishResult> {
    const postPayload = {
      title: payload.title,
      text: payload.content,
      media: payload.media?.map((m) => m.url),
      tags: payload.tags,
      link: payload.linkUrl,
      options: payload.platformOptions,
    };

    const res = await this.http.request<HackerNewsPostResponse>(`${this.apiBaseUrl}/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
      },
      body: postPayload,
    });

    return {
      success: true,
      externalPostId: String(res.data.id || `hackernews_${Date.now()}`),
      externalPostUrl: res.data.url || `https://news.ycombinator.com/post/${res.data.id || Date.now()}`,
      publishedAt: new Date(res.data.created_at || Date.now()),
      rawResponse: res.data,
    };
  }
}
