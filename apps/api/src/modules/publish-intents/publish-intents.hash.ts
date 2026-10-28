import { createHash } from "node:crypto";

export interface RevisionDispatch {
  id: string;
  accountId: string;
  destinationId: string | null;
  platform: string;
  customContent: string | null;
  customTitle: string | null;
  platformOptions: Record<string, unknown> | null;
  scheduledFor: Date;
}

export interface RevisionPost {
  id: string;
  title: string | null;
  content: string;
  tags: string[];
  linkUrl: string | null;
  mediaIds: string[];
  timingStrategy: string;
  dispatches: RevisionDispatch[];
}

export function computeRevisionHash(post: RevisionPost): string {
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
