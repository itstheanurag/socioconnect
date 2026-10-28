import { randomUUID } from "node:crypto";
import { createRouter, signJwt, verifyJwt } from "@repo/shared";
import type { AppBindings } from "@/types";
import { env } from "@/env";
import { API_KEY_SCOPES } from "@/modules/api-keys/api-keys.service";
import { resolveWorkspaceId } from "@/utils/workspace";
import {
  OAuthError,
  createAuthorizationCode,
  createDynamicClient,
  exchangeAuthorizationCode,
  getClient,
  oauthConfig,
  resolveRefreshToken,
  revokeRefreshTokenForClient,
  rotateRefreshToken,
  validateClientScopes,
  validateRedirectUri,
  validateResource,
} from "./oauth.service";

export const oauthRoutes = createRouter<AppBindings>();

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
  Pragma: "no-cache",
};

function formValue(body: Record<string, string | File>, key: string): string | null {
  const value = body[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function basicClientCredentials(c: {
  req: { header: (name: string) => string | undefined };
}): { clientId: string; clientSecret: string } | null {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Basic ")) return null;

  try {
    const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
    const separator = decoded.indexOf(":");
    if (separator === -1) return null;
    return {
      clientId: decodeURIComponent(decoded.slice(0, separator)),
      clientSecret: decodeURIComponent(decoded.slice(separator + 1)),
    };
  } catch {
    return null;
  }
}

function oauthErrorResponse(c: any, error: OAuthError) {
  return c.json(
    { error: error.code, error_description: error.message },
    error.statusCode,
    NO_STORE_HEADERS,
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

oauthRoutes.get("/.well-known/oauth-authorization-server", (c) => {
  return c.json(
    {
      issuer: oauthConfig.issuer,
      authorization_endpoint: `${oauthConfig.issuer}/oauth/authorize`,
      token_endpoint: `${oauthConfig.issuer}/oauth/token`,
      registration_endpoint: `${oauthConfig.issuer}/oauth/register`,
      revocation_endpoint: `${oauthConfig.issuer}/oauth/revoke`,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      code_challenge_methods_supported: ["S256"],
      token_endpoint_auth_methods_supported: ["none", "client_secret_post", "client_secret_basic"],
      scopes_supported: API_KEY_SCOPES,
      client_id_metadata_document_supported: false,
      authorization_response_iss_parameter_supported: true,
    },
    200,
    { "Access-Control-Allow-Origin": "*", ...NO_STORE_HEADERS },
  );
});

function protectedResourceMetadata() {
  return {
    resource: oauthConfig.mcpResource,
    authorization_servers: [oauthConfig.issuer],
    scopes_supported: API_KEY_SCOPES,
    bearer_methods_supported: ["header"],
    resource_documentation: `${env.FRONTEND_URL}/docs/mcp`,
  };
}

oauthRoutes.get("/.well-known/oauth-protected-resource", (c) => {
  return c.json(protectedResourceMetadata(), 200, {
    "Access-Control-Allow-Origin": "*",
    ...NO_STORE_HEADERS,
  });
});

oauthRoutes.get("/.well-known/oauth-protected-resource/mcp", (c) => {
  return c.json(protectedResourceMetadata(), 200, {
    "Access-Control-Allow-Origin": "*",
    ...NO_STORE_HEADERS,
  });
});

oauthRoutes.get("/oauth/authorize", async (c) => {
  const clientId = c.req.query("client_id");
  const redirectUri = c.req.query("redirect_uri");
  const responseType = c.req.query("response_type");
  const codeChallenge = c.req.query("code_challenge");
  const codeChallengeMethod = c.req.query("code_challenge_method");
  const scope = c.req.query("scope");
  const state = c.req.query("state");
  const resource = c.req.query("resource");

  if (!clientId || !redirectUri || responseType !== "code" || !codeChallenge) {
    return c.text("Invalid authorization request", 400);
  }

  if (codeChallengeMethod !== "S256") {
    return c.text("Only S256 PKCE is supported", 400);
  }

  try {
    const client = await getClient(clientId);
    validateRedirectUri(client, redirectUri);
    const scopes = validateClientScopes(client, scope ? scope.split(" ").filter(Boolean) : []);
    const resolvedResource = validateResource(resource);

    const user = c.var.user;
    if (!user) {
      const loginUrl = `${env.FRONTEND_URL}/login?next=${encodeURIComponent(c.req.url)}`;
      return c.html(
        `<!doctype html><html><body style="font-family:system-ui;max-width:560px;margin:80px auto">
        <h1>Sign in to continue</h1>
        <p>Sign in to SocioConnect before connecting this app.</p>
        <p><a href="${escapeHtml(loginUrl)}">Sign in</a></p>
        </body></html>`,
        401,
      );
    }

    const workspaceId = await resolveWorkspaceId(user.id, c.var.auth);
    const consentToken = signJwt(
      {
        token_use: "oauth_consent",
        clientId,
        clientName: client.clientName,
        redirectUri,
        scopes,
        codeChallenge,
        resource: resolvedResource,
        state: state ?? null,
        workspaceId,
      },
      env.JWT_SECRET,
      { expiresIn: "10m", subject: user.id, jwtid: randomUUID() },
    );

    const scopeItems = scopes.map((item) => `<li><code>${escapeHtml(item)}</code></li>`).join("");

    return c.html(
      `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Authorize ${escapeHtml(client.clientName)}</title>
</head>
<body style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:80px auto;padding:0 20px;color:#111;background:#fafafa">
  <div style="background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:28px">
    <h1 style="font-size:22px;margin:0 0 8px">Connect ${escapeHtml(client.clientName)}</h1>
    <p style="color:#555;line-height:1.5">
      This app is requesting access to your SocioConnect workspace.
      It will be able to use these permissions:
    </p>
    <ul style="color:#333;line-height:1.8">${scopeItems}</ul>
    <p style="color:#777;font-size:13px">
      Publishing still requires a separate explicit confirmation for each post.
    </p>
    <form method="post" action="/oauth/authorize/decision" style="display:flex;gap:12px;margin-top:24px">
      <input type="hidden" name="consent_token" value="${escapeHtml(consentToken)}" />
      <button name="decision" value="allow" style="background:#111;color:#fff;border:0;border-radius:8px;padding:12px 20px;font-size:15px;cursor:pointer">
        Authorize
      </button>
      <button name="decision" value="deny" style="background:#fff;color:#111;border:1px solid #d4d4d4;border-radius:8px;padding:12px 20px;font-size:15px;cursor:pointer">
        Cancel
      </button>
    </form>
  </div>
</body>
</html>`,
      200,
      NO_STORE_HEADERS,
    );
  } catch (err) {
    if (err instanceof OAuthError) {
      return c.text(`${err.code}: ${err.message}`, err.statusCode as 400);
    }
    throw err;
  }
});

oauthRoutes.post("/oauth/authorize/decision", async (c) => {
  const body = (await c.req.parseBody()) as Record<string, string | File>;
  const consentToken = formValue(body, "consent_token");
  const decision = formValue(body, "decision");

  if (!consentToken) return c.text("Missing consent token", 400);

  let claims: {
    token_use?: string;
    sub?: string;
    clientId?: string;
    redirectUri?: string;
    scopes?: string[];
    codeChallenge?: string;
    resource?: string;
    state?: string | null;
    workspaceId?: string;
  } | null = null;

  try {
    claims = verifyJwt(consentToken, env.JWT_SECRET);
  } catch {
    return c.text("Consent request expired", 400);
  }

  if (!claims || claims.token_use !== "oauth_consent" || !claims.sub) {
    return c.text("Invalid consent request", 400);
  }

  const user = c.var.user;
  if (!user || user.id !== claims.sub) {
    return c.text("Sign in to complete this authorization", 401);
  }

  if (
    !claims.clientId ||
    !claims.redirectUri ||
    !claims.scopes ||
    !claims.codeChallenge ||
    !claims.resource ||
    !claims.workspaceId
  ) {
    return c.text("Invalid consent request", 400);
  }

  const redirect = new URL(claims.redirectUri);
  if (decision !== "allow") {
    redirect.searchParams.set("error", "access_denied");
    redirect.searchParams.set("error_description", "The user denied the request");
    if (claims.state) redirect.searchParams.set("state", claims.state);
    redirect.searchParams.set("iss", oauthConfig.issuer);
    return c.redirect(redirect.toString());
  }

  const code = await createAuthorizationCode({
    clientId: claims.clientId,
    userId: user.id,
    workspaceId: claims.workspaceId,
    redirectUri: claims.redirectUri,
    scopes: claims.scopes,
    codeChallenge: claims.codeChallenge,
    resource: claims.resource,
  });

  redirect.searchParams.set("code", code);
  if (claims.state) redirect.searchParams.set("state", claims.state);
  redirect.searchParams.set("iss", oauthConfig.issuer);
  return c.redirect(redirect.toString());
});

oauthRoutes.post("/oauth/token", async (c) => {
  try {
    const body = (await c.req.parseBody()) as Record<string, string | File>;
    const basic = basicClientCredentials(c);
    const clientId = formValue(body, "client_id") ?? basic?.clientId;
    const clientSecret = formValue(body, "client_secret") ?? basic?.clientSecret ?? null;
    const grantType = formValue(body, "grant_type");

    if (!clientId) {
      throw new OAuthError("invalid_request", "client_id is required");
    }

    if (grantType === "authorization_code") {
      const code = formValue(body, "code");
      const redirectUri = formValue(body, "redirect_uri");
      const codeVerifier = formValue(body, "code_verifier");
      if (!code || !redirectUri || !codeVerifier) {
        throw new OAuthError(
          "invalid_request",
          "code, redirect_uri and code_verifier are required",
        );
      }

      const tokens = await exchangeAuthorizationCode({
        code,
        clientId,
        redirectUri,
        codeVerifier,
        resource: formValue(body, "resource"),
        clientSecret,
      });

      return c.json(tokens, 200, NO_STORE_HEADERS);
    }

    if (grantType === "refresh_token") {
      const refreshToken = formValue(body, "refresh_token");
      if (!refreshToken) {
        throw new OAuthError("invalid_request", "refresh_token is required");
      }

      const resolved = await resolveRefreshToken({
        refreshToken,
        clientId,
        resource: formValue(body, "resource"),
        clientSecret,
      });
      const tokens = await rotateRefreshToken({
        client: resolved.client,
        token: resolved.token,
        resource: resolved.resource,
      });

      return c.json(tokens, 200, NO_STORE_HEADERS);
    }

    throw new OAuthError("unsupported_grant_type", "Unsupported grant_type");
  } catch (err) {
    if (err instanceof OAuthError) return oauthErrorResponse(c, err);
    throw err;
  }
});

oauthRoutes.post("/oauth/register", async (c) => {
  try {
    const body = (await c.req.json()) as {
      client_name?: string;
      redirect_uris?: string[];
      grant_types?: string[];
      response_types?: string[];
      token_endpoint_auth_method?: string;
      scope?: string;
      client_uri?: string;
      logo_uri?: string;
    };

    if (!body.client_name || !Array.isArray(body.redirect_uris)) {
      throw new OAuthError("invalid_client_metadata", "client_name and redirect_uris are required");
    }

    const { client, clientSecret } = await createDynamicClient({
      clientName: body.client_name,
      redirectUris: body.redirect_uris,
      grantTypes: body.grant_types,
      responseTypes: body.response_types,
      tokenEndpointAuthMethod: body.token_endpoint_auth_method,
      scopes: body.scope ? body.scope.split(" ").filter(Boolean) : [],
      clientUri: body.client_uri,
      logoUri: body.logo_uri,
    });

    const now = Math.floor(Date.now() / 1000);

    return c.json(
      {
        client_id: client.clientId,
        ...(clientSecret ? { client_secret: clientSecret } : {}),
        client_id_issued_at: now,
        client_secret_expires_at: 0,
        client_name: client.clientName,
        redirect_uris: client.redirectUris,
        grant_types: client.grantTypes,
        response_types: client.responseTypes,
        token_endpoint_auth_method: client.tokenEndpointAuthMethod,
        scope: client.scopes.join(" "),
      },
      201,
      NO_STORE_HEADERS,
    );
  } catch (err) {
    if (err instanceof OAuthError) return oauthErrorResponse(c, err);
    throw err;
  }
});

oauthRoutes.post("/oauth/revoke", async (c) => {
  const body = (await c.req.parseBody()) as Record<string, string | File>;
  const token = formValue(body, "token");
  const basic = basicClientCredentials(c);
  const clientId = formValue(body, "client_id") ?? basic?.clientId;

  if (token && clientId) {
    await revokeRefreshTokenForClient(token, clientId);
  }

  return c.json({}, 200, NO_STORE_HEADERS);
});
