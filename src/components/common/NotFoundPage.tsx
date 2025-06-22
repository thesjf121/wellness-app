import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { WellnessCard, CardContent } from '../ui/WellnessCard';
import { ROUTES } from '../../utils/constants';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn, isLoaded } = useAuth();
  const [countdown, setCountdown] = useState(5);

  // Auto-redirect logic
  useEffect(() => {
    if (!isLoaded) return; // Wait for auth to load

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Redirect based on auth status
          if (isSignedIn) {
            navigate(ROUTES.DASHBOARD);
          } else {
            navigate(ROUTES.HOME);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, isSignedIn, isLoaded]);

  const isAuthenticatedRoute = () => {
    const authRoutes = [
      ROUTES.DASHBOARD,
      ROUTES.STEP_COUNTER,
      ROUTES.FOOD_JOURNAL,
      ROUTES.TRAINING,
      ROUTES.GROUPS,
      ROUTES.PROFILE
    ];
    return authRoutes.some(route => location.pathname.startsWith(route));
  };

  const handleQuickNavigation = (route: string) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        <WellnessCard className="text-center">
          <CardContent className="p-8">
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <span className="text-4xl">🔍</span>
            </motion.div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
            
            {/* Description */}
            <p className="text-gray-600 mb-6">
              {isAuthenticatedRoute() && !isSignedIn 
                ? "This page requires authentication. Please sign in to continue."
                : "Sorry, we couldn't find the page you're looking for."
              }
            </p>

            {/* Current URL Debug Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-700">
                <strong>Current URL:</strong> <code className="bg-gray-200 px-2 py-1 rounded text-xs">{location.pathname}</code>
              </p>
              <p className="text-sm text-gray-700 mt-2">
                <strong>Auth Status:</strong> {isLoaded ? (isSignedIn ? 'Signed In' : 'Not Signed In') : 'Loading...'}
              </p>
            </div>

            {/* Auto-redirect notice */}
            {countdown > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
              >
                <p className="text-blue-800 text-sm">
                  Redirecting to {isSignedIn ? 'Dashboard' : 'Home'} in {countdown} seconds...
                </p>
              </motion.div>
            )}

            {/* Quick Navigation */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <motion.button
                  onClick={() => handleQuickNavigation(ROUTES.HOME)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  🏠 Go Home
                </motion.button>
                
                {isSignedIn ? (
                  <motion.button
                    onClick={() => handleQuickNavigation(ROUTES.DASHBOARD)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    📊 Dashboard
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={() => handleQuickNavigation(ROUTES.LOGIN)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    🔐 Sign In
                  </motion.button>
                )}
              </div>

              {/* Go Back Button */}
              <motion.button
                onClick={() => window.history.back()}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                ← Go Back
              </motion.button>
            </div>

            {/* Help Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">Popular Pages:</p>
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                <button onClick={() => handleQuickNavigation(ROUTES.HOME)} className="text-blue-600 hover:text-blue-800">Home</button>
                <span className="text-gray-300">•</span>
                <button onClick={() => handleQuickNavigation(ROUTES.WELCOME)} className="text-blue-600 hover:text-blue-800">Welcome</button>
                <span className="text-gray-300">•</span>
                <button onClick={() => handleQuickNavigation(ROUTES.HELP)} className="text-blue-600 hover:text-blue-800">Help</button>
                {isSignedIn && (
                  <>
                    <span className="text-gray-300">•</span>
                    <button onClick={() => handleQuickNavigation(ROUTES.STEP_COUNTER)} className="text-blue-600 hover:text-blue-800">Steps</button>
                    <span className="text-gray-300">•</span>
                    <button onClick={() => handleQuickNavigation(ROUTES.FOOD_JOURNAL)} className="text-blue-600 hover:text-blue-800">Food</button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </WellnessCard>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;