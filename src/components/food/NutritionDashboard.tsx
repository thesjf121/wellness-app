import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { foodService } from '../../services/foodService';
import { FoodEntry, DailyNutrition } from '../../types/food';

interface NutritionStats {
  totalCalories: number;
  avgDailyCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  daysLogged: number;
  favoriteFood: string;
  topMealType: string;
}

interface TrendData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const NutritionDashboard: React.FC = () => {
  const { user } = useUser();
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('week');
  const [stats, setStats] = useState<NutritionStats | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNutritionData();
    }
  }, [user, period]);

  const loadNutritionData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;
      
      // Get nutrition trends
      const trendData = await foodService.getNutritionTrends(user.id, days);
      setTrends(trendData);

      // Get all food entries for the period
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const entries = await foodService.getFoodEntries(
        user.id, 
        startDate.toISOString().split('T')[0], 
        endDate.toISOString().split('T')[0]
      );

      // Calculate comprehensive stats
      const nutritionStats = calculateNutritionStats(entries);
      setStats(nutritionStats);

    } catch (error) {
      console.error('Failed to load nutrition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNutritionStats = (entries: FoodEntry[]): NutritionStats => {
    if (entries.length === 0) {
      return {
        totalCalories: 0,
        avgDailyCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        daysLogged: 0,
        favoriteFood: 'None',
        topMealType: 'None'
      };
    }

    // Calculate totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    const uniqueDates = new Set<string>();
    const foodFrequency: Record<string, number> = {};
    const mealTypeCount: Record<string, number> = {};

    entries.forEach(entry => {
      uniqueDates.add(entry.date);
      mealTypeCount[entry.mealType] = (mealTypeCount[entry.mealType] || 0) + 1;

      entry.foods.forEach(food => {
        totalCalories += food.calories;
        totalProtein += food.macronutrients.protein;
        totalCarbs += food.macronutrients.carbohydrates;
        totalFat += food.macronutrients.fat;
        
        foodFrequency[food.foodItem] = (foodFrequency[food.foodItem] || 0) + 1;
      });
    });

    // Find most frequent food and meal type
    const favoriteFood = Object.entries(foodFrequency)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
    
    const topMealType = Object.entries(mealTypeCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    const daysLogged = uniqueDates.size;
    const avgDailyCalories = daysLogged > 0 ? totalCalories / daysLogged : 0;

    return {
      totalCalories,
      avgDailyCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      daysLogged,
      favoriteFood,
      topMealType
    };
  };

  const formatPeriodLabel = () => {
    switch (period) {
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      case 'quarter': return 'Last 90 Days';
      default: return 'Period';
    }
  };

  const getCaloriesTrend = () => {
    if (trends.length < 2) return 'neutral';
    const recent = trends.slice(-3).reduce((sum, day) => sum + day.calories, 0) / 3;
    const earlier = trends.slice(0, 3).reduce((sum, day) => sum + day.calories, 0) / 3;
    
    if (recent > earlier * 1.1) return 'up';
    if (recent < earlier * 0.9) return 'down';
    return 'stable';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500 text-center">No nutrition data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Nutrition Dashboard</h2>
        <div className="flex space-x-2">
          {(['week', 'month', 'quarter'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p === 'week' ? '7D' : p === 'month' ? '30D' : '90D'}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{formatPeriodLabel()} Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Avg Daily Calories</p>
                <p className="text-2xl font-bold text-blue-900">
                  {Math.round(stats.avgDailyCalories)}
                </p>
              </div>
              <span className="text-2xl">{getTrendIcon(getCaloriesTrend())}</span>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Protein</p>
                <p className="text-2xl font-bold text-green-900">
                  {Math.round(stats.totalProtein)}g
                </p>
              </div>
              <span className="text-2xl">💪</span>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Total Carbs</p>
                <p className="text-2xl font-bold text-orange-900">
                  {Math.round(stats.totalCarbs)}g
                </p>
              </div>
              <span className="text-2xl">🍞</span>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Fat</p>
                <p className="text-2xl font-bold text-purple-900">
                  {Math.round(stats.totalFat)}g
                </p>
              </div>
              <span className="text-2xl">🥑</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-medium">Days Logged</p>
            <p className="text-xl font-bold text-gray-900">{stats.daysLogged}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-medium">Favorite Food</p>
            <p className="text-xl font-bold text-gray-900 truncate" title={stats.favoriteFood}>
              {stats.favoriteFood}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-medium">Top Meal Type</p>
            <p className="text-xl font-bold text-gray-900 capitalize">{stats.topMealType}</p>
          </div>
        </div>
      </div>

      {/* Simple Trend Visualization */}
      {trends.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Daily Calories Trend</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-end space-x-2 h-32">
              {trends.map((day, index) => {
                const maxCalories = Math.max(...trends.map(d => d.calories));
                const height = maxCalories > 0 ? (day.calories / maxCalories) * 100 : 0;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600 min-h-[4px]"
                      style={{ height: `${height}%` }}
                      title={`${new Date(day.date).toLocaleDateString()}: ${Math.round(day.calories)} calories`}
                    ></div>
                    <span className="text-xs text-gray-500 mt-1">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0 cal</span>
              <span>{Math.round(Math.max(...trends.map(d => d.calories)))} cal</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};