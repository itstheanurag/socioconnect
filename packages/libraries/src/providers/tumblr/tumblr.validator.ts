import type { PlatformLimits } from "@/types/provider.types";
import type { UniversalPostPayload, ValidationResult, ValidationError, ValidationWarning } from "@/types/post.types";
import { validateMediaItems } from "@/utils/media-validator";

export const TUMBLR_LIMITS: PlatformLimits = {
  maxCharacters: 10000,
  maxTitleCharacters: 150,
  maxMediaCount: 10,
  maxImageSizeBytes: 10485760,
  
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  allowedVideoMimeTypes: ["video/mp4", "video/quicktime"],
  maxTags: 20,
};

export function validateTumblrPost(payload: UniversalPostPayload): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const charCount = payload.content.length;

  if (!payload.content || payload.content.trim().length === 0) {
    errors.push({
      field: "content",
      message: "Tumblr post content cannot be empty.",
      code: "EMPTY_CONTENT",
      critical: true,
    });
  }

  if (charCount > TUMBLR_LIMITS.maxCharacters) {
    errors.push({
      field: "content",
      message: `Tumblr post exceeds ${TUMBLR_LIMITS.maxCharacters} character limit. Current: ${charCount}`,
      code: "CHARACTER_LIMIT_EXCEEDED",
      critical: true,
    });
  }

  

  
  if (payload.title && payload.title.length > 150) {
    errors.push({
      field: "title",
      message: `Tumblr title exceeds 150 character limit.`,
      code: "TITLE_LIMIT_EXCEEDED",
      critical: true,
    });
  }
  

  

  const mediaErrors = validateMediaItems(payload.media, TUMBLR_LIMITS, "Tumblr");
  errors.push(...mediaErrors);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    characterCount: charCount,
    maxCharacters: TUMBLR_LIMITS.maxCharacters,
    remainingCharacters: Math.max(0, TUMBLR_LIMITS.maxCharacters - charCount),
  };
}
