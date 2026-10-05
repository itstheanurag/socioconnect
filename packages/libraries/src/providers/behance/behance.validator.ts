import type { PlatformLimits } from "@/types/provider.types";
import type { UniversalPostPayload, ValidationResult, ValidationError, ValidationWarning } from "@/types/post.types";
import { validateMediaItems } from "@/utils/media-validator";

export const BEHANCE_LIMITS: PlatformLimits = {
  maxCharacters: 5000,
  maxTitleCharacters: 100,
  maxMediaCount: 20,
  maxImageSizeBytes: 10485760,
  
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  allowedVideoMimeTypes: ["video/mp4", "video/quicktime"],
  maxTags: 10,
};

export function validateBehancePost(payload: UniversalPostPayload): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const charCount = payload.content.length;

  if (!payload.content || payload.content.trim().length === 0) {
    errors.push({
      field: "content",
      message: "Behance post content cannot be empty.",
      code: "EMPTY_CONTENT",
      critical: true,
    });
  }

  if (charCount > BEHANCE_LIMITS.maxCharacters) {
    errors.push({
      field: "content",
      message: `Behance post exceeds ${BEHANCE_LIMITS.maxCharacters} character limit. Current: ${charCount}`,
      code: "CHARACTER_LIMIT_EXCEEDED",
      critical: true,
    });
  }

  
  if (!payload.title || payload.title.trim().length === 0) {
    errors.push({
      field: "title",
      message: "Behance requires a title for every post.",
      code: "MISSING_REQUIRED_TITLE",
      critical: true,
    });
  }
  

  
  if (payload.title && payload.title.length > 100) {
    errors.push({
      field: "title",
      message: `Behance title exceeds 100 character limit.`,
      code: "TITLE_LIMIT_EXCEEDED",
      critical: true,
    });
  }
  

  
  if (!payload.media || payload.media.length === 0) {
    errors.push({
      field: "media",
      message: "Behance requires at least one image/media attachment.",
      code: "MISSING_REQUIRED_MEDIA",
      critical: true,
    });
  }
  

  const mediaErrors = validateMediaItems(payload.media, BEHANCE_LIMITS, "Behance");
  errors.push(...mediaErrors);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    characterCount: charCount,
    maxCharacters: BEHANCE_LIMITS.maxCharacters,
    remainingCharacters: Math.max(0, BEHANCE_LIMITS.maxCharacters - charCount),
  };
}
