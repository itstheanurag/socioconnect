export interface WhatsAppWebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: string;
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      contacts?: Array<{
        profile: { name: string };
        wa_id: string;
      }>;
      messages?: Array<{
        from: string;
        id: string;
        timestamp: string;
        type: "text" | "interactive" | "image" | "video";
        text?: { body: string };
        interactive?: {
          type: "button_reply" | "list_reply";
          button_reply?: { id: string; title: string };
          list_reply?: { id: string; title: string };
        };
      }>;
    };
  }>;
}

export interface WhatsAppWebhookPayload {
  object: string;
  entry: WhatsAppWebhookEntry[];
}
