# API Keys

API keys let CLI tools, SDKs, and private agents call the public API without a
browser session.

## Create a key

Key management requires a signed-in browser session; API keys cannot mint other
API keys.

```http
POST /v1/api-keys
Authorization: Bearer <session-jwt>
Content-Type: application/json

{
  "name": "Claude Code on laptop",
  "scopes": ["profile:read", "accounts:read", "posts:read", "posts:write"],
  "accountIds": [],
  "expiresAt": "2027-01-01T00:00:00Z"
}
```

The response contains the plaintext token **once**:

```json
{
  "payload": {
    "key": {
      "id": "uuid",
      "prefix": "sck_test_1a2b3c4d",
      "scopes": ["profile:read", "accounts:read"],
      "lastUsedAt": null
    },
    "token": "sck_test_1a2b3c4d.<secret>"
  }
}
```

Store it immediately. Only a SHA-256 hash is persisted.

## Use a key

```bash
curl https://api.socioconnect.app/v1/accounts \
  -H "Authorization: Bearer $SOCIOCONNECT_API_KEY"
```

API keys are environment-specific: local/staging keys start with `sck_test_`,
production keys with `sck_live_`.

## Scopes

| Scope                | Grants                                             |
| -------------------- | -------------------------------------------------- |
| `profile:read`       | Current user, workspace, and profile               |
| `accounts:read`      | List connected accounts and destinations           |
| `accounts:write`     | Health-check, sync, disconnect accounts            |
| `destinations:read`  | List destinations                                  |
| `posts:read`         | List posts, dispatches, status                     |
| `posts:write`        | Create and edit drafts, adapt content, communities |
| `posts:publish`      | Retry dispatches and publish                       |
| `media:read`         | List media                                         |
| `media:write`        | Create upload URLs and record media                |
| `analytics:read`     | Read analytics                                     |
| `usage:read`         | Read quotas and subscription usage                 |
| `notifications:read` | Read and mark notifications                        |
| `webhooks:manage`    | Manage outbound webhooks (future)                  |

Publishing is intentionally separate from drafting. A content-generation agent
can hold `posts:write` without `posts:publish`.

## Account allowlist

Set `accountIds` to restrict a key to specific connected accounts:

```json
{
  "name": "Client A agent",
  "scopes": ["accounts:read", "posts:read", "posts:write", "posts:publish"],
  "accountIds": ["account-uuid"]
}
```

An empty array means all current and future accounts in the workspace.

The allowlist is enforced on account listing, destinations, post creation, post
listing/detail, and dispatch retries.

## Manage keys

```http
GET    /v1/api-keys
POST   /v1/api-keys
POST   /v1/api-keys/{id}/rotate
DELETE /v1/api-keys/{id}
```

Rotation creates a replacement with the same scopes and revokes the old key
immediately.

## Idempotent writes

Every API-key write must include an `Idempotency-Key` header:

```http
POST /v1/posts
Authorization: Bearer sck_test_...
Idempotency-Key: draft-2026-11-02-1
```

Successful responses are cached for 24 hours. Retrying with the same key and
body replays the original response with `Idempotent-Replayed: true`. Reusing the
key with a different body returns `409 IDEMPOTENCY_CONFLICT`.

See [PUBLISH_INTENTS.md](PUBLISH_INTENTS.md) for the full agent publish flow.

## Deny-by-default

API keys can only call routes with an explicit scope policy. Billing changes,
OAuth connection setup, logout, refresh-token, worker endpoints, and key
management are session-only. Unknown routes return:

```json
{
  "message": "This endpoint is not available to API keys",
  "code": "API_KEY_ENDPOINT_FORBIDDEN"
}
```

A missing scope returns:

```json
{
  "message": "API key is missing the required scope: posts:publish",
  "code": "INSUFFICIENT_SCOPE",
  "requiredScope": "posts:publish"
}
```

## Workspaces

Every key belongs to a workspace. The current phase provisions one personal
workspace per user. Team workspaces and key sharing come later; keys are always
revocable per workspace.

## Security notes

- Keys are shown once and stored as hashes.
- Expired and revoked keys return `401`.
- `lastUsedAt` is updated on every successful authentication.
- Never put keys in client-side code, URLs, logs, or chat messages.
- Prefer `posts:write` for drafting agents and keep `posts:publish` for a
  separate, human-approved agent.
