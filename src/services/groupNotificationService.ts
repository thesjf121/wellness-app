// Group notification service for managing group-related notifications

import { GROUP_STORAGE_KEYS } from '../types/groups';
import { errorService } from './errorService';
import { groupService } from './groupService';

export interface GroupNotification {
  id: string;
  recipientUserId: string;
  groupId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any; // Additional context data
  isRead: boolean;
  isPersistent: boolean; // Whether notification should be kept after reading
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  expiresAt?: Date;
  actionUrl?: string; // Optional URL to navigate to when clicked
  actionLabel?: string; // Label for action button
}

export type NotificationType =
  | 'member_joined'
  | 'member_left'
  | 'member_removed'
  | 'new_message'
  | 'achievement_earned'
  | 'achievement_shared'
  | 'group_goal_reached'
  | 'milestone_reached'
  | 'training_completed'
  | 'sponsor_promoted'
  | 'ownership_transferred'
  | 'group_settings_updated'
  | 'invite_sent'
  | 'group_created'
  | 'group_deleted'
  | 'activity_reminder'
  | 'weekly_summary';

export interface NotificationPreferences {
  userId: string;
  groupId: string;
  enabledTypes: NotificationType[];
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
  };
  emailNotifications: boolean;
  pushNotifications: boolean;
  updatedAt: Date;
}

class GroupNotificationService {
  private readonly NOTIFICATIONS_KEY = 'wellness_group_notifications';
  private readonly PREFERENCES_KEY = 'wellness_notification_preferences';

  /**
   * Send a notification to a specific user
   */
  async sendNotification(
    recipientUserId: string,
    groupId: string,
    type: NotificationType,
    title: string,
    message: string,
    options: {
      data?: any;
      priority?: 'low' | 'medium' | 'high';
      isPersistent?: boolean;
      expiresInHours?: number;
      actionUrl?: string;
      actionLabel?: string;
    } = {}
  ): Promise<GroupNotification> {
    try {
      // Check if user wants this type of notification
      const preferences = await this.getUserPreferences(recipientUserId, groupId);
      if (!preferences.enabledTypes.includes(type)) {
        // User has disabled this notification type
        return null as any;
      }

      // Check quiet hours
      if (this.isQuietHours(preferences)) {
        // Skip non-urgent notifications during quiet hours
        if (options.priority !== 'high') {
          return null as any;
        }
      }

      const notification: GroupNotification = {
        id: this.generateId('notif'),
        recipientUserId,
        groupId,
        type,
        title,
        message,
        data: options.data,
        isRead: false,
        isPersistent: options.isPersistent || false,
        priority: options.priority || 'medium',
        createdAt: new Date(),
        expiresAt: options.expiresInHours 
          ? new Date(Date.now() + options.expiresInHours * 60 * 60 * 1000)
          : undefined,
        actionUrl: options.actionUrl,
        actionLabel: options.actionLabel
      };

      await this.saveNotification(notification);

      errorService.logInfo('Group notification sent', {
        notificationId: notification.id,
        recipientUserId,
        groupId,
        type
      });

      return notification;
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupNotificationService.sendNotification',
        recipientUserId,
        groupId,
        type
      });
      throw error;
    }
  }

  /**
   * Send notifications to multiple users
   */
  async sendBulkNotifications(
    recipientUserIds: string[],
    groupId: string,
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      data?: any;
      priority?: 'low' | 'medium' | 'high';
      isPersistent?: boolean;
      expiresInHours?: number;
      actionUrl?: string;
      actionLabel?: string;
    }
  ): Promise<GroupNotification[]> {
    const notifications: GroupNotification[] = [];
    
    for (const userId of recipientUserIds) {
      try {
        const notification = await this.sendNotification(
          userId, groupId, type, title, message, options
        );
        if (notification) {
          notifications.push(notification);
        }
      } catch (error) {
        errorService.logError(error as Error, {
          context: 'GroupNotificationService.sendBulkNotifications',
          userId,
          groupId,
          type
        });
      }
    }

    return notifications;
  }

  /**
   * Send notification to all group members
   */
  async sendGroupNotification(
    groupId: string,
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      excludeUserIds?: string[];
      data?: any;
      priority?: 'low' | 'medium' | 'high';
      isPersistent?: boolean;
      expiresInHours?: number;
      actionUrl?: string;
      actionLabel?: string;
    }
  ): Promise<GroupNotification[]> {
    try {
      const members = await groupService.getGroupMembers(groupId);
      const recipientIds = members
        .map(m => m.userId)
        .filter(userId => !options?.excludeUserIds?.includes(userId));

      return await this.sendBulkNotifications(
        recipientIds, groupId, type, title, message, options
      );
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupNotificationService.sendGroupNotification',
        groupId,
        type
      });
      return [];
    }
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(
    userId: string,
    groupId?: string,
    limit: number = 50,
    includeRead: boolean = true
  ): Promise<GroupNotification[]> {
    try {
      const allNotifications = this.loadNotifications();
      
      let userNotifications = allNotifications.filter(n => {
        if (n.recipientUserId !== userId) return false;
        if (groupId && n.groupId !== groupId) return false;
        if (!includeRead && n.isRead) return false;
        if (n.expiresAt && new Date(n.expiresAt) < new Date()) return false;
        return true;
      });

      // Sort by creation date (newest first)
      userNotifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return userNotifications.slice(0, limit);
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupNotificationService.getUserNotifications',
        userId,
        groupId
      });
      return [];
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string, groupId?: string): Promise<{
    total: number;
    byGroup: Record<string, number>;
    byType: Record<NotificationType, number>;
  }> {
    try {
      const notifications = await this.getUserNotifications(userId, groupId, 1000, false);
      
      const byGroup: Record<string, number> = {};
      const byType: Record<NotificationType, number> = {
        member_joined: 0,
        member_left: 0,
        member_removed: 0,
        new_message: 0,
        achievement_earned: 0,
        achievement_shared: 0,
        group_goal_reached: 0,
        milestone_reached: 0,
        training_completed: 0,
        sponsor_promoted: 0,
        ownership_transferred: 0,
        group_settings_updated: 0,
        invite_sent: 0,
        group_created: 0,
        group_deleted: 0,
        activity_reminder: 0,
        weekly_summary: 0
      };
      
      for (const notification of notifications) {
        byGroup[notification.groupId] = (byGroup[notification.groupId] || 0) + 1;
        byType[notification.type] = (byType[notification.type] || 0) + 1;
      }

      return {
        total: notifications.length,
        byGroup,
        byType
      };
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupNotificationService.getUnreadCount',
        userId,
        groupId
      });
      return { total: 0, byGroup: {}, byType: {} as any };
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      const notifications = this.loadNotifications();
      const index = notifications.findIndex(n => 
        n.id === notificationId && n.recipientUserId === userId
      );

      if (index >= 0) {
        notifications[index].isRead = true;
        localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications));
      }
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupNotificationService.markAsRead',
        notificationId,
        userId
      });
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string, groupId?: string): Promise<void> {
    try {
      const notifications = this.loadNotifications();
      let hasChanges = false;

      for (const notification of notifications) {
        if (notification.recipientUserId === userId && 
            (!groupId || notification.groupId === groupId) &&
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
        context: 'GroupNotificationService.markAllAsRead',
        userId,
        groupId
      });
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      const notifications = this.loadNotifications();
      const filteredNotifications = notifications.filter(n => 
        !(n.id === notificationId && n.recipientUserId === userId)
      );
      
      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(filteredNotifications));
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupNotificationService.deleteNotification',
        notificationId,
        userId
      });
    }
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId: string, groupId: string): Promise<NotificationPreferences> {
    try {
      const allPreferences = this.loadPreferences();
      const existing = allPreferences.find(p => 
        p.userId === userId && p.groupId === groupId
      );

      if (existing) {
        return existing;
      }

      // Create default preferences
      const defaultPreferences: NotificationPreferences = {
        userId,
        groupId,
        enabledTypes: [
          'member_joined',
          'member_left',
          'achievement_earned',
          'achievement_shared',
          'group_goal_reached',
          'milestone_reached',
          'sponsor_promoted',
          'ownership_transferred',
          'weekly_summary'
        ],
        quietHours: {
          enabled: false,
          startTime: '22:00',
          endTime: '08:00'
        },
        emailNotifications: true,
        pushNotifications: true,
        updatedAt: new Date()
      };

      await this.savePreferences(defaultPreferences);
      return defaultPreferences;
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupNotificationService.getUserPreferences',
        userId,
        groupId
      });
      throw error;
    }
  }

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(
    userId: string,
    groupId: string,
    updates: Partial<Omit<NotificationPreferences, 'userId' | 'groupId' | 'updatedAt'>>
  ): Promise<NotificationPreferences> {
    try {
      const current = await this.getUserPreferences(userId, groupId);
      const updated: NotificationPreferences = {
        ...current,
        ...updates,
        updatedAt: new Date()
      };

      await this.savePreferences(updated);
      return updated;
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupNotificationService.updateUserPreferences',
        userId,
        groupId
      });
      throw error;
    }
  }

  /**
   * Clean up expired notifications
   */
  async cleanupExpiredNotifications(): Promise<number> {
    try {
      const notifications = this.loadNotifications();
      const now = new Date();
      
      const activeNotifications = notifications.filter(n => {
        // Keep if no expiration date
        if (!n.expiresAt) return true;
        
        // Keep if not expired
        if (new Date(n.expiresAt) > now) return true;
        
        // Keep persistent notifications even if expired
        if (n.isPersistent) return true;
        
        return false;
      });

      const removedCount = notifications.length - activeNotifications.length;
      
      if (removedCount > 0) {
        localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(activeNotifications));
      }

      return removedCount;
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupNotificationService.cleanupExpiredNotifications'
      });
      return 0;
    }
  }

  // Convenience methods for common notification types

  async notifyMemberJoined(groupId: string, newMemberUserId: string): Promise<void> {
    const group = await groupService.getGroupById(groupId);
    if (!group) return;

    await this.sendGroupNotification(
      groupId,
      'member_joined',
      'New Member Joined',
      `A new member has joined ${group.name}!`,
      {
        excludeUserIds: [newMemberUserId],
        data: { newMemberUserId },
        priority: 'medium',
        actionUrl: `/groups/${groupId}`,
        actionLabel: 'View Group'
      }
    );
  }

  async notifyMemberLeft(groupId: string, leftMemberUserId: string, reason?: string): Promise<void> {
    const group = await groupService.getGroupById(groupId);
    if (!group) return;

    const message = reason 
      ? `A member has left ${group.name}. Reason: ${reason}`
      : `A member has left ${group.name}.`;

    await this.sendGroupNotification(
      groupId,
      'member_left',
      'Member Left Group',
      message,
      {
        excludeUserIds: [leftMemberUserId],
        data: { leftMemberUserId, reason },
        priority: 'low'
      }
    );
  }

  async notifyAchievementEarned(groupId: string, userId: string, achievementTitle: string): Promise<void> {
    const group = await groupService.getGroupById(groupId);
    if (!group) return;

    await this.sendGroupNotification(
      groupId,
      'achievement_earned',
      'Achievement Unlocked!',
      `A member earned the "${achievementTitle}" achievement in ${group.name}!`,
      {
        excludeUserIds: [userId],
        data: { userId, achievementTitle },
        priority: 'medium',
        actionUrl: `/groups/${groupId}/achievements`,
        actionLabel: 'View Achievements'
      }
    );

    // Send special notification to the achiever
    await this.sendNotification(
      userId,
      groupId,
      'achievement_earned',
      'Congratulations!',
      `You earned the "${achievementTitle}" achievement!`,
      {
        data: { achievementTitle },
        priority: 'high',
        isPersistent: true,
        actionUrl: `/groups/${groupId}/achievements`,
        actionLabel: 'View Achievement'
      }
    );
  }

  async notifyNewMessage(groupId: string, senderId: string, messagePreview: string): Promise<void> {
    const group = await groupService.getGroupById(groupId);
    if (!group) return;

    await this.sendGroupNotification(
      groupId,
      'new_message',
      'New Message',
      `New message in ${group.name}: ${messagePreview}`,
      {
        excludeUserIds: [senderId],
        data: { senderId },
        priority: 'low',
        expiresInHours: 24,
        actionUrl: `/groups/${groupId}/chat`,
        actionLabel: 'View Chat'
      }
    );
  }

  async notifyMilestoneReached(groupId: string, userId: string, milestone: string): Promise<void> {
    const group = await groupService.getGroupById(groupId);
    if (!group) return;

    await this.sendGroupNotification(
      groupId,
      'milestone_reached',
      'Milestone Reached!',
      `A member reached a milestone in ${group.name}: ${milestone}`,
      {
        data: { userId, milestone },
        priority: 'medium',
        actionUrl: `/groups/${groupId}/activity`,
        actionLabel: 'View Activity'
      }
    );
  }

  // Private helper methods

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async saveNotification(notification: GroupNotification): Promise<void> {
    const notifications = this.loadNotifications();
    notifications.push(notification);
    
    // Keep only last 1000 notifications per user for performance
    const userNotifications = notifications.filter(n => n.recipientUserId === notification.recipientUserId);
    if (userNotifications.length > 1000) {
      const otherNotifications = notifications.filter(n => n.recipientUserId !== notification.recipientUserId);
      const recentUserNotifications = userNotifications
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 1000);
      
      const trimmedNotifications = [...otherNotifications, ...recentUserNotifications];
      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(trimmedNotifications));
    } else {
      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications));
    }
  }

  private loadNotifications(): GroupNotification[] {
    try {
      const stored = localStorage.getItem(this.NOTIFICATIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async savePreferences(preferences: NotificationPreferences): Promise<void> {
    const allPreferences = this.loadPreferences();
    const index = allPreferences.findIndex(p => 
      p.userId === preferences.userId && p.groupId === preferences.groupId
    );

    if (index >= 0) {
      allPreferences[index] = preferences;
    } else {
      allPreferences.push(preferences);
    }

    localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(allPreferences));
  }

  private loadPreferences(): NotificationPreferences[] {
    try {
      const stored = localStorage.getItem(this.PREFERENCES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private isQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const { startTime, endTime } = preferences.quietHours;
    
    // Handle quiet hours that span midnight
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      return currentTime >= startTime && currentTime <= endTime;
    }
  }
}

export const groupNotificationService = new GroupNotificationService();
export default groupNotificationService;