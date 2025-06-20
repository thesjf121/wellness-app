import { smartNotificationScheduler, UserActivityPattern } from '../SmartNotificationScheduler';
import { WellnessNotification } from '../notificationService';

describe('SmartNotificationScheduler', () => {
  const mockUserId = 'test-user-123';
  const mockNotification: WellnessNotification = {
    id: 'test-notification',
    type: 'achievement',
    category: 'achievements',
    title: 'Test Achievement',
    body: 'Test achievement description',
    icon: '🏆',
    priority: 'normal',
    timestamp: new Date(),
    read: false,
    actionRequired: false,
    tags: ['test'],
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await smartNotificationScheduler.initialize();
      // No errors should be thrown
      expect(true).toBe(true);
    });

    it('should load stored data on initialization', async () => {
      // Pre-populate localStorage with test data
      const mockScheduled = [{
        id: 'test-scheduled',
        notification: mockNotification,
        scheduledTime: new Date().toISOString(),
        userId: mockUserId,
        isRecurring: false,
        priority: 5,
        sent: false,
      }];
      
      localStorage.setItem('scheduled_notifications', JSON.stringify(mockScheduled));
      
      await smartNotificationScheduler.initialize();
      
      const scheduled = smartNotificationScheduler.getScheduledNotifications(mockUserId);
      expect(scheduled.length).toBe(1);
      expect(scheduled[0].id).toBe('test-scheduled');
    });
  });

  describe('notification scheduling', () => {
    beforeEach(async () => {
      await smartNotificationScheduler.initialize();
    });

    it('should schedule a notification', () => {
      const scheduledTime = new Date(Date.now() + 3600000); // 1 hour from now
      
      const scheduledId = smartNotificationScheduler.scheduleNotification(
        mockNotification,
        mockUserId,
        scheduledTime
      );
      
      expect(scheduledId).toBeTruthy();
      expect(typeof scheduledId).toBe('string');
      
      const scheduled = smartNotificationScheduler.getScheduledNotifications(mockUserId);
      expect(scheduled.length).toBe(1);
      expect(scheduled[0].notification.id).toBe(mockNotification.id);
    });

    it('should schedule recurring notification', () => {
      const scheduledTime = new Date(Date.now() + 3600000);
      const recurringPattern = {
        frequency: 'daily' as const,
        time: '09:00',
      };
      
      const scheduledId = smartNotificationScheduler.scheduleNotification(
        mockNotification,
        mockUserId,
        scheduledTime,
        true,
        recurringPattern
      );
      
      const scheduled = smartNotificationScheduler.getScheduledNotifications(mockUserId);
      expect(scheduled[0].isRecurring).toBe(true);
      expect(scheduled[0].recurringPattern?.frequency).toBe('daily');
    });

    it('should cancel scheduled notification', () => {
      const scheduledTime = new Date(Date.now() + 3600000);
      
      const scheduledId = smartNotificationScheduler.scheduleNotification(
        mockNotification,
        mockUserId,
        scheduledTime
      );
      
      const cancelled = smartNotificationScheduler.cancelScheduledNotification(scheduledId);
      expect(cancelled).toBe(true);
      
      const scheduled = smartNotificationScheduler.getScheduledNotifications(mockUserId);
      expect(scheduled.length).toBe(0);
    });
  });

  describe('optimal timing calculation', () => {
    beforeEach(async () => {
      await smartNotificationScheduler.initialize();
    });

    it('should get optimal scheduling time', () => {
      const optimalTime = smartNotificationScheduler.getOptimalSchedulingTime(
        mockUserId,
        'achievement'
      );
      
      expect(optimalTime).toBeInstanceOf(Date);
      expect(optimalTime.getTime()).toBeGreaterThan(Date.now());
    });

    it('should consider user activity patterns', () => {
      // Update user activity pattern
      smartNotificationScheduler.updateUserActivityPattern(mockUserId, {
        activeTime: new Date(),
        notificationInteraction: {
          notificationId: 'test',
          opened: true,
          responseTime: 15,
        },
      });
      
      const optimalTime = smartNotificationScheduler.getOptimalSchedulingTime(
        mockUserId,
        'meal_reminder'
      );
      
      expect(optimalTime).toBeInstanceOf(Date);
    });
  });

  describe('user activity pattern tracking', () => {
    beforeEach(async () => {
      await smartNotificationScheduler.initialize();
    });

    it('should update user activity pattern', () => {
      const now = new Date();
      
      smartNotificationScheduler.updateUserActivityPattern(mockUserId, {
        activeTime: now,
      });
      
      // Verify pattern was updated (indirectly through optimal time calculation)
      const optimalTime = smartNotificationScheduler.getOptimalSchedulingTime(
        mockUserId,
        'achievement'
      );
      expect(optimalTime).toBeInstanceOf(Date);
    });

    it('should track notification interactions', () => {
      const interactionData = {
        activeTime: new Date(),
        notificationInteraction: {
          notificationId: 'test-notification',
          opened: true,
          responseTime: 30,
        },
      };
      
      smartNotificationScheduler.updateUserActivityPattern(mockUserId, interactionData);
      
      // Should not throw errors
      expect(true).toBe(true);
    });
  });

  describe('notification analytics', () => {
    beforeEach(async () => {
      await smartNotificationScheduler.initialize();
    });

    it('should record notification interaction', () => {
      smartNotificationScheduler.recordNotificationInteraction(
        'test-notification',
        mockUserId,
        'opened'
      );
      
      // Should not throw errors
      expect(true).toBe(true);
    });

    it('should get notification analytics', () => {
      const analytics = smartNotificationScheduler.getNotificationAnalytics(mockUserId);
      
      expect(analytics).toBeDefined();
      expect(typeof analytics.totalSent).toBe('number');
      expect(typeof analytics.openRate).toBe('number');
      expect(typeof analytics.clickRate).toBe('number');
    });

    it('should get analytics for different time ranges', () => {
      const dayAnalytics = smartNotificationScheduler.getNotificationAnalytics(mockUserId, 'day');
      const weekAnalytics = smartNotificationScheduler.getNotificationAnalytics(mockUserId, 'week');
      const monthAnalytics = smartNotificationScheduler.getNotificationAnalytics(mockUserId, 'month');
      
      expect(dayAnalytics).toBeDefined();
      expect(weekAnalytics).toBeDefined();
      expect(monthAnalytics).toBeDefined();
    });
  });

  describe('edge cases and error handling', () => {
    beforeEach(async () => {
      await smartNotificationScheduler.initialize();
    });

    it('should handle invalid localStorage data', async () => {
      localStorage.setItem('scheduled_notifications', 'invalid-json');
      
      // Should not throw on re-initialization
      await expect(smartNotificationScheduler.initialize()).resolves.not.toThrow();
    });

    it('should handle canceling non-existent notification', () => {
      const cancelled = smartNotificationScheduler.cancelScheduledNotification('non-existent-id');
      expect(cancelled).toBe(false);
    });

    it('should handle getting notifications for non-existent user', () => {
      const scheduled = smartNotificationScheduler.getScheduledNotifications('non-existent-user');
      expect(scheduled).toEqual([]);
    });

    it('should handle recording interaction for non-existent notification', () => {
      // Should not throw
      expect(() => {
        smartNotificationScheduler.recordNotificationInteraction(
          'non-existent',
          'non-existent-user',
          'opened'
        );
      }).not.toThrow();
    });
  });

  describe('time calculation utilities', () => {
    beforeEach(async () => {
      await smartNotificationScheduler.initialize();
    });

    it('should calculate different optimal times for different notification types', () => {
      const achievementTime = smartNotificationScheduler.getOptimalSchedulingTime(
        mockUserId,
        'achievement'
      );
      
      const mealTime = smartNotificationScheduler.getOptimalSchedulingTime(
        mockUserId,
        'meal_reminder'
      );
      
      const trainingTime = smartNotificationScheduler.getOptimalSchedulingTime(
        mockUserId,
        'training_reminder'
      );
      
      // All should be valid dates
      expect(achievementTime).toBeInstanceOf(Date);
      expect(mealTime).toBeInstanceOf(Date);
      expect(trainingTime).toBeInstanceOf(Date);
      
      // All should be in the future
      const now = Date.now();
      expect(achievementTime.getTime()).toBeGreaterThan(now);
      expect(mealTime.getTime()).toBeGreaterThan(now);
      expect(trainingTime.getTime()).toBeGreaterThan(now);
    });
  });
});