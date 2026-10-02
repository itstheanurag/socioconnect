export interface TelegramUserResponse {
  ok: boolean;
  result: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username?: string;
    can_join_groups?: boolean;
    can_read_all_group_messages?: boolean;
    supports_inline_queries?: boolean;
  };
}

export interface TelegramMessageResponse {
  ok: boolean;
  result: {
    message_id: number;
    chat: {
      id: number | string;
      title?: string;
      username?: string;
      type: "private" | "group" | "supergroup" | "channel";
    };
    date: number;
    text?: string;
    caption?: string;
  };
}

export interface TelegramMediaGroupResponse {
  ok: boolean;
  result: TelegramMessageResponse["result"][];
}
