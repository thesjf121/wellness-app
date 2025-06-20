import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockAuth } from '../../context/MockAuthContext';
import { ROUTES } from '../../utils/constants';

interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  stepCount: number;
  lastActive: Date;
  isOnline: boolean;
  streak: number;
}

interface GroupActivity {
  id: string;
  type: 'step_goal' | 'food_log' | 'training' | 'achievement' | 'joined';
  memberName: string;
  description: string;
  timestamp: Date;
  icon: string;
}

interface GroupActivityWidgetProps {
  showAdminView?: boolean;
  compact?: boolean;
}

const GroupActivityWidget: React.FC<GroupActivityWidgetProps> = ({ 
  showAdminView = false, 
  compact = false 
}) => {
  const navigate = useNavigate();
  const { user } = useMockAuth();
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [recentActivity, setRecentActivity] = useState<GroupActivity[]>([]);
  const [isInGroup, setIsInGroup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroupData();
  }, []);

  const loadGroupData = () => {
    setLoading(true);
    
    // Check if user is in a group or has created one
    const groupsData = localStorage.getItem('user_groups');
    const userGroups = groupsData ? JSON.parse(groupsData) : [];
    const userHasGroup = userGroups.length > 0;
    
    setIsInGroup(userHasGroup);
    
    if (userHasGroup) {
      // Generate mock group members
      const mockMembers: GroupMember[] = [
        {
          id: '1',
          name: 'Alex Chen',
          stepCount: 8432,
          lastActive: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
          isOnline: true,
          streak: 5
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          stepCount: 12156,
          lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          isOnline: false,
          streak: 12
        },
        {
          id: '3',
          name: 'Mike Rodriguez',
          stepCount: 6543,
          lastActive: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
          isOnline: true,
          streak: 3
        },
        {
          id: '4',
          name: 'Emily Davis',
          stepCount: 9876,
          lastActive: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          isOnline: false,
          streak: 8
        },
        {
          id: '5',
          name: user?.firstName || 'You',
          stepCount: Math.floor(Math.random() * 5000) + 5000,
          lastActive: new Date(),
          isOnline: true,
          streak: 7
        }
      ];
      
      setGroupMembers(mockMembers);
      
      // Generate recent activity
      const activities: GroupActivity[] = [
        {
          id: '1',
          type: 'step_goal',
          memberName: 'Sarah Johnson',
          description: 'reached her daily step goal!',
          timestamp: new Date(Date.now() - 1000 * 60 * 45),
          icon: '🎯'
        },
        {
          id: '2',
          type: 'food_log',
          memberName: 'Alex Chen',
          description: 'logged a healthy breakfast',
          timestamp: new Date(Date.now() - 1000 * 60 * 90),
          icon: '🥗'
        },
        {
          id: '3',
          type: 'training',
          memberName: 'Mike Rodriguez',
          description: 'completed Module 3: Nutrition',
          timestamp: new Date(Date.now() - 1000 * 60 * 120),
          icon: '🎓'
        },
        {
          id: '4',
          type: 'achievement',
          memberName: 'Emily Davis',
          description: 'achieved a 7-day streak!',
          timestamp: new Date(Date.now() - 1000 * 60 * 180),
          icon: '🔥'
        },
        {
          id: '5',
          type: 'joined',
          memberName: 'Jordan Kim',
          description: 'joined the group',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
          icon: '👋'
        }
      ];
      
      setRecentActivity(activities);
    }
    
    setLoading(false);
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'step_goal': return 'text-blue-600';
      case 'food_log': return 'text-green-600';
      case 'training': return 'text-purple-600';
      case 'achievement': return 'text-orange-600';
      case 'joined': return 'text-indigo-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded w-5/6"></div>
            <div className="h-3 bg-gray-300 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isInGroup) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 text-lg">Group Activity</h3>
          <span className="text-2xl">👥</span>
        </div>
        
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-gray-400">👥</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">No Group Yet</h4>
          <p className="text-gray-600 text-sm mb-4">
            Complete your training and stay active for 7 days to create or join a wellness group.
          </p>
          <button
            onClick={() => navigate(ROUTES.GROUPS)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            Learn More About Groups
          </button>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm">Group Activity</h3>
          <span className="text-xl">👥</span>
        </div>
        
        <div className="space-y-2">
          {recentActivity.slice(0, 3).map(activity => (
            <div key={activity.id} className="flex items-center space-x-2">
              <span className="text-sm">{activity.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 truncate">
                  <span className="font-medium">{activity.memberName}</span> {activity.description}
                </p>
                <p className="text-xs text-gray-400">{getTimeAgo(activity.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
        
        <button
          onClick={() => navigate(ROUTES.GROUPS)}
          className="w-full mt-3 text-xs bg-blue-50 text-blue-700 py-2 px-3 rounded hover:bg-blue-100"
        >
          View Full Group
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6" data-tutorial="group-widget">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 text-lg">
          {showAdminView ? 'Group Management' : 'Group Activity'}
        </h3>
        <span className="text-2xl">👥</span>
      </div>

      {showAdminView && (
        <>
          {/* Group Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{groupMembers.length}</div>
              <div className="text-xs text-gray-500">Members</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                {groupMembers.filter(m => m.isOnline).length}
              </div>
              <div className="text-xs text-gray-500">Online</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">
                {Math.round(groupMembers.reduce((sum, m) => sum + m.stepCount, 0) / groupMembers.length).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Avg Steps</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">
                {Math.round(groupMembers.reduce((sum, m) => sum + m.streak, 0) / groupMembers.length)}
              </div>
              <div className="text-xs text-gray-500">Avg Streak</div>
            </div>
          </div>

          {/* Member List */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Group Members</h4>
            <div className="space-y-2">
              {groupMembers.slice(0, 5).map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      member.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{member.name}</p>
                      <p className="text-xs text-gray-500">
                        Last active {getTimeAgo(member.lastActive)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {member.stepCount.toLocaleString()} steps
                    </p>
                    <p className="text-xs text-orange-600">{member.streak} day streak</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Recent Activity */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
        <div className="space-y-3">
          {recentActivity.slice(0, showAdminView ? 8 : 6).map(activity => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <span className="text-lg">{activity.icon}</span>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className={`font-medium ${getActivityColor(activity.type)}`}>
                    {activity.memberName}
                  </span>{' '}
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {getTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-3">
        <button
          onClick={() => navigate(ROUTES.GROUPS)}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          View Full Group
        </button>
        {showAdminView && (
          <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 text-sm font-medium">
            Manage Members
          </button>
        )}
      </div>
    </div>
  );
};

export default GroupActivityWidget;