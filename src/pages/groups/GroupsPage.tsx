import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { CreateGroupModal } from '../../components/groups/CreateGroupModal';
import { JoinGroupModal } from '../../components/groups/JoinGroupModal';
import { InviteCodeCard } from '../../components/groups/InviteCodeCard';
import { ActivityTracker } from '../../components/groups/ActivityTracker';
import { GroupCapacityIndicator } from '../../components/groups/GroupCapacityIndicator';
import { GroupManagement } from '../../components/groups/GroupManagement';
import { GroupActivityFeed } from '../../components/groups/GroupActivityFeed';
import { LeaveGroupModal } from '../../components/groups/LeaveGroupModal';
import { WellnessCard, CardHeader, CardTitle, CardContent } from '../../components/ui/WellnessCard';
import { CircularProgress } from '../../components/ui/CircularProgress';
import { BottomNavigation } from '../../components/ui/BottomNavigation';
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
      const groups = await groupService.getUserGroups(user.id);
      setUserGroups(groups);

      const members: GroupMember[] = [];
      for (const group of groups) {
        const groupMembers = await groupService.getGroupMembers(group.id);
        const userMember = groupMembers.find(m => m.userId === user.id);
        if (userMember) {
          members.push(userMember);
        }
      }
      setUserMembers(members);

      const eligibilityCheck = await groupService.checkEligibility(user.id);
      setEligibility(eligibilityCheck);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupCreated = (groupId: string) => {
    loadUserData();
  };

  const handleGroupJoined = (groupId: string) => {
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
    loadUserData();
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
        <WellnessCard>
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">🔒</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h2>
            <p className="text-gray-500 mb-6">Please sign in to join or create accountability groups and connect with others on your wellness journey.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="/login" 
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-medium transition-colors"
              >
                Sign In
              </a>
              <a 
                href="/register" 
                className="border border-gray-200 hover:bg-gray-50 px-6 py-2 rounded-xl font-medium transition-colors"
              >
                Sign Up
              </a>
            </div>
          </CardContent>
        </WellnessCard>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
          <p className="text-gray-500">Loading your groups...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8"
        >
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Connect</h1>
              <p className="text-gray-600">Join accountability groups and build wellness together</p>
            </div>
          </div>
        </motion.div>
        
        {/* Eligibility Status */}
        {eligibility && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <WellnessCard variant={eligibility.canCreateGroup || eligibility.canJoinGroup ? "gradient" : "secondary"} 
              className={eligibility.canCreateGroup || eligibility.canJoinGroup ? "bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100" : "bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-100"}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-3 text-2xl">
                    {eligibility.canCreateGroup || eligibility.canJoinGroup ? '🎉' : '⏳'}
                  </span>
                  {eligibility.canCreateGroup || eligibility.canJoinGroup
                    ? 'You\'re Ready to Connect!' 
                    : 'Complete Your Wellness Journey First'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Activity Progress */}
                  <div className="text-center">
                    <CircularProgress
                      value={(eligibility.requirements.sevenDayActivity.daysActive / 7) * 100}
                      size="md"
                      colors={{
                        progress: eligibility.requirements.sevenDayActivity.met ? ['#10B981', '#34D399'] : ['#F59E0B', '#F97316'],
                        background: '#E5E7EB'
                      }}
                      showValue={false}
                    >
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">
                          {eligibility.requirements.sevenDayActivity.daysActive}/7
                        </div>
                        <div className="text-xs text-gray-600">days active</div>
                      </div>
                    </CircularProgress>
                  </div>

                  {/* Training Progress */}
                  <div className="text-center">
                    <CircularProgress
                      value={(eligibility.requirements.trainingCompletion.modulesCompleted / 8) * 100}
                      size="md"
                      colors={{
                        progress: eligibility.requirements.trainingCompletion.met ? ['#8B5CF6', '#A855F7'] : ['#F59E0B', '#F97316'],
                        background: '#E5E7EB'
                      }}
                      showValue={false}
                    >
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">
                          {eligibility.requirements.trainingCompletion.modulesCompleted}/8
                        </div>
                        <div className="text-xs text-gray-600">modules done</div>
                      </div>
                    </CircularProgress>
                  </div>
                </div>

                {eligibility.canCreateGroup ? (
                  <div className="text-center p-4 bg-green-100 rounded-xl">
                    <h3 className="font-semibold text-green-900 mb-2">🎊 Congratulations!</h3>
                    <p className="text-green-700">You can now create and join groups! Build your wellness community and support others on their journey.</p>
                  </div>
                ) : eligibility.canJoinGroup ? (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-100 rounded-xl">
                      <h3 className="font-semibold text-blue-900 mb-2">✨ You Can Join Groups!</h3>
                      <p className="text-blue-700">Ask a group sponsor for their invite code to join their accountability group.</p>
                    </div>
                    <div className="text-center p-4 bg-purple-100 rounded-xl">
                      <h3 className="font-semibold text-purple-900 mb-2">🎯 To Create Groups:</h3>
                      <div className="text-sm text-purple-700 space-y-1">
                        {!eligibility.requirements.sevenDayActivity.met && (
                          <div>• Stay active for {7 - eligibility.requirements.sevenDayActivity.daysActive} more days</div>
                        )}
                        {!eligibility.requirements.trainingCompletion.met && (
                          <div>• Complete {8 - eligibility.requirements.trainingCompletion.modulesCompleted} more training modules</div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 bg-yellow-100 rounded-xl">
                    <h3 className="font-semibold text-yellow-900 mb-2">🌱 Keep Growing!</h3>
                    <p className="text-yellow-700">Continue your wellness journey to unlock group features. You're doing great!</p>
                  </div>
                )}
              </CardContent>
            </WellnessCard>
          </motion.div>
        )}

        {/* Action Buttons */}
        {eligibility && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
            {eligibility.canCreateGroup && (
              <motion.button
                onClick={() => setShowCreateModal(true)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ✨ Create New Group
              </motion.button>
            )}
            <motion.button
              onClick={() => setShowJoinModal(true)}
              className="flex-1 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 py-3 px-6 rounded-xl font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🎟️ Join with Invite Code
            </motion.button>
          </motion.div>
        )}

        {/* User's Groups */}
        {userGroups.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-900">Your Groups</h2>
              <span className="ml-3 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                {userGroups.length}
              </span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {userGroups.map((group, index) => {
                const userRole = getUserRole(group.id);
                const isOwner = userRole === 'sponsor';
                
                return (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <WellnessCard className="h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-xl">{group.name}</CardTitle>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                isOwner 
                                  ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {isOwner ? '👑 Sponsor' : '👤 Member'}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3">{group.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>📅 {formatDate(group.createdAt)}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                group.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {group.status}
                              </span>
                            </div>
                          </div>
                          
                          {!isOwner && (
                            <motion.button
                              onClick={() => setLeaveGroupModal({ isOpen: true, group })}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Leave this group"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                            </motion.button>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        {/* Group Capacity */}
                        <div className="mb-6">
                          <GroupCapacityIndicator
                            currentMembers={group.currentMemberCount}
                            maxMembers={group.maxMembers}
                            size="small"
                            showDetails={true}
                          />
                        </div>

                        {/* Group Goals */}
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="mr-2">🎯</span>
                            Group Goals
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                            <div className="bg-blue-50 p-3 rounded-xl">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-blue-700">Daily Steps</span>
                                <span className="font-semibold text-blue-900">
                                  {group.settings.activityGoals.dailyStepsGoal.toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-xl">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-green-700">Weekly Food Entries</span>
                                <span className="font-semibold text-green-900">
                                  {group.settings.activityGoals.weeklyFoodEntriesGoal}
                                </span>
                              </div>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-xl">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-purple-700">Monthly Training</span>
                                <span className="font-semibold text-purple-900">
                                  {group.settings.activityGoals.monthlyTrainingModulesGoal} modules
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Invite Card */}
                        <div className="mb-6">
                          <InviteCodeCard group={group} isOwner={isOwner} />
                        </div>

                        {/* Recent Activity */}
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="mr-2">📈</span>
                            Recent Activity
                          </h4>
                          <GroupActivityFeed groupId={group.id} maxItems={3} />
                        </div>

                        {/* Group Management for Sponsors */}
                        {isOwner && (
                          <div className="pt-4 border-t border-gray-100">
                            <motion.button
                              onClick={() => toggleGroupExpansion(group.id)}
                              className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-3 rounded-xl transition-colors"
                              whileHover={{ scale: 1.01 }}
                            >
                              <div className="flex items-center">
                                <span className="mr-2">⚙️</span>
                                <span className="font-semibold text-gray-900">Group Management</span>
                              </div>
                              <motion.div
                                animate={{ rotate: expandedGroups.has(group.id) ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </motion.div>
                            </motion.button>
                            
                            {expandedGroups.has(group.id) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4"
                              >
                                <GroupManagement
                                  group={group}
                                  isOwner={isOwner}
                                  onGroupUpdated={loadUserData}
                                />
                              </motion.div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </WellnessCard>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : eligibility ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <WellnessCard variant="gradient" className="bg-gradient-to-br from-purple-50 via-white to-pink-50 text-center">
              <CardContent className="p-12">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🌟</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Your Journey?</h2>
                
                {eligibility.canCreateGroup ? (
                  <div>
                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                      You've completed your wellness training! Create your own accountability group to lead others, 
                      or join existing communities with invite codes.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <motion.button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-8 rounded-xl font-medium transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ✨ Create Your Group
                      </motion.button>
                      <motion.button
                        onClick={() => setShowJoinModal(true)}
                        className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 py-3 px-8 rounded-xl font-medium transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        🎟️ Join with Code
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                      Ask a group sponsor for their invite code to join their accountability group and start building connections!
                    </p>
                    <motion.button
                      onClick={() => setShowJoinModal(true)}
                      className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 py-3 px-8 rounded-xl font-medium transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🎟️ Join with Invite Code
                    </motion.button>
                  </div>
                )}
              </CardContent>
            </WellnessCard>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <WellnessCard>
              <CardContent className="text-center p-8">
                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🌱</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Keep Growing!</h2>
                <p className="text-gray-600 mb-6">
                  You're building great wellness habits. Keep going to unlock group features!
                </p>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-xl text-left">
                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                      <span className="mr-2">🎟️</span>
                      Join Groups
                    </h3>
                    <p className="text-blue-700 text-sm">Anyone can join groups with an invite code from a sponsor!</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl text-left">
                    <h3 className="font-semibold text-purple-900 mb-2 flex items-center">
                      <span className="mr-2">✨</span>
                      Create Groups
                    </h3>
                    <p className="text-purple-700 text-sm">Stay active for 7 days and complete all 8 training modules to lead your own group.</p>
                  </div>
                </div>
              </CardContent>
            </WellnessCard>
            
            <ActivityTracker />
          </motion.div>
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
      
      <BottomNavigation />
    </>
  );
};

export default GroupsPage;