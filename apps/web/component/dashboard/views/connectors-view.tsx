"use client";

import React, { useState, useMemo } from "react";
import {
  Link2,
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  X,
  Search,
  Key,
  Globe,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Check,
  Layers,
  Radio,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useDashboard } from "@/component/dashboard/context/dashboard-context";
import {
  PlatformIcon,
  getPlatformBrandColor,
  getPlatformDisplayName,
} from "@/component/dashboard/ui/platform-icon";
import { ConnectorAccount, PlatformId } from "@/component/dashboard/types";
import { PLATFORM_CAPABILITIES } from "@/component/dashboard/data/mock-data";

export interface PlatformConfigMeta {
  id: PlatformId;
  name: string;
  category: "social" | "video" | "publishing" | "community" | "developer";
  authType: "oauth" | "api_key" | "instance_url" | "protocol";
  authBadge: string;
  defaultHandlePrefix?: string;
  instructions: string;
  fields: {
    key: string;
    label: string;
    placeholder: string;
    type?: "text" | "password" | "url";
    required?: boolean;
    helperText?: string;
  }[];
}

const ALL_AVAILABLE_PLATFORMS: PlatformConfigMeta[] = [
  // Social & Microblogging
  {
    id: "facebook",
    name: "Facebook Pages & Groups",
    category: "social",
    authType: "oauth",
    authBadge: "Facebook Graph OAuth",
    defaultHandlePrefix: "@",
    instructions:
      "Connect your Facebook Page or Group to schedule status updates, images, and videos.",
    fields: [
      {
        key: "pageName",
        label: "Page / Group Name",
        placeholder: "e.g. My Brand Page",
        required: true,
      },
      {
        key: "handle",
        label: "Page Handle or Username",
        placeholder: "@brandpage",
        required: true,
      },
    ],
  },
  {
    id: "instagram",
    name: "Instagram Professional",
    category: "social",
    authType: "oauth",
    authBadge: "Meta Graph API",
    defaultHandlePrefix: "@",
    instructions: "Authenticate via Meta Business Suite to schedule Carousels, Stories, and Reels.",
    fields: [
      { key: "handle", label: "Instagram Handle", placeholder: "@username", required: true },
      { key: "accountName", label: "Display Name", placeholder: "Brand Name", required: true },
    ],
  },
  {
    id: "threads",
    name: "Meta Threads",
    category: "social",
    authType: "oauth",
    authBadge: "Threads OAuth 2.0",
    defaultHandlePrefix: "@",
    instructions:
      "Connect your Threads account for 500-character posts, threads, and multi-media drops.",
    fields: [{ key: "handle", label: "Threads Handle", placeholder: "@username", required: true }],
  },
  {
    id: "twitter",
    name: "X (formerly Twitter)",
    category: "social",
    authType: "oauth",
    authBadge: "OAuth 2.0 PKCE",
    defaultHandlePrefix: "@",
    instructions:
      "Authorize write:tweets and users.read permissions for threads and media publishing.",
    fields: [{ key: "handle", label: "X Username", placeholder: "@handle", required: true }],
  },
  {
    id: "linkedin",
    name: "LinkedIn Company & Profile",
    category: "social",
    authType: "oauth",
    authBadge: "OAuth 2.0 OpenID",
    defaultHandlePrefix: "in/",
    instructions:
      "Schedule long-form thought leadership articles, documents, and company announcements.",
    fields: [
      {
        key: "accountName",
        label: "Organization / Profile Name",
        placeholder: "Acme Inc.",
        required: true,
      },
      {
        key: "handle",
        label: "Vanity URL / Slug",
        placeholder: "acme-technologies",
        required: true,
      },
    ],
  },
  {
    id: "bluesky",
    name: "Bluesky Social",
    category: "social",
    authType: "api_key",
    authBadge: "AT Protocol / App Password",
    defaultHandlePrefix: "@",
    instructions:
      "Create an App Password from your Bluesky Settings (never use your main master password).",
    fields: [
      { key: "handle", label: "Bluesky Handle", placeholder: "handle.bsky.social", required: true },
      {
        key: "appPassword",
        label: "App Password",
        placeholder: "xxxx-xxxx-xxxx-xxxx",
        type: "password",
        required: true,
      },
    ],
  },
  {
    id: "mastodon",
    name: "Mastodon Fediverse",
    category: "social",
    authType: "instance_url",
    authBadge: "ActivityPub / Bearer Token",
    defaultHandlePrefix: "@",
    instructions:
      "Enter your Mastodon instance domain and personal access token (with write:statuses scope).",
    fields: [
      {
        key: "instanceUrl",
        label: "Instance Server URL",
        placeholder: "https://mastodon.social",
        type: "url",
        required: true,
      },
      {
        key: "accessToken",
        label: "User Access Token",
        placeholder: "Bearer token from Settings > Development",
        type: "password",
        required: true,
      },
      {
        key: "handle",
        label: "Mastodon Username",
        placeholder: "@username@mastodon.social",
        required: true,
      },
    ],
  },
  {
    id: "warpcast",
    name: "Warpcast (Farcaster)",
    category: "social",
    authType: "protocol",
    authBadge: "Signer UUID / Neynar API",
    defaultHandlePrefix: "@",
    instructions: "Link your Farcaster Signer UUID or Neynar Managed Signer to broadcast casts.",
    fields: [
      {
        key: "signerUuid",
        label: "Signer UUID",
        placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        type: "password",
        required: true,
      },
      { key: "handle", label: "Farcaster Username", placeholder: "@vitalik", required: true },
      { key: "fid", label: "Farcaster FID", placeholder: "e.g. 5650", required: false },
    ],
  },
  {
    id: "nostr",
    name: "Nostr Protocol",
    category: "social",
    authType: "protocol",
    authBadge: "Nsec Key / NIP-07 Extension",
    defaultHandlePrefix: "npub1",
    instructions:
      "Provide your NIP-19 Nsec private key (hardware encrypted at rest) or use NIP-07 browser signer.",
    fields: [
      { key: "npub", label: "Nostr Public Key (npub)", placeholder: "npub1...", required: true },
      {
        key: "nsec",
        label: "Nsec Key (or Relays configuration)",
        placeholder: "nsec1...",
        type: "password",
        required: true,
      },
      {
        key: "relays",
        label: "Relays (comma separated)",
        placeholder: "wss://relay.damus.io, wss://nos.lol",
        required: false,
      },
    ],
  },
  {
    id: "vk",
    name: "VKontakte",
    category: "social",
    authType: "oauth",
    authBadge: "VK OAuth 2.0",
    defaultHandlePrefix: "id",
    instructions:
      "Connect your VK Community or Profile for posts and stories across Eastern Europe.",
    fields: [
      {
        key: "handle",
        label: "VK Group ID or Username",
        placeholder: "club123456 or @username",
        required: true,
      },
      { key: "accountName", label: "Community Name", placeholder: "My VK Page", required: true },
    ],
  },
  {
    id: "mewe",
    name: "MeWe Social",
    category: "social",
    authType: "api_key",
    authBadge: "Bearer Token",
    defaultHandlePrefix: "@",
    instructions: "Connect to your MeWe Page or Group via developer access token.",
    fields: [
      {
        key: "handle",
        label: "MeWe Handle / Page Name",
        placeholder: "My Brand Community",
        required: true,
      },
      {
        key: "token",
        label: "MeWe Access Token",
        placeholder: "Bearer token",
        type: "password",
        required: true,
      },
    ],
  },

  // Video & Creator Platforms
  {
    id: "youtube",
    name: "YouTube Studio API",
    category: "video",
    authType: "oauth",
    authBadge: "Google OAuth 2.0",
    defaultHandlePrefix: "@",
    instructions: "Authorize Google OAuth to upload Shorts, long-form videos, and community posts.",
    fields: [
      { key: "channelName", label: "Channel Name", placeholder: "Acme Studios", required: true },
      { key: "handle", label: "Channel Handle", placeholder: "@AcmeStudios", required: true },
    ],
  },
  {
    id: "tiktok",
    name: "TikTok Content Posting API",
    category: "video",
    authType: "oauth",
    authBadge: "TikTok Login Kit",
    defaultHandlePrefix: "@",
    instructions:
      "Connect TikTok Creator or Business account to direct-publish video Reels and carousels.",
    fields: [{ key: "handle", label: "TikTok Username", placeholder: "@creator", required: true }],
  },
  {
    id: "twitch",
    name: "Twitch Broadcasts",
    category: "video",
    authType: "oauth",
    authBadge: "OAuth 2.0 Helix",
    defaultHandlePrefix: "twitch.tv/",
    instructions:
      "Broadcast stream markers, schedule updates, and live alerts to your channel feed.",
    fields: [
      { key: "handle", label: "Twitch Channel Name", placeholder: "streamer_hq", required: true },
    ],
  },
  {
    id: "kick",
    name: "Kick Streaming",
    category: "video",
    authType: "api_key",
    authBadge: "Kick API Key",
    defaultHandlePrefix: "kick.com/",
    instructions: "Connect your Kick streamer profile for automated announcements and clips.",
    fields: [
      { key: "handle", label: "Kick Channel Slug", placeholder: "channel_slug", required: true },
      {
        key: "apiKey",
        label: "Kick Developer Key",
        placeholder: "kick_key_...",
        type: "password",
        required: true,
      },
    ],
  },

  // Publishing & Newsletters
  {
    id: "medium",
    name: "Medium Publications",
    category: "publishing",
    authType: "api_key",
    authBadge: "Integration Token",
    defaultHandlePrefix: "@",
    instructions: "Get your Integration Token from Medium Settings > Security and apps.",
    fields: [
      {
        key: "token",
        label: "Integration Token",
        placeholder: "2a34...",
        type: "password",
        required: true,
      },
      {
        key: "handle",
        label: "Medium Author Handle",
        placeholder: "@writer_username",
        required: true,
      },
      {
        key: "publicationId",
        label: "Publication ID (Optional)",
        placeholder: "pub_1234...",
        required: false,
      },
    ],
  },
  {
    id: "devto",
    name: "Dev.to Articles",
    category: "publishing",
    authType: "api_key",
    authBadge: "Dev.to API Key",
    defaultHandlePrefix: "@",
    instructions: "Generate an API Key in Dev.to Settings > Extensions > DEV Community API Keys.",
    fields: [
      {
        key: "apiKey",
        label: "Dev.to API Key",
        placeholder: "devto_api_...",
        type: "password",
        required: true,
      },
      { key: "handle", label: "Dev.to Username or Org", placeholder: "dev_user", required: true },
    ],
  },
  {
    id: "hashnode",
    name: "Hashnode Blog",
    category: "publishing",
    authType: "api_key",
    authBadge: "Personal Access Token",
    defaultHandlePrefix: "@",
    instructions:
      "Generate a PAT in Hashnode Account Settings > Developer > Personal Access Token.",
    fields: [
      {
        key: "pat",
        label: "Personal Access Token",
        placeholder: "hashnode_pat_...",
        type: "password",
        required: true,
      },
      {
        key: "publicationId",
        label: "Publication Host/ID",
        placeholder: "blog.mybrand.com or 64b8...",
        required: true,
      },
      { key: "handle", label: "Author Handle", placeholder: "@hashnode_user", required: true },
    ],
  },
  {
    id: "wordpress",
    name: "WordPress CMS",
    category: "publishing",
    authType: "instance_url",
    authBadge: "REST API / App Password",
    defaultHandlePrefix: "wp/",
    instructions:
      "Enter your WordPress site URL and generate an Application Password in WP Users > Profile.",
    fields: [
      {
        key: "siteUrl",
        label: "WordPress Site URL",
        placeholder: "https://mywebsite.com",
        type: "url",
        required: true,
      },
      {
        key: "username",
        label: "WP Username / Admin",
        placeholder: "editor_admin",
        required: true,
      },
      {
        key: "appPassword",
        label: "Application Password",
        placeholder: "xxxx xxxx xxxx xxxx",
        type: "password",
        required: true,
      },
    ],
  },
  {
    id: "ghost",
    name: "Ghost Admin CMS",
    category: "publishing",
    authType: "instance_url",
    authBadge: "Admin API Key",
    defaultHandlePrefix: "ghost/",
    instructions:
      "Create a Custom Integration in Ghost Admin > Settings > Integrations to get your Admin API Key.",
    fields: [
      {
        key: "instanceUrl",
        label: "Ghost Site URL",
        placeholder: "https://publication.ghost.io",
        type: "url",
        required: true,
      },
      {
        key: "adminKey",
        label: "Admin API Key",
        placeholder: "64a123...:abcdef...",
        type: "password",
        required: true,
      },
      { key: "handle", label: "Publisher Label", placeholder: "Ghost Newsletter", required: true },
    ],
  },
  {
    id: "substack",
    name: "Substack Publications",
    category: "publishing",
    authType: "api_key",
    authBadge: "Session Secret / Token",
    defaultHandlePrefix: "substack/",
    instructions:
      "Connect to your Substack publication to schedule long-form posts and newsletter broadcasts.",
    fields: [
      {
        key: "subdomain",
        label: "Publication Subdomain",
        placeholder: "mybrand.substack.com",
        required: true,
      },
      {
        key: "sessionToken",
        label: "Substack SID Token",
        placeholder: "connect.sid value",
        type: "password",
        required: true,
      },
    ],
  },
  {
    id: "beehiiv",
    name: "Beehiiv Newsletters",
    category: "publishing",
    authType: "api_key",
    authBadge: "Beehiiv V2 API Key",
    defaultHandlePrefix: "beehiiv/",
    instructions:
      "Find your API Key and Publication ID in Beehiiv Settings > Integrations > API Keys.",
    fields: [
      {
        key: "apiKey",
        label: "Beehiiv API Key",
        placeholder: "bh_v2_...",
        type: "password",
        required: true,
      },
      {
        key: "publicationId",
        label: "Publication ID",
        placeholder: "pub_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        required: true,
      },
      { key: "handle", label: "Newsletter Name", placeholder: "The Tech Pulse", required: true },
    ],
  },
  {
    id: "tumblr",
    name: "Tumblr Blogs",
    category: "publishing",
    authType: "oauth",
    authBadge: "Tumblr OAuth 2.0",
    defaultHandlePrefix: "tumblr.com/",
    instructions: "Schedule photos, quotes, text essays, and rich media to your Tumblr blogs.",
    fields: [
      {
        key: "handle",
        label: "Tumblr Blog Identifier",
        placeholder: "myblog.tumblr.com",
        required: true,
      },
    ],
  },
  {
    id: "listmonk",
    name: "Listmonk Newsletters",
    category: "publishing",
    authType: "instance_url",
    authBadge: "Basic / API Token",
    defaultHandlePrefix: "listmonk/",
    instructions: "Connect your self-hosted Listmonk newsletter campaign manager instance.",
    fields: [
      {
        key: "instanceUrl",
        label: "Listmonk Instance URL",
        placeholder: "https://newsletter.mybrand.com",
        type: "url",
        required: true,
      },
      {
        key: "apiToken",
        label: "API Username:Password or Token",
        placeholder: "api_user:secret_pass",
        type: "password",
        required: true,
      },
      { key: "handle", label: "Campaign Label", placeholder: "VIP Developer List", required: true },
    ],
  },

  // Community & Messaging
  {
    id: "telegram",
    name: "Telegram Bot & Channels",
    category: "community",
    authType: "api_key",
    authBadge: "BotFather Token",
    defaultHandlePrefix: "@",
    instructions:
      "Generate a bot token via @BotFather and add the bot as administrator in your channel.",
    fields: [
      {
        key: "botToken",
        label: "Bot Token",
        placeholder: "123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ",
        type: "password",
        required: true,
      },
      { key: "handle", label: "Bot Username", placeholder: "@my_broadcast_bot", required: true },
      {
        key: "channelId",
        label: "Default Channel Username or ID",
        placeholder: "@my_channel",
        required: false,
      },
    ],
  },
  {
    id: "whatsapp",
    name: "WhatsApp Cloud API",
    category: "community",
    authType: "api_key",
    authBadge: "Meta Cloud API",
    defaultHandlePrefix: "+",
    instructions:
      "Connect your WhatsApp Business Account Phone Number ID and Meta System User Token.",
    fields: [
      {
        key: "phoneNumberId",
        label: "Phone Number ID",
        placeholder: "10982736452819",
        required: true,
      },
      {
        key: "accessToken",
        label: "Permanent Access Token",
        placeholder: "EAABw...",
        type: "password",
        required: true,
      },
      {
        key: "handle",
        label: "Sender Number or Label",
        placeholder: "+1 (555) 019-2834",
        required: true,
      },
    ],
  },
  {
    id: "discord",
    name: "Discord Bot & Webhooks",
    category: "community",
    authType: "oauth",
    authBadge: "Bot Token / Webhook",
    defaultHandlePrefix: "discord/",
    instructions:
      "Broadcast rich embeds, announcements, and release notifications to Discord servers.",
    fields: [
      {
        key: "handle",
        label: "Server / Guild Name",
        placeholder: "Developer Guild HQ",
        required: true,
      },
      {
        key: "webhookUrl",
        label: "Channel Webhook URL (Optional)",
        placeholder: "https://discord.com/api/webhooks/...",
        type: "url",
        required: false,
      },
    ],
  },
  {
    id: "slack",
    name: "Slack Workspaces",
    category: "community",
    authType: "oauth",
    authBadge: "OAuth 2.0 / Webhook",
    defaultHandlePrefix: "slack/",
    instructions:
      "Connect your Slack workspace for automated release drops and internal team alerts.",
    fields: [
      {
        key: "workspaceName",
        label: "Workspace Name",
        placeholder: "Acme Core Team",
        required: true,
      },
      { key: "handle", label: "Default Channel", placeholder: "#announcements", required: true },
    ],
  },
  {
    id: "reddit",
    name: "Reddit OAuth & Mod API",
    category: "community",
    authType: "oauth",
    authBadge: "Reddit OAuth 2.0",
    defaultHandlePrefix: "u/",
    instructions:
      "Authorize Reddit to submit posts, flairs, and link discussions to target subreddits.",
    fields: [
      { key: "handle", label: "Reddit Username", placeholder: "u/developer_team", required: true },
    ],
  },
  {
    id: "lemmy",
    name: "Lemmy Federation",
    category: "community",
    authType: "instance_url",
    authBadge: "JWT Token",
    defaultHandlePrefix: "lemmy/",
    instructions: "Connect to any Lemmy instance with your username and JWT credentials.",
    fields: [
      {
        key: "instanceUrl",
        label: "Lemmy Instance URL",
        placeholder: "https://lemmy.world",
        type: "url",
        required: true,
      },
      { key: "username", label: "Lemmy Username", placeholder: "my_user", required: true },
      {
        key: "jwtToken",
        label: "JWT Token / Password",
        placeholder: "JWT string",
        type: "password",
        required: true,
      },
    ],
  },
  {
    id: "skool",
    name: "Skool Community",
    category: "community",
    authType: "api_key",
    authBadge: "API Token / Webhook",
    defaultHandlePrefix: "skool/",
    instructions: "Automate posts and announcements directly into your Skool classroom community.",
    fields: [
      {
        key: "groupSlug",
        label: "Skool Group Slug",
        placeholder: "my-creator-mastermind",
        required: true,
      },
      {
        key: "apiToken",
        label: "API Token",
        placeholder: "skool_token_...",
        type: "password",
        required: true,
      },
    ],
  },
  {
    id: "whop",
    name: "Whop Community",
    category: "community",
    authType: "api_key",
    authBadge: "Whop API Key",
    defaultHandlePrefix: "whop/",
    instructions:
      "Publish announcements and digital product updates to your Whop community members.",
    fields: [
      {
        key: "apiKey",
        label: "Whop Developer Key",
        placeholder: "whop_api_...",
        type: "password",
        required: true,
      },
      { key: "companyId", label: "Company ID", placeholder: "biz_1234...", required: true },
      { key: "handle", label: "Store / Hub Name", placeholder: "Alpha Trader VIP", required: true },
    ],
  },
  {
    id: "hackernews",
    name: "Hacker News",
    category: "community",
    authType: "api_key",
    authBadge: "Bot Account / Webhook",
    defaultHandlePrefix: "hn/",
    instructions:
      "Configure your HN bot submitter or intent hook for Show HN / Launch submissions.",
    fields: [
      { key: "handle", label: "HN Username", placeholder: "hn_founder", required: true },
      {
        key: "userToken",
        label: "Session Cookie / Token",
        placeholder: "user auth cookie string",
        type: "password",
        required: true,
      },
    ],
  },

  // Developer & Design Ecosystem
  {
    id: "github",
    name: "GitHub Releases & Repos",
    category: "developer",
    authType: "oauth",
    authBadge: "OAuth 2.0 / PAT",
    defaultHandlePrefix: "github.com/",
    instructions: "Monitor releases and automatically draft release notes across social networks.",
    fields: [
      { key: "handle", label: "GitHub Org or User", placeholder: "socioconnect", required: true },
      {
        key: "repo",
        label: "Repository Name",
        placeholder: "socioconnect-engine",
        required: false,
      },
    ],
  },
  {
    id: "gitlab",
    name: "GitLab CI & Releases",
    category: "developer",
    authType: "oauth",
    authBadge: "OAuth 2.0 / PAT",
    defaultHandlePrefix: "gitlab.com/",
    instructions:
      "Link GitLab projects for automated CI/CD release triggers and changelog dispatches.",
    fields: [
      {
        key: "handle",
        label: "GitLab Group / Project Path",
        placeholder: "group/project",
        required: true,
      },
    ],
  },
  {
    id: "producthunt",
    name: "Product Hunt",
    category: "developer",
    authType: "api_key",
    authBadge: "Developer Token",
    defaultHandlePrefix: "ph/",
    instructions:
      "Generate a Developer Token in Product Hunt API dashboard to track and trigger launches.",
    fields: [
      {
        key: "apiKey",
        label: "Developer Token",
        placeholder: "ph_token_...",
        type: "password",
        required: true,
      },
      { key: "handle", label: "Maker Handle", placeholder: "@maker_username", required: true },
    ],
  },
  {
    id: "notion",
    name: "Notion Workspace",
    category: "developer",
    authType: "api_key",
    authBadge: "Internal Integration Secret",
    defaultHandlePrefix: "notion/",
    instructions:
      "Create an Internal Integration in Notion Developers and share target database pages.",
    fields: [
      {
        key: "apiKey",
        label: "Internal Integration Secret",
        placeholder: "secret_...",
        type: "password",
        required: true,
      },
      {
        key: "databaseId",
        label: "Content Database ID",
        placeholder: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        required: true,
      },
      { key: "handle", label: "Workspace Name", placeholder: "Acme Global HQ", required: true },
    ],
  },
  {
    id: "patreon",
    name: "Patreon Creators",
    category: "developer",
    authType: "oauth",
    authBadge: "Patreon OAuth 2.0",
    defaultHandlePrefix: "patreon.com/",
    instructions: "Publish patron-only posts, tier rewards announcements, and creator updates.",
    fields: [
      {
        key: "handle",
        label: "Campaign Name / URL",
        placeholder: "creator_studio",
        required: true,
      },
    ],
  },
  {
    id: "spotify",
    name: "Spotify Podcasts",
    category: "developer",
    authType: "oauth",
    authBadge: "Spotify Web API",
    defaultHandlePrefix: "spotify/",
    instructions:
      "Connect your Spotify for Podcasters show to automate episode releases and snippets.",
    fields: [
      {
        key: "handle",
        label: "Show Name / Identifier",
        placeholder: "The Full Stack Podcast",
        required: true,
      },
    ],
  },
  {
    id: "google_business",
    name: "Google My Business",
    category: "developer",
    authType: "oauth",
    authBadge: "Google Business Profile",
    defaultHandlePrefix: "gmb/",
    instructions:
      "Connect your verified Google Business location for local offers, events, and updates.",
    fields: [
      {
        key: "locationName",
        label: "Business / Location Name",
        placeholder: "SocioConnect HQ San Francisco",
        required: true,
      },
      {
        key: "handle",
        label: "Location Identifier",
        placeholder: "locations/1234567890",
        required: true,
      },
    ],
  },
  {
    id: "pinterest",
    name: "Pinterest Business API",
    category: "developer",
    authType: "oauth",
    authBadge: "Pinterest OAuth 2.0",
    defaultHandlePrefix: "@",
    instructions: "Publish Pins and link carousels with destination URLs to target boards.",
    fields: [
      { key: "handle", label: "Pinterest Username", placeholder: "@brand_pins", required: true },
    ],
  },
  {
    id: "dribbble",
    name: "Dribbble Portfolio",
    category: "developer",
    authType: "oauth",
    authBadge: "Dribbble OAuth 2.0",
    defaultHandlePrefix: "dribbble.com/",
    instructions: "Showcase UI designs, shots, and project attachments to the design community.",
    fields: [
      {
        key: "handle",
        label: "Designer / Team Handle",
        placeholder: "design_lead",
        required: true,
      },
    ],
  },
  {
    id: "behance",
    name: "Behance Portfolios",
    category: "developer",
    authType: "oauth",
    authBadge: "Adobe OAuth 2.0",
    defaultHandlePrefix: "behance.net/",
    instructions: "Broadcast design case studies, project covers, and creative work to Behance.",
    fields: [
      { key: "handle", label: "Behance Username", placeholder: "art_director", required: true },
    ],
  },
];

export function ConnectorsView() {
  const { connectors, toggleConnectorSync, addConnector, deleteConnector } = useDashboard();
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Tab: "all" | "connected" | "available"
  const [viewTab, setViewTab] = useState<"all" | "connected" | "available">("all");
  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  // Platform Connection Sub-Modal
  const [activePlatformToConnect, setActivePlatformToConnect] = useState<PlatformConfigMeta | null>(
    null,
  );
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const handleSync = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      toggleConnectorSync(id);
      setSyncingId(null);
    }, 600);
  };

  const connectedPlatformIds = useMemo(() => {
    return new Set(connectors.map((c) => c.platformId));
  }, [connectors]);

  // Combined platform directory list
  const platformDirectory = useMemo(() => {
    return ALL_AVAILABLE_PLATFORMS.map((platformMeta) => {
      const existingConnector = connectors.find((c) => c.platformId === platformMeta.id);
      return {
        meta: platformMeta,
        connector: existingConnector || null,
        isConnected: Boolean(existingConnector),
      };
    });
  }, [connectors]);

  // Filtered platforms
  const filteredDirectory = useMemo(() => {
    return platformDirectory.filter(({ meta, isConnected }) => {
      // Tab filter
      if (viewTab === "connected" && !isConnected) return false;
      if (viewTab === "available" && isConnected) return false;

      // Category filter
      if (selectedCategory !== "all" && meta.category !== selectedCategory) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = meta.name.toLowerCase().includes(query);
        const matchesId = meta.id.toLowerCase().includes(query);
        const matchesBadge = meta.authBadge.toLowerCase().includes(query);
        return matchesName || matchesId || matchesBadge;
      }

      return true;
    });
  }, [platformDirectory, viewTab, selectedCategory, searchQuery]);

  const handleSelectPlatform = (platform: PlatformConfigMeta) => {
    setActivePlatformToConnect(platform);
    setFormData({});
  };

  const handleCloseSubModal = () => {
    setActivePlatformToConnect(null);
    setFormData({});
    setIsSubmitting(false);
  };

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlatformToConnect) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const handle =
        formData.handle ||
        formData.username ||
        formData.pageName ||
        formData.channelName ||
        formData.workspaceName ||
        `@${activePlatformToConnect.id}_user`;

      const accountName =
        formData.accountName ||
        formData.pageName ||
        formData.channelName ||
        formData.workspaceName ||
        getPlatformDisplayName(activePlatformToConnect.id);

      const caps = PLATFORM_CAPABILITIES[activePlatformToConnect.id] || {
        text: true,
        maxTextLength: 2000,
        singleImage: true,
        carousel: false,
        maxCarouselImages: 1,
        video: false,
        maxVideoDurationSec: 0,
        audioMusic: false,
        markdown: false,
        threading: false,
        polls: false,
        scheduling: true,
      };

      const newConnector: ConnectorAccount = {
        id: `conn-${activePlatformToConnect.id}-${Date.now()}`,
        platformId: activePlatformToConnect.id,
        platformName: getPlatformDisplayName(activePlatformToConnect.id),
        accountHandle:
          handle.startsWith("@") || handle.startsWith("+") || handle.startsWith("http")
            ? handle
            : `@${handle}`,
        accountName,
        status: "connected",
        connectedAt: new Date().toISOString(),
        lastSyncAt: "Just now",
        capabilities: caps,
        stats: {
          followers: Math.floor(Math.random() * 8000) + 1200,
          postsCount: Math.floor(Math.random() * 45) + 3,
        },
      };

      addConnector(newConnector);
      setIsSubmitting(false);
      handleCloseSubModal();
    }, 700);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header & Stats Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
            Platform Directory &amp; Connectors
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Browse all supported networks, monitor authenticated accounts, and link new broadcast
            endpoints.
          </p>
        </div>

        {/* Quick telemetry badges */}
        <div className="flex items-center gap-2 text-xs font-mono self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{connectors.length} Connected</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400">
            <span>{ALL_AVAILABLE_PLATFORMS.length - connectors.length} Available</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3 bg-neutral-900/60 backdrop-blur-xl p-4 rounded-3xl border border-neutral-800">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Main View Tabs (All / Connected / Available) */}
          <div className="grid grid-cols-3 p-1 rounded-2xl bg-neutral-950/60 border border-neutral-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewTab("all")}
              className={`py-1.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                viewTab === "all"
                  ? "bg-rose-600 text-neutral-100 shadow-md shadow-rose-600/20 font-semibold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <span>All Platforms</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-neutral-950/40">
                {ALL_AVAILABLE_PLATFORMS.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setViewTab("connected")}
              className={`py-1.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                viewTab === "connected"
                  ? "bg-emerald-600 text-neutral-100 shadow-md shadow-emerald-600/20 font-semibold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <span>Connected</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-neutral-950/40">
                {connectors.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setViewTab("available")}
              className={`py-1.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                viewTab === "available"
                  ? "bg-neutral-800 text-neutral-100 shadow-xs font-semibold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <span>Available</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-neutral-950/40">
                {ALL_AVAILABLE_PLATFORMS.length - connectors.length}
              </span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across 40+ platforms (e.g. YouTube, Mastodon, Discord, Dev.to)..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-hidden focus:border-rose-500/40"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-200 text-xs"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none pt-1">
          {[
            { id: "all", label: "All Categories" },
            { id: "social", label: "Social & Microblogs" },
            { id: "publishing", label: "Blogging & Newsletters" },
            { id: "community", label: "Community & Messaging" },
            { id: "video", label: "Video & Streaming" },
            { id: "developer", label: "Developer & Design" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer whitespace-nowrap text-xs ${
                selectedCategory === cat.id
                  ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                  : "bg-neutral-950/40 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Platform Grid (Showing both Connected accounts & Available directory items) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDirectory.map(({ meta, connector, isConnected }) => {
          const brand = getPlatformBrandColor(meta.id);
          const isSyncing = connector ? syncingId === connector.id : false;

          // Render Connected Account Card
          if (isConnected && connector) {
            return (
              <motion.div
                key={connector.id}
                layout
                className="rounded-3xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl p-5 space-y-4 shadow-xl flex flex-col justify-between hover:border-neutral-700 transition-colors group relative"
              >
                <div className="space-y-3">
                  {/* Header with Avatar & Platform Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl border flex items-center justify-center text-lg ${brand.bg} ${brand.border} ${brand.text}`}
                      >
                        <PlatformIcon platformId={connector.platformId} className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-sm font-bold text-neutral-100 leading-tight">
                          {connector.accountName}
                        </h3>
                        <p className="text-xs text-neutral-400 font-mono mt-0.5">
                          {connector.accountHandle}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Connected</span>
                    </span>
                  </div>

                  {/* Account Stats Strip */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-neutral-950/40 border border-neutral-800 text-center">
                    <div>
                      <div className="text-[10px] font-mono text-neutral-500 uppercase">
                        {connector.stats.followers
                          ? "Followers"
                          : connector.stats.subscribers
                            ? "Subs"
                            : "Members"}
                      </div>
                      <div className="text-xs font-semibold text-neutral-200 mt-0.5">
                        {(
                          connector.stats.followers ||
                          connector.stats.subscribers ||
                          connector.stats.members ||
                          0
                        ).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-neutral-500 uppercase">
                        Dispatched
                      </div>
                      <div className="text-xs font-semibold text-neutral-200 mt-0.5">
                        {connector.stats.postsCount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-neutral-500 uppercase">Health</div>
                      <div className="text-xs font-semibold text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        100%
                      </div>
                    </div>
                  </div>

                  {/* Capabilities Overview */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono text-neutral-400">
                    <div className="p-2 rounded-xl bg-neutral-950/40 border border-neutral-800">
                      <div className="text-[9px] uppercase text-neutral-500">Max Chars</div>
                      <div className="font-semibold text-neutral-200 mt-0.5">
                        {connector.capabilities.maxTextLength.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-neutral-950/40 border border-neutral-800">
                      <div className="text-[9px] uppercase text-neutral-500">Video Max</div>
                      <div className="font-semibold text-neutral-200 mt-0.5">
                        {connector.capabilities.video
                          ? `${connector.capabilities.maxVideoDurationSec}s`
                          : "Unsupported"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <div className="text-[10px] text-neutral-500 font-mono">
                    Synced {connector.lastSyncAt}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSync(connector.id)}
                      className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-neutral-100 transition-colors cursor-pointer"
                      title="Refresh channel telemetry"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-rose-400" : ""}`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteConnector(connector.id)}
                      className="p-2 rounded-xl bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer opacity-80 group-hover:opacity-100"
                      title="Disconnect account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          }

          // Render Available Platform Card (Not yet connected)
          const caps = PLATFORM_CAPABILITIES[meta.id];

          return (
            <motion.div
              key={meta.id}
              layout
              className="rounded-3xl border border-neutral-800/80 bg-neutral-900/40 hover:bg-neutral-900/80 backdrop-blur-xl p-5 space-y-4 shadow-lg flex flex-col justify-between hover:border-neutral-700 transition-all group"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl border flex items-center justify-center text-lg ${brand.bg} ${brand.border} ${brand.text} group-hover:scale-105 transition-transform`}
                    >
                      <PlatformIcon platformId={meta.id} className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-bold text-neutral-100 leading-tight group-hover:text-rose-400 transition-colors">
                        {meta.name}
                      </h3>
                      <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block capitalize">
                        {meta.category} Network
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-neutral-400 bg-neutral-950/60 border border-neutral-800">
                    {meta.authBadge}
                  </span>
                </div>

                {/* Brief Platform Capabilities */}
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {meta.instructions}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-neutral-500">
                  <div className="p-2 rounded-xl bg-neutral-950/30 border border-neutral-800/60">
                    <span className="text-[9px] uppercase text-neutral-500 block">Max Limit</span>
                    <span className="font-semibold text-neutral-300">
                      {caps ? `${caps.maxTextLength.toLocaleString()} chars` : "2,000 chars"}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-neutral-950/30 border border-neutral-800/60">
                    <span className="text-[9px] uppercase text-neutral-500 block">Auth Spec</span>
                    <span className="font-semibold text-neutral-300 capitalize">
                      {meta.authType === "oauth"
                        ? "OAuth 2.0"
                        : meta.authType === "instance_url"
                          ? "Instance URL"
                          : meta.authType === "protocol"
                            ? "Signer / Key"
                            : "API Token"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Connect Button */}
              <div className="pt-3 border-t border-neutral-800/80">
                <button
                  type="button"
                  onClick={() => handleSelectPlatform(meta)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-neutral-800 hover:bg-red-600 text-neutral-200 hover:text-neutral-100 text-xs font-semibold border border-neutral-700 hover:border-red-500 shadow-md transition-all cursor-pointer group-hover:bg-red-600 group-hover:text-neutral-100 group-hover:border-red-500"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Connect {getPlatformDisplayName(meta.id)}</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Connection Setup Sub-Modal */}
      <AnimatePresence>
        {activePlatformToConnect && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-neutral-950/80">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl border border-neutral-800 bg-neutral-900/95 p-6 space-y-5 shadow-2xl"
            >
              {/* Sub-Modal Header */}
              <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${getPlatformBrandColor(activePlatformToConnect.id).bg} ${getPlatformBrandColor(activePlatformToConnect.id).border} ${getPlatformBrandColor(activePlatformToConnect.id).text}`}
                  >
                    <PlatformIcon platformId={activePlatformToConnect.id} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-neutral-100">
                      Connect {activePlatformToConnect.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300">
                        {activePlatformToConnect.authBadge}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseSubModal}
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Instructions Callout */}
              <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-300 space-y-1">
                <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  <span>Integration Guide</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {activePlatformToConnect.instructions}
                </p>
              </div>

              {/* Connection Form */}
              <form onSubmit={handleConnectSubmit} className="space-y-4">
                {activePlatformToConnect.fields.map((field) => {
                  const isPassword = field.type === "password";
                  const showPass = showPasswords[field.key] ?? false;

                  return (
                    <div key={field.key} className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-300 flex items-center justify-between">
                        <span>
                          {field.label} {field.required && <span className="text-rose-400">*</span>}
                        </span>
                        {field.helperText && (
                          <span className="text-[10px] text-neutral-500 font-mono">
                            {field.helperText}
                          </span>
                        )}
                      </label>

                      <div className="relative">
                        <input
                          type={
                            isPassword && !showPass
                              ? "password"
                              : field.type === "url"
                                ? "url"
                                : "text"
                          }
                          value={formData[field.key] || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))
                          }
                          required={field.required}
                          placeholder={field.placeholder}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden focus:border-rose-500/50"
                        />
                        {isPassword && (
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords((prev) => ({ ...prev, [field.key]: !showPass }))
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                          >
                            {showPass ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={handleCloseSubModal}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-neutral-100 text-xs font-semibold shadow-md shadow-red-600/20 transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying &amp; Saving...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>
                          {activePlatformToConnect.authType === "oauth"
                            ? "Authorize & Connect"
                            : "Save Credentials"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
