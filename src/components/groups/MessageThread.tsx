import React, { useState } from 'react';
import { GroupMessage, MessageReaction } from '../../types/groups';

interface MessageThreadProps {
  message: GroupMessage;
  currentUserId: string;
  memberName: string;
  memberRole: string;
  onReaction: (messageId: string, emoji: string) => void;
  onEdit: (messageId: string, newContent: string) => void;
  onDelete: (messageId: string) => void;
  onReply: (content: string) => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  message,
  currentUserId,
  memberName,
  memberRole,
  onReaction,
  onEdit,
  onDelete,
  onReply
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const isOwnMessage = message.senderId === currentUserId;
  const isSystemMessage = message.messageType === 'system_notification';
  const canEdit = isOwnMessage && message.messageType === 'text';
  const canDelete = isOwnMessage || memberRole === 'sponsor';

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(replyContent.trim());
      setReplyContent('');
      setShowReplyInput(false);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'sponsor':
        return 'text-purple-600';
      case 'super_admin':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'sponsor':
        return '👑';
      case 'super_admin':
        return '⭐';
      default:
        return '';
    }
  };

  const groupReactionsByEmoji = (reactions: MessageReaction[]) => {
    const grouped = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push(reaction);
      return acc;
    }, {} as Record<string, MessageReaction[]>);

    return Object.entries(grouped).map(([emoji, reactionList]) => ({
      emoji,
      count: reactionList.length,
      users: reactionList.map(r => r.userId),
      hasCurrentUser: reactionList.some(r => r.userId === currentUserId)
    }));
  };

  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-100 text-gray-600 text-sm px-3 py-2 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex space-x-3 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
        isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'
      }`}>
        {memberName.charAt(0).toUpperCase()}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-xs ${isOwnMessage ? 'text-right' : ''}`}>
        {/* Sender Info */}
        <div className={`flex items-center space-x-2 mb-1 ${isOwnMessage ? 'justify-end' : ''}`}>
          <span className={`text-sm font-medium ${getRoleColor(memberRole)}`}>
            {getRoleIcon(memberRole)} {memberName}
            {isOwnMessage && <span className="text-gray-500 ml-1">(You)</span>}
          </span>
          <span className="text-xs text-gray-500">
            {formatDate(message.createdAt)} at {formatTime(message.createdAt)}
          </span>
        </div>

        {/* Message Bubble */}
        <div className={`relative rounded-lg px-3 py-2 ${
          isOwnMessage 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          {/* Message Content */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-white text-gray-900 border border-gray-300 rounded px-2 py-1 text-sm resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleEdit}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {message.editedAt && (
                <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'}`}>
                  (edited)
                </p>
              )}
            </>
          )}

          {/* Reply indicator */}
          {message.replyToId && (
            <div className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'}`}>
              <span className="bg-gray-600 bg-opacity-20 px-1 rounded">↳ Reply</span>
            </div>
          )}
        </div>

        {/* Reactions */}
        {message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {groupReactionsByEmoji(message.reactions).map(({ emoji, count, hasCurrentUser }) => (
              <button
                key={emoji}
                onClick={() => onReaction(message.id, emoji)}
                className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                  hasCurrentUser
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {emoji} {count}
              </button>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {showActions && !isEditing && (
          <div className={`flex items-center space-x-2 mt-2 ${isOwnMessage ? 'justify-end' : ''}`}>
            {/* Quick Reactions */}
            <div className="flex space-x-1">
              {['👏', '🎉', '💪', '❤️'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onReaction(message.id, emoji)}
                  className="text-lg hover:bg-gray-200 rounded px-1 transition-colors"
                  title={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Message Actions */}
            <div className="flex space-x-1">
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
              >
                Reply
              </button>
              
              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                >
                  Edit
                </button>
              )}
              
              {canDelete && (
                <button
                  onClick={() => onDelete(message.id)}
                  className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-100"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        )}

        {/* Reply Input */}
        {showReplyInput && (
          <div className="mt-3 space-y-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Reply to ${memberName}...`}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleReply}
                disabled={!replyContent.trim()}
                className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded"
              >
                Send
              </button>
              <button
                onClick={() => {
                  setShowReplyInput(false);
                  setReplyContent('');
                }}
                className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageThread;