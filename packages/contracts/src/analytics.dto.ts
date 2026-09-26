import { z } from "zod";

export const AnalyticsOverviewSchema = z.object({
  totalPosts: z.number(),
  publishedCount: z.number(),
  scheduledCount: z.number(),
  failedCount: z.number(),
  successRate: z.number(),
  impressionsEstimated: z.number(),
  hoursSaved: z.number(),
});
export type AnalyticsOverview = z.infer<typeof AnalyticsOverviewSchema>;

export const PlatformReachItemSchema = z.object({
  platform: z.string(),
  postsCount: z.number(),
  reachEstimate: z.number(),
  engagementRate: z.number(),
});
export type PlatformReachItem = z.infer<typeof PlatformReachItemSchema>;
