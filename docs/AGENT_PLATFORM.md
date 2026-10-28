# Agent Platform Plan: API Keys, MCP, ChatGPT & Claude

Status: **Phase 0 in progress**
Branch: `feat/app-refresh`
Scope: public API, API keys, remote MCP server, ChatGPT/Claude distribution, agent-safe publishing

### Implementation status (2026-10-28)

- [x] `workspaces` + `workspace_members` schema
- [x] personal workspace backfill and lazy provisioning
- [x] `workspace_id` on accounts, posts, media, subscriptions, quotas
- [x] scoped API keys (hashed, prefix lookup, expiry, revoke, rotate)
- [x] API-key auth middleware + deny-by-default scope map
- [x] account-allowlist enforcement on accounts, destinations, posts, retries
- [x] `GET/POST /v1/api-keys`, `DELETE /v1/api-keys/{id}`, `POST /v1/api-keys/{id}/rotate`
- [x] `GET /v1/workspaces`, `GET /v1/workspaces/current`
- [x] `Idempotency-Key` middleware and storage (required for API-key writes)
- [x] publish intents with draft revision hash, preview, and explicit confirmation
- [x] API-key `POST /v1/posts` creates drafts only; publishing requires an intent
- [x] `audit_events` and `usage_events` ledgers with request metadata
- [x] workspace-scoped reads for accounts, posts, destinations, and media
- [x] OAuth 2.1 AS (DCR, PKCE, refresh rotation, protected resource metadata)
- [x] `apps/mcp` with read/draft/intent/confirm tools, prompts, and resources
- [x] service-token exchange so OAuth tokens are never passed through to the API
- [x] plugin package with OpenAI + Claude manifests, six skills, local marketplace, and preview widget
- [x] dashboard API & Agent Access screen with key creation, rotation, revocation, connect instructions, and activity
- [x] subscription status gating and monthly publish/AI quota enforcement
- [x] AI credit usage events and per-key rate limits
- [x] unit tests for API-key crypto, OAuth PKCE, service tokens, scopes, entitlements, and revision hashes
- [x] outbound webhooks with signed deliveries and delivery log
- [x] TypeScript SDK and `socioconnect` CLI
- [x] demo login, seeded review workspace, legal/support pages, OpenAI challenge endpoint
- [x] team workspaces, invites, member roles, workspace switching, and Team UI
- [x] reschedule and media upload tools, SDK/CLI coverage
- [x] webhook retry worker and SSRF validation
- [ ] public submission: deploy domains, replace assets, run review, submit listings
- [ ] workspace-scoped billing/quota/notification/community reads (still user-scoped)
- [ ] workspace-scoped reads for billing, quotas, notifications, and communities
- [ ] media upload tool and per-tool `securitySchemes` metadata

---

## 1. Executive summary

Build **one remote MCP server** as the primary agent surface, backed by a **public
REST API** that is also usable with **API keys**.

ChatGPT, Claude, Codex, Cursor, Claude Code, and custom agents should all hit the
same product capabilities. They are distribution channels, not separate
integrations.

The core sequence for any agent is:

```text
discover accounts -> compose -> validate -> preview -> explicit approval -> publish/schedule -> report status
```

Nothing publishes as a side effect of a chat message. Every public post requires a
short-lived, content-bound publish intent that a human or an explicit agent step
confirms.

Three foundations are missing from the repo today and must be built before the
agent surface:

1. **Workspaces** (currently everything is user-scoped)
2. **API keys + scopes** (currently only cookie/JWT sessions)
3. **A shared domain layer** (API handlers contain business logic that MCP/CLI
   cannot reuse safely)

---

## 2. Why agents are a real product surface here

SocioConnect is a content orchestration engine. That is unusually well suited to
agents because the work is already:

- multi-step (draft -> adapt -> validate -> schedule -> monitor)
- multi-destination (the expensive part is per-platform adaptation)
- stateful (schedules, retries, token expiry)
- recurring (weekly content cadence)
- measurable (published posts, failures, reach)

An agent is good at the middle of that workflow. It is bad at owning the
irreversible last step. The product should let agents do the thinking and make
the publish step explicit.

### Primary agent jobs

| Job               | Example request                                                        | Product value                   |
| ----------------- | ---------------------------------------------------------------------- | ------------------------------- |
| Weekly planning   | "Plan next week's content for my developer audience."                  | Drafts + schedule               |
| Repurposing       | "Turn this blog post into an X thread, LinkedIn post, and newsletter." | Per-platform variants           |
| Launch broadcast  | "Announce the release everywhere, staggered over 2 hours."             | Multi-destination orchestration |
| Schedule audit    | "What is going out this week? Find gaps and duplicates."               | Visibility                      |
| Failure triage    | "Three posts failed. What happened and retry the safe ones?"           | Reliability                     |
| Agency operations | "Draft this campaign for all five client workspaces."                  | Workspace scale                 |

### Not v1

- Replying to comments / social inbox
- Reading DMs
- Auto-follow / engagement automation
- Analytics-driven autonomous posting
- Agent-managed OAuth connections (a human must connect accounts)

Those are either not built or are high-risk. Keep the agent surface focused on
compose, validate, schedule, publish, and inspect.

---

## 3. Design principles

1. **Draft-first, publish-last.** Agents create drafts freely. Publishing requires
   an explicit confirmation.
2. **One MCP server, many clients.** ChatGPT, Claude, Codex, Cursor, Claude Code,
   and custom agents share the same tools and auth model.
3. **Curated tools, not API mirroring.** Expose ~15 tools that map to user goals.
   Do not expose every CRUD endpoint.
4. **REST is the substrate.** MCP, CLI, and SDK call the same domain services.
   MCP must not be a second implementation.
5. **Workspace-scoped everything.** Keys, OAuth grants, accounts, posts, usage,
   and billing belong to a workspace, not a user.
6. **Least privilege by default.** Scopes are explicit; publish is separate from
   draft; API keys can be restricted to specific accounts.
7. **Idempotent writes.** Agents retry. Duplicate posts are unacceptable.
8. **Auditable.** Every agent action has an actor, source, scope, and request ID.
9. **No prompt-injection expansion.** Tool inputs are data. Never let a tool fetch
   arbitrary URLs or interpret post content as instructions.
10. **Marketplace-safe commerce.** ChatGPT plugin policy forbids selling
    subscriptions inside the plugin. Gate features, explain limits, link to an
    informational page; never initiate checkout from the plugin.

---

## 4. Target architecture

```text
                       +-----------------------+
  ChatGPT / Codex ---> |  OpenAI plugin        |
                       |  MCP + skills + UI    |
                       +-----------+-----------+
                                   |
  Claude / Claude Code ----------->|  Remote MCP server
  Cursor / other MCP clients ------>|  apps/mcp
                                   |  Streamable HTTP
                                   |  OAuth 2.1 resource server
                                   +-----------+-----------+
                                               |
  CLI / SDK / custom agents ---------------->  |  Public REST API
  (API key bearer)                             |  apps/api /v1
                                               |
                                   +-----------v-----------+
                                   |  packages/core        |
                                   |  use cases + policies  |
                                   +-----------+-----------+
                                               |
                          +--------------------+--------------------+
                          |                    |                    |
                     PostgreSQL            Redis/BullMQ        Platform adapters
                  workspaces, keys,      rate limits,        (existing providers)
                  posts, usage, audit    idempotency,
                                         token buckets
```

### New/changed deployables

| Deployable                     | Purpose                                                                       |
| ------------------------------ | ----------------------------------------------------------------------------- |
| `apps/api`                     | Existing REST API. Add API-key auth, scopes, idempotency, OAuth AS endpoints. |
| `apps/mcp`                     | New public MCP server. Streamable HTTP, OAuth resource server, stateless.     |
| `packages/core`                | New domain/use-case package. Shared by API, MCP, CLI, SDK.                    |
| `packages/contracts`           | Existing Zod contracts. Extend for agent tools and public API.                |
| `packages/sdk`                 | New TypeScript SDK generated from OpenAPI plus handwritten helpers.           |
| `apps/cli` (or `packages/cli`) | `socioconnect` command for agents, scripts, CI.                               |

`apps/mcp` should be stateless and horizontally scalable. Do not put long-running
publish work in the MCP process; it calls core use cases that enqueue BullMQ jobs.

---

## 5. Identity and access

### 5.1 Workspaces first

Agents make the missing tenant model obvious:

- ChatGPT multi-account connections
- agency client separation
- API keys scoped to a subset of accounts
- per-workspace usage and billing
- audit trails that survive a user leaving

Add:

```text
workspaces
  id, name, slug, owner_user_id, created_at, updated_at, deleted_at

workspace_members
  workspace_id, user_id, role (owner|admin|member), created_at
```

Migration sequence:

1. Create tables.
2. Create one personal workspace per existing user.
3. Add nullable `workspace_id` to `accounts`, `posts`, `media_assets`,
   `subscriptions`, `user_quotas`, `community_groups`.
4. Backfill from `user_id`.
5. Make `workspace_id` non-null.
6. Move the subscription and quota rows to the workspace.
7. Update repositories to require `workspace_id`.

Do this now. It is much cheaper before production than after.

### 5.2 Credential types

| Credential          | Used by                                      | Format                       | Storage               |
| ------------------- | -------------------------------------------- | ---------------------------- | --------------------- |
| Session JWT         | Web app                                      | existing                     | existing              |
| API key             | CLI, SDK, custom agents, private MCP clients | `sck_live_<prefix>_<secret>` | SHA-256 hash + prefix |
| OAuth access token  | ChatGPT, Claude, Codex, Cursor               | JWT, 15 min                  | not stored            |
| OAuth refresh token | Same                                         | opaque, 30 days              | hashed, rotated       |
| Device code         | CLI login                                    | short-lived                  | hashed                |

API key rules:

- Show the full key once. Store only a hash and a lookup prefix.
- Prefix format: `sck_{env}_{8-char-lookup}`.
- Constant-time comparison.
- Scopes, optional account allowlist, expiry, IP allowlist (optional), last used.
- Revoke immediately; rotate with a 24-hour overlap window.
- Per-key rate limits and monthly publish caps.

Suggested scopes:

```text
profile:read
accounts:read
destinations:read
posts:read
posts:write          # create/update/delete drafts
posts:publish        # create publish intents and confirm them
media:write
analytics:read
usage:read
webhooks:manage
```

`posts:publish` is deliberately separate from `posts:write`. A content-generation
agent may get `posts:write` without the ability to publish.

### 5.3 OAuth 2.1 for MCP

Marketplace connectors require OAuth. Do not use API keys as the primary auth
for ChatGPT/Claude.

Implement a small OAuth 2.1 authorization server in `apps/api`:

| Endpoint                                                  | Purpose                                |
| --------------------------------------------------------- | -------------------------------------- |
| `GET /.well-known/oauth-authorization-server`             | AS metadata                            |
| `GET /.well-known/oauth-protected-resource` (on MCP host) | Resource metadata                      |
| `GET /oauth/authorize`                                    | Consent screen (web app)               |
| `POST /oauth/token`                                       | Code + PKCE exchange, refresh rotation |
| `POST /oauth/register`                                    | Dynamic client registration            |
| `POST /oauth/revoke`                                      | Revocation                             |

Requirements:

- Authorization code + PKCE (`S256` only).
- Exact redirect URI matching.
- `resource` parameter echoed into the token audience.
- Short-lived JWT access tokens with `iss`, `aud`, `sub`, `workspace_id`, `scope`.
- Rotating refresh tokens.
- DCR for ChatGPT/Claude. Add CIMD later if a client requires it.
- Consent UI must clearly show scopes and the workspace.
- Pre-register first-party clients (web, CLI) separately.

Recommended build order:

1. Own minimal OAuth AS (fastest, no vendor lock-in).
2. Move to a managed IdP (WorkOS/Auth0/Stytch) only when enterprise SSO,
   SCIM, or compliance demands it.

Do not accept API keys on the public marketplace MCP endpoint as the normal path.
Optionally allow `Authorization: Bearer sck_...` for private/self-hosted MCP
clients, documented as a compatibility mode.

---

## 6. Public API contract

The existing `/v1` API is a good base. Add:

### 6.1 API key management

```text
GET    /v1/api-keys
POST   /v1/api-keys
DELETE /v1/api-keys/{id}
POST   /v1/api-keys/{id}/rotate
```

Create body:

```json
{
  "name": "Claude Code on laptop",
  "scopes": ["profile:read", "accounts:read", "posts:read", "posts:write"],
  "accountIds": [],
  "expiresAt": "2027-01-01T00:00:00Z"
}
```

Response includes the plaintext key **once** and a `lastUsedAt` field thereafter.

### 6.2 Agent-oriented endpoints

Existing endpoints stay, but add the missing safe-publish flow:

| Method  | Path                               | Notes                                |
| ------- | ---------------------------------- | ------------------------------------ |
| `GET`   | `/v1/me`                           | Profile + workspace + scopes         |
| `GET`   | `/v1/accounts`                     | Connected accounts                   |
| `GET`   | `/v1/accounts/{id}/destinations`   | Subreddits, channels, pages          |
| `GET`   | `/v1/platforms`                    | Capabilities, limits, media rules    |
| `POST`  | `/v1/posts`                        | Create draft (no publish)            |
| `PATCH` | `/v1/posts/{id}`                   | Update draft                         |
| `POST`  | `/v1/posts/{id}/validate`          | Dry-run compatibility matrix         |
| `POST`  | `/v1/publish-intents`              | Create intent from a validated draft |
| `POST`  | `/v1/publish-intents/{id}/confirm` | Publish or schedule                  |
| `POST`  | `/v1/posts/{id}/cancel`            | Cancel future dispatches             |
| `POST`  | `/v1/dispatches/{id}/retry`        | Retry one destination                |
| `GET`   | `/v1/posts`                        | Cursor pagination, filters           |
| `GET`   | `/v1/posts/{id}`                   | Per-destination status               |
| `GET`   | `/v1/usage`                        | Drops, AI credits, storage           |
| `POST`  | `/v1/media/upload-url`             | Presigned upload                     |

### 6.3 API hygiene

- `Idempotency-Key` required on all write endpoints. Store request hash and
  response for 24 hours.
- Cursor pagination (`cursor`, `limit`), never offset.
- Standard error envelope with stable `code` values.
- Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`,
  `X-RateLimit-Reset`.
- Request IDs on every response.
- OpenAPI 3.1, not 3.0.0.
- Webhooks for async outcomes:
  - `post.published`
  - `post.failed`
  - `dispatch.needs_reconnect`
  - `usage.threshold`
  - HMAC-signed, retried, replayable.

### 6.4 Publish intents (critical)

Do not let `POST /v1/posts` publish. Separate intent from execution:

```json
POST /v1/publish-intents
{
  "postId": "uuid",
  "mode": "schedule",
  "scheduledAt": "2026-11-02T14:00:00Z",
  "timezone": "Asia/Kolkata"
}
```

Response:

```json
{
  "id": "pi_...",
  "state": "pending_confirmation",
  "preview": {
    "destinations": [{ "platform": "x", "text": "...", "warnings": [] }],
    "estimatedDrops": 6
  },
  "expiresAt": "2026-10-28T12:15:00Z"
}
```

`POST /v1/publish-intents/{id}/confirm` executes it. Rules:

- Intent is bound to a draft revision hash and destination set.
- Any draft change invalidates the intent.
- Intent expires in 10 minutes.
- Confirm is idempotent.
- Web UI and MCP widget both use the same endpoint.
- Text-only agents can create an intent, show the preview, ask the user, then
  confirm. The intent ID is the approval token.

This single abstraction solves agent confirmation, duplicate prevention, and
marketplace review requirements.

---

## 7. Remote MCP server

### 7.1 Transport and endpoint

- Streamable HTTP at `https://mcp.socioconnect.app/mcp`.
- Stateless request handling.
- OAuth 2.1 resource server with `/.well-known/oauth-protected-resource`.
- `401` with `WWW-Authenticate: Bearer resource_metadata=...`.
- Per-tool `securitySchemes` in metadata.
- Return `_meta["mcp/www_authenticate"]` when a token is missing or under-scoped.
- `get_profile` tool marked with `_meta["openai/profile"]: true` for ChatGPT
  multi-account support, returning a stable opaque profile ID.
- Accurate annotations on every tool: `readOnlyHint`, `destructiveHint`,
  `openWorldHint`.

### 7.2 Tool surface (v1)

Keep it small. Each tool maps to a user goal, not an internal endpoint.

#### Read tools

| Tool                        | Purpose                                    | readOnly | destructive | openWorld |
| --------------------------- | ------------------------------------------ | -------- | ----------- | --------- |
| `get_profile`               | Stable profile/workspace identity          | true     | false       | false     |
| `list_accounts`             | Connected accounts                         | true     | false       | false     |
| `list_destinations`         | Subreddits/channels/pages for an account   | true     | false       | false     |
| `get_platform_capabilities` | Limits, media rules, required fields       | true     | false       | false     |
| `list_posts`                | Scheduled/published/failed posts           | true     | false       | false     |
| `get_post`                  | Per-destination status, errors, permalinks | true     | false       | false     |
| `get_usage`                 | Drops, AI credits, storage, reset date     | true     | false       | false     |

#### Write tools

| Tool                     | Purpose                              | readOnly | destructive | openWorld |
| ------------------------ | ------------------------------------ | -------- | ----------- | --------- |
| `create_draft`           | Master draft + target accounts       | false    | false       | false     |
| `update_draft`           | Edit a draft or per-platform variant | false    | false       | false     |
| `validate_draft`         | Return compatibility matrix          | true     | false       | false     |
| `create_publish_intent`  | Preview + approval intent            | false    | false       | false     |
| `confirm_publish_intent` | Publish or schedule                  | false    | **true**    | **true**  |
| `cancel_scheduled_post`  | Cancel future dispatches             | false    | **true**    | false     |
| `retry_failed_dispatch`  | Retry one destination                | false    | **true**    | **true**  |
| `get_connect_link`       | Return web URL to connect an account | true     | false       | false     |

Optional later: `delete_draft`, `create_upload_url`, `get_analytics`,
`list_media`, `update_schedule`.

### 7.3 Resources

Use resources for context, tools for fresh actions:

```text
socioconnect://workspace/profile
socioconnect://accounts
socioconnect://platforms/{platform}/capabilities
socioconnect://posts/{id}
socioconnect://usage/current
```

Keep resource payloads compact. Do not dump full post history into context.

### 7.4 Prompts

Prompts teach the client the product workflow:

- `weekly_content_plan`
- `repurpose_long_form`
- `launch_announcement`
- `audit_schedule`
- `triage_failed_posts`

Prompts are not a substitute for tool descriptions. Keep both.

### 7.5 Tool response contract

Every write tool returns:

```json
{
  "ok": true,
  "id": "...",
  "state": "...",
  "summary": "Short human-readable result",
  "nextActions": ["..."],
  "previewUrl": "https://app.socioconnect.app/...",
  "approval": {
    "intentId": "...",
    "expiresAt": "..."
  }
}
```

Never return tokens, internal traces, raw platform errors, or unnecessary PII.

### 7.6 MCP testing

- MCP Inspector for auth and tool discovery.
- SDK client contract tests for every tool.
- OAuth conformance tests: PKCE, resource parameter, audience, refresh rotation.
- Negative tests: wrong audience, missing scope, expired token, replayed code.
- Publish-intent tests: draft changed after intent, expired intent, double confirm.
- Multi-account tests: two profiles, correct account selection.

---

## 8. Distribution

### 8.1 ChatGPT / Codex plugin

One OpenAI plugin package containing:

- remote MCP server
- skills
- optional UI (phase 4)

Requirements to plan for:

- Organization identity verification.
- Domain verification via
  `/.well-known/openai-apps-challenge`.
- OAuth 2.1 with PKCE and resource indicators.
- DCR or CIMD.
- Public HTTPS Streamable HTTP endpoint.
- Demo account for review with sample data, no MFA.
- Privacy policy and support contact.
- Accurate tool annotations.
- No subscription checkout or upgrade flow inside the plugin. Explain plan
  limits and link to an informational page only.
- Server must work on desktop and mobile.

Suggested skills:

- `launch-campaign`
- `repurpose-content`
- `weekly-scheduler`
- `schedule-audit`
- `failure-triage`

Optional UI (phase 4): a composer preview card with account picker, per-platform
tabs, schedule picker, and a single Confirm action. Use the MCP UI resource and
CSP allowlist. Keep a text fallback for clients without UI.

### 8.2 Claude

- Submit the MCP server as a **connector** (remote HTTPS, Streamable HTTP).
- Submit a **plugin bundle** with skills that reference the same connector.
- Both listings from the same organization can be paired.
- Claude Code plugin:
  - `.claude-plugin/plugin.json`
  - `skills/` for campaign and repurposing workflows
  - `.mcp.json` pointing at `https://mcp.socioconnect.app/mcp`
  - optional slash commands such as `/socioconnect:schedule`
- Claude API users can pass an OAuth access token via `authorization_token`.

### 8.3 CLI and SDK

The CLI is how non-MCP agents and developers use the product:

```bash
socioconnect auth login
socioconnect accounts list
socioconnect draft create --content "..." --accounts acc_1,acc_2
socioconnect draft validate <id>
socioconnect publish intent <id> --at "2026-11-02T14:00:00Z"
socioconnect publish confirm <intent_id>
socioconnect posts status <id> --watch
```

- API key from `SOCIOCONNECT_API_KEY`.
- JSON output by default for agents.
- Exit codes and stable error codes.
- `--dry-run` on all writes.
- SDK: `@socioconnect/sdk`, generated from OpenAPI plus handwritten
  `createPublishIntent` and `confirmPublishIntent` helpers.

---

## 9. Data model additions

```text
workspaces
workspace_members

api_keys
  id, workspace_id, created_by_user_id, name, prefix, key_hash,
  scopes[], account_ids[], environment, expires_at, last_used_at,
  revoked_at, created_at

oauth_clients
  id, client_id, client_name, redirect_uris[], grant_types[],
  token_endpoint_auth_method, client_uri, logo_uri, is_dcr, created_at

oauth_authorization_codes
  id, code_hash, client_id, user_id, workspace_id, redirect_uri,
  scopes[], code_challenge, code_challenge_method, resource,
  expires_at, consumed_at

oauth_refresh_tokens
  id, token_hash, client_id, user_id, workspace_id, scopes[],
  resource, expires_at, revoked_at, rotated_from, last_used_at

publish_intents
  id, workspace_id, post_id, created_by_type, created_by_id,
  state (pending_confirmation|confirmed|expired|canceled),
  draft_revision_hash, destination_ids[], mode, scheduled_at,
  expires_at, confirmed_at, created_at

idempotency_keys
  key, workspace_id, endpoint, request_hash,
  response_status, response_body, expires_at

usage_events
  id, workspace_id, api_key_id, oauth_client_id, source
  (web|api|mcp|cli|plugin), operation, quantity, post_id, created_at

audit_events
  id, workspace_id, actor_type (user|api_key|oauth_client|system),
  actor_id, action, resource_type, resource_id, metadata,
  ip, user_agent, request_id, created_at

webhook_endpoints
webhook_deliveries
```

Add `created_via` and `created_by_key_id` / `created_by_oauth_client_id` to
`posts` so agent-created content is attributable.

---

## 10. Billing and metering

- API/MCP access is included in paid plans, not sold separately at launch.
- The existing metered unit remains **one attempted destination publish**
  ("drop"), with retries not double-charged.
- Add a `source` dimension to usage events: web, API, MCP, CLI, plugin.
- Per-key monthly caps and per-key rate limits.
- Suggested launch limits:

| Plan        | API keys | Requests/min | Publish drops | Webhooks |
| ----------- | -------- | ------------ | ------------- | -------- |
| Free        | 1        | 10           | 15/mo         | No       |
| Solo        | 2        | 30           | 75/mo         | No       |
| Creator Pro | 5        | 60           | 300/mo        | Yes      |
| Studio      | 20       | 180          | 1,500/mo      | Yes      |
| Agency      | 100      | 600          | 10,000/mo     | Yes      |

- No checkout or upgrade flow inside ChatGPT/Claude. Explain the limit and link
  to the plans page.
- Future: an "Agent/API" add-on for high-volume automation, priced on publish
  operations and AI credits, not raw API calls.

---

## 11. Security and abuse

### Must-have

- Hash API keys and refresh tokens; encrypt provider tokens (already done).
- Scope checks on every tool/route, not just at auth time.
- Audience validation on OAuth tokens; no token passthrough.
- Exact redirect URI matching; PKCE S256 only.
- Idempotency on every write.
- Publish intent bound to draft revision.
- Per-key, per-workspace, per-IP, and per-destination rate limits.
- Audit every publish, cancel, retry, key creation, and OAuth grant.
- Content policy and spam controls for API-created posts.
- Kill switch per key/workspace.
- Never let agents connect accounts; return a web connect link.

### Prompt injection and untrusted content

- Treat post bodies, RSS items, and fetched content as data, never instructions.
- Do not expose arbitrary URL fetching to tools.
- Media uploads use presigned URLs, not server-side fetches.
- Tool descriptions are static and reviewed; no user content in metadata.
- Never return another workspace's data, even if an ID is guessed.

### Platform risk

- Automated posting may conflict with some platform terms. Maintain a
  per-platform automation policy and disclosure.
- Keep the existing per-provider rate limits and backoff.
- Never retry ambiguous non-idempotent publishes blindly.

---

## 12. Phased roadmap

Assumes 2 full-stack engineers. Dates are relative.

### Phase 0 — Foundations (2 weeks)

**Build**

- Workspaces + members + backfill migration.
- `workspace_id` on accounts, posts, media, subscriptions, quotas.
- `packages/core` extraction for draft, validate, schedule, publish, cancel,
  retry, list.
- `api_keys`, `idempotency_keys`, `audit_events`, `usage_events` tables.
- API-key auth middleware + scope enforcement.
- API key management endpoints and dashboard page.
- OpenAPI 3.1 cleanup and stable error codes.

**Exit criteria**

- Existing web flows still pass.
- A key with `posts:read` cannot create or publish.
- Duplicate `Idempotency-Key` returns the original response.

### Phase 1 — Public REST, CLI, SDK (2 weeks)

**Build**

- Publish intents + confirmation endpoint.
- Cursor pagination + rate limit headers.
- Webhooks for post outcomes.
- `socioconnect` CLI with login, draft, validate, publish, status.
- `@socioconnect/sdk`.
- Usage dashboard by source and key.

**Exit criteria**

- A script can draft, validate, schedule, and inspect a post end-to-end with an
  API key.
- Publishing without a confirmed intent is impossible.
- CLI works against test mode with no browser session.

### Phase 2 — MCP server (3 weeks)

**Build**

- `apps/mcp` with Streamable HTTP.
- OAuth 2.1 AS: metadata, authorize, token, DCR, revoke.
- Protected resource metadata + `WWW-Authenticate` challenges.
- Tool surface, resources, prompts, annotations.
- `get_profile` for ChatGPT multi-account.
- Per-tool scope enforcement.
- MCP Inspector + SDK contract tests.

**Exit criteria**

- Claude Desktop and Cursor connect via OAuth.
- ChatGPT developer mode connects via OAuth.
- A user can draft, validate, approve, and schedule from an MCP client.
- Wrong audience and insufficient scope fail correctly.

### Phase 3 — Marketplace distribution (2 weeks + review time)

**Build**

- OpenAI plugin package (MCP + skills).
- Claude connector submission + plugin bundle.
- Claude Code plugin with skills and `.mcp.json`.
- Domain verification, privacy policy, support page, demo account.
- Review test scripts and expected outputs.

**Exit criteria**

- Both submissions pass automated scans.
- Reviewer can connect a demo account without MFA.
- No plugin flow initiates checkout.

### Phase 4 — UI and scale (3 weeks)

**Build**

- ChatGPT/MCP Apps composer preview widget.
- Per-key analytics, audit log UI, usage alerts.
- Reconciliation job for missed webhooks.
- Optional managed IdP for enterprise SSO.
- Content policy / abuse review tooling.

**Exit criteria**

- Widget and text fallback both complete the publish flow.
- Support can trace any agent action to actor, key, intent, and request ID.

Total: roughly **9–12 weeks** of engineering plus marketplace review time.

---

## 13. Metrics

Track from day one:

- Keys created, active keys, keys used in last 7 days
- OAuth connections started / completed / failed
- Time to first successful draft
- Draft -> intent -> confirm conversion
- Publish success rate by platform
- Publish failures by error class
- Duplicate-prevention hits (idempotency)
- Tool call latency and error rate
- Agent-created posts by source and client
- Approval abandonment rate
- Abuse signals: rate-limit hits, repeated failed confirms, spam flags

---

## 14. Open decisions

| Decision                        | Recommendation                                                          |
| ------------------------------- | ----------------------------------------------------------------------- |
| Build OAuth AS vs managed IdP   | Build minimal OAuth AS now; revisit managed IdP for enterprise.         |
| Workspaces now vs later         | Now. Agents and agencies both require it.                               |
| API keys on public MCP endpoint | OAuth for marketplaces; API key compatibility for private clients only. |
| Media in agent v1               | Defer. Text + links first.                                              |
| Auto-publish                    | Never without explicit intent confirmation.                             |
| Analytics tools                 | Phase 4.                                                                |
| API access on Free tier         | Allow one key with low limits for activation.                           |
| Plugin checkout                 | Never. Marketplace policy forbids it.                                   |
| CIMD vs DCR                     | DCR first; add CIMD when required.                                      |
| Webhook signing                 | HMAC + timestamp + replay window.                                       |

---

## 15. Immediate next sprint

1. Write the workspace migration and backfill.
2. Extract `createDraft`, `validateDraft`, `createPublishIntent`,
   `confirmPublishIntent`, `listPosts`, `getPost` into `packages/core`.
3. Add `api_keys`, `idempotency_keys`, `audit_events`, `usage_events` schemas.
4. Add API-key middleware with scopes and workspace resolution.
5. Add `POST /v1/api-keys` and the dashboard key screen.
6. Add `Idempotency-Key` handling for all writes.
7. Add publish intents and make direct publish impossible.
8. Write OAuth discovery + token endpoints behind a feature flag.
9. Scaffold `apps/mcp` with one read tool (`list_accounts`) and one write tool
   (`create_draft`) behind the same auth.
10. Dogfood with Claude Code and MCP Inspector before any marketplace submission.

The first milestone is not "ChatGPT plugin live." It is:

> **A developer can create a key, connect an MCP client, draft a post, validate
> it, confirm a publish intent, and see per-destination status — with no browser
> session and no way to publish accidentally.**
