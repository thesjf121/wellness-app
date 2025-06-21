import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { getUserProfile } from '../../utils/clerkHelpers';
import { ROUTES } from '../../utils/constants';

interface ActivityItem {
  id: string;
  type: 'step_goal' | 'food_log' | 'training' | 'streak' | 'achievement' | 'goal_set';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  color: string;
  actionRoute?: string;
}

interface RecentActivityWidgetProps {
  compact?: boolean;
  maxItems?: number;
}

const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({ 
  compact = false, 
  maxItems = 8 
}) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentActivity();
  }, []);

  const loadRecentActivity = () => {
    setLoading(true);
    
    // Generate recent activity based on user data and localStorage
    const recentActivities: ActivityItem[] = [];
    
    // Check for recent onboarding completion
    const onboardingCompleted = localStorage.getItem('onboarding_completed');
    if (onboardingCompleted) {
      recentActivities.push({
        id: 'onboarding',
        type: 'achievement',
        title: 'Welcome aboard!',
        description: 'Completed onboarding setup',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        icon: '🎉',
        color: 'blue'
      });
    }

    // Check for recent goal setting
    const wellnessGoals = localStorage.getItem('wellness_goals');
    if (wellnessGoals) {
      recentActivities.push({
        id: 'goals_set',
        type: 'goal_set',
        title: 'Goals established',
        description: 'Set up personalized wellness goals',
        timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
        icon: '🎯',
        color: 'green',
        actionRoute: '/welcome/goals'
      });
    }

    // Check training progress
    const trainingProgress = localStorage.getItem('training_progress');
    if (trainingProgress) {
      const progress = JSON.parse(trainingProgress);
      const completedModules = Object.keys(progress).filter(key => progress[key].completed);
      
      if (completedModules.length > 0) {
        recentActivities.push({
          id: 'training_progress',
          type: 'training',
          title: 'Learning milestone',
          description: `Completed ${completedModules.length} training module${completedModules.length > 1 ? 's' : ''}`,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          icon: '🎓',
          color: 'purple',
          actionRoute: ROUTES.TRAINING
        });
      }
    }

    // Check for recent food entries
    const foodEntries = localStorage.getItem('food_entries');
    if (foodEntries) {
      const entries = JSON.parse(foodEntries);
      if (entries.length > 0) {
        recentActivities.push({
          id: 'food_logged',
          type: 'food_log',
          title: 'Meal logged',
          description: 'Added nutrition data with AI analysis',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
          icon: '🥗',
          color: 'green',
          actionRoute: ROUTES.FOOD_JOURNAL
        });
      }
    }

    // Simulated step achievements
    const userProfile = getUserProfile(user);
  const stepGoal = userProfile.dailyStepGoal || 8000;
    const todaySteps = Math.floor(Math.random() * stepGoal * 1.2);
    
    if (todaySteps >= stepGoal) {
      recentActivities.push({
        id: 'step_goal',
        type: 'step_goal',
        title: 'Daily goal achieved!',
        description: `Reached ${todaySteps.toLocaleString()} steps`,
        timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
        icon: '👟',
        color: 'blue',
        actionRoute: ROUTES.STEP_COUNTER
      });
    }

    // Simulated streak achievements
    const currentStreak = Math.floor(Math.random() * 10) + 1;
    if (currentStreak >= 3) {
      recentActivities.push({
        id: 'streak_milestone',
        type: 'streak',
        title: 'Streak milestone!',
        description: `${currentStreak}-day wellness streak`,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        icon: '🔥',
        color: 'orange'
      });
    }

    // Add some general achievements
    const generalActivities: ActivityItem[] = [
      {
        id: 'profile_complete',
        type: 'achievement',
        title: 'Profile completed',
        description: 'Updated personal wellness information',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        icon: '✅',
        color: 'green',
        actionRoute: ROUTES.PROFILE
      },
      {
        id: 'app_installed',
        type: 'achievement',
        title: 'Welcome to WellnessApp!',
        description: 'Started your wellness journey',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        icon: '🌟',
        color: 'purple'
      },
      {
        id: 'notifications_setup',
        type: 'goal_set',
        title: 'Stay connected',
        description: 'Configured notification preferences',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18), // 18 hours ago
        icon: '🔔',
        color: 'blue',
        actionRoute: '/welcome/notifications'
      }
    ];

    // Add some general activities if we don't have enough
    if (recentActivities.length < 4) {
      recentActivities.push(...generalActivities.slice(0, 4 - recentActivities.length));
    }

    // Sort by timestamp (most recent first)
    recentActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    setActivities(recentActivities.slice(0, maxItems));
    setLoading(false);
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

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-600';
      case 'green': return 'bg-green-100 text-green-600';
      case 'purple': return 'bg-purple-100 text-purple-600';
      case 'orange': return 'bg-orange-100 text-orange-600';
      case 'red': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const handleActivityClick = (activity: ActivityItem) => {
    if (activity.actionRoute) {
      navigate(activity.actionRoute);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-300 rounded w-3/4 mb-1"></div>
                  <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm">Recent Activity</h3>
          <span className="text-xl">📝</span>
        </div>
        
        {activities.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-xs text-gray-500">No recent activity</p>
            <p className="text-xs text-gray-400">Start your wellness journey!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.slice(0, 3).map(activity => (
              <div 
                key={activity.id} 
                className={`flex items-center space-x-2 ${activity.actionRoute ? 'cursor-pointer hover:bg-gray-50' : ''} p-1 rounded`}
                onClick={() => handleActivityClick(activity)}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${getColorClasses(activity.color)}`}>
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{activity.title}</p>
                  <p className="text-xs text-gray-500">{getTimeAgo(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 text-lg">Recent Activity</h3>
        <span className="text-2xl">📝</span>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-gray-400">📝</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">No Activity Yet</h4>
          <p className="text-gray-600 text-sm mb-4">
            Start logging your wellness data to see your activity here.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => navigate(ROUTES.FOOD_JOURNAL)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
            >
              Log Food
            </button>
            <button
              onClick={() => navigate(ROUTES.TRAINING)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
            >
              Start Learning
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map(activity => (
            <div 
              key={activity.id}
              className={`flex items-start space-x-4 p-3 rounded-lg transition-colors ${
                activity.actionRoute 
                  ? 'cursor-pointer hover:bg-gray-50 border border-transparent hover:border-gray-200' 
                  : 'bg-gray-50'
              }`}
              onClick={() => handleActivityClick(activity)}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getColorClasses(activity.color)}`}>
                {activity.icon}
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm">{activity.title}</h4>
                <p className="text-gray-600 text-sm">{activity.description}</p>
                <p className="text-gray-500 text-xs mt-1">{getTimeAgo(activity.timestamp)}</p>
              </div>
              
              {activity.actionRoute && (
                <div className="flex-shrink-0">
                  <span className="text-gray-400 text-sm">→</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activities.length > 0 && (
        <div className="mt-6 text-center">
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All Activity
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivityWidget;