import React from "react";
import {
  InstagramIcon,
  XIcon,
  LinkedInIcon,
  RedditIcon,
  TelegramIcon,
  FacebookIcon,
  TikTokIcon,
  YouTubeIcon,
  ThreadsIcon,
  BlueskyIcon,
  DiscordIcon,
  SlackIcon,
  WhatsAppIcon,
  PinterestIcon,
  DribbbleIcon,
  MastodonIcon,
  WhopIcon,
  TwitchIcon,
  SkoolIcon,
  KickIcon,
  WarpcastIcon,
  VkIcon,
  LemmyIcon,
  MeWeIcon,
  NostrIcon,
  ListmonkIcon,
  WordPressIcon,
  MediumIcon,
  HashnodeIcon,
  DevtoIcon,
  GithubIcon,
  GitLabIcon,
  ProductHuntIcon,
  HackerNewsIcon,
  SubstackIcon,
  BeehiivIcon,
  GhostIcon,
  NotionIcon,
  PatreonIcon,
  SpotifyIcon,
  BehanceIcon,
  TumblrIcon,
  GoogleBusinessIcon,
} from "@/component/icons/social-icons";
import { PlatformId } from "@/component/dashboard/types";

interface PlatformIconProps {
  platformId: PlatformId;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

export function PlatformIcon({ platformId, className = "" }: PlatformIconProps) {
  switch (platformId) {
    case "instagram":
      return <InstagramIcon className={className} />;
    case "twitter":
      return <XIcon className={className} />;
    case "linkedin":
      return <LinkedInIcon className={className} />;
    case "reddit":
      return <RedditIcon className={className} />;
    case "telegram":
      return <TelegramIcon className={className} />;
    case "facebook":
      return <FacebookIcon className={className} />;
    case "tiktok":
      return <TikTokIcon className={className} />;
    case "youtube":
      return <YouTubeIcon className={className} />;
    case "threads":
      return <ThreadsIcon className={className} />;
    case "bluesky":
      return <BlueskyIcon className={className} />;
    case "google_business":
      return <GoogleBusinessIcon className={className} />;
    case "discord":
      return <DiscordIcon className={className} />;
    case "slack":
      return <SlackIcon className={className} />;
    case "whatsapp":
      return <WhatsAppIcon className={className} />;
    case "pinterest":
      return <PinterestIcon className={className} />;
    case "dribbble":
      return <DribbbleIcon className={className} />;
    case "mastodon":
      return <MastodonIcon className={className} />;
    case "whop":
      return <WhopIcon className={className} />;
    case "twitch":
      return <TwitchIcon className={className} />;
    case "skool":
      return <SkoolIcon className={className} />;
    case "kick":
      return <KickIcon className={className} />;
    case "warpcast":
      return <WarpcastIcon className={className} />;
    case "vk":
      return <VkIcon className={className} />;
    case "lemmy":
      return <LemmyIcon className={className} />;
    case "mewe":
      return <MeWeIcon className={className} />;
    case "nostr":
      return <NostrIcon className={className} />;
    case "listmonk":
      return <ListmonkIcon className={className} />;
    case "wordpress":
      return <WordPressIcon className={className} />;
    case "medium":
      return <MediumIcon className={className} />;
    case "hashnode":
      return <HashnodeIcon className={className} />;
    case "devto":
      return <DevtoIcon className={className} />;
    case "github":
      return <GithubIcon className={className} />;
    case "gitlab":
      return <GitLabIcon className={className} />;
    case "producthunt":
      return <ProductHuntIcon className={className} />;
    case "hackernews":
      return <HackerNewsIcon className={className} />;
    case "substack":
      return <SubstackIcon className={className} />;
    case "beehiiv":
      return <BeehiivIcon className={className} />;
    case "ghost":
      return <GhostIcon className={className} />;
    case "notion":
      return <NotionIcon className={className} />;
    case "patreon":
      return <PatreonIcon className={className} />;
    case "spotify":
      return <SpotifyIcon className={className} />;
    case "behance":
      return <BehanceIcon className={className} />;
    case "tumblr":
      return <TumblrIcon className={className} />;
    default:
      return null;
  }
}

export function getPlatformDisplayName(platformId: PlatformId): string {
  switch (platformId) {
    case "twitter":
      return "X (Twitter)";
    case "linkedin":
      return "LinkedIn";
    case "instagram":
      return "Instagram";
    case "telegram":
      return "Telegram";
    case "reddit":
      return "Reddit";
    case "threads":
      return "Threads";
    case "facebook":
      return "Facebook";
    case "tiktok":
      return "TikTok";
    case "youtube":
      return "YouTube";
    case "bluesky":
      return "Bluesky";
    case "google_business":
      return "Google My Business";
    case "discord":
      return "Discord";
    case "slack":
      return "Slack";
    case "whatsapp":
      return "WhatsApp";
    case "pinterest":
      return "Pinterest";
    case "dribbble":
      return "Dribbble";
    case "mastodon":
      return "Mastodon";
    case "whop":
      return "Whop";
    case "twitch":
      return "Twitch";
    case "skool":
      return "Skool";
    case "kick":
      return "Kick";
    case "warpcast":
      return "Warpcast";
    case "vk":
      return "VK";
    case "lemmy":
      return "Lemmy";
    case "mewe":
      return "MeWe";
    case "nostr":
      return "Nostr";
    case "listmonk":
      return "Listmonk";
    case "wordpress":
      return "WordPress";
    case "medium":
      return "Medium";
    case "hashnode":
      return "Hashnode";
    case "devto":
      return "Dev.to";
    case "github":
      return "GitHub";
    case "gitlab":
      return "GitLab";
    case "producthunt":
      return "Product Hunt";
    case "hackernews":
      return "Hacker News";
    case "substack":
      return "Substack";
    case "beehiiv":
      return "Beehiiv";
    case "ghost":
      return "Ghost";
    case "notion":
      return "Notion";
    case "patreon":
      return "Patreon";
    case "spotify":
      return "Spotify Podcasts";
    case "behance":
      return "Behance";
    case "tumblr":
      return "Tumblr";
    default:
      return platformId;
  }
}

export function getPlatformBrandColor(platformId: PlatformId): {
  bg: string;
  text: string;
  border: string;
  glow: string;
} {
  switch (platformId) {
    case "instagram":
      return {
        bg: "bg-pink-500/10 hover:bg-pink-500/15",
        text: "text-pink-400",
        border: "border-pink-500/20",
        glow: "shadow-pink-500/20",
      };
    case "twitter":
      return {
        bg: "bg-neutral-800/80 hover:bg-neutral-800",
        text: "text-neutral-200",
        border: "border-neutral-700",
        glow: "shadow-neutral-500/20",
      };
    case "linkedin":
      return {
        bg: "bg-sky-600/10 hover:bg-sky-600/15",
        text: "text-sky-400",
        border: "border-sky-500/20",
        glow: "shadow-sky-500/20",
      };
    case "reddit":
      return {
        bg: "bg-orange-600/10 hover:bg-orange-600/15",
        text: "text-orange-400",
        border: "border-orange-500/20",
        glow: "shadow-orange-500/20",
      };
    case "telegram":
      return {
        bg: "bg-cyan-500/10 hover:bg-cyan-500/15",
        text: "text-cyan-400",
        border: "border-cyan-500/20",
        glow: "shadow-cyan-500/20",
      };
    case "facebook":
      return {
        bg: "bg-blue-600/10 hover:bg-blue-600/15",
        text: "text-blue-400",
        border: "border-blue-500/20",
        glow: "shadow-blue-500/20",
      };
    case "tiktok":
      return {
        bg: "bg-teal-500/10 hover:bg-teal-500/15",
        text: "text-teal-400",
        border: "border-teal-500/20",
        glow: "shadow-teal-500/20",
      };
    case "youtube":
      return {
        bg: "bg-red-600/10 hover:bg-red-600/15",
        text: "text-red-400",
        border: "border-red-500/20",
        glow: "shadow-red-500/20",
      };
    case "threads":
      return {
        bg: "bg-neutral-800/60 hover:bg-neutral-800/80",
        text: "text-neutral-200",
        border: "border-neutral-700",
        glow: "shadow-neutral-500/20",
      };
    case "bluesky":
      return {
        bg: "bg-sky-500/10 hover:bg-sky-500/15",
        text: "text-sky-400",
        border: "border-sky-500/20",
        glow: "shadow-sky-500/20",
      };
    case "google_business":
      return {
        bg: "bg-blue-500/10 hover:bg-blue-500/15",
        text: "text-blue-400",
        border: "border-blue-500/20",
        glow: "shadow-blue-500/20",
      };
    case "discord":
      return {
        bg: "bg-indigo-500/10 hover:bg-indigo-500/15",
        text: "text-indigo-400",
        border: "border-indigo-500/20",
        glow: "shadow-indigo-500/20",
      };
    case "slack":
      return {
        bg: "bg-emerald-500/10 hover:bg-emerald-500/15",
        text: "text-emerald-400",
        border: "border-emerald-500/20",
        glow: "shadow-emerald-500/20",
      };
    case "whatsapp":
      return {
        bg: "bg-green-500/10 hover:bg-green-500/15",
        text: "text-green-400",
        border: "border-green-500/20",
        glow: "shadow-green-500/20",
      };
    case "pinterest":
      return {
        bg: "bg-red-500/10 hover:bg-red-500/15",
        text: "text-red-400",
        border: "border-red-500/20",
        glow: "shadow-red-500/20",
      };
    case "dribbble":
      return {
        bg: "bg-pink-500/10 hover:bg-pink-500/15",
        text: "text-pink-400",
        border: "border-pink-500/20",
        glow: "shadow-pink-500/20",
      };
    case "mastodon":
      return {
        bg: "bg-violet-500/10 hover:bg-violet-500/15",
        text: "text-violet-400",
        border: "border-violet-500/20",
        glow: "shadow-violet-500/20",
      };
    case "whop":
      return {
        bg: "bg-orange-500/10 hover:bg-orange-500/15",
        text: "text-orange-400",
        border: "border-orange-500/20",
        glow: "shadow-orange-500/20",
      };
    case "twitch":
      return {
        bg: "bg-purple-500/10 hover:bg-purple-500/15",
        text: "text-purple-400",
        border: "border-purple-500/20",
        glow: "shadow-purple-500/20",
      };
    case "skool":
      return {
        bg: "bg-blue-600/10 hover:bg-blue-600/15",
        text: "text-blue-400",
        border: "border-blue-500/20",
        glow: "shadow-blue-500/20",
      };
    case "kick":
      return {
        bg: "bg-lime-500/10 hover:bg-lime-500/15",
        text: "text-lime-400",
        border: "border-lime-500/20",
        glow: "shadow-lime-500/20",
      };
    case "warpcast":
      return {
        bg: "bg-purple-600/10 hover:bg-purple-600/15",
        text: "text-purple-400",
        border: "border-purple-500/20",
        glow: "shadow-purple-500/20",
      };
    case "vk":
      return {
        bg: "bg-sky-600/10 hover:bg-sky-600/15",
        text: "text-sky-400",
        border: "border-sky-500/20",
        glow: "shadow-sky-500/20",
      };
    case "lemmy":
      return {
        bg: "bg-neutral-700/50 hover:bg-neutral-700/70",
        text: "text-neutral-200",
        border: "border-neutral-600",
        glow: "shadow-neutral-500/20",
      };
    case "mewe":
      return {
        bg: "bg-teal-500/10 hover:bg-teal-500/15",
        text: "text-teal-400",
        border: "border-teal-500/20",
        glow: "shadow-teal-500/20",
      };
    case "nostr":
      return {
        bg: "bg-purple-500/10 hover:bg-purple-500/15",
        text: "text-purple-400",
        border: "border-purple-500/20",
        glow: "shadow-purple-500/20",
      };
    case "listmonk":
      return {
        bg: "bg-sky-500/10 hover:bg-sky-500/15",
        text: "text-sky-400",
        border: "border-sky-500/20",
        glow: "shadow-sky-500/20",
      };
    case "wordpress":
      return {
        bg: "bg-blue-600/10 hover:bg-blue-600/15",
        text: "text-blue-400",
        border: "border-blue-500/20",
        glow: "shadow-blue-500/20",
      };
    case "medium":
      return {
        bg: "bg-neutral-800/80 hover:bg-neutral-800",
        text: "text-neutral-200",
        border: "border-neutral-700",
        glow: "shadow-neutral-500/20",
      };
    case "hashnode":
      return {
        bg: "bg-blue-600/10 hover:bg-blue-600/15",
        text: "text-blue-400",
        border: "border-blue-500/20",
        glow: "shadow-blue-500/20",
      };
    case "devto":
      return {
        bg: "bg-neutral-800/80 hover:bg-neutral-800",
        text: "text-neutral-200",
        border: "border-neutral-700",
        glow: "shadow-neutral-500/20",
      };
    case "github":
      return {
        bg: "bg-neutral-800/80 hover:bg-neutral-800",
        text: "text-neutral-200",
        border: "border-neutral-700",
        glow: "shadow-neutral-500/20",
      };
    case "gitlab":
      return {
        bg: "bg-orange-600/10 hover:bg-orange-600/15",
        text: "text-orange-400",
        border: "border-orange-500/20",
        glow: "shadow-orange-500/20",
      };
    default:
      return {
        bg: "bg-neutral-800",
        text: "text-neutral-400",
        border: "border-neutral-700",
        glow: "shadow-none",
      };
  }
}
