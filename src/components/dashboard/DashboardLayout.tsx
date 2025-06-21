import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { ROUTES } from '../../utils/constants';

// Import widgets
import StepTrendsWidget from './StepTrendsWidget';
import NutritionSummaryWidget from './NutritionSummaryWidget';
import TrainingProgressWidget from './TrainingProgressWidget';
import StreakCounterWidget from './StreakCounterWidget';
import GroupActivityWidget from './GroupActivityWidget';
import RecentActivityWidget from './RecentActivityWidget';

interface DashboardLayoutProps {
  layout?: 'member' | 'admin' | 'super_admin';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ layout }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  // Determine layout based on user role if not specified
  const effectiveLayout = layout || (
    user?.publicMetadata?.role === 'super_admin' ? 'super_admin' :
    user?.publicMetadata?.role === 'team_sponsor' ? 'admin' :
    'member'
  );

  if (!isSignedIn || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <p className="text-gray-500 mb-6">Please sign in to access your wellness dashboard and view your progress.</p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => navigate(ROUTES.LOGIN)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate(ROUTES.REGISTER)}
              className="border border-gray-300 hover:bg-gray-50 px-6 py-2 rounded-lg"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderMemberDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user.firstName}! 👋
            </h1>
            <p className="text-blue-100">
              Keep up the great work on your wellness journey
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">Day {Math.floor(Math.random() * 30) + 1}</div>
            <div className="text-blue-100 text-sm">of your journey</div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Quick Actions</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'overview' ? 'detailed' : 'overview')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {viewMode === 'overview' ? 'Detailed View' : 'Overview'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <button 
            onClick={() => navigate(ROUTES.FOOD_JOURNAL)}
            className="bg-green-50 hover:bg-green-100 text-green-700 py-3 px-4 rounded-lg text-left transition-colors"
          >
            <div className="flex items-center space-x-2">
              <span className="text-xl">🥗</span>
              <span className="text-sm font-medium">Log Food</span>
            </div>
          </button>
          <button 
            onClick={() => navigate(ROUTES.STEP_COUNTER)}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 px-4 rounded-lg text-left transition-colors"
          >
            <div className="flex items-center space-x-2">
              <span className="text-xl">👟</span>
              <span className="text-sm font-medium">View Steps</span>
            </div>
          </button>
          <button 
            onClick={() => navigate(ROUTES.TRAINING)}
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 py-3 px-4 rounded-lg text-left transition-colors"
          >
            <div className="flex items-center space-x-2">
              <span className="text-xl">🎓</span>
              <span className="text-sm font-medium">Continue Learning</span>
            </div>
          </button>
          <button 
            onClick={() => navigate(ROUTES.GROUPS)}
            className="bg-orange-50 hover:bg-orange-100 text-orange-700 py-3 px-4 rounded-lg text-left transition-colors"
          >
            <div className="flex items-center space-x-2">
              <span className="text-xl">👥</span>
              <span className="text-sm font-medium">View Groups</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Widgets Grid */}
      {viewMode === 'overview' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StepTrendsWidget compact={true} />
          <NutritionSummaryWidget compact={true} />
          <TrainingProgressWidget compact={true} />
          <StreakCounterWidget compact={true} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StepTrendsWidget compact={false} />
          <NutritionSummaryWidget compact={false} />
          <TrainingProgressWidget compact={false} />
          <StreakCounterWidget compact={false} />
        </div>
      )}

      {/* Additional Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GroupActivityWidget />
        <RecentActivityWidget />
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Team Sponsor Dashboard 👨‍💼
            </h1>
            <p className="text-green-100">
              Manage your wellness group and track member progress
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{Math.floor(Math.random() * 10) + 1}</div>
            <div className="text-green-100 text-sm">team members</div>
          </div>
        </div>
      </div>

      {/* Admin Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="font-semibold text-gray-900 mb-4">Group Management</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button 
            onClick={() => navigate(ROUTES.GROUPS)}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 px-4 rounded-lg text-left transition-colors"
          >
            <div className="flex items-center space-x-2">
              <span className="text-xl">👥</span>
              <span className="text-sm font-medium">Manage Group</span>
            </div>
          </button>
          <button 
            onClick={() => navigate('/admin/videos')}
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 py-3 px-4 rounded-lg text-left transition-colors"
          >
            <div className="flex items-center space-x-2">
              <span className="text-xl">🎥</span>
              <span className="text-sm font-medium">Upload Videos</span>
            </div>
          </button>
          <button 
            onClick={() => navigate(ROUTES.HELP)}
            className="bg-green-50 hover:bg-green-100 text-green-700 py-3 px-4 rounded-lg text-left transition-colors"
          >
            <div className="flex items-center space-x-2">
              <span className="text-xl">💬</span>
              <span className="text-sm font-medium">Support Tickets</span>
            </div>
          </button>
          <button className="bg-orange-50 hover:bg-orange-100 text-orange-700 py-3 px-4 rounded-lg text-left transition-colors">
            <div className="flex items-center space-x-2">
              <span className="text-xl">📊</span>
              <span className="text-sm font-medium">Analytics</span>
            </div>
          </button>
        </div>
      </div>

      {/* Personal Progress (Compact) */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Personal Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StepTrendsWidget compact={true} />
          <NutritionSummaryWidget compact={true} />
          <TrainingProgressWidget compact={true} />
          <StreakCounterWidget compact={true} />
        </div>
      </div>

      {/* Group Analytics */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Group Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GroupActivityWidget showAdminView={true} />
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-900 text-lg mb-4">Member Engagement</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Members</span>
                <span className="font-semibold text-green-600">8/10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg. Daily Steps</span>
                <span className="font-semibold text-blue-600">7,845</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Training Completion</span>
                <span className="font-semibold text-purple-600">65%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Group Goal Achievement</span>
                <span className="font-semibold text-orange-600">72%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuperAdminDashboard = () => (
    <div className="space-y-6">
      {/* Super Admin Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Super Admin Dashboard 🚀
            </h1>
            <p className="text-purple-100">
              Platform-wide analytics and management
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{Math.floor(Math.random() * 50) + 20}</div>
            <div className="text-purple-100 text-sm">total groups</div>
          </div>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-blue-600">{(Math.floor(Math.random() * 500) + 100).toLocaleString()}</p>
              <p className="text-xs text-gray-500">+{Math.floor(Math.random() * 20) + 5}% this month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏃</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-green-600">{Math.floor(Math.random() * 300) + 80}</p>
              <p className="text-xs text-gray-500">Last 7 days</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎓</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Training Completions</p>
              <p className="text-2xl font-bold text-purple-600">{Math.floor(Math.random() * 150) + 50}</p>
              <p className="text-xs text-gray-500">This month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Group Engagement</p>
              <p className="text-2xl font-bold text-orange-600">{Math.floor(Math.random() * 30) + 70}%</p>
              <p className="text-xs text-gray-500">Average across all groups</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Platform Management</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 px-4 rounded-lg text-left transition-colors">
            <div className="flex items-center space-x-2">
              <span className="text-xl">👥</span>
              <span className="text-sm font-medium">Manage Users</span>
            </div>
          </button>
          <button className="bg-green-50 hover:bg-green-100 text-green-700 py-3 px-4 rounded-lg text-left transition-colors">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🏢</span>
              <span className="text-sm font-medium">Manage Groups</span>
            </div>
          </button>
          <button className="bg-purple-50 hover:bg-purple-100 text-purple-700 py-3 px-4 rounded-lg text-left transition-colors">
            <div className="flex items-center space-x-2">
              <span className="text-xl">📊</span>
              <span className="text-sm font-medium">Analytics</span>
            </div>
          </button>
          <button className="bg-red-50 hover:bg-red-100 text-red-700 py-3 px-4 rounded-lg text-left transition-colors">
            <div className="flex items-center space-x-2">
              <span className="text-xl">⚙️</span>
              <span className="text-sm font-medium">System Settings</span>
            </div>
          </button>
        </div>
      </div>

      {/* Personal Dashboard (if super admin also participates) */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Personal Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StepTrendsWidget compact={true} />
          <NutritionSummaryWidget compact={true} />
          <TrainingProgressWidget compact={true} />
          <StreakCounterWidget compact={true} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {effectiveLayout === 'member' && renderMemberDashboard()}
      {effectiveLayout === 'admin' && renderAdminDashboard()}
      {effectiveLayout === 'super_admin' && renderSuperAdminDashboard()}
    </div>
  );
};

export default DashboardLayout;