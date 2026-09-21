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
import { YOUTUBE_LIMITS, validateYouTubePost } from "./youtube.validator";
import type { YouTubeChannelResponse, YouTubeVideoResponse } from "./youtube.types";

export class YouTubeProvider extends BaseSocialProvider {
  private clientId: string;
  private clientSecret: string;
  private apiBaseUrl = "https://www.googleapis.com/youtube/v3";

  constructor(clientId = "", clientSecret = "") {
    super();
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  public readonly metadata: ProviderMetadata = {
    id: "youtube",
    name: "YouTube",
    websiteUrl: "https://youtube.com",
    docsUrl: "https://developers.google.com/youtube/v3",
    iconName: "youtube",
    defaultScopes: [
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/youtube.readonly",
    ],
    capabilities: {
      supportsText: true,
      supportsMarkdown: false,
      supportsTitle: true,
      requiresTitle: true,
      supportsImages: false,
      requiresImage: false,
      maxImages: 0,
      supportsVideos: true,
      requiresVideo: true,
      maxVideos: 1,
      supportsLinks: true,
      supportsTags: true,
      maxTags: 50,
      supportsScheduling: true,
      supportsDrafts: false,
      supportsPolls: false,
      supportsThreads: false,
    },
    limits: YOUTUBE_LIMITS,
  };

  public getAuthUrl(options: AuthUrlOptions): string {
    const params = new URLSearchParams({
      client_id: this.clientId || options.additionalParams?.clientId || "",
      redirect_uri: options.redirectUri,
      response_type: "code",
      scope: (options.scopes || this.metadata.defaultScopes).join(" "),
      access_type: "offline",
      prompt: "consent",
      state: options.state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  public async exchangeCode(options: ExchangeCodeOptions): Promise<AuthCredentials> {
    const res = await this.http.request<{
      access_token: string;
      expires_in: number;
      refresh_token?: string;
      scope: string;
      token_type: string;
    }>("https://oauth2.googleapis.com/token", {
      method: "POST",
      body: new URLSearchParams({
        code: options.code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: options.redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const accessToken = res.data.access_token;
    const profile = await this.verifyCredentials({ accessToken });

    return {
      accessToken,
      refreshToken: res.data.refresh_token,
      expiresAt: new Date(Date.now() + res.data.expires_in * 1000),
      scopes: res.data.scope.split(" "),
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
      access_token: string;
      expires_in: number;
      scope: string;
      token_type: string;
    }>("https://oauth2.googleapis.com/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    return {
      accessToken: res.data.access_token,
      refreshToken,
      expiresIn: res.data.expires_in,
      expiresAt: new Date(Date.now() + res.data.expires_in * 1000),
      scopes: res.data.scope ? res.data.scope.split(" ") : undefined,
    };
  }

  public async verifyCredentials(credentials: AuthCredentials): Promise<UserProfile> {
    const res = await this.http.request<YouTubeChannelResponse>(`${this.apiBaseUrl}/channels`, {
      method: "GET",
      bearerToken: credentials.accessToken,
      params: {
        part: "snippet,statistics",
        mine: "true",
      },
    });

    const channel = res.data.items?.[0];
    if (!channel) {
      throw new Error("No YouTube channel found for the authenticated account.");
    }

    return {
      id: channel.id,
      handle: channel.snippet.customUrl || channel.id,
      name: channel.snippet.title,
      avatarUrl: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.default?.url,
      profileUrl: `https://youtube.com/channel/${channel.id}`,
      followerCount: channel.statistics?.subscriberCount
        ? parseInt(channel.statistics.subscriberCount, 10)
        : undefined,
      rawProfile: channel as unknown as Record<string, unknown>,
    };
  }

  public validatePost(payload: UniversalPostPayload): ValidationResult {
    return validateYouTubePost(payload);
  }

  protected async executePublish(
    payload: UniversalPostPayload,
    credentials: AuthCredentials,
  ): Promise<PublishResult> {
    const privacyStatus = payload.platformOptions?.privacyStatus || "public";
    const tags = payload.tags || [];

    const requestBody = {
      snippet: {
        title: payload.title,
        description: payload.content,
        tags,
        categoryId: "22",
      },
      status: {
        privacyStatus,
        selfDeclaredMadeForKids: payload.platformOptions?.madeForKids || false,
        publishAt: payload.scheduledAt?.toISOString(),
      },
    };

    const res = await this.http.request<YouTubeVideoResponse>(
      "https://www.googleapis.com/youtube/v3/videos?part=snippet,status",
      {
        method: "POST",
        bearerToken: credentials.accessToken,
        body: requestBody,
      },
    );

    const videoId = res.data.id;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    return {
      success: true,
      externalPostId: videoId,
      externalPostUrl: videoUrl,
      publishedAt: new Date(res.data.snippet?.publishedAt || Date.now()),
      rawResponse: res.data,
    };
  }
}
