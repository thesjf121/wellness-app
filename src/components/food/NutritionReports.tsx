import React, { useState, useEffect } from 'react';
import { useMockAuth } from '../../context/MockAuthContext';
import { foodService } from '../../services/foodService';
import { FoodEntry } from '../../types/food';

interface ReportData {
  period: string;
  startDate: string;
  endDate: string;
  totalCalories: number;
  avgDailyCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  daysLogged: number;
  entriesCount: number;
  topFoods: Array<{ food: string; count: number; calories: number }>;
  mealDistribution: Record<string, number>;
  dailyAverages: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  weeklyBreakdown?: Array<{
    week: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}

interface NutritionReportsProps {
  onClose?: () => void;
}

export const NutritionReports: React.FC<NutritionReportsProps> = ({ onClose }) => {
  const { user } = useMockAuth();
  const [reportType, setReportType] = useState<'weekly' | 'monthly' | 'quarterly'>('weekly');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('');

  useEffect(() => {
    if (user) {
      generateReport();
    }
  }, [user, reportType]);

  useEffect(() => {
    // Set default period based on current date
    const now = new Date();
    if (reportType === 'weekly') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      setSelectedPeriod(startOfWeek.toISOString().split('T')[0]);
    } else if (reportType === 'monthly') {
      setSelectedPeriod(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    } else {
      const quarter = Math.floor(now.getMonth() / 3) + 1;
      setSelectedPeriod(`${now.getFullYear()}-Q${quarter}`);
    }
  }, [reportType]);

  const generateReport = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const entries = await foodService.getFoodEntries(user.id, startDate, endDate);
      
      const report = calculateReportData(entries, startDate, endDate);
      setReportData(report);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    let startDate: string, endDate: string;

    if (reportType === 'weekly') {
      const start = new Date(selectedPeriod || now.toISOString().split('T')[0]);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      startDate = start.toISOString().split('T')[0];
      endDate = end.toISOString().split('T')[0];
    } else if (reportType === 'monthly') {
      const [year, month] = (selectedPeriod || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`).split('-');
      startDate = `${year}-${month}-01`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
    } else {
      // Quarterly
      const [year, quarter] = (selectedPeriod || `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`).split('-Q');
      const startMonth = (parseInt(quarter) - 1) * 3 + 1;
      const endMonth = startMonth + 2;
      startDate = `${year}-${String(startMonth).padStart(2, '0')}-01`;
      const lastDay = new Date(parseInt(year), endMonth, 0).getDate();
      endDate = `${year}-${String(endMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    }

    return { startDate, endDate };
  };

  const calculateReportData = (entries: FoodEntry[], startDate: string, endDate: string): ReportData => {
    const uniqueDates = new Set<string>();
    const foodFrequency: Record<string, { count: number; calories: number }> = {};
    const mealDistribution: Record<string, number> = {};
    
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;

    entries.forEach(entry => {
      uniqueDates.add(entry.date);
      mealDistribution[entry.mealType] = (mealDistribution[entry.mealType] || 0) + 1;

      entry.foods.forEach(food => {
        totalCalories += food.calories;
        totalProtein += food.macronutrients.protein;
        totalCarbs += food.macronutrients.carbohydrates;
        totalFat += food.macronutrients.fat;
        totalFiber += food.macronutrients.fiber;

        if (!foodFrequency[food.foodItem]) {
          foodFrequency[food.foodItem] = { count: 0, calories: 0 };
        }
        foodFrequency[food.foodItem].count += 1;
        foodFrequency[food.foodItem].calories += food.calories;
      });
    });

    const daysLogged = uniqueDates.size;
    const topFoods = Object.entries(foodFrequency)
      .map(([food, data]) => ({ food, count: data.count, calories: data.calories }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const dailyAverages = {
      calories: daysLogged > 0 ? totalCalories / daysLogged : 0,
      protein: daysLogged > 0 ? totalProtein / daysLogged : 0,
      carbs: daysLogged > 0 ? totalCarbs / daysLogged : 0,
      fat: daysLogged > 0 ? totalFat / daysLogged : 0,
      fiber: daysLogged > 0 ? totalFiber / daysLogged : 0,
    };

    // Generate weekly breakdown for monthly/quarterly reports
    let weeklyBreakdown: ReportData['weeklyBreakdown'] = undefined;
    if (reportType !== 'weekly') {
      weeklyBreakdown = generateWeeklyBreakdown(entries, startDate, endDate);
    }

    return {
      period: formatPeriodLabel(startDate, endDate),
      startDate,
      endDate,
      totalCalories,
      avgDailyCalories: dailyAverages.calories,
      totalProtein,
      totalCarbs,
      totalFat,
      totalFiber,
      daysLogged,
      entriesCount: entries.length,
      topFoods,
      mealDistribution,
      dailyAverages,
      weeklyBreakdown
    };
  };

  const generateWeeklyBreakdown = (entries: FoodEntry[], startDate: string, endDate: string) => {
    const weeks: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {};
    
    entries.forEach(entry => {
      const entryDate = new Date(entry.date);
      const weekStart = new Date(entryDate);
      weekStart.setDate(entryDate.getDate() - entryDate.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeks[weekKey]) {
        weeks[weekKey] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }

      entry.foods.forEach(food => {
        weeks[weekKey].calories += food.calories;
        weeks[weekKey].protein += food.macronutrients.protein;
        weeks[weekKey].carbs += food.macronutrients.carbohydrates;
        weeks[weekKey].fat += food.macronutrients.fat;
      });
    });

    return Object.entries(weeks)
      .map(([week, data]) => ({
        week: formatWeekLabel(week),
        ...data
      }))
      .sort((a, b) => a.week.localeCompare(b.week));
  };

  const formatPeriodLabel = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (reportType === 'weekly') {
      return `Week of ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (reportType === 'monthly') {
      return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else {
      const quarter = Math.floor(start.getMonth() / 3) + 1;
      return `Q${quarter} ${start.getFullYear()}`;
    }
  };

  const formatWeekLabel = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const exportReport = () => {
    if (!reportData) return;

    const reportContent = `
NUTRITION REPORT - ${reportData.period}
Generated on: ${new Date().toLocaleDateString()}

SUMMARY
=======
Period: ${reportData.period}
Days Logged: ${reportData.daysLogged}
Total Entries: ${reportData.entriesCount}

NUTRITION TOTALS
===============
Total Calories: ${Math.round(reportData.totalCalories)}
Total Protein: ${Math.round(reportData.totalProtein)}g
Total Carbohydrates: ${Math.round(reportData.totalCarbs)}g
Total Fat: ${Math.round(reportData.totalFat)}g
Total Fiber: ${Math.round(reportData.totalFiber)}g

DAILY AVERAGES
=============
Average Calories: ${Math.round(reportData.dailyAverages.calories)}
Average Protein: ${Math.round(reportData.dailyAverages.protein)}g
Average Carbohydrates: ${Math.round(reportData.dailyAverages.carbs)}g
Average Fat: ${Math.round(reportData.dailyAverages.fat)}g
Average Fiber: ${Math.round(reportData.dailyAverages.fiber)}g

TOP FOODS
=========
${reportData.topFoods.map((food, i) => 
  `${i + 1}. ${food.food} (${food.count} times, ${Math.round(food.calories)} total calories)`
).join('\n')}

MEAL DISTRIBUTION
================
${Object.entries(reportData.mealDistribution).map(([meal, count]) => 
  `${meal.charAt(0).toUpperCase() + meal.slice(1)}: ${count} entries`
).join('\n')}
`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrition-report-${reportData.period.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md max-w-6xl mx-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Nutrition Reports</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex space-x-4 mb-4">
          {(['weekly', 'monthly', 'quarterly'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                reportType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Period
            </label>
            <input
              type={reportType === 'weekly' ? 'date' : reportType === 'monthly' ? 'month' : 'text'}
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              placeholder={reportType === 'quarterly' ? 'YYYY-Q1' : undefined}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={generateReport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Generate Report
            </button>
            {reportData && (
              <button
                onClick={exportReport}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                Export Report
              </button>
            )}
          </div>
        </div>
      </div>

      {reportData && (
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">{reportData.period}</h3>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Avg Daily Calories</p>
              <p className="text-2xl font-bold text-blue-900">{Math.round(reportData.avgDailyCalories)}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Days Logged</p>
              <p className="text-2xl font-bold text-green-900">{reportData.daysLogged}</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-600 font-medium">Total Entries</p>
              <p className="text-2xl font-bold text-orange-900">{reportData.entriesCount}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium">Avg Daily Protein</p>
              <p className="text-2xl font-bold text-purple-900">{Math.round(reportData.dailyAverages.protein)}g</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Nutrition Totals */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Nutrition Totals</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Calories:</span>
                  <span className="font-semibold">{Math.round(reportData.totalCalories)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Protein:</span>
                  <span className="font-semibold">{Math.round(reportData.totalProtein)}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Carbs:</span>
                  <span className="font-semibold">{Math.round(reportData.totalCarbs)}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Fat:</span>
                  <span className="font-semibold">{Math.round(reportData.totalFat)}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Fiber:</span>
                  <span className="font-semibold">{Math.round(reportData.totalFiber)}g</span>
                </div>
              </div>
            </div>

            {/* Top Foods */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Foods</h4>
              <div className="space-y-2">
                {reportData.topFoods.slice(0, 5).map((food, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-600 truncate">{food.food}</span>
                    <span className="text-sm text-gray-500">
                      {food.count}x ({Math.round(food.calories)} cal)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Breakdown for Monthly/Quarterly */}
          {reportData.weeklyBreakdown && (
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Weekly Breakdown</h4>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-4">
                  {reportData.weeklyBreakdown.map((week, index) => (
                    <div key={index} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
                      <h5 className="font-medium text-gray-900 mb-2">{week.week}</h5>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Calories:</span>
                          <br />
                          <span className="font-semibold">{Math.round(week.calories)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Protein:</span>
                          <br />
                          <span className="font-semibold">{Math.round(week.protein)}g</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Carbs:</span>
                          <br />
                          <span className="font-semibold">{Math.round(week.carbs)}g</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Fat:</span>
                          <br />
                          <span className="font-semibold">{Math.round(week.fat)}g</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};