export interface LinkedInUserInfoResponse {
  sub: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email?: string;
}

export interface LinkedInUGCPostResponse {
  id: string;
}
