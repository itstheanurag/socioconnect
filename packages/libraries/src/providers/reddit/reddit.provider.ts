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
import { REDDIT_LIMITS, validateRedditPost } from "./reddit.validator";
import type { RedditSubmitResponse, RedditUserResponse } from "./reddit.types";

export class RedditProvider extends BaseSocialProvider {
  private clientId: string;
  private clientSecret: string;
  private userAgent: string;

  constructor(
    clientId = "",
    clientSecret = "",
    userAgent = "socioconnect:v1.0.0 (by /u/socioconnect_app)",
  ) {
    super();
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.userAgent = userAgent;
  }

  public readonly metadata: ProviderMetadata = {
    id: "reddit",
    name: "Reddit",
    websiteUrl: "https://reddit.com",
    docsUrl: "https://www.reddit.com/dev/api",
    iconName: "reddit",
    defaultScopes: ["identity", "submit", "read"],
    capabilities: {
      supportsText: true,
      supportsMarkdown: true,
      supportsTitle: true,
      requiresTitle: true,
      supportsImages: true,
      requiresImage: false,
      maxImages: 1,
      supportsVideos: true,
      requiresVideo: false,
      maxVideos: 1,
      supportsLinks: true,
      supportsTags: false,
      maxTags: 0,
      supportsScheduling: false,
      supportsDrafts: false,
      supportsPolls: true,
      supportsThreads: false,
    },
    limits: REDDIT_LIMITS,
  };

  public getAuthUrl(options: AuthUrlOptions): string {
    const params = new URLSearchParams({
      client_id: this.clientId || options.additionalParams?.clientId || "",
      response_type: "code",
      state: options.state,
      redirect_uri: options.redirectUri,
      duration: "permanent",
      scope: (options.scopes || this.metadata.defaultScopes).join(" "),
    });
    return `https://www.reddit.com/api/v1/authorize?${params.toString()}`;
  }

  public async exchangeCode(options: ExchangeCodeOptions): Promise<AuthCredentials> {
    const basicAuth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");

    const res = await this.http.request<{
      access_token: string;
      token_type: string;
      expires_in: number;
      refresh_token?: string;
      scope: string;
    }>("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "User-Agent": this.userAgent,
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
    const basicAuth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");

    const res = await this.http.request<{
      access_token: string;
      token_type: string;
      expires_in: number;
      scope: string;
    }>("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "User-Agent": this.userAgent,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
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
    const res = await this.http.request<RedditUserResponse>("https://oauth.reddit.com/api/v1/me", {
      method: "GET",
      bearerToken: credentials.accessToken,
      headers: {
        "User-Agent": this.userAgent,
      },
    });

    return {
      id: res.data.id,
      handle: `u/${res.data.name}`,
      name: res.data.name,
      avatarUrl: res.data.icon_img?.split("?")[0],
      profileUrl: `https://reddit.com/user/${res.data.name}`,
      rawProfile: res.data as unknown as Record<string, unknown>,
    };
  }

  public validatePost(payload: UniversalPostPayload): ValidationResult {
    return validateRedditPost(payload);
  }

  protected async executePublish(
    payload: UniversalPostPayload,
    credentials: AuthCredentials,
  ): Promise<PublishResult> {
    const rawSubreddit = payload.platformOptions?.subreddit || "";
    const cleanSubreddit = rawSubreddit.replace(/^(r\/|\/r\/)/, "").trim();

    const kind = payload.linkUrl ? "link" : payload.media?.[0]?.url ? "link" : "self";

    const bodyParams: Record<string, string> = {
      api_type: "json",
      sr: cleanSubreddit,
      title: payload.title || "",
      kind,
      resubmit: "true",
      sendreplies: "true",
    };

    if (kind === "self") {
      bodyParams.text = payload.content;
    } else {
      bodyParams.url = payload.linkUrl || payload.media?.[0]?.url || "";
    }

    if (payload.platformOptions?.flairId) {
      bodyParams.flair_id = payload.platformOptions.flairId;
    }
    if (payload.platformOptions?.isNsfw) {
      bodyParams.nsfw = "true";
    }
    if (payload.platformOptions?.isSpoiler) {
      bodyParams.spoiler = "true";
    }

    const res = await this.http.request<RedditSubmitResponse>(
      "https://oauth.reddit.com/api/submit",
      {
        method: "POST",
        bearerToken: credentials.accessToken,
        headers: {
          "User-Agent": this.userAgent,
        },
        body: new URLSearchParams(bodyParams),
      },
    );

    if (res.data.json.errors && res.data.json.errors.length > 0) {
      const errMsg = res.data.json.errors.map((e: [string, string, string]) => e[1]).join(", ");
      throw new Error(`Reddit submission error: ${errMsg}`);
    }

    const postData = res.data.json.data;
    const postId = postData?.id || postData?.name || `t3_${Date.now()}`;
    const postUrl = postData?.url || `https://reddit.com/r/${cleanSubreddit}`;

    return {
      success: true,
      externalPostId: postId,
      externalPostUrl: postUrl,
      publishedAt: new Date(),
      rawResponse: res.data,
    };
  }
}
