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
import { TWITTER_LIMITS, validateTwitterPost } from "./twitter.validator";
import type {
  TwitterTokenResponse,
  TwitterTweetResponse,
  TwitterUserResponse,
} from "./twitter.types";

export class TwitterProvider extends BaseSocialProvider {
  private clientId: string;
  private clientSecret: string;
  private apiBaseUrl = "https://api.twitter.com/2";

  constructor(clientId = "", clientSecret = "") {
    super();
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  public readonly metadata: ProviderMetadata = {
    id: "twitter",
    name: "X (Twitter)",
    websiteUrl: "https://x.com",
    docsUrl: "https://developer.x.com/en/docs/twitter-api",
    iconName: "twitter",
    defaultScopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    capabilities: {
      supportsText: true,
      supportsMarkdown: false,
      supportsTitle: false,
      requiresTitle: false,
      supportsImages: true,
      requiresImage: false,
      maxImages: 4,
      supportsVideos: true,
      requiresVideo: false,
      maxVideos: 1,
      supportsLinks: true,
      supportsTags: true,
      maxTags: 10,
      supportsScheduling: true,
      supportsDrafts: false,
      supportsPolls: true,
      supportsThreads: true,
    },
    limits: TWITTER_LIMITS,
  };

  public getAuthUrl(options: AuthUrlOptions): string {
    const codeChallenge = options.codeChallenge;
    if (!codeChallenge) throw new Error("Twitter OAuth requires a PKCE code challenge");
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.clientId || options.additionalParams?.clientId || "",
      redirect_uri: options.redirectUri,
      scope: (options.scopes || this.metadata.defaultScopes).join(" "),
      state: options.state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });
    return (
      `https://twitter.com/i/oauth2/authorize?${params.toString()}` +
      (options.additionalParams?.prompt ? `&prompt=${options.additionalParams.prompt}` : "")
    );
  }

  public async exchangeCode(options: ExchangeCodeOptions): Promise<AuthCredentials> {
    const basicAuth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
    const bodyParams = new URLSearchParams({
      code: options.code,
      grant_type: "authorization_code",
      redirect_uri: options.redirectUri,
      code_verifier: options.codeVerifier || "",
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
    };
    if (this.clientSecret) {
      headers.Authorization = `Basic ${basicAuth}`;
    }

    const res = await this.http.request<TwitterTokenResponse>(
      "https://api.twitter.com/2/oauth2/token",
      {
        method: "POST",
        headers,
        body: bodyParams,
      },
    );

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
    const bodyParams = new URLSearchParams({
      refresh_token: refreshToken,
      grant_type: "refresh_token",
      client_id: this.clientId,
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
    };
    if (this.clientSecret) {
      headers.Authorization = `Basic ${basicAuth}`;
    }

    const res = await this.http.request<TwitterTokenResponse>(
      "https://api.twitter.com/2/oauth2/token",
      {
        method: "POST",
        headers,
        body: bodyParams,
      },
    );

    return {
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token || refreshToken,
      expiresIn: res.data.expires_in,
      expiresAt: new Date(Date.now() + res.data.expires_in * 1000),
      scopes: res.data.scope ? res.data.scope.split(" ") : undefined,
    };
  }

  public async verifyCredentials(credentials: AuthCredentials): Promise<UserProfile> {
    const res = await this.http.request<TwitterUserResponse>(`${this.apiBaseUrl}/users/me`, {
      method: "GET",
      bearerToken: credentials.accessToken,
      params: {
        "user.fields": "profile_image_url,verified,description",
      },
    });

    const user = res.data.data;
    return {
      id: user.id,
      handle: `@${user.username}`,
      name: user.name,
      avatarUrl: user.profile_image_url,
      profileUrl: `https://x.com/${user.username}`,
      rawProfile: res.data as unknown as Record<string, unknown>,
    };
  }

  public validatePost(payload: UniversalPostPayload): ValidationResult {
    return validateTwitterPost(payload);
  }

  protected async executePublish(
    payload: UniversalPostPayload,
    credentials: AuthCredentials,
  ): Promise<PublishResult> {
    const tweetBody: Record<string, unknown> = {};

    let content = payload.content;
    if (payload.linkUrl && !content.includes(payload.linkUrl)) {
      content = `${content} ${payload.linkUrl}`.trim();
    }
    tweetBody.text = content;

    // Platform specific options
    const options = payload.platformOptions;
    if (options?.replyToTweetId) {
      tweetBody.reply = { in_reply_to_tweet_id: options.replyToTweetId };
    }
    if (options?.quoteTweetId) {
      tweetBody.quote_tweet_id = options.quoteTweetId;
    }
    if (options?.pollOptions && options.pollOptions.length >= 2) {
      tweetBody.poll = {
        options: options.pollOptions,
        duration_minutes: options.pollDurationMinutes || 1440,
      };
    }

    const res = await this.http.request<TwitterTweetResponse>(`${this.apiBaseUrl}/tweets`, {
      method: "POST",
      bearerToken: credentials.accessToken,
      headers: {
        "Content-Type": "application/json",
      },
      body: tweetBody,
    });

    const tweetId = res.data.data.id;
    const tweetUrl = `https://x.com/i/status/${tweetId}`;

    return {
      success: true,
      externalPostId: tweetId,
      externalPostUrl: tweetUrl,
      publishedAt: new Date(),
      rawResponse: res.data,
    };
  }
}
