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
import { countBytes } from "../../utils/text-counter";
import { BLUESKY_LIMITS, validateBlueskyPost } from "./bluesky.validator";
import type {
  BlueskyCreateSessionResponse,
  BlueskyProfileResponse,
  BlueskyRecordResponse,
  BlueskyFacet,
} from "./bluesky.types";

export class BlueskyProvider extends BaseSocialProvider {
  private pdsUrl: string;

  constructor(pdsUrl = "https://bsky.social") {
    super();
    this.pdsUrl = pdsUrl;
  }

  public readonly metadata: ProviderMetadata = {
    id: "bluesky",
    name: "Bluesky",
    websiteUrl: "https://bsky.app",
    docsUrl: "https://docs.bsky.app",
    iconName: "bluesky",
    defaultScopes: ["atproto"],
    capabilities: {
      supportsText: true,
      supportsMarkdown: false,
      supportsTitle: false,
      requiresTitle: false,
      supportsImages: true,
      requiresImage: false,
      maxImages: 4,
      supportsVideos: false,
      requiresVideo: false,
      maxVideos: 0,
      supportsLinks: true,
      supportsTags: true,
      maxTags: 8,
      supportsScheduling: false,
      supportsDrafts: false,
      supportsPolls: false,
      supportsThreads: true,
    },
    limits: BLUESKY_LIMITS,
  };

  public getAuthUrl(_options: AuthUrlOptions): string {
    return "https://bsky.app/settings/app-passwords";
  }

  public async exchangeCode(options: ExchangeCodeOptions): Promise<AuthCredentials> {
    const handle = options.code; // In App Password flow, handle is passed
    const appPassword = options.codeVerifier || "";

    const res = await this.http.request<BlueskyCreateSessionResponse>(
      `${this.pdsUrl}/xrpc/com.atproto.server.createSession`,
      {
        method: "POST",
        body: {
          identifier: handle,
          password: appPassword,
        },
      },
    );

    return {
      accessToken: res.data.accessJwt,
      refreshToken: res.data.refreshJwt,
      accountId: res.data.did,
      accountHandle: res.data.handle,
      accountName: res.data.handle,
    };
  }

  public async refreshToken(
    refreshToken: string,
    _currentCredentials?: AuthCredentials,
  ): Promise<TokenRefreshResult> {
    const res = await this.http.request<{
      accessJwt: string;
      refreshJwt: string;
      did: string;
      handle: string;
    }>(`${this.pdsUrl}/xrpc/com.atproto.server.refreshSession`, {
      method: "POST",
      bearerToken: refreshToken,
    });

    return {
      accessToken: res.data.accessJwt,
      refreshToken: res.data.refreshJwt,
      scopes: ["atproto"],
    };
  }

  public async verifyCredentials(credentials: AuthCredentials): Promise<UserProfile> {
    const actor = credentials.accountId || credentials.accountHandle || "me";

    const res = await this.http.request<BlueskyProfileResponse>(
      `${this.pdsUrl}/xrpc/app.bsky.actor.getProfile`,
      {
        method: "GET",
        bearerToken: credentials.accessToken,
        params: { actor },
      },
    );

    return {
      id: res.data.did,
      handle: res.data.handle,
      name: res.data.displayName || res.data.handle,
      avatarUrl: res.data.avatar,
      profileUrl: `https://bsky.app/profile/${res.data.handle}`,
      followerCount: res.data.followersCount,
      rawProfile: res.data as unknown as Record<string, unknown>,
    };
  }

  public validatePost(payload: UniversalPostPayload): ValidationResult {
    return validateBlueskyPost(payload);
  }

  protected async executePublish(
    payload: UniversalPostPayload,
    credentials: AuthCredentials,
  ): Promise<PublishResult> {
    const did = credentials.accountId;
    if (!did) {
      throw new Error("Bluesky publishing requires authenticated DID in credentials.accountId.");
    }

    const facets = this.extractFacets(payload.content);

    const record: Record<string, unknown> = {
      $type: "app.bsky.feed.post",
      text: payload.content,
      createdAt: new Date().toISOString(),
      facets: facets.length > 0 ? facets : undefined,
      langs: payload.platformOptions?.langs || ["en"],
    };

    if (payload.tags && payload.tags.length > 0) {
      record.tags = payload.tags.map((t) => t.replace(/^#/, ""));
    }

    const res = await this.http.request<BlueskyRecordResponse>(
      `${this.pdsUrl}/xrpc/com.atproto.repo.createRecord`,
      {
        method: "POST",
        bearerToken: credentials.accessToken,
        body: {
          repo: did,
          collection: "app.bsky.feed.post",
          record,
        },
      },
    );

    const rkey = res.data.uri.split("/").pop();
    const handle = credentials.accountHandle || did;
    const postUrl = `https://bsky.app/profile/${handle}/post/${rkey}`;

    return {
      success: true,
      externalPostId: res.data.uri,
      externalPostUrl: postUrl,
      publishedAt: new Date(),
      rawResponse: res.data,
    };
  }

  private extractFacets(text: string): BlueskyFacet[] {
    const facets: BlueskyFacet[] = [];

    // URL regex
    const urlRegex = /https?:\/\/[^\s]+/g;
    let match: RegExpExecArray | null;

    while ((match = urlRegex.exec(text)) !== null) {
      const url = match[0];
      const startChar = match.index;

      const byteStart = countBytes(text.slice(0, startChar));
      const byteEnd = byteStart + countBytes(url);

      facets.push({
        index: { byteStart, byteEnd },
        features: [{ $type: "app.bsky.richtext.facet#link", uri: url }],
      });
    }

    // Hashtags regex
    const hashtagRegex = /#([\p{L}\p{N}_]+)/gu;
    while ((match = hashtagRegex.exec(text)) !== null) {
      const tag = match[1];
      const fullTag = match[0];
      const startChar = match.index;

      const byteStart = countBytes(text.slice(0, startChar));
      const byteEnd = byteStart + countBytes(fullTag);

      facets.push({
        index: { byteStart, byteEnd },
        features: [{ $type: "app.bsky.richtext.facet#tag", tag }],
      });
    }

    return facets;
  }
}
