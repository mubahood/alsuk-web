// src/app/services/chatService.ts
// Chat service for API communication using centralized HTTP functions

import { http_get, http_post } from './Api';
import { 
  ChatHead, 
  ChatMessage, 
  ChatStartRequest, 
  ChatSendMessageRequest, 
  ChatMarkAsReadRequest,
  ApiResponse 
} from '../types/chat';
import { API_URL } from '../../Constants';

class ChatService {
  /**
   * Start a new chat conversation
   * Based on mobile app chat_start API call
   */
  async startChat(request: ChatStartRequest): Promise<ApiResponse<ChatHead>> {
    try {
      const response = await http_post('chat-start', {
        sender_id: request.sender_id,
        receiver_id: request.receiver_id,
        product_id: request.product_id
      });

      return response;
    } catch (error) {
      console.error('Failed to start chat:', error);
      throw error;
    }
  }

  /**
   * Send a message in a chat
   * Based on mobile app chat_send API call
   */
  async sendMessage(request: ChatSendMessageRequest): Promise<ApiResponse<ChatMessage>> {
    try {
      const response = await http_post('chat-send', {
        chat_head_id: request.chat_head_id,
        sender_id: request.sender_id,
        receiver_id: request.receiver_id,
        body: request.body,
        type: request.type || 'text'
      });

      return response;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Mark chat messages as read
   * Based on mobile app chat_mark_as_read API call
   */
  async markAsRead(request: ChatMarkAsReadRequest): Promise<ApiResponse<void>> {
    try {
      const response = await http_post('chat-mark-as-read', {
        chat_head_id: request.chat_head_id,
        user_id: request.user_id
      });

      return response;
    } catch (error) {
      console.error('Failed to mark as read:', error);
      throw error;
    }
  }

  /**
   * Get all chat heads (conversation list)
   * Based on mobile app chat_heads API call
   */
  async getChatHeads(): Promise<ApiResponse<ChatHead[]>> {
    try {
      const response = await http_get('chat-heads');
      return response;
    } catch (error) {
      console.error('Failed to get chat heads:', error);
      throw error;
    }
  }

  /**
   * Get messages for a specific chat head
   * Based on mobile app chat_messages API call
   */
  async getChatMessages(chatHeadId: string): Promise<ApiResponse<ChatMessage[]>> {
    try {
      const response = await http_get('chat-messages', { chat_head_id: chatHeadId });
      return response;
    } catch (error) {
      console.error('Failed to get chat messages:', error);
      throw error;
    }
  }

  /**
   * Delete a chat head
   * Based on mobile app chat_head_delete API call
   */
  async deleteChatHead(chatHeadId: string): Promise<ApiResponse<void>> {
    try {
      const response = await http_post('chat-head-delete', {
        chat_head_id: chatHeadId
      });

      return response;
    } catch (error) {
      console.error('Failed to delete chat head:', error);
      throw error;
    }
  }

  /**
   * Get image URL for display
   * Following the same pattern as mobile app Utils.getImageUrl
   */
  getImageUrl(filename: string | null | undefined): string {
    if (!filename || filename.trim() === '') {
      return '/assets/default-avatar.png'; // Default avatar fallback
    }
    return `${API_URL}/storage/images/${filename}`;
  }

  /**
   * Format time ago string
   * Following mobile app Utils.timeAgo pattern
   */
  timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  }

  /**
   * Get other user information from chat head
   * Following mobile app ChatHead.getOtherUser pattern
   */
  getOtherUser(chatHead: ChatHead, currentUserId: string): { id: string; name: string; photo: string } {
    if (currentUserId === chatHead.customer_id) {
      // Current user is customer, other user is product owner
      return {
        id: chatHead.product_owner_id,
        name: chatHead.product_owner_name,
        photo: chatHead.product_owner_photo,
      };
    } else {
      // Current user is product owner, other user is customer
      return {
        id: chatHead.customer_id,
        name: chatHead.customer_name,
        photo: chatHead.customer_photo,
      };
    }
  }

  /**
   * Calculate unread count for current user
   * Following mobile app ChatHead.myUnread pattern
   */
  getMyUnreadCount(chatHead: ChatHead, currentUserId: string): number {
    if (currentUserId === chatHead.product_owner_id) {
      return parseInt(chatHead.product_owner_unread_messages_count) || 0;
    } else {
      return parseInt(chatHead.customer_unread_messages_count) || 0;
    }
  }
}

export const chatService = new ChatService();
export default chatService;
