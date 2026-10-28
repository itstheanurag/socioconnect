#!/usr/bin/env bun
import path from "node:path";
import dotenv from "dotenv";
import { createClient, SocioConnectError } from "@socioconnect/sdk";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "apps/cli/.env") });

const argv = process.argv.slice(2);
const [scope, action, ...rest] = argv;

function flag(name: string): string | undefined {
  const index = rest.indexOf(`--${name}`);
  if (index === -1) return undefined;
  const value = rest[index + 1];
  return value && !value.startsWith("--") ? value : undefined;
}

function hasFlag(name: string): boolean {
  return rest.includes(`--${name}`);
}

function arg(index: number): string | undefined {
  const value = rest[index];
  if (!value || value.startsWith("--")) return undefined;
  if (index > 0 && rest[index - 1]?.startsWith("--")) return undefined;
  return value;
}

function print(value: unknown): void {
  console.log(JSON.stringify(value, null, 2));
}

function help(): void {
  console.log(`SocioConnect CLI

Usage:
  socioconnect whoami
  socioconnect accounts list
  socioconnect platforms list
  socioconnect posts list [--status draft|scheduled|published|failed] [--limit 20]
  socioconnect posts get <postId>
  socioconnect posts cancel <postId>
  socioconnect posts reschedule <postId> --at 2026-11-02T14:00:00Z
  socioconnect draft create --content "..." --account <accountId> --platform x [--title "..."] [--link "..."] [--idempotency-key key]
  socioconnect draft update <postId> --content "..." [--idempotency-key key]
  socioconnect intent create --post <postId> --mode publish|schedule [--at ISO] [--idempotency-key key]
  socioconnect intent get <intentId>
  socioconnect intent confirm <intentId> [--idempotency-key key]
  socioconnect media upload-url --filename image.png --mime image/png --size 120000 --type image
  socioconnect media confirm --storage-key key --url https://cdn/... --mime image/png --type image --size 120000
  socioconnect dispatch retry <dispatchId>
  socioconnect usage
  socioconnect activity [--limit 20]
  socioconnect webhooks list
  socioconnect webhooks create --url https://example.com/hook --events post.created,post.failed
  socioconnect webhooks delete <webhookId>
  socioconnect webhooks test <webhookId>

Environment:
  SOCIOCONNECT_API_KEY   required
  SOCIOCONNECT_API_URL   default https://api.socioconnect.app
`);
}

async function main(): Promise<void> {
  if (!scope || scope === "help" || hasFlag("help")) {
    help();
    return;
  }

  const apiKey = process.env.SOCIOCONNECT_API_KEY;
  if (!apiKey) {
    throw new Error("SOCIOCONNECT_API_KEY is required");
  }

  const client = createClient({
    apiKey,
    baseUrl: process.env.SOCIOCONNECT_API_URL || "https://api.socioconnect.app",
  });

  if (scope === "whoami") {
    const [profile, workspace] = await Promise.all([client.getProfile(), client.getWorkspace()]);
    print({ profile: profile.user, workspace: workspace.workspace });
    return;
  }

  if (scope === "accounts" && action === "list") {
    print(await client.listAccounts());
    return;
  }

  if (scope === "platforms" && action === "list") {
    print(await client.listPlatforms());
    return;
  }

  if (scope === "posts" && action === "list") {
    print(
      await client.listPosts({
        status: flag("status"),
        limit: flag("limit") ? Number(flag("limit")) : undefined,
      }),
    );
    return;
  }

  if (scope === "posts" && action === "get") {
    const id = arg(0);
    if (!id) throw new Error("postId is required");
    print(await client.getPost(id));
    return;
  }

  if (scope === "posts" && action === "cancel") {
    const id = arg(0);
    if (!id) throw new Error("postId is required");
    print(await client.cancelPost(id, flag("idempotency-key")));
    return;
  }

  if (scope === "posts" && action === "reschedule") {
    const id = arg(0);
    const at = flag("at");
    if (!id || !at) throw new Error("postId and --at are required");
    print(await client.reschedulePost(id, at, flag("idempotency-key")));
    return;
  }

  if (scope === "media" && action === "upload-url") {
    const filename = flag("filename");
    const mimeType = flag("mime");
    const sizeBytes = flag("size");
    const type = (flag("type") ?? "image") as "image" | "video" | "gif" | "audio";
    if (!filename || !mimeType || !sizeBytes) {
      throw new Error("--filename, --mime and --size are required");
    }
    print(
      await client.createMediaUploadUrl({ filename, mimeType, sizeBytes: Number(sizeBytes), type }),
    );
    return;
  }

  if (scope === "media" && action === "confirm") {
    const storageKey = flag("storage-key");
    const url = flag("url");
    const mimeType = flag("mime");
    const sizeBytes = flag("size");
    const type = (flag("type") ?? "image") as "image" | "video" | "gif" | "audio";
    if (!storageKey || !url || !mimeType || !sizeBytes) {
      throw new Error("--storage-key, --url, --mime and --size are required");
    }
    print(
      await client.confirmMediaUpload({
        storageKey,
        url,
        mimeType,
        sizeBytes: Number(sizeBytes),
        type,
        thumbnailUrl: flag("thumbnail"),
        width: flag("width") ? Number(flag("width")) : undefined,
        height: flag("height") ? Number(flag("height")) : undefined,
        durationSeconds: flag("duration") ? Number(flag("duration")) : undefined,
        altText: flag("alt"),
        idempotencyKey: flag("idempotency-key"),
      }),
    );
    return;
  }

  if (scope === "draft" && action === "create") {
    const content = flag("content");
    const accountId = flag("account");
    const platform = flag("platform");
    if (!content || !accountId || !platform) {
      throw new Error("--content, --account and --platform are required");
    }
    print(
      await client.createDraft({
        content,
        targets: [{ accountId, platform }],
        title: flag("title"),
        linkUrl: flag("link"),
        idempotencyKey: flag("idempotency-key"),
      }),
    );
    return;
  }

  if (scope === "draft" && action === "update") {
    const postId = arg(0) ?? flag("post");
    if (!postId) throw new Error("postId is required");
    print(
      await client.updateDraft(postId, {
        content: flag("content"),
        title: flag("title"),
        idempotencyKey: flag("idempotency-key"),
      }),
    );
    return;
  }

  if (scope === "intent" && action === "create") {
    const postId = flag("post");
    const mode = flag("mode") as "publish" | "schedule" | undefined;
    if (!postId || !mode) throw new Error("--post and --mode are required");
    print(
      await client.createPublishIntent({
        postId,
        mode,
        scheduledAt: flag("at"),
        idempotencyKey: flag("idempotency-key"),
      }),
    );
    return;
  }

  if (scope === "intent" && action === "get") {
    const id = arg(0);
    if (!id) throw new Error("intentId is required");
    print(await client.getPublishIntent(id));
    return;
  }

  if (scope === "intent" && action === "confirm") {
    const id = arg(0);
    if (!id) throw new Error("intentId is required");
    print(await client.confirmPublishIntent(id, flag("idempotency-key")));
    return;
  }

  if (scope === "dispatch" && action === "retry") {
    const id = arg(0);
    if (!id) throw new Error("dispatchId is required");
    print(await client.retryDispatch(id));
    return;
  }

  if (scope === "usage") {
    print(await client.getUsage());
    return;
  }

  if (scope === "activity") {
    print(await client.getActivity(flag("limit") ? Number(flag("limit")) : 20));
    return;
  }

  if (scope === "webhooks" && action === "list") {
    print(await client.listWebhooks());
    return;
  }

  if (scope === "webhooks" && action === "create") {
    const url = flag("url");
    if (!url) throw new Error("--url is required");
    print(
      await client.createWebhook({
        url,
        events: (flag("events") ?? "*").split(","),
        description: flag("description"),
      }),
    );
    return;
  }

  if (scope === "webhooks" && action === "delete") {
    const id = arg(0);
    if (!id) throw new Error("webhookId is required");
    print(await client.deleteWebhook(id));
    return;
  }

  if (scope === "webhooks" && action === "test") {
    const id = arg(0);
    if (!id) throw new Error("webhookId is required");
    print(await client.testWebhook(id));
    return;
  }

  help();
  process.exitCode = 1;
}

main().catch((err: unknown) => {
  if (err instanceof SocioConnectError) {
    console.error(`Error ${err.status}${err.code ? ` ${err.code}` : ""}: ${err.message}`);
  } else {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
  }
  process.exitCode = 1;
});
