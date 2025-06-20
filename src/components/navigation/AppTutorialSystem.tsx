import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface TutorialStep {
  id: string;
  target: string; // CSS selector for the element to highlight
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'none';
  nextButton?: string;
  skipButton?: string;
  route?: string; // Navigate to this route for the step
  waitForElement?: boolean; // Wait for target element to appear
  beforeStep?: () => void; // Function to execute before showing step
  afterStep?: () => void; // Function to execute after step completion
}

export interface TutorialFlow {
  id: string;
  name: string;
  description: string;
  steps: TutorialStep[];
  triggers: {
    onFirstVisit?: boolean;
    onRoute?: string[];
    onUserAction?: string;
    manual?: boolean;
  };
  conditions?: {
    userRole?: string[];
    hasCompletedOnboarding?: boolean;
    minDaysActive?: number;
  };
}

interface AppTutorialSystemProps {
  flows: TutorialFlow[];
  onTutorialComplete?: (flowId: string) => void;
  onTutorialSkip?: (flowId: string, stepId: string) => void;
}

interface TutorialState {
  activeFlow: TutorialFlow | null;
  currentStepIndex: number;
  isVisible: boolean;
  highlightedElement: HTMLElement | null;
  overlayVisible: boolean;
}

const AppTutorialSystem: React.FC<AppTutorialSystemProps> = ({
  flows,
  onTutorialComplete,
  onTutorialSkip
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tutorialState, setTutorialState] = useState<TutorialState>({
    activeFlow: null,
    currentStepIndex: 0,
    isVisible: false,
    highlightedElement: null,
    overlayVisible: false
  });

  const tooltipRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Check for tutorial triggers on route change
  useEffect(() => {
    checkTutorialTriggers();
  }, [location.pathname]);

  // Handle element highlighting and positioning
  useEffect(() => {
    if (tutorialState.isVisible && tutorialState.activeFlow) {
      const currentStep = tutorialState.activeFlow.steps[tutorialState.currentStepIndex];
      if (currentStep) {
        positionTooltip(currentStep);
      }
    }
  }, [tutorialState.isVisible, tutorialState.currentStepIndex, tutorialState.activeFlow]);

  const checkTutorialTriggers = () => {
    const currentPath = location.pathname;
    
    for (const flow of flows) {
      // Check if tutorial should trigger on this route
      if (flow.triggers.onRoute?.includes(currentPath)) {
        // Check conditions
        if (shouldShowTutorial(flow)) {
          startTutorial(flow.id);
          break;
        }
      }
    }
  };

  const shouldShowTutorial = (flow: TutorialFlow): boolean => {
    // Check if tutorial was already completed
    const completedTutorials = getCompletedTutorials();
    if (completedTutorials.includes(flow.id)) {
      return false;
    }

    // Check conditions
    if (flow.conditions) {
      // Add condition checks here based on user context
      // For now, return true for demo
      return true;
    }

    return true;
  };

  const getCompletedTutorials = (): string[] => {
    try {
      const completed = localStorage.getItem('completed_tutorials');
      return completed ? JSON.parse(completed) : [];
    } catch {
      return [];
    }
  };

  const markTutorialCompleted = (flowId: string) => {
    try {
      const completed = getCompletedTutorials();
      if (!completed.includes(flowId)) {
        completed.push(flowId);
        localStorage.setItem('completed_tutorials', JSON.stringify(completed));
      }
    } catch (error) {
      console.error('Failed to save tutorial completion:', error);
    }
  };

  const startTutorial = (flowId: string) => {
    const flow = flows.find(f => f.id === flowId);
    if (!flow) return;

    setTutorialState({
      activeFlow: flow,
      currentStepIndex: 0,
      isVisible: true,
      highlightedElement: null,
      overlayVisible: true
    });
  };

  const nextStep = () => {
    if (!tutorialState.activeFlow) return;

    const currentStep = tutorialState.activeFlow.steps[tutorialState.currentStepIndex];
    
    // Execute after step function
    if (currentStep.afterStep) {
      currentStep.afterStep();
    }

    const nextIndex = tutorialState.currentStepIndex + 1;
    
    if (nextIndex >= tutorialState.activeFlow.steps.length) {
      // Tutorial completed
      completeTutorial();
    } else {
      const nextStep = tutorialState.activeFlow.steps[nextIndex];
      
      // Navigate to next step route if needed
      if (nextStep.route && nextStep.route !== location.pathname) {
        navigate(nextStep.route);
      }

      setTutorialState(prev => ({
        ...prev,
        currentStepIndex: nextIndex
      }));
    }
  };

  const previousStep = () => {
    if (tutorialState.currentStepIndex > 0) {
      setTutorialState(prev => ({
        ...prev,
        currentStepIndex: prev.currentStepIndex - 1
      }));
    }
  };

  const skipTutorial = () => {
    if (tutorialState.activeFlow) {
      const currentStep = tutorialState.activeFlow.steps[tutorialState.currentStepIndex];
      if (onTutorialSkip) {
        onTutorialSkip(tutorialState.activeFlow.id, currentStep.id);
      }
    }
    closeTutorial();
  };

  const completeTutorial = () => {
    if (tutorialState.activeFlow) {
      markTutorialCompleted(tutorialState.activeFlow.id);
      if (onTutorialComplete) {
        onTutorialComplete(tutorialState.activeFlow.id);
      }
    }
    closeTutorial();
  };

  const closeTutorial = () => {
    setTutorialState({
      activeFlow: null,
      currentStepIndex: 0,
      isVisible: false,
      highlightedElement: null,
      overlayVisible: false
    });
  };

  const positionTooltip = (step: TutorialStep) => {
    const targetElement = document.querySelector(step.target) as HTMLElement;
    
    if (!targetElement || !tooltipRef.current) {
      if (step.waitForElement) {
        // Wait for element to appear
        const observer = new MutationObserver(() => {
          const element = document.querySelector(step.target) as HTMLElement;
          if (element) {
            observer.disconnect();
            positionTooltip(step);
          }
        });
        
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        
        // Stop observing after 10 seconds
        setTimeout(() => observer.disconnect(), 10000);
      }
      return;
    }

    // Execute before step function
    if (step.beforeStep) {
      step.beforeStep();
    }

    // Highlight the target element
    setTutorialState(prev => ({
      ...prev,
      highlightedElement: targetElement
    }));

    // Position the tooltip
    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let top = 0;
    let left = 0;

    switch (step.placement) {
      case 'top':
        top = targetRect.top - tooltipRect.height - 10;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + 10;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.left - tooltipRect.width - 10;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.right + 10;
        break;
      case 'center':
        top = (viewport.height - tooltipRect.height) / 2;
        left = (viewport.width - tooltipRect.width) / 2;
        break;
    }

    // Ensure tooltip stays within viewport
    top = Math.max(10, Math.min(top, viewport.height - tooltipRect.height - 10));
    left = Math.max(10, Math.min(left, viewport.width - tooltipRect.width - 10));

    tooltipRef.current.style.top = `${top}px`;
    tooltipRef.current.style.left = `${left}px`;

    // Scroll element into view if needed
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });
  };

  const getHighlightStyle = (): React.CSSProperties => {
    if (!tutorialState.highlightedElement) return {};

    const rect = tutorialState.highlightedElement.getBoundingClientRect();
    return {
      top: rect.top - 4,
      left: rect.left - 4,
      width: rect.width + 8,
      height: rect.height + 8,
    };
  };

  if (!tutorialState.isVisible || !tutorialState.activeFlow) {
    return null;
  }

  const currentStep = tutorialState.activeFlow.steps[tutorialState.currentStepIndex];
  const isLastStep = tutorialState.currentStepIndex === tutorialState.activeFlow.steps.length - 1;

  return (
    <>
      {/* Overlay */}
      {tutorialState.overlayVisible && (
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 pointer-events-auto"
          onClick={(e) => {
            // Allow clicks on highlighted element
            if (tutorialState.highlightedElement?.contains(e.target as Node)) {
              return;
            }
            e.preventDefault();
            e.stopPropagation();
          }}
        />
      )}

      {/* Element highlight */}
      {tutorialState.highlightedElement && (
        <div
          className="fixed pointer-events-none z-50 border-2 border-blue-400 rounded-lg shadow-lg"
          style={getHighlightStyle()}
        >
          <div className="absolute inset-0 bg-blue-400 bg-opacity-20 rounded-lg animate-pulse" />
        </div>
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 max-w-sm w-80 pointer-events-auto"
        style={{ position: 'fixed' }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{currentStep.title}</h3>
            <button
              onClick={closeTutorial}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          <p className="text-gray-700 text-sm leading-relaxed">{currentStep.content}</p>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            {/* Progress indicator */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {tutorialState.currentStepIndex + 1} of {tutorialState.activeFlow.steps.length}
              </span>
              <div className="flex space-x-1">
                {tutorialState.activeFlow.steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === tutorialState.currentStepIndex
                        ? 'bg-blue-500'
                        : index < tutorialState.currentStepIndex
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-2">
              {tutorialState.currentStepIndex > 0 && (
                <button
                  onClick={previousStep}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
                >
                  Back
                </button>
              )}
              
              <button
                onClick={skipTutorial}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                {currentStep.skipButton || 'Skip'}
              </button>
              
              <button
                onClick={nextStep}
                className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {isLastStep 
                  ? 'Finish' 
                  : currentStep.nextButton || 'Next'
                }
              </button>
            </div>
          </div>
        </div>

        {/* Pointer/Arrow */}
        {currentStep.placement !== 'center' && (
          <div
            className={`absolute w-3 h-3 bg-white border transform rotate-45 ${
              currentStep.placement === 'top' ? 'bottom-[-6px] border-b-0 border-r-0' :
              currentStep.placement === 'bottom' ? 'top-[-6px] border-t-0 border-l-0' :
              currentStep.placement === 'left' ? 'right-[-6px] border-r-0 border-b-0' :
              'left-[-6px] border-l-0 border-t-0'
            }`}
            style={{
              left: currentStep.placement === 'left' || currentStep.placement === 'right' 
                ? undefined 
                : '50%',
              top: currentStep.placement === 'top' || currentStep.placement === 'bottom' 
                ? undefined 
                : '50%',
              transform: 'translate(-50%, -50%) rotate(45deg)'
            }}
          />
        )}
      </div>
    </>
  );
};

// Tutorial Flow Definitions
export const defaultTutorialFlows: TutorialFlow[] = [
  {
    id: 'welcome-tour',
    name: 'Welcome Tour',
    description: 'Introduction to the wellness app',
    triggers: {
      onRoute: ['/dashboard'],
      onFirstVisit: true
    },
    conditions: {
      hasCompletedOnboarding: true
    },
    steps: [
      {
        id: 'welcome',
        target: 'body',
        title: 'Welcome to Your Wellness Journey!',
        content: 'Let\'s take a quick tour of your new wellness app. This tour will show you the key features to help you achieve your health goals.',
        placement: 'center'
      },
      {
        id: 'dashboard-overview',
        target: '[data-tutorial="dashboard"]',
        title: 'Your Dashboard',
        content: 'This is your personal dashboard where you can see your daily progress, goals, and achievements at a glance.',
        placement: 'bottom'
      },
      {
        id: 'step-tracking',
        target: '[data-tutorial="step-widget"]',
        title: 'Step Tracking',
        content: 'Monitor your daily steps and see your progress towards your step goal. Your phone automatically tracks your movement!',
        placement: 'left'
      },
      {
        id: 'food-journal',
        target: '[data-tutorial="nutrition-widget"]',
        title: 'Food Journal',
        content: 'Log your meals and get AI-powered nutrition insights. Just describe what you ate and let our AI do the rest!',
        placement: 'right'
      },
      {
        id: 'group-features',
        target: '[data-tutorial="group-widget"]',
        title: 'Group Support',
        content: 'Join or create wellness groups for accountability and motivation. Connect with others on similar journeys!',
        placement: 'top'
      },
      {
        id: 'navigation',
        target: '[data-tutorial="nav-menu"]',
        title: 'Navigation',
        content: 'Use this menu to access different sections of the app including training modules, groups, and your profile.',
        placement: 'bottom',
        route: '/dashboard'
      }
    ]
  },
  {
    id: 'food-logging-tutorial',
    name: 'Food Logging Tutorial',
    description: 'Learn how to log food and track nutrition',
    triggers: {
      onRoute: ['/food-journal'],
      manual: true
    },
    steps: [
      {
        id: 'food-entry',
        target: '[data-tutorial="food-input"]',
        title: 'Log Your Food',
        content: 'Simply type what you ate in natural language. For example: "Grilled chicken breast with rice and broccoli".',
        placement: 'bottom',
        route: '/food-journal'
      },
      {
        id: 'ai-analysis',
        target: '[data-tutorial="ai-button"]',
        title: 'AI Analysis',
        content: 'Click this button to get instant nutrition analysis powered by AI. It will break down calories, protein, carbs, and more!',
        placement: 'left'
      },
      {
        id: 'edit-results',
        target: '[data-tutorial="nutrition-display"]',
        title: 'Review & Edit',
        content: 'Review the AI results and make any necessary adjustments. You can edit all nutrition values before saving.',
        placement: 'top'
      },
      {
        id: 'meal-history',
        target: '[data-tutorial="meal-history"]',
        title: 'Meal History',
        content: 'View your previous meals here. You can copy meals from previous days or search for foods you\'ve eaten before.',
        placement: 'right'
      }
    ]
  },
  {
    id: 'group-creation-tutorial',
    name: 'Group Creation Tutorial',
    description: 'Learn how to create and manage wellness groups',
    triggers: {
      manual: true
    },
    conditions: {
      minDaysActive: 7
    },
    steps: [
      {
        id: 'eligibility',
        target: '[data-tutorial="create-group"]',
        title: 'Create Your Group',
        content: 'You\'re now eligible to create a wellness group! You\'ve been active for 7 days and completed your training.',
        placement: 'bottom',
        route: '/groups'
      },
      {
        id: 'group-settings',
        target: '[data-tutorial="group-form"]',
        title: 'Group Settings',
        content: 'Set up your group with a name, description, and invitation settings. You can have up to 10 members in your group.',
        placement: 'right'
      },
      {
        id: 'invite-members',
        target: '[data-tutorial="invite-code"]',
        title: 'Invite Members',
        content: 'Share your unique invitation code with friends and family. They can join your group using this code.',
        placement: 'top'
      },
      {
        id: 'group-management',
        target: '[data-tutorial="admin-tools"]',
        title: 'Group Management',
        content: 'As a group sponsor, you can manage members, post announcements, and upload welcome videos for new members.',
        placement: 'left'
      }
    ]
  }
];

// Hook for managing tutorials
export const useTutorialSystem = () => {
  const [tutorialComponent, setTutorialComponent] = useState<React.ReactNode>(null);

  const startTutorial = (flowId: string, flows: TutorialFlow[] = defaultTutorialFlows) => {
    setTutorialComponent(
      <AppTutorialSystem
        flows={flows}
        onTutorialComplete={(completedFlowId) => {
          console.log('Tutorial completed:', completedFlowId);
          setTutorialComponent(null);
        }}
        onTutorialSkip={(flowId, stepId) => {
          console.log('Tutorial skipped:', flowId, stepId);
          setTutorialComponent(null);
        }}
      />
    );
  };

  const stopTutorial = () => {
    setTutorialComponent(null);
  };

  return {
    tutorialComponent,
    startTutorial,
    stopTutorial
  };
};

export default AppTutorialSystem;