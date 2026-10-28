import { createHash } from "node:crypto";
import type { SocialPlatform, UniversalPostPayload } from "@repo/libraries";
import { createSocialProviderRegistry } from "@/modules/provider-registry";

type DispatchWithRelations = {
  id: string;
  accountId: string;
  destinationId: string | null;
  platform: string;
  customContent: string | null;
  customTitle: string | null;
  platformOptions: Record<string, unknown> | null;
  scheduledFor: Date;
  account?: { username: string } | null;
  destination?: { name: string } | null;
};

type PostWithDispatches = {
  id: string;
  title: string | null;
  content: string;
  tags: string[];
  linkUrl: string | null;
  mediaIds: string[];
  timingStrategy: string;
  status: string;
  scheduledAt: Date | null;
  dispatches: DispatchWithRelations[];
};

const providerRegistry = createSocialProviderRegistry();

export interface PublishIntentPreview {
  post: {
    id: string;
    title: string | null;
    content: string;
    status: string;
    scheduledAt: string | null;
  };
  destinations: Array<{
    dispatchId: string;
    accountId: string;
    accountUsername: string;
    platform: string;
    destinationName: string | null;
    content: string;
    title: string | null;
    characterCount: number;
    maxCharacters: number;
    valid: boolean;
    errors: Array<{ field: string; message: string; code: string; critical: boolean }>;
    warnings: string[];
  }>;
  estimatedDrops: number;
}

export function computeRevisionHash(post: PostWithDispatches): string {
  const dispatches = [...post.dispatches]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((dispatch) => ({
      id: dispatch.id,
      accountId: dispatch.accountId,
      destinationId: dispatch.destinationId,
      platform: dispatch.platform,
      customContent: dispatch.customContent,
      customTitle: dispatch.customTitle,
      platformOptions: dispatch.platformOptions,
      scheduledFor: dispatch.scheduledFor.toISOString(),
    }));

  const payload = {
    id: post.id,
    title: post.title,
    content: post.content,
    tags: post.tags,
    linkUrl: post.linkUrl,
    mediaIds: post.mediaIds,
    timingStrategy: post.timingStrategy,
    dispatches,
  };

  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export function buildPreview(post: PostWithDispatches): PublishIntentPreview {
  const destinations = post.dispatches.map((dispatch) => {
    const content = dispatch.customContent ?? post.content;
    const title = dispatch.customTitle ?? post.title ?? undefined;

    const payload: UniversalPostPayload = {
      content,
      title,
      tags: post.tags,
      linkUrl: post.linkUrl ?? undefined,
      platformOptions: dispatch.platformOptions ?? undefined,
    };

    const platform = dispatch.platform as SocialPlatform;
    const validation = providerRegistry.has(platform)
      ? providerRegistry.get(platform).validatePost(payload)
      : null;

    const warnings = (validation?.warnings ?? []).map((warning: string | { message: string }) =>
      typeof warning === "string" ? warning : warning.message,
    );

    return {
      dispatchId: dispatch.id,
      accountId: dispatch.accountId,
      accountUsername: dispatch.account?.username ?? "",
      platform: dispatch.platform,
      destinationName: dispatch.destination?.name ?? null,
      content,
      title: title ?? null,
      characterCount: validation?.characterCount ?? content.length,
      maxCharacters: validation?.maxCharacters ?? content.length,
      valid: validation?.valid ?? true,
      errors: validation?.errors ?? [],
      warnings,
    };
  });

  return {
    post: {
      id: post.id,
      title: post.title,
      content: post.content,
      status: post.status,
      scheduledAt: post.scheduledAt ? post.scheduledAt.toISOString() : null,
    },
    destinations,
    estimatedDrops: destinations.length,
  };
}
