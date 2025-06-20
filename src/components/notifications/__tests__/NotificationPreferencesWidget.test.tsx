import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationPreferencesWidget from '../NotificationPreferencesWidget';
import * as notificationService from '../../../services/notificationService';

// Mock the notification service
jest.mock('../../../services/notificationService', () => ({
  notificationService: {
    getPreferences: jest.fn(),
    updatePreferences: jest.fn(),
    sendMotivationalNotification: jest.fn(),
  },
}));

const mockNotificationService = notificationService.notificationService as jest.Mocked<typeof notificationService.notificationService>;

describe('NotificationPreferencesWidget', () => {
  const mockPreferences = {
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
    reEngagementCampaigns: false,
    
    // Timing preferences
    reminderTime: '20:00',
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockNotificationService.getPreferences.mockResolvedValue(mockPreferences);
    mockNotificationService.updatePreferences.mockResolvedValue();
    mockNotificationService.sendMotivationalNotification.mockResolvedValue();
  });

  describe('rendering', () => {
    it('should render loading state initially', () => {
      render(<NotificationPreferencesWidget />);
      
      expect(screen.getByTestId('loading-spinner') || screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should render full widget after loading', async () => {
      render(<NotificationPreferencesWidget />);
      
      await waitFor(() => {
        expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
      });

      expect(screen.getByText('Test Notifications')).toBeInTheDocument();
      expect(screen.getByText('Master Controls')).toBeInTheDocument();
      expect(screen.getByText('Achievements & Celebrations')).toBeInTheDocument();
    });

    it('should render compact version when specified', async () => {
      render(<NotificationPreferencesWidget compact />);
      
      await waitFor(() => {
        expect(screen.getByText('Notifications')).toBeInTheDocument();
      });

      expect(screen.getByText('Push Notifications')).toBeInTheDocument();
      expect(screen.getByText('Daily Reminders')).toBeInTheDocument();
      expect(screen.getByText('Achievements')).toBeInTheDocument();
    });
  });

  describe('preference management', () => {
    it('should load and display current preferences', async () => {
      render(<NotificationPreferencesWidget />);
      
      await waitFor(() => {
        expect(mockNotificationService.getPreferences).toHaveBeenCalled();
      });

      // Check that toggles reflect current state
      const pushToggle = screen.getByRole('checkbox', { name: /push notifications/i });
      expect(pushToggle).toBeChecked();
    });

    it('should update preferences when toggles are clicked', async () => {
      render(<NotificationPreferencesWidget />);
      
      await waitFor(() => {
        expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
      });

      const pushToggle = screen.getByRole('checkbox', { name: /push notifications/i });
      fireEvent.click(pushToggle);

      await waitFor(() => {
        expect(mockNotificationService.updatePreferences).toHaveBeenCalledWith({
          pushNotifications: false
        });
      });
    });

    it('should update time preferences', async () => {
      render(<NotificationPreferencesWidget />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('20:00')).toBeInTheDocument();
      });

      const timeInput = screen.getByDisplayValue('20:00');
      fireEvent.change(timeInput, { target: { value: '09:00' } });

      await waitFor(() => {
        expect(mockNotificationService.updatePreferences).toHaveBeenCalledWith({
          reminderTime: '09:00'
        });
      });
    });

    it('should call onPreferencesChange callback when provided', async () => {
      const mockCallback = jest.fn();
      render(<NotificationPreferencesWidget onPreferencesChange={mockCallback} />);
      
      await waitFor(() => {
        expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
      });

      const emailToggle = screen.getByRole('checkbox', { name: /email notifications/i });
      fireEvent.click(emailToggle);

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            emailNotifications: false
          })
        );
      });
    });
  });

  describe('test notification functionality', () => {
    it('should send test notification when button is clicked', async () => {
      render(<NotificationPreferencesWidget />);
      
      await waitFor(() => {
        expect(screen.getByText('Send Test')).toBeInTheDocument();
      });

      const testButton = screen.getByText('Send Test');
      fireEvent.click(testButton);

      await waitFor(() => {
        expect(mockNotificationService.sendMotivationalNotification).toHaveBeenCalled();
      });

      expect(screen.getByText('✓ Sent!')).toBeInTheDocument();
    });

    it('should disable test button while sending', async () => {
      render(<NotificationPreferencesWidget />);
      
      await waitFor(() => {
        expect(screen.getByText('Send Test')).toBeInTheDocument();
      });

      const testButton = screen.getByText('Send Test');
      fireEvent.click(testButton);

      expect(testButton).toBeDisabled();
    });
  });

  describe('advanced settings', () => {
    it('should show/hide advanced settings when toggled', async () => {
      render(<NotificationPreferencesWidget />);
      
      await waitFor(() => {
        expect(screen.getByText('Show Advanced')).toBeInTheDocument();
      });

      const advancedToggle = screen.getByText('Show Advanced');
      fireEvent.click(advancedToggle);

      expect(screen.getByText('Hide Advanced')).toBeInTheDocument();
      expect(screen.getByText('Quiet Hours')).toBeInTheDocument();
      expect(screen.getByText('Max Daily Notifications')).toBeInTheDocument();
    });

    it('should update quiet hours settings', async () => {
      render(<NotificationPreferencesWidget />);
      
      await waitFor(() => {
        expect(screen.getByText('Show Advanced')).toBeInTheDocument();
      });

      // Show advanced settings
      fireEvent.click(screen.getByText('Show Advanced'));

      // Enable quiet hours
      const quietHoursToggle = screen.getByRole('checkbox', { name: /quiet hours/i });
      fireEvent.click(quietHoursToggle);

      await waitFor(() => {
        expect(mockNotificationService.updatePreferences).toHaveBeenCalledWith({
          quietHours: expect.objectContaining({
            enabled: true
          })
        });
      });
    });

    it('should update max daily notifications', async () => {
      render(<NotificationPreferencesWidget />);
      
      await waitFor(() => {
        expect(screen.getByText('Show Advanced')).toBeInTheDocument();
      });

      // Show advanced settings
      fireEvent.click(screen.getByText('Show Advanced'));

      const maxNotificationsInput = screen.getByDisplayValue('10');
      fireEvent.change(maxNotificationsInput, { target: { value: '15' } });

      await waitFor(() => {
        expect(mockNotificationService.updatePreferences).toHaveBeenCalledWith({
          maxDailyNotifications: 15
        });
      });
    });
  });

  describe('error handling', () => {
    it('should handle preference loading error gracefully', async () => {
      mockNotificationService.getPreferences.mockRejectedValue(new Error('Failed to load'));
      
      render(<NotificationPreferencesWidget />);
      
      await waitFor(() => {
        expect(screen.getByText('Unable to load notification preferences')).toBeInTheDocument();
      });
    });

    it('should handle preference update error gracefully', async () => {
      mockNotificationService.updatePreferences.mockRejectedValue(new Error('Failed to update'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(<NotificationPreferencesWidget />);
      
      await waitFor(() => {
        expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
      });

      const pushToggle = screen.getByRole('checkbox', { name: /push notifications/i });
      fireEvent.click(pushToggle);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error updating notification preference:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it('should handle test notification error gracefully', async () => {
      mockNotificationService.sendMotivationalNotification.mockRejectedValue(new Error('Failed to send'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(<NotificationPreferencesWidget />);
      
      await waitFor(() => {
        expect(screen.getByText('Send Test')).toBeInTheDocument();
      });

      const testButton = screen.getByText('Send Test');
      fireEvent.click(testButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error sending test notification:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', async () => {
      render(<NotificationPreferencesWidget />);
      
      await waitFor(() => {
        expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
      });

      // Check for proper labeling of toggle switches
      const toggles = screen.getAllByRole('checkbox');
      toggles.forEach(toggle => {
        expect(toggle).toHaveAccessibleName();
      });
    });

    it('should be keyboard navigable', async () => {
      render(<NotificationPreferencesWidget />);
      
      await waitFor(() => {
        expect(screen.getByText('Send Test')).toBeInTheDocument();
      });

      const testButton = screen.getByText('Send Test');
      testButton.focus();
      
      expect(document.activeElement).toBe(testButton);
    });
  });
});