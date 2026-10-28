import { describe, expect, it } from "bun:test";
import { computeRevisionHash, type RevisionPost } from "./publish-intents.hash";

function makePost(overrides: Partial<RevisionPost> = {}): RevisionPost {
  return {
    id: "post_1",
    title: "Launch",
    content: "Shipping today",
    tags: ["launch"],
    linkUrl: "https://example.com",
    mediaIds: [],
    timingStrategy: "simultaneous",
    dispatches: [
      {
        id: "dispatch_1",
        accountId: "account_1",
        destinationId: null,
        platform: "x",
        customContent: null,
        customTitle: null,
        platformOptions: {},
        scheduledFor: new Date("2026-11-02T14:00:00Z"),
      },
      {
        id: "dispatch_2",
        accountId: "account_2",
        destinationId: null,
        platform: "linkedin",
        customContent: "LinkedIn variant",
        customTitle: null,
        platformOptions: {},
        scheduledFor: new Date("2026-11-02T14:00:00Z"),
      },
    ],
    ...overrides,
  };
}

describe("publish intent revision hash", () => {
  it("is deterministic", () => {
    expect(computeRevisionHash(makePost())).toBe(computeRevisionHash(makePost()));
  });

  it("changes when content changes", () => {
    expect(computeRevisionHash(makePost())).not.toBe(
      computeRevisionHash(makePost({ content: "Different" })),
    );
  });

  it("changes when a target changes", () => {
    const changed = makePost();
    changed.dispatches[1].customContent = "Different variant";

    expect(computeRevisionHash(changed)).not.toBe(computeRevisionHash(makePost()));
  });

  it("is independent of dispatch ordering", () => {
    const reordered = makePost();
    reordered.dispatches = [...reordered.dispatches].reverse();

    expect(computeRevisionHash(reordered)).toBe(computeRevisionHash(makePost()));
  });
});
