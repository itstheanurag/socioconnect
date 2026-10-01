import { z } from "zod";

// Re-export all domain schemas and types from shared contract package
export * from "@repo/contracts";

// Client-only UI State Schemas
export const DashboardSectionSchema = z.enum([
  "overview",
  "compose",
  "posts",
  "calendar",
  "bots",
  "automations",
  "communities",
  "connectors",
  "analytics",
  "settings",
]);
export type DashboardSection = z.infer<typeof DashboardSectionSchema>;

export const ContextualPanelTypeSchema = z.enum([
  "post_preview",
  "post_details",
  "compatibility_breakdown",
  "bot_info",
  "connector_info",
  "activity_feed",
  "schedule_slot",
]);
export type ContextualPanelType = z.infer<typeof ContextualPanelTypeSchema>;

export const ContextualPanelStateSchema = z.object({
  isOpen: z.boolean(),
  type: ContextualPanelTypeSchema.nullable(),
  data: z.any().optional(),
});
export type ContextualPanelState = z.infer<typeof ContextualPanelStateSchema>;
