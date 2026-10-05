import type { PlatformLimits } from "@/types/provider.types";
import type { UniversalPostPayload, ValidationResult, ValidationError, ValidationWarning } from "@/types/post.types";
import { validateMediaItems } from "@/utils/media-validator";

export const SPOTIFY_LIMITS: PlatformLimits = {
  maxCharacters: 4000,
  maxTitleCharacters: 100,
  maxMediaCount: 1,
  maxImageSizeBytes: 10485760,
  
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  allowedVideoMimeTypes: ["video/mp4", "video/quicktime"],
  maxTags: 5,
};

export function validateSpotifyPost(payload: UniversalPostPayload): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const charCount = payload.content.length;

  if (!payload.content || payload.content.trim().length === 0) {
    errors.push({
      field: "content",
      message: "Spotify Podcasts post content cannot be empty.",
      code: "EMPTY_CONTENT",
      critical: true,
    });
  }

  if (charCount > SPOTIFY_LIMITS.maxCharacters) {
    errors.push({
      field: "content",
      message: `Spotify Podcasts post exceeds ${SPOTIFY_LIMITS.maxCharacters} character limit. Current: ${charCount}`,
      code: "CHARACTER_LIMIT_EXCEEDED",
      critical: true,
    });
  }

  
  if (!payload.title || payload.title.trim().length === 0) {
    errors.push({
      field: "title",
      message: "Spotify Podcasts requires a title for every post.",
      code: "MISSING_REQUIRED_TITLE",
      critical: true,
    });
  }
  

  
  if (payload.title && payload.title.length > 100) {
    errors.push({
      field: "title",
      message: `Spotify Podcasts title exceeds 100 character limit.`,
      code: "TITLE_LIMIT_EXCEEDED",
      critical: true,
    });
  }
  

  

  const mediaErrors = validateMediaItems(payload.media, SPOTIFY_LIMITS, "Spotify Podcasts");
  errors.push(...mediaErrors);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    characterCount: charCount,
    maxCharacters: SPOTIFY_LIMITS.maxCharacters,
    remainingCharacters: Math.max(0, SPOTIFY_LIMITS.maxCharacters - charCount),
  };
}
