import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { StepHistoryView } from '../../components/steps/StepHistoryView';
import { healthService } from '../../services/healthService';
import { NotificationHistory } from '../../components/notifications/NotificationHistory';
import { NotificationPreferences } from '../../components/notifications/NotificationPreferences';
import { WellnessCard, CardHeader, CardTitle, CardContent } from '../../components/ui/WellnessCard';
import { CircularProgress } from '../../components/ui/CircularProgress';
import { BottomNavigation } from '../../components/ui/BottomNavigation';

type ViewMode = 'today' | 'history' | 'notifications';

const StepsPage: React.FC = () => {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  
  // TEMPORARY DEMO MODE - Remove after testing
  const isDemoMode = true;
  const demoUser = {
    id: 'demo_user_123',
    firstName: 'Demo',
    lastName: 'User',
    primaryEmailAddress: { emailAddress: 'demo@calerielife.com' }
  };
  
  const effectiveUser = user || (isDemoMode ? demoUser : null);
  const effectiveSignedIn = isSignedIn || isDemoMode;
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [manualSteps, setManualSteps] = useState('');
  const [stepList, setStepList] = useState<Array<{id: string, steps: number, date: string}>>([]);
  const [todaySteps, setTodaySteps] = useState(0);
  const [goal, setGoal] = useState(8000);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [showNotificationPrefs, setShowNotificationPrefs] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('wellness-steps');
    if (saved) {
      setStepList(JSON.parse(saved));
    }
    initializeHealthService();
  }, []);

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
      
      try {
        await healthService.addManualStepEntry({
          date: new Date().toISOString().split('T')[0],
          stepCount: steps,
          source: 'manual'
        });
        await loadTodaySteps();
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

  const renderTodayView = () => {
    const progressPercentage = goal > 0 ? (todaySteps / goal) * 100 : 0;
    
    return (
      <div className="space-y-8">
        {/* Today's Steps - Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <WellnessCard variant="gradient" className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 text-center">
            <CardContent className="p-8">
              <div className="flex flex-col items-center">
                {/* Circular Progress */}
                <div className="mb-6">
                  <CircularProgress
                    value={Math.min(progressPercentage, 100)}
                    size="xl"
                    strokeWidth={12}
                    colors={{
                      progress: ['#3B82F6', '#06B6D4'],
                      background: '#E5E7EB',
                      text: '#1F2937'
                    }}
                    showValue={false}
                  >
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-1">
                        {todaySteps.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">steps today</div>
                    </div>
                  </CircularProgress>
                </div>

                {/* Goal Progress */}
                {goal > 0 && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900 mb-2">
                      {Math.round(progressPercentage)}% of daily goal
                    </div>
                    <div className="text-sm text-gray-600">
                      Goal: {goal.toLocaleString()} steps
                    </div>
                    {progressPercentage >= 100 && (
                      <div className="mt-3 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                        🎉 Goal achieved! Great job!
                      </div>
                    )}
                  </div>
                )}

                {/* Permissions */}
                {!permissionsGranted && (
                  <motion.button
                    onClick={requestPermissions}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    📱 Grant Health Permissions
                  </motion.button>
                )}
              </div>
            </CardContent>
          </WellnessCard>
        </motion.div>

        {/* Goal Setting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <WellnessCard>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">🎯</span>
                Daily Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Steps per day
                  </label>
                  <input
                    type="number"
                    placeholder="Enter daily goal"
                    value={goal}
                    onChange={(e) => setGoal(parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1000"
                    max="50000"
                    step="500"
                  />
                </div>
                <motion.button
                  onClick={handleSetGoal}
                  className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-xl font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Set Goal
                </motion.button>
              </div>
            </CardContent>
          </WellnessCard>
        </motion.div>

        {/* Manual Entry */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <WellnessCard>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">✏️</span>
                Add Manual Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Step count
                  </label>
                  <input
                    type="number"
                    placeholder="Enter step count"
                    value={manualSteps}
                    onChange={(e) => setManualSteps(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <motion.button
                  onClick={handleAddSteps}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-xl font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Add Steps
                </motion.button>
              </div>
            </CardContent>
          </WellnessCard>
        </motion.div>

        {/* Recent Entries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <WellnessCard>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">📝</span>
                Recent Manual Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stepList.length > 0 ? (
                <div className="space-y-3">
                  {stepList.slice(-5).reverse().map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
                    >
                      <span className="text-gray-600">{entry.date}</span>
                      <span className="font-semibold text-blue-600">
                        {entry.steps.toLocaleString()} steps
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-gray-400">📝</span>
                  </div>
                  <p className="text-gray-500">No manual entries yet</p>
                  <p className="text-sm text-gray-400 mt-1">Add your first manual step count above</p>
                </div>
              )}
            </CardContent>
          </WellnessCard>
        </motion.div>
      </div>
    );
  };

  if (!effectiveSignedIn || !effectiveUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <WellnessCard>
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">🔒</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h2>
            <p className="text-gray-500 mb-6">Please sign in to track your daily steps and view your progress.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="/login" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors"
              >
                Sign In
              </a>
              <a 
                href="/register" 
                className="border border-gray-200 hover:bg-gray-50 px-6 py-2 rounded-xl font-medium transition-colors"
              >
                Sign Up
              </a>
            </div>
          </CardContent>
        </WellnessCard>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8"
        >
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-2xl">👟</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Step Tracker</h1>
              <p className="text-gray-600">Monitor your daily movement and reach your goals</p>
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            {[
              { key: 'today', label: 'Today', icon: '📅' },
              { key: 'history', label: 'History', icon: '📊' },
              { key: 'notifications', label: 'Alerts', icon: '🔔' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setViewMode(tab.key as ViewMode)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === tab.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {viewMode === 'today' && renderTodayView()}
          {viewMode === 'history' && <StepHistoryView />}
          {viewMode === 'notifications' && (
            <div className="space-y-6">
              {showNotificationPrefs ? (
                <WellnessCard>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Notification Settings</CardTitle>
                      <button
                        onClick={() => setShowNotificationPrefs(false)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        ← Back
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <NotificationPreferences onClose={() => setShowNotificationPrefs(false)} />
                  </CardContent>
                </WellnessCard>
              ) : (
                <>
                  <div className="flex justify-end">
                    <motion.button
                      onClick={() => setShowNotificationPrefs(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      ⚙️ Settings
                    </motion.button>
                  </div>
                  <NotificationHistory />
                </>
              )}
            </div>
          )}
        </motion.div>
      </div>
      
      <BottomNavigation />
    </>
  );
};

export default StepsPage;