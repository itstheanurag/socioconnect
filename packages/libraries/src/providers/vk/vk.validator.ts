import type { PlatformLimits } from "@/types/provider.types";
import type { UniversalPostPayload, ValidationResult, ValidationError, ValidationWarning } from "@/types/post.types";
import { validateMediaItems } from "@/utils/media-validator";

export const VK_LIMITS: PlatformLimits = {
  maxCharacters: 16000,
  
  maxMediaCount: 10,
  maxImageSizeBytes: 10485760,
  
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  allowedVideoMimeTypes: ["video/mp4", "video/quicktime"],
  maxTags: 10,
};

export function validateVkPost(payload: UniversalPostPayload): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const charCount = payload.content.length;

  if (!payload.content || payload.content.trim().length === 0) {
    errors.push({
      field: "content",
      message: "VK post content cannot be empty.",
      code: "EMPTY_CONTENT",
      critical: true,
    });
  }

  if (charCount > VK_LIMITS.maxCharacters) {
    errors.push({
      field: "content",
      message: `VK post exceeds ${VK_LIMITS.maxCharacters} character limit. Current: ${charCount}`,
      code: "CHARACTER_LIMIT_EXCEEDED",
      critical: true,
    });
  }

  

  

  

  const mediaErrors = validateMediaItems(payload.media, VK_LIMITS, "VK");
  errors.push(...mediaErrors);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    characterCount: charCount,
    maxCharacters: VK_LIMITS.maxCharacters,
    remainingCharacters: Math.max(0, VK_LIMITS.maxCharacters - charCount),
  };
}
