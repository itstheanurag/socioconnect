export interface ThreadsUserResponse {
  id: string;
  username: string;
  name?: string;
  threads_profile_picture_url?: string;
  threads_biography?: string;
}

export interface ThreadsContainerResponse {
  id: string;
}

export interface ThreadsPublishResponse {
  id: string;
}

export interface ThreadsTokenResponse {
  access_token: string;
  user_id: number | string;
  token_type?: string;
  expires_in?: number;
}
