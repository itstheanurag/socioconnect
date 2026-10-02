import { z } from "zod";
import type { PlatformLimits } from "@/types/provider.types";
import type { UniversalPostPayload, ValidationResult } from "@/types/post.types";
import { buildZodValidationResult } from "@/schemas/post.schema";

export const TELEGRAM_LIMITS: PlatformLimits = {
  maxCharacters: 4096,
  maxMediaCount: 10,
  maxImageSizeBytes: 10 * 1024 * 1024, // 10MB
  maxVideoSizeBytes: 50 * 1024 * 1024, // 50MB
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  allowedVideoMimeTypes: ["video/mp4", "video/quicktime"],
  maxTags: 0,
};

export const telegramPostSchema = z
  .object({
    content: z.string().default(""),
    media: z
      .array(
        z.object({
          url: z.string().url("Invalid media URL"),
          type: z.enum(["image", "video", "gif"]),
          mimeType: z.string(),
        }),
      )
      .max(10, "Telegram allows up to 10 media items per message")
      .optional(),
    platformOptions: z
      .object({
        chatId: z.string().optional(),
        parseMode: z.enum(["MarkdownV2", "HTML", "Markdown"]).optional(),
        disableWebPagePreview: z.boolean().optional(),
        silent: z.boolean().optional(),
        pinMessage: z.boolean().optional(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    const hasText = data.content && data.content.trim().length > 0;
    const hasMedia = data.media && data.media.length > 0;

    if (!hasText && !hasMedia) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["content"],
        message: "Telegram messages require text or media attachments",
      });
    }

    // If media is present, caption cannot exceed 1024 chars
    if (hasMedia && data.content && data.content.length > 1024) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["content"],
        message: "Telegram media caption cannot exceed 1,024 characters",
      });
    }
  });

export function validateTelegramPost(payload: UniversalPostPayload): ValidationResult {
  return buildZodValidationResult(telegramPostSchema, payload, TELEGRAM_LIMITS, "codeUnits");
}
