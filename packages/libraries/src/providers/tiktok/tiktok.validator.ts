import { z } from "zod";
import type { PlatformLimits } from "@/types/provider.types";
import type { UniversalPostPayload, ValidationResult } from "@/types/post.types";
import { buildZodValidationResult } from "@/schemas/post.schema";

export const TIKTOK_LIMITS: PlatformLimits = {
  maxCharacters: 2200,
  maxMediaCount: 35,
  maxImageSizeBytes: 20 * 1024 * 1024, // 20MB
  maxVideoSizeBytes: 1024 * 1024 * 1024, // 1GB
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  allowedVideoMimeTypes: ["video/mp4", "video/quicktime", "video/webm"],
  maxTags: 30,
};

export const tiktokPostSchema = z
  .object({
    content: z.string().max(2200, "TikTok caption cannot exceed 2,200 characters").default(""),
    media: z
      .array(
        z.object({
          url: z.string().url("Invalid media URL"),
          type: z.enum(["image", "video", "gif"]),
          mimeType: z.string(),
        }),
      )
      .min(1, "TikTok requires at least 1 video or image attachment")
      .max(35, "TikTok photo carousel allows up to 35 photos"),
    platformOptions: z
      .object({
        privacyLevel: z
          .enum(["PUBLIC_TO_EVERYONE", "MUTUAL_FOLLOW_FRIENDS", "SELF_ONLY"])
          .optional(),
        disableComments: z.boolean().optional(),
        disableDuet: z.boolean().optional(),
        disableStitch: z.boolean().optional(),
        autoAddMusic: z.boolean().optional(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    const videoCount = data.media.filter((m) => m.type === "video").length;
    const imageCount = data.media.filter((m) => m.type === "image" || m.type === "gif").length;

    if (videoCount > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["media"],
        message: "TikTok allows a maximum of 1 video per post",
      });
    }

    if (videoCount > 0 && imageCount > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["media"],
        message: "TikTok does not support mixing video and photos in the same post",
      });
    }
  });

export function validateTikTokPost(payload: UniversalPostPayload): ValidationResult {
  return buildZodValidationResult(tiktokPostSchema, payload, TIKTOK_LIMITS, "codeUnits");
}
