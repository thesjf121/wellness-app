import React, { useState, useEffect } from 'react';
import { useMockAuth } from '../../context/MockAuthContext';
import { activityTrackingService } from '../../services/activityTrackingService';
import { UserActivity } from '../../types/groups';

interface ActivitySummary {
  totalActivities: number;
  activeDays: number;
  activityByType: Record<string, number>;
  streakCount: number;
  longestStreak: number;
  averageActivitiesPerDay: number;
}

interface EligibilityStatus {
  met: boolean;
  daysActive: number;
  requiredDays: number;
  activeDates: string[];
  missingDates: string[];
}

export const ActivityTracker: React.FC = () => {
  const { user } = useMockAuth();
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadActivityData();
    }
  }, [user]);

  const loadActivityData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load recent activity
      const activity = await activityTrackingService.getUserActivity(user.id, 7);
      setRecentActivity(activity);

      // Load summary
      const summaryData = await activityTrackingService.getActivitySummary(user.id, 30);
      setSummary(summaryData);

      // Check eligibility
      const eligibilityData = await activityTrackingService.checkActivityEligibility(user.id, 7);
      setEligibility(eligibilityData);

    } catch (error) {
      console.error('Failed to load activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateActivity = async (days: number) => {
    if (!user) return;

    try {
      await activityTrackingService.simulateActivity(user.id, days);
      await loadActivityData(); // Refresh data
      alert(`Simulated ${days} days of activity!`);
    } catch (error) {
      console.error('Failed to simulate activity:', error);
      alert('Failed to simulate activity');
    }
  };

  const clearActivity = async () => {
    if (!user) return;

    if (window.confirm('Are you sure you want to clear all activity data? This cannot be undone.')) {
      try {
        await activityTrackingService.clearUserActivity(user.id);
        await loadActivityData(); // Refresh data
        alert('Activity data cleared!');
      } catch (error) {
        console.error('Failed to clear activity:', error);
        alert('Failed to clear activity');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'steps': return '👟';
      case 'food_entry': return '🍎';
      case 'training_completion': return '📚';
      case 'group_interaction': return '💬';
      default: return '✅';
    }
  };

  const getActivityLabel = (activityType: string) => {
    switch (activityType) {
      case 'steps': return 'Steps Logged';
      case 'food_entry': return 'Food Entry';
      case 'training_completion': return 'Training Module';
      case 'group_interaction': return 'Group Interaction';
      default: return 'Activity';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Activity Tracking</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => simulateActivity(7)}
            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded"
          >
            Simulate 7 Days
          </button>
          <button
            onClick={clearActivity}
            className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded"
          >
            Clear Data
          </button>
        </div>
      </div>

      {/* Eligibility Status */}
      {eligibility && (
        <div className={`rounded-lg p-4 mb-6 ${
          eligibility.met ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">
              {eligibility.met ? '✅ 7-Day Eligibility Met' : '⏳ Working Towards Eligibility'}
            </h4>
            <span className="text-sm font-semibold">
              {eligibility.daysActive}/{eligibility.requiredDays} days
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full ${eligibility.met ? 'bg-green-500' : 'bg-yellow-500'}`}
              style={{ width: `${(eligibility.daysActive / eligibility.requiredDays) * 100}%` }}
            ></div>
          </div>

          {eligibility.activeDates.length > 0 && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Active dates:</span> {eligibility.activeDates.map(formatDate).join(', ')}
            </div>
          )}

          {eligibility.missingDates.length > 0 && (
            <div className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Missing:</span> {eligibility.missingDates.map(formatDate).join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Activity Summary */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.activeDays}</div>
            <div className="text-xs text-gray-600">Active Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{summary.streakCount}</div>
            <div className="text-xs text-gray-600">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{summary.longestStreak}</div>
            <div className="text-xs text-gray-600">Longest Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{summary.totalActivities}</div>
            <div className="text-xs text-gray-600">Total Activities</div>
          </div>
        </div>
      )}

      {/* Activity Breakdown by Type */}
      {summary && Object.keys(summary.activityByType).some(key => summary.activityByType[key] > 0) && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Activity Breakdown (Last 30 Days)</h4>
          <div className="space-y-2">
            {Object.entries(summary.activityByType).map(([type, count]) => 
              count > 0 && (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>{getActivityIcon(type)}</span>
                    <span className="text-sm text-gray-700">{getActivityLabel(type)}</span>
                  </div>
                  <span className="text-sm font-semibold">{count}</span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 ? (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Recent Activity (Last 7 Days)</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recentActivity.slice(0, 10).map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 py-2">
                <span className="text-lg">{getActivityIcon(activity.activityType)}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {getActivityLabel(activity.activityType)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(activity.activityDate)} • {new Date(activity.createdAt).toLocaleTimeString()}
                  </div>
                </div>
                {activity.metadata.steps && (
                  <div className="text-xs text-gray-600">
                    {activity.metadata.steps.toLocaleString()} steps
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📊</div>
          <p className="text-gray-500 text-sm">No recent activity found</p>
          <p className="text-gray-400 text-xs mt-1">
            Use the app to track steps, log food, or complete training to build your activity history
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-2">💡 How to Build Activity</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Join groups anytime with an invite code!</li>
          <li>• Log daily steps in the Steps page</li>
          <li>• Add food entries in the Food Journal</li>
          <li>• Complete training modules in the Training page</li>
          <li>• Stay active for 7 days + complete training to create groups!</li>
        </ul>
      </div>
    </div>
  );
};