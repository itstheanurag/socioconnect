import { ProviderRegistry } from "@repo/libraries";

export function createSocialProviderRegistry() {
  return ProviderRegistry.createDefault({
    twitterClientId: process.env.TWITTER_CLIENT_ID,
    twitterClientSecret: process.env.TWITTER_CLIENT_SECRET,
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    telegramDefaultChatId: process.env.TELEGRAM_DEFAULT_CHAT_ID,
    threadsAppId: process.env.THREADS_APP_ID,
    threadsAppSecret: process.env.THREADS_APP_SECRET,
    tiktokClientKey: process.env.TIKTOK_CLIENT_KEY,
    tiktokClientSecret: process.env.TIKTOK_CLIENT_SECRET,
    blueskyPdsUrl: process.env.BLUESKY_PDS_URL,
    dribbbleClientId: process.env.DRIBBBLE_CLIENT_ID,
    dribbbleClientSecret: process.env.DRIBBBLE_CLIENT_SECRET,
    mediumClientId: process.env.MEDIUM_CLIENT_ID,
    mediumClientSecret: process.env.MEDIUM_CLIENT_SECRET,
    youtubeClientId: process.env.YOUTUBE_CLIENT_ID,
    youtubeClientSecret: process.env.YOUTUBE_CLIENT_SECRET,
    instagramAppId: process.env.INSTAGRAM_APP_ID,
    instagramAppSecret: process.env.INSTAGRAM_APP_SECRET,
    discordClientId: process.env.DISCORD_CLIENT_ID,
    discordClientSecret: process.env.DISCORD_CLIENT_SECRET,
    redditClientId: process.env.REDDIT_CLIENT_ID,
    redditClientSecret: process.env.REDDIT_CLIENT_SECRET,
    redditUserAgent: process.env.REDDIT_USER_AGENT,
    linkedinClientId: process.env.LINKEDIN_CLIENT_ID,
    linkedinClientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    pinterestAppId: process.env.PINTEREST_APP_ID,
    pinterestAppSecret: process.env.PINTEREST_APP_SECRET,
    facebookAppId: process.env.FACEBOOK_APP_ID,
    facebookAppSecret: process.env.FACEBOOK_APP_SECRET,
  });
}

export function providerIdForPlatform(platform: string) {
  return platform === "x" ? "twitter" : platform;
}
