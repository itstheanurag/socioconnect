import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_TIMESTAMP_SKEW_SECONDS = 5 * 60;

export interface DodoWebhookHeaders {
  id: string;
  timestamp: string;
  signature: string;
}

export const DODO_WEBHOOK_HEADERS = {
  id: "webhook-id",
  timestamp: "webhook-timestamp",
  signature: "webhook-signature",
} as const;

/**
 * Verifies a Dodo Payments webhook using the Standard Webhooks scheme.
 *
 * Signed content is `${webhook-id}.${webhook-timestamp}.${rawBody}` and the
 * signing key is the base64-decoded webhook secret (with the optional
 * `whsec_` prefix removed).
 */
export function verifyDodoWebhookSignature(
  rawBody: string,
  headers: DodoWebhookHeaders,
  secret: string,
): boolean {
  if (!secret || !headers.id || !headers.timestamp || !headers.signature) {
    return false;
  }

  const timestamp = Number(headers.timestamp);
  if (!Number.isFinite(timestamp)) {
    return false;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - timestamp) > MAX_TIMESTAMP_SKEW_SECONDS) {
    return false;
  }

  const signingKey = secret.startsWith("whsec_")
    ? Buffer.from(secret.slice("whsec_".length), "base64")
    : Buffer.from(secret, "utf8");

  const expected = createHmac("sha256", signingKey)
    .update(`${headers.id}.${headers.timestamp}.${rawBody}`)
    .digest("base64");

  const expectedBuffer = Buffer.from(expected);

  return headers.signature.split(" ").some((candidate) => {
    const [version, value] = candidate.split(",");
    if (version !== "v1" || !value) return false;

    const receivedBuffer = Buffer.from(value);
    return (
      receivedBuffer.length === expectedBuffer.length &&
      timingSafeEqual(receivedBuffer, expectedBuffer)
    );
  });
}
