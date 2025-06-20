import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService, WellnessNotification } from '../../services/notificationService';

interface InAppNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  compact?: boolean;
}

interface NotificationGroup {
  date: string;
  notifications: WellnessNotification[];
}

const InAppNotificationCenter: React.FC<InAppNotificationCenterProps> = ({
  isOpen,
  onClose,
  compact = false
}) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<WellnessNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // In a real app, this would come from the notification service
      const mockNotifications: WellnessNotification[] = [
        {
          id: '1',
          type: 'achievement',
          category: 'achievements',
          title: '🎉 Achievement Unlocked!',
          body: 'Step Warrior - Reached 10,000 steps in a single day',
          icon: '🏃‍♂️',
          priority: 'high',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
          read: false,
          actionRequired: false,
          tags: ['achievement', 'steps']
        },
        {
          id: '2',
          type: 'meal_reminder',
          category: 'nutrition',
          title: '🌙 Time for dinner!',
          body: 'Don\'t forget to log your dinner for AI nutrition analysis',
          icon: '🥗',
          priority: 'normal',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: false,
          actionRequired: true,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
          tags: ['meal', 'nutrition', 'reminder']
        },
        {
          id: '3',
          type: 'group_activity',
          category: 'social',
          title: '👥 Group Activity',
          body: 'Sarah Johnson completed her daily step goal in Team Alpha',
          icon: '👥',
          priority: 'normal',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          read: true,
          actionRequired: false,
          tags: ['group', 'social', 'activity']
        },
        {
          id: '4',
          type: 'streak_milestone',
          category: 'achievements',
          title: '🔥 Streak Milestone!',
          body: 'Amazing! You\'ve maintained a 7-day streak. Keep it up!',
          icon: '🔥',
          priority: 'high',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          read: true,
          actionRequired: false,
          tags: ['streak', 'achievement']
        },
        {
          id: '5',
          type: 'training_reminder',
          category: 'training',
          title: '🎓 Learning Time!',
          body: 'Continue "Module 3: Nutrition" - 65% complete',
          icon: '🎓',
          priority: 'normal',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          read: true,
          actionRequired: true,
          tags: ['training', 'education']
        },
        {
          id: '6',
          type: 'health_tip',
          category: 'wellness',
          title: '💧 Hydration Tip',
          body: 'Drink a glass of water first thing in the morning to kickstart your metabolism',
          icon: '💡',
          priority: 'low',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
          read: true,
          actionRequired: false,
          tags: ['health', 'tips']
        }
      ];

      setNotifications(mockNotifications);
      setLoading(false);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setLoading(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    // notificationService.markAsRead(notificationId);
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const clearAll = () => {
    setNotifications([]);
    // notificationService.clearHistory();
  };

  const handleNotificationClick = (notification: WellnessNotification) => {
    markAsRead(notification.id);

    // Navigate based on notification type
    switch (notification.type) {
      case 'achievement':
      case 'streak_milestone':
        navigate('/achievements');
        break;
      case 'meal_reminder':
        navigate('/food-journal');
        break;
      case 'training_reminder':
        navigate('/training');
        break;
      case 'group_activity':
        navigate('/groups');
        break;
      case 'goal_reached':
      case 'personal_best':
        navigate('/step-counter');
        break;
      default:
        navigate('/dashboard');
    }

    onClose();
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;

    if (showUnreadOnly) {
      filtered = filtered.filter(n => !n.read);
    }

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(n => n.category === selectedFilter);
    }

    return filtered;
  };

  const groupNotificationsByDate = (notifications: WellnessNotification[]): NotificationGroup[] => {
    const groups: { [key: string]: WellnessNotification[] } = {};

    notifications.forEach(notification => {
      const date = notification.timestamp.toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
    });

    return Object.entries(groups)
      .map(([date, notifications]) => ({ date, notifications }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 border-red-200';
      case 'high': return 'bg-orange-100 border-orange-200';
      case 'normal': return 'bg-blue-100 border-blue-200';
      case 'low': return 'bg-gray-100 border-gray-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = getFilteredNotifications();
  const groupedNotifications = groupNotificationsByDate(filteredNotifications);

  const filterOptions = [
    { value: 'all', label: 'All', icon: '🔔' },
    { value: 'achievements', label: 'Achievements', icon: '🏆' },
    { value: 'reminders', label: 'Reminders', icon: '⏰' },
    { value: 'social', label: 'Social', icon: '👥' },
    { value: 'nutrition', label: 'Nutrition', icon: '🥗' },
    { value: 'training', label: 'Training', icon: '🎓' },
    { value: 'wellness', label: 'Wellness', icon: '🌱' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className={`absolute right-0 top-0 h-full bg-white shadow-xl transform transition-transform duration-300 ${
        compact ? 'w-80' : 'w-96'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <span className="text-xl">×</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Mark all read
            </button>
            <button
              onClick={clearAll}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
            
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Unread only</span>
            </label>
          </div>
        </div>

        {/* Notifications */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-gray-400">🔔</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600 text-sm">
                {showUnreadOnly ? 'No unread notifications' : 'You\'re all caught up!'}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {groupedNotifications.map(group => (
                <div key={group.date}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {new Date(group.date).toDateString() === new Date().toDateString() 
                      ? 'Today' 
                      : new Date(group.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
                    }
                  </h3>
                  
                  <div className="space-y-2">
                    {group.notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`relative p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                          !notification.read ? 'bg-blue-50 border-blue-200' : getPriorityColor(notification.priority)
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        {/* Unread indicator */}
                        {!notification.read && (
                          <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}

                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <span className="text-xl">{notification.icon}</span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-medium ${!notification.read ? 'text-blue-900' : 'text-gray-900'}`}>
                              {notification.title}
                            </h4>
                            <p className={`text-sm mt-1 ${!notification.read ? 'text-blue-700' : 'text-gray-600'}`}>
                              {notification.body}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {getTimeAgo(notification.timestamp)}
                              </span>
                              
                              {notification.actionRequired && (
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                  Action required
                                </span>
                              )}
                              
                              {notification.expiresAt && new Date() < notification.expiresAt && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                  Expires soon
                                </span>
                              )}
                            </div>

                            {/* Tags */}
                            {notification.tags && notification.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {notification.tags.slice(0, 2).map(tag => (
                                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="text-gray-400 hover:text-red-500 p-1"
                            >
                              <span className="text-sm">×</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              navigate('/notifications');
              onClose();
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium"
          >
            View All Notifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default InAppNotificationCenter;