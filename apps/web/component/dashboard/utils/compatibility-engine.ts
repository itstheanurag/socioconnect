import { CompatibilityAnalysis, PlatformId, PostMedia } from "@/component/dashboard/types";
import { PLATFORM_CAPABILITIES } from "@/component/dashboard/data/mock-data";

export interface ContentAnalysisInput {
  text: string;
  media: PostMedia[];
  hasAudio: boolean;
}

export function analyzePlatformCompatibility(
  platformId: PlatformId,
  content: ContentAnalysisInput,
): CompatibilityAnalysis {
  const caps = PLATFORM_CAPABILITIES[platformId];
  const imageCount = content.media.filter((m) => m.type === "image").length;
  const videoCount = content.media.filter((m) => m.type === "video").length;
  const audioCount =
    content.media.filter((m) => m.type === "audio").length + (content.hasAudio ? 1 : 0);
  const textLength = content.text.length;

  const reasons: string[] = [];
  const modificationsSummary: string[] = [];
  const requiredActions: string[] = [];
  let isSupported = true;
  let status: "fully_compatible" | "compatible_with_modifications" | "incompatible" =
    "fully_compatible";

  // Text length checks
  if (textLength > caps.maxTextLength) {
    if (caps.threading) {
      status = "compatible_with_modifications";
      modificationsSummary.push(
        `Text exceeds ${caps.maxTextLength} chars (${textLength} chars) — will automatically split into a numbered thread.`,
      );
    } else {
      isSupported = false;
      status = "incompatible";
      reasons.push(
        `Character count (${textLength}) exceeds platform maximum limit of ${caps.maxTextLength}.`,
      );
    }
  }

  // Audio / Music check
  if (audioCount > 0 && !caps.audioMusic) {
    if (status !== "incompatible") {
      status = "compatible_with_modifications";
      modificationsSummary.push(
        `Background audio is not supported on ${getPlatformDisplayName(platformId)} — will publish visual media without soundtrack.`,
      );
    }
  }

  // Multi-image / Carousel check
  if (imageCount > 1) {
    if (caps.carousel) {
      if (imageCount > caps.maxCarouselImages) {
        status = "compatible_with_modifications";
        modificationsSummary.push(
          `Max ${caps.maxCarouselImages} carousel slides allowed. Only first ${caps.maxCarouselImages} images will be included.`,
        );
      }
    } else if (platformId === "reddit") {
      status = "compatible_with_modifications";
      modificationsSummary.push(
        `Reddit handles gallery format differently — post will receive primary hero image and linked album.`,
      );
    } else if (platformId === "linkedin") {
      status = "compatible_with_modifications";
      modificationsSummary.push(
        `Multi-image carousel will be converted into native swipeable document/presentation deck.`,
      );
    } else if (platformId === "twitter") {
      if (imageCount > 4) {
        status = "compatible_with_modifications";
        modificationsSummary.push(
          `X supports up to 4 images per post. First 4 images will be attached, remaining placed in thread.`,
        );
      }
    } else if (!caps.singleImage) {
      isSupported = false;
      status = "incompatible";
      reasons.push(`Images are not supported on this destination (video only).`);
    }
  }

  // Single Image on YouTube
  if (imageCount === 1 && !caps.singleImage && platformId === "youtube") {
    isSupported = false;
    status = "incompatible";
    reasons.push(
      "YouTube requires video content (images cannot be uploaded directly as standalone posts).",
    );
  }

  // Video duration check
  if (videoCount > 0 && !caps.video) {
    isSupported = false;
    status = "incompatible";
    reasons.push(`Video format is not supported on ${getPlatformDisplayName(platformId)}.`);
  }

  return {
    platformId,
    isSupported,
    status,
    reasons,
    modificationsSummary,
    requiredActions,
  };
}

export function getPlatformDisplayName(platformId: PlatformId): string {
  switch (platformId) {
    case "instagram":
      return "Instagram";
    case "twitter":
      return "X (Twitter)";
    case "linkedin":
      return "LinkedIn";
    case "reddit":
      return "Reddit";
    case "telegram":
      return "Telegram";
    case "facebook":
      return "Facebook";
    case "tiktok":
      return "TikTok";
    case "youtube":
      return "YouTube";
    case "threads":
      return "Threads";
    default:
      return platformId;
  }
}

export function getRecommendedPlatforms(
  content: ContentAnalysisInput,
  allPlatforms: PlatformId[],
): {
  recommended: PlatformId[];
  compatibleWithModifications: PlatformId[];
  incompatible: PlatformId[];
} {
  const recommended: PlatformId[] = [];
  const compatibleWithModifications: PlatformId[] = [];
  const incompatible: PlatformId[] = [];

  for (const p of allPlatforms) {
    const analysis = analyzePlatformCompatibility(p, content);
    if (analysis.status === "fully_compatible") {
      recommended.push(p);
    } else if (analysis.status === "compatible_with_modifications") {
      compatibleWithModifications.push(p);
    } else {
      incompatible.push(p);
    }
  }

  return {
    recommended,
    compatibleWithModifications,
    incompatible,
  };
}
