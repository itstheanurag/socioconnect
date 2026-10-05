import type { PlatformLimits } from "@/types/provider.types";
import type { UniversalPostPayload, ValidationResult, ValidationError, ValidationWarning } from "@/types/post.types";
import { validateMediaItems } from "@/utils/media-validator";

export const WHATSAPP_LIMITS: PlatformLimits = {
  maxCharacters: 4096,
  
  maxMediaCount: 1,
  maxImageSizeBytes: 16777216,
  maxVideoSizeBytes: 67108864,
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  allowedVideoMimeTypes: ["video/mp4", "video/quicktime"],
  maxTags: 0,
};

export function validateWhatsAppPost(payload: UniversalPostPayload): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const charCount = payload.content.length;

  if (!payload.content || payload.content.trim().length === 0) {
    errors.push({
      field: "content",
      message: "WhatsApp post content cannot be empty.",
      code: "EMPTY_CONTENT",
      critical: true,
    });
  }

  if (charCount > WHATSAPP_LIMITS.maxCharacters) {
    errors.push({
      field: "content",
      message: `WhatsApp post exceeds ${WHATSAPP_LIMITS.maxCharacters} character limit. Current: ${charCount}`,
      code: "CHARACTER_LIMIT_EXCEEDED",
      critical: true,
    });
  }

  

  

  

  const mediaErrors = validateMediaItems(payload.media, WHATSAPP_LIMITS, "WhatsApp");
  errors.push(...mediaErrors);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    characterCount: charCount,
    maxCharacters: WHATSAPP_LIMITS.maxCharacters,
    remainingCharacters: Math.max(0, WHATSAPP_LIMITS.maxCharacters - charCount),
  };
}
