export interface MediumUserResponse {
  data: {
    id: string;
    username: string;
    name: string;
    url: string;
    imageUrl: string;
  };
}

export interface MediumPostResponse {
  data: {
    id: string;
    title: string;
    authorId: string;
    url: string;
    canonicalUrl: string;
    publishStatus: "public" | "draft" | "unlisted";
    publishedAt: number;
    license: string;
    tags: string[];
  };
}
