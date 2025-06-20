import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import OnboardingProgress, { useOnboardingProgress } from './OnboardingProgress';

interface OnboardingSession {
  id: string;
  startedAt: Date;
  lastResumedAt: Date;
  currentStepId: string;
  isCompleted: boolean;
  isPaused: boolean;
  skippedSteps: string[];
}

interface OnboardingManagerProps {
  autoStart?: boolean;
  showSkipOption?: boolean;
  redirectOnComplete?: string;
}

const OnboardingManager: React.FC<OnboardingManagerProps> = ({
  autoStart = false,
  showSkipOption = true,
  redirectOnComplete = '/dashboard'
}) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const { currentStep, isOnboardingComplete, markStepCompleted } = useOnboardingProgress();
  
  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSkipConfirmation, setShowSkipConfirmation] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  useEffect(() => {
    checkOnboardingSession();
  }, [user, autoStart]);

  useEffect(() => {
    if (isOnboardingComplete && redirectOnComplete) {
      setTimeout(() => {
        navigate(redirectOnComplete);
      }, 2000); // Show completion message briefly before redirecting
    }
  }, [isOnboardingComplete, redirectOnComplete, navigate]);

  const checkOnboardingSession = () => {
    if (!user) return;

    const stored = localStorage.getItem('onboarding_session');
    let existingSession: OnboardingSession | null = null;

    if (stored) {
      const parsed = JSON.parse(stored);
      existingSession = {
        ...parsed,
        startedAt: new Date(parsed.startedAt),
        lastResumedAt: new Date(parsed.lastResumedAt)
      };
    }

    // Check if user needs onboarding
    const needsOnboarding = !isOnboardingComplete;

    if (needsOnboarding) {
      if (existingSession && !existingSession.isCompleted) {
        // Resume existing session
        setSession(existingSession);
        
        if (existingSession.isPaused) {
          setShowResumePrompt(true);
        } else if (autoStart) {
          resumeOnboarding(existingSession);
        }
      } else if (autoStart) {
        // Start new session
        startNewOnboarding();
      }
    } else {
      // Clean up completed session
      if (existingSession) {
        const completedSession = {
          ...existingSession,
          isCompleted: true,
          isPaused: false
        };
        saveSession(completedSession);
        setSession(completedSession);
      }
    }
  };

  const startNewOnboarding = () => {
    const newSession: OnboardingSession = {
      id: Date.now().toString(),
      startedAt: new Date(),
      lastResumedAt: new Date(),
      currentStepId: currentStep || 'profile_setup',
      isCompleted: false,
      isPaused: false,
      skippedSteps: []
    };

    setSession(newSession);
    saveSession(newSession);
    setShowOnboarding(true);
  };

  const resumeOnboarding = (sessionToResume?: OnboardingSession) => {
    const activeSession = sessionToResume || session;
    if (!activeSession) return;

    const updatedSession = {
      ...activeSession,
      lastResumedAt: new Date(),
      isPaused: false,
      currentStepId: currentStep || activeSession.currentStepId
    };

    setSession(updatedSession);
    saveSession(updatedSession);
    setShowOnboarding(true);
    setShowResumePrompt(false);
  };

  const pauseOnboarding = () => {
    if (!session) return;

    const pausedSession = {
      ...session,
      isPaused: true,
      currentStepId: currentStep || session.currentStepId
    };

    setSession(pausedSession);
    saveSession(pausedSession);
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    if (!session) return;

    const skippedSession = {
      ...session,
      isCompleted: true,
      isPaused: false,
      skippedSteps: [...session.skippedSteps, currentStep || session.currentStepId]
    };

    setSession(skippedSession);
    saveSession(skippedSession);
    setShowOnboarding(false);
    setShowSkipConfirmation(false);

    // Mark as skipped in localStorage
    localStorage.setItem('onboarding_skipped', 'true');
    localStorage.setItem('onboarding_skipped_at', new Date().toISOString());

    if (redirectOnComplete) {
      navigate(redirectOnComplete);
    }
  };

  const completeOnboarding = () => {
    if (!session) return;

    const completedSession = {
      ...session,
      isCompleted: true,
      isPaused: false
    };

    setSession(completedSession);
    saveSession(completedSession);
    setShowOnboarding(false);

    // Mark as completed
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('onboarding_completed_at', new Date().toISOString());
  };

  const saveSession = (sessionData: OnboardingSession) => {
    localStorage.setItem('onboarding_session', JSON.stringify(sessionData));
  };

  const handleStepNavigation = (stepId: string, route?: string) => {
    if (route) {
      // Update current step before navigation
      if (session) {
        const updatedSession = {
          ...session,
          currentStepId: stepId,
          lastResumedAt: new Date()
        };
        setSession(updatedSession);
        saveSession(updatedSession);
      }
      
      navigate(route);
    }
  };

  const getSessionStats = () => {
    if (!session) return null;

    const duration = Date.now() - session.startedAt.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      duration: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      startedAt: session.startedAt,
      skippedCount: session.skippedSteps.length
    };
  };

  // Don't render if user is not logged in or onboarding is complete and not showing
  if (!user || (isOnboardingComplete && !showOnboarding)) {
    return null;
  }

  return (
    <div className="onboarding-manager">
      {/* Resume Prompt Modal */}
      {showResumePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Welcome Back!
              </h3>
              <p className="text-gray-600">
                You have an onboarding session in progress. Would you like to continue where you left off?
              </p>
              
              {session && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  <div>Started: {session.startedAt.toLocaleDateString()}</div>
                  {getSessionStats() && (
                    <div>Duration: {getSessionStats()!.duration}</div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowResumePrompt(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Not Now
              </button>
              <button
                onClick={() => resumeOnboarding()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Continue Setup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skip Confirmation Modal */}
      {showSkipConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Skip Onboarding?
              </h3>
              <p className="text-gray-600">
                You can complete these steps later from your profile settings, but we recommend finishing the setup now for the best experience.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => setShowSkipConfirmation(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Continue Setup
              </button>
              <button
                onClick={skipOnboarding}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Skip for Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Onboarding Interface */}
      {showOnboarding && (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            {/* Header with controls */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Getting Started</h1>
                {session && getSessionStats() && (
                  <p className="text-sm text-gray-600 mt-1">
                    Session started {getSessionStats()!.duration} ago
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={pauseOnboarding}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Pause Setup
                </button>
                
                {showSkipOption && (
                  <button
                    onClick={() => setShowSkipConfirmation(true)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-700 text-sm"
                  >
                    Skip for now
                  </button>
                )}
              </div>
            </div>

            {/* Progress Component */}
            <OnboardingProgress
              currentStep={currentStep || undefined}
              onStepClick={handleStepNavigation}
              compact={false}
            />

            {/* Additional helpful information */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Why Complete Setup?</h3>
                <ul className="text-blue-800 space-y-1 text-sm">
                  <li>• Get personalized wellness recommendations</li>
                  <li>• Track your progress more effectively</li>
                  <li>• Connect with wellness groups</li>
                  <li>• Access advanced features</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">🎯 What You'll Achieve</h3>
                <ul className="text-green-800 space-y-1 text-sm">
                  <li>• Clear wellness goals and tracking</li>
                  <li>• Automated health data integration</li>
                  <li>• AI-powered nutrition insights</li>
                  <li>• Community support and accountability</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compact progress indicator for other pages */}
      {!showOnboarding && !isOnboardingComplete && !showResumePrompt && (
        <div className="fixed bottom-4 right-4 z-40">
          <OnboardingProgress
            currentStep={currentStep || undefined}
            onStepClick={(stepId, route) => {
              if (stepId === 'continue') {
                setShowOnboarding(true);
              } else {
                handleStepNavigation(stepId, route);
              }
            }}
            compact={true}
          />
        </div>
      )}
    </div>
  );
};

export default OnboardingManager;

// Helper hook for checking onboarding status
export const useOnboardingStatus = () => {
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = () => {
    const completed = localStorage.getItem('onboarding_completed') === 'true';
    const skipped = localStorage.getItem('onboarding_skipped') === 'true';
    const progress = localStorage.getItem('onboarding_progress');
    
    if (completed || skipped) {
      setNeedsOnboarding(false);
      setIsCompleted(completed);
      setIsSkipped(skipped);
    } else {
      // Check if user has completed required steps
      if (progress) {
        const parsed = JSON.parse(progress);
        const requiredSteps = ['profile_setup', 'health_permissions', 'goals_setup'];
        const allRequiredCompleted = requiredSteps.every(step => parsed[step]?.completed);
        
        setNeedsOnboarding(!allRequiredCompleted);
        setIsCompleted(allRequiredCompleted);
      } else {
        setNeedsOnboarding(true);
      }
    }
  };

  return {
    needsOnboarding,
    isSkipped,
    isCompleted,
    checkStatus
  };
};