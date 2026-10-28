# CLI and TypeScript SDK

The SDK and CLI use the public REST API with a scoped API key.

## Install / run

From the monorepo:

```bash
bun run cli --help
```

Export a key:

```bash
export SOCIOCONNECT_API_KEY=sck_live_...
export SOCIOCONNECT_API_URL=https://api.socioconnect.app
```

## CLI

```bash
socioconnect whoami
socioconnect accounts list
socioconnect platforms list
socioconnect posts list --status scheduled
socioconnect posts get <postId>
socioconnect draft create --content "Launch day" --account <accountId> --platform x
socioconnect draft update <postId> --content "Updated copy"
socioconnect intent create --post <postId> --mode schedule --at 2026-11-02T14:00:00Z
socioconnect intent confirm <intentId>
socioconnect posts cancel <postId>
socioconnect posts reschedule <postId> --at 2026-11-02T14:00:00Z
socioconnect media upload-url --filename image.png --mime image/png --size 120000 --type image
socioconnect media confirm --storage-key key --url https://cdn/... --mime image/png --type image --size 120000
socioconnect dispatch retry <dispatchId>
socioconnect usage
socioconnect activity --limit 20
socioconnect webhooks list
```

All commands print JSON. Exit code is non-zero on API errors.

## SDK

```ts
import { createClient } from "@socioconnect/sdk";

const client = createClient({
  apiKey: process.env.SOCIOCONNECT_API_KEY!,
  baseUrl: "https://api.socioconnect.app",
});

const accounts = await client.listAccounts();
const draft = await client.createDraft({
  content: "Launch day",
  targets: [{ accountId: accounts.accounts[0].id, platform: "x" }],
});

const intent = await client.createPublishIntent({
  postId: draft.postId,
  mode: "schedule",
  scheduledAt: "2026-11-02T14:00:00Z",
});

await client.confirmPublishIntent(intent.intent.id as string);
```

The SDK generates an idempotency key for every write unless you pass one.

## Safety

- Drafting and publishing are separate scopes.
- `confirmPublishIntent` is irreversible for `publish` mode.
- Always show the intent preview to the user before confirming.
- Do not retry ambiguous timeouts without checking the destination.
