// Group messaging service for team communication

import { GroupMessage, MessageReaction, GROUP_STORAGE_KEYS } from '../types/groups';
import { errorService } from './errorService';
import { groupService } from './groupService';
import { groupNotificationService } from './groupNotificationService';

interface MessageNotification {
  id: string;
  recipientUserId: string;
  senderId: string;
  groupId: string;
  messageId: string;
  type: 'new_message' | 'mention' | 'reply';
  isRead: boolean;
  createdAt: Date;
}

class GroupMessagingService {
  private readonly STORAGE_KEY = GROUP_STORAGE_KEYS.GROUP_MESSAGES;
  private readonly NOTIFICATIONS_KEY = 'wellness_message_notifications';

  /**
   * Send a message to a group
   */
  async sendMessage(
    groupId: string,
    senderId: string,
    content: string,
    messageType: GroupMessage['messageType'] = 'text',
    replyToId?: string
  ): Promise<GroupMessage> {
    try {
      // Verify user is member of group
      const members = await groupService.getGroupMembers(groupId);
      const isMember = members.some(m => m.userId === senderId);
      if (!isMember) {
        throw new Error('User is not a member of this group');
      }

      // Create message
      const message: GroupMessage = {
        id: this.generateId('msg'),
        groupId,
        senderId,
        content: content.trim(),
        messageType,
        replyToId,
        createdAt: new Date(),
        reactions: []
      };

      // Save message
      await this.saveMessage(message);

      // Create notifications for other group members
      await this.createMessageNotifications(message, members);

      // Send group notifications for new messages (excluding system messages)
      if (senderId !== 'system' && messageType === 'text') {
        const preview = content.length > 50 ? content.substring(0, 50) + '...' : content;
        await groupNotificationService.notifyNewMessage(groupId, senderId, preview);
      }

      // Log system activity if it's an achievement share
      if (messageType === 'achievement_share') {
        // This would integrate with the activity feed
      }

      errorService.logInfo('Message sent', {
        messageId: message.id,
        groupId,
        senderId,
        messageType
      });

      return message;
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupMessagingService.sendMessage',
        groupId,
        senderId
      });
      throw error;
    }
  }

  /**
   * Get messages for a group with pagination
   */
  async getGroupMessages(
    groupId: string, 
    userId: string, 
    limit: number = 50, 
    before?: string
  ): Promise<{
    messages: GroupMessage[];
    hasMore: boolean;
    oldestMessageId?: string;
  }> {
    try {
      // Verify user is member of group
      const members = await groupService.getGroupMembers(groupId);
      const isMember = members.some(m => m.userId === userId);
      if (!isMember) {
        throw new Error('User is not a member of this group');
      }

      const allMessages = this.loadMessages();
      let groupMessages = allMessages
        .filter(msg => msg.groupId === groupId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Apply pagination
      let startIndex = 0;
      if (before) {
        const beforeIndex = groupMessages.findIndex(msg => msg.id === before);
        if (beforeIndex > -1) {
          startIndex = beforeIndex + 1;
        }
      }

      const paginatedMessages = groupMessages.slice(startIndex, startIndex + limit);
      const hasMore = startIndex + limit < groupMessages.length;
      const oldestMessageId = paginatedMessages.length > 0 
        ? paginatedMessages[paginatedMessages.length - 1].id 
        : undefined;

      return {
        messages: paginatedMessages.reverse(), // Return in chronological order
        hasMore,
        oldestMessageId
      };
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupMessagingService.getGroupMessages',
        groupId,
        userId
      });
      return { messages: [], hasMore: false };
    }
  }

  /**
   * Add a reaction to a message
   */
  async addReaction(
    messageId: string, 
    userId: string, 
    emoji: string
  ): Promise<void> {
    try {
      const messages = this.loadMessages();
      const messageIndex = messages.findIndex(msg => msg.id === messageId);
      
      if (messageIndex === -1) {
        throw new Error('Message not found');
      }

      const message = messages[messageIndex];
      
      // Verify user is member of the group
      const members = await groupService.getGroupMembers(message.groupId);
      const isMember = members.some(m => m.userId === userId);
      if (!isMember) {
        throw new Error('User is not a member of this group');
      }

      // Check if user already reacted with this emoji
      const existingReaction = message.reactions.find(
        r => r.userId === userId && r.emoji === emoji
      );

      if (existingReaction) {
        // Remove existing reaction
        message.reactions = message.reactions.filter(r => r.id !== existingReaction.id);
      } else {
        // Add new reaction
        const reaction: MessageReaction = {
          id: this.generateId('reaction'),
          messageId,
          userId,
          emoji,
          createdAt: new Date()
        };
        message.reactions.push(reaction);
      }

      messages[messageIndex] = message;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(messages));

      errorService.logInfo('Message reaction updated', {
        messageId,
        userId,
        emoji,
        action: existingReaction ? 'removed' : 'added'
      });
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupMessagingService.addReaction',
        messageId,
        userId
      });
      throw error;
    }
  }

  /**
   * Edit a message (sender only)
   */
  async editMessage(
    messageId: string, 
    userId: string, 
    newContent: string
  ): Promise<GroupMessage> {
    try {
      const messages = this.loadMessages();
      const messageIndex = messages.findIndex(msg => msg.id === messageId);
      
      if (messageIndex === -1) {
        throw new Error('Message not found');
      }

      const message = messages[messageIndex];
      
      if (message.senderId !== userId) {
        throw new Error('Only the sender can edit this message');
      }

      if (message.messageType !== 'text') {
        throw new Error('Only text messages can be edited');
      }

      // Update message
      message.content = newContent.trim();
      message.editedAt = new Date();

      messages[messageIndex] = message;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(messages));

      errorService.logInfo('Message edited', {
        messageId,
        userId
      });

      return message;
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupMessagingService.editMessage',
        messageId,
        userId
      });
      throw error;
    }
  }

  /**
   * Delete a message (sender or group sponsor only)
   */
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    try {
      const messages = this.loadMessages();
      const messageIndex = messages.findIndex(msg => msg.id === messageId);
      
      if (messageIndex === -1) {
        throw new Error('Message not found');
      }

      const message = messages[messageIndex];
      
      // Check if user can delete (sender or group sponsor)
      const members = await groupService.getGroupMembers(message.groupId);
      const userMember = members.find(m => m.userId === userId);
      const canDelete = message.senderId === userId || userMember?.role === 'sponsor';
      
      if (!canDelete) {
        throw new Error('You can only delete your own messages');
      }

      // Remove message
      messages.splice(messageIndex, 1);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(messages));

      // Also remove any replies to this message
      const updatedMessages = messages.filter(msg => msg.replyToId !== messageId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedMessages));

      errorService.logInfo('Message deleted', {
        messageId,
        userId,
        deletedBy: message.senderId === userId ? 'sender' : 'sponsor'
      });
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupMessagingService.deleteMessage',
        messageId,
        userId
      });
      throw error;
    }
  }

  /**
   * Get unread message count for a user across all groups
   */
  async getUnreadMessageCount(userId: string): Promise<{
    total: number;
    byGroup: Record<string, number>;
  }> {
    try {
      const notifications = this.loadNotifications();
      const unreadNotifications = notifications.filter(
        n => n.recipientUserId === userId && !n.isRead
      );

      const byGroup: Record<string, number> = {};
      for (const notification of unreadNotifications) {
        byGroup[notification.groupId] = (byGroup[notification.groupId] || 0) + 1;
      }

      return {
        total: unreadNotifications.length,
        byGroup
      };
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupMessagingService.getUnreadMessageCount',
        userId
      });
      return { total: 0, byGroup: {} };
    }
  }

  /**
   * Mark messages as read for a user in a specific group
   */
  async markMessagesAsRead(userId: string, groupId: string): Promise<void> {
    try {
      const notifications = this.loadNotifications();
      let hasChanges = false;

      for (const notification of notifications) {
        if (notification.recipientUserId === userId && 
            notification.groupId === groupId && 
            !notification.isRead) {
          notification.isRead = true;
          hasChanges = true;
        }
      }

      if (hasChanges) {
        localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications));
      }
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupMessagingService.markMessagesAsRead',
        userId,
        groupId
      });
    }
  }

  /**
   * Send system notification message
   */
  async sendSystemNotification(
    groupId: string,
    content: string,
    metadata?: any
  ): Promise<void> {
    try {
      const systemMessage: GroupMessage = {
        id: this.generateId('sys_msg'),
        groupId,
        senderId: 'system',
        content,
        messageType: 'system_notification',
        createdAt: new Date(),
        reactions: []
      };

      await this.saveMessage(systemMessage);

      errorService.logInfo('System notification sent', {
        groupId,
        content
      });
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupMessagingService.sendSystemNotification',
        groupId
      });
    }
  }

  // Private helper methods

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async saveMessage(message: GroupMessage): Promise<void> {
    let messages = this.loadMessages();
    messages.push(message);
    
    // Keep only last 1000 messages per group for performance
    const groupMessages = messages.filter(m => m.groupId === message.groupId);
    if (groupMessages.length > 1000) {
      const messagesToKeep = messages.filter(m => m.groupId !== message.groupId);
      const recentGroupMessages = groupMessages
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 1000);
      messages = [...messagesToKeep, ...recentGroupMessages];
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(messages));
  }

  private loadMessages(): GroupMessage[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async createMessageNotifications(
    message: GroupMessage, 
    members: any[]
  ): Promise<void> {
    try {
      const notifications = this.loadNotifications();
      
      // Create notifications for all members except the sender
      for (const member of members) {
        if (member.userId !== message.senderId) {
          const notification: MessageNotification = {
            id: this.generateId('notif'),
            recipientUserId: member.userId,
            senderId: message.senderId,
            groupId: message.groupId,
            messageId: message.id,
            type: message.replyToId ? 'reply' : 'new_message',
            isRead: false,
            createdAt: new Date()
          };
          notifications.push(notification);
        }
      }

      // Keep only last 500 notifications per user for performance
      const cleanedNotifications = notifications
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 2000); // Total limit across all users

      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(cleanedNotifications));
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupMessagingService.createMessageNotifications',
        messageId: message.id
      });
    }
  }

  private loadNotifications(): MessageNotification[] {
    try {
      const stored = localStorage.getItem(this.NOTIFICATIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

export const groupMessagingService = new GroupMessagingService();
export default groupMessagingService;