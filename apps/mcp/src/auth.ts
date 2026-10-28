import type { Context } from "hono";
import { signServiceToken, verifyOAuthAccessToken } from "@repo/shared";
import { env, serviceTokenSecret } from "./env";

export interface McpAuth {
  type: "oauth" | "api_key";
  apiToken: string;
  userId?: string;
  workspaceId?: string;
  scopes: string[];
  clientId?: string;
}

function bearerToken(c: Context): string | null {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

export function unauthorized(c: Context, description = "Authentication required") {
  c.header(
    "WWW-Authenticate",
    `Bearer resource_metadata="${env.OAUTH_ISSUER}/.well-known/oauth-protected-resource", error="invalid_token", error_description="${description}"`,
  );
  return c.json({ error: "unauthorized", error_description: description }, 401);
}

export async function resolveMcpAuth(c: Context): Promise<McpAuth | null> {
  const token = bearerToken(c);
  if (!token) return null;

  if (token.startsWith("sck_")) {
    // API-key scope validation happens on the API for each tool call. Do not
    // require profile:read here just to establish the connection.
    return {
      type: "api_key",
      apiToken: token,
      scopes: [],
    };
  }

  const claims = verifyOAuthAccessToken(token, {
    secret: env.JWT_SECRET,
    issuer: env.OAUTH_ISSUER,
    audience: env.MCP_RESOURCE_URL,
  });

  if (!claims) return null;

  const scopes = claims.scope ? claims.scope.split(" ").filter(Boolean) : [];
  const serviceToken = signServiceToken(
    {
      userId: claims.sub,
      workspaceId: claims.workspace_id,
      scopes,
      clientId: claims.client_id,
    },
    serviceTokenSecret,
  );

  return {
    type: "oauth",
    apiToken: serviceToken,
    userId: claims.sub,
    workspaceId: claims.workspace_id,
    scopes,
    clientId: claims.client_id,
  };
}
