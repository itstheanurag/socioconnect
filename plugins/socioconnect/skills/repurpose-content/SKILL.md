---
name: repurpose-content
description: Turn a blog post, newsletter, video, or long-form note into platform-specific posts for connected accounts, then preview and publish after approval. Use for content repurposing and cross-posting.
---

# Repurpose content

Use this skill when the user provides long-form material and wants it distributed across platforms.

## Inputs

- the source content, URL, or a clear summary
- target accounts or platforms
- whether to publish now or schedule

If the source is a URL you cannot access, ask the user to paste the text or key points. Do not invent details.

## Workflow

1. Extract 3-7 distinct ideas or angles from the source.
2. Call `list_accounts` and `get_platform_capabilities`.
3. Choose the smallest set of platforms that fits each idea.
4. Call `create_draft` with:
   - the master idea
   - per-platform `customContent` adapted for length and tone
   - titles for article-style platforms
   - the source link where appropriate
5. Call `create_publish_intent` with `mode: "schedule"` unless the user asked to publish now.
6. Call `render_publish_preview` when UI is available; otherwise summarize the variants.
7. Ask which variants to keep, edit, or drop.
8. Apply edits with `update_draft`, then create fresh intents.
9. Confirm only the intents the user approved.

## Quality rules

- Do not copy the same text to every platform.
- Respect the per-platform character counts and media requirements reported by the preview.
- Preserve the source's meaning; do not add claims that are not in the source.
- Do not publish a thread or article draft that failed validation.
