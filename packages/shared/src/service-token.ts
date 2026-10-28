import { randomUUID } from "node:crypto";
import { signJwt, verifyJwt } from "./jwt";

export const SERVICE_TOKEN_ISSUER = "socioconnect-mcp";
export const SERVICE_TOKEN_AUDIENCE = "socioconnect-api";
export const SERVICE_TOKEN_TTL_SECONDS = 60;

export interface ServiceTokenClaims {
  token_use: "service";
  sub: string;
  workspace_id: string;
  scope: string;
  client_id?: string;
  iss: string;
  aud: string;
}

export function signServiceToken(
  input: {
    userId: string;
    workspaceId: string;
    scopes: string[];
    clientId?: string;
  },
  secret: string,
): string {
  return signJwt(
    {
      token_use: "service",
      sub: input.userId,
      workspace_id: input.workspaceId,
      scope: input.scopes.join(" "),
      ...(input.clientId ? { client_id: input.clientId } : {}),
    },
    secret,
    {
      expiresIn: SERVICE_TOKEN_TTL_SECONDS,
      issuer: SERVICE_TOKEN_ISSUER,
      audience: SERVICE_TOKEN_AUDIENCE,
      jwtid: randomUUID(),
    },
  );
}

export function verifyServiceToken(token: string, secret: string): ServiceTokenClaims | null {
  try {
    const claims = verifyJwt<ServiceTokenClaims>(token, secret, {
      issuer: SERVICE_TOKEN_ISSUER,
      audience: SERVICE_TOKEN_AUDIENCE,
    });
    if (!claims || claims.token_use !== "service" || !claims.sub || !claims.workspace_id) {
      return null;
    }
    return claims;
  } catch {
    return null;
  }
}
