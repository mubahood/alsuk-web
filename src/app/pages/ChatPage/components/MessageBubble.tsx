// src/app/pages/ChatPage/components/MessageBubble.tsx
// Message bubble component for individual messages with square corners design

import React from 'react';
import { ChatMessage } from '../../../types/chat';
import chatService from '../../../services/chatService';

interface MessageBubbleProps {
  message: ChatMessage;
  isMyMessage: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMyMessage }) => {
  // Format message time
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get message status display
  const getStatusDisplay = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓';
      default:
        return '';
    }
  };

  return (
    <div className={`message-bubble-container ${isMyMessage ? 'my-message' : 'other-message'}`}>
      <div className="message-bubble-wrapper">
        {/* Message bubble */}
        <div className={`message-bubble ${isMyMessage ? 'my-bubble' : 'other-bubble'}`}>
          {/* Message body */}
          <div className="message-body">
            {message.body}
          </div>
          
          {/* Message metadata */}
          <div className="message-metadata">
            <span className="message-time">
              {formatTime(message.created_at)}
            </span>
            {isMyMessage && (
              <span className="message-status">
                {getStatusDisplay(message.status)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
