import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export interface ToolSecurityScheme {
  type: "oauth2" | "apiKey";
  name: string;
  scopes?: string[];
  in?: "header";
  parameterName?: string;
  scheme?: string;
}

const OAUTH_SCHEME = "socioconnect_oauth";
const API_KEY_SCHEME = "socioconnect_api_key";

function schemes(scopes: string[]): ToolSecurityScheme[] {
  return [
    { type: "oauth2", name: OAUTH_SCHEME, scopes },
    {
      type: "apiKey",
      name: API_KEY_SCHEME,
      in: "header",
      parameterName: "Authorization",
      scheme: "bearer",
    },
  ];
}

/**
 * Declares which credential and scopes each tool expects.
 *
 * MCP core does not yet define a per-tool security scheme field, so these are
 * published both as a top-level `securitySchemes` property and inside `_meta`
 * for clients (OpenAI Apps, Claude, Cursor) that read tool metadata.
 */
export const TOOL_SECURITY_SCHEMES: Record<string, ToolSecurityScheme[]> = {
  get_profile: schemes(["profile:read"]),
  list_accounts: schemes(["accounts:read"]),
  list_destinations: schemes(["destinations:read"]),
  get_platform_capabilities: schemes([]),
  list_posts: schemes(["posts:read"]),
  get_post: schemes(["posts:read"]),
  get_usage: schemes(["usage:read"]),
  create_media_upload_url: schemes(["media:write"]),
  confirm_media_upload: schemes(["media:write"]),
  create_draft: schemes(["posts:write"]),
  update_draft: schemes(["posts:write"]),
  reschedule_post: schemes(["posts:write"]),
  cancel_scheduled_post: schemes(["posts:write"]),
  create_publish_intent: schemes(["posts:publish"]),
  render_publish_preview: schemes(["posts:publish"]),
  confirm_publish_intent: schemes(["posts:publish"]),
  retry_failed_dispatch: schemes(["posts:publish"]),
  get_connect_link: schemes(["accounts:read"]),
};

type RequestHandlers = Map<
  string,
  (request: unknown, extra: unknown) => unknown | Promise<unknown>
>;

type ListToolsResult = {
  tools: Array<Record<string, unknown> & { name: string; _meta?: Record<string, unknown> }>;
};

/**
 * Wraps the SDK's `tools/list` handler so every tool advertises its security
 * scheme. The SDK does not expose this field through `registerTool`, and its
 * handler map is the only extension point that does not fork the transport.
 */
export function attachToolSecuritySchemes(server: McpServer): void {
  const handlers = (server.server as unknown as { _requestHandlers: RequestHandlers })
    ._requestHandlers;
  const original = handlers.get("tools/list");
  if (!original) return;

  handlers.set("tools/list", async (request, extra) => {
    const result = (await original(request, extra)) as ListToolsResult;

    return {
      ...result,
      tools: result.tools.map((tool) => {
        const toolSchemes = TOOL_SECURITY_SCHEMES[tool.name] ?? [];
        return {
          ...tool,
          securitySchemes: toolSchemes,
          _meta: {
            ...(tool._meta ?? {}),
            securitySchemes: toolSchemes,
          },
        };
      }),
    };
  });
}
