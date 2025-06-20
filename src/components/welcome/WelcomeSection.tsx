import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockAuth } from '../../context/MockAuthContext';
import OnboardingProgress from './OnboardingProgress';
import { ROUTES } from '../../utils/constants';

const WelcomeSection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useMockAuth();
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [currentWalkthroughStep, setCurrentWalkthroughStep] = useState(0);

  const handleStepNavigation = (stepId: string, route?: string) => {
    if (route) {
      navigate(route);
    }
  };

  const walkthroughSteps = [
    {
      title: 'Welcome to Your Wellness Journey!',
      description: 'This app helps you track movement, nutrition, and connect with others for accountability.',
      highlight: null
    },
    {
      title: 'Track Your Movement',
      description: 'The Step Counter automatically syncs with your device to track daily activity.',
      highlight: 'steps'
    },
    {
      title: 'Smart Food Logging',
      description: 'Use AI to analyze your meals and understand your nutrition.',
      highlight: 'nutrition'
    },
    {
      title: 'Learn & Grow',
      description: 'Complete our 8-module wellness coaching curriculum.',
      highlight: 'training'
    },
    {
      title: 'Join the Community',
      description: 'After 7 days of activity and training completion, create or join accountability groups.',
      highlight: 'social'
    }
  ];

  const handleWalkthroughNext = () => {
    if (currentWalkthroughStep < walkthroughSteps.length - 1) {
      setCurrentWalkthroughStep(currentWalkthroughStep + 1);
    } else {
      setShowWalkthrough(false);
      setCurrentWalkthroughStep(0);
    }
  };

  const handleWalkthroughPrev = () => {
    if (currentWalkthroughStep > 0) {
      setCurrentWalkthroughStep(currentWalkthroughStep - 1);
    }
  };

  const currentWalkthrough = walkthroughSteps[currentWalkthroughStep];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Your Wellness Journey! 🌟
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          {user?.firstName ? `Hi ${user.firstName}! ` : ''}
          Let's get you started on creating lasting wellness through movement, nutrition, and community.
        </p>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setShowWalkthrough(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Take App Tour
          </button>
          <button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>

      {/* Onboarding Progress */}
      <div className="mb-8">
        <OnboardingProgress
          onStepClick={handleStepNavigation}
          compact={false}
        />
      </div>

      {/* Feature Highlights */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-3xl">📱</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Smart Tracking</h3>
          <p className="text-gray-600 text-sm">
            Automatic step counting and AI-powered nutrition analysis make tracking effortless.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-3xl">🎓</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Expert Coaching</h3>
          <p className="text-gray-600 text-sm">
            8 comprehensive modules covering all aspects of wellness and healthy living.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-3xl">👥</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Community Support</h3>
          <p className="text-gray-600 text-sm">
            Join accountability groups and share your journey with like-minded individuals.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Ready to Get Started?
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/welcome/goals')}
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="font-semibold text-gray-900">Set Your Goals</h3>
                <p className="text-sm text-gray-600">Define your wellness objectives</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/welcome/notifications')}
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔔</span>
              <div>
                <h3 className="font-semibold text-gray-900">Notification Setup</h3>
                <p className="text-sm text-gray-600">Choose how you want to stay motivated</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Walkthrough Modal */}
      {showWalkthrough && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {currentWalkthrough.title}
                </h3>
                <button
                  onClick={() => setShowWalkthrough(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-gray-600 mb-4">
                {currentWalkthrough.description}
              </p>

              {/* Progress indicator */}
              <div className="flex justify-center space-x-2 mb-6">
                {walkthroughSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentWalkthroughStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleWalkthroughPrev}
                disabled={currentWalkthroughStep === 0}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleWalkthroughNext}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {currentWalkthroughStep === walkthroughSteps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeSection;