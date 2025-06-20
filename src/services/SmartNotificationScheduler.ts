import { notificationService, WellnessNotification, NotificationPreferences } from './notificationService';
import { emailTemplateService } from './EmailTemplateService';

export interface UserActivityPattern {
  userId: string;
  mostActiveHours: number[]; // Hours when user is most active (0-23)
  preferredNotificationTimes: string[]; // HH:MM format
  averageResponseTime: number; // Minutes to respond to notifications
  engagementScore: number; // 0-1 based on notification interaction
  timeZone: string;
  lastActiveDate: Date;
  weeklyActivityPattern: number[]; // 0-6 (Sunday-Saturday) activity scores
}

export interface ScheduledNotification {
  id: string;
  notification: WellnessNotification;
  scheduledTime: Date;
  userId: string;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    days?: number[]; // For weekly: 0-6, for monthly: 1-31
    time: string; // HH:MM
  };
  priority: number; // 1-10, higher = more important
  sent: boolean;
  sentTime?: Date;
  opened?: boolean;
  openedTime?: Date;
}

export interface NotificationAnalytics {
  userId: string;
  notificationId: string;
  type: string;
  category: string;
  sentTime: Date;
  opened: boolean;
  openedTime?: Date;
  clicked: boolean;
  clickedTime?: Date;
  dismissed: boolean;
  dismissedTime?: Date;
  responseTime?: number; // Minutes between sent and first interaction
  deviceType: 'mobile' | 'desktop' | 'tablet';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: number; // 0-6
}

class SmartNotificationScheduler {
  private scheduledNotifications: ScheduledNotification[] = [];
  private userActivityPatterns: Map<string, UserActivityPattern> = new Map();
  private analytics: NotificationAnalytics[] = [];
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loadStoredData();
      this.startSchedulingEngine();
      this.isInitialized = true;
      console.log('SmartNotificationScheduler initialized');
    } catch (error) {
      console.error('Error initializing SmartNotificationScheduler:', error);
    }
  }

  private async loadStoredData(): Promise<void> {
    try {
      // Load scheduled notifications
      const storedScheduled = localStorage.getItem('scheduled_notifications');
      if (storedScheduled) {
        this.scheduledNotifications = JSON.parse(storedScheduled).map((item: any) => ({
          ...item,
          scheduledTime: new Date(item.scheduledTime),
          notification: {
            ...item.notification,
            timestamp: new Date(item.notification.timestamp),
            expiresAt: item.notification.expiresAt ? new Date(item.notification.expiresAt) : undefined
          }
        }));
      }

      // Load user activity patterns
      const storedPatterns = localStorage.getItem('user_activity_patterns');
      if (storedPatterns) {
        const patterns = JSON.parse(storedPatterns);
        Object.entries(patterns).forEach(([userId, pattern]: [string, any]) => {
          this.userActivityPatterns.set(userId, {
            ...pattern,
            lastActiveDate: new Date(pattern.lastActiveDate)
          });
        });
      }

      // Load analytics
      const storedAnalytics = localStorage.getItem('notification_analytics_detailed');
      if (storedAnalytics) {
        this.analytics = JSON.parse(storedAnalytics).map((item: any) => ({
          ...item,
          sentTime: new Date(item.sentTime),
          openedTime: item.openedTime ? new Date(item.openedTime) : undefined,
          clickedTime: item.clickedTime ? new Date(item.clickedTime) : undefined,
          dismissedTime: item.dismissedTime ? new Date(item.dismissedTime) : undefined
        }));
      }
    } catch (error) {
      console.error('Error loading stored notification data:', error);
    }
  }

  private saveData(): void {
    try {
      localStorage.setItem('scheduled_notifications', JSON.stringify(this.scheduledNotifications));
      
      const patternsObj: Record<string, any> = {};
      this.userActivityPatterns.forEach((pattern, userId) => {
        patternsObj[userId] = pattern;
      });
      localStorage.setItem('user_activity_patterns', JSON.stringify(patternsObj));
      
      localStorage.setItem('notification_analytics_detailed', JSON.stringify(this.analytics));
    } catch (error) {
      console.error('Error saving notification data:', error);
    }
  }

  private startSchedulingEngine(): void {
    // Check for notifications to send every minute
    setInterval(() => {
      this.processScheduledNotifications();
    }, 60000); // 1 minute

    // Update user activity patterns every hour
    setInterval(() => {
      this.updateUserActivityPatterns();
    }, 3600000); // 1 hour

    // Clean up old data daily
    setInterval(() => {
      this.cleanupOldData();
    }, 86400000); // 24 hours
  }

  private async processScheduledNotifications(): Promise<void> {
    const now = new Date();
    const notificationsToSend = this.scheduledNotifications.filter(
      scheduled => !scheduled.sent && scheduled.scheduledTime <= now
    );

    for (const scheduled of notificationsToSend) {
      try {
        await this.sendScheduledNotification(scheduled);
      } catch (error) {
        console.error('Error sending scheduled notification:', error);
      }
    }

    if (notificationsToSend.length > 0) {
      this.saveData();
    }
  }

  private async sendScheduledNotification(scheduled: ScheduledNotification): Promise<void> {
    const preferences = await notificationService.getPreferences();
    
    // Check if notifications are allowed at this time
    if (!this.isNotificationAllowed(scheduled, preferences)) {
      // Reschedule for later
      scheduled.scheduledTime = this.getNextAllowedTime(scheduled, preferences);
      return;
    }

    // Send the notification
    await notificationService.sendNotification(scheduled.notification);
    
    // Mark as sent
    scheduled.sent = true;
    scheduled.sentTime = new Date();

    // Record analytics
    this.recordNotificationSent(scheduled);

    // If recurring, schedule next occurrence
    if (scheduled.isRecurring && scheduled.recurringPattern) {
      this.scheduleRecurringNotification(scheduled);
    }
  }

  private isNotificationAllowed(scheduled: ScheduledNotification, preferences: NotificationPreferences): boolean {
    const now = new Date();
    
    // Check quiet hours
    if (preferences.quietHours.enabled) {
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const { startTime, endTime } = preferences.quietHours;
      
      if (this.isTimeInRange(currentTime, startTime, endTime)) {
        return false;
      }
    }

    // Check daily notification limit
    const todayCount = this.getTodayNotificationCount(scheduled.userId);
    if (todayCount >= preferences.maxDailyNotifications) {
      return false;
    }

    return true;
  }

  private isTimeInRange(current: string, start: string, end: string): boolean {
    if (start <= end) {
      return current >= start && current <= end;
    } else {
      // Spans midnight
      return current >= start || current <= end;
    }
  }

  private getTodayNotificationCount(userId: string): number {
    const today = new Date().toDateString();
    return this.analytics.filter(
      analytic => analytic.userId === userId && 
      analytic.sentTime.toDateString() === today
    ).length;
  }

  private getNextAllowedTime(scheduled: ScheduledNotification, preferences: NotificationPreferences): Date {
    const now = new Date();
    
    if (preferences.quietHours.enabled) {
      const endTime = preferences.quietHours.endTime;
      const [hours, minutes] = endTime.split(':').map(Number);
      
      const nextAllowed = new Date(now);
      nextAllowed.setHours(hours, minutes, 0, 0);
      
      // If end time is today but has passed, schedule for tomorrow
      if (nextAllowed <= now) {
        nextAllowed.setDate(nextAllowed.getDate() + 1);
      }
      
      return nextAllowed;
    }

    // Default: schedule for next hour
    const nextHour = new Date(now);
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
    return nextHour;
  }

  private scheduleRecurringNotification(originalScheduled: ScheduledNotification): void {
    if (!originalScheduled.recurringPattern) return;

    const pattern = originalScheduled.recurringPattern;
    const nextTime = new Date(originalScheduled.scheduledTime);

    switch (pattern.frequency) {
      case 'daily':
        nextTime.setDate(nextTime.getDate() + 1);
        break;
      case 'weekly':
        nextTime.setDate(nextTime.getDate() + 7);
        break;
      case 'monthly':
        nextTime.setMonth(nextTime.getMonth() + 1);
        break;
    }

    const newScheduled: ScheduledNotification = {
      ...originalScheduled,
      id: `${originalScheduled.id}_${Date.now()}`,
      scheduledTime: nextTime,
      sent: false,
      sentTime: undefined,
      opened: false,
      openedTime: undefined
    };

    this.scheduledNotifications.push(newScheduled);
  }

  public scheduleNotification(
    notification: WellnessNotification,
    userId: string,
    scheduledTime: Date,
    isRecurring: boolean = false,
    recurringPattern?: ScheduledNotification['recurringPattern']
  ): string {
    const scheduled: ScheduledNotification = {
      id: `scheduled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      notification,
      scheduledTime,
      userId,
      isRecurring,
      recurringPattern,
      priority: this.calculateNotificationPriority(notification, userId),
      sent: false
    };

    this.scheduledNotifications.push(scheduled);
    this.saveData();

    return scheduled.id;
  }

  private calculateNotificationPriority(notification: WellnessNotification, userId: string): number {
    let priority = 5; // Base priority

    // Adjust based on notification type
    switch (notification.priority) {
      case 'urgent': priority = 10; break;
      case 'high': priority = 8; break;
      case 'normal': priority = 5; break;
      case 'low': priority = 2; break;
    }

    // Adjust based on user engagement
    const userPattern = this.userActivityPatterns.get(userId);
    if (userPattern) {
      priority += userPattern.engagementScore * 2;
    }

    // Adjust based on notification category
    switch (notification.category) {
      case 'achievements': priority += 1; break;
      case 'reminders': priority -= 1; break;
      case 'wellness': priority -= 0.5; break;
    }

    return Math.max(1, Math.min(10, priority));
  }

  public getOptimalSchedulingTime(userId: string, notificationType: string): Date {
    const userPattern = this.userActivityPatterns.get(userId);
    const now = new Date();
    
    if (!userPattern) {
      // Default to next hour if no pattern data
      const defaultTime = new Date(now);
      defaultTime.setHours(defaultTime.getHours() + 1, 0, 0, 0);
      return defaultTime;
    }

    // Find the next optimal time based on user's activity pattern
    const currentHour = now.getHours();
    let bestHour = currentHour + 1;
    let bestScore = 0;

    // Look ahead 12 hours for the best time
    for (let i = 1; i <= 12; i++) {
      const checkHour = (currentHour + i) % 24;
      const score = this.calculateTimeScore(checkHour, userPattern, notificationType);
      
      if (score > bestScore) {
        bestScore = score;
        bestHour = checkHour;
      }
    }

    const optimalTime = new Date(now);
    optimalTime.setHours(bestHour, 0, 0, 0);
    
    // If the optimal time is in the past today, schedule for tomorrow
    if (optimalTime <= now) {
      optimalTime.setDate(optimalTime.getDate() + 1);
    }

    return optimalTime;
  }

  private calculateTimeScore(hour: number, userPattern: UserActivityPattern, notificationType: string): number {
    let score = 0;

    // Base score from user's active hours
    if (userPattern.mostActiveHours.includes(hour)) {
      score += 3;
    }

    // Preferred notification times
    userPattern.preferredNotificationTimes.forEach(time => {
      const preferredHour = parseInt(time.split(':')[0]);
      if (Math.abs(hour - preferredHour) <= 1) {
        score += 2;
      }
    });

    // Type-specific optimal times
    switch (notificationType) {
      case 'meal_reminder':
        if ([7, 8, 12, 13, 18, 19].includes(hour)) score += 2;
        break;
      case 'training_reminder':
        if ([9, 10, 11, 19, 20, 21].includes(hour)) score += 2;
        break;
      case 'motivational':
        if ([8, 9, 17, 18].includes(hour)) score += 2;
        break;
      case 'achievement':
        // Achievements can be sent anytime, slight preference for evening
        if ([17, 18, 19, 20].includes(hour)) score += 1;
        break;
    }

    // Avoid very early morning and very late night
    if (hour < 6 || hour > 22) {
      score -= 2;
    }

    return score;
  }

  public updateUserActivityPattern(userId: string, activity: {
    activeTime: Date;
    notificationInteraction?: {
      notificationId: string;
      opened: boolean;
      responseTime: number;
    };
  }): void {
    let pattern = this.userActivityPatterns.get(userId);
    
    if (!pattern) {
      pattern = {
        userId,
        mostActiveHours: [],
        preferredNotificationTimes: ['09:00', '19:00'],
        averageResponseTime: 30,
        engagementScore: 0.5,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        lastActiveDate: activity.activeTime,
        weeklyActivityPattern: [0, 0, 0, 0, 0, 0, 0]
      };
    }

    // Update last active date
    pattern.lastActiveDate = activity.activeTime;

    // Update most active hours
    const hour = activity.activeTime.getHours();
    if (!pattern.mostActiveHours.includes(hour)) {
      pattern.mostActiveHours.push(hour);
      
      // Keep only top 6 most active hours
      if (pattern.mostActiveHours.length > 6) {
        pattern.mostActiveHours = pattern.mostActiveHours.slice(-6);
      }
    }

    // Update weekly activity pattern
    const dayOfWeek = activity.activeTime.getDay();
    pattern.weeklyActivityPattern[dayOfWeek] = Math.min(1, pattern.weeklyActivityPattern[dayOfWeek] + 0.1);

    // Update engagement score if notification interaction provided
    if (activity.notificationInteraction) {
      const interaction = activity.notificationInteraction;
      
      if (interaction.opened) {
        pattern.engagementScore = Math.min(1, pattern.engagementScore + 0.05);
        pattern.averageResponseTime = (pattern.averageResponseTime + interaction.responseTime) / 2;
      } else {
        pattern.engagementScore = Math.max(0, pattern.engagementScore - 0.02);
      }
    }

    this.userActivityPatterns.set(userId, pattern);
    this.saveData();
  }

  private recordNotificationSent(scheduled: ScheduledNotification): void {
    const analytics: NotificationAnalytics = {
      userId: scheduled.userId,
      notificationId: scheduled.notification.id,
      type: scheduled.notification.type,
      category: scheduled.notification.category,
      sentTime: new Date(),
      opened: false,
      clicked: false,
      dismissed: false,
      deviceType: this.getDeviceType(),
      timeOfDay: this.getTimeOfDay(),
      dayOfWeek: new Date().getDay()
    };

    this.analytics.push(analytics);
  }

  public recordNotificationInteraction(
    notificationId: string,
    userId: string,
    interaction: 'opened' | 'clicked' | 'dismissed'
  ): void {
    const analytic = this.analytics.find(
      a => a.notificationId === notificationId && a.userId === userId
    );

    if (analytic) {
      const now = new Date();
      
      switch (interaction) {
        case 'opened':
          analytic.opened = true;
          analytic.openedTime = now;
          analytic.responseTime = Math.floor((now.getTime() - analytic.sentTime.getTime()) / (1000 * 60));
          break;
        case 'clicked':
          analytic.clicked = true;
          analytic.clickedTime = now;
          if (!analytic.opened) {
            analytic.opened = true;
            analytic.openedTime = now;
            analytic.responseTime = Math.floor((now.getTime() - analytic.sentTime.getTime()) / (1000 * 60));
          }
          break;
        case 'dismissed':
          analytic.dismissed = true;
          analytic.dismissedTime = now;
          break;
      }

      // Update user activity pattern
      this.updateUserActivityPattern(userId, {
        activeTime: now,
        notificationInteraction: {
          notificationId,
          opened: analytic.opened,
          responseTime: analytic.responseTime || 0
        }
      });

      this.saveData();
    }
  }

  private getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobi|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }

  private updateUserActivityPatterns(): void {
    // This would typically analyze recent user behavior
    // For demo purposes, we'll simulate some pattern updates
    const now = new Date();
    const currentUserId = localStorage.getItem('current_user_id') || 'demo_user';
    
    this.updateUserActivityPattern(currentUserId, {
      activeTime: now
    });
  }

  private cleanupOldData(): void {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Remove old analytics
    this.analytics = this.analytics.filter(
      analytic => analytic.sentTime > thirtyDaysAgo
    );

    // Remove old sent notifications
    this.scheduledNotifications = this.scheduledNotifications.filter(
      scheduled => !scheduled.sent || (scheduled.sentTime && scheduled.sentTime > thirtyDaysAgo)
    );

    this.saveData();
  }

  // Analytics methods
  public getNotificationAnalytics(userId: string, timeRange: 'day' | 'week' | 'month' = 'week'): any {
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        break;
    }

    const userAnalytics = this.analytics.filter(
      a => a.userId === userId && a.sentTime >= startDate
    );

    const totalSent = userAnalytics.length;
    const totalOpened = userAnalytics.filter(a => a.opened).length;
    const totalClicked = userAnalytics.filter(a => a.clicked).length;
    const totalDismissed = userAnalytics.filter(a => a.dismissed).length;

    const avgResponseTime = userAnalytics
      .filter(a => a.responseTime)
      .reduce((sum, a) => sum + (a.responseTime || 0), 0) / totalOpened || 0;

    const categoryBreakdown = userAnalytics.reduce((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const timeOfDayBreakdown = userAnalytics.reduce((acc, a) => {
      acc[a.timeOfDay] = (acc[a.timeOfDay] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSent,
      totalOpened,
      totalClicked,
      totalDismissed,
      openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
      clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
      dismissRate: totalSent > 0 ? (totalDismissed / totalSent) * 100 : 0,
      avgResponseTime: Math.round(avgResponseTime),
      categoryBreakdown,
      timeOfDayBreakdown,
      userPattern: this.userActivityPatterns.get(userId)
    };
  }

  public getScheduledNotifications(userId: string): ScheduledNotification[] {
    return this.scheduledNotifications.filter(
      scheduled => scheduled.userId === userId && !scheduled.sent
    );
  }

  public cancelScheduledNotification(scheduledId: string): boolean {
    const index = this.scheduledNotifications.findIndex(s => s.id === scheduledId);
    if (index !== -1) {
      this.scheduledNotifications.splice(index, 1);
      this.saveData();
      return true;
    }
    return false;
  }
}

export const smartNotificationScheduler = new SmartNotificationScheduler();
export default smartNotificationScheduler;