import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isOptional: boolean;
  route?: string;
  completedAt?: Date;
}

interface OnboardingProgressProps {
  currentStep?: string;
  onStepClick?: (stepId: string, route?: string) => void;
  compact?: boolean;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  onStepClick,
  compact = false
}) => {
  const { user } = useUser();
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  // Define onboarding steps
  const defaultSteps: OnboardingStep[] = [
    {
      id: 'profile_setup',
      title: 'Complete Profile',
      description: 'Set up your basic profile information',
      isCompleted: false,
      isOptional: false,
      route: '/profile'
    },
    {
      id: 'health_permissions',
      title: 'Health Data Access',
      description: 'Grant access to step tracking data',
      isCompleted: false,
      isOptional: false
    },
    {
      id: 'goals_setup',
      title: 'Set Wellness Goals',
      description: 'Define your personal wellness objectives',
      isCompleted: false,
      isOptional: false,
      route: '/welcome/goals'
    },
    {
      id: 'app_walkthrough',
      title: 'App Walkthrough',
      description: 'Learn how to navigate the app',
      isCompleted: false,
      isOptional: true,
      route: '/welcome'
    },
    {
      id: 'notification_setup',
      title: 'Notification Preferences',
      description: 'Choose how you want to receive updates',
      isCompleted: false,
      isOptional: true,
      route: '/welcome/notifications'
    },
    {
      id: 'first_food_entry',
      title: 'Log Your First Meal',
      description: 'Try the AI-powered food journal',
      isCompleted: false,
      isOptional: true,
      route: '/food'
    },
    {
      id: 'training_start',
      title: 'Start Training Modules',
      description: 'Begin your wellness coaching journey',
      isCompleted: false,
      isOptional: true,
      route: '/training'
    }
  ];

  useEffect(() => {
    loadOnboardingProgress();
  }, [user]);

  const loadOnboardingProgress = () => {
    // Load progress from localStorage
    const stored = localStorage.getItem('onboarding_progress');
    const storedProgress = stored ? JSON.parse(stored) : {};
    
    // Check completion status for each step
    const updatedSteps = defaultSteps.map(step => {
      let isCompleted = storedProgress[step.id]?.completed || false;
      let completedAt = storedProgress[step.id]?.completedAt ? new Date(storedProgress[step.id].completedAt) : undefined;

      // Auto-detect completion for some steps
      switch (step.id) {
        case 'profile_setup':
          isCompleted = user?.firstName && user?.profile?.activityLevel ? true : false;
          break;
        case 'health_permissions':
          // Check if health permissions have been granted (simulated)
          isCompleted = localStorage.getItem('health_permissions_granted') === 'true';
          break;
        case 'goals_setup':
          isCompleted = localStorage.getItem('wellness_goals') !== null;
          break;
        case 'notification_setup':
          isCompleted = localStorage.getItem('wellness_notification_preferences') !== null;
          break;
        case 'first_food_entry':
          // Check if user has any food entries
          const foodEntries = localStorage.getItem('food_entries');
          isCompleted = foodEntries ? JSON.parse(foodEntries).length > 0 : false;
          break;
        case 'training_start':
          // Check if user has started any training modules
          const trainingProgress = localStorage.getItem('training_progress');
          isCompleted = trainingProgress ? Object.keys(JSON.parse(trainingProgress)).length > 0 : false;
          break;
      }

      return {
        ...step,
        isCompleted,
        completedAt: isCompleted && !completedAt ? new Date() : completedAt
      };
    });

    setSteps(updatedSteps);
    
    // Calculate overall progress
    const completedCount = updatedSteps.filter(step => step.isCompleted).length;
    const requiredSteps = updatedSteps.filter(step => !step.isOptional);
    const requiredCompletedCount = requiredSteps.filter(step => step.isCompleted).length;
    
    // Progress based on required steps (0-100%)
    const progress = requiredSteps.length > 0 ? Math.round((requiredCompletedCount / requiredSteps.length) * 100) : 0;
    setOverallProgress(progress);

    // Save updated progress
    const progressData = updatedSteps.reduce((acc, step) => {
      acc[step.id] = {
        completed: step.isCompleted,
        completedAt: step.completedAt?.toISOString()
      };
      return acc;
    }, {} as Record<string, any>);
    
    localStorage.setItem('onboarding_progress', JSON.stringify(progressData));
  };

  const markStepCompleted = (stepId: string) => {
    const updatedSteps = steps.map(step => 
      step.id === stepId 
        ? { ...step, isCompleted: true, completedAt: new Date() }
        : step
    );
    setSteps(updatedSteps);
    
    // Save to localStorage
    const progressData = updatedSteps.reduce((acc, step) => {
      acc[step.id] = {
        completed: step.isCompleted,
        completedAt: step.completedAt?.toISOString()
      };
      return acc;
    }, {} as Record<string, any>);
    
    localStorage.setItem('onboarding_progress', JSON.stringify(progressData));
    loadOnboardingProgress(); // Recalculate progress
  };

  const handleStepClick = (step: OnboardingStep) => {
    if (onStepClick && step.route) {
      onStepClick(step.id, step.route);
    }
  };

  const getStepIcon = (step: OnboardingStep) => {
    if (step.isCompleted) {
      return '✅';
    } else if (currentStep === step.id) {
      return '🔄';
    } else if (step.isOptional) {
      return '⭐';
    } else {
      return '📋';
    }
  };

  const getRequiredStepsText = () => {
    const requiredSteps = steps.filter(step => !step.isOptional);
    const completedRequired = requiredSteps.filter(step => step.isCompleted).length;
    return `${completedRequired}/${requiredSteps.length} required steps completed`;
  };

  const getOptionalStepsText = () => {
    const optionalSteps = steps.filter(step => step.isOptional);
    const completedOptional = optionalSteps.filter(step => step.isCompleted).length;
    return `${completedOptional}/${optionalSteps.length} optional steps completed`;
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Onboarding Progress</h3>
          <span className="text-sm font-medium text-blue-600">{overallProgress}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        
        <div className="text-sm text-gray-600 space-y-1">
          <div>{getRequiredStepsText()}</div>
          <div>{getOptionalStepsText()}</div>
        </div>
        
        {overallProgress < 100 && (
          <button
            onClick={() => onStepClick?.('continue', '/welcome')}
            className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Continue Setup
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Your Wellness Journey</h2>
        <p className="text-gray-600">
          Complete these steps to get the most out of your wellness app experience.
        </p>
      </div>

      {/* Overall Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Overall Progress</h3>
          <span className="text-lg font-bold text-blue-600">{overallProgress}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>{getRequiredStepsText()}</span>
          <span>{getOptionalStepsText()}</span>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 mb-4">Setup Steps</h3>
        
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
              step.isCompleted 
                ? 'border-green-200 bg-green-50' 
                : currentStep === step.id
                  ? 'border-blue-500 bg-blue-50'
                  : step.isOptional
                    ? 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    : 'border-orange-200 bg-orange-50 hover:border-orange-300'
            }`}
            onClick={() => handleStepClick(step)}
          >
            <div className="flex items-start space-x-4">
              {/* Step Icon */}
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  step.isCompleted 
                    ? 'bg-green-100 text-green-600' 
                    : currentStep === step.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                }`}>
                  {step.isCompleted ? '✓' : index + 1}
                </div>
              </div>
              
              {/* Step Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium ${
                    step.isCompleted ? 'text-green-900' : 'text-gray-900'
                  }`}>
                    {step.title}
                    {step.isOptional && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Optional
                      </span>
                    )}
                  </h4>
                  
                  <div className="flex items-center space-x-2">
                    {step.isCompleted && step.completedAt && (
                      <span className="text-xs text-gray-500">
                        {step.completedAt.toLocaleDateString()}
                      </span>
                    )}
                    <span className="text-lg">{getStepIcon(step)}</span>
                  </div>
                </div>
                
                <p className={`text-sm mt-1 ${
                  step.isCompleted ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {step.description}
                </p>
                
                {!step.isCompleted && step.route && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStepClick(step);
                    }}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {currentStep === step.id ? 'Continue' : 'Start'} →
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Completion Message */}
      {overallProgress === 100 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎉</span>
            <div>
              <h4 className="font-semibold text-green-900">Congratulations!</h4>
              <p className="text-green-700 text-sm">
                You've completed all required onboarding steps. You're ready to start your wellness journey!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingProgress;

// Hook for managing onboarding progress
export const useOnboardingProgress = () => {
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = () => {
    const stored = localStorage.getItem('onboarding_progress');
    if (!stored) return;

    const progress = JSON.parse(stored);
    const requiredSteps = ['profile_setup', 'health_permissions', 'goals_setup'];
    const allRequiredCompleted = requiredSteps.every(step => progress[step]?.completed);
    
    setIsOnboardingComplete(allRequiredCompleted);
    
    // Find next incomplete step
    const allSteps = ['profile_setup', 'health_permissions', 'goals_setup', 'app_walkthrough', 'notification_setup', 'first_food_entry', 'training_start'];
    const nextStep = allSteps.find(step => !progress[step]?.completed);
    setCurrentStep(nextStep || null);
  };

  const markStepCompleted = (stepId: string) => {
    const stored = localStorage.getItem('onboarding_progress');
    const progress = stored ? JSON.parse(stored) : {};
    
    progress[stepId] = {
      completed: true,
      completedAt: new Date().toISOString()
    };
    
    localStorage.setItem('onboarding_progress', JSON.stringify(progress));
    checkOnboardingStatus();
  };

  return {
    currentStep,
    isOnboardingComplete,
    markStepCompleted,
    checkOnboardingStatus
  };
};