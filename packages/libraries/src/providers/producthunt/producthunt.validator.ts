import type { PlatformLimits } from "@/types/provider.types";
import type { UniversalPostPayload, ValidationResult, ValidationError, ValidationWarning } from "@/types/post.types";
import { validateMediaItems } from "@/utils/media-validator";

export const PRODUCTHUNT_LIMITS: PlatformLimits = {
  maxCharacters: 500,
  maxTitleCharacters: 100,
  maxMediaCount: 5,
  maxImageSizeBytes: 10485760,
  
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  allowedVideoMimeTypes: ["video/mp4", "video/quicktime"],
  maxTags: 3,
};

export function validateProductHuntPost(payload: UniversalPostPayload): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const charCount = payload.content.length;

  if (!payload.content || payload.content.trim().length === 0) {
    errors.push({
      field: "content",
      message: "Product Hunt post content cannot be empty.",
      code: "EMPTY_CONTENT",
      critical: true,
    });
  }

  if (charCount > PRODUCTHUNT_LIMITS.maxCharacters) {
    errors.push({
      field: "content",
      message: `Product Hunt post exceeds ${PRODUCTHUNT_LIMITS.maxCharacters} character limit. Current: ${charCount}`,
      code: "CHARACTER_LIMIT_EXCEEDED",
      critical: true,
    });
  }

  
  if (!payload.title || payload.title.trim().length === 0) {
    errors.push({
      field: "title",
      message: "Product Hunt requires a title for every post.",
      code: "MISSING_REQUIRED_TITLE",
      critical: true,
    });
  }
  

  
  if (payload.title && payload.title.length > 100) {
    errors.push({
      field: "title",
      message: `Product Hunt title exceeds 100 character limit.`,
      code: "TITLE_LIMIT_EXCEEDED",
      critical: true,
    });
  }
  

  

  const mediaErrors = validateMediaItems(payload.media, PRODUCTHUNT_LIMITS, "Product Hunt");
  errors.push(...mediaErrors);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    characterCount: charCount,
    maxCharacters: PRODUCTHUNT_LIMITS.maxCharacters,
    remainingCharacters: Math.max(0, PRODUCTHUNT_LIMITS.maxCharacters - charCount),
  };
}
