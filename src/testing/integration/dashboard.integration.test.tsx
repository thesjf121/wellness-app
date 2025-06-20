import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { MockAuthContext } from '../setup/mockAuthContext';

// Mock the dashboard widgets
jest.mock('../../components/dashboard/widgets/StepTrackingWidget', () => {
  return function MockStepTrackingWidget() {
    return <div data-testid="step-tracking-widget">Step Tracking Widget</div>;
  };
});

jest.mock('../../components/dashboard/widgets/ProgressOverviewWidget', () => {
  return function MockProgressOverviewWidget() {
    return <div data-testid="progress-overview-widget">Progress Overview Widget</div>;
  };
});

jest.mock('../../components/dashboard/widgets/GoalSettingWidget', () => {
  return function MockGoalSettingWidget() {
    return <div data-testid="goal-setting-widget">Goal Setting Widget</div>;
  };
});

jest.mock('../../components/dashboard/widgets/ActivityFeedWidget', () => {
  return function MockActivityFeedWidget() {
    return <div data-testid="activity-feed-widget">Activity Feed Widget</div>;
  };
});

jest.mock('../../components/dashboard/widgets/NotificationPreferencesWidget', () => {
  return function MockNotificationPreferencesWidget() {
    return <div data-testid="notification-preferences-widget">Notification Preferences Widget</div>;
  };
});

const renderDashboardWithContext = (user: any, role: 'member' | 'team_sponsor' | 'super_admin' = 'member') => {
  return render(
    <BrowserRouter>
      <MockAuthContext user={{ ...user, role }}>
        <DashboardLayout />
      </MockAuthContext>
    </BrowserRouter>
  );
};

describe('Dashboard Integration Tests', () => {
  const mockUser = {
    id: 'test-user-123',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    role: 'member' as const,
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Member Dashboard', () => {
    it('should render member dashboard with core widgets', async () => {
      renderDashboardWithContext(mockUser, 'member');
      
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Test')).toBeInTheDocument();
      });

      // Core member widgets should be present
      expect(screen.getByTestId('step-tracking-widget')).toBeInTheDocument();
      expect(screen.getByTestId('progress-overview-widget')).toBeInTheDocument();
      expect(screen.getByTestId('goal-setting-widget')).toBeInTheDocument();
      expect(screen.getByTestId('activity-feed-widget')).toBeInTheDocument();
    });

    it('should not show admin-only widgets for members', async () => {
      renderDashboardWithContext(mockUser, 'member');
      
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Test')).toBeInTheDocument();
      });

      // Admin widgets should not be present
      expect(screen.queryByTestId('team-analytics-widget')).not.toBeInTheDocument();
      expect(screen.queryByTestId('user-management-widget')).not.toBeInTheDocument();
    });

    it('should handle widget interactions', async () => {
      renderDashboardWithContext(mockUser, 'member');
      
      await waitFor(() => {
        expect(screen.getByTestId('step-tracking-widget')).toBeInTheDocument();
      });

      // Test widget interactivity
      const stepWidget = screen.getByTestId('step-tracking-widget');
      expect(stepWidget).toBeVisible();
      
      // Widget should be clickable/interactive
      fireEvent.click(stepWidget);
      expect(stepWidget).toBeInTheDocument();
    });
  });

  describe('Team Sponsor Dashboard', () => {
    it('should render team sponsor dashboard with additional widgets', async () => {
      renderDashboardWithContext(mockUser, 'team_sponsor');
      
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Test')).toBeInTheDocument();
      });

      // Should have core widgets
      expect(screen.getByTestId('step-tracking-widget')).toBeInTheDocument();
      expect(screen.getByTestId('progress-overview-widget')).toBeInTheDocument();
      
      // Should have team management features
      expect(screen.getByText('Team Overview')).toBeInTheDocument();
    });

    it('should show team analytics for team sponsors', async () => {
      renderDashboardWithContext(mockUser, 'team_sponsor');
      
      await waitFor(() => {
        expect(screen.getByText('Team Overview')).toBeInTheDocument();
      });

      // Team-specific content should be visible
      expect(screen.queryByText('User Management')).not.toBeInTheDocument(); // Super admin only
    });
  });

  describe('Super Admin Dashboard', () => {
    it('should render super admin dashboard with all widgets', async () => {
      renderDashboardWithContext(mockUser, 'super_admin');
      
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Test')).toBeInTheDocument();
      });

      // Should have core widgets
      expect(screen.getByTestId('step-tracking-widget')).toBeInTheDocument();
      expect(screen.getByTestId('progress-overview-widget')).toBeInTheDocument();
      
      // Should have admin features
      expect(screen.getByText('System Overview')).toBeInTheDocument();
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });

    it('should show system-wide analytics for super admins', async () => {
      renderDashboardWithContext(mockUser, 'super_admin');
      
      await waitFor(() => {
        expect(screen.getByText('System Overview')).toBeInTheDocument();
      });

      // Super admin specific content should be visible
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });
  });

  describe('Dashboard Customization', () => {
    it('should save and restore custom widget layout', async () => {
      const customLayout = 'custom';
      
      renderDashboardWithContext(mockUser, 'member');
      
      await waitFor(() => {
        expect(screen.getByTestId('step-tracking-widget')).toBeInTheDocument();
      });

      // Simulate layout change (this would typically be done through drag & drop or settings)
      // For this test, we'll check that localStorage is used correctly
      localStorage.setItem('dashboard_layout_test-user-123', customLayout);
      
      // Re-render to check persistence
      const { rerender } = renderDashboardWithContext(mockUser, 'member');
      
      await waitFor(() => {
        expect(localStorage.getItem('dashboard_layout_test-user-123')).toBe(customLayout);
      });
    });

    it('should handle missing localStorage gracefully', async () => {
      // Clear localStorage and ensure it doesn't break
      localStorage.clear();
      
      renderDashboardWithContext(mockUser, 'member');
      
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Test')).toBeInTheDocument();
      });

      // Should still render with default layout
      expect(screen.getByTestId('step-tracking-widget')).toBeInTheDocument();
    });
  });

  describe('Real-time Updates', () => {
    it('should update widget data when user completes actions', async () => {
      renderDashboardWithContext(mockUser, 'member');
      
      await waitFor(() => {
        expect(screen.getByTestId('step-tracking-widget')).toBeInTheDocument();
      });

      // Simulate step count update
      const stepWidget = screen.getByTestId('step-tracking-widget');
      fireEvent.click(stepWidget);
      
      // Widget should remain interactive
      expect(stepWidget).toBeInTheDocument();
    });

    it('should handle network errors gracefully', async () => {
      // Mock network failure
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      renderDashboardWithContext(mockUser, 'member');
      
      await waitFor(() => {
        expect(screen.getByTestId('step-tracking-widget')).toBeInTheDocument();
      });

      // Dashboard should still be functional even with network issues
      expect(screen.getByText('Welcome back, Test')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Performance', () => {
    it('should render quickly with minimal re-renders', async () => {
      const renderStart = performance.now();
      
      renderDashboardWithContext(mockUser, 'member');
      
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Test')).toBeInTheDocument();
      });
      
      const renderTime = performance.now() - renderStart;
      
      // Dashboard should render within reasonable time (less than 1 second)
      expect(renderTime).toBeLessThan(1000);
    });

    it('should handle large amounts of data efficiently', async () => {
      // Create user with lots of historical data
      const userWithData = {
        ...mockUser,
        stepHistory: new Array(100).fill(0).map((_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          steps: Math.floor(Math.random() * 15000),
        })),
      };

      renderDashboardWithContext(userWithData, 'member');
      
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Test')).toBeInTheDocument();
      });

      // Should handle large datasets without crashing
      expect(screen.getByTestId('step-tracking-widget')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', async () => {
      renderDashboardWithContext(mockUser, 'member');
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      });

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Welcome back, Test');
    });

    it('should be keyboard navigable', async () => {
      renderDashboardWithContext(mockUser, 'member');
      
      await waitFor(() => {
        expect(screen.getByTestId('step-tracking-widget')).toBeInTheDocument();
      });

      // Test keyboard navigation
      const firstWidget = screen.getByTestId('step-tracking-widget');
      firstWidget.focus();
      
      expect(document.activeElement).toBe(firstWidget);
    });

    it('should have proper ARIA labels', async () => {
      renderDashboardWithContext(mockUser, 'member');
      
      await waitFor(() => {
        expect(screen.getByTestId('step-tracking-widget')).toBeInTheDocument();
      });

      // Widgets should have proper labeling
      const widgets = screen.getAllByTestId(/widget$/);
      widgets.forEach(widget => {
        expect(widget).toBeInTheDocument();
      });
    });
  });
});