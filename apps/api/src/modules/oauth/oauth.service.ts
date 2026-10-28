import { randomBytes, timingSafeEqual } from "node:crypto";
import { OAuthRepository, type OAuthClient, type OAuthRefreshToken } from "@repo/db";
import { signOAuthAccessToken } from "@repo/shared";
import { API_KEY_SCOPES } from "@/modules/api-keys/api-key-crypto";
import { hashToken, randomToken, verifyPkce } from "./oauth-crypto";
import { env } from "@/env";

const AUTH_CODE_TTL_MS = 10 * 60 * 1000;

export class OAuthError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly statusCode = 400,
  ) {
    super(message);
    this.name = "OAuthError";
  }
}

export const oauthConfig = {
  issuer: env.OAUTH_ISSUER,
  mcpResource: env.MCP_RESOURCE_URL,
  apiResource: env.API_RESOURCE_URL,
  accessTokenTtlSeconds: env.OAUTH_ACCESS_TOKEN_TTL_SECONDS,
  refreshTokenTtlDays: env.OAUTH_REFRESH_TOKEN_TTL_DAYS,
  accessTokenSecret: env.JWT_SECRET,
  serviceTokenSecret: env.SERVICE_TOKEN_SECRET || env.JWT_SECRET,
  supportedScopes: API_KEY_SCOPES,
};

export { hashToken, pkceChallenge, randomToken, verifyPkce } from "./oauth-crypto";

export function validateScopes(requested: string[]): string[] {
  const scopes = requested.length > 0 ? requested : [...oauthConfig.supportedScopes];
  const supported = oauthConfig.supportedScopes as readonly string[];
  const invalid = scopes.filter((scope) => !supported.includes(scope));
  if (invalid.length > 0) {
    throw new OAuthError("invalid_scope", `Unsupported scopes: ${invalid.join(", ")}`);
  }
  return scopes;
}

export function validateResource(resource: string | null | undefined): string {
  const value = resource ?? oauthConfig.mcpResource;
  if (value !== oauthConfig.mcpResource) {
    throw new OAuthError("invalid_target", "The resource is not this MCP server");
  }
  return value;
}

export async function createDynamicClient(input: {
  clientName: string;
  redirectUris: string[];
  grantTypes?: string[];
  responseTypes?: string[];
  tokenEndpointAuthMethod?: string;
  scopes?: string[];
  clientUri?: string;
  logoUri?: string;
}): Promise<{ client: OAuthClient; clientSecret: string | null }> {
  const tokenEndpointAuthMethod = input.tokenEndpointAuthMethod ?? "none";
  const allowedAuthMethods = ["none", "client_secret_post", "client_secret_basic"];

  if (!allowedAuthMethods.includes(tokenEndpointAuthMethod)) {
    throw new OAuthError("invalid_client_metadata", "Unsupported token_endpoint_auth_method");
  }

  const grantTypes = input.grantTypes ?? ["authorization_code", "refresh_token"];
  const allowedGrants = ["authorization_code", "refresh_token"];
  if (grantTypes.some((grant) => !allowedGrants.includes(grant))) {
    throw new OAuthError("invalid_client_metadata", "Unsupported grant type");
  }

  const responseTypes = input.responseTypes ?? ["code"];
  if (responseTypes.some((type) => type !== "code")) {
    throw new OAuthError("invalid_client_metadata", "Only the code response type is supported");
  }

  if (input.redirectUris.length === 0) {
    throw new OAuthError("invalid_redirect_uri", "At least one redirect URI is required");
  }

  for (const uri of input.redirectUris) {
    const parsed = new URL(uri);
    const isLocalhost = ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
    if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && isLocalhost)) {
      throw new OAuthError("invalid_redirect_uri", "Redirect URIs must use HTTPS or localhost");
    }
  }

  const clientId = `sc_${randomBytes(16).toString("hex")}`;
  const clientSecret =
    tokenEndpointAuthMethod === "none" ? null : randomBytes(32).toString("base64url");

  const client = await OAuthRepository.createClient({
    clientId,
    clientSecretHash: clientSecret ? hashToken(clientSecret) : null,
    clientName: input.clientName,
    redirectUris: input.redirectUris,
    grantTypes,
    responseTypes,
    tokenEndpointAuthMethod,
    scopes: validateScopes(input.scopes ?? []),
    clientUri: input.clientUri ?? null,
    logoUri: input.logoUri ?? null,
    isDynamic: true,
  });

  return { client, clientSecret };
}

export async function getClient(clientId: string): Promise<OAuthClient> {
  const client = await OAuthRepository.findClient(clientId);
  if (!client) {
    throw new OAuthError("invalid_client", "Unknown client", 401);
  }
  return client;
}

export function validateRedirectUri(client: OAuthClient, redirectUri: string): void {
  if (!client.redirectUris.includes(redirectUri)) {
    throw new OAuthError("invalid_request", "redirect_uri is not registered");
  }
}

export function verifyClientSecret(client: OAuthClient, providedSecret: string | null): void {
  if (client.tokenEndpointAuthMethod === "none") return;

  if (!providedSecret || !client.clientSecretHash) {
    throw new OAuthError("invalid_client", "Client authentication required", 401);
  }

  const provided = Buffer.from(hashToken(providedSecret), "hex");
  const stored = Buffer.from(client.clientSecretHash, "hex");

  if (provided.length !== stored.length || !timingSafeEqual(provided, stored)) {
    throw new OAuthError("invalid_client", "Invalid client credentials", 401);
  }
}

export function validateClientScopes(client: OAuthClient, requested: string[]): string[] {
  const scopes = validateScopes(requested);
  const allowed = client.scopes.length > 0 ? client.scopes : [...oauthConfig.supportedScopes];
  const invalid = scopes.filter((scope) => !allowed.includes(scope));
  if (invalid.length > 0) {
    throw new OAuthError(
      "invalid_scope",
      `Scopes not allowed for this client: ${invalid.join(", ")}`,
    );
  }
  return scopes;
}

export async function createAuthorizationCode(input: {
  clientId: string;
  userId: string;
  workspaceId: string;
  redirectUri: string;
  scopes: string[];
  codeChallenge: string;
  resource: string;
}): Promise<string> {
  const code = randomToken();

  await OAuthRepository.createAuthorizationCode({
    codeHash: hashToken(code),
    clientId: input.clientId,
    userId: input.userId,
    workspaceId: input.workspaceId,
    redirectUri: input.redirectUri,
    scopes: input.scopes,
    codeChallenge: input.codeChallenge,
    codeChallengeMethod: "S256",
    resource: input.resource,
    expiresAt: new Date(Date.now() + AUTH_CODE_TTL_MS),
  });

  return code;
}

async function issueTokenPair(input: {
  client: OAuthClient;
  userId: string;
  workspaceId: string;
  scopes: string[];
  resource: string;
  rotatedFrom?: string;
}): Promise<{
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_token: string;
  scope: string;
}> {
  const accessToken = signOAuthAccessToken(
    {
      userId: input.userId,
      workspaceId: input.workspaceId,
      scopes: input.scopes,
      clientId: input.client.clientId,
      issuer: oauthConfig.issuer,
      audience: input.resource,
      ttlSeconds: oauthConfig.accessTokenTtlSeconds,
    },
    oauthConfig.accessTokenSecret,
  );

  const refreshToken = randomToken();
  await OAuthRepository.createRefreshToken({
    tokenHash: hashToken(refreshToken),
    clientId: input.client.clientId,
    userId: input.userId,
    workspaceId: input.workspaceId,
    scopes: input.scopes,
    resource: input.resource,
    expiresAt: new Date(Date.now() + oauthConfig.refreshTokenTtlDays * 24 * 60 * 60 * 1000),
    rotatedFrom: input.rotatedFrom ?? null,
  });

  return {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: oauthConfig.accessTokenTtlSeconds,
    refresh_token: refreshToken,
    scope: input.scopes.join(" "),
  };
}

export async function exchangeAuthorizationCode(input: {
  code: string;
  clientId: string;
  redirectUri: string;
  codeVerifier: string;
  resource?: string | null;
  clientSecret?: string | null;
}) {
  const client = await getClient(input.clientId);
  verifyClientSecret(client, input.clientSecret ?? null);
  validateRedirectUri(client, input.redirectUri);
  const resource = validateResource(input.resource);

  const record = await OAuthRepository.consumeAuthorizationCode(hashToken(input.code));
  if (!record) {
    throw new OAuthError("invalid_grant", "Authorization code is invalid or expired");
  }

  if (
    record.clientId !== input.clientId ||
    record.redirectUri !== input.redirectUri ||
    record.resource !== resource
  ) {
    throw new OAuthError("invalid_grant", "Authorization code does not match the request");
  }

  if (!verifyPkce(input.codeVerifier, record.codeChallenge)) {
    throw new OAuthError("invalid_grant", "PKCE verification failed");
  }

  return issueTokenPair({
    client,
    userId: record.userId,
    workspaceId: record.workspaceId,
    scopes: record.scopes,
    resource: record.resource,
  });
}

/**
 * Resolves and validates a refresh token without rotating it.
 */
export async function resolveRefreshToken(input: {
  refreshToken: string;
  clientId: string;
  resource?: string | null;
  clientSecret?: string | null;
}): Promise<{ client: OAuthClient; token: OAuthRefreshToken; resource: string }> {
  const client = await getClient(input.clientId);
  verifyClientSecret(client, input.clientSecret ?? null);
  const resource = validateResource(input.resource);

  const token = await OAuthRepository.findRefreshToken(hashToken(input.refreshToken));
  if (!token) {
    throw new OAuthError("invalid_grant", "Refresh token is invalid or expired");
  }

  if (token.clientId !== input.clientId || token.resource !== resource) {
    throw new OAuthError("invalid_grant", "Refresh token does not match the request");
  }

  return { client, token, resource };
}

export async function rotateRefreshToken(input: {
  client: OAuthClient;
  token: OAuthRefreshToken;
  resource: string;
}) {
  await OAuthRepository.revokeRefreshToken(input.token.id);
  return issueTokenPair({
    client: input.client,
    userId: input.token.userId,
    workspaceId: input.token.workspaceId,
    scopes: input.token.scopes,
    resource: input.resource,
    rotatedFrom: input.token.id,
  });
}

export async function revokeRefreshTokenForClient(
  refreshToken: string,
  clientId: string,
): Promise<void> {
  const token = await OAuthRepository.findRefreshToken(hashToken(refreshToken));
  if (token && token.clientId === clientId) {
    await OAuthRepository.revokeRefreshToken(token.id);
  }
}
