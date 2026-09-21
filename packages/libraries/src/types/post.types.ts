export interface MediaItem {
  id?: string;
  url: string;
  type: "image" | "video" | "gif";
  mimeType: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  altText?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
}

export interface PostPlatformOptions {
  // Reddit specific
  subreddit?: string;
  flairId?: string;
  isNsfw?: boolean;
  isSpoiler?: boolean;

  // Pinterest specific
  boardId?: string;
  pinLink?: string;

  // Dev.to / Medium specific
  canonicalUrl?: string;
  series?: string;
  publishStatus?: "public" | "draft" | "unlisted";

  // Discord specific
  channelId?: string;
  webhookUrl?: string;

  // YouTube specific
  privacyStatus?: "public" | "private" | "unlisted";
  madeForKids?: boolean;

  // Dribbble specific
  teamId?: string;

  // Instagram / Facebook specific
  mediaType?: "IMAGE" | "VIDEO" | "CAROUSEL" | "REELS" | "STORIES";
  pageId?: string;

  // Bluesky specific
  langs?: string[];

  // LinkedIn specific
  visibility?: "PUBLIC" | "CONNECTIONS";
}

export interface UniversalPostPayload {
  content: string;
  title?: string;
  media?: MediaItem[];
  tags?: string[];
  linkUrl?: string;
  scheduledAt?: Date;
  idempotencyKey?: string;
  platformOptions?: PostPlatformOptions;
  extra?: Record<string, unknown>;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  critical: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
  characterCount: number;
  maxCharacters: number;
  remainingCharacters: number;
}

export interface PublishResult {
  success: boolean;
  externalPostId: string;
  externalPostUrl?: string;
  publishedAt: Date;
  rawResponse?: unknown;
  rateLimitReset?: Date;
  updatedCredentials?: {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  };
}
