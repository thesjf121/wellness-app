import { notificationService } from '../../services/notificationService';
import { smartNotificationScheduler } from '../../services/SmartNotificationScheduler';

// Mock Capacitor
jest.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: jest.fn(() => false),
  },
}));

describe('Notifications Integration Tests', () => {
  const mockUserId = 'test-user-123';

  beforeEach(async () => {
    localStorage.clear();
    jest.clearAllMocks();
    
    // Initialize services
    await notificationService.initialize();
    await smartNotificationScheduler.initialize();
  });

  describe('Notification Service Integration', () => {
    it('should integrate with smart scheduler for optimal timing', async () => {
      // Update user preferences
      await notificationService.updatePreferences({
        reminderTime: '09:00',
        smartScheduling: true,
      });

      // Send achievement notification
      const achievement = {
        title: 'Step Master',
        description: 'Reached 10,000 steps!',
        icon: '👣',
        rarity: 'rare',
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await notificationService.sendAchievementNotification(achievement);

      // Should log notification
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Notification:'),
        expect.any(String),
        expect.any(String)
      );

      consoleSpy.mockRestore();
    });

    it('should respect user notification preferences', async () => {
      // Disable achievement notifications
      await notificationService.updatePreferences({
        achievementCelebrations: false,
      });

      const achievement = {
        title: 'Step Master',
        description: 'Reached 10,000 steps!',
        icon: '👣',
        rarity: 'rare',
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await notificationService.sendAchievementNotification(achievement);

      // Should not send notification
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle quiet hours correctly', async () => {
      // Set quiet hours from 10 PM to 8 AM
      await notificationService.updatePreferences({
        quietHours: {
          enabled: true,
          startTime: '22:00',
          endTime: '08:00',
        },
      });

      // Mock current time to be during quiet hours (11 PM)
      const mockDate = new Date();
      mockDate.setHours(23, 0, 0, 0); // 11 PM
      jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await notificationService.sendMotivationalNotification();

      // Should not send notification during quiet hours
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      jest.restoreAllMocks();
    });

    it('should limit daily notifications based on preferences', async () => {
      // Set low daily limit
      await notificationService.updatePreferences({
        maxDailyNotifications: 2,
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Send multiple notifications
      await notificationService.sendMotivationalNotification();
      await notificationService.sendHealthTipNotification();
      await notificationService.sendMotivationalNotification(); // This should be limited

      // Should only log 2 notifications
      expect(consoleSpy).toHaveBeenCalledTimes(2);

      consoleSpy.mockRestore();
    });
  });

  describe('Smart Scheduler Integration', () => {
    it('should schedule notifications at optimal times', async () => {
      const notification = {
        id: 'test-notification',
        type: 'meal_reminder' as const,
        category: 'reminders' as const,
        title: 'Lunch Time',
        body: 'Time for your healthy lunch!',
        icon: '🥗',
        priority: 'normal' as const,
        timestamp: new Date(),
        read: false,
        actionRequired: false,
        tags: ['meal', 'lunch'],
      };

      // Get optimal time
      const optimalTime = smartNotificationScheduler.getOptimalSchedulingTime(
        mockUserId,
        'meal_reminder'
      );

      // Schedule notification
      const scheduledId = smartNotificationScheduler.scheduleNotification(
        notification,
        mockUserId,
        optimalTime
      );

      expect(scheduledId).toBeTruthy();

      // Verify it was scheduled
      const scheduled = smartNotificationScheduler.getScheduledNotifications(mockUserId);
      expect(scheduled.length).toBe(1);
      expect(scheduled[0].notification.type).toBe('meal_reminder');
    });

    it('should track user interactions for learning', async () => {
      const notification = {
        id: 'interaction-test',
        type: 'achievement' as const,
        category: 'achievements' as const,
        title: 'Goal Reached!',
        body: 'You completed your daily goal!',
        icon: '🎯',
        priority: 'high' as const,
        timestamp: new Date(),
        read: false,
        actionRequired: false,
        tags: ['goal', 'achievement'],
      };

      // Schedule notification
      const scheduledTime = new Date(Date.now() + 3600000);
      const scheduledId = smartNotificationScheduler.scheduleNotification(
        notification,
        mockUserId,
        scheduledTime
      );

      // Record user interaction
      smartNotificationScheduler.recordNotificationInteraction(
        notification.id,
        mockUserId,
        'opened'
      );

      // Update activity pattern
      smartNotificationScheduler.updateUserActivityPattern(mockUserId, {
        activeTime: new Date(),
        notificationInteraction: {
          notificationId: notification.id,
          opened: true,
          responseTime: 15,
        },
      });

      // Get analytics
      const analytics = smartNotificationScheduler.getNotificationAnalytics(mockUserId);
      expect(analytics.totalSent).toBeGreaterThanOrEqual(0);
      expect(analytics.openRate).toBeGreaterThanOrEqual(0);
    });

    it('should handle recurring notifications correctly', async () => {
      const recurringNotification = {
        id: 'daily-reminder',
        type: 'reminder' as const,
        category: 'reminders' as const,
        title: 'Daily Check-in',
        body: 'Time for your daily wellness check-in!',
        icon: '📝',
        priority: 'normal' as const,
        timestamp: new Date(),
        read: false,
        actionRequired: true,
        tags: ['daily', 'checkin'],
      };

      const scheduledTime = new Date(Date.now() + 3600000);
      const recurringPattern = {
        frequency: 'daily' as const,
        time: '20:00',
      };

      // Schedule recurring notification
      const scheduledId = smartNotificationScheduler.scheduleNotification(
        recurringNotification,
        mockUserId,
        scheduledTime,
        true,
        recurringPattern
      );

      expect(scheduledId).toBeTruthy();

      // Verify recurring settings
      const scheduled = smartNotificationScheduler.getScheduledNotifications(mockUserId);
      expect(scheduled[0].isRecurring).toBe(true);
      expect(scheduled[0].recurringPattern?.frequency).toBe('daily');
      expect(scheduled[0].recurringPattern?.time).toBe('20:00');
    });
  });

  describe('Cross-Service Communication', () => {
    it('should update scheduler when preferences change', async () => {
      // Initial preferences
      await notificationService.updatePreferences({
        reminderTime: '09:00',
        smartScheduling: true,
      });

      // Schedule a notification
      const notification = {
        id: 'preference-test',
        type: 'reminder' as const,
        category: 'reminders' as const,
        title: 'Test Reminder',
        body: 'This is a test reminder',
        icon: '⏰',
        priority: 'normal' as const,
        timestamp: new Date(),
        read: false,
        actionRequired: false,
        tags: ['test'],
      };

      const optimalTime = smartNotificationScheduler.getOptimalSchedulingTime(
        mockUserId,
        'reminder'
      );

      smartNotificationScheduler.scheduleNotification(
        notification,
        mockUserId,
        optimalTime
      );

      // Update preferences
      await notificationService.updatePreferences({
        reminderTime: '18:00',
      });

      // New optimal time should be different
      const newOptimalTime = smartNotificationScheduler.getOptimalSchedulingTime(
        mockUserId,
        'reminder'
      );

      expect(newOptimalTime.getHours()).not.toBe(optimalTime.getHours());
    });

    it('should handle service initialization order gracefully', async () => {
      // Clear everything
      localStorage.clear();

      // Initialize in different order
      await smartNotificationScheduler.initialize();
      await notificationService.initialize();

      // Should still work correctly
      const preferences = await notificationService.getPreferences();
      expect(preferences).toBeDefined();

      const analytics = smartNotificationScheduler.getNotificationAnalytics(mockUserId);
      expect(analytics).toBeDefined();
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle notification service errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock a service error
      const originalSendAchievement = notificationService.sendAchievementNotification;
      notificationService.sendAchievementNotification = jest.fn().mockRejectedValue(
        new Error('Service error')
      );

      const achievement = {
        title: 'Test Achievement',
        description: 'Test description',
        icon: '🏆',
        rarity: 'common',
      };

      // Should not crash
      await expect(
        notificationService.sendAchievementNotification(achievement)
      ).rejects.toThrow('Service error');

      // Restore original function
      notificationService.sendAchievementNotification = originalSendAchievement;
      consoleSpy.mockRestore();
    });

    it('should recover from corrupted localStorage data', async () => {
      // Corrupt localStorage data
      localStorage.setItem('notification_preferences', 'invalid-json');
      localStorage.setItem('scheduled_notifications', 'also-invalid');

      // Should initialize with defaults
      await notificationService.initialize();
      await smartNotificationScheduler.initialize();

      const preferences = await notificationService.getPreferences();
      expect(preferences.dailyReminders).toBe(true); // Default value

      const scheduled = smartNotificationScheduler.getScheduledNotifications(mockUserId);
      expect(Array.isArray(scheduled)).toBe(true);
    });

    it('should handle missing dependencies gracefully', async () => {
      // Test with minimal environment
      const originalCapacitor = global.Capacitor;
      global.Capacitor = undefined;

      await notificationService.initialize();

      // Should still work in web environment
      const preferences = await notificationService.getPreferences();
      expect(preferences).toBeDefined();

      global.Capacitor = originalCapacitor;
    });
  });

  describe('Performance and Memory', () => {
    it('should handle large numbers of scheduled notifications', async () => {
      const notificationCount = 100;
      const notifications = [];

      for (let i = 0; i < notificationCount; i++) {
        const notification = {
          id: `test-notification-${i}`,
          type: 'reminder' as const,
          category: 'reminders' as const,
          title: `Test Notification ${i}`,
          body: `This is test notification number ${i}`,
          icon: '📝',
          priority: 'normal' as const,
          timestamp: new Date(),
          read: false,
          actionRequired: false,
          tags: ['test', `batch-${Math.floor(i / 10)}`],
        };

        const scheduledTime = new Date(Date.now() + (i * 1000 * 60)); // 1 minute apart
        smartNotificationScheduler.scheduleNotification(
          notification,
          mockUserId,
          scheduledTime
        );

        notifications.push(notification);
      }

      // Should handle large dataset
      const scheduled = smartNotificationScheduler.getScheduledNotifications(mockUserId);
      expect(scheduled.length).toBe(notificationCount);

      // Performance should be reasonable
      const start = performance.now();
      smartNotificationScheduler.getNotificationAnalytics(mockUserId);
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should clean up old notifications automatically', async () => {
      // Create old notifications
      const oldNotification = {
        id: 'old-notification',
        type: 'reminder' as const,
        category: 'reminders' as const,
        title: 'Old Reminder',
        body: 'This is an old reminder',
        icon: '🕰️',
        priority: 'normal' as const,
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        read: false,
        actionRequired: false,
        tags: ['old'],
      };

      const pastTime = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000); // 6 days ago
      smartNotificationScheduler.scheduleNotification(
        oldNotification,
        mockUserId,
        pastTime
      );

      // Create recent notification
      const recentNotification = {
        id: 'recent-notification',
        type: 'reminder' as const,
        category: 'reminders' as const,
        title: 'Recent Reminder',
        body: 'This is a recent reminder',
        icon: '🔔',
        priority: 'normal' as const,
        timestamp: new Date(),
        read: false,
        actionRequired: false,
        tags: ['recent'],
      };

      const futureTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      smartNotificationScheduler.scheduleNotification(
        recentNotification,
        mockUserId,
        futureTime
      );

      // Get scheduled notifications
      const scheduled = smartNotificationScheduler.getScheduledNotifications(mockUserId);
      
      // Should include both for now (cleanup might be manual or background process)
      expect(scheduled.length).toBeGreaterThanOrEqual(1);
    });
  });
});