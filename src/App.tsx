import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MockAuthProvider } from './context/MockAuthContext';
import { Layout } from './components/layout/Layout';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import OnboardingManager from './components/welcome/OnboardingManager';
import { TutorialProvider } from './components/navigation/TutorialProvider';
import { ROUTES } from './utils/constants';

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
  return (
    <MockAuthProvider>
      <Router>
        <TutorialProvider autoStart={true}>
          <Layout>
            <Routes>
              <Route path={ROUTES.HOME} element={<HomePage />} />
              <Route path={ROUTES.LOGIN} element={<AuthPage mode="login" />} />
              <Route path={ROUTES.REGISTER} element={<AuthPage mode="register" />} />
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
              <Route path="*" element={<HomePage />} />
            </Routes>
          </Layout>
          <OnboardingManager autoStart={false} showSkipOption={true} />
          <OfflineIndicator />
        </TutorialProvider>
      </Router>
    </MockAuthProvider>
  );
}

export default App;