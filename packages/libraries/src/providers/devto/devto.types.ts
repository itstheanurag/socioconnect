export interface DevToArticleResponse {
  id: number;
  title: string;
  description: string;
  published: boolean;
  page_views_count: number;
  slug: string;
  path: string;
  url: string;
  canonical_url: string;
  published_at: string;
  tags: string[];
}

export interface DevToUserResponse {
  type_of: string;
  id: number;
  username: string;
  name: string;
  summary: string;
  profile_image: string;
  website_url?: string;
  joined_at: string;
}
