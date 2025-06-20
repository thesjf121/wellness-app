import React, { useState, useEffect } from 'react';
import { useMockAuth } from '../../context/MockAuthContext';
import { StepHistoryView } from '../../components/steps/StepHistoryView';
import { healthService } from '../../services/healthService';
import { NotificationHistory } from '../../components/notifications/NotificationHistory';
import { NotificationPreferences } from '../../components/notifications/NotificationPreferences';

type ViewMode = 'today' | 'history' | 'notifications';

const StepsPage: React.FC = () => {
  const { user, isSignedIn } = useMockAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [manualSteps, setManualSteps] = useState('');
  const [stepList, setStepList] = useState<Array<{id: string, steps: number, date: string}>>([]);
  const [todaySteps, setTodaySteps] = useState(0);
  const [goal, setGoal] = useState(8000);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [showNotificationPrefs, setShowNotificationPrefs] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('wellness-steps');
    if (saved) {
      setStepList(JSON.parse(saved));
    }
    initializeHealthService();
  }, []);

  // Save to localStorage whenever stepList changes
  useEffect(() => {
    localStorage.setItem('wellness-steps', JSON.stringify(stepList));
  }, [stepList]);

  const initializeHealthService = async () => {
    try {
      await healthService.initialize();
      const permissions = await healthService.requestPermissions();
      setPermissionsGranted(permissions.granted);
      
      if (permissions.granted) {
        await loadTodaySteps();
        await loadGoal();
      }
    } catch (error) {
      console.error('Failed to initialize health service:', error);
    }
  };

  const loadTodaySteps = async () => {
    try {
      const today = new Date();
      const stepData = await healthService.getStepData(today, today);
      if (stepData.length > 0) {
        setTodaySteps(stepData[0].stepCount);
      }
    } catch (error) {
      console.error('Failed to load today steps:', error);
    }
  };

  const loadGoal = async () => {
    try {
      const currentGoal = await healthService.getCurrentStepGoal();
      if (currentGoal) {
        setGoal(currentGoal.dailyTarget);
      }
    } catch (error) {
      console.error('Failed to load goal:', error);
    }
  };

  const handleAddSteps = async () => {
    if (manualSteps) {
      const steps = parseInt(manualSteps);
      const newEntry = {
        id: Date.now().toString(),
        steps: steps,
        date: new Date().toLocaleDateString()
      };
      
      setStepList([...stepList, newEntry]);
      setManualSteps('');
      
      // Add to health service as well
      try {
        await healthService.addManualStepEntry({
          date: new Date().toISOString().split('T')[0],
          stepCount: steps,
          source: 'manual'
        });
        await loadTodaySteps(); // Refresh today's count
        alert(`Added ${steps} steps!`);
      } catch (error) {
        console.error('Failed to add manual steps:', error);
        alert(`Added ${steps} steps locally!`);
      }
    }
  };

  const handleSetGoal = async () => {
    try {
      await healthService.setDailyStepGoal(goal);
      alert(`Goal set to ${goal.toLocaleString()} steps!`);
    } catch (error) {
      console.error('Failed to set goal:', error);
      alert('Failed to set goal. Please try again.');
    }
  };

  const requestPermissions = async () => {
    try {
      const permissions = await healthService.requestPermissions();
      setPermissionsGranted(permissions.granted);
      
      if (permissions.granted) {
        await loadTodaySteps();
        await loadGoal();
      }
    } catch (error) {
      console.error('Failed to request permissions:', error);
    }
  };

  const renderTodayView = () => (
    <div className="space-y-6">
      {/* Today's Steps Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Today's Steps</h2>
          {!permissionsGranted && (
            <button
              onClick={requestPermissions}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Grant Permissions
            </button>
          )}
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {todaySteps.toLocaleString()}
          </div>
          <div className="text-gray-600 mb-4">
            {goal > 0 && (
              <span>
                {Math.round((todaySteps / goal) * 100)}% of {goal.toLocaleString()} goal
              </span>
            )}
          </div>
          
          {goal > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((todaySteps / goal) * 100, 100)}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>

      {/* Goal Setting */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Goal</h3>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            placeholder="Enter daily goal"
            value={goal}
            onChange={(e) => setGoal(parseInt(e.target.value) || 0)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
            min="1000"
            max="50000"
            step="500"
          />
          <button
            onClick={handleSetGoal}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
          >
            Set Goal
          </button>
        </div>
      </div>

      {/* Manual Entry */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Manual Steps</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Steps</label>
            <input
              type="number"
              placeholder="Enter step count"
              value={manualSteps}
              onChange={(e) => setManualSteps(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>
        
        <button
          onClick={handleAddSteps}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
        >
          Add Steps
        </button>
      </div>

      {/* Recent Entries */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Manual Entries</h3>
        {stepList.length > 0 ? (
          <div className="space-y-2">
            {stepList.slice(-5).reverse().map((entry) => (
              <div key={entry.id} className="flex justify-between py-2 border-b">
                <span>{entry.date}</span>
                <span className="font-semibold">{entry.steps.toLocaleString()} steps</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No manual entries yet</p>
        )}
      </div>
    </div>
  );

  if (!isSignedIn || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Step Tracker</h1>
          <p className="text-gray-500 mb-6">Please sign in to track your daily steps and view your progress.</p>
          <div className="flex justify-center space-x-4">
            <a href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
              Sign In
            </a>
            <a href="/register" className="border border-gray-300 hover:bg-gray-50 px-6 py-2 rounded-lg">
              Sign Up
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Step Tracker</h1>
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('today')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === 'today'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setViewMode('history')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === 'history'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setViewMode('notifications')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === 'notifications'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Notifications
          </button>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'today' && renderTodayView()}
      {viewMode === 'history' && <StepHistoryView />}
      {viewMode === 'notifications' && (
        <div className="space-y-6">
          {showNotificationPrefs ? (
            <>
              <NotificationPreferences onClose={() => setShowNotificationPrefs(false)} />
              <button
                onClick={() => setShowNotificationPrefs(false)}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                ← Back to notification history
              </button>
            </>
          ) : (
            <>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowNotificationPrefs(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Notification Settings
                </button>
              </div>
              <NotificationHistory />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StepsPage;