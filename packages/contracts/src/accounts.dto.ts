import { z } from "zod";

export const ConnectedAccountSummarySchema = z.object({
  id: z.string(),
  platform: z.string(),
  accountName: z.string(),
  accountHandle: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  connectedAt: z.string(),
  isActive: z.boolean(),
});
export type ConnectedAccountSummary = z.infer<typeof ConnectedAccountSummarySchema>;

export const DestinationSummarySchema = z.object({
  id: z.string(),
  accountId: z.string(),
  destinationType: z.string(),
  name: z.string(),
  nativeId: z.string(),
  avatarUrl: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean(),
});
export type DestinationSummary = z.infer<typeof DestinationSummarySchema>;
