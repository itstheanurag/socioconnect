---
name: setup
description: Set up SocioConnect for a new user by checking the profile, connected accounts, plan usage, and connection links. Use after installing the plugin or when the user asks to connect an account.
---

# SocioConnect setup

Use this skill after installation or when the user asks what is connected.

## Steps

1. Call `get_profile` to identify the workspace.
2. Call `list_accounts`.
3. If there are no accounts, call `get_connect_link` and give the user the link. Explain that accounts must be connected in the browser; you cannot connect them.
4. Call `get_usage` and summarize the current plan limits.
5. If the user is about to publish, call `get_platform_capabilities` for the platforms they plan to use.
6. Summarize:
   - workspace name
   - connected accounts and platforms
   - publish drops remaining
   - next usage reset date
   - any account that needs reconnection

Do not create drafts or publish during setup unless the user asks.
