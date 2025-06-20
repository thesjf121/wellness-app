import React, { useState, useEffect } from 'react';
import { Group, GroupMember } from '../../types/groups';
import { groupService } from '../../services/groupService';
import { GroupCapacityIndicator } from './GroupCapacityIndicator';
import { GroupAchievements } from './GroupAchievements';
import { GroupChat } from './GroupChat';
import { useUser } from '@clerk/clerk-react';
import { memberActivityService } from '../../services/memberActivityService';

interface GroupManagementProps {
  group: Group;
  isOwner: boolean;
  onGroupUpdated: () => void;
}

export const GroupManagement: React.FC<GroupManagementProps> = ({
  group,
  isOwner,
  onGroupUpdated
}) => {
  const { user } = useUser();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'members' | 'chat' | 'achievements' | 'settings' | 'analytics'>('members');
  const [error, setError] = useState<string | null>(null);
  const [engagementData, setEngagementData] = useState<any>(null);

  useEffect(() => {
    loadGroupData();
  }, [group.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadGroupData = async () => {
    setLoading(true);
    try {
      const groupMembers = await groupService.getGroupMembers(group.id);
      setMembers(groupMembers.sort((a, b) => {
        // Sort by role (sponsor first), then by join date
        if (a.role === 'sponsor') return -1;
        if (b.role === 'sponsor') return 1;
        return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
      }));

      // Load engagement data for analytics
      if (isOwner) {
        const engagement = await memberActivityService.getGroupEngagementSummary(group.id);
        setEngagementData(engagement);
      }

      setError(null);
    } catch (error) {
      console.error('Failed to load group data:', error);
      setError('Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!isOwner) return;

    if (window.confirm(`Are you sure you want to remove ${memberName} from the group? This action cannot be undone.`)) {
      try {
        await groupService.removeMember(group.id, memberId, user?.id || '');
        await loadGroupData();
        onGroupUpdated();
      } catch (error) {
        console.error('Failed to remove member:', error);
        setError('Failed to remove member');
      }
    }
  };

  const handleUpdateGroupSettings = async (settings: Partial<Group['settings']>) => {
    if (!isOwner) return;

    try {
      await groupService.updateGroupSettings(group.id, settings, user?.id || '');
      onGroupUpdated();
    } catch (error) {
      console.error('Failed to update settings:', error);
      setError('Failed to update group settings');
    }
  };

  const handleTransferOwnership = async (newSponsorId: string, memberName: string) => {
    if (!isOwner || !user) return;

    if (window.confirm(`Are you sure you want to transfer group ownership to ${memberName}? You will become a regular member and lose admin privileges.`)) {
      try {
        await groupService.transferOwnership(group.id, user.id, newSponsorId);
        onGroupUpdated();
        setError('Group ownership transferred successfully');
      } catch (error) {
        console.error('Failed to transfer ownership:', error);
        setError('Failed to transfer group ownership');
      }
    }
  };

  const handleDeleteGroup = async () => {
    if (!isOwner || !user) return;

    const confirmMessage = `Are you sure you want to permanently delete "${group.name}"? This action cannot be undone and will:\n\n• Remove all ${members.length} members\n• Delete all group data and history\n• Cannot be reversed\n\nType "DELETE" to confirm:`;
    
    const confirmation = window.prompt(confirmMessage);
    if (confirmation === 'DELETE') {
      try {
        await groupService.deleteGroup(group.id, user.id);
        onGroupUpdated();
        alert('Group deleted successfully');
      } catch (error) {
        console.error('Failed to delete group:', error);
        setError('Failed to delete group');
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'sponsor':
        return 'bg-purple-100 text-purple-800';
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getActivityStatus = (member: GroupMember) => {
    const daysSinceLastActive = Math.floor(
      (new Date().getTime() - new Date(member.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastActive === 0) return { status: 'Active today', color: 'text-green-600' };
    if (daysSinceLastActive <= 1) return { status: `Active ${daysSinceLastActive} day ago`, color: 'text-green-600' };
    if (daysSinceLastActive <= 3) return { status: `Active ${daysSinceLastActive} days ago`, color: 'text-yellow-600' };
    if (daysSinceLastActive <= 7) return { status: `Active ${daysSinceLastActive} days ago`, color: 'text-orange-600' };
    return { status: `Inactive for ${daysSinceLastActive} days`, color: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isOwner ? 'Manage Group' : 'Group Details'}
            </h2>
            <p className="text-gray-600 text-sm mt-1">{group.name}</p>
          </div>
          {isOwner && (
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              Sponsor
            </span>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 px-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'members', label: 'Members', count: members.length },
            { id: 'chat', label: 'Chat' },
            { id: 'achievements', label: 'Achievements' },
            { id: 'settings', label: 'Settings' },
            { id: 'analytics', label: 'Analytics' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'members' && (
          <div className="space-y-6">
            {/* Group Capacity */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Group Capacity</h3>
              <GroupCapacityIndicator
                currentMembers={group.currentMemberCount}
                maxMembers={group.maxMembers}
                size="medium"
                showDetails={true}
              />
            </div>

            {/* Members List */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Members</h3>
              <div className="space-y-3">
                {members.map((member) => {
                  const activityStatus = getActivityStatus(member);
                  return (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">
                                User {member.userId.slice(-8)} {/* In production, would show actual name */}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                                {member.role}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              <span>Joined {formatDate(member.joinedAt)}</span>
                              <span className="mx-2">•</span>
                              <span className={activityStatus.color}>{activityStatus.status}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Member Actions */}
                      {isOwner && member.role !== 'sponsor' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleTransferOwnership(member.userId, `User ${member.userId.slice(-8)}`)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            title="Transfer group ownership to this member"
                          >
                            Make Sponsor
                          </button>
                          <button
                            onClick={() => handleRemoveMember(member.id, `User ${member.userId.slice(-8)}`)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Invite More Members */}
            {isOwner && group.currentMemberCount < group.maxMembers && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Invite More Members</h4>
                <p className="text-blue-800 text-sm mb-3">
                  You have {group.maxMembers - group.currentMemberCount} spots remaining. 
                  Share your invite code to grow your group!
                </p>
                <div className="text-center">
                  <span className="bg-white border border-blue-300 px-4 py-2 rounded-lg font-mono text-lg tracking-wider">
                    {group.inviteCode}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Group Settings</h3>
            
            {isOwner ? (
              <div className="space-y-4">
                {/* Group Basic Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Group Name</label>
                      <p className="mt-1 text-sm text-gray-600">{group.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="mt-1 text-sm text-gray-600">{group.description}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Invite Code</label>
                      <p className="mt-1 text-sm text-gray-600 font-mono">{group.inviteCode}</p>
                    </div>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Privacy & Access</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={group.settings.isPublic}
                        onChange={(e) => handleUpdateGroupSettings({ isPublic: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Make group publicly discoverable</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={group.settings.requireApproval}
                        onChange={(e) => handleUpdateGroupSettings({ requireApproval: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Require approval for new members</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={group.settings.allowMemberInvites}
                        onChange={(e) => handleUpdateGroupSettings({ allowMemberInvites: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Allow members to invite others</span>
                    </label>
                  </div>
                </div>

                {/* Activity Goals */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Activity Goals</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Daily Steps Goal</label>
                      <p className="mt-1 text-sm text-gray-600">{group.settings.activityGoals.dailyStepsGoal.toLocaleString()} steps</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Weekly Food Entries Goal</label>
                      <p className="mt-1 text-sm text-gray-600">{group.settings.activityGoals.weeklyFoodEntriesGoal} entries</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Monthly Training Modules Goal</label>
                      <p className="mt-1 text-sm text-gray-600">{group.settings.activityGoals.monthlyTrainingModulesGoal} modules</p>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border-t pt-6">
                  <h4 className="font-medium text-red-900 mb-3">Danger Zone</h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                    <div>
                      <h5 className="font-medium text-red-800 mb-1">Transfer Ownership</h5>
                      <p className="text-sm text-red-700 mb-2">
                        You can transfer group ownership to another member. You will become a regular member.
                      </p>
                      <p className="text-xs text-red-600">
                        Use the "Make Sponsor" button next to a member in the Members tab.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-red-800 mb-1">Delete Group</h5>
                      <p className="text-sm text-red-700 mb-2">
                        Permanently delete this group and remove all members. This action cannot be undone.
                      </p>
                      <button
                        onClick={handleDeleteGroup}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
                      >
                        Delete Group
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Only group sponsors can modify settings.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <GroupChat groupId={group.id} />
        )}

        {activeTab === 'achievements' && (
          <GroupAchievements groupId={group.id} />
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Group Analytics</h3>
            
            {engagementData ? (
              <>
                {/* Engagement Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900">Total Members</h4>
                    <p className="text-2xl font-bold text-blue-600">{engagementData.totalMembers}</p>
                    <p className="text-sm text-blue-700">{group.maxMembers - engagementData.totalMembers} spots remaining</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900">Active Members</h4>
                    <p className="text-2xl font-bold text-green-600">{engagementData.activeMembers}</p>
                    <p className="text-sm text-green-700">Active in last 7 days</p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-medium text-orange-900">Engagement Score</h4>
                    <p className="text-2xl font-bold text-orange-600">{engagementData.averageEngagementScore}</p>
                    <p className="text-sm text-orange-700">Average group score</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-900">Group Age</h4>
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.floor((new Date().getTime() - new Date(group.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                    <p className="text-sm text-purple-700">Days active</p>
                  </div>
                </div>

                {/* Engagement Distribution */}
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Member Engagement Distribution</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{engagementData.engagementLevels.high}</div>
                      <div className="text-sm text-gray-600">High Engagement</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{engagementData.engagementLevels.medium}</div>
                      <div className="text-sm text-gray-600">Medium Engagement</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{engagementData.engagementLevels.low}</div>
                      <div className="text-sm text-gray-600">Low Engagement</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{engagementData.engagementLevels.inactive}</div>
                      <div className="text-sm text-gray-600">Inactive</div>
                    </div>
                  </div>
                </div>

                {/* Top Performers */}
                {engagementData.topPerformers.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Top Performers</h4>
                    <div className="space-y-2">
                      {engagementData.topPerformers.map((performer: any, index: number) => (
                        <div key={performer.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-6 h-6 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="font-medium text-gray-900">User {performer.userId.slice(-8)}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">Score: {performer.engagementScore}</div>
                            <div className="text-xs text-gray-600">{performer.activeDays} active days</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Fallback to basic analytics */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900">Total Members</h4>
                  <p className="text-2xl font-bold text-blue-600">{members.length}</p>
                  <p className="text-sm text-blue-700">{group.maxMembers - members.length} spots remaining</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900">Active Members</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {members.filter(m => {
                      const daysSinceActive = Math.floor((new Date().getTime() - new Date(m.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24));
                      return daysSinceActive <= 3;
                    }).length}
                  </p>
                  <p className="text-sm text-green-700">Active in last 3 days</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900">Group Age</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.floor((new Date().getTime() - new Date(group.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                  </p>
                  <p className="text-sm text-purple-700">Days active</p>
                </div>
              </div>
            )}

            {/* Recent Member Activity */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recent Member Activity</h4>
              <div className="space-y-2">
                {members
                  .sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime())
                  .slice(0, 5)
                  .map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium text-gray-900">User {member.userId.slice(-8)}</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getRoleColor(member.role)}`}>
                          {member.role}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Last active: {formatDate(member.lastActiveAt)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupManagement;