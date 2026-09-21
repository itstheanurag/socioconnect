export interface YouTubeChannelResponse {
  items?: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      customUrl?: string;
      thumbnails?: {
        default?: { url: string };
        high?: { url: string };
      };
    };
    statistics?: {
      subscriberCount?: string;
      videoCount?: string;
    };
  }>;
}

export interface YouTubeVideoResponse {
  id: string;
  snippet?: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails?: Record<string, { url: string }>;
    tags?: string[];
  };
  status?: {
    uploadStatus: string;
    privacyStatus: string;
  };
}
