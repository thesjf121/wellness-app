import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { ROUTES, HEALTH_GOALS, WELLNESS_GOALS, ACTIVITY_LEVELS } from '../../utils/constants';
import { updateUserMetadata } from '../../utils/clerkHelpers';

interface WizardStep {
  id: number;
  title: string;
  description: string;
}

const GoalSettingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Form state
  const [goals, setGoals] = useState({
    // Primary wellness goals
    primaryGoals: [] as string[],
    
    // Activity level
    activityLevel: 'moderately_active' as string,
    
    // Daily targets
    dailyStepGoal: HEALTH_GOALS.DEFAULT_STEPS as number,
    dailyCalorieGoal: HEALTH_GOALS.DEFAULT_CALORIES as number,
    
    // Weekly targets
    weeklyExerciseDays: 3,
    weeklyExerciseMinutes: 150,
    
    // Nutrition goals
    nutritionFocus: [] as string[],
    waterIntakeGoal: 8, // glasses per day
    
    // Sleep goals
    sleepHoursGoal: 8,
    sleepTimeGoal: '22:00',
    wakeTimeGoal: '06:00',
    
    // Weight goals
    weightGoalType: 'maintain' as 'lose' | 'gain' | 'maintain',
    weeklyWeightChangeGoal: 0.5, // kg per week
    
    // Accountability preferences
    preferredAccountability: 'group' as 'solo' | 'partner' | 'group',
    reminderPreference: 'moderate' as 'minimal' | 'moderate' | 'frequent'
  });

  const wizardSteps: WizardStep[] = [
    {
      id: 0,
      title: 'Welcome to Goal Setting',
      description: 'Let\'s personalize your wellness journey'
    },
    {
      id: 1,
      title: 'Primary Wellness Goals',
      description: 'What would you like to focus on?'
    },
    {
      id: 2,
      title: 'Activity Level',
      description: 'How active are you currently?'
    },
    {
      id: 3,
      title: 'Daily Movement Goals',
      description: 'Set your daily activity targets'
    },
    {
      id: 4,
      title: 'Nutrition Goals',
      description: 'Define your healthy eating objectives'
    },
    {
      id: 5,
      title: 'Sleep & Recovery',
      description: 'Optimize your rest for better wellness'
    },
    {
      id: 6,
      title: 'Review & Confirm',
      description: 'Review your personalized wellness plan'
    }
  ];

  const currentWizardStep = wizardSteps[currentStep];

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (window.confirm('Are you sure you want to skip goal setting? You can always set goals later from your profile.')) {
      navigate(ROUTES.DASHBOARD);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    
    try {
      // Save goals to user profile
      if (user) {
        await updateUserMetadata(user.id, {
          profile: {
            dailyStepGoal: goals.dailyStepGoal,
            dailyCalorieGoal: goals.dailyCalorieGoal,
            preferredUnits: 'imperial' // default, could be made configurable
          }
        });
        
        // Save additional goals data to localStorage
        const profileKey = `profile_${user.id}`;
        const existingProfile = JSON.parse(localStorage.getItem(profileKey) || '{}');
        localStorage.setItem(profileKey, JSON.stringify({
          ...existingProfile,
          primaryGoals: goals.primaryGoals,
          activityLevel: goals.activityLevel,
          dailyStepGoal: goals.dailyStepGoal,
          dailyCalorieGoal: goals.dailyCalorieGoal
        }));
      }
      
      // Save detailed goals to localStorage
      localStorage.setItem('wellness_goals', JSON.stringify(goals));
      
      // Navigate to dashboard
      setTimeout(() => {
        navigate(ROUTES.DASHBOARD);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to save goals:', error);
      alert('Failed to save goals. Please try again.');
      setIsCompleting(false);
    }
  };

  const togglePrimaryGoal = (goal: string) => {
    setGoals(prev => ({
      ...prev,
      primaryGoals: prev.primaryGoals.includes(goal)
        ? prev.primaryGoals.filter(g => g !== goal)
        : [...prev.primaryGoals, goal]
    }));
  };

  const toggleNutritionFocus = (focus: string) => {
    setGoals(prev => ({
      ...prev,
      nutritionFocus: prev.nutritionFocus.includes(focus)
        ? prev.nutritionFocus.filter(f => f !== focus)
        : [...prev.nutritionFocus, focus]
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center py-8">
            <div className="mb-8">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">🎯</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Let's Set Your Wellness Goals
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Setting clear, personalized goals is the first step to lasting wellness. 
                This wizard will help you create targets that match your lifestyle and aspirations.
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
              <h3 className="font-semibold text-blue-900 mb-3">What we'll cover:</h3>
              <ul className="text-blue-800 space-y-2 text-left">
                <li className="flex items-center">
                  <span className="mr-3">✓</span>
                  Your primary wellness objectives
                </li>
                <li className="flex items-center">
                  <span className="mr-3">✓</span>
                  Daily movement and activity targets
                </li>
                <li className="flex items-center">
                  <span className="mr-3">✓</span>
                  Nutrition and hydration goals
                </li>
                <li className="flex items-center">
                  <span className="mr-3">✓</span>
                  Sleep and recovery optimization
                </li>
              </ul>
            </div>
            
            <p className="text-gray-600 mb-8">
              This takes about 5 minutes. You can always adjust your goals later.
            </p>
          </div>
        );
      
      case 1:
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Which areas of wellness are most important to you? (Select all that apply)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {WELLNESS_GOALS.map(goal => (
                <div
                  key={goal.value}
                  onClick={() => togglePrimaryGoal(goal.value)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    goals.primaryGoals.includes(goal.value)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{goal.label}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {goal.value === 'weight_loss' && 'Achieve a healthy weight through sustainable habits'}
                        {goal.value === 'fitness' && 'Build strength, endurance, and physical capability'}
                        {goal.value === 'nutrition' && 'Develop healthy eating patterns and food relationships'}
                        {goal.value === 'social' && 'Connect with others for accountability and support'}
                      </p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 ${
                      goals.primaryGoals.includes(goal.value)
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-white border-gray-300'
                    }`}>
                      {goals.primaryGoals.includes(goal.value) && (
                        <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              How would you describe your current activity level?
            </h3>
            <div className="space-y-4">
              {ACTIVITY_LEVELS.map(level => (
                <div
                  key={level.value}
                  onClick={() => setGoals(prev => ({ ...prev, activityLevel: level.value }))}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    goals.activityLevel === level.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{level.label}</h4>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 ${
                      goals.activityLevel === level.value
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-white border-gray-300'
                    }`}>
                      {goals.activityLevel === level.value && (
                        <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Why this matters:</strong> Your activity level helps us set realistic initial goals 
                and recommend appropriate challenges for your fitness journey.
              </p>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Daily Step Goal
              </h3>
              <p className="text-gray-600 mb-4">
                The average person walks 3,000-4,000 steps daily. Health experts recommend 8,000-10,000 for optimal wellness.
              </p>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min={HEALTH_GOALS.STEP_GOAL_RANGE.min}
                  max={HEALTH_GOALS.STEP_GOAL_RANGE.max}
                  step="1000"
                  value={goals.dailyStepGoal}
                  onChange={(e) => setGoals(prev => ({ ...prev, dailyStepGoal: parseInt(e.target.value) }))}
                  className="flex-1"
                />
                <div className="text-2xl font-bold text-blue-600 w-24 text-center">
                  {goals.dailyStepGoal.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Weekly Exercise Goals
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days per week
                  </label>
                  <select
                    value={goals.weeklyExerciseDays}
                    onChange={(e) => setGoals(prev => ({ ...prev, weeklyExerciseDays: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(days => (
                      <option key={days} value={days}>{days} days</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minutes per week
                  </label>
                  <select
                    value={goals.weeklyExerciseMinutes}
                    onChange={(e) => setGoals(prev => ({ ...prev, weeklyExerciseMinutes: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="75">75 minutes (minimum)</option>
                    <option value="150">150 minutes (recommended)</option>
                    <option value="300">300 minutes (advanced)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Start with achievable goals. You can always increase them as you build habits!
              </p>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                What nutrition areas would you like to focus on?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { value: 'balanced_meals', label: 'Balanced Meals', desc: 'Proper portions of proteins, carbs, and fats' },
                  { value: 'reduce_sugar', label: 'Reduce Sugar', desc: 'Lower sugar intake for better health' },
                  { value: 'more_vegetables', label: 'More Vegetables', desc: 'Increase daily vegetable servings' },
                  { value: 'portion_control', label: 'Portion Control', desc: 'Manage portion sizes effectively' },
                  { value: 'meal_planning', label: 'Meal Planning', desc: 'Plan meals ahead for better choices' },
                  { value: 'mindful_eating', label: 'Mindful Eating', desc: 'Develop awareness around eating habits' }
                ].map(focus => (
                  <div
                    key={focus.value}
                    onClick={() => toggleNutritionFocus(focus.value)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      goals.nutritionFocus.includes(focus.value)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{focus.label}</h4>
                        <p className="text-sm text-gray-600 mt-1">{focus.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded border-2 mt-1 ${
                        goals.nutritionFocus.includes(focus.value)
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-white border-gray-300'
                      }`}>
                        {goals.nutritionFocus.includes(focus.value) && (
                          <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Daily Water Intake Goal
              </h3>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Glasses per day:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setGoals(prev => ({ ...prev, waterIntakeGoal: Math.max(4, prev.waterIntakeGoal - 1) }))}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold text-blue-600 w-12 text-center">
                    {goals.waterIntakeGoal}
                  </span>
                  <button
                    onClick={() => setGoals(prev => ({ ...prev, waterIntakeGoal: Math.min(16, prev.waterIntakeGoal + 1) }))}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
                <span className="text-gray-600">({goals.waterIntakeGoal * 8} oz)</span>
              </div>
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sleep Goals
              </h3>
              <p className="text-gray-600 mb-6">
                Quality sleep is essential for recovery, mental clarity, and overall wellness.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Sleep Hours
                  </label>
                  <select
                    value={goals.sleepHoursGoal}
                    onChange={(e) => setGoals(prev => ({ ...prev, sleepHoursGoal: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[6, 7, 8, 9].map(hours => (
                      <option key={hours} value={hours}>{hours} hours</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Bedtime
                  </label>
                  <input
                    type="time"
                    value={goals.sleepTimeGoal}
                    onChange={(e) => setGoals(prev => ({ ...prev, sleepTimeGoal: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Wake Time
                  </label>
                  <input
                    type="time"
                    value={goals.wakeTimeGoal}
                    onChange={(e) => setGoals(prev => ({ ...prev, wakeTimeGoal: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Sleep Optimization Tips:</h4>
              <ul className="text-purple-800 space-y-1 text-sm">
                <li>• Keep a consistent sleep schedule, even on weekends</li>
                <li>• Create a relaxing bedtime routine</li>
                <li>• Avoid screens 30-60 minutes before bed</li>
                <li>• Keep your bedroom cool, dark, and quiet</li>
              </ul>
            </div>
          </div>
        );
      
      case 6:
        return (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Your Personalized Wellness Goals
            </h3>
            
            <div className="space-y-4 mb-8">
              {/* Primary Goals */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Primary Focus Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {goals.primaryGoals.map(goal => {
                    const wellness = WELLNESS_GOALS.find(w => w.value === goal);
                    return (
                      <span key={goal} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {wellness?.label}
                      </span>
                    );
                  })}
                </div>
              </div>
              
              {/* Daily Targets */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Daily Targets</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Steps:</span>
                    <span className="ml-2 font-medium">{goals.dailyStepGoal.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Water:</span>
                    <span className="ml-2 font-medium">{goals.waterIntakeGoal} glasses</span>
                  </div>
                </div>
              </div>
              
              {/* Weekly Goals */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Weekly Exercise</h4>
                <p className="text-sm text-gray-700">
                  {goals.weeklyExerciseDays} days, {goals.weeklyExerciseMinutes} minutes total
                </p>
              </div>
              
              {/* Sleep Schedule */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Sleep Schedule</h4>
                <p className="text-sm text-gray-700">
                  {goals.sleepHoursGoal} hours ({goals.sleepTimeGoal} - {goals.wakeTimeGoal})
                </p>
              </div>
              
              {/* Nutrition Focus */}
              {goals.nutritionFocus.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Nutrition Focus</h4>
                  <div className="flex flex-wrap gap-2">
                    {goals.nutritionFocus.map(focus => (
                      <span key={focus} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {focus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-blue-800 mb-2">
                🎉 Great job! Your goals are set and ready to guide your wellness journey.
              </p>
              <p className="text-sm text-blue-700">
                You can adjust these anytime from your profile settings.
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-gray-700">
            Step {currentStep + 1} of {wizardSteps.length}
          </h2>
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Skip for now
          </button>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / wizardSteps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {currentWizardStep.title}
        </h1>
        <p className="text-gray-600">
          {currentWizardStep.description}
        </p>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {currentStep === wizardSteps.length - 1 ? (
          <button
            onClick={handleComplete}
            disabled={isCompleting || goals.primaryGoals.length === 0}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {isCompleting ? 'Saving...' : 'Complete Setup'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={
              (currentStep === 1 && goals.primaryGoals.length === 0) ||
              (currentStep === 4 && goals.nutritionFocus.length === 0)
            }
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default GoalSettingWizard;