import type { PlatformLimits } from "@/types/provider.types";
import type { UniversalPostPayload, ValidationResult, ValidationError, ValidationWarning } from "@/types/post.types";
import { validateMediaItems } from "@/utils/media-validator";

export const GITHUB_LIMITS: PlatformLimits = {
  maxCharacters: 65536,
  maxTitleCharacters: 256,
  maxMediaCount: 5,
  maxImageSizeBytes: 10485760,
  
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  allowedVideoMimeTypes: ["video/mp4", "video/quicktime"],
  maxTags: 10,
};

export function validateGitHubPost(payload: UniversalPostPayload): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const charCount = payload.content.length;

  if (!payload.content || payload.content.trim().length === 0) {
    errors.push({
      field: "content",
      message: "GitHub post content cannot be empty.",
      code: "EMPTY_CONTENT",
      critical: true,
    });
  }

  if (charCount > GITHUB_LIMITS.maxCharacters) {
    errors.push({
      field: "content",
      message: `GitHub post exceeds ${GITHUB_LIMITS.maxCharacters} character limit. Current: ${charCount}`,
      code: "CHARACTER_LIMIT_EXCEEDED",
      critical: true,
    });
  }

  

  
  if (payload.title && payload.title.length > 256) {
    errors.push({
      field: "title",
      message: `GitHub title exceeds 256 character limit.`,
      code: "TITLE_LIMIT_EXCEEDED",
      critical: true,
    });
  }
  

  

  const mediaErrors = validateMediaItems(payload.media, GITHUB_LIMITS, "GitHub");
  errors.push(...mediaErrors);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    characterCount: charCount,
    maxCharacters: GITHUB_LIMITS.maxCharacters,
    remainingCharacters: Math.max(0, GITHUB_LIMITS.maxCharacters - charCount),
  };
}
