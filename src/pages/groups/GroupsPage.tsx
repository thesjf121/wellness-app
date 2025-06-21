import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { CreateGroupModal } from '../../components/groups/CreateGroupModal';
import { JoinGroupModal } from '../../components/groups/JoinGroupModal';
import { InviteCodeCard } from '../../components/groups/InviteCodeCard';
import { ActivityTracker } from '../../components/groups/ActivityTracker';
import { GroupCapacityIndicator } from '../../components/groups/GroupCapacityIndicator';
import { GroupManagement } from '../../components/groups/GroupManagement';
import { GroupActivityFeed } from '../../components/groups/GroupActivityFeed';
import { LeaveGroupModal } from '../../components/groups/LeaveGroupModal';
import { groupService } from '../../services/groupService';
import { Group, GroupMember, EligibilityCheck } from '../../types/groups';

const GroupsPage: React.FC = () => {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [userMembers, setUserMembers] = useState<GroupMember[]>([]);
  const [eligibility, setEligibility] = useState<EligibilityCheck | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [leaveGroupModal, setLeaveGroupModal] = useState<{ isOpen: boolean; group: Group | null }>({
    isOpen: false,
    group: null
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load user's groups
      const groups = await groupService.getUserGroups(user.id);
      setUserGroups(groups);

      // Load user's memberships for each group
      const members: GroupMember[] = [];
      for (const group of groups) {
        const groupMembers = await groupService.getGroupMembers(group.id);
        const userMember = groupMembers.find(m => m.userId === user.id);
        if (userMember) {
          members.push(userMember);
        }
      }
      setUserMembers(members);

      // Check eligibility
      const eligibilityCheck = await groupService.checkEligibility(user.id);
      setEligibility(eligibilityCheck);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupCreated = (groupId: string) => {
    // Reload user data to show the new group
    loadUserData();
  };

  const handleGroupJoined = (groupId: string) => {
    // Reload user data to show the joined group
    loadUserData();
  };

  const toggleGroupExpansion = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const handleLeaveGroup = () => {
    setLeaveGroupModal({ isOpen: false, group: null });
    loadUserData(); // Reload to remove the group from the list
  };

  const getUserRole = (groupId: string): 'member' | 'sponsor' | 'super_admin' => {
    const member = userMembers.find(m => m.groupId === groupId);
    return member?.role || 'member';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isSignedIn || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accountability Groups</h1>
          <p className="text-gray-500 mb-6">Please sign in to join or create accountability groups and connect with others on your wellness journey.</p>
          <div className="flex justify-center space-x-4">
            <a href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
              Sign In
            </a>
            <a href="/register" className="border border-gray-300 hover:bg-gray-50 px-6 py-2 rounded-lg">
              Sign Up
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Accountability Groups</h1>
      
      {/* Eligibility Status */}
      {eligibility && (
        <div className={`rounded-lg p-6 mb-8 ${
          eligibility.canCreateGroup || eligibility.canJoinGroup
            ? 'bg-green-50 border border-green-200' 
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <h2 className="text-xl font-semibold mb-2">
            {eligibility.canCreateGroup || eligibility.canJoinGroup
              ? '✅ You\'re Eligible!' 
              : '⏳ Complete Requirements First'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className={`flex items-center space-x-2 ${
              eligibility.requirements.sevenDayActivity.met ? 'text-green-700' : 'text-yellow-700'
            }`}>
              <span>{eligibility.requirements.sevenDayActivity.met ? '✅' : '⏳'}</span>
              <span>
                7-Day Activity: {eligibility.requirements.sevenDayActivity.daysActive}/7 days
              </span>
            </div>
            
            <div className={`flex items-center space-x-2 ${
              eligibility.requirements.trainingCompletion.met ? 'text-green-700' : 'text-yellow-700'
            }`}>
              <span>{eligibility.requirements.trainingCompletion.met ? '✅' : '⏳'}</span>
              <span>
                Training: {eligibility.requirements.trainingCompletion.modulesCompleted}/8 modules
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {eligibility.canCreateGroup ? (
              <div className="text-green-700">
                <p className="font-medium">✅ You can create and join groups!</p>
                <p className="text-sm">You've completed training and can now create your own groups and invite others, or join existing groups with invite codes.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-blue-700">
                  <p className="font-medium">✅ You can join groups with invite codes!</p>
                  <p className="text-sm">Ask a group sponsor for their invite code to join their accountability group.</p>
                </div>
                <div className="text-purple-700 bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm font-medium">To create your own groups, complete:</p>
                  <ul className="text-sm space-y-1 mt-1">
                    {!eligibility.requirements.sevenDayActivity.met && (
                      <li>• Stay active for {7 - eligibility.requirements.sevenDayActivity.daysActive} more days</li>
                    )}
                    {!eligibility.requirements.trainingCompletion.met && (
                      <li>• Complete {8 - eligibility.requirements.trainingCompletion.modulesCompleted} more training modules</li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {eligibility && (
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {eligibility.canCreateGroup && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium"
            >
              Create New Group
            </button>
          )}
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex-1 border border-blue-600 text-blue-600 hover:bg-blue-50 py-3 px-6 rounded-lg font-medium"
          >
            Join Group with Invite Code
          </button>
        </div>
      )}

      {/* User's Groups */}
      {userGroups.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Your Groups</h2>
          
          {userGroups.map((group) => {
            const userRole = getUserRole(group.id);
            const isOwner = userRole === 'sponsor';
            
            return (
              <div key={group.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-semibold text-gray-900">{group.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isOwner 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isOwner ? 'Sponsor' : 'Member'}
                        </span>
                      </div>
                      
                      {/* Leave button for non-sponsors */}
                      {!isOwner && (
                        <button
                          onClick={() => setLeaveGroupModal({ isOpen: true, group })}
                          className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
                          title="Leave this group"
                        >
                          Leave Group
                        </button>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{group.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <span>Created {formatDate(group.createdAt)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        group.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {group.status}
                      </span>
                    </div>
                    
                    {/* Group Capacity */}
                    <div className="mb-3">
                      <GroupCapacityIndicator
                        currentMembers={group.currentMemberCount}
                        maxMembers={group.maxMembers}
                        size="small"
                        showDetails={true}
                      />
                    </div>
                  </div>
                </div>

                {/* Group Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    {/* Group Details */}
                    <h4 className="font-medium text-gray-900 mb-2">Group Goals</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Daily Steps: {group.settings.activityGoals.dailyStepsGoal.toLocaleString()}</div>
                      <div>Weekly Food Entries: {group.settings.activityGoals.weeklyFoodEntriesGoal}</div>
                      <div>Monthly Training: {group.settings.activityGoals.monthlyTrainingModulesGoal} modules</div>
                    </div>
                  </div>

                  <div>
                    {/* Invite Card */}
                    <InviteCodeCard group={group} isOwner={isOwner} />
                  </div>

                  <div>
                    {/* Group Activity Feed */}
                    <GroupActivityFeed groupId={group.id} maxItems={5} />
                  </div>
                </div>

                {/* Group Management Section (Sponsor Only) */}
                {isOwner && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => toggleGroupExpansion(group.id)}
                      className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <h4 className="font-medium text-gray-900">Group Management</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Manage members, settings & analytics</span>
                        <svg
                          className={`w-5 h-5 text-gray-400 transform transition-transform ${
                            expandedGroups.has(group.id) ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    
                    {expandedGroups.has(group.id) && (
                      <div className="mt-4">
                        <GroupManagement
                          group={group}
                          isOwner={isOwner}
                          onGroupUpdated={loadUserData}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : eligibility ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ready to Start Your Journey?</h2>
          
          {eligibility.canCreateGroup ? (
            <div>
              <p className="text-gray-600 mb-6">
                You've completed training and can create your own accountability group or join existing ones with invite codes.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium"
                >
                  Create Your Group
                </button>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="border border-blue-600 text-blue-600 hover:bg-blue-50 py-3 px-6 rounded-lg font-medium"
                >
                  Join with Invite Code
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-6">
                Ask a group sponsor for their invite code to join their accountability group!
              </p>
              <button
                onClick={() => setShowJoinModal(true)}
                className="border border-blue-600 text-blue-600 hover:bg-blue-50 py-3 px-6 rounded-lg font-medium"
              >
                Join with Invite Code
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Keep Going!</h2>
            <p className="text-gray-600 mb-4">
              You're on your way to unlocking group features. Stay consistent with your wellness journey!
            </p>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Join Groups (No requirements)</h3>
                <p className="text-blue-700">Anyone can join groups with an invite code from a group sponsor!</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900 mb-2">Create Groups (Requirements)</h3>
                <p className="text-purple-700">Stay active for 7 days and complete all 8 wellness coaching modules to create your own groups.</p>
              </div>
            </div>
          </div>
          
          {/* Activity Tracker */}
          <ActivityTracker />
        </div>
      )}

      {/* Modals */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGroupCreated={handleGroupCreated}
      />

      <JoinGroupModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onGroupJoined={handleGroupJoined}
      />

      {leaveGroupModal.group && (
        <LeaveGroupModal
          isOpen={leaveGroupModal.isOpen}
          onClose={() => setLeaveGroupModal({ isOpen: false, group: null })}
          group={leaveGroupModal.group}
          onGroupLeft={handleLeaveGroup}
        />
      )}
    </div>
  );
};

export default GroupsPage;