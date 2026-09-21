import { z } from "zod";
import type { UniversalPostPayload, ValidationResult } from "../../types/post.types";
import type { PlatformLimits } from "../../types/provider.types";
import { createMediaValidator } from "../../schemas/media.schema";
import { buildZodValidationResult, universalPostSchema } from "../../schemas/post.schema";
import { countCodeUnits } from "../../utils/text-counter";

export const DISCORD_LIMITS: PlatformLimits = {
  maxCharacters: 2000,
  maxTitleCharacters: 256,
  maxMediaCount: 10,
  maxImageSizeBytes: 25 * 1024 * 1024, // 25MB
  maxVideoSizeBytes: 25 * 1024 * 1024,
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  allowedVideoMimeTypes: ["video/mp4", "video/webm", "video/quicktime"],
  maxTags: 0,
};

export const discordPostSchema = universalPostSchema
  .extend({
    media: createMediaValidator({
      maxCount: DISCORD_LIMITS.maxMediaCount,
      allowedImageMimes: DISCORD_LIMITS.allowedImageMimeTypes,
      allowedVideoMimes: DISCORD_LIMITS.allowedVideoMimeTypes,
      maxImageSizeBytes: DISCORD_LIMITS.maxImageSizeBytes,
      maxVideoSizeBytes: DISCORD_LIMITS.maxVideoSizeBytes,
      platformName: "Discord",
    }),
  })
  .superRefine((data: { content?: string; media?: unknown[] }, ctx: z.RefinementCtx) => {
    const text = data.content || "";
    const media = data.media || [];
    const charCount = countCodeUnits(text);

    if (!text.trim() && media.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Discord messages require either text content or an attachment/embed.",
        path: ["content"],
      });
    }

    if (charCount > DISCORD_LIMITS.maxCharacters) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Discord message content exceeds limit of ${DISCORD_LIMITS.maxCharacters} characters.`,
        path: ["content"],
      });
    }
  });

export function validateDiscordPost(payload: UniversalPostPayload): ValidationResult {
  return buildZodValidationResult(discordPostSchema, payload, DISCORD_LIMITS, "codeUnits");
}
