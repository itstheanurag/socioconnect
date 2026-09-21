export interface DiscordUserResponse {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string;
  avatar?: string;
  email?: string;
}

export interface DiscordMessageResponse {
  id: string;
  channel_id: string;
  content: string;
  timestamp: string;
  webhook_id?: string;
}
