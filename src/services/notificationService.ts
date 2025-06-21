// Enhanced Notification service for wellness app
// Comprehensive notification system with push notifications, local notifications, and engagement features

import { Capacitor } from '@capacitor/core';
import { errorService } from './errorService';

// Define comprehensive notification types
export interface WellnessNotification {
  id: string;
  type: 'goal_reached' | 'streak_milestone' | 'personal_best' | 'reminder' | 'weekly_summary' | 
        'achievement' | 'group_activity' | 'meal_reminder' | 'training_reminder' | 'motivational' |
        're_engagement' | 'social_challenge' | 'health_tip' | 'celebration';
  category: 'steps' | 'nutrition' | 'training' | 'social' | 'achievements' | 'reminders' | 'wellness';
  title: string;
  body: string;
  icon?: string;
  image?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  data?: any;
  timestamp: Date;
  read: boolean;
  actionRequired?: boolean;
  expiresAt?: Date;
  tags?: string[];
}

export interface NotificationPreferences {
  // Core wellness notifications
  goalReached: boolean;
  streakMilestones: boolean;
  personalBest: boolean;
  dailyReminders: boolean;
  weeklySummary: boolean;
  
  // Extended notifications
  achievementCelebrations: boolean;
  groupActivity: boolean;
  mealReminders: boolean;
  trainingReminders: boolean;
  motivationalMessages: boolean;
  healthTips: boolean;
  socialChallenges: boolean;
  reEngagementCampaigns: boolean;
  
  // Timing preferences
  reminderTime?: string; // HH:MM format
  mealReminderTimes: string[]; // Array of HH:MM times
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  
  // Frequency settings
  maxDailyNotifications: number;
  batchNotifications: boolean;
  smartScheduling: boolean;
  
  // Channel preferences
  pushNotifications: boolean;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  desktopNotifications: boolean;
}

// Import Capacitor Local Notifications plugin if available
let LocalNotifications: any;
try {
  const { LocalNotifications: LN } = require('@capacitor/local-notifications');
  LocalNotifications = LN;
} catch (error) {
  console.warn('Local Notifications plugin not available:', error);
}

class NotificationService {
  private preferences: NotificationPreferences = {
    // Core wellness notifications
    goalReached: true,
    streakMilestones: true,
    personalBest: true,
    dailyReminders: true,
    weeklySummary: true,
    
    // Extended notifications
    achievementCelebrations: true,
    groupActivity: true,
    mealReminders: true,
    trainingReminders: true,
    motivationalMessages: true,
    healthTips: true,
    socialChallenges: true,
    reEngagementCampaigns: false, // Opt-in for re-engagement
    
    // Timing preferences
    reminderTime: '20:00', // 8 PM default
    mealReminderTimes: ['08:00', '12:30', '18:30'],
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00'
    },
    
    // Frequency settings
    maxDailyNotifications: 10,
    batchNotifications: false,
    smartScheduling: true,
    
    // Channel preferences
    pushNotifications: true,
    emailNotifications: true,
    inAppNotifications: true,
    desktopNotifications: false
  };

  private notifications: WellnessNotification[] = [];
  private isInitialized = false;
  private analyticsData: any[] = [];
  private pushToken: string | null = null;

  /**
   * Initialize the notification service
   */
  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      // Load preferences from localStorage
      this.loadPreferences();

      // Load notification history
      this.loadNotificationHistory();

      // Request notification permissions if on native platform
      if (Capacitor.isNativePlatform() && LocalNotifications) {
        const permission = await LocalNotifications.requestPermissions();
        if (permission.display === 'granted') {
          errorService.logInfo('Notification permissions granted');
          
          // Schedule daily reminder if enabled
          if (this.preferences.dailyReminders) {
            await this.scheduleDailyReminder();
          }
        }
      }

      this.isInitialized = true;
      errorService.logInfo('Notification service initialized');
    } catch (error) {
      errorService.logError(error as Error, { context: 'NotificationService.initialize' });
    }
  }

  /**
   * Send goal reached notification
   */
  async sendGoalReachedNotification(steps: number, goal: number): Promise<void> {
    try {
      if (!this.preferences.goalReached) return;

      const notification: WellnessNotification = {
        id: `goal_${Date.now()}`,
        type: 'goal_reached',
        category: 'steps',
        title: '🎯 Goal Reached!',
        body: `Congratulations! You've reached your daily goal of ${goal.toLocaleString()} steps. Current: ${steps.toLocaleString()} steps.`,
        icon: '🎯',
        priority: 'high',
        data: { steps, goal },
        timestamp: new Date(),
        read: false,
        actionRequired: false,
        tags: ['achievement', 'steps', 'goal']
      };

      await this.sendNotification(notification);
    } catch (error) {
      errorService.logError(error as Error, { context: 'NotificationService.sendGoalReachedNotification' });
    }
  }

  /**
   * Send achievement celebration notification
   */
  async sendAchievementNotification(achievement: { title: string; description: string; icon: string; rarity: string }): Promise<void> {
    try {
      if (!this.preferences.achievementCelebrations) return;

      const notification: WellnessNotification = {
        id: `achievement_${Date.now()}`,
        type: 'achievement',
        category: 'achievements',
        title: `🎉 Achievement Unlocked!`,
        body: `${achievement.title} - ${achievement.description}`,
        icon: achievement.icon,
        priority: achievement.rarity === 'legendary' || achievement.rarity === 'epic' ? 'high' : 'normal',
        data: { achievement },
        timestamp: new Date(),
        read: false,
        actionRequired: false,
        tags: ['achievement', achievement.rarity, 'celebration']
      };

      await this.sendNotification(notification);
    } catch (error) {
      errorService.logError(error as Error, { context: 'NotificationService.sendAchievementNotification' });
    }
  }

  /**
   * Send group activity notification
   */
  async sendGroupActivityNotification(activity: { memberName: string; action: string; groupName: string }): Promise<void> {
    try {
      if (!this.preferences.groupActivity) return;

      const notification: WellnessNotification = {
        id: `group_${Date.now()}`,
        type: 'group_activity',
        category: 'social',
        title: `👥 Group Activity`,
        body: `${activity.memberName} ${activity.action} in ${activity.groupName}`,
        icon: '👥',
        priority: 'normal',
        data: { activity },
        timestamp: new Date(),
        read: false,
        actionRequired: false,
        tags: ['group', 'social', 'activity']
      };

      await this.sendNotification(notification);
    } catch (error) {
      errorService.logError(error as Error, { context: 'NotificationService.sendGroupActivityNotification' });
    }
  }

  /**
   * Send meal reminder notification
   */
  async sendMealReminderNotification(mealType: string): Promise<void> {
    try {
      if (!this.preferences.mealReminders) return;

      const mealEmojis: Record<string, string> = {
        breakfast: '🌅',
        lunch: '☀️',
        dinner: '🌙',
        snack: '🍎'
      };

      const notification: WellnessNotification = {
        id: `meal_${Date.now()}`,
        type: 'meal_reminder',
        category: 'nutrition',
        title: `${mealEmojis[mealType] || '🍽️'} Time for ${mealType}!`,
        body: `Don't forget to log your ${mealType} for AI nutrition analysis`,
        icon: '🥗',
        priority: 'normal',
        data: { mealType },
        timestamp: new Date(),
        read: false,
        actionRequired: true,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
        tags: ['meal', 'nutrition', 'reminder']
      };

      await this.sendNotification(notification);
    } catch (error) {
      errorService.logError(error as Error, { context: 'NotificationService.sendMealReminderNotification' });
    }
  }

  /**
   * Send training reminder notification
   */
  async sendTrainingReminderNotification(module?: { title: string; progress: number }): Promise<void> {
    try {
      if (!this.preferences.trainingReminders) return;

      let body = 'Continue your wellness coaching journey';
      if (module) {
        body = `Continue "${module.title}" - ${module.progress}% complete`;
      }

      const notification: WellnessNotification = {
        id: `training_${Date.now()}`,
        type: 'training_reminder',
        category: 'training',
        title: '🎓 Learning Time!',
        body: body,
        icon: '🎓',
        priority: 'normal',
        data: { module },
        timestamp: new Date(),
        read: false,
        actionRequired: true,
        tags: ['training', 'education', 'reminder']
      };

      await this.sendNotification(notification);
    } catch (error) {
      errorService.logError(error as Error, { context: 'NotificationService.sendTrainingReminderNotification' });
    }
  }

  /**
   * Send motivational message
   */
  async sendMotivationalNotification(): Promise<void> {
    try {
      if (!this.preferences.motivationalMessages) return;

      const messages = [
        { title: '💪 You\'ve got this!', body: 'Every step counts towards your wellness goals' },
        { title: '🌟 Keep shining!', body: 'Your dedication to health is inspiring' },
        { title: '🔥 Stay strong!', body: 'Consistency is the key to lasting change' },
        { title: '🎯 Focus on progress!', body: 'Small improvements add up to big results' },
        { title: '🌱 Growth mindset!', body: 'Every challenge is an opportunity to grow' }
      ];

      const message = messages[Math.floor(Math.random() * messages.length)];

      const notification: WellnessNotification = {
        id: `motivational_${Date.now()}`,
        type: 'motivational',
        category: 'wellness',
        title: message.title,
        body: message.body,
        icon: '💪',
        priority: 'low',
        data: { messageType: 'motivational' },
        timestamp: new Date(),
        read: false,
        actionRequired: false,
        tags: ['motivation', 'wellness', 'inspiration']
      };

      await this.sendNotification(notification);
    } catch (error) {
      errorService.logError(error as Error, { context: 'NotificationService.sendMotivationalNotification' });
    }
  }

  /**
   * Send health tip notification
   */
  async sendHealthTipNotification(): Promise<void> {
    try {
      if (!this.preferences.healthTips) return;

      const tips = [
        { title: '💧 Hydration Tip', body: 'Drink a glass of water first thing in the morning to kickstart your metabolism' },
        { title: '🚶 Movement Tip', body: 'Take the stairs instead of elevators for extra daily activity' },
        { title: '😴 Sleep Tip', body: 'Aim for 7-9 hours of sleep for optimal recovery and wellness' },
        { title: '🧘 Mindfulness Tip', body: 'Take 5 deep breaths to center yourself when feeling stressed' },
        { title: '🥗 Nutrition Tip', body: 'Fill half your plate with vegetables for balanced nutrition' }
      ];

      const tip = tips[Math.floor(Math.random() * tips.length)];

      const notification: WellnessNotification = {
        id: `health_tip_${Date.now()}`,
        type: 'health_tip',
        category: 'wellness',
        title: tip.title,
        body: tip.body,
        icon: '💡',
        priority: 'low',
        data: { tipType: 'health' },
        timestamp: new Date(),
        read: false,
        actionRequired: false,
        tags: ['health', 'tips', 'education']
      };

      await this.sendNotification(notification);
    } catch (error) {
      errorService.logError(error as Error, { context: 'NotificationService.sendHealthTipNotification' });
    }
  }

  /**
   * Send re-engagement notification
   */
  async sendReEngagementNotification(daysSinceLastActivity: number): Promise<void> {
    try {
      if (!this.preferences.reEngagementCampaigns) return;

      let title = '';
      let body = '';
      let priority: 'low' | 'normal' | 'high' = 'normal';

      if (daysSinceLastActivity <= 3) {
        title = '👋 We miss you!';
        body = 'Come back and continue your wellness journey';
        priority = 'low';
      } else if (daysSinceLastActivity <= 7) {
        title = '🎯 Ready to restart?';
        body = 'Your wellness goals are waiting for you';
        priority = 'normal';
      } else {
        title = '🌟 New features await!';
        body = 'Discover what\'s new in your wellness app';
        priority = 'high';
      }

      const notification: WellnessNotification = {
        id: `re_engagement_${Date.now()}`,
        type: 're_engagement',
        category: 'wellness',
        title: title,
        body: body,
        icon: '🔄',
        priority: priority,
        data: { daysSinceLastActivity },
        timestamp: new Date(),
        read: false,
        actionRequired: true,
        tags: ['re-engagement', 'comeback', 'wellness']
      };

      await this.sendNotification(notification);
    } catch (error) {
      errorService.logError(error as Error, { context: 'NotificationService.sendReEngagementNotification' });
    }
  }

  /**
   * Send streak milestone notification
   */
  async sendStreakMilestoneNotification(streakDays: number): Promise<void> {
    try {
      if (!this.preferences.streakMilestones) return;

      // Only send for significant milestones
      const milestones = [3, 7, 14, 30, 50, 100, 365];
      if (!milestones.includes(streakDays)) return;

      const notification: WellnessNotification = {
        id: `streak_${Date.now()}`,
        type: 'streak_milestone',
        category: 'achievements',
        title: '🔥 Streak Milestone!',
        body: `Amazing! You've maintained a ${streakDays}-day streak. Keep it up!`,
        icon: '🔥',
        priority: 'high',
        data: { streakDays },
        timestamp: new Date(),
        read: false
      };

      await this.sendNotification(notification);
    } catch (error) {
      errorService.logError(error as Error, { context: 'NotificationService.sendStreakMilestoneNotification' });
    }
  }

  /**
   * Send personal best notification
   */
  async sendPersonalBestNotification(steps: number, previousBest: number): Promise<void> {
    try {
      if (!this.preferences.personalBest) return;

      const notification: WellnessNotification = {
        id: `pb_${Date.now()}`,
        type: 'personal_best',
        category: 'achievements',
        title: '🏆 New Personal Best!',
        body: `Incredible! You've set a new personal record with ${steps.toLocaleString()} steps, beating your previous best of ${previousBest.toLocaleString()}.`,
        icon: '🏆',
        priority: 'high',
        data: { steps, previousBest },
        timestamp: new Date(),
        read: false
      };

      await this.sendNotification(notification);
    } catch (error) {
      errorService.logError(error as Error, { context: 'NotificationService.sendPersonalBestNotification' });
    }
  }

  /**
   * Send weekly summary notification
   */
  async sendWeeklySummaryNotification(totalSteps: number, avgSteps: number, goalsReached: number): Promise<void> {
    try {
      if (!this.preferences.weeklySummary) return;

      const notification: WellnessNotification = {
        id: `weekly_${Date.now()}`,
        type: 'weekly_summary',
        category: 'wellness',
        title: '📊 Weekly Summary',
        body: `This week: ${totalSteps.toLocaleString()} total steps, ${avgSteps.toLocaleString()} daily average, ${goalsReached}/7 goals reached.`,
        icon: '📊',
        priority: 'normal',
        data: { totalSteps, avgSteps, goalsReached },
        timestamp: new Date(),
        read: false
      };

      await this.sendNotification(notification);
    } catch (error) {
      errorService.logError(error as Error, { context: 'NotificationService.sendWeeklySummaryNotification' });
    }
  }

  /**
   * Schedule daily reminder notification
   */
  async scheduleDailyReminder(): Promise<void> {
    try {
      if (!Capacitor.isNativePlatform() || !LocalNotifications) return;

      // Cancel existing daily reminders
      await LocalNotifications.cancel({ notifications: [{ id: 999 }] });

      if (!this.preferences.dailyReminders || !this.preferences.reminderTime) return;

      const [hours, minutes] = this.preferences.reminderTime.split(':').map(Number);
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      // If time has passed today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      await LocalNotifications.schedule({
        notifications: [{
          id: 999,
          title: '👟 Time to Move!',
          body: "Don't forget to reach your step goal today!",
          schedule: {
            at: scheduledTime,
            every: 'day'
          },
          sound: 'default',
          attachments: undefined,
          actionTypeId: '',
          extra: null
        }]
      });

      errorService.logInfo('Daily reminder scheduled', { time: this.preferences.reminderTime });
    } catch (error) {
      errorService.logError(error as Error, { context: 'NotificationService.scheduleDailyReminder' });
    }
  }

  /**
   * Get notification preferences
   */
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      this.preferences = { ...this.preferences, ...preferences };
      localStorage.setItem('notification_preferences', JSON.stringify(this.preferences));

      // Reschedule daily reminder if needed
      if ('dailyReminders' in preferences || 'reminderTime' in preferences) {
        await this.scheduleDailyReminder();
      }
    } catch (error) {
      errorService.logError(error as Error, { context: 'NotificationService.updatePreferences' });
    }
  }

  /**
   * Get notification history
   */
  getNotificationHistory(): WellnessNotification[] {
    return [...this.notifications];
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotificationHistory();
    }
  }

  /**
   * Clear notification history
   */
  clearHistory(): void {
    this.notifications = [];
    this.saveNotificationHistory();
  }

  /**
   * Send notification (internal method)
   */
  async sendNotification(notification: WellnessNotification): Promise<void> {
    try {
      // Add to history
      this.notifications.unshift(notification);
      this.saveNotificationHistory();

      // Send native notification if available
      if (Capacitor.isNativePlatform() && LocalNotifications) {
        await LocalNotifications.schedule({
          notifications: [{
            id: parseInt(notification.id.split('_')[1]) || Date.now(),
            title: notification.title,
            body: notification.body,
            schedule: { at: new Date(Date.now() + 1000) }, // 1 second delay
            sound: 'default',
            attachments: undefined,
            actionTypeId: '',
            extra: notification.data
          }]
        });
      } else {
        // For web, show in-app notification
        console.log('Notification:', notification.title, notification.body);
      }
    } catch (error) {
      errorService.logError(error as Error, { context: 'NotificationService.sendNotification' });
    }
  }

  /**
   * Load preferences from localStorage
   */
  private loadPreferences(): void {
    try {
      this.preferences = this.getDefaultPreferences();
      const stored = localStorage.getItem('notification_preferences');
      if (stored) {
        const savedPrefs = JSON.parse(stored);
        this.preferences = { ...this.preferences, ...savedPrefs };
      }
    } catch (error) {
      errorService.logError(error as Error, { context: 'NotificationService.loadPreferences' });
    }
  }

  /**
   * Load notification history from localStorage
   */
  private loadNotificationHistory(): void {
    try {
      const stored = localStorage.getItem('notification_history');
      if (stored) {
        this.notifications = JSON.parse(stored);
        // Keep only last 50 notifications
        this.notifications = this.notifications.slice(0, 50);
      }
    } catch (error) {
      errorService.logError(error as Error, { context: 'NotificationService.loadNotificationHistory' });
    }
  }

  /**
   * Save notification history to localStorage
   */
  private saveNotificationHistory(): void {
    try {
      // Keep only last 50 notifications
      const toSave = this.notifications.slice(0, 50);
      localStorage.setItem('notification_history', JSON.stringify(toSave));
    } catch (error) {
      errorService.logError(error as Error, { context: 'NotificationService.saveNotificationHistory' });
    }
  }

  /**
   * Get notification analytics
   */
  async getNotificationAnalytics(): Promise<any[]> {
    try {
      return this.notifications.map(notification => ({
        id: notification.id,
        type: notification.type,
        category: notification.category,
        timestamp: notification.timestamp,
        read: notification.read
      }));
    } catch (error) {
      errorService.logError(error as Error, { context: 'NotificationService.getNotificationAnalytics' });
      return [];
    }
  }

  /**
   * Clear notification data
   */
  async clearNotificationData(): Promise<void> {
    try {
      this.notifications = [];
      this.preferences = this.getDefaultPreferences();
      localStorage.removeItem('notification_preferences');
      localStorage.removeItem('notification_history');
    } catch (error) {
      errorService.logError(error as Error, { context: 'NotificationService.clearNotificationData' });
    }
  }

  /**
   * Get default preferences
   */
  private getDefaultPreferences(): NotificationPreferences {
    return {
      goalReached: true,
      streakMilestones: true,
      personalBest: true,
      dailyReminders: true,
      weeklySummary: true,
      achievementCelebrations: true,
      groupActivity: true,
      mealReminders: true,
      trainingReminders: true,
      motivationalMessages: true,
      healthTips: true,
      socialChallenges: true,
      reEngagementCampaigns: false,
      reminderTime: '09:00',
      mealReminderTimes: ['08:00', '12:30', '18:30'],
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00'
      },
      maxDailyNotifications: 10,
      batchNotifications: false,
      smartScheduling: true,
      pushNotifications: true,
      emailNotifications: true,
      inAppNotifications: true,
      desktopNotifications: false
    };
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

export default notificationService;