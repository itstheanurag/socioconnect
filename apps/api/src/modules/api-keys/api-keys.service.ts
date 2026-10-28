import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { ApiKeysRepository, type ApiKey } from "@repo/db";
import { env } from "@/env";

export const API_KEY_SCOPES = [
  "profile:read",
  "accounts:read",
  "accounts:write",
  "destinations:read",
  "posts:read",
  "posts:write",
  "posts:publish",
  "media:read",
  "media:write",
  "analytics:read",
  "usage:read",
  "notifications:read",
  "webhooks:manage",
] as const;

export type ApiKeyScope = (typeof API_KEY_SCOPES)[number];

export interface ParsedApiKey {
  prefix: string;
  secret: string;
}

export function generateApiKey(): { token: string; prefix: string; keyHash: string } {
  const environment = env.NODE_ENV === "production" ? "live" : "test";
  const prefix = `sck_${environment}_${randomBytes(4).toString("hex")}`;
  const secret = randomBytes(32).toString("base64url");
  const token = `${prefix}.${secret}`;

  return {
    token,
    prefix,
    keyHash: hashApiKey(token),
  };
}

export function hashApiKey(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function parseApiKey(token: string): ParsedApiKey | null {
  if (!token.startsWith("sck_")) return null;

  const separatorIndex = token.indexOf(".");
  if (separatorIndex === -1) return null;

  const prefix = token.slice(0, separatorIndex);
  const secret = token.slice(separatorIndex + 1);

  if (!prefix || !secret) return null;
  if (!/^sck_(test|live)_[a-f0-9]{8}$/.test(prefix)) return null;

  return { prefix, secret };
}

export function hashMatches(providedHash: string, storedHash: string): boolean {
  const provided = Buffer.from(providedHash, "hex");
  const stored = Buffer.from(storedHash, "hex");

  return provided.length === stored.length && timingSafeEqual(provided, stored);
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

export function isValidScope(scope: string): scope is ApiKeyScope {
  return (API_KEY_SCOPES as readonly string[]).includes(scope);
}
