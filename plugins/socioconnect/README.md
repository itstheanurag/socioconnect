# SocioConnect plugin package

This folder is the marketplace package for ChatGPT, Codex, Claude, and Claude
Code. It wraps the remote MCP server with skills and a shared approval flow.

## Contents

```text
socioconnect/
├── plugin.json              # portable Agent Plugins manifest + OpenAI metadata
├── mcp.json                 # portable remote MCP config (OAuth + DCR)
├── .mcp.json                # Claude Code remote MCP config
├── .claude-plugin/
│   └── plugin.json          # Claude plugin manifest
├── agents/
│   └── openai.yaml          # MCP dependency declaration for OpenAI skills
├── skills/
│   ├── setup/
│   ├── launch-campaign/
│   ├── repurpose-content/
│   ├── weekly-scheduler/
│   ├── schedule-audit/
│   └── failure-triage/
└── assets/
    ├── icon.png
    ├── logo.png
    └── screenshots/         # marketplace review screenshots
```

## Skills

| Skill               | Purpose                                        |
| ------------------- | ---------------------------------------------- |
| `setup`             | Connect accounts, check usage, run onboarding  |
| `launch-campaign`   | Announce a product or feature across platforms |
| `repurpose-content` | Turn long-form content into platform variants  |
| `weekly-scheduler`  | Plan and schedule a week of posts              |
| `schedule-audit`    | Review the calendar for gaps and duplicates    |
| `failure-triage`    | Diagnose failures and retry safe destinations  |

## Safety model

Every skill follows the same rule:

```text
create_draft -> create_publish_intent -> preview -> explicit approval -> confirm
```

`create_draft` and `create_publish_intent` never publish. Only
`confirm_publish_intent` changes public state, and it is marked destructive and
open-world in the MCP tool metadata.

The plugin does not sell subscriptions or start checkout flows. If a plan limit
blocks an action, explain the limit and link to the plans page.

## Production URLs

- MCP: `https://mcp.socioconnect.app/mcp`
- OAuth issuer: `https://api.socioconnect.app`
- App: `https://socioconnect.app`
- Privacy: `https://socioconnect.app/privacy`
- Terms: `https://socioconnect.app/terms`

Update these URLs and the assets before submission.

## Local testing

For local MCP, temporarily point the manifests at:

```text
http://localhost:8010/mcp
```

Local OAuth discovery is served by the API at `http://localhost:8000`.
API-key clients can use `Authorization: Bearer sck_test_...` directly.

### Claude Code

```bash
claude --plugin-dir ./plugins/socioconnect
```

Or add the repository as a marketplace and install `socioconnect`.

### OpenAI / Codex

Add the repo marketplace:

```bash
codex plugin marketplace add ./ --sparse .agents/plugins
```

Then restart the ChatGPT desktop app and install from the local source.

## Submission checklist

### OpenAI

- [ ] Organization identity verification
- [ ] Public HTTPS MCP endpoint
- [ ] Domain verification at `/.well-known/openai-apps-challenge`
- [ ] OAuth discovered from `/.well-known/oauth-protected-resource`
- [ ] Demo account with sample data and no MFA
- [ ] Privacy policy and support contact
- [x] Tool annotations match behavior
- [x] Per-tool security schemes and scopes in MCP metadata
- [ ] Test prompts and expected responses
- [x] Final icon, logo, and marketplace screenshots

### Claude

- [ ] Submit the MCP server as a connector
- [ ] Submit the plugin bundle from the same organization
- [ ] `claude plugin validate ./plugins/socioconnect`
- [ ] Directory listing icon, docs, support, privacy, and terms URLs
- [ ] Verify the connector and plugin pair correctly

## Screenshots

Marketplace-ready captures live in `assets/screenshots/`:

- `overview.png` — workspace signal rail and publishing overview
- `team-billing.png` — workspace plan, usage, and plan selection
- `developers.png` — API keys, agent access, and MCP connection details
- `publish-preview.png` — approval card rendered by the preview widget
- `overview-mobile.png` — mobile layout

## Known gaps

- The preview widget depends on MCP Apps UI support. Text fallback remains.
- Access tokens are short-lived but not individually revocable; refresh tokens
  are revocable.
- The review account must be seeded on the deployment host and its password
  rotated after each review.
