export interface RedditUserResponse {
  id: string;
  name: string;
  icon_img: string;
  link_karma: number;
  comment_karma: number;
  subreddit?: {
    display_name_prefixed: string;
  };
}

export interface RedditSubmitResponse {
  json: {
    errors: Array<[string, string, string]>;
    data?: {
      url: string;
      id: string;
      name: string;
    };
  };
}
