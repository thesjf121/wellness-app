import React, { useState, useEffect } from 'react';
import { groupAnalyticsService } from '../../services/groupAnalyticsService';
import { errorService } from '../../services/errorService';

interface GroupAnalyticsProps {
  groupId: string;
  isSponsor?: boolean;
}

export const GroupAnalyticsComponent: React.FC<GroupAnalyticsProps> = ({ 
  groupId, 
  isSponsor = false 
}) => {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [memberAnalytics, setMemberAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'trends'>('overview');

  useEffect(() => {
    loadAnalytics();
  }, [groupId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const groupAnalytics = await groupAnalyticsService.generateGroupAnalytics(groupId);
      setAnalytics(groupAnalytics);

      // Load member analytics if sponsor
      if (isSponsor) {
        // For demo, just load analytics for top performers
        const topPerformers = groupAnalytics.achievementStats?.topPerformers?.slice(0, 5) || [];
        const memberAnalyticsPromises = topPerformers.map(async (performer: any) => {
          return await groupAnalyticsService.generateMemberAnalytics(groupId, performer.userId);
        });
        
        const memberAnalyticsResults = await Promise.all(memberAnalyticsPromises);
        setMemberAnalytics(memberAnalyticsResults);
      }
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupAnalytics.loadAnalytics',
        groupId
      });
      setError('Failed to load group analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800">Error Loading Analytics</h3>
        <p className="text-red-700 mt-2">{error || 'Analytics data not available'}</p>
        <button
          onClick={loadAnalytics}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Group Analytics</h2>
        <p className="text-gray-600">Insights and performance metrics for your wellness group</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'members', 'trends'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Group Overview */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Group Overview</h3>
            <div className="space-y-3">
              <StatItem 
                label="Total Members" 
                value={analytics?.totalMembers || 0} 
              />
              <StatItem 
                label="Active Members" 
                value={analytics?.activeMembers || 0} 
              />
              <StatItem 
                label="Group Health Score" 
                value={`${analytics?.healthScore || 0}/100`} 
              />
              <StatItem 
                label="Activity Rate" 
                value={`${analytics?.activityRate || 0}%`} 
              />
            </div>
          </div>

          {/* Health Metrics */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💪 Health Metrics</h3>
            <div className="space-y-3">
              <StatItem 
                label="Avg Daily Steps" 
                value={(analytics?.averageDailySteps || 0).toLocaleString()} 
              />
              <StatItem 
                label="Avg Workout Sessions" 
                value={`${analytics?.averageWorkoutSessions || 0}/week`} 
              />
              <StatItem 
                label="Nutrition Score" 
                value={`${analytics?.nutritionScore || 0}/100`} 
              />
              <StatItem 
                label="Sleep Quality" 
                value={`${analytics?.sleepQuality || 0}/10`} 
              />
            </div>
          </div>

          {/* Engagement */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Engagement</h3>
            <div className="space-y-3">
              <StatItem 
                label="Weekly Logins" 
                value={analytics?.weeklyActiveUsers || 0} 
              />
              <StatItem 
                label="Avg Session Time" 
                value={`${analytics?.averageSessionDuration || 0} min`} 
              />
              <StatItem 
                label="Feature Usage" 
                value={`${analytics?.featureUsageRate || 0}%`} 
              />
              <StatItem 
                label="Social Interactions" 
                value={analytics?.socialInteractions || 0} 
              />
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Achievements</h3>
            <div className="space-y-3">
              <StatItem 
                label="Total Achievements" 
                value={analytics?.achievementStats?.totalAchievementsEarned || 0} 
              />
              <StatItem 
                label="This Week" 
                value={analytics?.achievementStats?.uniqueAchievementTypes || 0} 
              />
              <StatItem 
                label="Achievement Types" 
                value={analytics?.achievementStats?.uniqueAchievementTypes || 0} 
              />
            </div>
            
            {analytics?.achievementStats?.topPerformers?.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Top Performers</h4>
                <div className="space-y-1">
                  {analytics.achievementStats.topPerformers.slice(0, 3).map((performer: any, index: number) => (
                    <div key={performer.userId} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} User {performer.userId}
                      </span>
                      <span className="font-medium">{performer.achievementCount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Activity Trends */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Activity Trends</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Trend Direction</span>
                <div className="flex items-center">
                  <span className={`text-2xl mr-2 ${
                    analytics?.activityStats?.activityTrend === 'increasing' ? 'text-green-600' :
                    analytics?.activityStats?.activityTrend === 'decreasing' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {analytics?.activityStats?.activityTrend === 'increasing' ? '📈' :
                     analytics?.activityStats?.activityTrend === 'decreasing' ? '📉' :
                     '➡️'}
                  </span>
                  <div>
                    <p className={`font-medium ${
                      analytics?.activityStats?.activityTrend === 'increasing' ? 'text-green-800' :
                      analytics?.activityStats?.activityTrend === 'decreasing' ? 'text-red-800' :
                      'text-gray-800'
                    }`}>
                      {(analytics?.activityStats?.activityTrend || 'stable').charAt(0).toUpperCase() + (analytics?.activityStats?.activityTrend || 'stable').slice(1)}
                    </p>
                    <p className="text-xs text-gray-500">vs last period</p>
                  </div>
                </div>
              </div>
              
              <StatItem 
                label="Most Active Day" 
                value={analytics?.activityStats?.mostActiveDay || 'N/A'} 
              />
              <StatItem 
                label="Daily Steps Avg" 
                value={`${analytics?.activityStats?.averageDailySteps || 0}`} 
              />
              <StatItem 
                label="Weekly Food Entries" 
                value={`${analytics?.activityStats?.averageWeeklyFoodEntries || 0}`} 
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Performance</h3>
          <p className="text-gray-600">Detailed member analytics coming soon...</p>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Analysis</h3>
          <p className="text-gray-600">Historical trends and projections coming soon...</p>
        </div>
      )}
    </div>
  );
};

// Helper component for stat display
const StatItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-sm font-medium text-gray-900">{value}</span>
  </div>
);

export default GroupAnalyticsComponent;
export { GroupAnalyticsComponent as GroupAnalytics };