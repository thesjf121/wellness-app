import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';

interface NotificationChannel {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  available: boolean;
  description: string;
}

interface NotificationType {
  id: string;
  category: string;
  name: string;
  description: string;
  defaultEnabled: boolean;
  enabled: boolean;
}

const NotificationSetup: React.FC = () => {
  const { user } = useUser();
  
  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: 'push',
      name: 'Push Notifications',
      icon: '📱',
      enabled: false,
      available: true,
      description: 'Get instant updates on your device'
    },
    {
      id: 'email',
      name: 'Email',
      icon: '📧',
      enabled: true,
      available: true,
      description: 'Receive updates in your inbox'
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: '💬',
      enabled: false,
      available: false,
      description: 'Text message notifications (coming soon)'
    }
  ]);

  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([
    // Daily Activity
    {
      id: 'daily_reminder',
      category: 'Daily Activity',
      name: 'Daily Step Reminder',
      description: 'Remind me to reach my daily step goal',
      defaultEnabled: true,
      enabled: true
    },
    {
      id: 'goal_achieved',
      category: 'Daily Activity',
      name: 'Goal Achievement',
      description: 'Celebrate when I reach my daily goals',
      defaultEnabled: true,
      enabled: true
    },
    {
      id: 'inactive_alert',
      category: 'Daily Activity',
      name: 'Inactivity Alert',
      description: 'Remind me to move if inactive for too long',
      defaultEnabled: false,
      enabled: false
    },
    
    // Food & Nutrition
    {
      id: 'meal_reminder',
      category: 'Food & Nutrition',
      name: 'Meal Logging Reminder',
      description: 'Remind me to log my meals',
      defaultEnabled: true,
      enabled: true
    },
    {
      id: 'nutrition_insights',
      category: 'Food & Nutrition',
      name: 'Nutrition Insights',
      description: 'Weekly nutrition analysis and tips',
      defaultEnabled: true,
      enabled: true
    },
    
    // Training & Education
    {
      id: 'training_reminder',
      category: 'Training & Education',
      name: 'Training Module Reminder',
      description: 'Remind me to continue my wellness training',
      defaultEnabled: true,
      enabled: true
    },
    {
      id: 'new_content',
      category: 'Training & Education',
      name: 'New Content Available',
      description: 'Notify me about new training modules or features',
      defaultEnabled: true,
      enabled: true
    },
    
    // Social & Groups
    {
      id: 'group_activity',
      category: 'Social & Groups',
      name: 'Group Activity',
      description: 'Updates from my wellness groups',
      defaultEnabled: true,
      enabled: true
    },
    {
      id: 'group_invites',
      category: 'Social & Groups',
      name: 'Group Invitations',
      description: 'Notify me of new group invites',
      defaultEnabled: true,
      enabled: true
    },
    {
      id: 'member_milestones',
      category: 'Social & Groups',
      name: 'Member Achievements',
      description: 'Celebrate group member achievements',
      defaultEnabled: false,
      enabled: false
    },
    
    // Progress & Analytics
    {
      id: 'weekly_summary',
      category: 'Progress & Analytics',
      name: 'Weekly Summary',
      description: 'Weekly progress report every Sunday',
      defaultEnabled: true,
      enabled: true
    },
    {
      id: 'streak_milestone',
      category: 'Progress & Analytics',
      name: 'Streak Milestones',
      description: 'Celebrate streak achievements',
      defaultEnabled: true,
      enabled: true
    },
    {
      id: 'personal_best',
      category: 'Progress & Analytics',
      name: 'Personal Records',
      description: 'Notify me when I set new personal records',
      defaultEnabled: true,
      enabled: true
    }
  ]);

  const [reminderTime, setReminderTime] = useState('09:00');
  const [eveningTime, setEveningTime] = useState('20:00');
  const [saving, setSaving] = useState(false);

  const toggleChannel = (channelId: string) => {
    setChannels(prev => prev.map(channel => 
      channel.id === channelId && channel.available
        ? { ...channel, enabled: !channel.enabled }
        : channel
    ));
  };

  const toggleNotificationType = (typeId: string) => {
    setNotificationTypes(prev => prev.map(type => 
      type.id === typeId
        ? { ...type, enabled: !type.enabled }
        : type
    ));
  };

  const toggleCategory = (category: string) => {
    const categoryTypes = notificationTypes.filter(type => type.category === category);
    const allEnabled = categoryTypes.every(type => type.enabled);
    
    setNotificationTypes(prev => prev.map(type => 
      type.category === category
        ? { ...type, enabled: !allEnabled }
        : type
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Simulate saving preferences
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const preferences = {
      channels: channels.filter(c => c.enabled).map(c => c.id),
      notifications: notificationTypes.filter(t => t.enabled).map(t => t.id),
      reminderTime,
      eveningTime
    };
    
    // Save to localStorage for demo
    localStorage.setItem('wellness_notification_preferences', JSON.stringify(preferences));
    
    setSaving(false);
    alert('Notification preferences saved successfully!');
  };

  const resetToDefaults = () => {
    setNotificationTypes(prev => prev.map(type => ({
      ...type,
      enabled: type.defaultEnabled
    })));
  };

  // Group notifications by category
  const groupedNotifications = notificationTypes.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, NotificationType[]>);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Notification Preferences
        </h1>
        <p className="text-xl text-gray-600">
          Stay connected with your wellness journey. Choose how and when you want to receive updates.
        </p>
      </div>

      {/* Notification Channels */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Notification Channels</h2>
        <p className="text-gray-600 mb-6">Choose how you want to receive notifications</p>
        
        <div className="grid md:grid-cols-3 gap-4">
          {channels.map(channel => (
            <div
              key={channel.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                channel.enabled && channel.available
                  ? 'border-blue-500 bg-blue-50'
                  : channel.available
                    ? 'border-gray-200 hover:border-gray-300'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
              }`}
              onClick={() => toggleChannel(channel.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{channel.icon}</span>
                <div className={`w-5 h-5 rounded-full border-2 ${
                  channel.enabled && channel.available
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white border-gray-300'
                }`}>
                  {channel.enabled && channel.available && (
                    <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{channel.name}</h3>
              <p className="text-sm text-gray-600">{channel.description}</p>
              {!channel.available && (
                <p className="text-xs text-gray-500 mt-2">(Coming soon)</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Notification Types */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Notification Types</h2>
            <p className="text-gray-600">Choose what you want to be notified about</p>
          </div>
          <button
            onClick={resetToDefaults}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Reset to defaults
          </button>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedNotifications).map(([category, types]) => (
            <div key={category} className="border-b border-gray-200 pb-4 last:border-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{category}</h3>
                <button
                  onClick={() => toggleCategory(category)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {types.every(t => t.enabled) ? 'Disable all' : 'Enable all'}
                </button>
              </div>
              
              <div className="space-y-3">
                {types.map(type => (
                  <div key={type.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <label htmlFor={type.id} className="cursor-pointer">
                        <p className="font-medium text-gray-700">{type.name}</p>
                        <p className="text-sm text-gray-500">{type.description}</p>
                      </label>
                    </div>
                    <button
                      id={type.id}
                      onClick={() => toggleNotificationType(type.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        type.enabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          type.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timing Preferences */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Timing Preferences</h2>
        <p className="text-gray-600 mb-6">Set your preferred times for reminders</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Morning Reminder Time
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Best time for daily activity reminders
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evening Check-in Time
            </label>
            <input
              type="time"
              value={eveningTime}
              onChange={(e) => setEveningTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Time for progress updates and meal logging reminders
            </p>
          </div>
        </div>
      </div>

      {/* Quick Setup Options */}
      <div className="bg-blue-50 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-blue-900 mb-3">💡 Quick Setup Tips</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Start with push notifications for real-time updates on your wellness goals</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Enable daily reminders to build consistent healthy habits</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Weekly summaries help you track long-term progress</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>You can change these settings anytime from your profile</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Skip for now
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !channels.some(c => c.enabled)}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
};

export default NotificationSetup;