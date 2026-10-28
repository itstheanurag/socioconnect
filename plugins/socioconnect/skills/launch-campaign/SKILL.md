---
name: launch-campaign
description: Draft and publish a product or feature launch across connected social accounts with per-platform variants, a preview, and explicit approval. Use for launches, announcements, release notes, and campaign kickoffs.
---

# Launch campaign

Use this skill when the user wants to announce a product, feature, release, event, or campaign across multiple platforms.

## Inputs

Collect only what is missing:

- what is launching
- the primary link
- target audience
- launch date and time (and timezone)
- platforms or accounts to include

Do not invent product claims, pricing, dates, or links.

## Workflow

1. Call `list_accounts` and use only real account IDs.
2. Call `get_platform_capabilities` for the selected platforms.
3. Call `create_draft` with:
   - the master announcement
   - one target per selected account
   - per-platform `customContent` where tone or length should differ
4. Call `create_publish_intent` for the draft:
   - `mode: "publish"` for immediate
   - `mode: "schedule"` with `scheduledAt` for a launch time
5. Call `render_publish_preview` with the intent ID when the host supports UI. Otherwise present the preview as a short text summary:
   - each platform and account
   - the final text
   - warnings or blocking errors
   - schedule time
6. Ask the user to approve or edit.
7. If they change anything:
   - call `update_draft`
   - create a **new** publish intent
   - show the new preview
8. Call `confirm_publish_intent` only after explicit approval.
9. Call `get_post` and report per-destination status. Do not claim success for destinations that are still pending.

## Safety

- Never publish without a confirmed publish intent.
- Never confirm more than one intent from a single approval unless the user explicitly approved a batch.
- If a platform has blocking validation errors, fix them before asking for approval.
- If the user asks to "just post it", still show a one-line preview and ask for confirmation.
