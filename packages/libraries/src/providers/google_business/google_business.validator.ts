import type { PlatformLimits } from "@/types/provider.types";
import type { UniversalPostPayload, ValidationResult, ValidationError, ValidationWarning } from "@/types/post.types";
import { validateMediaItems } from "@/utils/media-validator";

export const GOOGLE_BUSINESS_LIMITS: PlatformLimits = {
  maxCharacters: 1500,
  
  maxMediaCount: 10,
  maxImageSizeBytes: 10485760,
  maxVideoSizeBytes: 104857600,
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  allowedVideoMimeTypes: ["video/mp4", "video/quicktime"],
  maxTags: 0,
};

export function validateGoogleBusinessPost(payload: UniversalPostPayload): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const charCount = payload.content.length;

  if (!payload.content || payload.content.trim().length === 0) {
    errors.push({
      field: "content",
      message: "Google My Business post content cannot be empty.",
      code: "EMPTY_CONTENT",
      critical: true,
    });
  }

  if (charCount > GOOGLE_BUSINESS_LIMITS.maxCharacters) {
    errors.push({
      field: "content",
      message: `Google My Business post exceeds ${GOOGLE_BUSINESS_LIMITS.maxCharacters} character limit. Current: ${charCount}`,
      code: "CHARACTER_LIMIT_EXCEEDED",
      critical: true,
    });
  }

  

  

  

  const mediaErrors = validateMediaItems(payload.media, GOOGLE_BUSINESS_LIMITS, "Google My Business");
  errors.push(...mediaErrors);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    characterCount: charCount,
    maxCharacters: GOOGLE_BUSINESS_LIMITS.maxCharacters,
    remainingCharacters: Math.max(0, GOOGLE_BUSINESS_LIMITS.maxCharacters - charCount),
  };
}
