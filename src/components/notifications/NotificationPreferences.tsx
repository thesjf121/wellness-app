import React, { useState, useEffect } from 'react';
import { notificationService, NotificationPreferences as Preferences } from '../../services/notificationService';

interface NotificationPreferencesProps {
  onClose?: () => void;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ onClose }) => {
  const [preferences, setPreferences] = useState<Preferences>({
    goalReached: true,
    streakMilestones: true,
    personalBest: true,
    dailyReminders: true,
    weeklySummary: true,
    reminderTime: '20:00'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load current preferences
    const currentPrefs = notificationService.getPreferences();
    setPreferences(currentPrefs);
  }, []);

  const handleToggle = (key: keyof Preferences) => {
    if (key === 'reminderTime') return; // Skip for non-boolean fields
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key as keyof Omit<Preferences, 'reminderTime'>]
    }));
  };

  const handleTimeChange = (time: string) => {
    setPreferences(prev => ({
      ...prev,
      reminderTime: time
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await notificationService.updatePreferences(preferences);
      alert('Notification preferences saved!');
      if (onClose) onClose();
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
      
      <div className="space-y-4">
        {/* Goal Reached */}
        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <h3 className="font-medium text-gray-900">Goal Reached</h3>
            <p className="text-sm text-gray-600">Notify when you reach your daily step goal</p>
          </div>
          <button
            onClick={() => handleToggle('goalReached')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.goalReached ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.goalReached ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Streak Milestones */}
        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <h3 className="font-medium text-gray-900">Streak Milestones</h3>
            <p className="text-sm text-gray-600">Celebrate streak achievements (3, 7, 30 days, etc.)</p>
          </div>
          <button
            onClick={() => handleToggle('streakMilestones')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.streakMilestones ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.streakMilestones ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Personal Best */}
        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <h3 className="font-medium text-gray-900">Personal Best</h3>
            <p className="text-sm text-gray-600">Alert when you set a new personal record</p>
          </div>
          <button
            onClick={() => handleToggle('personalBest')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.personalBest ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.personalBest ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Weekly Summary */}
        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <h3 className="font-medium text-gray-900">Weekly Summary</h3>
            <p className="text-sm text-gray-600">Receive weekly progress reports on Sundays</p>
          </div>
          <button
            onClick={() => handleToggle('weeklySummary')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.weeklySummary ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.weeklySummary ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Daily Reminders */}
        <div className="py-3 border-b">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-medium text-gray-900">Daily Reminders</h3>
              <p className="text-sm text-gray-600">Remind to reach your step goal</p>
            </div>
            <button
              onClick={() => handleToggle('dailyReminders')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.dailyReminders ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.dailyReminders ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {preferences.dailyReminders && (
            <div className="ml-0 mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reminder Time
              </label>
              <input
                type="time"
                value={preferences.reminderTime || '20:00'}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end space-x-3">
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
};