/**
 * Computes character count using Intl.Segmenter for accurate Unicode Grapheme Cluster counting
 * (supports emojis, composite characters, unicode accents, etc.)
 */
export function countGraphemes(text: string): number {
  if (!text) return 0;
  if (typeof Intl !== "undefined" && typeof Intl.Segmenter !== "undefined") {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    const segments = segmenter.segment(text);
    let count = 0;
    for (const _ of segments) {
      count++;
    }
    return count;
  }
  // Fallback to Array.from for surrogate-pair counting
  return Array.from(text).length;
}

/**
 * Counts UTF-16 code units (standard JS string.length)
 */
export function countCodeUnits(text: string): number {
  return text ? text.length : 0;
}

/**
 * Counts UTF-8 byte length
 */
export function countBytes(text: string): number {
  if (!text) return 0;
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(text).length;
  }
  return Buffer.byteLength(text, "utf8");
}
