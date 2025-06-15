import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { Layout } from './components/layout/Layout';
import { ROUTES } from './utils/constants';

// Page components (to be created)
import HomePage from './pages/HomePage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AuthPage from './pages/auth/AuthPage';
import StepsPage from './pages/steps/StepsPage';

// Get Clerk publishable key from environment
const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key. Please add REACT_APP_CLERK_PUBLISHABLE_KEY to your environment variables.');
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey!}>
      <Router>
        <Layout>
          <Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.LOGIN} element={<AuthPage mode="login" />} />
            <Route path={ROUTES.REGISTER} element={<AuthPage mode="register" />} />
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.STEP_COUNTER} element={<StepsPage />} />
            {/* Add more routes as components are created */}
          </Routes>
        </Layout>
      </Router>
    </ClerkProvider>
  );
}

export default App;