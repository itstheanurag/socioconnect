export interface AuthCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date | string | number;
  tokenType?: string;
  scopes?: string[];
  accountId?: string;
  accountHandle?: string;
  accountName?: string;
  avatarUrl?: string;
  extra?: Record<string, unknown>;
}

export interface TokenRefreshResult {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  expiresAt?: Date;
  scopes?: string[];
  extra?: Record<string, unknown>;
}

export interface UserProfile {
  id: string;
  handle: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  profileUrl?: string;
  followerCount?: number;
  rawProfile?: Record<string, unknown>;
}

export interface AuthUrlOptions {
  state: string;
  redirectUri: string;
  scopes?: string[];
  additionalParams?: Record<string, string>;
}

export interface ExchangeCodeOptions {
  code: string;
  redirectUri: string;
  codeVerifier?: string;
}
