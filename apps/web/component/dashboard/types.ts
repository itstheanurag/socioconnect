import { PlatformId } from "@repo/contracts";

// Re-export shared domain types directly from @repo/contracts
export type {
  PlatformId,
  PlatformCapability,
  ConnectorAccount,
  PostMedia,
  PlatformOverride,
  PostStatus,
  PostItem,
  CreatePostInput,
  CommunityDestination,
  Community,
  CreateCommunityInput,
  TelegramBot,
  CreateTelegramBotInput,
  AutomationRule,
  CreateAutomationRuleInput,
} from "@repo/contracts";

// UI-only types
export type { DashboardSection, ContextualPanelState, ContextualPanelType } from "./schemas";

export interface CompatibilityAnalysis {
  platformId: PlatformId;
  isSupported: boolean;
  status: "fully_compatible" | "compatible_with_modifications" | "incompatible";
  reasons: string[];
  modificationsSummary?: string[];
  requiredActions?: string[];
}
