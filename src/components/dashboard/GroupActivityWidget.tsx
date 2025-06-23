import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { ROUTES } from '../../utils/constants';
import { groupService } from '../../services/groupService';
import { groupActivityFeedService } from '../../services/groupActivityFeedService';
import { Group, GroupMember, GroupActivity } from '../../types/groups';
import { getUsernameOrDisplayName } from '../../utils/clerkHelpers';

interface GroupActivityWidgetProps {
  showAdminView?: boolean;
  compact?: boolean;
}

const GroupActivityWidget: React.FC<GroupActivityWidgetProps> = ({ 
  showAdminView = false, 
  compact = false 
}) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [recentActivity, setRecentActivity] = useState<GroupActivity[]>([]);
  const [isInGroup, setIsInGroup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroupData();
  }, []);

  const loadGroupData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get user's groups
      const groups = await groupService.getUserGroups(user.id);
      setUserGroups(groups);
      setIsInGroup(groups.length > 0);
      
      if (groups.length > 0) {
        // Get members from the first group (or all groups if user is super admin)
        const primaryGroup = groups[0];
        const members = await groupService.getGroupMembers(primaryGroup.id);
        setGroupMembers(members);
        
        // Get recent activity for the group
        const activities = await groupActivityFeedService.getGroupFeedActivities(primaryGroup.id, 10);
        // Convert GroupFeedActivity to GroupActivity format
        const convertedActivities: GroupActivity[] = activities.map(activity => {
          let activityType: GroupActivity['activityType'];
          switch (activity.activityType) {
            case 'steps_milestone':
              activityType = 'goal_reached';
              break;
            case 'food_streak':
              activityType = 'milestone_hit';
              break;
            case 'training_complete':
              activityType = 'challenge_completed';
              break;
            case 'member_joined':
              activityType = 'member_joined';
              break;
            default:
              activityType = 'achievement_earned';
          }
          
          return {
            id: activity.id,
            groupId: activity.groupId,
            userId: activity.userId,
            activityType,
            content: activity.description,
            metadata: {
              achievement: undefined,
              milestone: undefined,
              stats: activity.metadata
            },
            createdAt: activity.createdAt,
            reactions: []
          };
        });
        setRecentActivity(convertedActivities);
      }
    } catch (error) {
      console.error('Error loading group data:', error);
      // Fallback to checking localStorage for basic group status
      const groupsData = localStorage.getItem('user_groups');
      const localGroups = groupsData ? JSON.parse(groupsData) : [];
      setIsInGroup(localGroups.length > 0);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date: Date | string) => {
    const now = new Date();
    const targetDate = new Date(date);
    
    // Check if date is valid
    if (isNaN(targetDate.getTime())) {
      return 'unknown';
    }
    
    const diffMs = now.getTime() - targetDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const isRecentlyActive = (lastActiveAt: Date | string) => {
    const now = new Date();
    const lastActive = new Date(lastActiveAt);
    
    // Check if date is valid
    if (isNaN(lastActive.getTime())) {
      return false;
    }
    
    const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
    return diffHours < 24; // Active if last seen within 24 hours
  };

  const getMemberDisplayName = async (userId: string) => {
    // Try to get user name from Clerk or fallback to userId
    return `Member ${userId.slice(-4)}`; // Show last 4 chars of user ID as fallback
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'member_joined': return 'text-indigo-600';
      case 'achievement_earned': return 'text-orange-600';
      case 'goal_reached': return 'text-blue-600';
      case 'milestone_hit': return 'text-green-600';
      case 'challenge_completed': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'member_joined': return '👋';
      case 'achievement_earned': return '🏆';
      case 'goal_reached': return '🎯';
      case 'milestone_hit': return '🎉';
      case 'challenge_completed': return '💪';
      default: return '📈';
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
          {recentActivity && recentActivity.length > 0 ? recentActivity.slice(0, 3).map(activity => (
            <div key={activity.id} className="flex items-center space-x-2">
              <span className="text-sm">{getActivityIcon(activity.activityType)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 truncate">
                  <span className="font-medium">{getUsernameOrDisplayName(activity.userId)}</span> {activity.content}
                </p>
                <p className="text-xs text-gray-400">{getTimeAgo(activity.createdAt)}</p>
              </div>
            </div>
          )) : (
            <div className="text-center py-4 text-gray-500">
              <p className="text-xs">No activity yet</p>
            </div>
          )}
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
                {groupMembers.filter(m => m.activityStats?.last7DaysActive || isRecentlyActive(m.lastActiveAt)).length}
              </div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">
                {groupMembers.length > 0 ? Math.round(groupMembers.reduce((sum, m) => sum + (m.activityStats?.totalStepsLogged || 0), 0) / groupMembers.length).toLocaleString() : '0'}
              </div>
              <div className="text-xs text-gray-500">Avg Steps</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">
                {groupMembers.length > 0 ? Math.round(groupMembers.reduce((sum, m) => sum + (m.activityStats?.weeklyStreaks?.currentStreak || 0), 0) / groupMembers.length) : 0}
              </div>
              <div className="text-xs text-gray-500">Avg Streak</div>
            </div>
          </div>

          {/* Member List */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Group Members</h4>
            <div className="space-y-2">
              {groupMembers.slice(0, 5).map(member => {
                const isActive = member.activityStats?.last7DaysActive || isRecentlyActive(member.lastActiveAt);
                const displayName = member.userId === user?.id ? 'You' : getUsernameOrDisplayName(member.userId);
                return (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {displayName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{displayName}</p>
                        <p className="text-xs text-gray-500">
                          Last active {getTimeAgo(member.lastActiveAt)}
                        </p>
                        <p className="text-xs text-blue-600">
                          {member.role === 'sponsor' ? '👑 Sponsor' : member.role === 'super_admin' ? '⚡ Admin' : '👤 Member'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {(member.activityStats?.totalStepsLogged || 0).toLocaleString()} steps
                      </p>
                      <p className="text-xs text-orange-600">
                        {member.activityStats?.weeklyStreaks?.currentStreak || 0} day streak
                      </p>
                      <p className="text-xs text-purple-600">
                        {member.activityStats?.trainingModulesCompleted || 0}/8 modules
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Recent Activity */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
        <div className="space-y-3">
          {recentActivity && recentActivity.length > 0 ? recentActivity.slice(0, showAdminView ? 8 : 6).map(activity => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <span className="text-lg">{getActivityIcon(activity.activityType)}</span>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className={`font-medium ${getActivityColor(activity.activityType)}`}>
                    {activity.userId === user?.id ? 'You' : getUsernameOrDisplayName(activity.userId)}
                  </span>{' '}
                  {activity.content}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {getTimeAgo(activity.createdAt)}
                </p>
                {activity.reactions && activity.reactions.length > 0 && (
                  <div className="flex space-x-1 mt-2">
                    {activity.reactions.slice(0, 3).map((reaction) => (
                      <span key={reaction.id} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {reaction.emoji}
                      </span>
                    ))}
                    {activity.reactions.length > 3 && (
                      <span className="text-xs text-gray-500">+{activity.reactions.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No recent activity to show</p>
              <p className="text-xs mt-1">Member activity will appear here</p>
            </div>
          )}
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