import type { MediaItem, ValidationError } from "../types/post.types";
import type { PlatformLimits } from "../types/provider.types";

export function validateMediaItems(
  media: MediaItem[] | undefined,
  limits: PlatformLimits,
  platformName: string,
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!media || media.length === 0) return errors;

  if (media.length > limits.maxMediaCount) {
    errors.push({
      field: "media",
      message: `${platformName} allows maximum ${limits.maxMediaCount} media items. You provided ${media.length}.`,
      code: "MEDIA_COUNT_EXCEEDED",
      critical: true,
    });
  }

  for (let i = 0; i < media.length; i++) {
    const item = media[i];

    if (!item.url) {
      errors.push({
        field: `media[${i}].url`,
        message: `Media item ${i + 1} is missing a valid URL.`,
        code: "INVALID_MEDIA_URL",
        critical: true,
      });
      continue;
    }

    if (item.type === "image") {
      if (
        limits.allowedImageMimeTypes.length > 0 &&
        !limits.allowedImageMimeTypes.includes(item.mimeType.toLowerCase())
      ) {
        errors.push({
          field: `media[${i}].mimeType`,
          message: `Image format '${item.mimeType}' is not supported by ${platformName}. Allowed: ${limits.allowedImageMimeTypes.join(", ")}`,
          code: "UNSUPPORTED_MEDIA_MIME",
          critical: true,
        });
      }

      if (item.sizeBytes && item.sizeBytes > limits.maxImageSizeBytes) {
        const maxMb = (limits.maxImageSizeBytes / (1024 * 1024)).toFixed(1);
        const actualMb = (item.sizeBytes / (1024 * 1024)).toFixed(1);
        errors.push({
          field: `media[${i}].sizeBytes`,
          message: `Image size (${actualMb} MB) exceeds ${platformName} maximum of ${maxMb} MB.`,
          code: "MEDIA_SIZE_EXCEEDED",
          critical: true,
        });
      }
    } else if (item.type === "video") {
      if (
        limits.allowedVideoMimeTypes &&
        limits.allowedVideoMimeTypes.length > 0 &&
        !limits.allowedVideoMimeTypes.includes(item.mimeType.toLowerCase())
      ) {
        errors.push({
          field: `media[${i}].mimeType`,
          message: `Video format '${item.mimeType}' is not supported by ${platformName}. Allowed: ${limits.allowedVideoMimeTypes.join(", ")}`,
          code: "UNSUPPORTED_MEDIA_MIME",
          critical: true,
        });
      }

      if (limits.maxVideoSizeBytes && item.sizeBytes && item.sizeBytes > limits.maxVideoSizeBytes) {
        const maxMb = (limits.maxVideoSizeBytes / (1024 * 1024)).toFixed(1);
        const actualMb = (item.sizeBytes / (1024 * 1024)).toFixed(1);
        errors.push({
          field: `media[${i}].sizeBytes`,
          message: `Video size (${actualMb} MB) exceeds ${platformName} maximum of ${maxMb} MB.`,
          code: "MEDIA_SIZE_EXCEEDED",
          critical: true,
        });
      }
    }
  }

  return errors;
}
