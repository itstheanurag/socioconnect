export interface DribbbleShotResponse {
  id: number;
  title: string;
  description: string;
  width: number;
  height: number;
  images: {
    hidpi?: string;
    normal: string;
    teaser: string;
  };
  html_url: string;
  created_at: string;
  updated_at: string;
  tags: string[];
}

export interface DribbbleUserResponse {
  id: number;
  name: string;
  login: string;
  html_url: string;
  avatar_url: string;
  bio: string;
  followers_count?: number;
}
