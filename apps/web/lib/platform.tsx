import {
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Youtube,
  MessageCircle,
  Music2,
} from "lucide-react";

export type PlatformId =
  | "instagram"
  | "linkedin"
  | "x"
  | "facebook"
  | "threads"
  | "tiktok"
  | "youtube";

export interface PlatformMeta {
  id: PlatformId;
  name: string;
  icon: typeof Instagram;
  color: string;
  bg: string;
}

export const platforms: Record<PlatformId, PlatformMeta> = {
  instagram: {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "#C13584",
    bg: "#F4DCB4",
  },
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    color: "#0A66C2",
    bg: "#E8E1D4",
  },
  x: {
    id: "x",
    name: "X",
    icon: Twitter,
    color: "#171714",
    bg: "#F8F3E8",
  },
  facebook: {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "#1877F2",
    bg: "#F4DCB4",
  },
  threads: {
    id: "threads",
    name: "Threads",
    icon: MessageCircle,
    color: "#171714",
    bg: "#E8E1D4",
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok",
    icon: Music2,
    color: "#EE1D52",
    bg: "#F8F3E8",
  },
  youtube: {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    color: "#FF0000",
    bg: "#F4DCB4",
  },
};

export const platformOrder: PlatformId[] = [
  "instagram",
  "linkedin",
  "x",
  "threads",
  "facebook",
  "tiktok",
  "youtube",
];
