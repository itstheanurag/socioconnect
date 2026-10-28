import { ApiKeysRepository, type ApiKey } from "@repo/db";
import { env } from "@/env";
import {
  generateApiKey as generateCryptoApiKey,
  hashApiKey,
  hashMatches,
  parseApiKey,
} from "./api-key-crypto";

export {
  API_KEY_SCOPES,
  hashApiKey,
  hashMatches,
  isValidScope,
  parseApiKey,
} from "./api-key-crypto";

export function generateApiKey(): { token: string; prefix: string; keyHash: string } {
  return generateCryptoApiKey(env.NODE_ENV === "production" ? "live" : "test");
}

export async function verifyApiKey(token: string): Promise<ApiKey | null> {
  const parsed = parseApiKey(token);
  if (!parsed) return null;

  const record = await ApiKeysRepository.findByPrefix(parsed.prefix);
  if (!record) return null;

  if (!hashMatches(hashApiKey(token), record.keyHash)) return null;
  if (record.expiresAt && record.expiresAt < new Date()) return null;

  return record;
}
