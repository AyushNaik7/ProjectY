// Types for Real-Time Messaging System

export type MessageType = "text" | "file" | "image";
export type SenderRole = "brand" | "creator";

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: SenderRole;
  content: string;
  message_type: MessageType;
  file_url?: string;
  read_at?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  brand_id: string;
  creator_id: string;
  campaign_id?: string;
  created_at: string;
  updated_at: string;
  last_message_preview?: string;
  unread_brand: number;
  unread_creator: number;
}

export interface ConversationWithDetails extends Conversation {
  brand_name: string;
  brand_logo_url?: string;
  creator_name: string;
  creator_avatar_url?: string;
  creator_instagram_handle?: string;
  campaign_title?: string;
  other_party_name: string;
  other_party_avatar?: string;
  unread_count: number;
}

export interface MessageWithSender extends Message {
  sender_name: string;
  sender_avatar?: string;
}

export interface SendMessagePayload {
  conversation_id: string;
  content: string;
  message_type?: MessageType;
  file_url?: string;
}

export interface CreateConversationPayload {
  brand_id: string;
  creator_id: string;
  campaign_id?: string;
}
