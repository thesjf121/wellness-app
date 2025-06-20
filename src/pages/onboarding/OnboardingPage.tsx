import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon } from '@heroicons/react/24/outline';
import { ROUTES, ACTIVITY_LEVELS, WELLNESS_GOALS } from '../../utils/constants';
import { UserProfileForm, ActivityLevel, WellnessGoal } from '../../types/user';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

interface StepProps {
  formData: UserProfileForm;
  updateFormData: (data: Partial<UserProfileForm>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

// Step 1: Welcome and Basic Info
const WelcomeStep: React.FC<StepProps> = ({ formData, updateFormData, onNext, isFirst }) => {
  const { user } = useUser();

  React.useEffect(() => {
    if (user) {
      updateFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      });
    }
  }, [user, updateFormData]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to WellnessApp! 🎉</h2>
        <p className="text-lg text-gray-600 mb-8">
          Let's set up your profile to personalize your wellness journey
        </p>
      </div>

      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => updateFormData({ firstName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your first name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => updateFormData({ lastName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your last name"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!formData.firstName.trim() || !formData.lastName.trim()}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          Next
          <ChevronRightIcon className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Step 2: Personal Information
const PersonalInfoStep: React.FC<StepProps> = ({ formData, updateFormData, onNext, onPrev }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
        <p className="text-gray-600">Help us understand your current health profile</p>
      </div>

      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth (Optional)
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height (cm, Optional)
            </label>
            <input
              type="number"
              value={formData.height}
              onChange={(e) => updateFormData({ height: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="170"
              min="50"
              max="300"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight (kg, Optional)
            </label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => updateFormData({ weight: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="70"
              min="20"
              max="300"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 flex items-center"
        >
          <ChevronLeftIcon className="mr-2 h-4 w-4" />
          Previous
        </button>
        <button
          onClick={onNext}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          Next
          <ChevronRightIcon className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Step 3: Activity Level
const ActivityLevelStep: React.FC<StepProps> = ({ formData, updateFormData, onNext, onPrev }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Activity Level</h2>
        <p className="text-gray-600">How active are you currently?</p>
      </div>

      <div className="space-y-3">
        {ACTIVITY_LEVELS.map((level) => (
          <div
            key={level.value}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              formData.activityLevel === level.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => updateFormData({ activityLevel: level.value as ActivityLevel })}
          >
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                formData.activityLevel === level.value
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-400'
              }`}>
                {formData.activityLevel === level.value && (
                  <CheckIcon className="w-3 h-3 text-white" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{level.label}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 flex items-center"
        >
          <ChevronLeftIcon className="mr-2 h-4 w-4" />
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={!formData.activityLevel}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          Next
          <ChevronRightIcon className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Step 4: Wellness Goals
const WellnessGoalsStep: React.FC<StepProps> = ({ formData, updateFormData, onNext, onPrev }) => {
  const toggleGoal = (goal: WellnessGoal) => {
    const currentGoals = formData.primaryGoals || [];
    const updatedGoals = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal];
    updateFormData({ primaryGoals: updatedGoals });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wellness Goals</h2>
        <p className="text-gray-600">What are your primary wellness goals? (Select all that apply)</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {WELLNESS_GOALS.map((goal) => {
          const isSelected = formData.primaryGoals?.includes(goal.value as WellnessGoal) || false;
          return (
            <div
              key={goal.value}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => toggleGoal(goal.value as WellnessGoal)}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded border-2 mr-3 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-400'
                }`}>
                  {isSelected && (
                    <CheckIcon className="w-3 h-3 text-white" />
                  )}
                </div>
                <h3 className="font-medium text-gray-900">{goal.label}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 flex items-center"
        >
          <ChevronLeftIcon className="mr-2 h-4 w-4" />
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={!formData.primaryGoals?.length}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          Next
          <ChevronRightIcon className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Step 5: Daily Goals
const DailyGoalsStep: React.FC<StepProps> = ({ formData, updateFormData, onNext, onPrev, isLast }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Daily Goals</h2>
        <p className="text-gray-600">Set your daily wellness targets</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Daily Step Goal
          </label>
          <input
            type="number"
            value={formData.dailyStepGoal}
            onChange={(e) => updateFormData({ dailyStepGoal: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="8000"
            min="1000"
            max="50000"
          />
          <p className="text-sm text-gray-500 mt-1">Recommended: 8,000-10,000 steps per day</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Daily Calorie Goal (Optional)
          </label>
          <input
            type="number"
            value={formData.dailyCalorieGoal}
            onChange={(e) => updateFormData({ dailyCalorieGoal: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="2000"
            min="1200"
            max="4000"
          />
          <p className="text-sm text-gray-500 mt-1">Leave blank to set later</p>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 flex items-center"
        >
          <ChevronLeftIcon className="mr-2 h-4 w-4" />
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={!formData.dailyStepGoal}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          Complete Setup
          <CheckIcon className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Basic information',
    component: WelcomeStep
  },
  {
    id: 'personal',
    title: 'Personal Info',
    description: 'Health profile',
    component: PersonalInfoStep
  },
  {
    id: 'activity',
    title: 'Activity Level',
    description: 'Current fitness',
    component: ActivityLevelStep
  },
  {
    id: 'goals',
    title: 'Wellness Goals',
    description: 'What you want to achieve',
    component: WellnessGoalsStep
  },
  {
    id: 'targets',
    title: 'Daily Targets',
    description: 'Set your goals',
    component: DailyGoalsStep
  }
];

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<UserProfileForm>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    height: '',
    weight: '',
    activityLevel: 'moderate',
    primaryGoals: [],
    dailyStepGoal: '8000',
    dailyCalorieGoal: '',
    weeklyWeightLossGoal: ''
  });

  const updateFormData = (data: Partial<UserProfileForm>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete onboarding
      handleCompleteOnboarding();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      // TODO: Save profile data to backend
      console.log('Saving profile data:', formData);
      
      // Mark onboarding as complete in localStorage for now
      localStorage.setItem('onboarding_completed', 'true');
      
      // Navigate to dashboard
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const CurrentStepComponent = ONBOARDING_STEPS[currentStep].component;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {ONBOARDING_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < currentStep ? 'bg-green-500 text-white' :
                  index === currentStep ? 'bg-blue-600 text-white' :
                  'bg-gray-300 text-gray-600'
                }`}>
                  {index < currentStep ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < ONBOARDING_STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-center">
            <p className="text-sm text-gray-600">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}: {ONBOARDING_STEPS[currentStep].title}
            </p>
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <CurrentStepComponent
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onPrev={handlePrev}
            isFirst={currentStep === 0}
            isLast={currentStep === ONBOARDING_STEPS.length - 1}
          />
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;