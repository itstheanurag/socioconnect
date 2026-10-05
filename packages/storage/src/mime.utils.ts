import mime from "mime-types";

export interface MimeClassification {
  mimeType: string;
  extension: string;
  isImage: boolean;
  isVideo: boolean;
  isAudio: boolean;
  isDocument: boolean;
}

/**
 * Resolves the MIME type for a given file name or extension.
 * Defaults to 'application/octet-stream' if unrecognized.
 */
export function getMimeType(fileNameOrPath: string, fallback = "application/octet-stream"): string {
  const lookedUp = mime.lookup(fileNameOrPath);
  return typeof lookedUp === "string" ? lookedUp : fallback;
}

/**
 * Resolves standard file extension for a given MIME type.
 */
export function getExtensionForMime(mimeType: string): string | null {
  const ext = mime.extension(mimeType);
  return typeof ext === "string" ? ext : null;
}

/**
 * Checks if the MIME type or file name corresponds to an image.
 */
export function isImage(mimeTypeOrFileName: string): boolean {
  const mimeType = mimeTypeOrFileName.includes("/")
    ? mimeTypeOrFileName
    : getMimeType(mimeTypeOrFileName);
  return mimeType.startsWith("image/");
}

/**
 * Checks if the MIME type or file name corresponds to a video.
 */
export function isVideo(mimeTypeOrFileName: string): boolean {
  const mimeType = mimeTypeOrFileName.includes("/")
    ? mimeTypeOrFileName
    : getMimeType(mimeTypeOrFileName);
  return mimeType.startsWith("video/");
}

/**
 * Checks if the MIME type or file name corresponds to an audio stream.
 */
export function isAudio(mimeTypeOrFileName: string): boolean {
  const mimeType = mimeTypeOrFileName.includes("/")
    ? mimeTypeOrFileName
    : getMimeType(mimeTypeOrFileName);
  return mimeType.startsWith("audio/");
}

/**
 * Checks if the MIME type or file name corresponds to a document/pdf/text format.
 */
export function isDocument(mimeTypeOrFileName: string): boolean {
  const mimeType = mimeTypeOrFileName.includes("/")
    ? mimeTypeOrFileName
    : getMimeType(mimeTypeOrFileName);
  return (
    mimeType.startsWith("text/") ||
    mimeType === "application/pdf" ||
    mimeType === "application/json" ||
    mimeType === "application/xml"
  );
}

/**
 * Classifies a file and returns all MIME properties.
 */
export function classifyMedia(fileNameOrPath: string, providedMime?: string): MimeClassification {
  const resolvedMime =
    providedMime && providedMime !== "application/octet-stream"
      ? providedMime
      : getMimeType(fileNameOrPath);

  const extension = getExtensionForMime(resolvedMime) || fileNameOrPath.split(".").pop() || "";

  return {
    mimeType: resolvedMime,
    extension,
    isImage: isImage(resolvedMime),
    isVideo: isVideo(resolvedMime),
    isAudio: isAudio(resolvedMime),
    isDocument: isDocument(resolvedMime),
  };
}

/**
 * Normalizes content-type string, inferring from file extension when missing or generic.
 */
export function normalizeContentType(fileName: string, providedContentType?: string): string {
  if (
    !providedContentType ||
    providedContentType === "application/octet-stream" ||
    providedContentType === "binary/octet-stream"
  ) {
    return getMimeType(fileName, "application/octet-stream");
  }
  return providedContentType;
}
