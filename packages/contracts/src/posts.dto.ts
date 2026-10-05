import { z } from "zod";
import { PlatformIdSchema } from "./platforms.dto";

export const DispatchStatusSchema = z.enum([
  "pending",
  "queued",
  "in_progress",
  "published",
  "failed",
  "retrying",
  "cancelled",
]);
export type DispatchStatus = z.infer<typeof DispatchStatusSchema>;

export const PostStatusSchema = z.enum([
  "draft",
  "scheduled",
  "publishing",
  "published",
  "partially_published",
  "failed",
  "cancelled",
]);
export type PostStatus = z.infer<typeof PostStatusSchema>;

export const TimingStrategySchema = z.enum(["simultaneous", "staggered", "manual"]);
export type TimingStrategy = z.infer<typeof TimingStrategySchema>;

export const PostMediaSchema = z.object({
  id: z.string(),
  type: z.enum(["image", "video", "audio"]),
  url: z.string(),
  name: z.string(),
  sizeMb: z.number(),
  aspectRatio: z.string().optional(),
  durationSec: z.number().optional(),
});
export type PostMedia = z.infer<typeof PostMediaSchema>;

export const PlatformOverrideSchema = z.object({
  enabled: z.boolean().default(false),
  title: z.string().optional(),
  caption: z.string().optional(),
  customHashtags: z.array(z.string()).optional(),
  subreddit: z.string().optional(),
  flair: z.string().optional(),
  firstComment: z.string().optional(),
  silentBroadcast: z.boolean().optional(),
  canonicalUrl: z.string().optional(),
  tags: z.array(z.string()).optional(),
  privacyStatus: z.enum(["public", "unlisted", "private"]).optional(),
  boardId: z.string().optional(),
  category: z.string().optional(),
  slug: z.string().optional(),
  series: z.string().optional(),
  madeForKids: z.boolean().optional(),
});
export type PlatformOverride = z.infer<typeof PlatformOverrideSchema>;

export const PostItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  baseContent: z.string(),
  media: z.array(PostMediaSchema).default([]),
  hasAudio: z.boolean().default(false),
  targetPlatforms: z.array(PlatformIdSchema).min(1, "Select at least one destination platform"),
  communityIds: z.array(z.string()).default([]),
  platformOverrides: z.record(z.string(), PlatformOverrideSchema).optional().default({}),
  status: PostStatusSchema.default("draft"),
  scheduledFor: z.string().optional(),
  publishedAt: z.string().optional(),
  createdAt: z.string().default(() => new Date().toISOString()),
  author: z.object({
    name: z.string(),
    avatar: z.string().optional(),
  }),
  metrics: z
    .object({
      views: z.number().default(0),
      likes: z.number().default(0),
      shares: z.number().default(0),
      comments: z.number().default(0),
    })
    .optional(),
  failureReason: z.string().optional(),
});
export type PostItem = z.infer<typeof PostItemSchema>;

export const CreatePostInputSchema = PostItemSchema.omit({
  id: true,
  createdAt: true,
});
export type CreatePostInput = z.infer<typeof CreatePostInputSchema>;
