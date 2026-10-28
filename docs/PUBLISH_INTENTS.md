# Publish Intents

Publish intents are the safety boundary between an agent drafting content and a
public post going live.

An agent can draft freely. Nothing is published or scheduled until a short-lived
intent is explicitly confirmed.

## Flow

```text
create draft -> create intent -> show preview to user -> confirm intent -> publish/schedule
```

### 1. Create a draft

API-key requests always create drafts, regardless of `scheduledAt`:

```http
POST /v1/posts
Authorization: Bearer sck_test_...
Idempotency-Key: draft-2026-11-02-1
Content-Type: application/json

{
  "content": "Launching the agent platform today.",
  "targets": [
    { "accountId": "uuid", "platform": "x" }
  ]
}
```

The post and its dispatches are stored in `draft` state. The worker will not
pick them up.

Browser-session requests keep the existing behavior: they can publish or
schedule immediately.

### 2. Create a publish intent

```http
POST /v1/publish-intents
Authorization: Bearer sck_test_...
Idempotency-Key: intent-2026-11-02-1
Content-Type: application/json

{
  "postId": "uuid",
  "mode": "schedule",
  "scheduledAt": "2026-11-02T14:00:00Z",
  "expiresInSeconds": 600
}
```

Response:

```json
{
  "payload": {
    "intent": {
      "id": "uuid",
      "state": "pending",
      "mode": "schedule",
      "scheduledAt": "2026-11-02T14:00:00.000Z",
      "expiresAt": "2026-10-28T05:10:00.000Z"
    },
    "preview": {
      "post": { "id": "uuid", "content": "Launching..." },
      "destinations": [
        {
          "platform": "x",
          "accountUsername": "acme",
          "content": "Launching...",
          "characterCount": 34,
          "maxCharacters": 280,
          "valid": true,
          "errors": [],
          "warnings": []
        }
      ],
      "estimatedDrops": 1
    }
  }
}
```

`mode` is `publish` or `schedule`. Schedule mode requires a future
`scheduledAt`.

### 3. Confirm

```http
POST /v1/publish-intents/{id}/confirm
Authorization: Bearer sck_test_...
Idempotency-Key: confirm-2026-11-02-1
```

The server verifies:

- intent is `pending`
- intent has not expired
- post still belongs to the caller/workspace
- the draft revision hash has not changed
- the API key is still allowed to publish to every target account

Then, atomically:

- `publish` mode: post becomes `dispatching`, dispatches become `pending`
- `schedule` mode: post becomes `scheduled`, dispatches become `pending` with
  the scheduled time

## Why the revision hash matters

The intent stores a SHA-256 hash of the post content, targets, platform options,
and per-destination variants. If anything changes after the intent is created,
confirmation fails with `DRAFT_CHANGED`. Create a new intent.

This prevents the classic agent failure: the user approves one version, and the
model silently publishes a different version.

## Errors

| Code                    | Meaning                                              |
| ----------------------- | ---------------------------------------------------- |
| `POST_NOT_PUBLISHABLE`  | Post is already dispatching, published, or cancelled |
| `NO_DESTINATIONS`       | Post has no target accounts                          |
| `SCHEDULED_AT_REQUIRED` | Schedule mode without `scheduledAt`                  |
| `SCHEDULED_AT_IN_PAST`  | Scheduled time is not in the future                  |
| `INTENT_NOT_PENDING`    | Intent was already confirmed, expired, or canceled   |
| `INTENT_EXPIRED`        | Intent is older than its TTL                         |
| `DRAFT_CHANGED`         | Post changed after the intent was created            |
| `ACCOUNT_NOT_ALLOWED`   | API key allowlist does not cover a target account    |

## Idempotency

API-key writes require an `Idempotency-Key` header. Successful responses are
cached for 24 hours and replayed on retry.

- Same key + same body → cached response with `Idempotent-Replayed: true`
- Same key + different body → `409 IDEMPOTENCY_CONFLICT`
- Same key while the first request is still running → `409 IDEMPOTENCY_IN_PROGRESS`
- Missing key on an API-key write → `400 IDEMPOTENCY_KEY_REQUIRED`

Typical keys:

```text
draft-{campaign}-{date}
intent-{postId}-{version}
confirm-{intentId}
```

Do not reuse a key for a genuinely different operation.

## Browser sessions

Session-authenticated writes do not require an idempotency key, but can send one.
Draft-first behavior is only enforced for API keys for now; the web composer
retains its immediate publish/schedule path.
