import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { FloatingActionButton } from '../../components/ui/FloatingActionButton';
import { QuickFoodEntry } from '../../components/food/QuickFoodEntry';
import { BottomNavigation } from '../../components/ui/BottomNavigation';
import { ParallaxContainer, ParallaxLayer, parallaxPresets } from '../../components/ui/ParallaxContainer';
import { foodService } from '../../services/foodService';
import { geminiService } from '../../services/geminiService';
import { FoodEntry, DailyNutrition, MealType } from '../../types/food';
import { cn } from '../../utils/cn';

const MobileFoodJournalPage: React.FC = () => {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutrition | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzingFood, setAnalyzingFood] = useState<MealType | null>(null);
  const [recentFoods, setRecentFoods] = useState<string[]>([]);
  const [activeMeal, setActiveMeal] = useState<MealType | null>(null);

  useEffect(() => {
    if (user) {
      loadDailyNutrition();
      loadRecentFoods();
    }
  }, [user, currentDate]);

  const loadDailyNutrition = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      const data = await foodService.getDailyNutrition(user.id, dateStr);
      setDailyNutrition(data);
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
        const dateStr = currentDate.toISOString().split('T')[0];
        
        await foodService.createFoodEntry(
          {
            date: dateStr,
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

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const isToday = () => {
    const today = new Date();
    return currentDate.toDateString() === today.toDateString();
  };

  const formatDate = (date: Date) => {
    if (isToday()) return 'Today';
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getMealIcon = (mealType: MealType) => {
    const icons = {
      breakfast: '🍳',
      lunch: '🥗',
      dinner: '🍽️',
      snack: '🍿'
    };
    return icons[mealType];
  };

  const getMealTime = (mealType: MealType) => {
    const times = {
      breakfast: '6:00 - 10:00 AM',
      lunch: '11:00 AM - 2:00 PM',
      dinner: '5:00 - 8:00 PM',
      snack: 'Anytime'
    };
    return times[mealType];
  };

  const calculateMealCalories = (mealType: MealType) => {
    if (!dailyNutrition?.foodEntries) return 0;
    
    return dailyNutrition.foodEntries
      .filter(entry => entry.mealType === mealType)
      .reduce((sum, entry) => sum + (entry.calories || 0), 0);
  };

  const calculateProgress = () => {
    if (!dailyNutrition?.totals) return 0;
    const goal = 2000; // Default goal
    return Math.min((dailyNutrition.totals.calories / goal) * 100, 100);
  };

  if (!isSignedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in</h2>
          <p className="text-gray-600">Sign in to track your nutrition</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ParallaxContainer
        backgroundGradient={parallaxPresets.food.backgroundGradient}
        className="min-h-screen"
      >
        <ParallaxLayer speed={0.1} className="pb-24">
          {/* Header with date navigation */}
          <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigateDate('prev')}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                
                <div className="text-center">
                  <h1 className="text-lg font-bold text-gray-900">{formatDate(currentDate)}</h1>
                  <p className="text-xs text-gray-500">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigateDate('next')}
                  disabled={isToday()}
                  className={cn(
                    "p-2 rounded-lg",
                    isToday() ? "opacity-50" : "hover:bg-gray-100"
                  )}
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Daily progress bar */}
            <div className="px-4 pb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Daily Goal</span>
                <span className="text-xs font-semibold text-gray-900">
                  {dailyNutrition?.totals?.calories || 0} / 2000 cal
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${calculateProgress()}%` }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Meal sections */}
          <div className="px-4 py-4 space-y-4">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((mealType) => {
              const mealEntries = dailyNutrition?.foodEntries?.filter(e => e.mealType === mealType) || [];
              const mealCalories = calculateMealCalories(mealType);
              const isActive = activeMeal === mealType;

              return (
                <motion.div
                  key={mealType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* Meal header */}
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => setActiveMeal(isActive ? null : mealType)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getMealIcon(mealType)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 capitalize">
                            {mealType}
                          </h3>
                          <p className="text-xs text-gray-500">{getMealTime(mealType)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{mealCalories} cal</p>
                        <p className="text-xs text-gray-500">{mealEntries.length} items</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick entry (always visible) */}
                  <div className="px-4 pb-4">
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
                        autoFocus={isActive}
                      />
                    )}
                  </div>

                  {/* Food entries */}
                  <AnimatePresence>
                    {isActive && mealEntries.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-100"
                      >
                        <div className="p-4 space-y-2">
                          {mealEntries.map((entry, index) => (
                            <motion.div
                              key={index}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                            >
                              <div>
                                <p className="font-medium text-gray-900">{entry.name}</p>
                                <p className="text-xs text-gray-500">
                                  {entry.quantity} • {entry.calories} cal
                                </p>
                              </div>
                              <button className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                                <MoreVertical className="w-4 h-4 text-gray-400" />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Quick stats */}
          {dailyNutrition?.totals && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-4 mt-6 p-4 bg-white rounded-2xl shadow-sm"
            >
              <h3 className="font-semibold text-gray-900 mb-3">Today's Summary</h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {Math.round(dailyNutrition.totals.calories)}
                  </div>
                  <div className="text-xs text-gray-500">Calories</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {Math.round(dailyNutrition.totals.protein)}g
                  </div>
                  <div className="text-xs text-gray-500">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {Math.round(dailyNutrition.totals.carbs)}g
                  </div>
                  <div className="text-xs text-gray-500">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {Math.round(dailyNutrition.totals.fat)}g
                  </div>
                  <div className="text-xs text-gray-500">Fat</div>
                </div>
              </div>
            </motion.div>
          )}
        </ParallaxLayer>
      </ParallaxContainer>

      {/* Floating action button for advanced entry */}
      <FloatingActionButton
        onTextEntry={() => setActiveMeal('breakfast')}
        onCameraEntry={() => alert('Camera feature coming soon!')}
        onVoiceEntry={() => alert('Voice feature coming soon!')}
      />
      
      <BottomNavigation />
    </>
  );
};

export default MobileFoodJournalPage;