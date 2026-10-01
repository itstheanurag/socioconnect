export type DashboardSection =
  | "overview"
  | "compose"
  | "posts"
  | "calendar"
  | "bots"
  | "automations"
  | "communities"
  | "connectors"
  | "analytics"
  | "settings";

export type PostStatus = "draft" | "scheduled" | "published" | "failed";

export type PlatformId =
  | "instagram"
  | "reddit"
  | "twitter"
  | "telegram"
  | "linkedin"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "threads";

export interface PlatformCapability {
  text: boolean;
  maxTextLength: number;
  singleImage: boolean;
  carousel: boolean;
  maxCarouselImages: number;
  video: boolean;
  maxVideoDurationSec: number;
  audioMusic: boolean;
  markdown: boolean;
  threading: boolean;
  polls: boolean;
  scheduling: boolean;
}

export interface ConnectorAccount {
  id: string;
  platformId: PlatformId;
  platformName: string;
  accountHandle: string;
  accountName: string;
  avatarUrl?: string;
  status: "connected" | "syncing" | "reconnect_required" | "disconnected";
  connectedAt: string;
  lastSyncAt: string;
  capabilities: PlatformCapability;
  stats: {
    followers?: number;
    subscribers?: number;
    members?: number;
    postsCount: number;
  };
}

export interface PostMedia {
  id: string;
  type: "image" | "video" | "audio";
  url: string;
  name: string;
  sizeMb: number;
  aspectRatio?: string;
  durationSec?: number;
}

export interface PlatformOverride {
  enabled: boolean;
  title?: string;
  caption?: string;
  customHashtags?: string[];
  subreddit?: string;
  flair?: string;
  firstComment?: string;
  silentBroadcast?: boolean;
}

export interface PostItem {
  id: string;
  title: string;
  baseContent: string;
  media: PostMedia[];
  hasAudio: boolean;
  targetPlatforms: PlatformId[];
  communityIds: string[];
  platformOverrides: Partial<Record<PlatformId, PlatformOverride>>;
  status: PostStatus;
  scheduledFor?: string; // ISO string
  publishedAt?: string;
  createdAt: string;
  author: {
    name: string;
    avatar?: string;
  };
  metrics?: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
  };
  failureReason?: string;
}

export interface CommunityDestination {
  id: string;
  connectorId: string;
  platformId: PlatformId;
  targetName: string; // e.g. "r/programming" or "@tech_channel" or "Company Page"
  targetType: "subreddit" | "channel" | "group" | "page" | "profile";
}

export interface Community {
  id: string;
  name: string;
  description: string;
  color: string;
  iconName: string;
  destinations: CommunityDestination[];
  botIds: string[];
  totalAudience: number;
  postCount: number;
  createdAt: string;
}

export interface TelegramBot {
  id: string;
  name: string;
  username: string;
  tokenMasked: string;
  status: "active" | "paused" | "error";
  communityIds: string[];
  commandsCount: number;
  scheduledQueueCount: number;
  webhookStatus: "healthy" | "delayed" | "inactive";
  lastActive: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  sourceType: "post_published" | "reddit_new" | "rss_feed" | "scheduled_trigger";
  sourcePlatform?: PlatformId;
  sourceTarget?: string;
  actionType: "cross_post" | "telegram_notify" | "summary_generate" | "archive";
  targetPlatform?: PlatformId;
  targetDestination?: string;
  status: "active" | "paused";
  executionsCount: number;
  lastExecutedAt?: string;
}

export interface CompatibilityAnalysis {
  platformId: PlatformId;
  isSupported: boolean;
  status: "fully_compatible" | "compatible_with_modifications" | "incompatible";
  reasons: string[];
  modificationsSummary?: string[];
  requiredActions?: string[];
}

export interface ContextualPanelState {
  isOpen: boolean;
  type:
    | "post_preview"
    | "post_details"
    | "compatibility_breakdown"
    | "bot_info"
    | "connector_info"
    | "activity_feed"
    | "schedule_slot"
    | null;
  data?: any;
}
