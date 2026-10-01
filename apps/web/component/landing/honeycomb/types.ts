import { PlatformConfig } from "@/component/icons/social-icons";

export interface GridRowConfig {
  row: number;
  count: number;
  offset: boolean;
}

export interface SlotMeta {
  posId: string;
  row: number;
  col: number;
  distFromCenter: number;
  opacity: number;
  borderAlpha: number;
  glowFactor: number;
}

export interface HoneycombGridProps {
  rows?: GridRowConfig[];
  platformPool?: PlatformConfig[];
  intervalMs?: number;
  cardSize?: "sm" | "md" | "lg";
  selectedCategory?: string;
  onHoverPlatform?: (platform: PlatformConfig | null) => void;
  className?: string;
}
