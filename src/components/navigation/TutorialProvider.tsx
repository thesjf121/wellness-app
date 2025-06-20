import React, { createContext, useContext, useState, useEffect } from 'react';
import AppTutorialSystem, { TutorialFlow, defaultTutorialFlows } from './AppTutorialSystem';
import { useLocation } from 'react-router-dom';

interface TutorialContextType {
  startTutorial: (flowId: string) => void;
  stopTutorial: () => void;
  isTutorialActive: boolean;
  availableFlows: TutorialFlow[];
  completedTutorials: string[];
  markTutorialCompleted: (flowId: string) => void;
  resetTutorials: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

interface TutorialProviderProps {
  children: React.ReactNode;
  customFlows?: TutorialFlow[];
  autoStart?: boolean;
}

export const TutorialProvider: React.FC<TutorialProviderProps> = ({
  children,
  customFlows = [],
  autoStart = true
}) => {
  const location = useLocation();
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [activeTutorialFlow, setActiveTutorialFlow] = useState<string | null>(null);
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);
  
  const availableFlows = [...defaultTutorialFlows, ...customFlows];

  // Load completed tutorials from localStorage
  useEffect(() => {
    try {
      const completed = localStorage.getItem('completed_tutorials');
      if (completed) {
        setCompletedTutorials(JSON.parse(completed));
      }
    } catch (error) {
      console.error('Failed to load completed tutorials:', error);
    }
  }, []);

  // Check for auto-starting tutorials on route changes
  useEffect(() => {
    if (!autoStart || isTutorialActive) return;

    const currentPath = location.pathname;
    
    // Check if any tutorial should auto-start on this route
    for (const flow of availableFlows) {
      if (flow.triggers.onRoute?.includes(currentPath) && 
          !completedTutorials.includes(flow.id)) {
        
        // Check conditions
        if (shouldShowTutorial(flow)) {
          startTutorial(flow.id);
          break;
        }
      }
    }
  }, [location.pathname, autoStart, isTutorialActive, completedTutorials, availableFlows]);

  const shouldShowTutorial = (flow: TutorialFlow): boolean => {
    // Check if already completed
    if (completedTutorials.includes(flow.id)) {
      return false;
    }

    // Check conditions
    if (flow.conditions) {
      // Check user role
      if (flow.conditions.userRole) {
        // Get user role from context/localStorage
        const userRole = getUserRole();
        if (!flow.conditions.userRole.includes(userRole)) {
          return false;
        }
      }

      // Check if onboarding is completed
      if (flow.conditions.hasCompletedOnboarding !== undefined) {
        const hasCompleted = getOnboardingStatus();
        if (flow.conditions.hasCompletedOnboarding !== hasCompleted) {
          return false;
        }
      }

      // Check minimum days active
      if (flow.conditions.minDaysActive) {
        const daysActive = getDaysActive();
        if (daysActive < flow.conditions.minDaysActive) {
          return false;
        }
      }
    }

    return true;
  };

  const getUserRole = (): string => {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        return userData.role || 'member';
      }
    } catch (error) {
      console.error('Failed to get user role:', error);
    }
    return 'member';
  };

  const getOnboardingStatus = (): boolean => {
    try {
      const onboardingCompleted = localStorage.getItem('onboarding_completed');
      return onboardingCompleted === 'true';
    } catch (error) {
      console.error('Failed to get onboarding status:', error);
    }
    return false;
  };

  const getDaysActive = (): number => {
    try {
      const firstVisit = localStorage.getItem('first_visit_date');
      if (firstVisit) {
        const firstDate = new Date(firstVisit);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - firstDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
      } else {
        // Set first visit date
        localStorage.setItem('first_visit_date', new Date().toISOString());
        return 0;
      }
    } catch (error) {
      console.error('Failed to calculate days active:', error);
    }
    return 0;
  };

  const startTutorial = (flowId: string) => {
    const flow = availableFlows.find(f => f.id === flowId);
    if (!flow) {
      console.warn(`Tutorial flow '${flowId}' not found`);
      return;
    }

    setActiveTutorialFlow(flowId);
    setIsTutorialActive(true);
  };

  const stopTutorial = () => {
    setActiveTutorialFlow(null);
    setIsTutorialActive(false);
  };

  const markTutorialCompleted = (flowId: string) => {
    try {
      const newCompleted = [...completedTutorials, flowId];
      setCompletedTutorials(newCompleted);
      localStorage.setItem('completed_tutorials', JSON.stringify(newCompleted));
    } catch (error) {
      console.error('Failed to mark tutorial as completed:', error);
    }
  };

  const resetTutorials = () => {
    try {
      setCompletedTutorials([]);
      localStorage.removeItem('completed_tutorials');
    } catch (error) {
      console.error('Failed to reset tutorials:', error);
    }
  };

  const handleTutorialComplete = (flowId: string) => {
    markTutorialCompleted(flowId);
    stopTutorial();
  };

  const handleTutorialSkip = (flowId: string, stepId: string) => {
    console.log('Tutorial skipped:', flowId, 'at step:', stepId);
    stopTutorial();
  };

  const contextValue: TutorialContextType = {
    startTutorial,
    stopTutorial,
    isTutorialActive,
    availableFlows,
    completedTutorials,
    markTutorialCompleted,
    resetTutorials
  };

  return (
    <TutorialContext.Provider value={contextValue}>
      {children}
      {isTutorialActive && activeTutorialFlow && (
        <AppTutorialSystem
          flows={availableFlows.filter(f => f.id === activeTutorialFlow)}
          onTutorialComplete={handleTutorialComplete}
          onTutorialSkip={handleTutorialSkip}
        />
      )}
    </TutorialContext.Provider>
  );
};

export const useTutorial = (): TutorialContextType => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};

// Tutorial trigger component for manual tutorials
interface TutorialTriggerProps {
  flowId: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const TutorialTrigger: React.FC<TutorialTriggerProps> = ({
  flowId,
  children,
  className = '',
  disabled = false
}) => {
  const { startTutorial, completedTutorials } = useTutorial();
  
  const isCompleted = completedTutorials.includes(flowId);
  
  const handleClick = () => {
    if (!disabled) {
      startTutorial(flowId);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      title={isCompleted ? 'Tutorial completed' : 'Start tutorial'}
    >
      {children}
      {isCompleted && <span className="ml-2 text-green-500">✓</span>}
    </button>
  );
};

// Tutorial progress component
export const TutorialProgress: React.FC = () => {
  const { availableFlows, completedTutorials } = useTutorial();
  
  const totalFlows = availableFlows.length;
  const completedCount = completedTutorials.length;
  const progressPercentage = totalFlows > 0 ? (completedCount / totalFlows) * 100 : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Tutorial Progress</h3>
      
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">
          {completedCount} of {totalFlows} tutorials completed
        </span>
        <span className="text-sm font-medium text-gray-900">
          {Math.round(progressPercentage)}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="space-y-2">
        {availableFlows.map(flow => {
          const isCompleted = completedTutorials.includes(flow.id);
          return (
            <div key={flow.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-3 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <span className={`text-sm ${
                  isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                }`}>
                  {flow.name}
                </span>
              </div>
              {!isCompleted && (
                <TutorialTrigger
                  flowId={flow.id}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Start
                </TutorialTrigger>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Tutorial menu component for help section
export const TutorialMenu: React.FC = () => {
  const { availableFlows, completedTutorials, resetTutorials } = useTutorial();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">App Tutorials</h2>
        <button
          onClick={resetTutorials}
          className="text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Reset All
        </button>
      </div>
      
      <p className="text-gray-600 text-sm mb-6">
        Learn how to use different features of the app with these interactive tutorials.
      </p>

      <div className="space-y-4">
        {availableFlows.map(flow => {
          const isCompleted = completedTutorials.includes(flow.id);
          return (
            <div key={flow.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="font-medium text-gray-900">{flow.name}</h3>
                    {isCompleted && (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{flow.description}</p>
                  <div className="text-xs text-gray-500">
                    {flow.steps.length} steps
                  </div>
                </div>
                <TutorialTrigger
                  flowId={flow.id}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  {isCompleted ? 'Replay' : 'Start Tutorial'}
                </TutorialTrigger>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TutorialProvider;