import type { BaseSocialProvider } from "@/base/base.provider";
import type { SocialPlatform, ProviderMetadata } from "@/types/provider.types";
import type { UniversalPostPayload, ValidationResult, ValidationError } from "@/types/post.types";
import { TwitterProvider } from "@/providers/twitter/twitter.provider";
import { TelegramProvider } from "@/providers/telegram/telegram.provider";
import { ThreadsProvider } from "@/providers/threads/threads.provider";
import { TikTokProvider } from "@/providers/tiktok/tiktok.provider";
import { BlueskyProvider } from "@/providers/bluesky/bluesky.provider";
import { DribbbleProvider } from "@/providers/dribbble/dribbble.provider";
import { DevToProvider } from "@/providers/devto/devto.provider";
import { MediumProvider } from "@/providers/medium/medium.provider";
import { YouTubeProvider } from "@/providers/youtube/youtube.provider";
import { InstagramProvider } from "@/providers/instagram/instagram.provider";
import { DiscordProvider } from "@/providers/discord/discord.provider";
import { RedditProvider } from "@/providers/reddit/reddit.provider";
import { LinkedInProvider } from "@/providers/linkedin/linkedin.provider";
import { PinterestProvider } from "@/providers/pinterest/pinterest.provider";
import { FacebookProvider } from "@/providers/facebook/facebook.provider";
import { GoogleBusinessProvider } from "@/providers/google_business/google_business.provider";
import { SlackProvider } from "@/providers/slack/slack.provider";
import { WhatsAppProvider } from "@/providers/whatsapp/whatsapp.provider";
import { MastodonProvider } from "@/providers/mastodon/mastodon.provider";
import { WhopProvider } from "@/providers/whop/whop.provider";
import { TwitchProvider } from "@/providers/twitch/twitch.provider";
import { SkoolProvider } from "@/providers/skool/skool.provider";
import { KickProvider } from "@/providers/kick/kick.provider";
import { WarpcastProvider } from "@/providers/warpcast/warpcast.provider";
import { VkProvider } from "@/providers/vk/vk.provider";
import { LemmyProvider } from "@/providers/lemmy/lemmy.provider";
import { MeWeProvider } from "@/providers/mewe/mewe.provider";
import { NostrProvider } from "@/providers/nostr/nostr.provider";
import { ListmonkProvider } from "@/providers/listmonk/listmonk.provider";
import { WordPressProvider } from "@/providers/wordpress/wordpress.provider";
import { HashnodeProvider } from "@/providers/hashnode/hashnode.provider";
import { GitHubProvider } from "@/providers/github/github.provider";
import { GitLabProvider } from "@/providers/gitlab/gitlab.provider";
import { ProductHuntProvider } from "@/providers/producthunt/producthunt.provider";
import { HackerNewsProvider } from "@/providers/hackernews/hackernews.provider";
import { SubstackProvider } from "@/providers/substack/substack.provider";
import { BeehiivProvider } from "@/providers/beehiiv/beehiiv.provider";
import { GhostProvider } from "@/providers/ghost/ghost.provider";
import { NotionProvider } from "@/providers/notion/notion.provider";
import { PatreonProvider } from "@/providers/patreon/patreon.provider";
import { SpotifyProvider } from "@/providers/spotify/spotify.provider";
import { BehanceProvider } from "@/providers/behance/behance.provider";
import { TumblrProvider } from "@/providers/tumblr/tumblr.provider";

export interface ProviderRegistryConfig {
  twitterClientId?: string;
  twitterClientSecret?: string;
  telegramBotToken?: string;
  telegramDefaultChatId?: string;
  threadsAppId?: string;
  threadsAppSecret?: string;
  tiktokClientKey?: string;
  tiktokClientSecret?: string;
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
  googleBusinessClientId?: string;
  googleBusinessClientSecret?: string;
  slackClientId?: string;
  slackClientSecret?: string;
  whatsappAccessToken?: string;
  mastodonInstanceUrl?: string;
  whopApiKey?: string;
  twitchClientId?: string;
  twitchClientSecret?: string;
  skoolApiKey?: string;
  kickClientId?: string;
  warpcastApiKey?: string;
  vkClientId?: string;
  vkClientSecret?: string;
  lemmyInstanceUrl?: string;
  meweClientId?: string;
  nostrRelayUrl?: string;
  listmonkApiUrl?: string;
  wordpressClientId?: string;
  hashnodeApiKey?: string;
  githubClientId?: string;
  githubClientSecret?: string;
  gitlabClientId?: string;
  producthuntClientId?: string;
  producthuntClientSecret?: string;
  hackernewsApiKey?: string;
  substackApiKey?: string;
  beehiivApiKey?: string;
  ghostAdminApiKey?: string;
  notionIntegrationSecret?: string;
  patreonClientId?: string;
  spotifyClientId?: string;
  behanceClientId?: string;
  tumblrClientId?: string;
}

export class ProviderRegistry {
  private providers = new Map<SocialPlatform, BaseSocialProvider>();

  private normalizePlatform(platform: SocialPlatform): SocialPlatform {
    return platform === "x" ? "twitter" : platform;
  }

  public register(provider: BaseSocialProvider): this {
    this.providers.set(provider.platform, provider);
    return this;
  }

  public get(platform: SocialPlatform): BaseSocialProvider {
    const provider = this.providers.get(this.normalizePlatform(platform));
    if (!provider) {
      throw new Error(`Provider for platform '${platform}' is not registered in ProviderRegistry.`);
    }
    return provider;
  }

  public has(platform: SocialPlatform): boolean {
    return this.providers.has(this.normalizePlatform(platform));
  }

  public getAll(): BaseSocialProvider[] {
    return Array.from(this.providers.values());
  }

  public getAllMetadata(): ProviderMetadata[] {
    return this.getAll().map((p) => p.metadata);
  }

  /**
   * Validates a universal post against every requested platform.
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
        const res = provider.validatePost(payload);
        results[platform] = res;
        if (!res.valid) {
          allValid = false;
          criticalErrorsCount += res.errors.filter((e: ValidationError) => e.critical).length;
        }
      } else {
        results[platform] = {
          valid: false,
          errors: [
            {
              field: "platform",
              message: `Provider for ${platform} is not registered.`,
              code: "PROVIDER_NOT_REGISTERED",
              critical: true,
            },
          ],
          warnings: [],
          characterCount: payload.content.length,
          maxCharacters: 0,
          remainingCharacters: 0,
        };
        allValid = false;
        criticalErrorsCount += 1;
      }
    }

    return {
      results,
      allValid,
      criticalErrorsCount,
    };
  }

  /**
   * Creates a default registry with all providers instantiated
   */
  public static createDefault(config: ProviderRegistryConfig = {}): ProviderRegistry {
    const registry = new ProviderRegistry();

    // 1. Core Social & Video
    registry.register(new TwitterProvider(config.twitterClientId, config.twitterClientSecret));
    registry.register(new TelegramProvider(config.telegramBotToken, config.telegramDefaultChatId));
    registry.register(new ThreadsProvider(config.threadsAppId, config.threadsAppSecret));
    registry.register(new TikTokProvider(config.tiktokClientKey, config.tiktokClientSecret));
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

    // 2. New Platforms from Specification
    registry.register(new GoogleBusinessProvider(config.googleBusinessClientId, config.googleBusinessClientSecret));
    registry.register(new SlackProvider(config.slackClientId, config.slackClientSecret));
    registry.register(new WhatsAppProvider());
    registry.register(new MastodonProvider());
    registry.register(new WhopProvider(config.whopApiKey));
    registry.register(new TwitchProvider(config.twitchClientId, config.twitchClientSecret));
    registry.register(new SkoolProvider(config.skoolApiKey));
    registry.register(new KickProvider(config.kickClientId));
    registry.register(new WarpcastProvider(config.warpcastApiKey));
    registry.register(new VkProvider(config.vkClientId, config.vkClientSecret));
    registry.register(new LemmyProvider());
    registry.register(new MeWeProvider(config.meweClientId));
    registry.register(new NostrProvider());
    registry.register(new ListmonkProvider());
    registry.register(new WordPressProvider(config.wordpressClientId));
    registry.register(new HashnodeProvider(config.hashnodeApiKey));

    // 3. Automation, Developers, Newsletters & Creator Suites
    registry.register(new GitHubProvider(config.githubClientId, config.githubClientSecret));
    registry.register(new GitLabProvider(config.gitlabClientId));
    registry.register(new ProductHuntProvider(config.producthuntClientId, config.producthuntClientSecret));
    registry.register(new HackerNewsProvider(config.hackernewsApiKey));
    registry.register(new SubstackProvider(config.substackApiKey));
    registry.register(new BeehiivProvider(config.beehiivApiKey));
    registry.register(new GhostProvider(config.ghostAdminApiKey));
    registry.register(new NotionProvider(config.notionIntegrationSecret));
    registry.register(new PatreonProvider(config.patreonClientId));
    registry.register(new SpotifyProvider(config.spotifyClientId));
    registry.register(new BehanceProvider(config.behanceClientId));
    registry.register(new TumblrProvider(config.tumblrClientId));

    return registry;
  }
}
