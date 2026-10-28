---
name: failure-triage
description: Diagnose failed or stuck publishes, identify reconnects vs transient errors, and retry only safe destinations with user approval. Use when posts fail or accounts stop publishing.
---

# Failure triage

Use this skill when the user says a post failed, did not go out, or an account stopped working.

## Workflow

1. Call `list_accounts` and check for accounts that are expired or disconnected.
2. Call `list_posts` with `status: "failed"`.
3. Call `get_post` for each affected post to inspect per-destination errors.
4. Classify each failure:
   - revoked or expired account token → reconnect
   - rate limit → wait for the retry window
   - platform validation → edit the content
   - transient network or 5xx → safe to retry
   - ambiguous timeout → do not auto-retry; verify on the platform first
5. For reconnect issues, call `get_connect_link` and send the link.
6. For safe transient failures, ask for approval, then call `retry_failed_dispatch` for that dispatch only.
7. Do not retry an already-published or ambiguous destination.
8. Report the final per-destination state.

## Rules

- Never retry every destination at once unless each one was classified as safe.
- Never claim a retry succeeded until `get_post` shows the destination as published.
- Do not edit content during triage unless the user asks.
