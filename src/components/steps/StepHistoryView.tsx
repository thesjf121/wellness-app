import React, { useState, useEffect } from 'react';
import { StepHistoryChart } from './StepHistoryChart';
import { healthService } from '../../services/healthService';
import { StepEntry, StepChartData } from '../../types/steps';

type ViewPeriod = '7day' | '30day';

export const StepHistoryView: React.FC = () => {
  const [period, setPeriod] = useState<ViewPeriod>('7day');
  const [stepData, setStepData] = useState<StepEntry[]>([]);
  const [chartData, setChartData] = useState<StepChartData[]>([]);
  const [goal, setGoal] = useState(8000);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStepHistory();
    loadGoal();
  }, [period]);

  const loadStepHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const endDate = new Date();
      const startDate = new Date();
      const daysBack = period === '7day' ? 7 : 30;
      startDate.setDate(startDate.getDate() - daysBack);

      const data = await healthService.getStepData(startDate, endDate);
      setStepData(data);

      // Convert to chart data format
      const chartEntries = generateChartData(data, startDate, endDate, goal);
      setChartData(chartEntries);
    } catch (err) {
      setError('Failed to load step history');
      console.error('Error loading step history:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGoal = async () => {
    try {
      const currentGoal = await healthService.getCurrentStepGoal();
      if (currentGoal) {
        setGoal(currentGoal.dailyTarget);
      }
    } catch (err) {
      console.error('Error loading goal:', err);
    }
  };

  const generateChartData = (
    data: StepEntry[], 
    startDate: Date, 
    endDate: Date, 
    dailyGoal: number
  ): StepChartData[] => {
    const chartEntries: StepChartData[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayData = data.find(entry => entry.date === dateStr);
      const steps = dayData?.stepCount || 0;

      chartEntries.push({
        date: dateStr,
        steps: steps,
        goal: dailyGoal,
        goalReached: steps >= dailyGoal
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return chartEntries;
  };

  const getProgressPercentage = () => {
    const totalSteps = chartData.reduce((sum, d) => sum + d.steps, 0);
    const totalGoal = chartData.length * goal;
    return totalGoal > 0 ? Math.round((totalSteps / totalGoal) * 100) : 0;
  };

  const getStreakInfo = () => {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Calculate from most recent backwards for current streak
    for (let i = chartData.length - 1; i >= 0; i--) {
      if (chartData[i].goalReached) {
        if (i === chartData.length - 1 || currentStreak > 0) {
          currentStreak++;
        }
      } else {
        break;
      }
    }

    // Calculate longest streak
    chartData.forEach(day => {
      if (day.goalReached) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });

    return { currentStreak, longestStreak };
  };

  const { currentStreak, longestStreak } = getStreakInfo();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800 font-medium">Error Loading Step History</div>
        <div className="text-red-600 text-sm mt-1">{error}</div>
        <button 
          onClick={loadStepHistory}
          className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Step History</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setPeriod('7day')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              period === '7day'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setPeriod('30day')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              period === '30day'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">
            {getProgressPercentage()}%
          </div>
          <div className="text-sm text-gray-600">Goal Achievement</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(getProgressPercentage(), 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {currentStreak}
          </div>
          <div className="text-sm text-gray-600">Current Streak</div>
          <div className="text-xs text-gray-500 mt-1">
            {currentStreak === 1 ? 'day' : 'days'} in a row
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">
            {longestStreak}
          </div>
          <div className="text-sm text-gray-600">Best Streak</div>
          <div className="text-xs text-gray-500 mt-1">
            {period === '7day' ? 'This week' : 'This month'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-orange-600">
            {chartData.filter(d => d.goalReached).length}
          </div>
          <div className="text-sm text-gray-600">Goals Reached</div>
          <div className="text-xs text-gray-500 mt-1">
            out of {chartData.length} days
          </div>
        </div>
      </div>

      {/* Chart */}
      <StepHistoryChart 
        data={chartData} 
        period={period} 
        goal={goal} 
      />

      {/* Additional insights */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Insights</h3>
        <div className="space-y-2 text-sm text-gray-600">
          {currentStreak >= 3 && (
            <div className="flex items-center text-green-600">
              <span className="mr-2">🔥</span>
              Great job! You're on a {currentStreak}-day streak.
            </div>
          )}
          {getProgressPercentage() >= 90 && (
            <div className="flex items-center text-blue-600">
              <span className="mr-2">⭐</span>
              Excellent! You've achieved {getProgressPercentage()}% of your goals.
            </div>
          )}
          {getProgressPercentage() < 50 && (
            <div className="flex items-center text-orange-600">
              <span className="mr-2">💪</span>
              Keep going! Small steps lead to big changes.
            </div>
          )}
          <div>
            Average daily steps: {Math.round(chartData.reduce((sum, d) => sum + d.steps, 0) / chartData.length).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};