export interface InstagramUserResponse {
  id: string;
  username: string;
  name?: string;
  profile_picture_url?: string;
  followers_count?: number;
}

export interface InstagramMediaContainerResponse {
  id: string;
}

export interface InstagramPublishResponse {
  id: string;
}

export interface InstagramTokenRefreshResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
