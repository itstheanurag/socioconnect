export interface HackerNewsUserResponse {
  id: string | number;
  username?: string;
  name?: string;
  avatar_url?: string;
  profile_url?: string;
  [key: string]: unknown;
}

export interface HackerNewsPostResponse {
  id: string | number;
  url?: string;
  created_at?: string;
  [key: string]: unknown;
}
