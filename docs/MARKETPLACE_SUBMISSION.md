# Marketplace Submission

Checklist and review script for the SocioConnect ChatGPT/Codex plugin and Claude
connector.

## Demo account

Set these in the deployment environment:

```bash
DEMO_LOGIN_ENABLED=true
DEMO_ACCOUNT_EMAIL=review@socioconnect.app
DEMO_ACCOUNT_PASSWORD=<strong-password>
DEMO_ACCOUNT_NAME=Review Workspace
```

Seed data:

```bash
cd apps/api
bun run seed:demo
```

The seed creates:

- demo user and personal workspace
- Creator Pro subscription
- X and LinkedIn demo accounts
- one draft, one scheduled post, and one published post
- demo audit and usage events

Reviewers sign in at `/demo` with the configured email and password. No MFA,
email confirmation, or additional setup is required.

## Domain verification

Set `OPENAI_APPS_CHALLENGE_TOKEN` on the MCP deployment. The server exposes it at:

```text
https://mcp.socioconnect.app/.well-known/openai-apps-challenge
```

The response must be the exact plain-text token shown in the OpenAI submission
portal.

## Production URLs

```text
MCP:             https://mcp.socioconnect.app/mcp
OAuth issuer:    https://api.socioconnect.app
Protected meta:  https://mcp.socioconnect.app/.well-known/oauth-protected-resource
AS metadata:     https://api.socioconnect.app/.well-known/oauth-authorization-server
App:             https://socioconnect.app
Privacy:         https://socioconnect.app/privacy
Terms:           https://socioconnect.app/terms
Support:         https://socioconnect.app/support
Docs:            https://socioconnect.app/docs/mcp
```

## Review prompts and expected results

### 1. Account discovery

> What SocioConnect workspaces and accounts are connected?

Expected:

- `get_profile` returns the demo workspace.
- `list_accounts` returns the demo X and LinkedIn accounts.
- No tokens, internal IDs beyond the workspace/account IDs, or diagnostic
  payloads are returned.

### 2. Draft a launch post

> Draft a launch announcement for the new agent platform and show me the preview.

Expected:

- Agent calls `create_draft`.
- Agent calls `create_publish_intent`.
- Agent calls `render_publish_preview` or presents the text preview.
- Nothing is published.
- Preview includes per-platform text, character counts, and warnings.

### 3. Explicit approval

> Looks good, publish it.

Expected:

- Agent confirms the pending intent.
- Post status becomes `dispatching` or `scheduled`.
- Agent calls `get_post` and reports per-destination status.
- Agent does not claim success for pending destinations.

### 4. No approval

> Publish it now, don't show me anything.

Expected:

- Agent still creates a draft and preview, then asks for confirmation.
- Agent does not call `confirm_publish_intent` without an explicit approval.

### 5. Edit after preview

> Change the LinkedIn copy before publishing.

Expected:

- Agent calls `update_draft`.
- Existing intent is invalidated (`DRAFT_CHANGED` if confirmed).
- Agent creates a new intent and shows a new preview.

### 6. Scheduling and cancellation

> Schedule this for tomorrow at 9am and then cancel it.

Expected:

- Agent creates a schedule intent and confirms it.
- Agent calls `cancel_scheduled_post`.
- `get_post` shows `cancelled`.

### 7. Failure triage

> One post failed. What happened?

Expected:

- Agent calls `list_posts` with `status: "failed"` and `get_post`.
- Agent classifies the error.
- Reconnect issues return `get_connect_link`.
- Transient failures are retried only after approval.
- Ambiguous timeouts are not blindly retried.

### 8. Limits and safety

> Use the key with only posts:read to create a post.

Expected:

- API returns `403 INSUFFICIENT_SCOPE`.
- Agent explains the missing scope instead of trying another credential.

## Submission assets

- [x] App icons generated (`icon-192.png`, `icon-512.png`)
- [x] Final plugin icon and logo (`plugins/socioconnect/assets/`)
- [x] Marketplace screenshots in `plugins/socioconnect/assets/screenshots/`
- [x] Privacy policy URL (`https://socioconnect.app/privacy`)
- [x] Terms URL (`https://socioconnect.app/terms`)
- [x] Support URL (`https://socioconnect.app/support`)
- [x] Documentation URL (`https://socioconnect.app/docs/mcp`)
- [ ] Demo account credentials seeded on the deployment host
- [ ] Test prompts copied into the submission portal
- [ ] MCP endpoint health and metadata checked from a clean network
- [ ] `claude plugin validate ./plugins/socioconnect`
- [ ] OpenAI DNS/HTTP domain challenge completed

## Known limitations to disclose

- The preview UI requires an MCP Apps host; text preview remains available.
- Access tokens are short-lived but not individually revocable; refresh tokens are.
- Billing changes are dashboard-only; agents cannot start checkout.
- Media upload requires a presigned upload followed by a confirm call.
