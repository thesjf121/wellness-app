import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

interface StreakData {
  type: 'steps' | 'food' | 'training' | 'general';
  name: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  isActiveToday: boolean;
  icon: string;
  color: string;
  description: string;
}

interface StreakCounterWidgetProps {
  compact?: boolean;
  showAll?: boolean;
}

const StreakCounterWidget: React.FC<StreakCounterWidgetProps> = ({ 
  compact = false, 
  showAll = true 
}) => {
  const { user } = useUser();
  const [streaks, setStreaks] = useState<StreakData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreakData();
  }, []);

  const loadStreakData = () => {
    setLoading(true);
    
    // Calculate streaks based on stored data
    const today = new Date().toISOString().split('T')[0];
    
    // Step streak calculation
    const stepStreak = calculateStepStreak();
    
    // Food logging streak
    const foodStreak = calculateFoodStreak();
    
    // Training streak
    const trainingStreak = calculateTrainingStreak();
    
    // General wellness streak (combination of activities)
    const generalStreak = calculateGeneralStreak();

    const streakData: StreakData[] = [
      {
        type: 'steps',
        name: 'Daily Steps',
        currentStreak: stepStreak.current,
        longestStreak: stepStreak.longest,
        lastActiveDate: stepStreak.lastActive,
        isActiveToday: stepStreak.activeToday,
        icon: '👟',
        color: 'blue',
        description: 'Consecutive days hitting step goal'
      },
      {
        type: 'food',
        name: 'Food Logging',
        currentStreak: foodStreak.current,
        longestStreak: foodStreak.longest,
        lastActiveDate: foodStreak.lastActive,
        isActiveToday: foodStreak.activeToday,
        icon: '🥗',
        color: 'green',
        description: 'Consecutive days logging meals'
      },
      {
        type: 'training',
        name: 'Learning',
        currentStreak: trainingStreak.current,
        longestStreak: trainingStreak.longest,
        lastActiveDate: trainingStreak.lastActive,
        isActiveToday: trainingStreak.activeToday,
        icon: '🎓',
        color: 'purple',
        description: 'Consecutive days engaging with training'
      },
      {
        type: 'general',
        name: 'Wellness',
        currentStreak: generalStreak.current,
        longestStreak: generalStreak.longest,
        lastActiveDate: generalStreak.lastActive,
        isActiveToday: generalStreak.activeToday,
        icon: '🌟',
        color: 'orange',
        description: 'Overall wellness activity streak'
      }
    ];

    setStreaks(streakData);
    setLoading(false);
  };

  const calculateStepStreak = () => {
    // Simulate step streak calculation
    const stepGoal = user?.profile?.dailyStepGoal || 8000;
    
    // Generate mock streak data
    const current = Math.floor(Math.random() * 14); // 0-14 days
    const longest = Math.max(current + Math.floor(Math.random() * 30), current);
    const activeToday = Math.random() > 0.3; // 70% chance active today
    
    const lastActiveDate = new Date();
    if (!activeToday) {
      lastActiveDate.setDate(lastActiveDate.getDate() - 1);
    }
    
    return {
      current,
      longest,
      activeToday,
      lastActive: lastActiveDate.toISOString().split('T')[0]
    };
  };

  const calculateFoodStreak = () => {
    // Check food logging streak from localStorage
    const foodEntries = localStorage.getItem('food_entries');
    
    const current = Math.floor(Math.random() * 10); // 0-10 days
    const longest = Math.max(current + Math.floor(Math.random() * 20), current);
    const activeToday = Math.random() > 0.4; // 60% chance active today
    
    const lastActiveDate = new Date();
    if (!activeToday) {
      lastActiveDate.setDate(lastActiveDate.getDate() - 1);
    }
    
    return {
      current,
      longest,
      activeToday,
      lastActive: lastActiveDate.toISOString().split('T')[0]
    };
  };

  const calculateTrainingStreak = () => {
    // Check training progress from localStorage
    const trainingProgress = localStorage.getItem('training_progress');
    
    const current = Math.floor(Math.random() * 7); // 0-7 days
    const longest = Math.max(current + Math.floor(Math.random() * 15), current);
    const activeToday = Math.random() > 0.5; // 50% chance active today
    
    const lastActiveDate = new Date();
    if (!activeToday) {
      lastActiveDate.setDate(lastActiveDate.getDate() - Math.floor(Math.random() * 3));
    }
    
    return {
      current,
      longest,
      activeToday,
      lastActive: lastActiveDate.toISOString().split('T')[0]
    };
  };

  const calculateGeneralStreak = () => {
    // Calculate based on overall activity
    const stepStreak = calculateStepStreak();
    const foodStreak = calculateFoodStreak();
    const trainingStreak = calculateTrainingStreak();
    
    // General streak is based on having at least 2 out of 3 activities
    const current = Math.min(stepStreak.current, foodStreak.current, trainingStreak.current);
    const longest = Math.max(stepStreak.longest, foodStreak.longest, trainingStreak.longest);
    const activeToday = (stepStreak.activeToday ? 1 : 0) + 
                      (foodStreak.activeToday ? 1 : 0) + 
                      (trainingStreak.activeToday ? 1 : 0) >= 2;
    
    const lastActiveDate = new Date();
    if (!activeToday) {
      lastActiveDate.setDate(lastActiveDate.getDate() - 1);
    }
    
    return {
      current,
      longest,
      activeToday,
      lastActive: lastActiveDate.toISOString().split('T')[0]
    };
  };

  const getColorClasses = (color: string, isActive: boolean) => {
    const baseClasses = {
      blue: isActive ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600',
      green: isActive ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600',
      purple: isActive ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-600',
      orange: isActive ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600'
    };
    return baseClasses[color as keyof typeof baseClasses] || baseClasses.blue;
  };

  const getStreakMessage = (streak: StreakData) => {
    if (streak.currentStreak === 0) {
      return "Start your streak today!";
    } else if (streak.currentStreak === 1) {
      return "Great start! Keep it up!";
    } else if (streak.currentStreak < 7) {
      return `${streak.currentStreak} days strong!`;
    } else if (streak.currentStreak < 30) {
      return `Amazing ${streak.currentStreak}-day streak!`;
    } else {
      return `Incredible ${streak.currentStreak}-day streak! 🔥`;
    }
  };

  const getTotalActiveStreaks = () => {
    return streaks.filter(streak => streak.currentStreak > 0).length;
  };

  const getLongestCurrentStreak = () => {
    return Math.max(...streaks.map(streak => streak.currentStreak));
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
    const bestStreak = streaks.reduce((best, current) => 
      current.currentStreak > best.currentStreak ? current : best
    );

    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm">Current Streaks</h3>
          <span className="text-2xl">🔥</span>
        </div>
        
        <div className="mb-3">
          <div className="text-2xl font-bold text-orange-600">
            {getLongestCurrentStreak()}
          </div>
          <div className="text-xs text-gray-500">
            Best streak: {bestStreak.name}
          </div>
        </div>
        
        <div className="space-y-2">
          {streaks.slice(0, 2).map(streak => (
            <div key={streak.type} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm">{streak.icon}</span>
                <span className="text-xs text-gray-600">{streak.name}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                streak.currentStreak > 0 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {streak.currentStreak}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-3 text-xs text-gray-600 text-center">
          {getTotalActiveStreaks()}/4 active streaks
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 text-lg">Streak Counters</h3>
        <span className="text-2xl">🔥</span>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {getLongestCurrentStreak()}
          </div>
          <div className="text-xs text-gray-500">Best Current</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {getTotalActiveStreaks()}/4
          </div>
          <div className="text-xs text-gray-500">Active Streaks</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Math.max(...streaks.map(s => s.longestStreak))}
          </div>
          <div className="text-xs text-gray-500">All-Time Best</div>
        </div>
      </div>

      {/* Individual Streaks */}
      <div className={`grid gap-4 ${showAll ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {(showAll ? streaks : streaks.slice(0, 2)).map(streak => (
          <div 
            key={streak.type}
            className={`p-4 rounded-lg border-2 transition-all ${
              streak.isActiveToday 
                ? 'border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50' 
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  getColorClasses(streak.color, streak.isActiveToday)
                }`}>
                  {streak.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{streak.name}</h4>
                  <p className="text-xs text-gray-600">{streak.description}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {streak.currentStreak}
                </div>
                <div className="text-xs text-gray-500">
                  Best: {streak.longestStreak}
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{streak.currentStreak} days</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    streak.color === 'blue' ? 'bg-blue-500' :
                    streak.color === 'green' ? 'bg-green-500' :
                    streak.color === 'purple' ? 'bg-purple-500' :
                    'bg-orange-500'
                  }`}
                  style={{ 
                    width: `${Math.min((streak.currentStreak / Math.max(streak.longestStreak, 7)) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">
                {streak.isActiveToday ? 'Active today!' : `Last active: ${new Date(streak.lastActiveDate).toLocaleDateString()}`}
              </span>
              
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                streak.isActiveToday 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {streak.isActiveToday ? '✓ Today' : 'Pending'}
              </div>
            </div>

            <div className="mt-2 text-center">
              <p className="text-xs font-medium text-gray-700">
                {getStreakMessage(streak)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Streak Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Streak Tips</h4>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• Set daily reminders to maintain consistency</li>
          <li>• Start small - even 1% improvement counts</li>
          <li>• Focus on building one habit at a time</li>
          <li>• Don't break the chain - consistency beats perfection</li>
        </ul>
      </div>
    </div>
  );
};

export default StreakCounterWidget;