import React, { useState, useEffect } from 'react';
import { 
  groupNotificationService, 
  GroupNotification, 
  NotificationPreferences,
  NotificationType 
} from '../../services/groupNotificationService';
import { errorService } from '../../services/errorService';

interface GroupNotificationsProps {
  userId: string;
  groupId?: string;
  showSettings?: boolean;
}

export const GroupNotifications: React.FC<GroupNotificationsProps> = ({ 
  userId, 
  groupId,
  showSettings = false 
}) => {
  const [notifications, setNotifications] = useState<GroupNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
    if (showSettings && groupId) {
      loadPreferences();
    }
  }, [userId, groupId]);

  const loadNotifications = async () => {
    try {
      const userNotifications = await groupNotificationService.getUserNotifications(
        userId, 
        groupId, 
        50, 
        true
      );
      setNotifications(userNotifications);
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupNotifications.loadNotifications',
        userId,
        groupId
      });
      setError('Failed to load notifications');
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await groupNotificationService.getUnreadCount(userId, groupId);
      setUnreadCount(count.total);
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupNotifications.loadUnreadCount',
        userId,
        groupId
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    if (!groupId) return;
    
    try {
      const prefs = await groupNotificationService.getUserPreferences(userId, groupId);
      setPreferences(prefs);
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupNotifications.loadPreferences',
        userId,
        groupId
      });
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await groupNotificationService.markAsRead(notificationId, userId);
      await loadNotifications();
      await loadUnreadCount();
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupNotifications.handleMarkAsRead',
        notificationId,
        userId
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await groupNotificationService.markAllAsRead(userId, groupId);
      await loadNotifications();
      await loadUnreadCount();
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupNotifications.handleMarkAllAsRead',
        userId,
        groupId
      });
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await groupNotificationService.deleteNotification(notificationId, userId);
      await loadNotifications();
      await loadUnreadCount();
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupNotifications.handleDeleteNotification',
        notificationId,
        userId
      });
    }
  };

  const handleUpdatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!groupId || !preferences) return;
    
    try {
      const updated = await groupNotificationService.updateUserPreferences(
        userId,
        groupId,
        updates
      );
      setPreferences(updated);
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupNotifications.handleUpdatePreferences',
        userId,
        groupId
      });
    }
  };

  const getNotificationIcon = (type: NotificationType): string => {
    const icons: Record<NotificationType, string> = {
      member_joined: '👋',
      member_left: '👋',
      member_removed: '❌',
      new_message: '💬',
      achievement_earned: '🏆',
      achievement_shared: '🏆',
      group_goal_reached: '🎯',
      milestone_reached: '🏁',
      training_completed: '🎓',
      sponsor_promoted: '👑',
      ownership_transferred: '👑',
      group_settings_updated: '⚙️',
      invite_sent: '📧',
      group_created: '🆕',
      group_deleted: '🗑️',
      activity_reminder: '⏰',
      weekly_summary: '📊'
    };
    return icons[type] || '📢';
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatNotificationType = (type: NotificationType): string => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading notifications...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 text-sm">{error}</p>
        <button
          onClick={loadNotifications}
          className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {unreadCount} unread
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Mark all read
            </button>
          )}
          
          {showSettings && groupId && (
            <div className="border-l border-gray-300 pl-2">
              <button
                onClick={() => setActiveTab(activeTab === 'notifications' ? 'settings' : 'notifications')}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                {activeTab === 'notifications' ? '⚙️ Settings' : '📢 Notifications'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'notifications' ? (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No notifications yet</p>
              <p className="text-sm text-gray-400 mt-1">You'll see group updates here</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border-l-4 p-4 rounded-lg ${getPriorityColor(notification.priority)} ${
                  notification.isRead ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{formatNotificationType(notification.type)}</span>
                        <span>{new Date(notification.createdAt).toLocaleString()}</span>
                        {notification.expiresAt && (
                          <span>Expires {new Date(notification.expiresAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {notification.actionUrl && notification.actionLabel && (
                      <button
                        onClick={() => {
                          // In a real app, this would navigate to the URL
                          console.log('Navigate to:', notification.actionUrl);
                          if (!notification.isRead) {
                            handleMarkAsRead(notification.id);
                          }
                        }}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                      >
                        {notification.actionLabel}
                      </button>
                    )}
                    
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs text-gray-600 hover:text-gray-800"
                      >
                        Mark read
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        preferences && (
          <div className="space-y-6">
            {/* Notification Types */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Notification Types</h4>
              <div className="space-y-2">
                {[
                  { type: 'member_joined' as NotificationType, label: 'New members joining', icon: '👋' },
                  { type: 'member_left' as NotificationType, label: 'Members leaving', icon: '👋' },
                  { type: 'achievement_earned' as NotificationType, label: 'Achievements earned', icon: '🏆' },
                  { type: 'new_message' as NotificationType, label: 'New messages', icon: '💬' },
                  { type: 'milestone_reached' as NotificationType, label: 'Milestones reached', icon: '🏁' },
                  { type: 'group_goal_reached' as NotificationType, label: 'Group goals reached', icon: '🎯' },
                  { type: 'weekly_summary' as NotificationType, label: 'Weekly summaries', icon: '📊' }
                ].map(({ type, label, icon }) => (
                  <label key={type} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={preferences.enabledTypes.includes(type)}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...preferences.enabledTypes, type]
                          : preferences.enabledTypes.filter(t => t !== type);
                        handleUpdatePreferences({ enabledTypes: newTypes });
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-lg">{icon}</span>
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Quiet Hours</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferences.quietHours.enabled}
                    onChange={(e) => {
                      handleUpdatePreferences({
                        quietHours: {
                          ...preferences.quietHours,
                          enabled: e.target.checked
                        }
                      });
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Enable quiet hours</span>
                </label>
                
                {preferences.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={preferences.quietHours.startTime}
                        onChange={(e) => {
                          handleUpdatePreferences({
                            quietHours: {
                              ...preferences.quietHours,
                              startTime: e.target.value
                            }
                          });
                        }}
                        className="block w-full text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">End Time</label>
                      <input
                        type="time"
                        value={preferences.quietHours.endTime}
                        onChange={(e) => {
                          handleUpdatePreferences({
                            quietHours: {
                              ...preferences.quietHours,
                              endTime: e.target.value
                            }
                          });
                        }}
                        className="block w-full text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Preferences */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Delivery Preferences</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferences.pushNotifications}
                    onChange={(e) => {
                      handleUpdatePreferences({ pushNotifications: e.target.checked });
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Push notifications</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={(e) => {
                      handleUpdatePreferences({ emailNotifications: e.target.checked });
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Email notifications</span>
                </label>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default GroupNotifications;