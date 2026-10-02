import React from "react";
import {
  InstagramIcon,
  XIcon,
  LinkedInIcon,
  RedditIcon,
  TelegramIcon,
  FacebookIcon,
  TikTokIcon,
  YouTubeIcon,
  ThreadsIcon,
} from "@/component/icons/social-icons";
import { PlatformId } from "../types";

interface PlatformIconProps {
  platformId: PlatformId;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

export function PlatformIcon({ platformId, className = "" }: PlatformIconProps) {
  switch (platformId) {
    case "instagram":
      return <InstagramIcon className={className} />;
    case "twitter":
      return <XIcon className={className} />;
    case "linkedin":
      return <LinkedInIcon className={className} />;
    case "reddit":
      return <RedditIcon className={className} />;
    case "telegram":
      return <TelegramIcon className={className} />;
    case "facebook":
      return <FacebookIcon className={className} />;
    case "tiktok":
      return <TikTokIcon className={className} />;
    case "youtube":
      return <YouTubeIcon className={className} />;
    case "threads":
      return <ThreadsIcon className={className} />;
    default:
      return null;
  }
}

export function getPlatformDisplayName(platformId: PlatformId): string {
  switch (platformId) {
    case "twitter":
      return "X (Twitter)";
    case "linkedin":
      return "LinkedIn";
    case "instagram":
      return "Instagram";
    case "telegram":
      return "Telegram";
    case "reddit":
      return "Reddit";
    case "threads":
      return "Threads";
    case "facebook":
      return "Facebook";
    case "tiktok":
      return "TikTok";
    case "youtube":
      return "YouTube";
    default:
      return platformId;
  }
}

export function getPlatformBrandColor(platformId: PlatformId): {
  bg: string;
  text: string;
  border: string;
  glow: string;
} {
  switch (platformId) {
    case "instagram":
      return {
        bg: "bg-pink-500/10 hover:bg-pink-500/15",
        text: "text-pink-400",
        border: "border-pink-500/20",
        glow: "shadow-pink-500/20",
      };
    case "twitter":
      return {
        bg: "bg-neutral-800/80 hover:bg-neutral-800",
        text: "text-neutral-200",
        border: "border-neutral-700",
        glow: "shadow-neutral-500/20",
      };
    case "linkedin":
      return {
        bg: "bg-sky-600/10 hover:bg-sky-600/15",
        text: "text-sky-400",
        border: "border-sky-500/20",
        glow: "shadow-sky-500/20",
      };
    case "reddit":
      return {
        bg: "bg-orange-600/10 hover:bg-orange-600/15",
        text: "text-orange-400",
        border: "border-orange-500/20",
        glow: "shadow-orange-500/20",
      };
    case "telegram":
      return {
        bg: "bg-cyan-500/10 hover:bg-cyan-500/15",
        text: "text-cyan-400",
        border: "border-cyan-500/20",
        glow: "shadow-cyan-500/20",
      };
    case "facebook":
      return {
        bg: "bg-blue-600/10 hover:bg-blue-600/15",
        text: "text-blue-400",
        border: "border-blue-500/20",
        glow: "shadow-blue-500/20",
      };
    case "tiktok":
      return {
        bg: "bg-teal-500/10 hover:bg-teal-500/15",
        text: "text-teal-400",
        border: "border-teal-500/20",
        glow: "shadow-teal-500/20",
      };
    case "youtube":
      return {
        bg: "bg-red-600/10 hover:bg-red-600/15",
        text: "text-red-400",
        border: "border-red-500/20",
        glow: "shadow-red-500/20",
      };
    case "threads":
      return {
        bg: "bg-neutral-800/60 hover:bg-neutral-800/80",
        text: "text-neutral-200",
        border: "border-neutral-700",
        glow: "shadow-neutral-500/20",
      };
    default:
      return {
        bg: "bg-neutral-800",
        text: "text-neutral-400",
        border: "border-neutral-700",
        glow: "shadow-none",
      };
  }
}
