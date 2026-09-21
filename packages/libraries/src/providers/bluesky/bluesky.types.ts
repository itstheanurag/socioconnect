export interface BlueskySession {
  did: string;
  handle: string;
  email?: string;
  accessJwt: string;
  refreshJwt: string;
  active?: boolean;
}

export interface BlueskyCreateSessionResponse {
  did: string;
  handle: string;
  email?: string;
  accessJwt: string;
  refreshJwt: string;
  active?: boolean;
}

export interface BlueskyBlobUploadResponse {
  blob: {
    $type: "blob";
    ref: {
      $link: string;
    };
    mimeType: string;
    size: number;
  };
}

export interface BlueskyFacet {
  index: {
    byteStart: number;
    byteEnd: number;
  };
  features: Array<
    | { $type: "app.bsky.richtext.facet#link"; uri: string }
    | { $type: "app.bsky.richtext.facet#mention"; did: string }
    | { $type: "app.bsky.richtext.facet#tag"; tag: string }
  >;
}

export interface BlueskyProfileResponse {
  did: string;
  handle: string;
  displayName?: string;
  description?: string;
  avatar?: string;
  banner?: string;
  followersCount?: number;
  followsCount?: number;
  postsCount?: number;
}

export interface BlueskyRecordResponse {
  uri: string;
  cid: string;
}

export interface BlueskyPostRecord {
  $type: "app.bsky.feed.post";
  text: string;
  createdAt: string;
  langs?: string[];
  facets?: BlueskyFacet[];
  embed?: {
    $type: "app.bsky.embed.images" | "app.bsky.embed.external";
    images?: Array<{
      alt: string;
      image: BlueskyBlobUploadResponse["blob"];
    }>;
    external?: {
      uri: string;
      title: string;
      description: string;
    };
  };
}
