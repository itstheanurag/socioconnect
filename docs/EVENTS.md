# Audit and Usage Events

Two append-only ledgers record what happened and what it consumed.

## Audit events

`audit.audit_events` answers **who did what**:

| Column                           | Purpose                                                |
| -------------------------------- | ------------------------------------------------------ |
| `workspace_id`                   | Tenant boundary                                        |
| `actor_type`                     | `user`, `api_key`, `system`                            |
| `actor_id`                       | User ID or API-key ID                                  |
| `action`                         | Dot-namespaced action, e.g. `publish_intent.confirmed` |
| `resource_type` / `resource_id`  | Target object                                          |
| `metadata`                       | Small, non-sensitive context                           |
| `ip`, `user_agent`, `request_id` | Request attribution                                    |
| `created_at`                     | Event time                                             |

Recorded actions today:

- `api_key.created`
- `api_key.revoked`
- `api_key.rotated`
- `post.created`
- `post.draft_created`
- `publish_intent.created`
- `publish_intent.confirmed`
- `dispatch.retried`

Audit writes are best-effort: a logging failure never fails the user request.
They must not contain provider tokens, API keys, post bodies, or other secrets.

## Usage events

`usage.usage_events` answers **what did it consume**:

| Column         | Purpose                                                  |
| -------------- | -------------------------------------------------------- |
| `workspace_id` | Tenant boundary                                          |
| `api_key_id`   | Credential responsible, when applicable                  |
| `source`       | `web`, `api`, `mcp`, `cli`, `plugin`, `system`           |
| `operation`    | `publish_operation`, `draft_created`, future `ai_credit` |
| `quantity`     | Units consumed                                           |
| `post_id`      | Related post, when applicable                            |
| `metadata`     | Small context                                            |
| `created_at`   | Event time                                               |

Rules:

- `publish_operation` quantity is the number of destination publishes.
- `draft_created` has quantity `0`; it is analytics, not billable volume.
- Retries do not consume quota.
- API-key events use source `api`; browser-session events use `web`.

The existing quota counters are still updated for compatibility, but the usage
ledger is the source of truth for reporting and future usage-based pricing.

## Querying

Repositories:

```ts
AuditRepository.listByWorkspace(workspaceId, { action, limit, offset });
UsageRepository.listByWorkspace(workspaceId, { operation, since, limit, offset });
UsageRepository.sumQuantity(workspaceId, "publish_operation", since);
```

Both tables are append-only. Do not update or delete individual events except
for test cleanup.
