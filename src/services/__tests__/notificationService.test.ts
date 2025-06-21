import { notificationService, NotificationPreferences } from '../notificationService';

// Mock Capacitor
jest.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: jest.fn(() => false),
  },
}));

describe('NotificationService', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default preferences', async () => {
      await notificationService.initialize();
      const preferences = await notificationService.getPreferences();
      
      expect(preferences.dailyReminders).toBe(true);
      expect(preferences.achievementCelebrations).toBe(true);
      expect(preferences.pushNotifications).toBe(true);
      expect(preferences.reminderTime).toBe('09:00');
    });

    it('should load saved preferences from localStorage', async () => {
      const savedPrefs: Partial<NotificationPreferences> = {
        dailyReminders: false,
        reminderTime: '09:00',
        maxDailyNotifications: 5,
      };
      
      localStorage.setItem('notification_preferences', JSON.stringify(savedPrefs));
      
      await notificationService.initialize();
      const preferences = await notificationService.getPreferences();
      
      expect(preferences.dailyReminders).toBe(false);
      expect(preferences.reminderTime).toBe('09:00');
      expect(preferences.maxDailyNotifications).toBe(5);
    });
  });

  describe('preference management', () => {
    beforeEach(async () => {
      await notificationService.initialize();
    });

    it('should update preferences correctly', async () => {
      const updates = {
        dailyReminders: false,
        mealReminders: false,
        maxDailyNotifications: 15,
      };

      await notificationService.updatePreferences(updates);
      const preferences = await notificationService.getPreferences();

      expect(preferences.dailyReminders).toBe(false);
      expect(preferences.mealReminders).toBe(false);
      expect(preferences.maxDailyNotifications).toBe(15);
    });

    it('should persist preferences to localStorage', async () => {
      const updates = {
        quietHours: {
          enabled: true,
          startTime: '22:00',
          endTime: '08:00',
        },
      };

      await notificationService.updatePreferences(updates);
      
      const storedPrefs = JSON.parse(localStorage.getItem('notification_preferences') || '{}');
      expect(storedPrefs.quietHours.enabled).toBe(true);
      expect(storedPrefs.quietHours.startTime).toBe('22:00');
    });
  });

  describe('notification sending', () => {
    beforeEach(async () => {
      await notificationService.initialize();
    });

    it('should send achievement notification when enabled', async () => {
      const achievement = {
        title: 'Step Warrior',
        description: 'Reached 10,000 steps',
        icon: '🏃‍♂️',
        rarity: 'uncommon',
      };

      // Mock console.log to capture notification
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await notificationService.sendAchievementNotification(achievement);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Notification:'),
        expect.stringContaining('Achievement Unlocked!'),
        expect.any(String)
      );

      consoleSpy.mockRestore();
    });

    it('should not send achievement notification when disabled', async () => {
      await notificationService.updatePreferences({ achievementCelebrations: false });

      const achievement = {
        title: 'Step Warrior',
        description: 'Reached 10,000 steps',
        icon: '🏃‍♂️',
        rarity: 'uncommon',
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await notificationService.sendAchievementNotification(achievement);

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should send streak notification with correct message', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await notificationService.sendStreakMilestoneNotification(7);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Notification:'),
        expect.stringContaining('Streak milestone!'),
        expect.stringContaining('7-day streak')
      );

      consoleSpy.mockRestore();
    });

    it('should send group activity notification', async () => {
      const activity = {
        memberName: 'John Doe',
        action: 'completed their daily goal',
        groupName: 'Team Alpha',
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await notificationService.sendGroupActivityNotification(activity);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Notification:'),
        expect.stringContaining('Group Activity'),
        expect.stringContaining('John Doe completed their daily goal')
      );

      consoleSpy.mockRestore();
    });

    it('should send meal reminder notification', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await notificationService.sendMealReminderNotification('breakfast');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Notification:'),
        expect.stringContaining('Time for breakfast!'),
        expect.any(String)
      );

      consoleSpy.mockRestore();
    });

    it('should send training reminder notification', async () => {
      const module = {
        title: 'Module 3: Nutrition',
        progress: 65,
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await notificationService.sendTrainingReminderNotification(module);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Notification:'),
        expect.stringContaining('Learning Time!'),
        expect.stringContaining('Module 3: Nutrition')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('motivational notifications', () => {
    beforeEach(async () => {
      await notificationService.initialize();
    });

    it('should send motivational notification', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await notificationService.sendMotivationalNotification();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Notification:'),
        expect.stringMatching(/💪|🌟|🔥|🎯|🌱/),
        expect.any(String)
      );

      consoleSpy.mockRestore();
    });

    it('should send health tip notification', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await notificationService.sendHealthTipNotification();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Notification:'),
        expect.stringMatching(/💧|🚶|😴|🧘|🥗/),
        expect.any(String)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('re-engagement notifications', () => {
    beforeEach(async () => {
      await notificationService.initialize();
      await notificationService.updatePreferences({ reEngagementCampaigns: true });
    });

    it('should send appropriate re-engagement message for recent inactivity', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await notificationService.sendReEngagementNotification(2);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Notification:'),
        expect.stringContaining('We miss you!'),
        expect.any(String)
      );

      consoleSpy.mockRestore();
    });

    it('should send appropriate re-engagement message for longer inactivity', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await notificationService.sendReEngagementNotification(10);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Notification:'),
        expect.stringContaining('New features await!'),
        expect.any(String)
      );

      consoleSpy.mockRestore();
    });

    it('should not send re-engagement when disabled', async () => {
      await notificationService.updatePreferences({ reEngagementCampaigns: false });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await notificationService.sendReEngagementNotification(5);

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('analytics tracking', () => {
    beforeEach(async () => {
      await notificationService.initialize();
    });

    it('should track notification analytics', async () => {
      const analytics = await notificationService.getNotificationAnalytics();
      
      expect(Array.isArray(analytics)).toBe(true);
    });

    it('should clear notification data', async () => {
      // Send a notification first
      await notificationService.sendMotivationalNotification();
      
      // Clear data
      await notificationService.clearNotificationData();
      
      // Check preferences are reset
      const preferences = await notificationService.getPreferences();
      expect(preferences.reminderTime).toBe('09:00'); // Default value
    });
  });

  describe('edge cases', () => {
    it('should handle invalid localStorage data gracefully', async () => {
      localStorage.setItem('notification_preferences', 'invalid-json');
      
      await notificationService.initialize();
      const preferences = await notificationService.getPreferences();
      
      // Should fall back to defaults
      expect(preferences.dailyReminders).toBe(true);
    });

    it('should handle missing properties in saved preferences', async () => {
      const partialPrefs = { dailyReminders: false };
      localStorage.setItem('notification_preferences', JSON.stringify(partialPrefs));
      
      await notificationService.initialize();
      const preferences = await notificationService.getPreferences();
      
      expect(preferences.dailyReminders).toBe(false);
      expect(preferences.achievementCelebrations).toBe(true); // Should use default
    });
  });
});