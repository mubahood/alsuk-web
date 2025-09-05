// src/app/pages/ChatPage/components/ChatListItem.tsx
// Individual chat list item component following mobile app _ChatListItem patterns

import React from 'react';
import { User } from 'lucide-react';
import { ChatHead } from '../../../types/chat';
import chatService from '../../../services/chatService';

interface ChatListItemProps {
  chatHead: ChatHead;
  currentUserId: string;
  onClick: () => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({
  chatHead,
  currentUserId,
  onClick,
}) => {
  // Get other user information
  const otherUser = chatService.getOtherUser(chatHead, currentUserId);
  const unreadCount = chatService.getMyUnreadCount(chatHead, currentUserId);
  const isUnread = unreadCount > 0;

  // Build default avatar when no photo available
  const buildDefaultAvatar = () => (
    <div className="chat-item-default-avatar">
      <User size={32} />
    </div>
  );

  // Build user avatar
  const buildAvatar = () => (
    <div className="chat-item-avatar">
      {otherUser.photo && otherUser.photo.trim() !== '' ? (
        <img
          src={chatService.getImageUrl(otherUser.photo)}
          alt={otherUser.name}
          onError={(e) => {
            // Replace with default avatar on error
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="chat-item-default-avatar">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              `;
            }
          }}
        />
      ) : (
        buildDefaultAvatar()
      )}
    </div>
  );

  return (
    <div
      className={`chat-list-item ${isUnread ? 'unread' : ''}`}
      onClick={onClick}
    >
      <div className="chat-item-content">
        {/* Avatar */}
        {buildAvatar()}

        {/* Content */}
        <div className="chat-item-details">
          <div className="chat-item-header">
            {/* Unread indicator dot */}
            {isUnread && <div className="chat-item-unread-dot" />}
            
            {/* User name */}
            <h3 className={`chat-item-name ${isUnread ? 'unread' : ''}`}>
              {otherUser.name}
            </h3>
            
            {/* Timestamp */}
            <span className={`chat-item-time ${isUnread ? 'unread' : ''}`}>
              {chatService.timeAgo(chatHead.last_message_time)}
            </span>
          </div>

          {/* Last message */}
          <p className={`chat-item-message ${isUnread ? 'unread' : ''}`}>
            {chatHead.last_message_body || 'No messages yet'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;
