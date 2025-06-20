import React, { useState, useEffect } from 'react';
import { useMockAuth } from '../../context/MockAuthContext';
import { FoodEntryForm } from '../../components/food/FoodEntryForm';
import { NutritionAnalysisResult } from '../../components/food/NutritionAnalysisResult';
import { FoodSearch } from '../../components/food/FoodSearch';
import { NutritionDashboard } from '../../components/food/NutritionDashboard';
import { NutritionReports } from '../../components/food/NutritionReports';
import { FavoriteFoods } from '../../components/food/FavoriteFoods';
import { NutritionGoals } from '../../components/food/NutritionGoals';
import { GoalProgress } from '../../components/food/GoalProgress';
import { foodService } from '../../services/foodService';
import { GeminiAnalysisResponse, NutritionData } from '../../services/geminiService';
import { FoodEntry, DailyNutrition, MealType } from '../../types/food';

const FoodJournalPage: React.FC = () => {
  const { user, isSignedIn } = useMockAuth();
  const [currentView, setCurrentView] = useState<'daily' | 'dashboard' | 'reports' | 'goals'>('daily');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<GeminiAnalysisResponse | null>(null);
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutrition | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [offlineStatus, setOfflineStatus] = useState({ count: 0, isOnline: true });

  useEffect(() => {
    if (user) {
      loadDailyNutrition();
    }
  }, [user, currentDate]);

  useEffect(() => {
    const updateOfflineStatus = () => {
      const status = foodService.getOfflineQueueStatus();
      setOfflineStatus(status);
    };

    updateOfflineStatus();
    const interval = setInterval(updateOfflineStatus, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadDailyNutrition = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const nutrition = await foodService.getDailyNutrition(user.id, currentDate);
      setDailyNutrition(nutrition);
    } catch (error) {
      console.error('Failed to load daily nutrition:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysisComplete = (result: GeminiAnalysisResponse) => {
    setAnalysisResult(result);
    setShowAddForm(false);
  };

  const handleSaveFoodEntry = async (nutritionData: NutritionData[]) => {
    if (!user || !analysisResult) return;

    setSaving(true);
    try {
      await foodService.createFoodEntry(
        {
          date: currentDate,
          mealType: 'lunch', // Default, could be made configurable
          textDescription: 'AI analyzed food'
        },
        nutritionData,
        user.id
      );

      setAnalysisResult(null);
      await loadDailyNutrition();
      
      // Show different message based on offline status
      const message = offlineStatus.isOnline 
        ? 'Food entry saved successfully!' 
        : 'Food entry saved offline - will sync when online!';
      alert(message);
    } catch (error) {
      console.error('Failed to save food entry:', error);
      alert('Failed to save food entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this food entry?')) {
      const success = await foodService.deleteFoodEntry(entryId);
      if (success) {
        await loadDailyNutrition();
      }
    }
  };

  const getMealIcon = (mealType: MealType) => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎'
    };
    return icons[mealType];
  };

  const formatMealName = (mealType: MealType) => {
    return mealType.charAt(0).toUpperCase() + mealType.slice(1);
  };

  if (!isSignedIn || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-500">Please sign in to access your food journal.</p>
        <p className="text-xs text-gray-400 mt-2">Debug: isSignedIn={String(isSignedIn)}, user={user ? 'exists' : 'null'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Food Journal</h1>
        
        <div className="flex items-center space-x-4">
          {currentView === 'daily' && (
            <input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          )}
          <button
            onClick={() => setShowSearch(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Search History
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Add Food
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex space-x-1 mb-8">
        <button
          onClick={() => setCurrentView('daily')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentView === 'daily'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Daily View
        </button>
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentView === 'dashboard'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Nutrition Dashboard
        </button>
        <button
          onClick={() => setCurrentView('reports')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentView === 'reports'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Reports
        </button>
        <button
          onClick={() => setCurrentView('goals')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentView === 'goals'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Goals
        </button>
      </div>

      {/* Analysis Result Modal */}
      {analysisResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
            <NutritionAnalysisResult
              nutritionData={analysisResult.nutritionData || []}
              onSave={handleSaveFoodEntry}
              onCancel={() => setAnalysisResult(null)}
              saving={saving}
            />
          </div>
        </div>
      )}

      {/* Add Food Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto">
            <FoodEntryForm
              onAnalysisComplete={handleAnalysisComplete}
              onClose={() => setShowAddForm(false)}
              defaultDate={currentDate}
            />
          </div>
        </div>
      )}

      {/* Food Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-y-auto w-full">
            <FoodSearch onClose={() => setShowSearch(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      {currentView === 'dashboard' ? (
        <NutritionDashboard />
      ) : currentView === 'reports' ? (
        <NutritionReports />
      ) : currentView === 'goals' ? (
        <NutritionGoals />
      ) : loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading nutrition data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Daily Summary */}
          {dailyNutrition && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Daily Summary - {new Date(currentDate).toLocaleDateString()}
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round(dailyNutrition.totalCalories)}
                  </div>
                  <div className="text-gray-600">Calories</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(dailyNutrition.totalMacros.protein)}g
                  </div>
                  <div className="text-gray-600">Protein</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(dailyNutrition.totalMacros.carbohydrates)}g
                  </div>
                  <div className="text-gray-600">Carbs</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(dailyNutrition.totalMacros.fat)}g
                  </div>
                  <div className="text-gray-600">Fat</div>
                </div>
              </div>
            </div>
          )}

          {/* Meal Entries */}
          <div className="space-y-6">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map(mealType => {
              const mealEntries = dailyNutrition?.entries.filter(entry => entry.mealType === mealType) || [];
              const mealNutrition = dailyNutrition?.mealBreakdown[mealType];
              
              return (
                <div key={mealType} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <span className="mr-2">{getMealIcon(mealType)}</span>
                      {formatMealName(mealType)}
                      {mealNutrition?.totalCalories && (
                        <span className="ml-2 text-sm text-gray-600">
                          ({Math.round(mealNutrition.totalCalories)} cal)
                        </span>
                      )}
                    </h3>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="text-green-600 hover:text-green-700 text-sm"
                    >
                      + Add Food
                    </button>
                  </div>

                  {mealEntries.length > 0 ? (
                    <div className="space-y-3">
                      {mealEntries.map(entry => (
                        <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex flex-wrap gap-2 mb-2">
                                {entry.foods.map((food, index) => (
                                  <span key={index} className="text-sm font-medium text-gray-900">
                                    {food.foodItem}
                                    {index < entry.foods.length - 1 && ','}
                                  </span>
                                ))}
                              </div>
                              {entry.notes && (
                                <p className="text-sm text-gray-600 mb-2">{entry.notes}</p>
                              )}
                              <div className="flex space-x-4 text-xs text-gray-500">
                                <span>
                                  {entry.foods.reduce((sum, food) => sum + food.calories, 0)} cal
                                </span>
                                <span>
                                  P: {Math.round(entry.foods.reduce((sum, food) => sum + food.macronutrients.protein, 0))}g
                                </span>
                                <span>
                                  C: {Math.round(entry.foods.reduce((sum, food) => sum + food.macronutrients.carbohydrates, 0))}g
                                </span>
                                <span>
                                  F: {Math.round(entry.foods.reduce((sum, food) => sum + food.macronutrients.fat, 0))}g
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                              title="Delete entry"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          
                          {entry.imageUrl && (
                            <img 
                              src={entry.imageUrl} 
                              alt="Food" 
                              className="w-16 h-16 object-cover rounded mt-2"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No {mealType} logged yet
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          </div>

          {/* Sidebar - Goals Progress and Favorite Foods */}
          <div className="lg:col-span-1 space-y-6">
            <GoalProgress date={currentDate} dailyNutrition={dailyNutrition} />
            <FavoriteFoods showActions={false} />
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodJournalPage;