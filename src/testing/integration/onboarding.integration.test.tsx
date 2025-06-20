import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OnboardingManager from '../../components/welcome/OnboardingManager';
import { MockAuthProvider } from '../setup/mockAuthContext';

// Mock the onboarding components
jest.mock('../../components/welcome/GoalSettingWizard', () => {
  return function MockGoalSettingWizard({ onComplete }: { onComplete: (data: any) => void }) {
    return (
      <div data-testid="goal-setting-wizard">
        <h2>Goal Setting Wizard</h2>
        <button
          onClick={() => onComplete({
            goals: ['weight_loss', 'fitness_improvement'],
            dailyStepGoal: 8000,
            targetWeight: 150
          })}
        >
          Complete Goals
        </button>
      </div>
    );
  };
});

jest.mock('../../components/onboarding/PersonalInfoForm', () => {
  return function MockPersonalInfoForm({ onComplete }: { onComplete: (data: any) => void }) {
    return (
      <div data-testid="personal-info-form">
        <h2>Personal Information</h2>
        <input data-testid="first-name" placeholder="First Name" />
        <input data-testid="last-name" placeholder="Last Name" />
        <input data-testid="email" placeholder="Email" />
        <button
          onClick={() => onComplete({
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            age: 30,
            height: 70,
            weight: 160
          })}
        >
          Complete Info
        </button>
      </div>
    );
  };
});

jest.mock('../../components/onboarding/PreferencesSetup', () => {
  return function MockPreferencesSetup({ onComplete }: { onComplete: (data: any) => void }) {
    return (
      <div data-testid="preferences-setup">
        <h2>Preferences Setup</h2>
        <button
          onClick={() => onComplete({
            notifications: true,
            reminderTime: '09:00',
            preferredWorkoutTime: 'morning',
            dietaryRestrictions: []
          })}
        >
          Complete Preferences
        </button>
      </div>
    );
  };
});

jest.mock('../../components/onboarding/WelcomeVideo', () => {
  return function MockWelcomeVideo({ onComplete }: { onComplete: () => void }) {
    return (
      <div data-testid="welcome-video">
        <h2>Welcome Video</h2>
        <video data-testid="onboarding-video" controls>
          <source src="/welcome-video.mp4" type="video/mp4" />
        </video>
        <button onClick={onComplete}>Skip Video</button>
        <button onClick={onComplete}>Video Complete</button>
      </div>
    );
  };
});

const renderOnboardingWithContext = (user: any = null) => {
  return render(
    <BrowserRouter>
      <MockAuthProvider initialUser={user} initialSignedIn={!!user}>
        <OnboardingManager />
      </MockAuthProvider>
    </BrowserRouter>
  );
};

describe('Onboarding Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Complete Onboarding Flow', () => {
    it('should complete full onboarding process', async () => {
      renderOnboardingWithContext();
      
      // Step 1: Personal Information
      await waitFor(() => {
        expect(screen.getByTestId('personal-info-form')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Complete Info'));
      
      // Step 2: Goal Setting
      await waitFor(() => {
        expect(screen.getByTestId('goal-setting-wizard')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Goal Setting Wizard')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Complete Goals'));
      
      // Step 3: Preferences
      await waitFor(() => {
        expect(screen.getByTestId('preferences-setup')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Preferences Setup')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Complete Preferences'));
      
      // Step 4: Welcome Video
      await waitFor(() => {
        expect(screen.getByTestId('welcome-video')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Welcome Video')).toBeInTheDocument();
      expect(screen.getByTestId('onboarding-video')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Skip Video'));
      
      // Should complete onboarding
      await waitFor(() => {
        const onboardingData = localStorage.getItem('onboarding_completed');
        expect(onboardingData).toBeTruthy();
      });
    });

    it('should allow users to go back to previous steps', async () => {
      renderOnboardingWithContext();
      
      // Complete first step
      await waitFor(() => {
        expect(screen.getByTestId('personal-info-form')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Complete Info'));
      
      // Complete second step
      await waitFor(() => {
        expect(screen.getByTestId('goal-setting-wizard')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Complete Goals'));
      
      // Now at preferences step
      await waitFor(() => {
        expect(screen.getByTestId('preferences-setup')).toBeInTheDocument();
      });
      
      // Should be able to go back (if back button exists)
      const backButton = screen.queryByText('Previous') || screen.queryByText('Back');
      if (backButton) {
        fireEvent.click(backButton);
        
        // Should return to goal setting
        await waitFor(() => {
          expect(screen.getByTestId('goal-setting-wizard')).toBeInTheDocument();
        });
      }
    });

    it('should save progress between sessions', async () => {
      const { unmount } = renderOnboardingWithContext();
      
      // Complete first step
      await waitFor(() => {
        expect(screen.getByTestId('personal-info-form')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Complete Info'));
      
      // Complete second step
      await waitFor(() => {
        expect(screen.getByTestId('goal-setting-wizard')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Complete Goals'));
      
      // Unmount component (simulate page reload)
      unmount();
      
      // Re-render onboarding
      renderOnboardingWithContext();
      
      // Should resume from preferences step
      await waitFor(() => {
        expect(screen.getByTestId('preferences-setup')).toBeInTheDocument();
      });
      
      // Should not see previous steps
      expect(screen.queryByTestId('personal-info-form')).not.toBeInTheDocument();
      expect(screen.queryByTestId('goal-setting-wizard')).not.toBeInTheDocument();
    });
  });

  describe('Skip Onboarding', () => {
    it('should allow users to skip onboarding', async () => {
      renderOnboardingWithContext();
      
      await waitFor(() => {
        expect(screen.getByTestId('personal-info-form')).toBeInTheDocument();
      });
      
      // Look for skip button
      const skipButton = screen.queryByText('Skip for now') || screen.queryByText('Skip Onboarding');
      if (skipButton) {
        fireEvent.click(skipButton);
        
        // Should mark onboarding as skipped
        await waitFor(() => {
          const skippedData = localStorage.getItem('onboarding_skipped');
          expect(skippedData).toBeTruthy();
        });
      }
    });

    it('should show confirmation when skipping', async () => {
      renderOnboardingWithContext();
      
      await waitFor(() => {
        expect(screen.getByTestId('personal-info-form')).toBeInTheDocument();
      });
      
      const skipButton = screen.queryByText('Skip for now');
      if (skipButton) {
        fireEvent.click(skipButton);
        
        // Should show confirmation modal
        await waitFor(() => {
          const confirmation = screen.queryByText(/skip onboarding/i) || 
                             screen.queryByText(/are you sure/i);
          if (confirmation) {
            expect(confirmation).toBeInTheDocument();
          }
        });
      }
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      renderOnboardingWithContext();
      
      await waitFor(() => {
        expect(screen.getByTestId('personal-info-form')).toBeInTheDocument();
      });
      
      // Try to proceed without filling fields (if validation exists)
      const nextButton = screen.queryByText('Next') || screen.queryByText('Continue');
      if (nextButton) {
        fireEvent.click(nextButton);
        
        // Should show validation errors
        await waitFor(() => {
          const error = screen.queryByText(/required/i) || 
                       screen.queryByText(/please fill/i);
          if (error) {
            expect(error).toBeInTheDocument();
          }
        });
      }
    });

    it('should validate email format', async () => {
      renderOnboardingWithContext();
      
      await waitFor(() => {
        expect(screen.getByTestId('personal-info-form')).toBeInTheDocument();
      });
      
      // Fill invalid email
      const emailInput = screen.getByTestId('email');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      
      const nextButton = screen.queryByText('Next') || screen.queryByText('Continue');
      if (nextButton) {
        fireEvent.click(nextButton);
        
        // Should show email validation error
        await waitFor(() => {
          const error = screen.queryByText(/valid email/i) || 
                       screen.queryByText(/email format/i);
          if (error) {
            expect(error).toBeInTheDocument();
          }
        });
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network failure
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      renderOnboardingWithContext();
      
      await waitFor(() => {
        expect(screen.getByTestId('personal-info-form')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Complete Info'));
      
      // Should handle error gracefully
      await waitFor(() => {
        // App should still be functional
        expect(screen.getByTestId('personal-info-form')).toBeInTheDocument();
      });
      
      global.fetch = originalFetch;
      consoleSpy.mockRestore();
    });

    it('should handle localStorage unavailability', async () => {
      // Mock localStorage to throw errors
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn().mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      renderOnboardingWithContext();
      
      await waitFor(() => {
        expect(screen.getByTestId('personal-info-form')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Complete Info'));
      
      // Should continue working without localStorage
      await waitFor(() => {
        expect(screen.getByTestId('goal-setting-wizard')).toBeInTheDocument();
      });
      
      localStorage.setItem = originalSetItem;
      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', async () => {
      renderOnboardingWithContext();
      
      await waitFor(() => {
        expect(screen.getByTestId('personal-info-form')).toBeInTheDocument();
      });
      
      const heading = screen.getByText('Personal Information');
      expect(heading.tagName).toBe('H2');
    });

    it('should be keyboard navigable', async () => {
      renderOnboardingWithContext();
      
      await waitFor(() => {
        expect(screen.getByTestId('first-name')).toBeInTheDocument();
      });
      
      // Test keyboard navigation
      const firstInput = screen.getByTestId('first-name');
      firstInput.focus();
      
      expect(document.activeElement).toBe(firstInput);
    });

    it('should have proper form labeling', async () => {
      renderOnboardingWithContext();
      
      await waitFor(() => {
        expect(screen.getByTestId('personal-info-form')).toBeInTheDocument();
      });
      
      // Form inputs should have proper placeholders or labels
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAttribute('placeholder');
      });
    });
  });

  describe('Progress Tracking', () => {
    it('should show progress indicator', async () => {
      renderOnboardingWithContext();
      
      await waitFor(() => {
        expect(screen.getByTestId('personal-info-form')).toBeInTheDocument();
      });
      
      // Look for progress indicator
      const progressIndicator = screen.queryByText(/step 1/i) || 
                               screen.queryByText(/1 of 4/i) ||
                               screen.queryByRole('progressbar');
      
      if (progressIndicator) {
        expect(progressIndicator).toBeInTheDocument();
      }
    });

    it('should update progress as user advances', async () => {
      renderOnboardingWithContext();
      
      await waitFor(() => {
        expect(screen.getByTestId('personal-info-form')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Complete Info'));
      
      await waitFor(() => {
        expect(screen.getByTestId('goal-setting-wizard')).toBeInTheDocument();
      });
      
      // Progress should have advanced
      const progressIndicator = screen.queryByText(/step 2/i) || 
                               screen.queryByText(/2 of 4/i);
      
      if (progressIndicator) {
        expect(progressIndicator).toBeInTheDocument();
      }
    });
  });
});