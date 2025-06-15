import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useHealthStore } from '../../store/healthStore';
import { healthService } from '../../services/healthService';
import { formatSteps, formatDate, getDateString } from '../../utils/helpers';
import { HEALTH_GOALS } from '../../utils/constants';

const StepsPage: React.FC = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const {
    stepData,
    todaysSteps,
    stepGoal,
    stepSummary,
    stepStreak,
    isLoadingSteps,
    stepError,
    setStepData,
    setStepGoal,
    setStepSummary,
    setStepStreak,
    setStepLoading,
    setStepError,
    addStepEntry
  } = useHealthStore();

  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualSteps, setManualSteps] = useState('');
  const [manualDate, setManualDate] = useState(getDateString(new Date()));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadStepData();
    }
  }, [user]);

  const loadStepData = async () => {
    if (!user) return;

    setStepLoading(true);
    setStepError(null);

    try {
      // Load step history
      const history = await healthService.getStepsHistory(30);
      setStepData(history);

      // Load step goal
      const goal = await healthService.getStepGoal(user.id);
      setStepGoal(goal);

      // Load step summary
      const summary = await healthService.getStepSummary(user.id);
      setStepSummary(summary);

      // Load step streak
      const streak = await healthService.getStepStreak(user.id);
      setStepStreak(streak);

    } catch (error) {
      console.error('Error loading step data:', error);
      setStepError('Failed to load step data. Please try again.');
    } finally {
      setStepLoading(false);
    }
  };

  const handleManualStepEntry = async () => {
    if (!user || !manualSteps) return;

    const stepCount = parseInt(manualSteps);
    if (!healthService.validateStepCount(stepCount)) {
      setStepError('Please enter a valid step count (0-100,000)');
      return;
    }

    setIsSubmitting(true);
    setStepError(null);

    try {
      const newEntry = await healthService.addStepEntry({
        date: manualDate,
        stepCount,
        source: 'manual'
      });

      if (newEntry) {
        addStepEntry(newEntry);
        setManualSteps('');
        setShowManualEntry(false);
        
        // Reload data to get updated summary
        await loadStepData();
      }
    } catch (error) {
      console.error('Error adding step entry:', error);
      setStepError('Failed to add step entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoalUpdate = async (newGoal: number) => {
    if (!user) return;

    try {
      const updatedGoal = await healthService.setStepGoal(user.id, newGoal);
      if (updatedGoal) {
        setStepGoal(updatedGoal);
      }
    } catch (error) {
      console.error('Error updating step goal:', error);
      setStepError('Failed to update step goal. Please try again.');
    }
  };

  const currentGoal = stepGoal?.dailyStepGoal || HEALTH_GOALS.DEFAULT_STEPS;
  const goalProgress = (todaysSteps / currentGoal) * 100;
  const isGoalAchieved = todaysSteps >= currentGoal;

  if (isLoadingSteps) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading step data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Step Tracker</h1>
        <p className="text-gray-600 mt-2">Track your daily steps and reach your fitness goals</p>
      </div>

      {stepError && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{stepError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Today's Progress */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Progress</h2>
          
          {/* Steps Circle Progress */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${Math.min(goalProgress * 2.51, 251.2)} 251.2`}
                className={isGoalAchieved ? "text-green-500" : "text-blue-500"}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">{formatSteps(todaysSteps)}</span>
              <span className="text-sm text-gray-600">of {formatSteps(currentGoal)}</span>
              <span className="text-lg font-semibold text-blue-600 mt-1">
                {Math.round(goalProgress)}%
              </span>
            </div>
          </div>

          {isGoalAchieved && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 font-semibold">🎉 Goal achieved! Great job!</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => setShowManualEntry(true)}
              className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 px-4 rounded-lg text-left transition-colors"
            >
              📝 Add Manual Step Entry
            </button>
            <button
              onClick={loadStepData}
              disabled={isLoadingSteps}
              className="w-full bg-green-50 hover:bg-green-100 text-green-700 py-3 px-4 rounded-lg text-left transition-colors disabled:opacity-50"
            >
              🔄 Sync Step Data
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
          <div className="space-y-3">
            {stepSummary && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">7-day average:</span>
                  <span className="font-semibold">{formatSteps(stepSummary.average7Days)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">This week:</span>
                  <span className="font-semibold">{formatSteps(stepSummary.thisWeek)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">This month:</span>
                  <span className="font-semibold">{formatSteps(stepSummary.thisMonth)}</span>
                </div>
              </>
            )}
            {stepStreak && (
              <div className="flex justify-between">
                <span className="text-gray-600">Current streak:</span>
                <span className="font-semibold text-orange-600">
                  {stepStreak.currentStreak} days 🔥
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent History</h3>
        {stepData.length > 0 ? (
          <div className="space-y-3">
            {stepData.slice(0, 10).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <span className="font-medium">{formatDate(entry.date)}</span>
                  <span className="text-sm text-gray-500 ml-2">({entry.source})</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold">{formatSteps(entry.stepCount)}</span>
                  {entry.goal > 0 && (
                    <div className="text-xs text-gray-500">
                      {Math.round((entry.stepCount / entry.goal) * 100)}% of goal
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No step data yet</p>
            <p className="text-sm">Add your first entry to get started!</p>
          </div>
        )}
      </div>

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Step Entry</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Steps</label>
                <input
                  type="number"
                  placeholder="Enter step count"
                  value={manualSteps}
                  onChange={(e) => setManualSteps(e.target.value)}
                  min="0"
                  max="100000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowManualEntry(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleManualStepEntry}
                disabled={isSubmitting || !manualSteps}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepsPage;