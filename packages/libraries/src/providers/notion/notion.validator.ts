import type { PlatformLimits } from "@/types/provider.types";
import type { UniversalPostPayload, ValidationResult, ValidationError, ValidationWarning } from "@/types/post.types";
import { validateMediaItems } from "@/utils/media-validator";

export const NOTION_LIMITS: PlatformLimits = {
  maxCharacters: 50000,
  maxTitleCharacters: 200,
  maxMediaCount: 10,
  maxImageSizeBytes: 10485760,
  
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  allowedVideoMimeTypes: ["video/mp4", "video/quicktime"],
  maxTags: 10,
};

export function validateNotionPost(payload: UniversalPostPayload): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const charCount = payload.content.length;

  if (!payload.content || payload.content.trim().length === 0) {
    errors.push({
      field: "content",
      message: "Notion post content cannot be empty.",
      code: "EMPTY_CONTENT",
      critical: true,
    });
  }

  if (charCount > NOTION_LIMITS.maxCharacters) {
    errors.push({
      field: "content",
      message: `Notion post exceeds ${NOTION_LIMITS.maxCharacters} character limit. Current: ${charCount}`,
      code: "CHARACTER_LIMIT_EXCEEDED",
      critical: true,
    });
  }

  
  if (!payload.title || payload.title.trim().length === 0) {
    errors.push({
      field: "title",
      message: "Notion requires a title for every post.",
      code: "MISSING_REQUIRED_TITLE",
      critical: true,
    });
  }
  

  
  if (payload.title && payload.title.length > 200) {
    errors.push({
      field: "title",
      message: `Notion title exceeds 200 character limit.`,
      code: "TITLE_LIMIT_EXCEEDED",
      critical: true,
    });
  }
  

  

  const mediaErrors = validateMediaItems(payload.media, NOTION_LIMITS, "Notion");
  errors.push(...mediaErrors);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    characterCount: charCount,
    maxCharacters: NOTION_LIMITS.maxCharacters,
    remainingCharacters: Math.max(0, NOTION_LIMITS.maxCharacters - charCount),
  };
}
