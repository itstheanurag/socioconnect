import { z } from "zod";

export const SubscriptionTierSchema = z.enum(["free", "starter", "pro", "agency"]);
export type SubscriptionTier = z.infer<typeof SubscriptionTierSchema>;

export const SubscriptionStatusSchema = z.enum([
  "active",
  "trialing",
  "past_due",
  "canceled",
  "unpaid",
  "paused",
]);

export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

export const SubscriptionSummarySchema = z.object({
  id: z.string(),
  tier: SubscriptionTierSchema,
  status: SubscriptionStatusSchema,
  postsRemaining: z.number(),
  maxAccounts: z.number(),
  currentPeriodEnd: z.string().nullable().optional(),
});

export type SubscriptionSummary = z.infer<typeof SubscriptionSummarySchema>;
