export type SocialPlatform =
  | "bluesky"
  | "dribbble"
  | "devto"
  | "medium"
  | "youtube"
  | "instagram"
  | "discord"
  | "reddit"
  | "linkedin"
  | "pinterest"
  | "facebook";

export interface PlatformCapabilities {
  supportsText: boolean;
  supportsMarkdown: boolean;
  supportsTitle: boolean;
  requiresTitle: boolean;
  supportsImages: boolean;
  requiresImage: boolean;
  maxImages: number;
  supportsVideos: boolean;
  requiresVideo: boolean;
  maxVideos: number;
  supportsLinks: boolean;
  supportsTags: boolean;
  maxTags: number;
  supportsScheduling: boolean;
  supportsDrafts: boolean;
  supportsPolls: boolean;
  supportsThreads: boolean;
}

export interface PlatformLimits {
  maxCharacters: number;
  maxTitleCharacters?: number;
  maxMediaCount: number;
  maxImageSizeBytes: number;
  maxVideoSizeBytes?: number;
  allowedImageMimeTypes: string[];
  allowedVideoMimeTypes?: string[];
  maxTags?: number;
}

export interface ProviderMetadata {
  id: SocialPlatform;
  name: string;
  websiteUrl: string;
  docsUrl: string;
  iconName: string;
  defaultScopes: string[];
  capabilities: PlatformCapabilities;
  limits: PlatformLimits;
}
