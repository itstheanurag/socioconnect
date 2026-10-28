---
name: schedule-audit
description: Review upcoming and recent posts for gaps, duplicates, failures, and weak distribution. Use for schedule reviews and content calendar audits. Read-only unless the user asks for changes.
---

# Schedule audit

Use this skill when the user asks what is scheduled, what went out, or whether the calendar looks healthy.

## Workflow

1. Call `list_posts` with `status: "scheduled"`.
2. Call `list_posts` with `status: "published"` for the recent period if useful.
3. Call `list_posts` with `status: "failed"`.
4. For any interesting post, call `get_post` for per-destination detail.
5. Report:
   - upcoming posts and times
   - platform distribution
   - duplicate or near-duplicate content
   - large gaps
   - failed or pending destinations
   - accounts that need reconnection
6. Suggest specific changes, but do not edit or cancel anything unless the user asks.

## Rules

- This is a read-only audit by default.
- Do not infer reach or engagement unless the data is returned by the tools.
- If the user asks to fix an issue, use `update_draft`, `cancel_scheduled_post`, or `retry_failed_dispatch` with the same approval discipline as publishing.
