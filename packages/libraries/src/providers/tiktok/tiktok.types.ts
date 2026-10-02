export interface TikTokUserResponse {
  data: {
    user: {
      open_id: string;
      union_id?: string;
      avatar_url?: string;
      display_name: string;
      bio_description?: string;
      is_verified?: boolean;
    };
  };
  error: {
    code: string;
    message: string;
    log_id: string;
  };
}

export interface TikTokPublishResponse {
  data: {
    publish_id: string;
  };
  error: {
    code: string;
    message: string;
    log_id: string;
  };
}

export interface TikTokTokenResponse {
  open_id: string;
  scope: string;
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  token_type: string;
}
