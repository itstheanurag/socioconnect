import type { PlatformLimits } from "@/types/provider.types";
import type { UniversalPostPayload, ValidationResult, ValidationError, ValidationWarning } from "@/types/post.types";
import { validateMediaItems } from "@/utils/media-validator";

export const MEWE_LIMITS: PlatformLimits = {
  maxCharacters: 5000,
  
  maxMediaCount: 6,
  maxImageSizeBytes: 10485760,
  
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  allowedVideoMimeTypes: ["video/mp4", "video/quicktime"],
  maxTags: 5,
};

export function validateMeWePost(payload: UniversalPostPayload): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const charCount = payload.content.length;

  if (!payload.content || payload.content.trim().length === 0) {
    errors.push({
      field: "content",
      message: "MeWe post content cannot be empty.",
      code: "EMPTY_CONTENT",
      critical: true,
    });
  }

  if (charCount > MEWE_LIMITS.maxCharacters) {
    errors.push({
      field: "content",
      message: `MeWe post exceeds ${MEWE_LIMITS.maxCharacters} character limit. Current: ${charCount}`,
      code: "CHARACTER_LIMIT_EXCEEDED",
      critical: true,
    });
  }

  

  

  

  const mediaErrors = validateMediaItems(payload.media, MEWE_LIMITS, "MeWe");
  errors.push(...mediaErrors);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    characterCount: charCount,
    maxCharacters: MEWE_LIMITS.maxCharacters,
    remainingCharacters: Math.max(0, MEWE_LIMITS.maxCharacters - charCount),
  };
}
