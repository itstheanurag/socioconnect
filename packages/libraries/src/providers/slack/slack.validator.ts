import type { PlatformLimits } from "@/types/provider.types";
import type { UniversalPostPayload, ValidationResult, ValidationError, ValidationWarning } from "@/types/post.types";
import { validateMediaItems } from "@/utils/media-validator";

export const SLACK_LIMITS: PlatformLimits = {
  maxCharacters: 40000,
  
  maxMediaCount: 10,
  maxImageSizeBytes: 20971520,
  maxVideoSizeBytes: 524288000,
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  allowedVideoMimeTypes: ["video/mp4", "video/quicktime"],
  maxTags: 10,
};

export function validateSlackPost(payload: UniversalPostPayload): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const charCount = payload.content.length;

  if (!payload.content || payload.content.trim().length === 0) {
    errors.push({
      field: "content",
      message: "Slack post content cannot be empty.",
      code: "EMPTY_CONTENT",
      critical: true,
    });
  }

  if (charCount > SLACK_LIMITS.maxCharacters) {
    errors.push({
      field: "content",
      message: `Slack post exceeds ${SLACK_LIMITS.maxCharacters} character limit. Current: ${charCount}`,
      code: "CHARACTER_LIMIT_EXCEEDED",
      critical: true,
    });
  }

  

  

  

  const mediaErrors = validateMediaItems(payload.media, SLACK_LIMITS, "Slack");
  errors.push(...mediaErrors);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    characterCount: charCount,
    maxCharacters: SLACK_LIMITS.maxCharacters,
    remainingCharacters: Math.max(0, SLACK_LIMITS.maxCharacters - charCount),
  };
}
