import type { PlatformLimits } from "@/types/provider.types";
import type {
  UniversalPostPayload,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from "@/types/post.types";
import { validateMediaItems } from "@/utils/media-validator";

export const WORDPRESS_LIMITS: PlatformLimits = {
  maxCharacters: 200000,
  maxTitleCharacters: 250,
  maxMediaCount: 20,
  maxImageSizeBytes: 10485760,

  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  allowedVideoMimeTypes: ["video/mp4", "video/quicktime"],
  maxTags: 20,
};

export function validateWordPressPost(payload: UniversalPostPayload): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const charCount = payload.content.length;

  if (!payload.content || payload.content.trim().length === 0) {
    errors.push({
      field: "content",
      message: "WordPress post content cannot be empty.",
      code: "EMPTY_CONTENT",
      critical: true,
    });
  }

  if (charCount > WORDPRESS_LIMITS.maxCharacters) {
    errors.push({
      field: "content",
      message: `WordPress post exceeds ${WORDPRESS_LIMITS.maxCharacters} character limit. Current: ${charCount}`,
      code: "CHARACTER_LIMIT_EXCEEDED",
      critical: true,
    });
  }

  if (!payload.title || payload.title.trim().length === 0) {
    errors.push({
      field: "title",
      message: "WordPress requires a title for every post.",
      code: "MISSING_REQUIRED_TITLE",
      critical: true,
    });
  }

  if (payload.title && payload.title.length > 250) {
    errors.push({
      field: "title",
      message: `WordPress title exceeds 250 character limit.`,
      code: "TITLE_LIMIT_EXCEEDED",
      critical: true,
    });
  }

  const mediaErrors = validateMediaItems(payload.media, WORDPRESS_LIMITS, "WordPress");
  errors.push(...mediaErrors);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    characterCount: charCount,
    maxCharacters: WORDPRESS_LIMITS.maxCharacters,
    remainingCharacters: Math.max(0, WORDPRESS_LIMITS.maxCharacters - charCount),
  };
}
