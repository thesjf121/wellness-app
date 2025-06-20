import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { Layout } from './components/layout/Layout';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import OnboardingManager from './components/welcome/OnboardingManager';
import { TutorialProvider } from './components/navigation/TutorialProvider';
import { ROUTES } from './utils/constants';
import { ClerkErrorBoundary } from './components/auth/ClerkErrorBoundary';
import { environmentService } from './config/environment';

// Import all page components
import HomePage from './pages/HomePage';
import AuthPage from './pages/auth/AuthPage';
import OnboardingPage from './pages/onboarding/OnboardingPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import StepsPage from './pages/steps/StepsPage';
import FoodJournalPage from './pages/food/FoodJournalPage';
import TrainingPage from './pages/training/TrainingPage';
import GroupsPage from './pages/groups/GroupsPage';
import ProfilePage from './pages/profile/ProfilePage';
import SessionsPage from './pages/profile/SessionsPage';
import WelcomePage from './pages/welcome/WelcomePage';
import HelpPage from './pages/welcome/HelpPage';
import VideoManagerPage from './pages/admin/VideoManagerPage';
import GoalSettingWizard from './components/welcome/GoalSettingWizard';
import NotificationSetup from './components/welcome/NotificationSetup';

function App() {
  // Get Clerk publishable key from environment service
  const clerkPublishableKey = environmentService.get('clerkPublishableKey');

  // Log configuration in development
  if (environmentService.isDevelopment()) {
    environmentService.logConfiguration();
  }

  return (
    <ClerkErrorBoundary>
      <ClerkProvider 
        publishableKey={clerkPublishableKey}
      >
        <Router>
          <TutorialProvider autoStart={true}>
            <Layout>
              <Routes>
                <Route path={ROUTES.HOME} element={<HomePage />} />
                <Route path={ROUTES.LOGIN} element={<AuthPage mode="login" />} />
                <Route path={ROUTES.REGISTER} element={<AuthPage mode="register" />} />
                <Route path="/sign-in" element={<AuthPage mode="login" />} />
                <Route path="/sign-up" element={<AuthPage mode="register" />} />
                <Route path={ROUTES.ONBOARDING} element={<OnboardingPage />} />
                <Route path={ROUTES.WELCOME} element={<WelcomePage />} />
                <Route path="/welcome/goals" element={<GoalSettingWizard />} />
                <Route path="/welcome/notifications" element={<NotificationSetup />} />
                <Route path={ROUTES.HELP} element={<HelpPage />} />
                <Route path={ROUTES.ADMIN_VIDEOS} element={<VideoManagerPage />} />
                <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
                <Route path={ROUTES.STEP_COUNTER} element={<StepsPage />} />
                <Route path={ROUTES.FOOD_JOURNAL} element={<FoodJournalPage />} />
                <Route path={ROUTES.TRAINING} element={<TrainingPage />} />
                <Route path="/training/:moduleId" element={<TrainingPage />} />
                <Route path={ROUTES.GROUPS} element={<GroupsPage />} />
                <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
                <Route path={`${ROUTES.PROFILE}/sessions`} element={<SessionsPage />} />
                <Route path="*" element={
                  <div className="p-8 max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold mb-4">404 - Route Not Found</h1>
                    <p className="mb-2"><strong>Current URL:</strong> {window.location.pathname}</p>
                    <p className="mb-4"><strong>Available routes:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>/login (AuthPage with mode=login)</li>
                      <li>/register (AuthPage with mode=register)</li>
                      <li>/sign-in (AuthPage with mode=login)</li>
                      <li>/sign-up (AuthPage with mode=register)</li>
                      <li>/dashboard</li>
                      <li>/</li>
                    </ul>
                  </div>
                } />
              </Routes>
            </Layout>
            <OnboardingManager autoStart={false} showSkipOption={true} />
            <OfflineIndicator />
          </TutorialProvider>
        </Router>
      </ClerkProvider>
    </ClerkErrorBoundary>
  );
}

export default App;