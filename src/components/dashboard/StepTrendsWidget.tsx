import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { getUserProfile } from '../../utils/clerkHelpers';

interface StepData {
  date: string;
  steps: number;
  goal: number;
  distance: number; // in km
  calories: number;
}

interface StepTrendsWidgetProps {
  compact?: boolean;
  showTrend?: boolean;
  days?: number;
}

const StepTrendsWidget: React.FC<StepTrendsWidgetProps> = ({ 
  compact = false, 
  showTrend = true,
  days = 7 
}) => {
  const { user } = useUser();
  const [stepData, setStepData] = useState<StepData[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStepData();
  }, [days]);

  const loadStepData = () => {
    setLoading(true);
    
    // Generate mock data for the last N days
    const today = new Date();
    const data: StepData[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic step data with some randomness
      const userProfile = getUserProfile(user);
  const baseSteps = userProfile.dailyStepGoal || 8000;
      const variation = Math.random() * 0.4 + 0.8; // 80% to 120% of goal
      const steps = Math.floor(baseSteps * variation);
      
      data.push({
        date: date.toISOString().split('T')[0],
        steps,
        goal: baseSteps,
        distance: Number((steps * 0.0008).toFixed(1)), // Rough conversion
        calories: Math.floor(steps * 0.04) // Rough conversion
      });
    }
    
    setStepData(data);
    
    // Calculate current streak
    let streak = 0;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].steps >= data[i].goal) {
        streak++;
      } else {
        break;
      }
    }
    setCurrentStreak(streak);
    setLoading(false);
  };

  const todayData = stepData[stepData.length - 1];
  const averageSteps = stepData.length > 0 ? Math.floor(stepData.reduce((sum, day) => sum + day.steps, 0) / stepData.length) : 0;
  const goalsAchieved = stepData.filter(day => day.steps >= day.goal).length;
  const goalPercentage = stepData.length > 0 ? Math.round((goalsAchieved / stepData.length) * 100) : 0;

  const getProgressColor = (steps: number, goal: number) => {
    const percentage = (steps / goal) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${compact ? 'h-48' : 'h-64'}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm">Today's Steps</h3>
          <span className="text-2xl">👟</span>
        </div>
        
        <div className="mb-3">
          <div className="text-2xl font-bold text-blue-600">
            {todayData ? formatNumber(todayData.steps) : '0'}
          </div>
          <div className="text-xs text-gray-500">
            Goal: {todayData ? formatNumber(todayData.goal) : '8,000'}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              todayData ? getProgressColor(todayData.steps, todayData.goal) : 'bg-gray-300'
            }`}
            style={{ 
              width: todayData ? `${Math.min((todayData.steps / todayData.goal) * 100, 100)}%` : '0%' 
            }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-600">
          <span>{currentStreak} day streak</span>
          <span>{goalPercentage}% this week</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6" data-tutorial="step-widget">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 text-lg">Step Count Trends</h3>
        <span className="text-2xl">👟</span>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {todayData ? formatNumber(todayData.steps) : '0'}
          </div>
          <div className="text-xs text-gray-500">Today's Steps</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {todayData ? todayData.distance : '0'} km
          </div>
          <div className="text-xs text-gray-500">Distance</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {todayData ? todayData.calories : '0'}
          </div>
          <div className="text-xs text-gray-500">Calories</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {currentStreak}
          </div>
          <div className="text-xs text-gray-500">Day Streak</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Daily Goal Progress</span>
          <span>{todayData ? Math.round((todayData.steps / todayData.goal) * 100) : 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              todayData ? getProgressColor(todayData.steps, todayData.goal) : 'bg-gray-300'
            }`}
            style={{ 
              width: todayData ? `${Math.min((todayData.steps / todayData.goal) * 100, 100)}%` : '0%' 
            }}
          />
        </div>
      </div>

      {/* Weekly Chart */}
      {showTrend && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">{days}-Day Trend</h4>
          <div className="flex items-end justify-between h-32 mb-2">
            {stepData.map((day, index) => {
              const height = Math.max((day.steps / Math.max(...stepData.map(d => d.steps))) * 100, 5);
              const isGoalMet = day.steps >= day.goal;
              
              return (
                <div key={day.date} className="flex flex-col items-center flex-1">
                  <div 
                    className={`w-full mx-1 rounded-t transition-all duration-300 ${
                      isGoalMet ? 'bg-green-500' : 'bg-blue-300'
                    }`}
                    style={{ height: `${height}%` }}
                    title={`${new Date(day.date).toLocaleDateString()}: ${formatNumber(day.steps)} steps`}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(day.date).toLocaleDateString('en', { weekday: 'short' }).charAt(0)}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Week Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="font-semibold text-gray-900">{formatNumber(averageSteps)}</div>
                <div className="text-xs text-gray-500">Daily Average</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">{goalsAchieved}/{stepData.length}</div>
                <div className="text-xs text-gray-500">Goals Achieved</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">{goalPercentage}%</div>
                <div className="text-xs text-gray-500">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepTrendsWidget;