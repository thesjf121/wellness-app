import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FoodEntryForm } from '../../components/food/FoodEntryForm';
import { NutritionAnalysisResult } from '../../components/food/NutritionAnalysisResult';
import { QuickFoodEntry } from '../../components/food/QuickFoodEntry';
import { FoodSearch } from '../../components/food/FoodSearch';
import { NutritionDashboard } from '../../components/food/NutritionDashboard';
import { NutritionReports } from '../../components/food/NutritionReports';
import { FavoriteFoods } from '../../components/food/FavoriteFoods';
import { NutritionGoals } from '../../components/food/NutritionGoals';
import { GoalProgress } from '../../components/food/GoalProgress';
import { WellnessCard, CardHeader, CardTitle, CardContent } from '../../components/ui/WellnessCard';
import { CircularProgress } from '../../components/ui/CircularProgress';
import { BottomNavigation } from '../../components/ui/BottomNavigation';
import { ParallaxContainer, ParallaxLayer, parallaxPresets } from '../../components/ui/ParallaxContainer';
import { foodService } from '../../services/foodService';
import { GeminiAnalysisResponse, NutritionData, geminiService } from '../../services/geminiService';
import { rdaService } from '../../services/rdaService';
import { FoodEntry, DailyNutrition, MealType } from '../../types/food';
import MobileFoodJournalPage from './MobileFoodJournalPage';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { ROUTES } from '../../utils/constants';

const FoodJournalPage: React.FC = () => {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [currentView, setCurrentView] = useState<'daily' | 'dashboard' | 'reports' | 'goals'>('daily');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<GeminiAnalysisResponse | null>(null);
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutrition | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [offlineStatus, setOfflineStatus] = useState({ count: 0, isOnline: true });
  const [analyzingFood, setAnalyzingFood] = useState<MealType | null>(null);
  const [recentFoods, setRecentFoods] = useState<string[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<FoodEntry | null>(null);

  useEffect(() => {
    if (user) {
      loadDailyNutrition();
      loadRecentFoods();
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

  const loadRecentFoods = async () => {
    if (!user) return;
    
    try {
      const recent = await foodService.getRecentFoods(user.id, 10);
      setRecentFoods(recent.map(f => f.description));
    } catch (error) {
      console.error('Failed to load recent foods:', error);
    }
  };

  const handleQuickFoodEntry = async (mealType: MealType, description: string) => {
    if (!user) return;
    
    setAnalyzingFood(mealType);
    try {
      const analysisResult = await geminiService.analyzeFoodText({ 
        text: description, 
        mealType,
        userId: user.id
      });
      
      if (analysisResult.nutritionData && analysisResult.nutritionData.length > 0) {
        await foodService.createFoodEntry(
          {
            date: currentDate,
            mealType
          },
          analysisResult.nutritionData,
          user.id
        );
        
        await loadDailyNutrition();
        await loadRecentFoods();
      }
    } catch (error) {
      console.error('Failed to analyze food:', error);
      alert('Failed to analyze food. Please try again.');
    } finally {
      setAnalyzingFood(null);
    }
  };

  const handleAnalysisComplete = (result: GeminiAnalysisResponse) => {
    setAnalysisResult(result);
    setShowAddForm(false);
    
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
          mealType: 'lunch',
          textDescription: 'AI analyzed food'
        },
        nutritionData,
        user.id
      );

      setAnalysisResult(null);
      await loadDailyNutrition();
      
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

  const renderMacronutrientCard = (label: string, value: number, unit: string, status: any, icon: string, colorClass: string) => (
    <WellnessCard variant="gradient" className={`${colorClass} text-center`}>
      <CardContent className="p-4">
        <div className="text-2xl mb-2">{icon}</div>
        <div className={`text-2xl font-bold ${rdaService.getStatusColor(status.status)}`}>
          {Math.round(value)}{unit}
        </div>
        <div className="text-sm text-gray-600 mb-2">{label}</div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full ${rdaService.getProgressBarColor(status.status)}`}
            style={{ width: `${Math.min(status.percentage, 100)}%` }}
          ></div>
        </div>
        <div className={`text-xs font-medium ${rdaService.getStatusColor(status.status)}`}>
          {status.percentage}% of RDA
        </div>
      </CardContent>
    </WellnessCard>
  );

  if (!isSignedIn || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <WellnessCard>
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">🔒</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h2>
            <p className="text-gray-500">Please sign in to access your food journal and track your nutrition.</p>
          </CardContent>
        </WellnessCard>
      </div>
    );
  }

  // Show mobile version on small screens
  if (isMobile) {
    return <MobileFoodJournalPage />;
  }

  return (
    <>
      <ParallaxContainer
        backgroundGradient={parallaxPresets.food.backgroundGradient}
        className="min-h-screen"
      >
        <ParallaxLayer speed={0.25} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* AI Configuration Warning */}
        {!geminiService.isConfigured() && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <WellnessCard variant="secondary" className="border-l-4 border-yellow-400 bg-yellow-50">
              <CardContent className="p-4">
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
              </CardContent>
            </WellnessCard>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8"
        >
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-2xl">🥗</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Food Journal</h1>
              <p className="text-gray-600">Track your nutrition with AI-powered insights</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {currentView === 'daily' && (
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            )}
            <motion.button
              onClick={() => setShowSearch(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              📊 History
            </motion.button>
            <motion.button
              onClick={() => setShowAddForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ➕ Add Food
            </motion.button>
            <motion.button
              onClick={() => {
                geminiService.clearAllStoredData();
                alert('All food data cleared! Next food entries will be fresh from AI.');
                window.location.reload();
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🗑️ Clear
            </motion.button>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex space-x-2 mb-8 overflow-x-auto"
        >
          {[
            { key: 'daily', label: 'Daily View', icon: '📅' },
            { key: 'dashboard', label: 'Dashboard', icon: '📊' },
            { key: 'reports', label: 'Reports', icon: '📈' },
            { key: 'goals', label: 'Goals', icon: '🎯' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCurrentView(tab.key as any)}
              className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                currentView === tab.key
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Modals */}
        {analysisResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
              <NutritionAnalysisResult
                nutritionData={analysisResult.nutritionData || []}
                onSave={handleSaveFoodEntry}
                onCancel={() => setAnalysisResult(null)}
                saving={saving}
              />
            </div>
          </div>
        )}

        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
              <FoodEntryForm
                onAnalysisComplete={handleAnalysisComplete}
                onClose={() => setShowAddForm(false)}
                defaultDate={currentDate}
              />
            </div>
          </div>
        )}

        {showSearch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-6xl max-h-[90vh] overflow-y-auto w-full">
              <FoodSearch onClose={() => setShowSearch(false)} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {currentView === 'dashboard' ? (
            <NutritionDashboard />
          ) : currentView === 'reports' ? (
            <NutritionReports />
          ) : currentView === 'goals' ? (
            <NutritionGoals />
          ) : loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
              <p className="text-gray-500">Loading nutrition data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="xl:col-span-3">
                {/* Daily Summary */}
                {dailyNutrition && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                  >
                    <WellnessCard>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <span className="mr-2">📊</span>
                          Daily Summary - {new Date(currentDate).toLocaleDateString()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {/* Macronutrients Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          {(() => {
                            const calorieStatus = rdaService.getNutrientStatus(dailyNutrition.totalCalories, 'calories');
                            const proteinStatus = rdaService.getNutrientStatus(dailyNutrition.totalMacros.protein, 'protein');
                            const carbStatus = rdaService.getNutrientStatus(dailyNutrition.totalMacros.carbohydrates, 'carbohydrates');
                            const fatStatus = rdaService.getNutrientStatus(dailyNutrition.totalMacros.fat, 'fat');
                            
                            return (
                              <>
                                {renderMacronutrientCard('Calories', dailyNutrition.totalCalories, '', calorieStatus, '🔥', 'bg-gradient-to-br from-red-50 to-orange-50 border border-red-100')}
                                {renderMacronutrientCard('Protein', dailyNutrition.totalMacros.protein, 'g', proteinStatus, '🥩', 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100')}
                                {renderMacronutrientCard('Carbs', dailyNutrition.totalMacros.carbohydrates, 'g', carbStatus, '🍞', 'bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-100')}
                                {renderMacronutrientCard('Fat', dailyNutrition.totalMacros.fat, 'g', fatStatus, '🥑', 'bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100')}
                              </>
                            );
                          })()}
                        </div>

                        {/* Nutrition Status Summary */}
                        <WellnessCard variant="secondary" className="mb-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`${ROUTES.NUTRITION_DASHBOARD}?date=${currentDate}`)}>
                          <CardHeader>
                            <CardTitle className="text-lg">🎯 Nutrition Overview</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {(() => {
                              const allNutrients = [
                                { key: 'calories', value: dailyNutrition.totalCalories },
                                { key: 'protein', value: dailyNutrition.totalMacros.protein },
                                { key: 'carbohydrates', value: dailyNutrition.totalMacros.carbohydrates },
                                { key: 'fat', value: dailyNutrition.totalMacros.fat },
                                { key: 'fiber', value: dailyNutrition.totalMacros.fiber },
                                { key: 'sodium', value: dailyNutrition.totalMicros.sodium },
                                { key: 'potassium', value: dailyNutrition.totalMicros.potassium },
                                { key: 'calcium', value: dailyNutrition.totalMicros.calcium },
                                { key: 'iron', value: dailyNutrition.totalMicros.iron },
                                { key: 'vitaminA', value: dailyNutrition.totalMicros.vitaminA },
                                { key: 'vitaminC', value: dailyNutrition.totalMicros.vitaminC }
                              ] as Array<{key: string, value: number}>;
                              
                              const statuses = allNutrients.map(n => rdaService.getNutrientStatus(n.value, n.key as any));
                              const deficient = statuses.filter(s => s.status === 'deficient');
                              const adequate = statuses.filter(s => s.status === 'adequate');
                              const optimal = statuses.filter(s => s.status === 'optimal');
                              const excessive = statuses.filter(s => s.status === 'excessive');
                              
                              return (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="text-center p-4 bg-green-100 rounded-xl">
                                    <div className="text-2xl font-bold text-green-600">{optimal.length}</div>
                                    <div className="text-sm text-green-700">Optimal</div>
                                  </div>
                                  <div className="text-center p-4 bg-yellow-100 rounded-xl">
                                    <div className="text-2xl font-bold text-yellow-600">{adequate.length}</div>
                                    <div className="text-sm text-yellow-700">Adequate</div>
                                  </div>
                                  <div className="text-center p-4 bg-red-100 rounded-xl">
                                    <div className="text-2xl font-bold text-red-600">{deficient.length}</div>
                                    <div className="text-sm text-red-700">Deficient</div>
                                  </div>
                                  <div className="text-center p-4 bg-orange-100 rounded-xl">
                                    <div className="text-2xl font-bold text-orange-600">{excessive.length}</div>
                                    <div className="text-sm text-orange-700">Excessive</div>
                                  </div>
                                </div>
                              );
                            })()}
                          </CardContent>
                        </WellnessCard>
                      </CardContent>
                    </WellnessCard>
                  </motion.div>
                )}

                {/* Meal Entries */}
                <div className="space-y-6">
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((mealType, index) => {
                    const mealEntries = dailyNutrition?.entries.filter(entry => entry.mealType === mealType) || [];
                    const mealNutrition = dailyNutrition?.mealBreakdown[mealType];
                    
                    return (
                      <motion.div
                        key={mealType}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <WellnessCard>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center">
                                <span className="mr-3 text-2xl">{getMealIcon(mealType)}</span>
                                {formatMealName(mealType)}
                                {mealNutrition?.totalCalories && (
                                  <span className="ml-3 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {Math.round(mealNutrition.totalCalories)} cal
                                  </span>
                                )}
                              </CardTitle>
                              <div className="flex items-center space-x-2">
                                {mealNutrition?.totalCalories && (
                                  <span className="text-xs text-gray-500">
                                    {mealEntries.length} items
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {/* Quick Food Entry */}
                            <div className="mb-4">
                              {analyzingFood === mealType ? (
                                <div className="flex items-center justify-center py-3 bg-gray-50 rounded-xl">
                                  <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-2" />
                                  <span className="text-sm text-gray-600">Analyzing...</span>
                                </div>
                              ) : (
                                <QuickFoodEntry
                                  mealType={mealType}
                                  onSubmit={(description) => handleQuickFoodEntry(mealType, description)}
                                  recentFoods={recentFoods}
                                  placeholder={`Add ${mealType}...`}
                                />
                              )}
                            </div>

                            {mealEntries.length > 0 ? (
                              <div className="space-y-4">
                                {mealEntries.map(entry => (
                                  <WellnessCard key={entry.id} variant="secondary" className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedEntry(entry)}>
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex-1">
                                        <div className="flex flex-wrap gap-2 mb-2">
                                          {entry.foods.map((food, index) => (
                                            <span key={index} className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded-lg">
                                              {food.foodItem}
                                            </span>
                                          ))}
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                                          <div className="bg-red-50 px-2 py-1 rounded text-red-700 text-center">
                                            <div className="font-medium">{entry.foods.reduce((sum, food) => sum + food.calories, 0)}</div>
                                            <div>cal</div>
                                          </div>
                                          <div className="bg-blue-50 px-2 py-1 rounded text-blue-700 text-center">
                                            <div className="font-medium">{Math.round(entry.foods.reduce((sum, food) => sum + food.macronutrients.protein, 0))}</div>
                                            <div>protein</div>
                                          </div>
                                          <div className="bg-yellow-50 px-2 py-1 rounded text-yellow-700 text-center">
                                            <div className="font-medium">{Math.round(entry.foods.reduce((sum, food) => sum + food.macronutrients.carbohydrates, 0))}</div>
                                            <div>carbs</div>
                                          </div>
                                          <div className="bg-purple-50 px-2 py-1 rounded text-purple-700 text-center">
                                            <div className="font-medium">{Math.round(entry.foods.reduce((sum, food) => sum + food.macronutrients.fat, 0))}</div>
                                            <div>fat</div>
                                          </div>
                                          <div className="bg-green-50 px-2 py-1 rounded text-green-700 text-center">
                                            <div className="font-medium">{Math.round(entry.foods.reduce((sum, food) => sum + food.macronutrients.fiber, 0))}</div>
                                            <div>fiber</div>
                                          </div>
                                        </div>
                                      </div>
                                      <motion.button
                                        onClick={() => handleDeleteEntry(entry.id)}
                                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        title="Delete entry"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </motion.button>
                                    </div>
                                    
                                    {entry.imageUrl && (
                                      <img 
                                        src={entry.imageUrl} 
                                        alt="Food" 
                                        className="w-20 h-20 object-cover rounded-xl mt-3"
                                      />
                                    )}
                                  </WellnessCard>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                  <span className="text-2xl text-gray-400">{getMealIcon(mealType)}</span>
                                </div>
                                <p className="text-gray-500">No {mealType} logged yet</p>
                                <motion.button
                                  onClick={() => setShowAddForm(true)}
                                  className="mt-3 text-green-600 hover:text-green-700 text-sm font-medium"
                                  whileHover={{ scale: 1.05 }}
                                >
                                  Add your first {mealType}
                                </motion.button>
                              </div>
                            )}
                          </CardContent>
                        </WellnessCard>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar */}
              <div className="xl:col-span-1 space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <GoalProgress date={currentDate} dailyNutrition={dailyNutrition} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <FavoriteFoods showActions={false} />
                </motion.div>
              </div>
            </div>
          )}
        </motion.div>
        </ParallaxLayer>
      </ParallaxContainer>
      
      <BottomNavigation />

      {/* Food Entry Detail Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white/90 backdrop-blur-md p-6 border-b border-gray-100 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedEntry.name || selectedEntry.foods.map(f => f.foodItem).join(', ')}</h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {selectedEntry.mealType} • {selectedEntry.quantity || '1 serving'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Nutrition Content */}
              <div className="p-6 space-y-6">
                {/* Calories */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {selectedEntry.foods.reduce((sum, food) => sum + food.calories, 0)} cal
                  </div>
                  <p className="text-sm text-gray-500">Total Calories</p>
                </div>

                {/* Macronutrients */}
                {selectedEntry.foods && selectedEntry.foods.length > 0 && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900">Nutrition Breakdown</h4>
                    {selectedEntry.foods.map((food, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4">
                        <h5 className="font-medium text-gray-900 mb-2">{food.foodItem}</h5>
                        {food.servingSize && (
                          <p className="text-sm text-blue-600 mb-4 italic">
                            Based on: {food.servingSize}
                          </p>
                        )}
                        
                        {/* Macros Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-white rounded-lg p-3">
                            <div className="text-lg font-bold text-blue-600">{Math.round(food.macronutrients.protein)}g</div>
                            <div className="text-xs text-gray-600">Protein</div>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <div className="text-lg font-bold text-orange-600">{Math.round(food.macronutrients.carbohydrates)}g</div>
                            <div className="text-xs text-gray-600">Carbs</div>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <div className="text-lg font-bold text-green-600">{Math.round(food.macronutrients.fat)}g</div>
                            <div className="text-xs text-gray-600">Fat</div>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <div className="text-lg font-bold text-purple-600">{Math.round(food.macronutrients.fiber)}g</div>
                            <div className="text-xs text-gray-600">Fiber</div>
                          </div>
                        </div>
                        
                        {/* Essential Micronutrients */}
                        <div className="border-t border-gray-200 pt-4">
                          <h6 className="text-sm font-medium text-gray-900 mb-4">Essential Vitamins & Minerals</h6>
                          
                          {/* Essential Minerals */}
                          <div className="mb-4">
                            <div className="text-xs font-medium text-gray-700 mb-2">Essential Minerals (13)</div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Calcium</span>
                                <span className="font-medium">{Math.round(food.micronutrients.calcium)}mg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Iron</span>
                                <span className="font-medium">{Math.round(food.micronutrients.iron)}mg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Magnesium</span>
                                <span className="font-medium">{Math.round(food.micronutrients.magnesium)}mg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Phosphorus</span>
                                <span className="font-medium">{Math.round(food.micronutrients.phosphorus)}mg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Potassium</span>
                                <span className="font-medium">{Math.round(food.micronutrients.potassium)}mg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Sodium</span>
                                <span className="font-medium">{Math.round(food.micronutrients.sodium)}mg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Zinc</span>
                                <span className="font-medium">{Math.round(food.micronutrients.zinc)}mg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Copper</span>
                                <span className="font-medium">{Math.round(food.micronutrients.copper * 10) / 10}mg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Manganese</span>
                                <span className="font-medium">{Math.round(food.micronutrients.manganese * 10) / 10}mg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Selenium</span>
                                <span className="font-medium">{Math.round(food.micronutrients.selenium)}mcg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Iodine</span>
                                <span className="font-medium">{Math.round(food.micronutrients.iodine)}mcg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Chromium</span>
                                <span className="font-medium">{Math.round(food.micronutrients.chromium)}mcg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Molybdenum</span>
                                <span className="font-medium">{Math.round(food.micronutrients.molybdenum)}mcg</span>
                              </div>
                            </div>
                          </div>

                          {/* Additional Important Minerals */}
                          <div className="mb-4">
                            <div className="text-xs font-medium text-gray-700 mb-2">Additional Minerals (5)</div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Fluoride</span>
                                <span className="font-medium">{Math.round(food.micronutrients.fluoride * 10) / 10}mg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Chloride</span>
                                <span className="font-medium">{Math.round(food.micronutrients.chloride)}mg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Sulfur</span>
                                <span className="font-medium">{Math.round(food.micronutrients.sulfur)}mg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Boron</span>
                                <span className="font-medium">{Math.round(food.micronutrients.boron * 10) / 10}mcg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Cobalt</span>
                                <span className="font-medium">{Math.round(food.micronutrients.cobalt * 100) / 100}mcg</span>
                              </div>
                            </div>
                          </div>

                          {/* Fat-Soluble Vitamins */}
                          <div className="mb-4">
                            <div className="text-xs font-medium text-gray-700 mb-2">Fat-Soluble Vitamins (4)</div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Vitamin A</span>
                                <span className="font-medium">{Math.round(food.micronutrients.vitaminA)}IU</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Vitamin D</span>
                                <span className="font-medium">{Math.round(food.micronutrients.vitaminD)}IU</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Vitamin E</span>
                                <span className="font-medium">{Math.round(food.micronutrients.vitaminE * 10) / 10}mg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Vitamin K</span>
                                <span className="font-medium">{Math.round(food.micronutrients.vitaminK)}mcg</span>
                              </div>
                            </div>
                          </div>

                          {/* Water-Soluble Vitamins */}
                          <div>
                            <div className="text-xs font-medium text-gray-700 mb-2">Water-Soluble Vitamins (9)</div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Vitamin C</span>
                                <span className="font-medium">{Math.round(food.micronutrients.vitaminC)}mg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Thiamine (B1)</span>
                                <span className="font-medium">{Math.round(food.micronutrients.thiamine * 10) / 10}mg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Riboflavin (B2)</span>
                                <span className="font-medium">{Math.round(food.micronutrients.riboflavin * 10) / 10}mg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Niacin (B3)</span>
                                <span className="font-medium">{Math.round(food.micronutrients.niacin * 10) / 10}mg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Pantothenic (B5)</span>
                                <span className="font-medium">{Math.round(food.micronutrients.pantothenicAcid * 10) / 10}mg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Vitamin B6</span>
                                <span className="font-medium">{Math.round(food.micronutrients.vitaminB6 * 10) / 10}mg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Biotin (B7)</span>
                                <span className="font-medium">{Math.round(food.micronutrients.biotin)}mcg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Folate (B9)</span>
                                <span className="font-medium">{Math.round(food.micronutrients.folate)}mcg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Vitamin B12</span>
                                <span className="font-medium">{Math.round(food.micronutrients.vitaminB12 * 10) / 10}mcg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Choline</span>
                                <span className="font-medium">{Math.round(food.micronutrients.choline)}mg</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Entry Notes */}
                {selectedEntry.notes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                      {selectedEntry.notes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-100">
                  <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-colors">
                    Edit Entry
                  </button>
                  <button 
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this food entry?')) {
                        const success = await foodService.deleteFoodEntry(selectedEntry.id);
                        if (success) {
                          setSelectedEntry(null);
                          await loadDailyNutrition();
                        }
                      }
                    }}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                  >
                    Delete Entry
                  </button>
                </div>

                {/* Entry Time */}
                <div className="text-center text-xs text-gray-400">
                  Added {selectedEntry.createdAt ? new Date(selectedEntry.createdAt).toLocaleString() : 'Recently'}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FoodJournalPage;