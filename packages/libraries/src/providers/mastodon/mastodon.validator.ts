import type { PlatformLimits } from "@/types/provider.types";
import type { UniversalPostPayload, ValidationResult, ValidationError, ValidationWarning } from "@/types/post.types";
import { validateMediaItems } from "@/utils/media-validator";

export const MASTODON_LIMITS: PlatformLimits = {
  maxCharacters: 500,
  
  maxMediaCount: 4,
  maxImageSizeBytes: 16777216,
  maxVideoSizeBytes: 41943040,
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  allowedVideoMimeTypes: ["video/mp4", "video/quicktime"],
  maxTags: 10,
};

export function validateMastodonPost(payload: UniversalPostPayload): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const charCount = payload.content.length;

  if (!payload.content || payload.content.trim().length === 0) {
    errors.push({
      field: "content",
      message: "Mastodon post content cannot be empty.",
      code: "EMPTY_CONTENT",
      critical: true,
    });
  }

  if (charCount > MASTODON_LIMITS.maxCharacters) {
    errors.push({
      field: "content",
      message: `Mastodon post exceeds ${MASTODON_LIMITS.maxCharacters} character limit. Current: ${charCount}`,
      code: "CHARACTER_LIMIT_EXCEEDED",
      critical: true,
    });
  }

  

  

  

  const mediaErrors = validateMediaItems(payload.media, MASTODON_LIMITS, "Mastodon");
  errors.push(...mediaErrors);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    characterCount: charCount,
    maxCharacters: MASTODON_LIMITS.maxCharacters,
    remainingCharacters: Math.max(0, MASTODON_LIMITS.maxCharacters - charCount),
  };
}
