---
name: weekly-scheduler
description: Plan and schedule a week of content across connected accounts, avoiding duplicates and gaps. Use for weekly planning, content calendars, and batch scheduling.
---

# Weekly scheduler

Use this skill when the user wants a content plan or a batch of scheduled posts.

## Inputs

- week or date range
- themes, products, or campaigns
- posting cadence or number of posts
- accounts or platforms
- timezone

## Workflow

1. Call `list_accounts`.
2. Call `list_posts` with `status: "scheduled"` to see what is already queued.
3. Call `get_platform_capabilities` for the selected platforms.
4. Propose a compact plan first. For each slot include:
   - date and time
   - platform and account
   - angle
   - suggested format
5. Ask the user to approve or adjust the plan before creating content.
6. Create one draft per post with `create_draft`.
7. Create one schedule intent per draft with `create_publish_intent`, `mode: "schedule"`, and the approved time.
8. Show previews with `render_publish_preview` or text.
9. Confirm only approved intents.
10. Call `list_posts` again and summarize the final schedule.

## Rules

- Do not create duplicate posts for the same platform and time.
- Do not schedule outside the user's working hours unless asked.
- Do not confirm every intent from one vague approval; group approvals explicitly.
- Leave gaps rather than inventing low-value filler.
