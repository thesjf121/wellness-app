import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar, TrendingUp, Target } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { WellnessCard, CardHeader, CardTitle, CardContent } from '../../components/ui/WellnessCard';
import { CircularProgress } from '../../components/ui/CircularProgress';
import { BottomNavigation } from '../../components/ui/BottomNavigation';
import { ParallaxContainer, ParallaxLayer, parallaxPresets } from '../../components/ui/ParallaxContainer';
import { foodService } from '../../services/foodService';
import { rdaService } from '../../services/rdaService';
import { DailyNutrition } from '../../types/food';
import { cn } from '../../utils/cn';

const NutritionDashboardPage: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);
  const [dateRange, setDateRange] = useState<'day' | 'week' | 'month'>('day');
  const [nutritionData, setNutritionData] = useState<DailyNutrition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNutritionData();
    }
  }, [user, selectedDate, dateRange]);

  const loadNutritionData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // For now, just load single day data - can expand to ranges later
      const data = await foodService.getDailyNutrition(user.id, selectedDate);
      setNutritionData(data);
    } catch (error) {
      console.error('Failed to load nutrition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNutrientProgress = (current: number, nutrientKey: string) => {
    const status = rdaService.getNutrientStatus(current, nutrientKey as any);
    const rda = rdaService.getRDA(nutrientKey as any);
    const percentage = rda ? Math.min((current / rda) * 100, 150) : 0;
    
    return {
      percentage,
      status: status.status,
      rda,
      color: status.status === 'optimal' ? 'green' : 
             status.status === 'adequate' ? 'blue' :
             status.status === 'deficient' ? 'orange' : 'red'
    };
  };

  const renderNutrientCard = (name: string, current: number, unit: string, nutrientKey: string, icon: string) => {
    const progress = getNutrientProgress(current, nutrientKey);
    
    return (
      <WellnessCard key={nutrientKey} variant="secondary" className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <span className="text-lg mr-2">{icon}</span>
            <span className="font-medium text-gray-900 text-sm">{name}</span>
          </div>
          <span className={cn(
            "text-xs px-2 py-1 rounded-full",
            progress.color === 'green' ? 'bg-green-100 text-green-700' :
            progress.color === 'blue' ? 'bg-blue-100 text-blue-700' :
            progress.color === 'orange' ? 'bg-orange-100 text-orange-700' :
            'bg-red-100 text-red-700'
          )}>
            {progress.status}
          </span>
        </div>
        
        <div className="mb-2">
          <div className="flex justify-between text-sm">
            <span className="font-semibold">{Math.round(current * 10) / 10}{unit}</span>
            {progress.rda && (
              <span className="text-gray-500">RDA: {progress.rda}{unit}</span>
            )}
          </div>
        </div>
        
        {progress.rda && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                progress.color === 'green' ? 'bg-green-500' :
                progress.color === 'blue' ? 'bg-blue-500' :
                progress.color === 'orange' ? 'bg-orange-500' :
                'bg-red-500'
              )}
              style={{ width: `${Math.min(progress.percentage, 100)}%` }}
            />
          </div>
        )}
        
        {progress.rda && (
          <div className="text-xs text-gray-500 mt-1 text-center">
            {Math.round(progress.percentage)}% of RDA
          </div>
        )}
      </WellnessCard>
    );
  };

  const macronutrients = [
    { key: 'protein', name: 'Protein', icon: '🥩', unit: 'g' },
    { key: 'carbs', name: 'Carbohydrates', icon: '🍞', unit: 'g' },
    { key: 'fat', name: 'Fat', icon: '🥑', unit: 'g' },
    { key: 'fiber', name: 'Fiber', icon: '🌾', unit: 'g' },
    { key: 'sugar', name: 'Sugar', icon: '🍯', unit: 'g' }
  ];

  const essentialMinerals = [
    { key: 'calcium', name: 'Calcium', icon: '🦴', unit: 'mg' },
    { key: 'iron', name: 'Iron', icon: '🩸', unit: 'mg' },
    { key: 'magnesium', name: 'Magnesium', icon: '⚡', unit: 'mg' },
    { key: 'phosphorus', name: 'Phosphorus', icon: '💪', unit: 'mg' },
    { key: 'potassium', name: 'Potassium', icon: '🍌', unit: 'mg' },
    { key: 'sodium', name: 'Sodium', icon: '🧂', unit: 'mg' },
    { key: 'zinc', name: 'Zinc', icon: '🛡️', unit: 'mg' },
    { key: 'copper', name: 'Copper', icon: '🔶', unit: 'mg' },
    { key: 'manganese', name: 'Manganese', icon: '⚙️', unit: 'mg' },
    { key: 'selenium', name: 'Selenium', icon: '🔥', unit: 'mcg' },
    { key: 'iodine', name: 'Iodine', icon: '🧠', unit: 'mcg' },
    { key: 'chromium', name: 'Chromium', icon: '⚖️', unit: 'mcg' },
    { key: 'molybdenum', name: 'Molybdenum', icon: '🔬', unit: 'mcg' }
  ];

  const fatSolubleVitamins = [
    { key: 'vitaminA', name: 'Vitamin A', icon: '👁️', unit: 'IU' },
    { key: 'vitaminD', name: 'Vitamin D', icon: '☀️', unit: 'IU' },
    { key: 'vitaminE', name: 'Vitamin E', icon: '🛡️', unit: 'mg' },
    { key: 'vitaminK', name: 'Vitamin K', icon: '🩸', unit: 'mcg' }
  ];

  const waterSolubleVitamins = [
    { key: 'vitaminC', name: 'Vitamin C', icon: '🍊', unit: 'mg' },
    { key: 'thiamine', name: 'Thiamine (B1)', icon: '🧠', unit: 'mg' },
    { key: 'riboflavin', name: 'Riboflavin (B2)', icon: '⚡', unit: 'mg' },
    { key: 'niacin', name: 'Niacin (B3)', icon: '❤️', unit: 'mg' },
    { key: 'pantothenicAcid', name: 'Pantothenic (B5)', icon: '🔋', unit: 'mg' },
    { key: 'vitaminB6', name: 'Vitamin B6', icon: '🧬', unit: 'mg' },
    { key: 'biotin', name: 'Biotin (B7)', icon: '💅', unit: 'mcg' },
    { key: 'folate', name: 'Folate (B9)', icon: '🤰', unit: 'mcg' },
    { key: 'vitaminB12', name: 'Vitamin B12', icon: '🧠', unit: 'mcg' },
    { key: 'choline', name: 'Choline', icon: '🧠', unit: 'mg' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
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
        <ParallaxLayer speed={0.25} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 mr-4"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Nutrition Analysis</h1>
                <p className="text-gray-600">Detailed nutrient breakdown vs. RDA values</p>
              </div>
            </div>
          </motion.div>

          {/* Date and Range Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap items-center gap-4 mb-8"
          >
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              {['day', 'week', 'month'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range as any)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    dateRange === range
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </motion.div>

          {nutritionData && (
            <>
              {/* Calories Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <WellnessCard>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="mr-2">🔥</span>
                      Daily Calories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center">
                      <CircularProgress
                        value={Math.min(((nutritionData.totals?.calories || 0) / 2000) * 100, 100)}
                        size="md"
                        strokeWidth={8}
                        className="mr-8"
                      />
                      <div>
                        <div className="text-3xl font-bold text-gray-900">
                          {Math.round(nutritionData.totals?.calories || 0)}
                        </div>
                        <div className="text-gray-500">/ 2000 calories</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {Math.round(((nutritionData.totals?.calories || 0) / 2000) * 100)}% of goal
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </WellnessCard>
              </motion.div>

              {/* Macronutrients */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Macronutrients
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {macronutrients.map((nutrient) => {
                    // Use totals for main macros (protein, carbs, fat) and totalMacros for others (fiber, sugar)
                    let value = 0;
                    if (nutrient.key === 'protein' || nutrient.key === 'carbs' || nutrient.key === 'fat') {
                      value = (nutritionData.totals as any)?.[nutrient.key] || 0;
                    } else {
                      // For fiber and sugar, use totalMacros
                      const macroKey = nutrient.key === 'carbs' ? 'carbohydrates' : nutrient.key;
                      value = (nutritionData.totalMacros as any)?.[macroKey] || 0;
                    }
                    return renderNutrientCard(
                      nutrient.name,
                      value,
                      nutrient.unit,
                      nutrient.key,
                      nutrient.icon
                    );
                  })}
                </div>
              </motion.div>

              {/* Essential Minerals */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Essential Minerals (13)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {essentialMinerals.map((nutrient) => {
                    const value = (nutritionData.totalMicros as any)[nutrient.key] || 0;
                    return renderNutrientCard(
                      nutrient.name,
                      value,
                      nutrient.unit,
                      nutrient.key,
                      nutrient.icon
                    );
                  })}
                </div>
              </motion.div>

              {/* Fat-Soluble Vitamins */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-8"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Fat-Soluble Vitamins (4)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {fatSolubleVitamins.map((nutrient) => {
                    const value = (nutritionData.totalMicros as any)[nutrient.key] || 0;
                    return renderNutrientCard(
                      nutrient.name,
                      value,
                      nutrient.unit,
                      nutrient.key,
                      nutrient.icon
                    );
                  })}
                </div>
              </motion.div>

              {/* Water-Soluble Vitamins */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-8"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Water-Soluble Vitamins (9)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {waterSolubleVitamins.map((nutrient) => {
                    const value = (nutritionData.totalMicros as any)[nutrient.key] || 0;
                    return renderNutrientCard(
                      nutrient.name,
                      value,
                      nutrient.unit,
                      nutrient.key,
                      nutrient.icon
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </ParallaxLayer>
      </ParallaxContainer>
      
      <BottomNavigation />
    </>
  );
};

export default NutritionDashboardPage;