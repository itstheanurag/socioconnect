import type { AuthContext } from "@/types";

/**
 * Returns whether the current credential may access a connected account.
 *
 * Session auth has full access. API keys with no account allowlist also have
 * full workspace access; otherwise only the listed accounts are allowed.
 */
export function isAccountAllowed(
  auth: AuthContext | undefined,
  accountId: string | null | undefined,
): boolean {
  if (!accountId) return false;
  if (auth?.type !== "api_key") return true;
  if (!auth.accountIds || auth.accountIds.length === 0) return true;
  return auth.accountIds.includes(accountId);
}
