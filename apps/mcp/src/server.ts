import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ApiError, apiRequest } from "./api-client";
import type { McpAuth } from "./auth";
import { env } from "./env";
import { PUBLISH_PREVIEW_URI, publishPreviewHtml } from "./widgets/publish-preview";

type ToolResult = {
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
};

function ok(data: unknown): ToolResult {
  const structured =
    typeof data === "object" && data !== null && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : { result: data };

  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    structuredContent: structured,
  };
}

function fail(err: unknown): ToolResult {
  const message =
    err instanceof ApiError
      ? `${err.message}${err.code ? ` (${err.code})` : ""}`
      : err instanceof Error
        ? err.message
        : "Unexpected error";

  return {
    isError: true,
    content: [{ type: "text", text: message }],
  };
}

async function getProfile(auth: McpAuth) {
  const [me, workspace] = await Promise.all([
    apiRequest<{
      payload: { user: { email: string; firstName: string; lastName: string | null } };
    }>(auth, "GET", "/v1/auth/me"),
    apiRequest<{
      payload: {
        workspace: { id: string; name: string; slug: string; role: string };
      };
    }>(auth, "GET", "/v1/workspaces/current"),
  ]);

  const user = me.payload.user;
  const ws = workspace.payload.workspace;

  return {
    id: ws.id,
    name: `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`,
    email: user.email,
    nickname: `${ws.name} (${ws.role})`,
  };
}

export function createMcpServer(auth: McpAuth): McpServer {
  const server = new McpServer(
    { name: "socioconnect", version: "1.0.0" },
    {
      instructions:
        "SocioConnect publishes content to many social platforms. Always create a draft first, then create a publish intent. Call render_publish_preview to show the preview when a UI is available, otherwise show the preview as text. Only confirm after explicit approval. Never claim a post was published unless confirm_publish_intent succeeded.",
    },
  );

  server.registerTool(
    "get_profile",
    {
      title: "Get profile",
      description:
        "Return the authenticated SocioConnect profile and workspace. Use this to identify which workspace the user is operating in.",
      inputSchema: {},
      outputSchema: {
        id: z.string(),
        name: z.string().optional(),
        email: z.string().optional(),
        nickname: z.string().optional(),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      _meta: { "openai/profile": true },
    },
    async () => {
      try {
        const profile = await getProfile(auth);
        return {
          content: [{ type: "text", text: JSON.stringify(profile) }],
          structuredContent: profile,
        };
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.registerTool(
    "list_accounts",
    {
      title: "List connected accounts",
      description:
        "List the social accounts connected to the current workspace. Use this before drafting so you use real account IDs.",
      inputSchema: {},
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async () => {
      try {
        return ok(await apiRequest(auth, "GET", "/v1/accounts"));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.registerTool(
    "list_destinations",
    {
      title: "List destinations",
      description:
        "List postable destinations (subreddits, Discord channels, pages, boards) for one connected account.",
      inputSchema: { accountId: z.string().uuid().describe("Connected account ID") },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async ({ accountId }) => {
      try {
        return ok(
          await apiRequest(
            auth,
            "GET",
            `/v1/accounts/${encodeURIComponent(accountId)}/destinations`,
          ),
        );
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.registerTool(
    "get_platform_capabilities",
    {
      title: "Get platform capabilities",
      description:
        "Return platform capabilities and limits (character counts, media support, required fields). Use this before drafting for an unfamiliar platform.",
      inputSchema: {
        platform: z.string().optional().describe("Optional platform ID to filter"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async ({ platform }) => {
      try {
        const response = await apiRequest<{
          payload: { platforms: Array<{ id: string }> };
        }>(auth, "GET", "/v1/platforms");
        const platforms = platform
          ? response.payload.platforms.filter((item) => item.id === platform)
          : response.payload.platforms;
        return ok({ platforms });
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.registerTool(
    "list_posts",
    {
      title: "List posts",
      description:
        "List posts in the current workspace, optionally filtered by status. Includes per-destination dispatch status.",
      inputSchema: {
        status: z
          .string()
          .optional()
          .describe("draft, scheduled, dispatching, published, failed, cancelled"),
        limit: z.number().int().min(1).max(50).optional(),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async ({ status, limit }) => {
      try {
        const params = new URLSearchParams({ page: "1", limit: String(limit ?? 20) });
        if (status) params.set("status", status);
        return ok(await apiRequest(auth, "GET", `/v1/posts?${params.toString()}`));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.registerTool(
    "get_post",
    {
      title: "Get post",
      description:
        "Get one post with per-destination status, errors, and permalinks. Use this to poll after confirming a publish intent.",
      inputSchema: { postId: z.string().uuid() },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async ({ postId }) => {
      try {
        return ok(await apiRequest(auth, "GET", `/v1/posts/${encodeURIComponent(postId)}`));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.registerTool(
    "get_usage",
    {
      title: "Get usage",
      description:
        "Return current plan usage: connected channels, monthly publish drops, AI credits, storage, and reset date.",
      inputSchema: {},
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async () => {
      try {
        return ok(await apiRequest(auth, "GET", "/v1/quotas/summary"));
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.registerTool(
    "create_draft",
    {
      title: "Create draft",
      description:
        "Create a draft post for one or more accounts. This never publishes. After creating a draft, call create_publish_intent to preview and confirm it.",
      inputSchema: {
        content: z.string().min(1).describe("Master post content"),
        title: z.string().optional(),
        linkUrl: z.string().url().optional(),
        tags: z.array(z.string()).optional(),
        targets: z
          .array(
            z.object({
              accountId: z.string().uuid(),
              platform: z.string().describe("Platform ID, e.g. x, linkedin, reddit"),
              destinationId: z.string().uuid().optional(),
              customContent: z.string().optional(),
              customTitle: z.string().optional(),
            }),
          )
          .min(1),
        idempotencyKey: z.string().optional(),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    },
    async (input) => {
      try {
        return ok(
          await apiRequest(auth, "POST", "/v1/posts", {
            body: {
              content: input.content,
              title: input.title,
              linkUrl: input.linkUrl,
              tags: input.tags,
              targets: input.targets,
            },
            idempotencyKey: input.idempotencyKey ?? `mcp-draft-${randomUUID()}`,
          }),
        );
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.registerTool(
    "update_draft",
    {
      title: "Update draft",
      description:
        "Edit a draft's content or replace its destination targets. Published and dispatching posts cannot be edited. Any pending publish intent becomes invalid when the draft changes.",
      inputSchema: {
        postId: z.string().uuid(),
        content: z.string().min(1).optional(),
        title: z.string().nullable().optional(),
        linkUrl: z.string().url().nullable().optional(),
        tags: z.array(z.string()).optional(),
        targets: z
          .array(
            z.object({
              accountId: z.string().uuid(),
              platform: z.string(),
              destinationId: z.string().uuid().optional(),
              customContent: z.string().optional(),
              customTitle: z.string().optional(),
            }),
          )
          .optional(),
        idempotencyKey: z.string().optional(),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    },
    async (input) => {
      try {
        const { postId, idempotencyKey, ...body } = input;
        return ok(
          await apiRequest(auth, "PATCH", `/v1/posts/${encodeURIComponent(postId)}`, {
            body,
            idempotencyKey: idempotencyKey ?? `mcp-update-${randomUUID()}`,
          }),
        );
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.registerTool(
    "cancel_scheduled_post",
    {
      title: "Cancel scheduled post",
      description:
        "Cancel a draft or scheduled post and all of its future dispatches. Use this only after the user asks to cancel.",
      inputSchema: {
        postId: z.string().uuid(),
        idempotencyKey: z.string().optional(),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
    },
    async (input) => {
      try {
        return ok(
          await apiRequest(auth, "POST", `/v1/posts/${encodeURIComponent(input.postId)}/cancel`, {
            idempotencyKey: input.idempotencyKey ?? `mcp-cancel-${input.postId}`,
          }),
        );
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.registerTool(
    "create_publish_intent",
    {
      title: "Create publish intent",
      description:
        "Validate a draft and return a short-lived preview intent. This does not publish. Show the preview to the user, then call confirm_publish_intent only after approval.",
      inputSchema: {
        postId: z.string().uuid(),
        mode: z.enum(["publish", "schedule"]),
        scheduledAt: z.string().datetime().optional(),
        expiresInSeconds: z.number().int().min(60).max(900).optional(),
        idempotencyKey: z.string().optional(),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    },
    async (input) => {
      try {
        return ok(
          await apiRequest(auth, "POST", "/v1/publish-intents", {
            body: {
              postId: input.postId,
              mode: input.mode,
              scheduledAt: input.scheduledAt,
              expiresInSeconds: input.expiresInSeconds,
            },
            idempotencyKey: input.idempotencyKey ?? `mcp-intent-${randomUUID()}`,
          }),
        );
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.registerTool(
    "render_publish_preview",
    {
      title: "Render publish preview",
      description:
        "Show the interactive review card for a pending publish intent. Call this after create_publish_intent and before confirm_publish_intent when the host supports MCP Apps UI. The card contains a confirmation button.",
      inputSchema: {
        intentId: z.string().uuid(),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      _meta: {
        ui: { resourceUri: PUBLISH_PREVIEW_URI },
      },
    },
    async ({ intentId }) => {
      try {
        const response = await apiRequest<{
          payload: { intent?: unknown; preview?: unknown };
        }>(auth, "GET", `/v1/publish-intents/${encodeURIComponent(intentId)}`);

        return ok({
          intent: response.payload.intent,
          preview: response.payload.preview,
        });
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.registerTool(
    "confirm_publish_intent",
    {
      title: "Confirm publish intent",
      description:
        "Publish or schedule the post after the user has approved the preview. This is irreversible for publish mode. Only call after explicit user confirmation.",
      inputSchema: {
        intentId: z.string().uuid(),
        idempotencyKey: z.string().optional(),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
    },
    async (input) => {
      try {
        return ok(
          await apiRequest(
            auth,
            "POST",
            `/v1/publish-intents/${encodeURIComponent(input.intentId)}/confirm`,
            {
              idempotencyKey: input.idempotencyKey ?? `mcp-confirm-${input.intentId}`,
            },
          ),
        );
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.registerTool(
    "retry_failed_dispatch",
    {
      title: "Retry failed dispatch",
      description:
        "Retry publishing one failed destination. This sends content to a public platform again, so ask the user before retrying.",
      inputSchema: {
        dispatchId: z.string().uuid(),
        idempotencyKey: z.string().optional(),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
    },
    async (input) => {
      try {
        return ok(
          await apiRequest(
            auth,
            "POST",
            `/v1/dispatches/${encodeURIComponent(input.dispatchId)}/retry`,
            {
              idempotencyKey: input.idempotencyKey ?? `mcp-retry-${randomUUID()}`,
            },
          ),
        );
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.registerTool(
    "get_connect_link",
    {
      title: "Get account connect link",
      description:
        "Return a browser link where the user can connect or reconnect a social account. Agents cannot connect accounts themselves.",
      inputSchema: {},
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async () => ok({ url: `${env.APP_BASE_URL}/app/accounts` }),
  );

  server.registerPrompt(
    "weekly_content_plan",
    {
      title: "Weekly content plan",
      description:
        "Plan a week of posts across the connected accounts, then draft and preview them.",
      argsSchema: {
        focus: z.string().optional().describe("Topic or campaign focus"),
      },
    },
    ({ focus }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Plan next week's content${focus ? ` about ${focus}` : ""}. First list the connected accounts, then propose a small set of posts with per-platform variants. Create drafts, create a publish intent for each, show the previews, and wait for my approval before confirming.`,
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "launch_announcement",
    {
      title: "Launch announcement",
      description:
        "Draft a product launch announcement for multiple platforms with staggered scheduling.",
      argsSchema: {
        product: z.string().describe("Product or feature being launched"),
        url: z.string().url().optional(),
      },
    },
    ({ product, url }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Create a launch announcement for ${product}${url ? ` (${url})` : ""}. Use the connected accounts, adapt the copy per platform, create drafts, and preview a staggered schedule. Do not publish until I approve the previews.`,
          },
        },
      ],
    }),
  );

  server.registerResource(
    "workspace-profile",
    "socioconnect://workspace/profile",
    {
      title: "Workspace profile",
      description: "Authenticated SocioConnect user and workspace",
      mimeType: "application/json",
    },
    async (uri) => {
      const profile = await getProfile(auth);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(profile),
          },
        ],
      };
    },
  );

  server.registerResource(
    "accounts",
    "socioconnect://accounts",
    {
      title: "Connected accounts",
      description: "Social accounts connected to this workspace",
      mimeType: "application/json",
    },
    async (uri) => {
      const accounts = await apiRequest(auth, "GET", "/v1/accounts");
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(accounts),
          },
        ],
      };
    },
  );

  server.registerResource(
    "publish-preview",
    PUBLISH_PREVIEW_URI,
    {
      title: "Publish preview",
      description: "Interactive preview and confirmation card for publish intents",
      mimeType: "text/html;profile=mcp-app",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html;profile=mcp-app",
          text: publishPreviewHtml,
          _meta: { ui: { prefersBorder: true } },
        },
      ],
    }),
  );

  return server;
}
