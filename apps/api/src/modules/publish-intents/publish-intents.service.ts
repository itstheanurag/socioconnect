import type { SocialPlatform, UniversalPostPayload } from "@repo/libraries";
import { createSocialProviderRegistry } from "@/modules/provider-registry";
import { type RevisionDispatch, type RevisionPost } from "./publish-intents.hash";

export { computeRevisionHash } from "./publish-intents.hash";

type DispatchWithRelations = RevisionDispatch & {
  account?: { username: string } | null;
  destination?: { name: string } | null;
};

type PostWithDispatches = Omit<RevisionPost, "dispatches"> & {
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
