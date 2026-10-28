# MCP Server and OAuth

`apps/mcp` is the public Model Context Protocol server. It exposes the
agent-safe SocioConnect workflow to ChatGPT, Claude, Codex, Cursor, Claude Code,
and any MCP-compatible client.

It is a thin adapter: tools call the existing `/v1` API. The MCP process does not
own business logic and does not connect to PostgreSQL.

## What is implemented

- Streamable HTTP MCP endpoint at `/mcp`
- OAuth 2.1 authorization server (DCR, authorization code + PKCE S256, refresh rotation)
- Protected resource metadata and `WWW-Authenticate` challenges
- OAuth audience validation
- Internal service-token exchange (the user's OAuth token is never forwarded to the API)
- API-key bearer compatibility for private clients
- Read, draft, intent, confirm, retry, and connection-link tools
- MCP prompts and resources

## Architecture

```text
ChatGPT / Claude / Cursor
        |
        |  OAuth access token (aud = MCP resource)
        v
   apps/mcp  --- verifies token, then mints short-lived service token
        |
        |  Authorization: Bearer <service token> (aud = API)
        v
   apps/api  --- normal scopes, workspace, idempotency, audit, usage
```

This avoids MCP token passthrough. The original OAuth token is only valid for the
MCP resource; the API accepts only service tokens or API keys addressed to it.

## Environment

The MCP app loads the root `.env` and `apps/mcp/.env` if present.

```bash
# API
OAUTH_ISSUER=http://localhost:8000
MCP_RESOURCE_URL=http://localhost:8010/mcp
API_RESOURCE_URL=http://localhost:8000
SERVICE_TOKEN_SECRET=            # defaults to JWT_SECRET
OAUTH_ACCESS_TOKEN_TTL_SECONDS=900
OAUTH_REFRESH_TOKEN_TTL_DAYS=30

# MCP
MCP_PORT=8010
API_BASE_URL=http://localhost:8000
APP_BASE_URL=http://localhost:3000
```

`JWT_SECRET` must match between the API and MCP app.

## Run locally

```bash
bun run dev:api
bun run dev:mcp
```

Endpoints:

| Service                     | URL                                                            |
| --------------------------- | -------------------------------------------------------------- |
| MCP                         | `http://localhost:8010/mcp`                                    |
| MCP health                  | `http://localhost:8010/health`                                 |
| Protected resource metadata | `http://localhost:8010/.well-known/oauth-protected-resource`   |
| OAuth AS metadata           | `http://localhost:8000/.well-known/oauth-authorization-server` |
| OAuth authorize             | `http://localhost:8000/oauth/authorize`                        |
| OAuth token                 | `http://localhost:8000/oauth/token`                            |
| Dynamic registration        | `http://localhost:8000/oauth/register`                         |

## OAuth flow

1. Client discovers `/.well-known/oauth-protected-resource` on the MCP host.
2. Metadata points to the API authorization server.
3. Client registers via DCR (`POST /oauth/register`) or uses a pre-registered client.
4. Client sends the browser to `/oauth/authorize` with:
   - `response_type=code`
   - `client_id`
   - `redirect_uri`
   - `code_challenge` + `code_challenge_method=S256`
   - `scope`
   - `resource` (must equal `MCP_RESOURCE_URL`)
   - optional `state`
5. A signed-in user sees a consent page and authorizes.
6. The API redirects back with `code` and `iss`.
7. Client exchanges the code at `/oauth/token` with `code_verifier`.
8. Access token is a 15-minute JWT with `aud` = MCP resource, `scope`, `workspace_id`.
9. Refresh tokens rotate on every use.

Scopes are the same as API keys: `profile:read`, `accounts:read`,
`destinations:read`, `posts:read`, `posts:write`, `posts:publish`, `media:write`,
`analytics:read`, `usage:read`, `notifications:read`, `webhooks:manage`.

## MCP tools

### Read

- `get_profile` — profile + workspace; marked as the OpenAI profile tool
- `list_accounts`
- `list_destinations`
- `get_platform_capabilities`
- `list_posts`
- `get_post`
- `get_usage`
- `get_connect_link`

### Write

- `create_draft` — creates a draft only
- `update_draft` — edits content or replaces targets while still a draft
- `reschedule_post` — move a scheduled post to a new time
- `create_publish_intent` — preview + short-lived approval intent
- `render_publish_preview` — interactive MCP Apps review card when supported
- `confirm_publish_intent` — publish or schedule after approval
- `cancel_scheduled_post` — cancel a draft or scheduled post
- `retry_failed_dispatch` — retry one failed destination
- `create_media_upload_url` — allocate a presigned media upload
- `confirm_media_upload` — register an uploaded media asset

Publishing and retrying are annotated `destructiveHint: true` and
`openWorldHint: true`.

## Tool security schemes

Every tool descriptor advertises the credential and scope it expects:

```json
{
  "name": "confirm_publish_intent",
  "securitySchemes": [
    { "type": "oauth2", "name": "socioconnect_oauth", "scopes": ["posts:publish"] },
    {
      "type": "apiKey",
      "name": "socioconnect_api_key",
      "in": "header",
      "parameterName": "Authorization",
      "scheme": "bearer"
    }
  ],
  "_meta": {
    "securitySchemes": ["...same entries..."]
  }
}
```

The metadata is published at both the top level and in `_meta` because MCP core
does not yet standardize a per-tool security field. Clients that strip unknown
top-level properties still receive the data through `_meta`.

Tool scopes:

| Tools                                                                                                | Scopes              |
| ---------------------------------------------------------------------------------------------------- | ------------------- |
| `get_profile`                                                                                        | `profile:read`      |
| `list_accounts`, `get_connect_link`                                                                  | `accounts:read`     |
| `list_destinations`                                                                                  | `destinations:read` |
| `list_posts`, `get_post`                                                                             | `posts:read`        |
| `create_draft`, `update_draft`, `reschedule_post`, `cancel_scheduled_post`                           | `posts:write`       |
| `create_publish_intent`, `render_publish_preview`, `confirm_publish_intent`, `retry_failed_dispatch` | `posts:publish`     |
| `get_usage`                                                                                          | `usage:read`        |
| `create_media_upload_url`, `confirm_media_upload`                                                    | `media:write`       |
| `get_platform_capabilities`                                                                          | none                |

## Prompts

- `weekly_content_plan`
- `launch_announcement`

## Resources

- `socioconnect://workspace/profile`
- `socioconnect://accounts`
- `ui://socioconnect/publish-preview/v1.html` — MCP Apps confirmation card

## Preview UI

`render_publish_preview` returns the intent and preview and is linked to the
MCP Apps resource via `_meta.ui.resourceUri`. The card shows the post, each
destination, character counts, warnings, and a single confirmation button.
Text-only clients continue to use the preview returned by
`create_publish_intent`.

The card calls `confirm_publish_intent` with a deterministic idempotency key.

## Idempotency

Every MCP write goes through the API's idempotency layer. The MCP tools accept an
optional `idempotencyKey`; otherwise they generate one or derive it from the
intent ID. Repeating a tool call with the same key returns the original result.

## Testing

```bash
# 1. Create an API key through the API (session JWT required)
# 2. Call the MCP endpoint with the key
curl http://localhost:8010/mcp \
  -H "Authorization: Bearer sck_test_..." \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

Use the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector
```

Transport: `Streamable HTTP`
URL: `http://localhost:8010/mcp`
Auth: API key or OAuth flow.

## Marketplace status

The server works with MCP clients today. The plugin package lives at
`plugins/socioconnect` and includes the OpenAI manifest, Claude plugin bundle,
skills, MCP config, local marketplace entry, and a preview widget.

Still required before public directory submission:

- deploy the production domains and complete OpenAI domain verification
- run the review script in ChatGPT, Claude, Codex, and Cursor
- submit the Claude connector and plugin bundle
- keep the review demo account password rotated after each review

## Limitations

- Stateless transport; no resumable SSE event store.
- Media storage uses Cloudflare R2 when configured; development falls back to a mock presigned URL.
- The consent page is server-rendered and minimal.
- Tool security metadata is emitted at the top level and in `_meta`; some clients only read `_meta`.
- Access tokens are short-lived JWTs; refresh tokens are revocable, access tokens are not denylisted.
