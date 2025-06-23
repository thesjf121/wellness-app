import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { ROUTES } from '../../utils/constants';
import { sessionService } from '../../services/sessionService';
import { getUserRole, getUserDisplayName, isAdmin } from '../../utils/clerkHelpers';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  

  const navItems = [
    { name: 'Home', path: ROUTES.HOME },
    { name: 'Welcome', path: ROUTES.WELCOME },
    { name: 'Dashboard', path: ROUTES.DASHBOARD, requiresAuth: true },
    { name: 'Steps', path: ROUTES.STEP_COUNTER, requiresAuth: true },
    { name: 'Food', path: ROUTES.FOOD_JOURNAL, requiresAuth: true },
    { name: 'Training', path: ROUTES.TRAINING, requiresAuth: true },
    { name: 'Coaching', path: ROUTES.COACHING },
    { name: 'Groups', path: ROUTES.GROUPS, requiresAuth: true },
    { name: 'Help', path: ROUTES.HELP },
  ];

  const adminItems = [
    { name: 'Video Manager', path: ROUTES.ADMIN_VIDEOS, requiresRole: ['super_admin', 'team_sponsor'] },
  ];

  // Initialize session management when user signs in
  useEffect(() => {
    if (isSignedIn && user) {
      sessionService.initialize(user.id);
      sessionService.updateActivity('page_view', { path: location.pathname });
    } else if (!isSignedIn) {
      sessionService.clearAllData();
    }
  }, [isSignedIn, user]);

  // Update activity on route changes
  useEffect(() => {
    if (isSignedIn) {
      sessionService.updateActivity('page_view', { path: location.pathname });
    }
  }, [location.pathname, isSignedIn]);

  const handleSignOut = () => {
    if (user) {
      sessionService.updateActivity('user_logout');
    }
    sessionService.clearAllData();
    signOut();
    navigate(ROUTES.HOME);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                onClick={() => navigate(ROUTES.HOME)}
                className="flex flex-col items-start group"
              >
                <span className="text-2xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
                  WellnessApp
                </span>
                <span className="text-xs text-gray-400 group-hover:text-gray-500 transition-colors tracking-wide">
                  powered by CalerieLife
                </span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex space-x-6" data-tutorial="nav-menu">
                {navItems.map((item) => {
                  // Hide auth-required items if not signed in
                  if (item.requiresAuth && !isSignedIn) return null;
                  
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        location.pathname === item.path
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </nav>

              {/* Admin Controls */}
              {isSignedIn && isAdmin(user) && (
                <div className="hidden md:flex space-x-2">
                  {adminItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              )}


              {/* Auth Controls */}
              <div className="flex items-center space-x-3">
                {isSignedIn ? (
                  <>
                    <button
                      onClick={() => navigate(ROUTES.PROFILE)}
                      className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Hi, {getUserDisplayName(user)}!
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate(ROUTES.LOGIN)}
                      className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => navigate(ROUTES.REGISTER)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {title && (
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          </div>
        )}
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 WellnessApp. Creating wellness through movement, nutrition, and social connection.
          </p>
        </div>
      </footer>
    </div>
  );
};