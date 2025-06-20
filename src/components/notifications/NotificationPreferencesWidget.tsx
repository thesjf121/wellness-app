import React, { useState, useEffect } from 'react';
import { notificationService, NotificationPreferences } from '../../services/notificationService';

interface NotificationPreferencesWidgetProps {
  compact?: boolean;
  onPreferencesChange?: (preferences: NotificationPreferences) => void;
}

interface NotificationCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  settings: Array<{
    key: keyof NotificationPreferences;
    label: string;
    description: string;
    type: 'boolean' | 'time' | 'number' | 'select' | 'timeArray';
    options?: string[];
  }>;
}

const NotificationPreferencesWidget: React.FC<NotificationPreferencesWidgetProps> = ({
  compact = false,
  onPreferencesChange
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await notificationService.getPreferences();
      setPreferences(prefs);
      setLoading(false);
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: any) => {
    if (!preferences) return;

    const updatedPreferences = { ...preferences, [key]: value };
    setPreferences(updatedPreferences);

    try {
      await notificationService.updatePreferences({ [key]: value });
      onPreferencesChange?.(updatedPreferences);
    } catch (error) {
      console.error('Error updating notification preference:', error);
    }
  };

  const updateNestedPreference = async (parentKey: keyof NotificationPreferences, childKey: string, value: any) => {
    if (!preferences) return;

    const updatedParent = { ...(preferences[parentKey] as any), [childKey]: value };
    const updatedPreferences = { ...preferences, [parentKey]: updatedParent };
    setPreferences(updatedPreferences);

    try {
      await notificationService.updatePreferences({ [parentKey]: updatedParent });
      onPreferencesChange?.(updatedPreferences);
    } catch (error) {
      console.error('Error updating nested notification preference:', error);
    }
  };

  const sendTestNotification = async () => {
    setTestingNotification(true);
    try {
      await notificationService.sendMotivationalNotification();
      // Show success message
      setTimeout(() => setTestingNotification(false), 2000);
    } catch (error) {
      console.error('Error sending test notification:', error);
      setTestingNotification(false);
    }
  };

  const notificationCategories: NotificationCategory[] = [
    {
      id: 'achievements',
      title: 'Achievements & Celebrations',
      description: 'Get notified about your progress and milestones',
      icon: '🏆',
      settings: [
        {
          key: 'goalReached',
          label: 'Goal Reached',
          description: 'When you reach your daily step goal',
          type: 'boolean'
        },
        {
          key: 'streakMilestones',
          label: 'Streak Milestones',
          description: 'When you hit streak milestones (3, 7, 30 days, etc.)',
          type: 'boolean'
        },
        {
          key: 'personalBest',
          label: 'Personal Best',
          description: 'When you set new personal records',
          type: 'boolean'
        },
        {
          key: 'achievementCelebrations',
          label: 'Badge Achievements',
          description: 'When you earn new badges and achievements',
          type: 'boolean'
        }
      ]
    },
    {
      id: 'reminders',
      title: 'Daily Reminders',
      description: 'Helpful reminders to keep you on track',
      icon: '⏰',
      settings: [
        {
          key: 'dailyReminders',
          label: 'Daily Wellness Reminder',
          description: 'Daily motivation and check-in',
          type: 'boolean'
        },
        {
          key: 'mealReminders',
          label: 'Meal Logging Reminders',
          description: 'Reminders to log your meals',
          type: 'boolean'
        },
        {
          key: 'trainingReminders',
          label: 'Training Reminders',
          description: 'Continue your wellness education',
          type: 'boolean'
        },
        {
          key: 'reminderTime',
          label: 'Daily Reminder Time',
          description: 'When to send your daily wellness reminder',
          type: 'time'
        }
      ]
    },
    {
      id: 'social',
      title: 'Social & Groups',
      description: 'Stay connected with your wellness community',
      icon: '👥',
      settings: [
        {
          key: 'groupActivity',
          label: 'Group Activity',
          description: 'When team members complete activities',
          type: 'boolean'
        },
        {
          key: 'socialChallenges',
          label: 'Social Challenges',
          description: 'Group challenges and competitions',
          type: 'boolean'
        }
      ]
    },
    {
      id: 'wellness',
      title: 'Wellness Content',
      description: 'Educational and motivational content',
      icon: '🌱',
      settings: [
        {
          key: 'motivationalMessages',
          label: 'Motivational Messages',
          description: 'Inspiring messages to keep you motivated',
          type: 'boolean'
        },
        {
          key: 'healthTips',
          label: 'Health Tips',
          description: 'Daily wellness tips and advice',
          type: 'boolean'
        },
        {
          key: 'weeklySummary',
          label: 'Weekly Summary',
          description: 'Your weekly progress summary',
          type: 'boolean'
        }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <span className="text-2xl mb-2 block">⚠️</span>
          <p>Unable to load notification preferences</p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
          <span className="text-xl">🔔</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Push Notifications</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.pushNotifications}
                onChange={(e) => updatePreference('pushNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Daily Reminders</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.dailyReminders}
                onChange={(e) => updatePreference('dailyReminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Achievements</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.achievementCelebrations}
                onChange={(e) => updatePreference('achievementCelebrations', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <button className="w-full mt-3 text-xs bg-blue-50 text-blue-700 py-2 px-3 rounded hover:bg-blue-100">
          Manage All Settings
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 text-lg">Notification Preferences</h3>
        <span className="text-2xl">🔔</span>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-blue-900">Test Notifications</h4>
            <p className="text-sm text-blue-700">Send a test notification to see how they look</p>
          </div>
          <button
            onClick={sendTestNotification}
            disabled={testingNotification}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testingNotification ? '✓ Sent!' : 'Send Test'}
          </button>
        </div>
      </div>

      {/* Master Controls */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Master Controls</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-700">Push Notifications</label>
              <p className="text-sm text-gray-500">Mobile push notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.pushNotifications}
                onChange={(e) => updatePreference('pushNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-700">Email Notifications</label>
              <p className="text-sm text-gray-500">Email summaries and updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) => updatePreference('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Notification Categories */}
      <div className="space-y-6">
        {notificationCategories.map(category => (
          <div key={category.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">{category.icon}</span>
              <div>
                <h4 className="font-medium text-gray-900">{category.title}</h4>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              {category.settings.map(setting => (
                <div key={setting.key} className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="font-medium text-gray-700 text-sm">{setting.label}</label>
                    <p className="text-xs text-gray-500">{setting.description}</p>
                  </div>

                  <div className="ml-4">
                    {setting.type === 'boolean' && (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences[setting.key] as boolean}
                          onChange={(e) => updatePreference(setting.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    )}

                    {setting.type === 'time' && (
                      <input
                        type="time"
                        value={preferences[setting.key] as string || ''}
                        onChange={(e) => updatePreference(setting.key, e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    )}

                    {setting.type === 'number' && (
                      <input
                        type="number"
                        value={preferences[setting.key] as number || 0}
                        onChange={(e) => updatePreference(setting.key, parseInt(e.target.value))}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-20"
                        min="0"
                        max="50"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Settings */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Advanced Settings</h4>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            {/* Quiet Hours */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="font-medium text-gray-700">Quiet Hours</label>
                  <p className="text-sm text-gray-600">No notifications during these hours</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.quietHours.enabled}
                    onChange={(e) => updateNestedPreference('quietHours', 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {preferences.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={preferences.quietHours.startTime}
                      onChange={(e) => updateNestedPreference('quietHours', 'startTime', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      value={preferences.quietHours.endTime}
                      onChange={(e) => updateNestedPreference('quietHours', 'endTime', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Frequency Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-700">Max Daily Notifications</label>
                  <p className="text-sm text-gray-600">Limit per day</p>
                </div>
                <input
                  type="number"
                  value={preferences.maxDailyNotifications}
                  onChange={(e) => updatePreference('maxDailyNotifications', parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-20"
                  min="1"
                  max="50"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-700">Smart Scheduling</label>
                  <p className="text-sm text-gray-600">AI-optimized timing</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.smartScheduling}
                    onChange={(e) => updatePreference('smartScheduling', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Re-engagement */}
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">Re-engagement Campaigns</label>
                <p className="text-sm text-gray-600">Notifications to bring you back if inactive</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.reEngagementCampaigns}
                  onChange={(e) => updatePreference('reEngagementCampaigns', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Reset Button */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={() => {
            // Reset to defaults logic would go here
            console.log('Reset to defaults');
          }}
          className="text-red-600 hover:text-red-700 text-sm font-medium"
        >
          Reset to Default Settings
        </button>
      </div>
    </div>
  );
};

export default NotificationPreferencesWidget;