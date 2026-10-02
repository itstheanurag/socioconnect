import { z } from "zod";
import type { PlatformLimits } from "@/types/provider.types";
import type { UniversalPostPayload, ValidationResult } from "@/types/post.types";
import { buildZodValidationResult } from "@/schemas/post.schema";

export const THREADS_LIMITS: PlatformLimits = {
  maxCharacters: 500,
  maxMediaCount: 10,
  maxImageSizeBytes: 8 * 1024 * 1024, // 8MB
  maxVideoSizeBytes: 1024 * 1024 * 1024, // 1GB
  allowedImageMimeTypes: ["image/jpeg", "image/png"],
  allowedVideoMimeTypes: ["video/mp4", "video/quicktime"],
  maxTags: 1, // Threads allows max 1 topic tag
};

export const threadsPostSchema = z
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
      .max(10, "Threads allows up to 10 media attachments")
      .optional(),
    platformOptions: z
      .object({
        topicTag: z.string().max(50).optional(),
        replyToPostId: z.string().optional(),
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
        message: "Threads posts require either text content or media attachments",
      });
    }
  });

export function validateThreadsPost(payload: UniversalPostPayload): ValidationResult {
  return buildZodValidationResult(threadsPostSchema, payload, THREADS_LIMITS, "graphemes");
}
