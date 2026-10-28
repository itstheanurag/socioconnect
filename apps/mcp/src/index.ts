import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { resolveMcpAuth, unauthorized } from "./auth";
import { env } from "./env";
import { createMcpServer } from "./server";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Authorization", "Content-Type", "Mcp-Session-Id", "Idempotency-Key"],
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    exposeHeaders: ["Mcp-Session-Id", "WWW-Authenticate"],
  }),
);

app.get("/health", (c) => c.json({ status: "ok", service: "socioconnect-mcp" }));

const protectedResourceMetadata = {
  resource: env.MCP_RESOURCE_URL,
  authorization_servers: [env.OAUTH_ISSUER],
  scopes_supported: [
    "profile:read",
    "accounts:read",
    "destinations:read",
    "posts:read",
    "posts:write",
    "posts:publish",
    "media:write",
    "analytics:read",
    "usage:read",
    "notifications:read",
  ],
  bearer_methods_supported: ["header"],
};

app.get("/.well-known/oauth-protected-resource", (c) =>
  c.json(protectedResourceMetadata, 200, { "Cache-Control": "no-store" }),
);

app.get("/.well-known/oauth-protected-resource/mcp", (c) =>
  c.json(protectedResourceMetadata, 200, { "Cache-Control": "no-store" }),
);

app.get("/.well-known/openai-apps-challenge", (c) => {
  if (!env.OPENAI_APPS_CHALLENGE_TOKEN) {
    return c.text("Not found", 404);
  }
  return c.text(env.OPENAI_APPS_CHALLENGE_TOKEN, 200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
});

app.all("/mcp", async (c) => {
  const auth = await resolveMcpAuth(c);
  if (!auth) {
    return unauthorized(c);
  }

  const server = createMcpServer(auth);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);

  try {
    return await transport.handleRequest(c.req.raw);
  } finally {
    await server.close();
  }
});

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`SocioConnect MCP server running on port ${info.port}`);
});
