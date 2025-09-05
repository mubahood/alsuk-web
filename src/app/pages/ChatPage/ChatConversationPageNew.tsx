// src/app/pages/ChatPage/ChatConversationPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { chatService } from '../../services/chatService';
import { ChatHead, ChatMessage } from '../../types/chat';
import { Spinner } from 'react-bootstrap';
import ToastService from '../../services/ToastService';

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

  useEffect(() => {
    if (chatHeadId && currentUser?.id) {
      loadChatData();
    }
  }, [chatHeadId, currentUser]);

  const loadChatData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load chat head details and messages
      const [headResponse, messagesResponse] = await Promise.all([
        chatService.getChatHeads(),
        chatService.getChatMessages(chatHeadId!)
      ]);

      // Find the specific chat head
      if (headResponse?.data) {
        const foundHead = headResponse.data.find((h: ChatHead) => h.id.toString() === chatHeadId);
        if (foundHead) {
          setChatHead(foundHead);
        }
      }

      // Set messages
      if (messagesResponse?.data) {
        setMessages(messagesResponse.data);
        scrollToBottom();
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending || !chatHead || !currentUser?.id) return;

    try {
      setSending(true);
      
      const receiverId = currentUser.id.toString() === chatHead.customer_id 
        ? chatHead.product_owner_id 
        : chatHead.customer_id;

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
        setMessages(messagesResponse.data);
        scrollToBottom();
      }
      
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

  if (loading) {
    return (
      <div className="account-page-container">
        <div className="chat-conversation-container">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <Spinner animation="border" variant="primary" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !chatHead) {
    return (
      <div className="account-page-container">
        <div className="chat-conversation-container">
          <div className="chat-conversation-header">
            <button onClick={() => navigate('/account/chat')} className="chat-back-button">
              <i className="bi-arrow-left"></i>
            </button>
            <div className="chat-header-info">
              <h3 className="chat-header-name">Error</h3>
            </div>
          </div>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '300px',
            textAlign: 'center',
            padding: '20px'
          }}>
            <i className="bi-exclamation-triangle" style={{ fontSize: '48px', color: 'var(--danger-color)', marginBottom: '16px' }}></i>
            <h4 style={{ color: 'var(--text-dark)', marginBottom: '8px' }}>Unable to Load Conversation</h4>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>{error || 'Conversation not found'}</p>
            <button 
              onClick={() => navigate('/account/chat')}
              className="dashboard-card"
              style={{ 
                background: 'var(--primary-color)', 
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                margin: '0',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <i className="bi-arrow-left" style={{ marginRight: '8px' }}></i>
              Back to Messages
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page-container">
      <div className="chat-conversation-container">
        {/* Chat Header */}
        <div className="chat-conversation-header">
          <button onClick={() => navigate('/account/chat')} className="chat-back-button">
            <i className="bi-arrow-left"></i>
          </button>
          <div className="chat-header-info">
            <h3 className="chat-header-name">{getOtherUserName()}</h3>
            <p className="chat-header-status">
              {chatHead.product_name ? `About: ${chatHead.product_name}` : 'Conversation'}
            </p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="chat-messages-container">
          {messages.length > 0 ? (
            messages.map((message) => {
              const isSent = message.sender_id === currentUser?.id?.toString();
              return (
                <div
                  key={message.id}
                  className={`message-bubble ${isSent ? 'sent' : 'received'}`}
                >
                  <div className="message-content">
                    {message.body}
                  </div>
                  <div className="message-time">
                    {new Date(message.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="chat-messages-empty">
              <i className="bi-chat-dots"></i>
              <h4>Start the Conversation</h4>
              <p>Send a message to begin chatting with {getOtherUserName()}</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-container">
          <div className="chat-input-form">
            <div className="chat-input-wrapper">
              <textarea
                className="chat-input"
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sending}
                rows={1}
              />
            </div>
            <button
              className="chat-send-button"
              onClick={handleSendMessage}
              disabled={!messageText.trim() || sending}
            >
              {sending ? (
                <Spinner size="sm" animation="border" />
              ) : (
                <i className="bi-send"></i>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatConversationPage;
