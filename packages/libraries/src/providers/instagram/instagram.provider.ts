import { BaseSocialProvider } from "@/base/base.provider";
import type { ProviderMetadata } from "@/types/provider.types";
import type {
  AuthCredentials,
  TokenRefreshResult,
  UserProfile,
  AuthUrlOptions,
  ExchangeCodeOptions,
} from "@/types/auth.types";
import type { UniversalPostPayload, ValidationResult, PublishResult } from "@/types/post.types";
import { INSTAGRAM_LIMITS, validateInstagramPost } from "./instagram.validator";
import type {
  InstagramMediaContainerResponse,
  InstagramPublishResponse,
  InstagramTokenRefreshResponse,
  InstagramUserResponse,
} from "./instagram.types";

export class InstagramProvider extends BaseSocialProvider {
  private appId: string;
  private appSecret: string;
  private apiBaseUrl = "https://graph.instagram.com/v19.0";

  constructor(appId = "", appSecret = "") {
    super();
    this.appId = appId;
    this.appSecret = appSecret;
  }

  public readonly metadata: ProviderMetadata = {
    id: "instagram",
    name: "Instagram",
    websiteUrl: "https://instagram.com",
    docsUrl: "https://developers.facebook.com/docs/instagram-platform",
    iconName: "instagram",
    defaultScopes: [
      "instagram_basic",
      "instagram_content_publish",
      "pages_show_list",
      "pages_read_engagement",
    ],
    capabilities: {
      supportsText: true,
      supportsMarkdown: false,
      supportsTitle: false,
      requiresTitle: false,
      supportsImages: true,
      requiresImage: true,
      maxImages: 10,
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
    limits: INSTAGRAM_LIMITS,
  };

  public getAuthUrl(options: AuthUrlOptions): string {
    const params = new URLSearchParams({
      client_id: this.appId || options.additionalParams?.clientId || "",
      redirect_uri: options.redirectUri,
      scope: (options.scopes || this.metadata.defaultScopes).join(","),
      response_type: "code",
      state: options.state,
    });
    return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
  }

  public async exchangeCode(options: ExchangeCodeOptions): Promise<AuthCredentials> {
    const shortLivedRes = await this.http.request<{
      access_token: string;
      user_id: string;
    }>("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: this.appId,
        client_secret: this.appSecret,
        grant_type: "authorization_code",
        redirect_uri: options.redirectUri,
        code: options.code,
      }),
    });

    const longLivedRes = await this.http.request<{
      access_token: string;
      token_type: string;
      expires_in: number;
    }>(`${this.apiBaseUrl}/access_token`, {
      method: "GET",
      params: {
        grant_type: "ig_exchange_token",
        client_secret: this.appSecret,
        access_token: shortLivedRes.data.access_token,
      },
    });

    const accessToken = longLivedRes.data.access_token;
    const profile = await this.verifyCredentials({ accessToken });

    return {
      accessToken,
      refreshToken: accessToken,
      expiresAt: new Date(Date.now() + longLivedRes.data.expires_in * 1000),
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
    const res = await this.http.request<InstagramTokenRefreshResponse>(
      `${this.apiBaseUrl}/refresh_access_token`,
      {
        method: "GET",
        params: {
          grant_type: "ig_refresh_token",
          access_token: refreshToken,
        },
      },
    );

    return {
      accessToken: res.data.access_token,
      refreshToken: res.data.access_token,
      expiresIn: res.data.expires_in,
      expiresAt: new Date(Date.now() + res.data.expires_in * 1000),
    };
  }

  public async verifyCredentials(credentials: AuthCredentials): Promise<UserProfile> {
    const res = await this.http.request<InstagramUserResponse>(`${this.apiBaseUrl}/me`, {
      method: "GET",
      bearerToken: credentials.accessToken,
      params: {
        fields: "id,username,name,profile_picture_url,followers_count",
      },
    });

    return {
      id: res.data.id,
      handle: res.data.username,
      name: res.data.name || res.data.username,
      avatarUrl: res.data.profile_picture_url,
      profileUrl: `https://instagram.com/${res.data.username}`,
      followerCount: res.data.followers_count,
      rawProfile: res.data as unknown as Record<string, unknown>,
    };
  }

  public validatePost(payload: UniversalPostPayload): ValidationResult {
    return validateInstagramPost(payload);
  }

  protected async executePublish(
    payload: UniversalPostPayload,
    credentials: AuthCredentials,
  ): Promise<PublishResult> {
    const igUserId = credentials.accountId || (await this.verifyCredentials(credentials)).id;
    const media = payload.media || [];
    const primaryMedia = media[0];

    let caption = payload.content;
    if (payload.tags && payload.tags.length > 0) {
      const extraTags = payload.tags
        .filter((t: string) => !caption.includes(`#${t.replace(/^#/, "")}`))
        .map((t: string) => (t.startsWith("#") ? t : `#${t}`))
        .join(" ");
      if (extraTags) {
        caption = `${caption}\n\n${extraTags}`.trim();
      }
    }

    const requestedType = payload.platformOptions?.mediaType;
    let creationId: string;

    if (media.length > 1 || requestedType === "CAROUSEL") {
      const children = await Promise.all(
        media.map(async (item) => {
          const child = await this.http.request<InstagramMediaContainerResponse>(
            `${this.apiBaseUrl}/${igUserId}/media`,
            {
              method: "POST",
              bearerToken: credentials.accessToken,
              params: {
                is_carousel_item: "true",
                ...(item.type === "video"
                  ? { media_type: "VIDEO", video_url: item.url }
                  : { image_url: item.url }),
              },
            },
          );
          return child.data.id;
        }),
      );
      const carousel = await this.http.request<InstagramMediaContainerResponse>(
        `${this.apiBaseUrl}/${igUserId}/media`,
        {
          method: "POST",
          bearerToken: credentials.accessToken,
          params: {
            media_type: "CAROUSEL",
            children: children.join(","),
            caption,
          },
        },
      );
      creationId = carousel.data.id;
    } else {
      const containerParams: Record<string, string> = { caption };
      if (requestedType === "STORIES") {
        containerParams.media_type = "STORIES";
        if (primaryMedia?.type === "video") containerParams.video_url = primaryMedia.url;
        else containerParams.image_url = primaryMedia?.url || "";
      } else if (primaryMedia?.type === "video") {
        containerParams.media_type = requestedType === "VIDEO" ? "VIDEO" : "REELS";
        containerParams.video_url = primaryMedia.url;
      } else {
        containerParams.image_url = primaryMedia?.url || "";
      }

      const containerRes = await this.http.request<InstagramMediaContainerResponse>(
        `${this.apiBaseUrl}/${igUserId}/media`,
        {
          method: "POST",
          bearerToken: credentials.accessToken,
          params: containerParams,
        },
      );
      creationId = containerRes.data.id;
    }

    if (media.some((item) => item.type === "video")) {
      for (let attempt = 0; attempt < 30; attempt += 1) {
        const status = await this.http.request<{ status_code: string }>(
          `${this.apiBaseUrl}/${creationId}`,
          {
            method: "GET",
            bearerToken: credentials.accessToken,
            params: { fields: "status_code" },
          },
        );
        if (status.data.status_code === "FINISHED") break;
        if (["ERROR", "EXPIRED"].includes(status.data.status_code)) {
          throw new Error(`Instagram media processing failed (${status.data.status_code})`);
        }
        if (attempt === 29) throw new Error("Instagram media processing is still pending");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    const publishRes = await this.http.request<InstagramPublishResponse>(
      `${this.apiBaseUrl}/${igUserId}/media_publish`,
      {
        method: "POST",
        bearerToken: credentials.accessToken,
        params: {
          creation_id: creationId,
        },
      },
    );

    return {
      success: true,
      externalPostId: publishRes.data.id,
      externalPostUrl: `https://www.instagram.com/p/${publishRes.data.id}`,
      publishedAt: new Date(),
      rawResponse: publishRes.data,
    };
  }
}
