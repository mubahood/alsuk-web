// src/app/pages/ChatPage/ChatListPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { chatService } from '../../services/chatService';
import { ChatHead } from '../../types/chat';
import ToastService from '../../services/ToastService';
import './ChatListPage.css';

const ChatListPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  const [chatHeads, setChatHeads] = useState<ChatHead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.id) {
      loadChatHeads();
    }
  }, [currentUser]);

  const loadChatHeads = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading chat heads for user:', currentUser?.id);
      
      const response = await chatService.getChatHeads();
      console.log('📦 Chat heads response:', response);
      console.log('📊 Response data:', response?.data);
      console.log('📈 Data length:', response?.data?.length);
      
      if (response?.data) {
        // Sort by last message time (most recent first)
        const sortedChatHeads = response.data.sort((a: ChatHead, b: ChatHead) => {
          const timeA = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
          const timeB = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
          return timeB - timeA;
        });
        
        setChatHeads(sortedChatHeads);
        console.log('✅ Sorted chat heads:', sortedChatHeads);
        console.log('🎯 Final chat heads count:', sortedChatHeads.length);
      } else {
        console.log('⚠️ No data in response, setting empty array');
        setChatHeads([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load conversations';
      setError(errorMessage);
      ToastService.error('Failed to load conversations');
      console.error('❌ Error loading chat heads:', error);
    } finally {
      setLoading(false);
      console.log('🏁 Chat loading finished');
    }
  };

  const handleChatClick = (chatHead: ChatHead) => {
    navigate(`/account/chat/${chatHead.id}`);
  };

  const getOtherUserName = (chatHead: ChatHead): string => {
    if (!currentUser?.id) return 'Unknown User';
    
    const currentUserId = currentUser.id.toString();
    if (currentUserId === chatHead.customer_id) {
      return chatHead.product_owner_name || 'Unknown User';
    } else {
      return chatHead.customer_name || 'Unknown User';
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const formatLastMessageTime = (timestamp: string): string => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return messageDate.toLocaleDateString();
  };

  return (
    <div className="chat-list-page">
      {/* Simple Header */}
      <div className="chat-list-header">
        <h1 className="chat-list-title">Messages</h1>
        <button 
          onClick={loadChatHeads} 
          className="chat-refresh-btn"
          disabled={loading}
        >
          <i className="bi-arrow-clockwise"></i>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="chat-error-banner">
          <span>{error}</span>
          <button onClick={loadChatHeads} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Chat List */}
      <div className="chat-list-container">
        {loading ? (
          <div className="chat-loading">
            <div className="spinner-border" role="status"></div>
            <p>Loading conversations...</p>
          </div>
        ) : chatHeads.length === 0 ? (
          <div className="chat-empty">
            <i className="bi-chat-heart"></i>
            <p>No conversations yet</p>
            <span>Start chatting with sellers!</span>
          </div>
        ) : (
          <div className="chat-conversations">
            {chatHeads.map((chatHead) => {
              const otherUserName = getOtherUserName(chatHead);
              const initials = getInitials(otherUserName);
              
              return (
                <div
                  key={chatHead.id}
                  className="chat-item"
                  onClick={() => handleChatClick(chatHead)}
                >
                  <div className="chat-avatar">
                    {initials}
                  </div>
                  
                  <div className="chat-content">
                    <div className="chat-header">
                      <h3 className="chat-name">{otherUserName}</h3>
                      {chatHead.last_message_time && (
                        <span className="chat-time">
                          {formatLastMessageTime(chatHead.last_message_time)}
                        </span>
                      )}
                    </div>
                    
                    {chatHead.product_name && (
                      <div className="chat-product">
                        <i className="bi-box-seam"></i>
                        <span>{chatHead.product_name}</span>
                      </div>
                    )}
                    
                    <div className="chat-last-message">
                      {chatHead.last_message_body || 'Start the conversation'}
                    </div>
                  </div>
                  
                  <div className="chat-arrow">
                    <i className="bi-chevron-right"></i>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatListPage;
