// src/app/pages/ChatPage/ChatConversationPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { chatService } from '../../services/chatService';
import { ChatHead, ChatMessage } from '../../types/chat';
import ToastService from '../../services/ToastService';
import './ChatConversationPage.css';

const ChatConversationPage: React.FC = () => {
  const { chatHeadId } = useParams<{ chatHeadId: string }>();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  const [chatHead, setChatHead] = useState<ChatHead | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatHeadId && currentUser?.id) {
      loadChatData();
    }
  }, [chatHeadId, currentUser]);

  const loadChatData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading chat data for ID:', chatHeadId);
      
      // Load chat head details and messages
      const [headResponse, messagesResponse] = await Promise.all([
        chatService.getChatHeads(),
        chatService.getChatMessages(chatHeadId!)
      ]);

      console.log('Chat head response:', headResponse);
      console.log('Messages response:', messagesResponse);

      // Find the specific chat head
      if (headResponse?.data) {
        const foundHead = headResponse.data.find((h: ChatHead) => h.id.toString() === chatHeadId);
        if (foundHead) {
          setChatHead(foundHead);
          console.log('Found chat head:', foundHead);
        } else {
          throw new Error('Conversation not found');
        }
      }

      // Set messages and sort them by creation time
      if (messagesResponse?.data) {
        const sortedMessages = messagesResponse.data.sort((a: ChatMessage, b: ChatMessage) => {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
        setMessages(sortedMessages);
        console.log('Sorted messages:', sortedMessages);
        
        // Scroll to bottom after setting messages
        setTimeout(() => scrollToBottom(), 100);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load conversation';
      setError(errorMessage);
      ToastService.error('Failed to load conversation');
      console.error('Error loading chat data:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending || !chatHead || !currentUser?.id) return;

    try {
      setSending(true);
      
      const receiverId = currentUser.id.toString() === chatHead.customer_id 
        ? chatHead.product_owner_id 
        : chatHead.customer_id;

      console.log('Sending message:', {
        chat_head_id: chatHead.id.toString(),
        sender_id: currentUser.id.toString(),
        receiver_id: receiverId,
        body: messageText.trim()
      });

      await chatService.sendMessage({
        chat_head_id: chatHead.id.toString(),
        sender_id: currentUser.id.toString(),
        receiver_id: receiverId,
        body: messageText.trim()
      });

      setMessageText('');
      
      // Reload messages to show the new one
      const messagesResponse = await chatService.getChatMessages(chatHeadId!);
      if (messagesResponse?.data) {
        const sortedMessages = messagesResponse.data.sort((a: ChatMessage, b: ChatMessage) => {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
        setMessages(sortedMessages);
        setTimeout(() => scrollToBottom(), 100);
      }
      
      ToastService.success('Message sent');
      
    } catch (error) {
      console.error('Error sending message:', error);
      ToastService.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getOtherUserName = (): string => {
    if (!chatHead || !currentUser?.id) return 'Unknown User';
    
    const currentUserId = currentUser.id.toString();
    if (currentUserId === chatHead.customer_id) {
      return chatHead.product_owner_name || 'Unknown User';
    } else {
      return chatHead.customer_name || 'Unknown User';
    }
  };

  const formatMessageTime = (timestamp: string): string => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const isToday = messageDate.toDateString() === now.toDateString();
    const isYesterday = messageDate.toDateString() === new Date(now.getTime() - 86400000).toDateString();
    
    if (isToday) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (isYesterday) {
      return `Yesterday ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return messageDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="chat-conversation-page">
        <div className="chat-header">
          <button onClick={() => navigate('/account/chat')} className="chat-back-btn">
            <i className="bi-arrow-left"></i>
          </button>
          <div className="chat-header-info">
            <h3 className="chat-user-name">Loading...</h3>
          </div>
        </div>
        <div className="chat-loading">
          <div className="spinner-border text-primary" role="status"></div>
          <p>Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error || !chatHead) {
    return (
      <div className="chat-conversation-page">
        <div className="chat-header">
          <button onClick={() => navigate('/account/chat')} className="chat-back-btn">
            <i className="bi-arrow-left"></i>
          </button>
          <div className="chat-header-info">
            <h3 className="chat-user-name">Error</h3>
          </div>
        </div>
        <div className="chat-error">
          <i className="bi-exclamation-triangle"></i>
          <p>{error || 'Conversation not found'}</p>
          <button onClick={() => navigate('/account/chat')} className="btn btn-primary">
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-conversation-page">
      {/* Simple Header */}
      <div className="chat-header">
        <button 
          onClick={() => navigate('/account/chat')} 
          className="chat-back-btn"
        >
          <i className="bi-arrow-left"></i>
        </button>
        <div className="chat-header-info">
          <h3 className="chat-user-name">{getOtherUserName()}</h3>
          {chatHead.product_name && (
            <span className="chat-product-name">{chatHead.product_name}</span>
          )}
        </div>
        <button 
          onClick={loadChatData} 
          className="chat-refresh-btn"
          disabled={loading}
        >
          <i className="bi-arrow-clockwise"></i>
        </button>
      </div>

      {/* Messages Area */}
      <div 
        className="chat-messages-area"
        ref={messagesContainerRef}
      >
        {messages.length === 0 ? (
          <div className="chat-empty">
            <i className="bi-chat-heart"></i>
            <p>Start the conversation with {getOtherUserName()}</p>
          </div>
        ) : (
          <div className="chat-messages-list">
            {messages.map((message, index) => {
              const isSent = message.sender_id === currentUser?.id?.toString();
              const showTimestamp = index === 0 || 
                (new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime()) > 300000; // 5 minutes
              
              return (
                <div key={message.id} className="message-wrapper">
                  {showTimestamp && (
                    <div className="message-timestamp">
                      {formatMessageTime(message.created_at)}
                    </div>
                  )}
                  <div className={`message-bubble ${isSent ? 'sent' : 'received'}`}>
                    <div className="message-text">
                      {message.body}
                    </div>
                    <div className="message-time">
                      {new Date(message.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Simple Input */}
      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <textarea
            className="chat-input"
            placeholder={`Message ${getOtherUserName()}...`}
            value={messageText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={sending}
            rows={1}
          />
          <button
            className="chat-send-btn"
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sending}
          >
            {sending ? (
              <i className="bi-hourglass-split"></i>
            ) : (
              <i className="bi-send-fill"></i>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatConversationPage;
