// src/app/types/chat.ts
// TypeScript interfaces for chat functionality based on mobile app models

export interface ChatHead {
  id: number;
  created_at: string;
  updated_at: string;
  product_id: string;
  product_text: string;
  product_name: string;
  product_photo: string;
  product_owner_id: string;
  product_owner_text: string;
  product_owner_name: string;
  product_owner_photo: string;
  product_owner_last_seen: string;
  customer_id: string;
  customer_text: string;
  customer_name: string;
  customer_photo: string;
  customer_last_seen: string;
  last_message_body: string;
  last_message_time: string;
  last_message_status: string;
  customer_unread_messages_count: string;
  product_owner_unread_messages_count: string;
  myUnreadCount?: number;
}

export interface ChatMessage {
  id: number;
  created_at: string;
  updated_at: string;
  chat_head_id: string;
  chat_head_text: string;
  sender_id: string;
  sender_text: string;
  receiver_id: string;
  receiver_text: string;
  sender_name: string;
  sender_photo: string;
  receiver_name: string;
  receiver_photo: string;
  body: string;
  type: string;
  status: string;
  audio: string;
  product_id: string;
  document: string;
  photo: string;
  longitude: string;
  latitude: string;
  isMyMessage?: boolean;
}

export interface ChatStartRequest {
  sender_id: string;
  receiver_id: string;
  product_id: string;
}

export interface ChatSendMessageRequest {
  chat_head_id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  type?: string;
}

export interface ChatMarkAsReadRequest {
  chat_head_id: string;
  user_id: string;
}

export interface OtherUser {
  id: string;
  name: string;
  photo: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
