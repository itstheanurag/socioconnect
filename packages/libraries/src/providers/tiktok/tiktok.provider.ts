import { BaseSocialProvider } from "@/base/base.provider";
import type { ProviderMetadata } from "@/types/provider.types";
import type {
  AuthCredentials,
  TokenRefreshResult,
  UserProfile,
  AuthUrlOptions,
  ExchangeCodeOptions,
} from "@/types/auth.types";
import type {
  UniversalPostPayload,
  ValidationResult,
  PublishResult,
  PublishStatusResult,
} from "@/types/post.types";
import { TIKTOK_LIMITS, validateTikTokPost } from "./tiktok.validator";
import type {
  TikTokPublishResponse,
  TikTokPublishStatusResponse,
  TikTokTokenResponse,
  TikTokUserResponse,
} from "./tiktok.types";

export class TikTokProvider extends BaseSocialProvider {
  private clientKey: string;
  private clientSecret: string;
  private apiBaseUrl = "https://open.tiktokapis.com/v2";

  constructor(clientKey = "", clientSecret = "") {
    super();
    this.clientKey = clientKey;
    this.clientSecret = clientSecret;
  }

  public readonly metadata: ProviderMetadata = {
    id: "tiktok",
    name: "TikTok",
    websiteUrl: "https://tiktok.com",
    docsUrl: "https://developers.tiktok.com/doc/overview",
    iconName: "tiktok",
    defaultScopes: ["user.info.basic", "video.publish", "video.upload"],
    capabilities: {
      supportsText: true,
      supportsMarkdown: false,
      supportsTitle: true,
      requiresTitle: false,
      supportsImages: true,
      requiresImage: false,
      maxImages: 35,
      supportsVideos: true,
      requiresVideo: false,
      maxVideos: 1,
      supportsLinks: false,
      supportsTags: true,
      maxTags: 30,
      supportsScheduling: true,
      supportsDrafts: false,
      supportsPolls: false,
      supportsThreads: false,
    },
    limits: TIKTOK_LIMITS,
  };

  public getAuthUrl(options: AuthUrlOptions): string {
    const params = new URLSearchParams({
      client_key: this.clientKey || options.additionalParams?.clientKey || "",
      redirect_uri: options.redirectUri,
      scope: (options.scopes || this.metadata.defaultScopes).join(","),
      response_type: "code",
      state: options.state,
    });
    return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
  }

  public async exchangeCode(options: ExchangeCodeOptions): Promise<AuthCredentials> {
    const bodyParams = new URLSearchParams({
      client_key: this.clientKey,
      client_secret: this.clientSecret,
      code: options.code,
      grant_type: "authorization_code",
      redirect_uri: options.redirectUri,
    });

    const res = await this.http.request<TikTokTokenResponse>(`${this.apiBaseUrl}/oauth/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyParams,
    });

    const accessToken = res.data.access_token;
    const profile = await this.verifyCredentials({ accessToken });

    return {
      accessToken,
      refreshToken: res.data.refresh_token,
      expiresAt: new Date(Date.now() + res.data.expires_in * 1000),
      scopes: res.data.scope ? res.data.scope.split(",") : this.metadata.defaultScopes,
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
    const bodyParams = new URLSearchParams({
      client_key: this.clientKey,
      client_secret: this.clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    const res = await this.http.request<TikTokTokenResponse>(`${this.apiBaseUrl}/oauth/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyParams,
    });

    return {
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token || refreshToken,
      expiresIn: res.data.expires_in,
      expiresAt: new Date(Date.now() + res.data.expires_in * 1000),
    };
  }

  public async verifyCredentials(credentials: AuthCredentials): Promise<UserProfile> {
    const res = await this.http.request<TikTokUserResponse>(`${this.apiBaseUrl}/user/info/`, {
      method: "GET",
      bearerToken: credentials.accessToken,
      params: {
        fields: "open_id,union_id,avatar_url,display_name,bio_description,is_verified",
      },
    });

    const user = res.data.data.user;
    return {
      id: user.open_id,
      handle: user.display_name,
      name: user.display_name,
      avatarUrl: user.avatar_url,
      profileUrl: `https://www.tiktok.com/@${user.display_name}`,
      rawProfile: res.data as unknown as Record<string, unknown>,
    };
  }

  public validatePost(payload: UniversalPostPayload): ValidationResult {
    return validateTikTokPost(payload);
  }

  protected async executeCheckPublishStatus(
    operationId: string,
    credentials: AuthCredentials,
  ): Promise<PublishStatusResult> {
    const res = await this.http.request<TikTokPublishStatusResponse>(
      `${this.apiBaseUrl}/post/publish/status/fetch/`,
      {
        method: "POST",
        bearerToken: credentials.accessToken,
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: { publish_id: operationId },
      },
    );
    if (res.data.error.code && res.data.error.code !== "ok") {
      const error = new Error(res.data.error.message || res.data.error.code);
      (error as Error & { statusCode: number }).statusCode = 400;
      throw error;
    }
    const { status, fail_reason: failReason, publicaly_available_post_id: postIds } = res.data.data;
    if (status === "PUBLISH_COMPLETE") {
      const postId = postIds?.[0] ? String(postIds[0]) : undefined;
      return {
        status: "published",
        externalPostId: postId,
        externalPostUrl: postId
          ? `https://www.tiktok.com/@${credentials.accountHandle || ""}/video/${postId}`
          : undefined,
        rawResponse: res.data,
      };
    }
    if (status === "FAILED") {
      return {
        status: "failed",
        errorMessage: failReason || "TikTok rejected the post",
        rawResponse: res.data,
      };
    }
    return { status: "pending", rawResponse: res.data };
  }

  protected async executePublish(
    payload: UniversalPostPayload,
    credentials: AuthCredentials,
  ): Promise<PublishResult> {
    const primaryMedia = payload.media?.[0];
    const isVideo = primaryMedia?.type === "video";
    const options = payload.platformOptions;

    const privacyLevel = options?.privacyLevel || "PUBLIC_TO_EVERYONE";
    const disableComment = options?.disableComments ?? false;
    const disableDuet = options?.disableDuet ?? false;
    const disableStitch = options?.disableStitch ?? false;

    // 1. Direct Video Publish Init
    if (isVideo && primaryMedia) {
      const res = await this.http.request<TikTokPublishResponse>(
        `${this.apiBaseUrl}/post/publish/video/init/`,
        {
          method: "POST",
          bearerToken: credentials.accessToken,
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
          },
          body: {
            post_info: {
              title: payload.content || payload.title || "",
              privacy_level: privacyLevel,
              disable_comment: disableComment,
              disable_duet: disableDuet,
              disable_stitch: disableStitch,
              video_cover_timestamp_ms: 1000,
            },
            source_info: {
              source: "PULL_FROM_URL",
              video_url: primaryMedia.url,
            },
          },
        },
      );

      const publishId = res.data.data.publish_id;
      return {
        success: true,
        pending: true,
        externalPostId: publishId,
        publishedAt: new Date(),
        rawResponse: res.data,
      };
    }

    // 2. Photo Carousel Publish Init
    const images = (payload.media || []).filter((m) => m.type === "image" || m.type === "gif");
    const res = await this.http.request<TikTokPublishResponse>(
      `${this.apiBaseUrl}/post/publish/content/init/`,
      {
        method: "POST",
        bearerToken: credentials.accessToken,
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: {
          post_info: {
            title: payload.title || "",
            description: payload.content || "",
            privacy_level: privacyLevel,
            disable_comment: disableComment,
            auto_add_music: options?.autoAddMusic ?? true,
          },
          source_info: {
            source: "PULL_FROM_URL",
            photo_cover_index: 1,
            photo_images: images.map((img) => img.url),
          },
          post_mode: "MEDIA_UPLOAD",
          media_type: "PHOTO",
        },
      },
    );

    const publishId = res.data.data.publish_id;
    return {
      success: true,
      pending: true,
      externalPostId: publishId,
      publishedAt: new Date(),
      rawResponse: res.data,
    };
  }
}
