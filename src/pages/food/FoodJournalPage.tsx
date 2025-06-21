import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { FoodEntryForm } from '../../components/food/FoodEntryForm';
import { NutritionAnalysisResult } from '../../components/food/NutritionAnalysisResult';
import { FoodSearch } from '../../components/food/FoodSearch';
import { NutritionDashboard } from '../../components/food/NutritionDashboard';
import { NutritionReports } from '../../components/food/NutritionReports';
import { FavoriteFoods } from '../../components/food/FavoriteFoods';
import { NutritionGoals } from '../../components/food/NutritionGoals';
import { GoalProgress } from '../../components/food/GoalProgress';
import { foodService } from '../../services/foodService';
import { GeminiAnalysisResponse, NutritionData, geminiService } from '../../services/geminiService';
import { rdaService, NutrientStatus } from '../../services/rdaService';
import { FoodEntry, DailyNutrition, MealType } from '../../types/food';

const FoodJournalPage: React.FC = () => {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
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
    
    // Show warning if using fake data
    if (!result.success && result.error?.includes('fake data')) {
      alert('⚠️ WARNING: This nutrition analysis is FAKE DATA!\n\nTo get accurate nutrition information, you need to configure the Gemini API key in your environment variables.');
    }
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

  const renderMicronutrientProgress = (current: number, nutrient: keyof typeof dailyNutrition.totalMicros, displayName: string) => {
    const status = rdaService.getNutrientStatus(current, nutrient as any);
    const progressWidth = Math.min(status.percentage, 200); // Cap at 200% for display
    
    return (
      <div className="text-center p-2 bg-white rounded border relative">
        <div className="text-sm font-bold" style={{ color: status.percentage < 50 ? '#dc2626' : status.percentage < 80 ? '#d97706' : status.percentage > 150 ? '#ea580c' : '#059669' }}>
          {status.unit === 'mcg' || status.unit === 'IU' ? current.toFixed(current < 1 ? 2 : 1) : Math.round(current)}{status.unit}
        </div>
        <div className="text-xs text-gray-600 mb-1">{displayName}</div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
          <div 
            className={`h-1.5 rounded-full transition-all duration-300 ${rdaService.getProgressBarColor(status.status)}`}
            style={{ width: `${Math.min(progressWidth, 100)}%` }}
          ></div>
        </div>
        
        {/* Percentage */}
        <div className={`text-xs font-medium ${rdaService.getStatusColor(status.status)}`}>
          {status.percentage}%
        </div>
        
        {/* RDA target */}
        <div className="text-xs text-gray-400">
          RDA: {status.rda}{status.unit}
        </div>
      </div>
    );
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
      {/* AI Configuration Warning */}
      {!geminiService.isConfigured() && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Warning:</strong> AI nutrition analysis is disabled. Food entries will show fake/random nutrition data. 
                <br />
                <span className="text-xs text-yellow-600">
                  To fix: Configure REACT_APP_GEMINI_API_KEY in your environment variables.
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

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
              
              {/* Macronutrients with RDA Progress */}
              <div className="bg-white rounded-lg p-4 mb-6 border">
                <h3 className="font-semibold text-gray-900 mb-3">🍽️ Calories & Macronutrients vs RDA</h3>
                
                {/* Primary Macros */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {(() => {
                    const calorieStatus = rdaService.getNutrientStatus(dailyNutrition.totalCalories, 'calories');
                    const proteinStatus = rdaService.getNutrientStatus(dailyNutrition.totalMacros.protein, 'protein');
                    const carbStatus = rdaService.getNutrientStatus(dailyNutrition.totalMacros.carbohydrates, 'carbohydrates');
                    const fatStatus = rdaService.getNutrientStatus(dailyNutrition.totalMacros.fat, 'fat');
                    
                    return (
                      <>
                        <div className="text-center p-4 bg-green-50 rounded-lg relative">
                          <div className={`text-3xl font-bold ${rdaService.getStatusColor(calorieStatus.status)}`}>
                            {Math.round(dailyNutrition.totalCalories)}
                          </div>
                          <div className="text-gray-600 mb-2">Calories</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div 
                              className={`h-2 rounded-full ${rdaService.getProgressBarColor(calorieStatus.status)}`}
                              style={{ width: `${Math.min(calorieStatus.percentage, 100)}%` }}
                            ></div>
                          </div>
                          <div className={`text-xs font-medium ${rdaService.getStatusColor(calorieStatus.status)}`}>
                            {calorieStatus.percentage}% of {calorieStatus.rda}
                          </div>
                        </div>
                        
                        <div className="text-center p-4 bg-blue-50 rounded-lg relative">
                          <div className={`text-2xl font-bold ${rdaService.getStatusColor(proteinStatus.status)}`}>
                            {Math.round(dailyNutrition.totalMacros.protein)}g
                          </div>
                          <div className="text-gray-600 mb-2">Protein</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div 
                              className={`h-2 rounded-full ${rdaService.getProgressBarColor(proteinStatus.status)}`}
                              style={{ width: `${Math.min(proteinStatus.percentage, 100)}%` }}
                            ></div>
                          </div>
                          <div className={`text-xs font-medium ${rdaService.getStatusColor(proteinStatus.status)}`}>
                            {proteinStatus.percentage}% of {proteinStatus.rda}g
                          </div>
                        </div>
                        
                        <div className="text-center p-4 bg-orange-50 rounded-lg relative">
                          <div className={`text-2xl font-bold ${rdaService.getStatusColor(carbStatus.status)}`}>
                            {Math.round(dailyNutrition.totalMacros.carbohydrates)}g
                          </div>
                          <div className="text-gray-600 mb-2">Carbs</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div 
                              className={`h-2 rounded-full ${rdaService.getProgressBarColor(carbStatus.status)}`}
                              style={{ width: `${Math.min(carbStatus.percentage, 100)}%` }}
                            ></div>
                          </div>
                          <div className={`text-xs font-medium ${rdaService.getStatusColor(carbStatus.status)}`}>
                            {carbStatus.percentage}% of {carbStatus.rda}g
                          </div>
                        </div>
                        
                        <div className="text-center p-4 bg-purple-50 rounded-lg relative">
                          <div className={`text-2xl font-bold ${rdaService.getStatusColor(fatStatus.status)}`}>
                            {Math.round(dailyNutrition.totalMacros.fat)}g
                          </div>
                          <div className="text-gray-600 mb-2">Fat</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div 
                              className={`h-2 rounded-full ${rdaService.getProgressBarColor(fatStatus.status)}`}
                              style={{ width: `${Math.min(fatStatus.percentage, 100)}%` }}
                            ></div>
                          </div>
                          <div className={`text-xs font-medium ${rdaService.getStatusColor(fatStatus.status)}`}>
                            {fatStatus.percentage}% of {fatStatus.rda}g
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Additional Macros */}
                <div className="grid grid-cols-2 gap-4">
                  {(() => {
                    const fiberStatus = rdaService.getNutrientStatus(dailyNutrition.totalMacros.fiber, 'fiber');
                    const sugarStatus = rdaService.getNutrientStatus(dailyNutrition.totalMacros.sugar, 'sugar');
                    
                    return (
                      <>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                          <div className={`text-xl font-bold ${rdaService.getStatusColor(fiberStatus.status)}`}>
                            {Math.round(dailyNutrition.totalMacros.fiber)}g
                          </div>
                          <div className="text-gray-600 mb-2">Fiber</div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                            <div 
                              className={`h-1.5 rounded-full ${rdaService.getProgressBarColor(fiberStatus.status)}`}
                              style={{ width: `${Math.min(fiberStatus.percentage, 100)}%` }}
                            ></div>
                          </div>
                          <div className={`text-xs font-medium ${rdaService.getStatusColor(fiberStatus.status)}`}>
                            {fiberStatus.percentage}% of {fiberStatus.rda}g
                          </div>
                        </div>
                        
                        <div className="text-center p-3 bg-pink-50 rounded-lg">
                          <div className={`text-xl font-bold ${rdaService.getStatusColor(sugarStatus.status)}`}>
                            {Math.round(dailyNutrition.totalMacros.sugar)}g
                          </div>
                          <div className="text-gray-600 mb-2">Sugar</div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                            <div 
                              className={`h-1.5 rounded-full ${rdaService.getProgressBarColor(sugarStatus.status)}`}
                              style={{ width: `${Math.min(sugarStatus.percentage, 100)}%` }}
                            ></div>
                          </div>
                          <div className={`text-xs font-medium ${rdaService.getStatusColor(sugarStatus.status)}`}>
                            {sugarStatus.percentage}% of {sugarStatus.rda}g (limit)
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Daily Nutrition Summary */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">🎯 Daily Nutrition Status</h3>
                {(() => {
                  const allNutrients = [
                    // Macronutrients & Calories
                    { key: 'calories', value: dailyNutrition.totalCalories },
                    { key: 'protein', value: dailyNutrition.totalMacros.protein },
                    { key: 'carbohydrates', value: dailyNutrition.totalMacros.carbohydrates },
                    { key: 'fat', value: dailyNutrition.totalMacros.fat },
                    { key: 'fiber', value: dailyNutrition.totalMacros.fiber },
                    { key: 'sugar', value: dailyNutrition.totalMacros.sugar },
                    // ALL 27 Micronutrients - Minerals
                    { key: 'sodium', value: dailyNutrition.totalMicros.sodium },
                    { key: 'potassium', value: dailyNutrition.totalMicros.potassium },
                    { key: 'calcium', value: dailyNutrition.totalMicros.calcium },
                    { key: 'iron', value: dailyNutrition.totalMicros.iron },
                    { key: 'magnesium', value: dailyNutrition.totalMicros.magnesium || 0 },
                    { key: 'phosphorus', value: dailyNutrition.totalMicros.phosphorus || 0 },
                    { key: 'zinc', value: dailyNutrition.totalMicros.zinc || 0 },
                    { key: 'copper', value: dailyNutrition.totalMicros.copper || 0 },
                    { key: 'manganese', value: dailyNutrition.totalMicros.manganese || 0 },
                    { key: 'selenium', value: dailyNutrition.totalMicros.selenium || 0 },
                    { key: 'iodine', value: dailyNutrition.totalMicros.iodine || 0 },
                    // Fat-Soluble Vitamins
                    { key: 'vitaminA', value: dailyNutrition.totalMicros.vitaminA },
                    { key: 'vitaminD', value: dailyNutrition.totalMicros.vitaminD || 0 },
                    { key: 'vitaminE', value: dailyNutrition.totalMicros.vitaminE || 0 },
                    { key: 'vitaminK', value: dailyNutrition.totalMicros.vitaminK || 0 },
                    // Water-Soluble Vitamins
                    { key: 'vitaminC', value: dailyNutrition.totalMicros.vitaminC },
                    { key: 'thiamine', value: dailyNutrition.totalMicros.thiamine || 0 },
                    { key: 'riboflavin', value: dailyNutrition.totalMicros.riboflavin || 0 },
                    { key: 'niacin', value: dailyNutrition.totalMicros.niacin || 0 },
                    { key: 'pantothenicAcid', value: dailyNutrition.totalMicros.pantothenicAcid || 0 },
                    { key: 'vitaminB6', value: dailyNutrition.totalMicros.vitaminB6 || 0 },
                    { key: 'biotin', value: dailyNutrition.totalMicros.biotin || 0 },
                    { key: 'folate', value: dailyNutrition.totalMicros.folate || 0 },
                    { key: 'vitaminB12', value: dailyNutrition.totalMicros.vitaminB12 || 0 },
                    { key: 'choline', value: dailyNutrition.totalMicros.choline || 0 }
                  ] as Array<{key: string, value: number}>;
                  
                  const statuses = allNutrients.map(n => rdaService.getNutrientStatus(n.value, n.key as any));
                  const deficient = statuses.filter(s => s.status === 'deficient');
                  const adequate = statuses.filter(s => s.status === 'adequate');
                  const optimal = statuses.filter(s => s.status === 'optimal');
                  const excessive = statuses.filter(s => s.status === 'excessive');
                  
                  return (
                    <div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-green-100 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{optimal.length}</div>
                          <div className="text-sm text-green-700">Optimal</div>
                        </div>
                        <div className="text-center p-3 bg-yellow-100 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">{adequate.length}</div>
                          <div className="text-sm text-yellow-700">Adequate</div>
                        </div>
                        <div className="text-center p-3 bg-red-100 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">{deficient.length}</div>
                          <div className="text-sm text-red-700">Deficient</div>
                        </div>
                        <div className="text-center p-3 bg-orange-100 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">{excessive.length}</div>
                          <div className="text-sm text-orange-700">Excessive</div>
                        </div>
                      </div>
                      
                      {/* Nutrition Alerts */}
                      {(deficient.length > 0 || excessive.length > 0) && (
                        <div className="space-y-2">
                          {deficient.length > 0 && (
                            <div className="bg-red-100 border-l-4 border-red-500 p-3 rounded">
                              <div className="flex items-start">
                                <span className="text-red-600 text-sm font-medium">⚠️ Deficient nutrients:</span>
                                <div className="text-red-700 text-sm ml-2 flex-1">
                                  {deficient.slice(0, 5).map(s => `${s.name} (${s.percentage}%)`).join(', ')}
                                  {deficient.length > 5 && <span className="text-red-600"> +{deficient.length - 5} more</span>}
                                </div>
                              </div>
                            </div>
                          )}
                          {excessive.length > 0 && (
                            <div className="bg-orange-100 border-l-4 border-orange-500 p-3 rounded">
                              <div className="flex items-start">
                                <span className="text-orange-600 text-sm font-medium">🚨 Excessive nutrients:</span>
                                <div className="text-orange-700 text-sm ml-2 flex-1">
                                  {excessive.slice(0, 5).map(s => `${s.name} (${s.percentage}%)`).join(', ')}
                                  {excessive.length > 5 && <span className="text-orange-600"> +{excessive.length - 5} more</span>}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Quick Recommendations */}
                          {deficient.length > 0 && (
                            <div className="bg-blue-100 border-l-4 border-blue-500 p-3 rounded">
                              <div className="flex items-start">
                                <span className="text-blue-600 text-sm font-medium">💡 Quick tips:</span>
                                <div className="text-blue-700 text-sm ml-2 flex-1">
                                  {deficient.length > 0 && deficient[0].name === 'Fiber' && 'Add whole grains, fruits, and vegetables'}
                                  {deficient.length > 0 && deficient[0].name === 'Protein' && 'Include lean meats, beans, or dairy'}
                                  {deficient.length > 0 && deficient[0].name === 'Calcium' && 'Try dairy products or leafy greens'}
                                  {deficient.length > 0 && deficient[0].name === 'Iron' && 'Add red meat, spinach, or fortified cereals'}
                                  {deficient.length > 0 && deficient[0].name === 'Vitamin C' && 'Include citrus fruits, berries, or bell peppers'}
                                  {deficient.length > 0 && !['Fiber', 'Protein', 'Calcium', 'Iron', 'Vitamin C'].includes(deficient[0].name) && 'Focus on a varied, balanced diet'}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Micronutrients with RDA Progress */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">📊 Micronutrients vs RDA</h3>
                  <div className="text-xs text-gray-500">
                    <span className="text-red-600">●</span> Deficient (&lt;50%) 
                    <span className="text-yellow-600 ml-2">●</span> Adequate (50-80%) 
                    <span className="text-green-600 ml-2">●</span> Optimal (80-150%) 
                    <span className="text-orange-600 ml-2">●</span> Excessive (&gt;150%)
                  </div>
                </div>
                
                {/* Minerals */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">🧪 Minerals</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {renderMicronutrientProgress(dailyNutrition.totalMicros.sodium, 'sodium', 'Sodium')}
                    {renderMicronutrientProgress(dailyNutrition.totalMicros.potassium, 'potassium', 'Potassium')}
                    {renderMicronutrientProgress(dailyNutrition.totalMicros.calcium, 'calcium', 'Calcium')}
                    {renderMicronutrientProgress(dailyNutrition.totalMicros.iron, 'iron', 'Iron')}
                    {renderMicronutrientProgress(dailyNutrition.totalMicros.magnesium || 0, 'magnesium', 'Magnesium')}
                    {renderMicronutrientProgress(dailyNutrition.totalMicros.phosphorus || 0, 'phosphorus', 'Phosphorus')}
                    {renderMicronutrientProgress(dailyNutrition.totalMicros.zinc || 0, 'zinc', 'Zinc')}
                    {renderMicronutrientProgress(dailyNutrition.totalMicros.copper || 0, 'copper', 'Copper')}
                    {renderMicronutrientProgress(dailyNutrition.totalMicros.manganese || 0, 'manganese', 'Manganese')}
                    {renderMicronutrientProgress(dailyNutrition.totalMicros.selenium || 0, 'selenium', 'Selenium')}
                    {renderMicronutrientProgress(dailyNutrition.totalMicros.iodine || 0, 'iodine', 'Iodine')}
                  </div>
                </div>

                {/* Fat-Soluble Vitamins */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">🧈 Fat-Soluble Vitamins</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {renderMicronutrientProgress(dailyNutrition.totalMicros.vitaminA, 'vitaminA', 'Vitamin A')}
                    {renderMicronutrientProgress(dailyNutrition.totalMicros.vitaminD || 0, 'vitaminD', 'Vitamin D')}
                    {renderMicronutrientProgress(dailyNutrition.totalMicros.vitaminE || 0, 'vitaminE', 'Vitamin E')}
                    {renderMicronutrientProgress(dailyNutrition.totalMicros.vitaminK || 0, 'vitaminK', 'Vitamin K')}
                  </div>
                </div>

                {/* Water-Soluble Vitamins */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">💧 Water-Soluble Vitamins</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {renderMicronutrientProgress(dailyNutrition.totalMicros.vitaminC, 'vitaminC', 'Vitamin C')}
                    {renderMicronutrientProgress(dailyNutrition.totalMicros.thiamine || 0, 'thiamine', 'B1 (Thiamine)')}
                    {renderMicronutrientProgress(dailyNutrition.totalMicros.riboflavin || 0, 'riboflavin', 'B2 (Riboflavin)')}
                    {renderMicronutrientProgress(dailyNutrition.totalMicros.niacin || 0, 'niacin', 'B3 (Niacin)')}
                    {renderMicronutrientProgress(dailyNutrition.totalMicros.pantothenicAcid || 0, 'pantothenicAcid', 'B5')}
                    {renderMicronutrientProgress(dailyNutrition.totalMicros.vitaminB6 || 0, 'vitaminB6', 'B6')}
                    {renderMicronutrientProgress(dailyNutrition.totalMicros.biotin || 0, 'biotin', 'B7 (Biotin)')}
                    {renderMicronutrientProgress(dailyNutrition.totalMicros.folate || 0, 'folate', 'B9 (Folate)')}
                    {renderMicronutrientProgress(dailyNutrition.totalMicros.vitaminB12 || 0, 'vitaminB12', 'B12')}
                    {renderMicronutrientProgress(dailyNutrition.totalMicros.choline || 0, 'choline', 'Choline')}
                  </div>
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
                              {/* Macronutrients */}
                              <div className="flex space-x-4 text-xs text-gray-700 mb-2">
                                <span className="font-medium">
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
                                <span>
                                  Fiber: {Math.round(entry.foods.reduce((sum, food) => sum + food.macronutrients.fiber, 0))}g
                                </span>
                              </div>
                              
                              {/* Micronutrients */}
                              <details className="text-xs text-gray-600">
                                <summary className="cursor-pointer text-blue-600 hover:text-blue-700 mb-1">
                                  📊 View micronutrients
                                </summary>
                                <div className="mt-2 p-2 bg-gray-50 rounded">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mb-2">
                                    <span>Na: {Math.round(entry.foods.reduce((sum, food) => sum + food.micronutrients.sodium, 0))}mg</span>
                                    <span>K: {Math.round(entry.foods.reduce((sum, food) => sum + food.micronutrients.potassium, 0))}mg</span>
                                    <span>Ca: {Math.round(entry.foods.reduce((sum, food) => sum + food.micronutrients.calcium, 0))}mg</span>
                                    <span>Fe: {Math.round(entry.foods.reduce((sum, food) => sum + food.micronutrients.iron, 0))}mg</span>
                                    <span>Mg: {Math.round(entry.foods.reduce((sum, food) => sum + (food.micronutrients.magnesium || 0), 0))}mg</span>
                                    <span>P: {Math.round(entry.foods.reduce((sum, food) => sum + (food.micronutrients.phosphorus || 0), 0))}mg</span>
                                    <span>Zn: {Math.round(entry.foods.reduce((sum, food) => sum + (food.micronutrients.zinc || 0), 0))}mg</span>
                                    <span>Cu: {(entry.foods.reduce((sum, food) => sum + (food.micronutrients.copper || 0), 0)).toFixed(1)}mg</span>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mb-2">
                                    <span>Vit A: {Math.round(entry.foods.reduce((sum, food) => sum + food.micronutrients.vitaminA, 0))}IU</span>
                                    <span>Vit D: {Math.round(entry.foods.reduce((sum, food) => sum + (food.micronutrients.vitaminD || 0), 0))}IU</span>
                                    <span>Vit E: {Math.round(entry.foods.reduce((sum, food) => sum + (food.micronutrients.vitaminE || 0), 0))}mg</span>
                                    <span>Vit K: {Math.round(entry.foods.reduce((sum, food) => sum + (food.micronutrients.vitaminK || 0), 0))}mcg</span>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                                    <span>Vit C: {Math.round(entry.foods.reduce((sum, food) => sum + food.micronutrients.vitaminC, 0))}mg</span>
                                    <span>B1: {(entry.foods.reduce((sum, food) => sum + (food.micronutrients.thiamine || 0), 0)).toFixed(1)}mg</span>
                                    <span>B2: {(entry.foods.reduce((sum, food) => sum + (food.micronutrients.riboflavin || 0), 0)).toFixed(1)}mg</span>
                                    <span>B3: {Math.round(entry.foods.reduce((sum, food) => sum + (food.micronutrients.niacin || 0), 0))}mg</span>
                                    <span>B6: {(entry.foods.reduce((sum, food) => sum + (food.micronutrients.vitaminB6 || 0), 0)).toFixed(1)}mg</span>
                                    <span>B9: {Math.round(entry.foods.reduce((sum, food) => sum + (food.micronutrients.folate || 0), 0))}mcg</span>
                                    <span>B12: {(entry.foods.reduce((sum, food) => sum + (food.micronutrients.vitaminB12 || 0), 0)).toFixed(1)}mcg</span>
                                    <span>Choline: {Math.round(entry.foods.reduce((sum, food) => sum + (food.micronutrients.choline || 0), 0))}mg</span>
                                  </div>
                                </div>
                              </details>
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