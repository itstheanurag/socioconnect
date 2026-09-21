export interface PinterestUserResponse {
  username: string;
  profile_image?: string;
  account_type?: string;
  id?: string;
}

export interface PinterestPinResponse {
  id: string;
  created_at: string;
  link?: string;
  title?: string;
  description?: string;
  board_id: string;
  media?: {
    media_type: string;
    images?: Record<string, { url: string; width: number; height: number }>;
  };
}
