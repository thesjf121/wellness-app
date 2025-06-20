import React, { useState, useEffect } from 'react';
import { useMockAuth } from '../../context/MockAuthContext';

interface NutritionData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  mealsLogged: number;
  waterGlasses: number;
}

interface NutritionSummaryWidgetProps {
  compact?: boolean;
  showDetails?: boolean;
  days?: number;
}

const NutritionSummaryWidget: React.FC<NutritionSummaryWidgetProps> = ({ 
  compact = false, 
  showDetails = true,
  days = 7 
}) => {
  const { user } = useMockAuth();
  const [nutritionData, setNutritionData] = useState<NutritionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNutritionData();
  }, [days]);

  const loadNutritionData = () => {
    setLoading(true);
    
    // Generate mock data for the last N days
    const today = new Date();
    const data: NutritionData[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic nutrition data
      const mealsLogged = Math.floor(Math.random() * 4) + 1; // 1-4 meals
      const calories = Math.floor(1800 + (Math.random() * 600)); // 1800-2400 calories
      const protein = Math.floor(calories * 0.15 / 4); // ~15% protein
      const carbs = Math.floor(calories * 0.50 / 4); // ~50% carbs
      const fat = Math.floor(calories * 0.30 / 9); // ~30% fat
      const fiber = Math.floor(20 + Math.random() * 15); // 20-35g fiber
      const waterGlasses = Math.floor(6 + Math.random() * 4); // 6-10 glasses
      
      data.push({
        date: date.toISOString().split('T')[0],
        calories,
        protein,
        carbs,
        fat,
        fiber,
        mealsLogged,
        waterGlasses
      });
    }
    
    setNutritionData(data);
    setLoading(false);
  };

  const todayData = nutritionData[nutritionData.length - 1];
  const averageCalories = nutritionData.length > 0 ? Math.floor(nutritionData.reduce((sum, day) => sum + day.calories, 0) / nutritionData.length) : 0;
  const averageMeals = nutritionData.length > 0 ? (nutritionData.reduce((sum, day) => sum + day.mealsLogged, 0) / nutritionData.length).toFixed(1) : '0';
  const averageWater = nutritionData.length > 0 ? Math.floor(nutritionData.reduce((sum, day) => sum + day.waterGlasses, 0) / nutritionData.length) : 0;

  const calorieGoal = user?.profile?.dailyCalorieGoal || 2000;
  const waterGoal = 8; // glasses per day

  const getMacroPercentage = (protein: number, carbs: number, fat: number) => {
    const totalCalories = (protein * 4) + (carbs * 4) + (fat * 9);
    return {
      protein: Math.round((protein * 4 / totalCalories) * 100),
      carbs: Math.round((carbs * 4 / totalCalories) * 100),
      fat: Math.round((fat * 9 / totalCalories) * 100)
    };
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
          <h3 className="font-semibold text-gray-900 text-sm">Nutrition Today</h3>
          <span className="text-2xl">🥗</span>
        </div>
        
        <div className="mb-3">
          <div className="text-2xl font-bold text-green-600">
            {todayData ? todayData.calories.toLocaleString() : '0'}
          </div>
          <div className="text-xs text-gray-500">
            Goal: {calorieGoal.toLocaleString()} cal
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className="h-2 rounded-full bg-green-500 transition-all duration-300"
            style={{ 
              width: todayData ? `${Math.min((todayData.calories / calorieGoal) * 100, 100)}%` : '0%' 
            }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-600">
          <span>{todayData ? todayData.mealsLogged : 0} meals</span>
          <span>{todayData ? todayData.waterGlasses : 0}/{waterGoal} 💧</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6" data-tutorial="nutrition-widget">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 text-lg">Nutrition Summary</h3>
        <span className="text-2xl">🥗</span>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {todayData ? todayData.calories.toLocaleString() : '0'}
          </div>
          <div className="text-xs text-gray-500">Calories</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {todayData ? todayData.mealsLogged : '0'}
          </div>
          <div className="text-xs text-gray-500">Meals Logged</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-cyan-600">
            {todayData ? todayData.waterGlasses : '0'}
          </div>
          <div className="text-xs text-gray-500">Water (glasses)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {todayData ? todayData.fiber : '0'}g
          </div>
          <div className="text-xs text-gray-500">Fiber</div>
        </div>
      </div>

      {/* Calorie Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Daily Calorie Goal</span>
          <span>{todayData ? Math.round((todayData.calories / calorieGoal) * 100) : 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="h-3 rounded-full bg-green-500 transition-all duration-500"
            style={{ 
              width: todayData ? `${Math.min((todayData.calories / calorieGoal) * 100, 100)}%` : '0%' 
            }}
          />
        </div>
      </div>

      {/* Macro Breakdown */}
      {showDetails && todayData && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Today's Macros</h4>
          <div className="space-y-3">
            {(() => {
              const macros = getMacroPercentage(todayData.protein, todayData.carbs, todayData.fat);
              return (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Protein</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{todayData.protein}g</span>
                      <span className="text-xs text-gray-500">({macros.protein}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-red-400"
                      style={{ width: `${macros.protein}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Carbs</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{todayData.carbs}g</span>
                      <span className="text-xs text-gray-500">({macros.carbs}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-yellow-400"
                      style={{ width: `${macros.carbs}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Fat</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{todayData.fat}g</span>
                      <span className="text-xs text-gray-500">({macros.fat}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-purple-400"
                      style={{ width: `${macros.fat}%` }}
                    />
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Weekly Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">{days}-Day Average</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="font-semibold text-gray-900">{averageCalories.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Daily Calories</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">{averageMeals}</div>
            <div className="text-xs text-gray-500">Meals/Day</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">{averageWater}</div>
            <div className="text-xs text-gray-500">Water Glasses</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionSummaryWidget;