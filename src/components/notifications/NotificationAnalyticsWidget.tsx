import React, { useState, useEffect } from 'react';
import { smartNotificationScheduler } from '../../services/SmartNotificationScheduler';

interface NotificationAnalyticsWidgetProps {
  userId: string;
  compact?: boolean;
  timeRange?: 'day' | 'week' | 'month';
}

interface AnalyticsData {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalDismissed: number;
  openRate: number;
  clickRate: number;
  dismissRate: number;
  avgResponseTime: number;
  categoryBreakdown: Record<string, number>;
  timeOfDayBreakdown: Record<string, number>;
  userPattern?: any;
}

const NotificationAnalyticsWidget: React.FC<NotificationAnalyticsWidgetProps> = ({
  userId,
  compact = false,
  timeRange = 'week'
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  useEffect(() => {
    loadAnalytics();
  }, [userId, selectedTimeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = smartNotificationScheduler.getNotificationAnalytics(userId, selectedTimeRange);
      setAnalytics(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading notification analytics:', error);
      setLoading(false);
    }
  };

  const getEngagementColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-blue-600';
    if (rate >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEngagementLabel = (rate: number) => {
    if (rate >= 80) return 'Excellent';
    if (rate >= 60) return 'Good';
    if (rate >= 40) return 'Average';
    return 'Needs Improvement';
  };

  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <span className="text-2xl mb-2 block">📊</span>
          <p>No analytics data available</p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 text-sm">Notification Analytics</h3>
          <span className="text-xl">📊</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Open Rate</span>
            <span className={`text-sm font-bold ${getEngagementColor(analytics.openRate)}`}>
              {analytics.openRate.toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Click Rate</span>
            <span className={`text-sm font-bold ${getEngagementColor(analytics.clickRate)}`}>
              {analytics.clickRate.toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Response Time</span>
            <span className="text-sm font-bold text-gray-700">
              {formatResponseTime(analytics.avgResponseTime)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Total Sent</span>
            <span className="text-sm font-bold text-gray-700">
              {analytics.totalSent}
            </span>
          </div>
        </div>

        <div className="mt-3 p-2 bg-gray-50 rounded text-center">
          <span className={`text-xs font-medium ${getEngagementColor(analytics.openRate)}`}>
            {getEngagementLabel(analytics.openRate)} Engagement
          </span>
        </div>
      </div>
    );
  }

  const categoryData = Object.entries(analytics.categoryBreakdown);
  const timeOfDayData = Object.entries(analytics.timeOfDayBreakdown);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 text-lg">Notification Analytics</h3>
        <span className="text-2xl">📊</span>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {['day', 'week', 'month'].map(range => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range as any)}
              className={`px-3 py-2 text-sm rounded transition-colors ${
                selectedTimeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analytics.totalSent}</div>
            <div className="text-sm text-blue-700">Sent</div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getEngagementColor(analytics.openRate)}`}>
              {analytics.openRate.toFixed(1)}%
            </div>
            <div className="text-sm text-green-700">Open Rate</div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getEngagementColor(analytics.clickRate)}`}>
              {analytics.clickRate.toFixed(1)}%
            </div>
            <div className="text-sm text-purple-700">Click Rate</div>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatResponseTime(analytics.avgResponseTime)}
            </div>
            <div className="text-sm text-orange-700">Avg Response</div>
          </div>
        </div>
      </div>

      {/* Engagement Overview */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Engagement Overview</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{analytics.totalOpened}</div>
            <div className="text-sm text-gray-600">Opened</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{analytics.totalClicked}</div>
            <div className="text-sm text-gray-600">Clicked</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{analytics.totalDismissed}</div>
            <div className="text-sm text-gray-600">Dismissed</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Overall Engagement</span>
            <span className={`text-sm font-medium ${getEngagementColor(analytics.openRate)}`}>
              {getEngagementLabel(analytics.openRate)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                analytics.openRate >= 80 ? 'bg-green-500' :
                analytics.openRate >= 60 ? 'bg-blue-500' :
                analytics.openRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(analytics.openRate, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Notifications by Category</h4>
          <div className="space-y-2">
            {categoryData.map(([category, count]) => {
              const percentage = analytics.totalSent > 0 ? (count / analytics.totalSent) * 100 : 0;
              const categoryIcons: Record<string, string> = {
                achievements: '🏆',
                reminders: '⏰',
                social: '👥',
                nutrition: '🥗',
                training: '🎓',
                wellness: '🌱'
              };

              return (
                <div key={category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <span>{categoryIcons[category] || '📧'}</span>
                    <span className="text-sm font-medium capitalize">{category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Time of Day Analysis */}
      {timeOfDayData.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Best Times to Send</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {timeOfDayData.map(([timeOfDay, count]) => {
              const percentage = analytics.totalSent > 0 ? (count / analytics.totalSent) * 100 : 0;
              const timeIcons: Record<string, string> = {
                morning: '🌅',
                afternoon: '☀️',
                evening: '🌆',
                night: '🌙'
              };

              return (
                <div key={timeOfDay} className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-2xl mb-1">{timeIcons[timeOfDay] || '⏰'}</div>
                  <div className="text-sm font-medium capitalize">{timeOfDay}</div>
                  <div className="text-lg font-bold text-blue-600">{count}</div>
                  <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* User Pattern Insights */}
      {analytics.userPattern && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Your Notification Preferences</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Most Active Hours</label>
              <div className="flex flex-wrap gap-1">
                {analytics.userPattern.mostActiveHours.map((hour: number) => (
                  <span key={hour} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {hour}:00
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Engagement Score</label>
              <div className="flex items-center space-x-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${analytics.userPattern.engagementScore * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {(analytics.userPattern.engagementScore * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Average Response Time: {formatResponseTime(analytics.userPattern.averageResponseTime)}
            </label>
            <p className="text-sm text-gray-600">
              Last Active: {analytics.userPattern.lastActiveDate ? 
                new Date(analytics.userPattern.lastActiveDate).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Optimization Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          {analytics.openRate < 50 && (
            <li>• Consider adjusting notification timing - your open rate could be improved</li>
          )}
          {analytics.clickRate < 30 && (
            <li>• Try more actionable notification content to increase click-through</li>
          )}
          {analytics.avgResponseTime > 120 && (
            <li>• Notifications might be better at different times when you're more active</li>
          )}
          {analytics.dismissRate > 30 && (
            <li>• Some notification types might be too frequent - consider reducing frequency</li>
          )}
          {analytics.openRate >= 70 && (
            <li>• Great engagement! Your notification preferences are working well</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default NotificationAnalyticsWidget;