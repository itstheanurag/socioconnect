import { z } from "zod";
import type { UniversalPostPayload, ValidationResult } from "../../types/post.types";
import type { PlatformLimits } from "../../types/provider.types";
import { createMediaValidator } from "../../schemas/media.schema";
import { buildZodValidationResult, universalPostSchema } from "../../schemas/post.schema";
import { countCodeUnits } from "../../utils/text-counter";

export const INSTAGRAM_LIMITS: PlatformLimits = {
  maxCharacters: 2200,
  maxMediaCount: 10,
  maxImageSizeBytes: 8 * 1024 * 1024,
  maxVideoSizeBytes: 100 * 1024 * 1024,
  allowedImageMimeTypes: ["image/jpeg", "image/png"],
  allowedVideoMimeTypes: ["video/mp4", "video/quicktime"],
  maxTags: 30,
};

export const instagramPostSchema = universalPostSchema
  .extend({
    media: createMediaValidator({
      maxCount: INSTAGRAM_LIMITS.maxMediaCount,
      allowedImageMimes: INSTAGRAM_LIMITS.allowedImageMimeTypes,
      allowedVideoMimes: INSTAGRAM_LIMITS.allowedVideoMimeTypes,
      maxImageSizeBytes: INSTAGRAM_LIMITS.maxImageSizeBytes,
      maxVideoSizeBytes: INSTAGRAM_LIMITS.maxVideoSizeBytes,
      requireMedia: true,
      platformName: "Instagram",
    }),
  })
  .superRefine((data: { content?: string; tags?: string[] }, ctx: z.RefinementCtx) => {
    const text = data.content || "";
    const charCount = countCodeUnits(text);

    if (charCount > INSTAGRAM_LIMITS.maxCharacters) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Instagram caption exceeds maximum of ${INSTAGRAM_LIMITS.maxCharacters} characters.`,
        path: ["content"],
      });
    }

    const textHashtags = (text.match(/#[a-zA-Z0-9_]+/g) || []).length;
    const totalTags = textHashtags + (data.tags?.length || 0);

    if (totalTags > (INSTAGRAM_LIMITS.maxTags || 30)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Instagram allows maximum 30 hashtags per post. Found: ${totalTags}.`,
        path: ["tags"],
      });
    }
  });

export function validateInstagramPost(payload: UniversalPostPayload): ValidationResult {
  return buildZodValidationResult(instagramPostSchema, payload, INSTAGRAM_LIMITS, "codeUnits");
}
