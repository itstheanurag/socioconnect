import type { BaseSocialProvider } from "../base/base.provider";
import type { SocialPlatform, ProviderMetadata } from "../types/provider.types";
import type { UniversalPostPayload, ValidationResult, ValidationError } from "../types/post.types";
import { BlueskyProvider } from "../providers/bluesky/bluesky.provider";
import { DribbbleProvider } from "../providers/dribbble/dribbble.provider";
import { DevToProvider } from "../providers/devto/devto.provider";
import { MediumProvider } from "../providers/medium/medium.provider";
import { YouTubeProvider } from "../providers/youtube/youtube.provider";
import { InstagramProvider } from "../providers/instagram/instagram.provider";
import { DiscordProvider } from "../providers/discord/discord.provider";
import { RedditProvider } from "../providers/reddit/reddit.provider";
import { LinkedInProvider } from "../providers/linkedin/linkedin.provider";
import { PinterestProvider } from "../providers/pinterest/pinterest.provider";
import { FacebookProvider } from "../providers/facebook/facebook.provider";

export interface ProviderRegistryConfig {
  blueskyPdsUrl?: string;
  dribbbleClientId?: string;
  dribbbleClientSecret?: string;
  mediumClientId?: string;
  mediumClientSecret?: string;
  youtubeClientId?: string;
  youtubeClientSecret?: string;
  instagramAppId?: string;
  instagramAppSecret?: string;
  discordClientId?: string;
  discordClientSecret?: string;
  redditClientId?: string;
  redditClientSecret?: string;
  redditUserAgent?: string;
  linkedinClientId?: string;
  linkedinClientSecret?: string;
  pinterestAppId?: string;
  pinterestAppSecret?: string;
  facebookAppId?: string;
  facebookAppSecret?: string;
}

export class ProviderRegistry {
  private providers = new Map<SocialPlatform, BaseSocialProvider>();

  public register(provider: BaseSocialProvider): this {
    this.providers.set(provider.platform, provider);
    return this;
  }

  public get(platform: SocialPlatform): BaseSocialProvider {
    const provider = this.providers.get(platform);
    if (!provider) {
      throw new Error(`Provider for platform '${platform}' is not registered in ProviderRegistry.`);
    }
    return provider;
  }

  public has(platform: SocialPlatform): boolean {
    return this.providers.has(platform);
  }

  public getAll(): BaseSocialProvider[] {
    return Array.from(this.providers.values());
  }

  public getAllMetadata(): ProviderMetadata[] {
    return this.getAll().map((p) => p.metadata);
  }

  /**
   * Validates a universal post against multiple target platforms simultaneously
   */
  public async validateMultiPlatform(
    payload: UniversalPostPayload,
    platforms: SocialPlatform[],
  ): Promise<{
    results: Record<SocialPlatform, ValidationResult>;
    allValid: boolean;
    criticalErrorsCount: number;
  }> {
    const results = {} as Record<SocialPlatform, ValidationResult>;
    let allValid = true;
    let criticalErrorsCount = 0;

    for (const platform of platforms) {
      if (this.has(platform)) {
        const provider = this.get(platform);
        const res = await provider.validatePost(payload);
        results[platform] = res;
        if (!res.valid) {
          allValid = false;
          criticalErrorsCount += res.errors.filter((e: ValidationError) => e.critical).length;
        }
      }
    }

    return {
      results,
      allValid,
      criticalErrorsCount,
    };
  }

  /**
   * Creates a default registry with all 11 social providers instantiated
   */
  public static createDefault(config: ProviderRegistryConfig = {}): ProviderRegistry {
    const registry = new ProviderRegistry();

    registry.register(new BlueskyProvider(config.blueskyPdsUrl));
    registry.register(new DribbbleProvider(config.dribbbleClientId, config.dribbbleClientSecret));
    registry.register(new DevToProvider());
    registry.register(new MediumProvider(config.mediumClientId, config.mediumClientSecret));
    registry.register(new YouTubeProvider(config.youtubeClientId, config.youtubeClientSecret));
    registry.register(new InstagramProvider(config.instagramAppId, config.instagramAppSecret));
    registry.register(new DiscordProvider(config.discordClientId, config.discordClientSecret));
    registry.register(
      new RedditProvider(config.redditClientId, config.redditClientSecret, config.redditUserAgent),
    );
    registry.register(new LinkedInProvider(config.linkedinClientId, config.linkedinClientSecret));
    registry.register(new PinterestProvider(config.pinterestAppId, config.pinterestAppSecret));
    registry.register(new FacebookProvider(config.facebookAppId, config.facebookAppSecret));

    return registry;
  }
}
