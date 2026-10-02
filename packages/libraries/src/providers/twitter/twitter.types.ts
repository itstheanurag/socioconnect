export interface TwitterUserResponse {
  data: {
    id: string;
    name: string;
    username: string;
    profile_image_url?: string;
    verified?: boolean;
    description?: string;
  };
}

export interface TwitterTweetResponse {
  data: {
    id: string;
    text: string;
    edit_history_tweet_ids?: string[];
  };
}

export interface TwitterMediaUploadResponse {
  media_id_string: string;
  size?: number;
  expires_after_secs?: number;
  image?: {
    image_type: string;
    w: number;
    h: number;
  };
}

export interface TwitterTokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
  scope: string;
  refresh_token?: string;
}
