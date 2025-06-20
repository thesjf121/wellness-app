import React, { useState, useRef, useEffect } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string, replyToId?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  replyToMessage?: {
    id: string;
    content: string;
    senderName: string;
  };
  onCancelReply?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  placeholder = 'Type a message...',
  disabled = false,
  replyToMessage,
  onCancelReply
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-focus when replying
    if (replyToMessage && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyToMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), replyToMessage?.id);
      setMessage('');
      if (replyToMessage && onCancelReply) {
        onCancelReply();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';

    // Typing indicator logic (could be enhanced with real-time features)
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
    } else if (isTyping && e.target.value.length === 0) {
      setIsTyping(false);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setMessage(prev => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="space-y-2">
      {/* Reply Preview */}
      {replyToMessage && (
        <div className="bg-gray-50 border-l-4 border-blue-500 p-2 rounded">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-600">Replying to {replyToMessage.senderName}</div>
              <div className="text-sm text-gray-800 truncate max-w-md">
                {replyToMessage.content}
              </div>
            </div>
            {onCancelReply && (
              <button
                onClick={onCancelReply}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            style={{ minHeight: '40px', maxHeight: '120px' }}
            rows={1}
          />
          
          {/* Character count for long messages */}
          {message.length > 200 && (
            <div className="absolute bottom-1 right-2 text-xs text-gray-400">
              {message.length}/500
            </div>
          )}
        </div>

        {/* Quick Emoji Reactions */}
        <div className="flex space-x-1">
          {['😊', '👍', '❤️', '🎉', '😄'].map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmojiClick(emoji)}
              className="text-lg hover:bg-gray-100 rounded p-1 transition-colors"
              title={`Add ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
          title="Send message (Enter)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </div>
      )}

      {/* Message Guidelines */}
      {message.length === 0 && (
        <div className="text-xs text-gray-400">
          Share updates, ask questions, or celebrate achievements with your group!
        </div>
      )}
    </div>
  );
};

export default MessageInput;