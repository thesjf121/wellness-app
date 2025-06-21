import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { groupMessagingService } from '../../services/groupMessagingService';
import { groupService } from '../../services/groupService';
import { GroupMessage, GroupMember } from '../../types/groups';
import { MessageInput } from './MessageInput';
import { MessageThread } from './MessageThread';

interface GroupChatProps {
  groupId: string;
}

export const GroupChat: React.FC<GroupChatProps> = ({ groupId }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oldestMessageId, setOldestMessageId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInitialData();
  }, [groupId, user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Mark messages as read when chat is viewed
    if (user && messages.length > 0) {
      groupMessagingService.markMessagesAsRead(user.id, groupId);
    }
  }, [messages, user, groupId]);

  useEffect(() => {
    // Auto-scroll to bottom for new messages
    scrollToBottom();
  }, [messages]);

  const loadInitialData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load group members for name mapping
      const groupMembers = await groupService.getGroupMembers(groupId);
      setMembers(groupMembers);

      // Load recent messages
      const messageData = await groupMessagingService.getGroupMessages(groupId, user.id, 50);
      setMessages(messageData.messages);
      setHasMore(messageData.hasMore);
      setOldestMessageId(messageData.oldestMessageId);

      setError(null);
    } catch (error) {
      console.error('Failed to load chat data:', error);
      setError('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!user || loadingMore || !hasMore || !oldestMessageId) return;

    setLoadingMore(true);
    try {
      const messageData = await groupMessagingService.getGroupMessages(
        groupId, 
        user.id, 
        30, 
        oldestMessageId
      );

      setMessages(prev => [...messageData.messages, ...prev]);
      setHasMore(messageData.hasMore);
      setOldestMessageId(messageData.oldestMessageId);
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSendMessage = async (content: string, replyToId?: string) => {
    if (!user) return;

    try {
      const newMessage = await groupMessagingService.sendMessage(
        groupId,
        user.id,
        content,
        'text',
        replyToId
      );

      // Add message to state immediately for better UX
      setMessages(prev => [...prev, newMessage]);
      setError(null);
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      await groupMessagingService.addReaction(messageId, user.id, emoji);
      
      // Update the message in state
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions.find(r => r.userId === user.id && r.emoji === emoji);
          if (existingReaction) {
            // Remove reaction
            return {
              ...msg,
              reactions: msg.reactions.filter(r => r.id !== existingReaction.id)
            };
          } else {
            // Add reaction
            return {
              ...msg,
              reactions: [
                ...msg.reactions,
                {
                  id: `reaction_${Date.now()}`,
                  messageId,
                  userId: user.id,
                  emoji,
                  createdAt: new Date()
                }
              ]
            };
          }
        }
        return msg;
      }));
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!user) return;

    try {
      const updatedMessage = await groupMessagingService.editMessage(messageId, user.id, newContent);
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? updatedMessage : msg
      ));
    } catch (error) {
      console.error('Failed to edit message:', error);
      setError('Failed to edit message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!user) return;

    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await groupMessagingService.deleteMessage(messageId, user.id);
        
        // Remove message from state
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
      } catch (error) {
        console.error('Failed to delete message:', error);
        setError('Failed to delete message');
      }
    }
  };

  const handleRefresh = () => {
    loadInitialData();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getMemberName = (userId: string): string => {
    if (userId === 'system') return 'System';
    const member = members.find(m => m.userId === userId);
    return member ? `User ${userId.slice(-8)}` : 'Unknown User';
  };

  const getMemberRole = (userId: string): string => {
    const member = members.find(m => m.userId === userId);
    return member?.role || 'member';
  };

  if (loading) {
    return (
      <div className="flex flex-col h-96">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full max-w-md">
            <div className="flex space-x-3">
              <div className="rounded-full bg-gray-200 h-8 w-8"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="flex space-x-3">
              <div className="rounded-full bg-gray-200 h-8 w-8"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-96">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-sm mb-2">{error}</div>
            <button 
              onClick={handleRefresh}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 bg-white rounded-lg border">
      {/* Chat Header */}
      <div className="border-b border-gray-200 px-4 py-3 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Group Chat</h3>
            <p className="text-sm text-gray-600">{members.length} members</p>
          </div>
          <button
            onClick={handleRefresh}
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
            title="Refresh messages"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ maxHeight: '300px' }}
      >
        {/* Load More Button */}
        {hasMore && (
          <div className="text-center">
            <button
              onClick={loadMoreMessages}
              disabled={loadingMore}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
            >
              {loadingMore ? 'Loading...' : 'Load older messages'}
            </button>
          </div>
        )}

        {/* Messages */}
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">💬</div>
            <p className="text-gray-500 text-sm">No messages yet</p>
            <p className="text-gray-400 text-xs mt-1">Be the first to start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageThread
                key={message.id}
                message={message}
                currentUserId={user?.id || ''}
                memberName={getMemberName(message.senderId)}
                memberRole={getMemberRole(message.senderId)}
                onReaction={handleReaction}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
                onReply={(content) => handleSendMessage(content, message.id)}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <MessageInput
          onSendMessage={handleSendMessage}
          placeholder="Type a message..."
          disabled={!user}
        />
      </div>
    </div>
  );
};

export default GroupChat;