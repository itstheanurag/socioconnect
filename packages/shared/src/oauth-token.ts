import { randomUUID } from "node:crypto";
import { signJwt, verifyJwt } from "./jwt";

export interface OAuthAccessTokenClaims {
  token_use: "oauth";
  sub: string;
  workspace_id: string;
  scope: string;
  client_id: string;
  iss: string;
  aud: string;
}

export function signOAuthAccessToken(
  input: {
    userId: string;
    workspaceId: string;
    scopes: string[];
    clientId: string;
    issuer: string;
    audience: string;
    ttlSeconds: number;
  },
  secret: string,
): string {
  return signJwt(
    {
      token_use: "oauth",
      sub: input.userId,
      workspace_id: input.workspaceId,
      scope: input.scopes.join(" "),
      client_id: input.clientId,
    },
    secret,
    {
      expiresIn: input.ttlSeconds,
      issuer: input.issuer,
      audience: input.audience,
      jwtid: randomUUID(),
    },
  );
}

export function verifyOAuthAccessToken(
  token: string,
  options: { secret: string; issuer: string; audience: string },
): OAuthAccessTokenClaims | null {
  try {
    const claims = verifyJwt<OAuthAccessTokenClaims>(token, options.secret, {
      issuer: options.issuer,
      audience: options.audience,
    });
    if (
      !claims ||
      claims.token_use !== "oauth" ||
      !claims.sub ||
      !claims.workspace_id ||
      !claims.client_id
    ) {
      return null;
    }
    return claims;
  } catch {
    return null;
  }
}
