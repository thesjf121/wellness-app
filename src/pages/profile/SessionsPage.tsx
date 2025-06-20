import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { sessionService, SessionInfo } from '../../services/sessionService';

const SessionsPage: React.FC = () => {
  const { user } = useUser();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const currentSession = sessionService.getCurrentSession();
      if (currentSession) {
        setCurrentSessionId(currentSession.id);
      }
      
      const userSessions = sessionService.getUserSessions(user.id);
      setSessions(userSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    if (window.confirm('Are you sure you want to end this session?')) {
      sessionService.revokeSession(sessionId);
      loadSessions();
      
      if (sessionId === currentSessionId) {
        // If revoking current session, redirect to login
        window.location.href = '/login';
      }
    }
  };

  const handleRevokeAllOther = () => {
    if (!user) return;
    
    if (window.confirm('Are you sure you want to end all other sessions? You will remain signed in on this device.')) {
      sessionService.revokeOtherSessions(user.id);
      loadSessions();
      alert('All other sessions have been ended.');
    }
  };

  const getDeviceIcon = (platform: string) => {
    const lowerPlatform = platform.toLowerCase();
    if (lowerPlatform.includes('win')) return '💻';
    if (lowerPlatform.includes('mac')) return '🖥️';
    if (lowerPlatform.includes('iphone') || lowerPlatform.includes('ipad')) return '📱';
    if (lowerPlatform.includes('android')) return '📱';
    if (lowerPlatform.includes('linux')) return '🐧';
    return '🖥️';
  };

  const getBrowserName = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown Browser';
  };

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const lastActive = new Date(date);
    const diffMs = now.getTime() - lastActive.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Active now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 30) return `${diffDays} days ago`;
    return lastActive.toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-500">Please sign in to view your sessions.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Active Sessions</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your active sessions across all devices
              </p>
            </div>
            {sessions.filter(s => s.isActive).length > 1 && (
              <button
                onClick={handleRevokeAllOther}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                End All Other Sessions
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No active sessions found.</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`border rounded-lg p-4 ${
                    session.id === currentSessionId
                      ? 'border-blue-500 bg-blue-50'
                      : session.isActive
                      ? 'border-gray-200'
                      : 'border-gray-200 bg-gray-50 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">
                        {getDeviceIcon(session.deviceInfo.platform)}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">
                            {getBrowserName(session.deviceInfo.userAgent)} on {session.deviceInfo.platform}
                          </h3>
                          {session.id === currentSessionId && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Current
                            </span>
                          )}
                          {!session.isActive && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              Expired
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-1 text-sm text-gray-600 space-y-1">
                          <p>
                            Last active: {formatLastActive(session.lastActiveAt)}
                          </p>
                          <p>
                            Started: {new Date(session.startedAt).toLocaleString()}
                          </p>
                          {session.location && (
                            <p>
                              Location: {session.location.city}, {session.location.country}
                            </p>
                          )}
                          <p className="text-xs">
                            Session ID: {session.id.slice(0, 20)}...
                          </p>
                        </div>
                      </div>
                    </div>

                    {session.isActive && session.id !== currentSessionId && (
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        End Session
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Security Tips */}
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Security Tips</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Review your active sessions regularly</li>
              <li>• End any sessions you don't recognize</li>
              <li>• Sign out when using shared or public computers</li>
              <li>• Enable two-factor authentication for added security</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionsPage;