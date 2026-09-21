export interface DiscordInteraction {
  id: string;
  type: number; // 1: Ping, 2: ApplicationCommand, 3: MessageComponent (Button)
  channel_id: string;
  guild_id?: string;
  user?: {
    id: string;
    username: string;
    global_name?: string;
  };
  member?: {
    user: {
      id: string;
      username: string;
      global_name?: string;
    };
  };
  data?: {
    id?: string;
    name?: string;
    custom_id?: string;
    options?: Array<{ name: string; value: string }>;
  };
  message?: {
    id: string;
    content: string;
  };
}
