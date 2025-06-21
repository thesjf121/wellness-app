import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { foodService } from '../../services/foodService';
import { NutritionGoals, DailyNutrition } from '../../types/food';

interface GoalProgressProps {
  date: string;
  dailyNutrition?: DailyNutrition | null;
}

interface ProgressItem {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  percentage: number;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({ date, dailyNutrition }) => {
  const { user } = useUser();
  const [goals, setGoals] = useState<NutritionGoals | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userGoals = await foodService.getNutritionGoals(user.id);
      setGoals(userGoals);
    } catch (error) {
      console.error('Failed to load nutrition goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (): ProgressItem[] => {
    if (!goals || !dailyNutrition) return [];

    const items: ProgressItem[] = [
      {
        label: 'Calories',
        current: dailyNutrition.totalCalories,
        target: goals.dailyCalories,
        unit: '',
        color: 'blue',
        percentage: 0
      },
      {
        label: 'Protein',
        current: dailyNutrition.totalMacros.protein,
        target: goals.macroGoals.protein,
        unit: 'g',
        color: 'green',
        percentage: 0
      },
      {
        label: 'Carbs',
        current: dailyNutrition.totalMacros.carbohydrates,
        target: goals.macroGoals.carbohydrates,
        unit: 'g',
        color: 'orange',
        percentage: 0
      },
      {
        label: 'Fat',
        current: dailyNutrition.totalMacros.fat,
        target: goals.macroGoals.fat,
        unit: 'g',
        color: 'purple',
        percentage: 0
      },
      {
        label: 'Fiber',
        current: dailyNutrition.totalMacros.fiber,
        target: goals.macroGoals.fiber,
        unit: 'g',
        color: 'yellow',
        percentage: 0
      }
    ];

    return items.map(item => ({
      ...item,
      percentage: Math.min((item.current / item.target) * 100, 100)
    }));
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-200 text-blue-800',
      green: 'bg-green-200 text-green-800',
      orange: 'bg-orange-200 text-orange-800',
      purple: 'bg-purple-200 text-purple-800',
      yellow: 'bg-yellow-200 text-yellow-800'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-200 text-gray-800';
  };

  const getProgressBarColor = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      orange: 'bg-orange-500',
      purple: 'bg-purple-500',
      yellow: 'bg-yellow-500'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!goals) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Progress</h3>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No nutrition goals set yet.</p>
          <p className="text-sm text-gray-400">Set your goals to track your daily progress.</p>
        </div>
      </div>
    );
  }

  const progressItems = calculateProgress();
  const overallProgress = progressItems.length > 0 
    ? progressItems.reduce((sum, item) => sum + Math.min(item.percentage, 100), 0) / progressItems.length 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Goal Progress</h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{Math.round(overallProgress)}%</div>
          <div className="text-sm text-gray-600">Overall</div>
        </div>
      </div>

      <div className="space-y-4">
        {progressItems.map((item, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className={`inline-block w-3 h-3 rounded-full ${getProgressBarColor(item.color)}`}></span>
                <span className="font-medium text-gray-900">{item.label}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-gray-900">
                  {Math.round(item.current)}{item.unit}
                </span>
                <span className="text-gray-500"> / {item.target}{item.unit}</span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(item.color)}`}
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center mt-1">
              <span className={`text-xs px-2 py-1 rounded-full ${getColorClasses(item.color)}`}>
                {Math.round(item.percentage)}%
              </span>
              <span className="text-xs text-gray-500">
                {item.current >= item.target ? 'Goal achieved!' : 
                 `${Math.round(item.target - item.current)}${item.unit} remaining`}
              </span>
            </div>
          </div>
        ))}
      </div>

      {dailyNutrition && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p>Last updated: {new Date().toLocaleTimeString()}</p>
            <p>Date: {new Date(date).toLocaleDateString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};