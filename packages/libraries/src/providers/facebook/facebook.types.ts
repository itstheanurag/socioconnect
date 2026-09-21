export interface FacebookUserResponse {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
}

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category?: string;
  tasks?: string[];
  picture?: {
    data?: {
      url?: string;
    };
  };
}

export interface FacebookPageAccount extends FacebookPage {}

export interface FacebookAccountsResponse {
  data: FacebookPage[];
}

export interface FacebookPostResponse {
  id: string;
  post_id?: string;
}

export interface FacebookPagePostResponse extends FacebookPostResponse {}

export interface FacebookTokenExchangeResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}
