import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { Layout } from './components/layout/Layout';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import ScrollToTop from './components/ui/ScrollToTop';
import NotFoundPage from './components/common/NotFoundPage';
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
import NutritionDashboardPage from './pages/food/NutritionDashboardPage';
import TrainingPage from './pages/training/TrainingPage';
import CoachingPage from './pages/coaching/CoachingPage';
import CourseOverviewPage from './pages/coaching/CourseOverviewPage';
import Module1Page from './pages/coaching/modules/Module1Page';
import Module2Page from './pages/coaching/modules/Module2Page';
import Module3Page from './pages/coaching/modules/Module3Page';
import Module4Page from './pages/coaching/modules/Module4Page';
import Module5Page from './pages/coaching/modules/Module5Page';
import Module6Page from './pages/coaching/modules/Module6Page';
import Module7Page from './pages/coaching/modules/Module7Page';
import Module8Page from './pages/coaching/modules/Module8Page';
import GroupsPage from './pages/groups/GroupsPage';
import ProfilePage from './pages/profile/ProfilePage';
import SessionsPage from './pages/profile/SessionsPage';
import WelcomePage from './pages/welcome/WelcomePage';
import HelpPage from './pages/welcome/HelpPage';
import VideoManagerPage from './pages/admin/VideoManagerPage';
import GoalSettingWizard from './components/welcome/GoalSettingWizard';
import NotificationSetup from './components/welcome/NotificationSetup';
import MobileCardDemo from './components/ui/cards/MobileCardDemo';

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
          <ScrollToTop />
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
                <Route path="/card-demo" element={<MobileCardDemo />} />
                <Route path={ROUTES.ADMIN_VIDEOS} element={<VideoManagerPage />} />
                <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
                <Route path={ROUTES.STEP_COUNTER} element={<StepsPage />} />
                <Route path={ROUTES.FOOD_JOURNAL} element={<FoodJournalPage />} />
                <Route path={ROUTES.NUTRITION_ANALYSIS} element={<NutritionDashboardPage />} />
                <Route path={ROUTES.TRAINING} element={<TrainingPage />} />
                <Route path="/training/:moduleId" element={<TrainingPage />} />
                <Route path={ROUTES.COACHING} element={<CoachingPage />} />
                <Route path="/coaching/overview" element={<CourseOverviewPage />} />
                <Route path="/coaching/module/1" element={<Module1Page />} />
                <Route path="/coaching/module/2" element={<Module2Page />} />
                <Route path="/coaching/module/3" element={<Module3Page />} />
                <Route path="/coaching/module/4" element={<Module4Page />} />
                <Route path="/coaching/module/5" element={<Module5Page />} />
                <Route path="/coaching/module/6" element={<Module6Page />} />
                <Route path="/coaching/module/7" element={<Module7Page />} />
                <Route path="/coaching/module/8" element={<Module8Page />} />
                <Route path={ROUTES.GROUPS} element={<GroupsPage />} />
                <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
                <Route path={`${ROUTES.PROFILE}/sessions`} element={<SessionsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Layout>
            {/* <OnboardingManager autoStart={false} showSkipOption={true} /> */}
            <OfflineIndicator />
          </TutorialProvider>
        </Router>
      </ClerkProvider>
    </ClerkErrorBoundary>
  );
}

export default App;