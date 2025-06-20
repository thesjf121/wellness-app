import React, { useState, useEffect } from 'react';
import { 
  superAdminService, 
  SystemOverview, 
  GroupOverview, 
  UserOverview, 
  SystemAlert 
} from '../../services/superAdminService';
import { GroupAnalytics } from './GroupAnalytics';
import { errorService } from '../../services/errorService';

interface SuperAdminDashboardProps {
  adminUserId: string;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ adminUserId }) => {
  const [systemOverview, setSystemOverview] = useState<SystemOverview | null>(null);
  const [groupOverviews, setGroupOverviews] = useState<GroupOverview[]>([]);
  const [userOverviews, setUserOverviews] = useState<UserOverview[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'groups' | 'users' | 'alerts'>('overview');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overview, groups, users, alerts] = await Promise.all([
        superAdminService.getSystemOverview(),
        superAdminService.getAllGroupsOverview(),
        superAdminService.getAllUsersOverview(),
        superAdminService.getSystemAlerts()
      ]);

      setSystemOverview(overview);
      setGroupOverviews(groups);
      setUserOverviews(users);
      setSystemAlerts(alerts);
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'SuperAdminDashboard.loadDashboardData',
        adminUserId
      });
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await superAdminService.resolveAlert(alertId, adminUserId);
      await loadDashboardData(); // Refresh data
    } catch (error) {
      alert('Failed to resolve alert: ' + (error as Error).message);
    }
  };

  const handleForceDeleteGroup = async (groupId: string, groupName: string) => {
    const reason = prompt(`Enter reason for deleting "${groupName}":`);
    if (!reason) return;

    if (!confirm(`Are you sure you want to permanently delete "${groupName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await superAdminService.forceDeleteGroup(groupId, adminUserId, reason);
      await loadDashboardData(); // Refresh data
      alert('Group deleted successfully');
    } catch (error) {
      alert('Failed to delete group: ' + (error as Error).message);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    const reason = prompt(`Enter reason for suspending user ${userId.slice(-8)}:`);
    if (!reason) return;

    const durationStr = prompt('Enter suspension duration in days (leave empty for permanent):');
    const duration = durationStr ? parseInt(durationStr) : undefined;

    if (!confirm(`Are you sure you want to suspend user ${userId.slice(-8)}?`)) {
      return;
    }

    try {
      await superAdminService.suspendUser(userId, adminUserId, reason, duration);
      await loadDashboardData(); // Refresh data
      alert('User suspended successfully');
    } catch (error) {
      alert('Failed to suspend user: ' + (error as Error).message);
    }
  };

  const getHealthColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 30) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'thriving': return 'text-green-600 bg-green-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'declining': return 'text-orange-600 bg-orange-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'text-red-800 bg-red-100 border-red-200';
      case 'high': return 'text-red-700 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-700 bg-blue-50 border-blue-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading super admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800">Dashboard Error</h3>
        <p className="text-red-700 mt-2">{error}</p>
        <button
          onClick={loadDashboardData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600">System-wide oversight and management</p>
        </div>
        <button
          onClick={loadDashboardData}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          🔄 Refresh Data
        </button>
      </div>

      {/* System Health Alert */}
      {systemOverview && systemOverview.systemHealth === 'poor' && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                ⚠️ <strong>System Health Warning:</strong> The system health is currently poor. 
                Member retention is at {systemOverview.memberRetentionRate}% and only {systemOverview.activeGroups} 
                of {systemOverview.totalGroups} groups are active.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'System Overview', icon: '🏠' },
            { id: 'groups', label: 'Groups', icon: '👥' },
            { id: 'users', label: 'Users', icon: '👤' },
            { id: 'alerts', label: `Alerts (${systemAlerts.length})`, icon: '🚨' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && systemOverview && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">👥</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Groups</dt>
                    <dd className="text-lg font-medium text-gray-900">{systemOverview.totalGroups}</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="text-green-600">+{systemOverview.recentlyCreatedGroups}</span>
                  <span className="ml-1">this week</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">👤</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Members</dt>
                    <dd className="text-lg font-medium text-gray-900">{systemOverview.totalMembers}</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span>{systemOverview.memberRetentionRate}%</span>
                  <span className="ml-1">retention rate</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">⚡</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Groups</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {systemOverview.activeGroups}/{systemOverview.totalGroups}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span>{Math.round((systemOverview.activeGroups / Math.max(1, systemOverview.totalGroups)) * 100)}%</span>
                  <span className="ml-1">activity rate</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">❤️</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">System Health</dt>
                    <dd className={`text-lg font-medium capitalize ${
                      systemOverview.systemHealth === 'excellent' ? 'text-green-600' :
                      systemOverview.systemHealth === 'good' ? 'text-blue-600' :
                      systemOverview.systemHealth === 'fair' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {systemOverview.systemHealth}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">📊 Activity Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Messages</span>
                  <span className="text-sm font-medium">{systemOverview.totalMessages.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Achievements</span>
                  <span className="text-sm font-medium">{systemOverview.totalAchievements.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Group Size</span>
                  <span className="text-sm font-medium">{systemOverview.averageGroupSize} members</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">🏆 Most Active Group</h3>
              {systemOverview.mostActiveGroup ? (
                <div>
                  <p className="text-sm font-medium text-gray-900">{systemOverview.mostActiveGroup.groupName}</p>
                  <p className="text-sm text-gray-600">Activity Score: {systemOverview.mostActiveGroup.activityScore}</p>
                  <button
                    onClick={() => {
                      setSelectedGroup(systemOverview.mostActiveGroup!.groupId);
                      setActiveTab('groups');
                    }}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    View Details →
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No active groups</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">🚨 System Alerts</h3>
              <div className="space-y-2">
                {systemAlerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="text-xs">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      alert.severity === 'critical' ? 'bg-red-500' :
                      alert.severity === 'high' ? 'bg-orange-500' :
                      alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></span>
                    <span className="text-gray-700">{alert.title}</span>
                  </div>
                ))}
                {systemAlerts.length > 3 && (
                  <button
                    onClick={() => setActiveTab('alerts')}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    View all {systemAlerts.length} alerts →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Groups Tab */}
      {activeTab === 'groups' && (
        <div className="space-y-6">
          {selectedGroup ? (
            <div>
              <button
                onClick={() => setSelectedGroup(null)}
                className="mb-4 text-blue-600 hover:text-blue-800 text-sm"
              >
                ← Back to Groups List
              </button>
              <GroupAnalytics groupId={selectedGroup} isSponsor={true} />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">All Groups ({groupOverviews.length})</h2>
              </div>

              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {groupOverviews.map((overview) => (
                    <li key={overview.group.id}>
                      <div className="px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(overview.status)}`}>
                              {overview.status}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{overview.group.name}</p>
                            <p className="text-sm text-gray-500">{overview.group.description}</p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                              <span>👥 {overview.memberCount}/{overview.group.maxMembers}</span>
                              <span>⚡ {overview.activeMembers} active</span>
                              <span>🏆 {overview.achievementCount} achievements</span>
                              <span>💬 {overview.messageCount} messages</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getHealthColor(overview.healthScore)}`}>
                              Health: {overview.healthScore}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Last active: {formatTimeAgo(overview.lastActivity)}
                            </p>
                          </div>

                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => setSelectedGroup(overview.group.id)}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                            >
                              View Analytics
                            </button>
                            {overview.flags.length > 0 && (
                              <button
                                onClick={() => handleForceDeleteGroup(overview.group.id, overview.group.name)}
                                className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                              >
                                Force Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {overview.flags.length > 0 && (
                        <div className="px-4 pb-3">
                          <div className="flex flex-wrap gap-1">
                            {overview.flags.map((flag, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800">
                                ⚠️ {flag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">All Users ({userOverviews.length})</h2>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {userOverviews.map((user) => (
                <li key={user.userId} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <span className={`w-3 h-3 rounded-full inline-block ${user.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">User {user.userId.slice(-8)}</p>
                        <p className="text-sm text-gray-500">
                          {user.totalGroups} groups • {user.sponsoredGroups} as sponsor • {user.totalAchievements} achievements
                        </p>
                        <p className="text-xs text-gray-500">
                          Last seen: {formatTimeAgo(user.lastSeen)} • Activity: {user.activityScore}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {user.flags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {user.flags.map((flag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800">
                              ⚠️ {flag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {(user.flags.includes('Inactive sponsor') || user.flags.includes('Too many groups')) && (
                        <button
                          onClick={() => handleSuspendUser(user.userId)}
                          className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  </div>

                  {user.groupMemberships.length > 0 && (
                    <div className="mt-3 ml-7">
                      <div className="text-xs text-gray-600">
                        <strong>Groups:</strong> {user.groupMemberships.map(gm => 
                          `${gm.groupName} (${gm.role}${gm.isActive ? ', active' : ', inactive'})`
                        ).join(', ')}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">System Alerts ({systemAlerts.length})</h2>
          </div>

          {systemAlerts.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">✅</span>
              <h3 className="text-lg font-medium text-gray-900">No Active Alerts</h3>
              <p className="text-gray-500">The system is running smoothly with no issues detected.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {systemAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium">{alert.title}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(alert.createdAt).toLocaleString()}
                        {alert.groupId && ` • Group: ${alert.groupId.slice(-8)}`}
                        {alert.userId && ` • User: ${alert.userId.slice(-8)}`}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="ml-4 text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;