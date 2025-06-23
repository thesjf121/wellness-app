// Group management service for social wellness features

import {
  Group,
  GroupMember,
  GroupInvitation,
  UserActivity,
  GroupActivity,
  MemberAchievement,
  GroupStats,
  EligibilityCheck,
  CreateGroupRequest,
  CreateGroupResponse,
  JoinGroupRequest,
  JoinGroupResponse,
  GroupRole,
  GROUP_STORAGE_KEYS,
  AchievementType,
  ActivityType,
  MemberActivityStats
} from '../types/groups';
import { errorService } from './errorService';
import { activityTrackingService } from './activityTrackingService';
import { trainingService } from './trainingService';
import { memberActivityService } from './memberActivityService';
import { groupActivityFeedService } from './groupActivityFeedService';
import { groupAchievementService } from './groupAchievementService';
import { groupMessagingService } from './groupMessagingService';
import { groupNotificationService } from './groupNotificationService';

class GroupService {
  private readonly MAX_MEMBERS_PER_GROUP = 10;
  private readonly REQUIRED_ACTIVE_DAYS = 7;
  private readonly REQUIRED_TRAINING_MODULES = 8; // Total modules in training

  /**
   * Check if user is eligible to create or join groups
   */
  async checkEligibility(userId: string): Promise<EligibilityCheck> {
    try {
      // Import getUserRole from clerkHelpers
      const { getUserRole } = await import('../utils/clerkHelpers');
      
      // Get user from Clerk
      let userRole = 'member';
      if (typeof window !== 'undefined' && window.Clerk?.user) {
        userRole = getUserRole(window.Clerk.user);
      }

      // Super admins bypass all requirements
      if (userRole === 'super_admin') {
        const eligibility: EligibilityCheck = {
          userId,
          canCreateGroup: true,
          canJoinGroup: true,
          requirements: {
            sevenDayActivity: { met: true, daysActive: 7 },
            trainingCompletion: { met: true, modulesCompleted: 8 }
          },
          checkedAt: new Date()
        };

        // Cache eligibility check
        localStorage.setItem(
          `${GROUP_STORAGE_KEYS.USER_ELIGIBILITY}_${userId}`,
          JSON.stringify(eligibility)
        );

        return eligibility;
      }

      // Check 7-day activity requirement
      const activityCheck = await this.checkSevenDayActivity(userId);
      
      // Check training completion
      const trainingCheck = await this.checkTrainingCompletion(userId);

      // Team sponsors need to meet requirements, members cannot create groups
      const canCreateGroup = userRole === 'team_sponsor' ? 
        (activityCheck.met && trainingCheck.met) : false;

      const eligibility: EligibilityCheck = {
        userId,
        canCreateGroup,
        canJoinGroup: true, // Anyone can join with an invite code
        requirements: {
          sevenDayActivity: activityCheck,
          trainingCompletion: trainingCheck
        },
        checkedAt: new Date()
      };

      // Cache eligibility check
      localStorage.setItem(
        `${GROUP_STORAGE_KEYS.USER_ELIGIBILITY}_${userId}`,
        JSON.stringify(eligibility)
      );

      return eligibility;
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupService.checkEligibility',
        userId
      });
      throw error;
    }
  }

  /**
   * Create a new group
   */
  async createGroup(
    request: CreateGroupRequest, 
    sponsorUserId: string
  ): Promise<CreateGroupResponse> {
    try {
      // Check eligibility first
      const eligibility = await this.checkEligibility(sponsorUserId);
      if (!eligibility.canCreateGroup) {
        throw new Error('User is not eligible to create a group');
      }

      // Generate unique invite code
      const inviteCode = this.generateInviteCode();

      // Create group
      const group: Group = {
        id: this.generateId('group'),
        name: request.name.trim(),
        description: request.description.trim(),
        inviteCode,
        sponsorId: sponsorUserId,
        status: 'active',
        maxMembers: this.MAX_MEMBERS_PER_GROUP,
        currentMemberCount: 1, // Sponsor is first member
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {
          isPublic: false,
          requireApproval: false,
          allowMemberInvites: true,
          activityGoals: {
            dailyStepsGoal: 8000,
            weeklyFoodEntriesGoal: 14,
            monthlyTrainingModulesGoal: 2
          },
          notifications: {
            newMemberJoins: true,
            memberAchievements: true,
            groupChallenges: true,
            inactiveMembers: true
          },
          ...request.settings
        }
      };

      // Create sponsor membership
      const sponsorMember: GroupMember = {
        id: this.generateId('member'),
        groupId: group.id,
        userId: sponsorUserId,
        role: 'sponsor',
        joinedAt: new Date(),
        lastActiveAt: new Date(),
        isEligible: true,
        activityStats: await this.initializeMemberActivityStats(sponsorUserId, group.id),
        achievements: []
      };

      // Create initial invitation record (for tracking)
      const invitation: GroupInvitation = {
        id: this.generateId('invite'),
        groupId: group.id,
        invitedByUserId: sponsorUserId,
        inviteCode,
        status: 'accepted', // Sponsor auto-accepts
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        acceptedAt: new Date()
      };

      // Save to storage
      await this.saveGroup(group);
      await this.saveGroupMember(sponsorMember);
      await this.saveInvitation(invitation);

      // Create system activity
      await this.logGroupActivity(group.id, sponsorUserId, 'member_joined', 
        `${sponsorUserId} created the group and became the sponsor`
      );

      errorService.logInfo('Group created successfully', {
        groupId: group.id,
        sponsorId: sponsorUserId,
        groupName: group.name
      });

      return { group, invitation, member: sponsorMember };
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupService.createGroup',
        request,
        sponsorUserId
      });
      throw error;
    }
  }

  /**
   * Join a group using invite code
   */
  async joinGroup(
    request: JoinGroupRequest, 
    userId: string
  ): Promise<JoinGroupResponse> {
    try {
      // Check eligibility
      const eligibility = await this.checkEligibility(userId);
      if (!eligibility.canJoinGroup) {
        throw new Error('User is not eligible to join groups');
      }

      // Find group by invite code - make sure we're checking the right code format
      const cleanCode = request.inviteCode.trim().toUpperCase().replace('-', '');
      
      const allGroups = this.loadGroups();
      const group = allGroups.find(g => g.inviteCode === cleanCode);
      
      if (!group) {
        throw new Error('Invalid invite code');
      }

      if (group.status !== 'active') {
        throw new Error('Group is not active');
      }

      // Check if group can accept new members
      const capacityCheck = await this.canAcceptNewMembers(group.id);
      if (!capacityCheck.canAccept) {
        throw new Error(capacityCheck.reason || 'Cannot join group');
      }

      // Check if user is already a member
      const existingMember = await this.getGroupMember(group.id, userId);
      if (existingMember) {
        throw new Error('User is already a member of this group');
      }

      // Create new member
      const newMember: GroupMember = {
        id: this.generateId('member'),
        groupId: group.id,
        userId,
        role: 'member',
        joinedAt: new Date(),
        lastActiveAt: new Date(),
        isEligible: true,
        activityStats: await this.initializeMemberActivityStats(userId, group.id),
        achievements: []
      };

      // Update group member count
      group.currentMemberCount += 1;
      group.updatedAt = new Date();

      // Create invitation record
      const invitation: GroupInvitation = {
        id: this.generateId('invite'),
        groupId: group.id,
        invitedByUserId: group.sponsorId, // Assume sponsor invited
        invitedUserId: userId,
        inviteCode: request.inviteCode,
        status: 'accepted',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        acceptedAt: new Date(),
        message: request.message
      };

      // Save updates
      await this.saveGroup(group);
      await this.saveGroupMember(newMember);
      await this.saveInvitation(invitation);

      // Log activity
      await this.logGroupActivity(group.id, userId, 'member_joined',
        `New member joined the group`
      );

      // Log member joined activity for feed
      await groupActivityFeedService.logMemberJoined(group.id, userId);

      // Send welcome message to group chat
      await groupMessagingService.sendSystemNotification(
        group.id,
        `🎉 ${userId} joined the group! Welcome to ${group.name}!`
      );

      // Send notification to existing members
      await groupNotificationService.notifyMemberJoined(group.id, userId);

      // Achievement checking will happen automatically via activity tracking

      return { group, member: newMember, eligibilityStatus: eligibility };
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupService.joinGroup',
        request,
        userId
      });
      throw error;
    }
  }

  /**
   * Get user's groups
   */
  async getUserGroups(userId: string): Promise<Group[]> {
    try {
      const members = await this.getUserMemberships(userId);
      const groups: Group[] = [];

      for (const member of members) {
        const group = await this.getGroupById(member.groupId);
        if (group) {
          groups.push(group);
        }
      }

      return groups.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupService.getUserGroups',
        userId
      });
      return [];
    }
  }

  /**
   * Get group members
   */
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    try {
      const allMembers = this.loadGroupMembers();
      return allMembers.filter(member => member.groupId === groupId)
        .sort((a, b) => {
          // Sponsor first, then by join date
          if (a.role === 'sponsor') return -1;
          if (b.role === 'sponsor') return 1;
          return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
        });
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupService.getGroupMembers',
        groupId
      });
      return [];
    }
  }

  /**
   * Check if a group can accept new members
   */
  async canAcceptNewMembers(groupId: string): Promise<{
    canAccept: boolean;
    currentCount: number;
    maxMembers: number;
    spotsRemaining: number;
    reason?: string;
  }> {
    try {
      const group = await this.getGroupById(groupId);
      if (!group) {
        return {
          canAccept: false,
          currentCount: 0,
          maxMembers: this.MAX_MEMBERS_PER_GROUP,
          spotsRemaining: 0,
          reason: 'Group not found'
        };
      }

      if (group.status !== 'active') {
        return {
          canAccept: false,
          currentCount: group.currentMemberCount,
          maxMembers: group.maxMembers,
          spotsRemaining: 0,
          reason: 'Group is not active'
        };
      }

      const spotsRemaining = group.maxMembers - group.currentMemberCount;
      const canAccept = spotsRemaining > 0;

      return {
        canAccept,
        currentCount: group.currentMemberCount,
        maxMembers: group.maxMembers,
        spotsRemaining,
        reason: canAccept ? undefined : 'Group is full'
      };
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupService.canAcceptNewMembers',
        groupId
      });
      return {
        canAccept: false,
        currentCount: 0,
        maxMembers: this.MAX_MEMBERS_PER_GROUP,
        spotsRemaining: 0,
        reason: 'Error checking group capacity'
      };
    }
  }

  /**
   * Get group capacity information
   */
  async getGroupCapacity(groupId: string): Promise<{
    currentMembers: number;
    maxMembers: number;
    spotsRemaining: number;
    percentageFull: number;
    isFull: boolean;
    isNearlyFull: boolean; // >80% full
  }> {
    try {
      const group = await this.getGroupById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      const spotsRemaining = group.maxMembers - group.currentMemberCount;
      const percentageFull = (group.currentMemberCount / group.maxMembers) * 100;

      return {
        currentMembers: group.currentMemberCount,
        maxMembers: group.maxMembers,
        spotsRemaining,
        percentageFull,
        isFull: group.currentMemberCount >= group.maxMembers,
        isNearlyFull: percentageFull >= 80
      };
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupService.getGroupCapacity',
        groupId
      });
      throw error;
    }
  }

  /**
   * Remove a member from a group (sponsor only)
   */
  async removeMember(groupId: string, memberId: string, sponsorUserId: string): Promise<void> {
    try {
      // Verify sponsor permission
      const group = await this.getGroupById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      if (group.sponsorId !== sponsorUserId) {
        throw new Error('Only group sponsors can remove members');
      }

      // Get member to remove
      const member = await this.getGroupMember(groupId, memberId);
      if (!member) {
        throw new Error('Member not found');
      }

      if (member.role === 'sponsor') {
        throw new Error('Cannot remove group sponsor');
      }

      // Remove member
      const allMembers = this.loadGroupMembers();
      const filteredMembers = allMembers.filter(m => m.id !== member.id);
      localStorage.setItem(GROUP_STORAGE_KEYS.GROUP_MEMBERS, JSON.stringify(filteredMembers));

      // Update group member count
      group.currentMemberCount -= 1;
      group.updatedAt = new Date();
      await this.updateGroup(group);

      // Log activity
      await this.logGroupActivity(groupId, sponsorUserId, 'member_removed', 
        `Member ${memberId} was removed by sponsor`
      );

      errorService.logInfo('Member removed from group', {
        groupId,
        memberId,
        sponsorUserId
      });
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupService.removeMember',
        groupId,
        memberId,
        sponsorUserId
      });
      throw error;
    }
  }

  /**
   * Update group settings (sponsor only)
   */
  async updateGroupSettings(groupId: string, settings: Partial<Group['settings']>, sponsorUserId: string): Promise<Group> {
    try {
      const group = await this.getGroupById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      if (group.sponsorId !== sponsorUserId) {
        throw new Error('Only group sponsors can update settings');
      }

      // Update settings
      group.settings = {
        ...group.settings,
        ...settings
      };
      group.updatedAt = new Date();

      await this.updateGroup(group);

      // Log activity
      await this.logGroupActivity(groupId, sponsorUserId, 'settings_updated', 
        `Group settings updated by sponsor`
      );

      errorService.logInfo('Group settings updated', {
        groupId,
        sponsorUserId,
        settings
      });

      return group;
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupService.updateGroupSettings',
        groupId,
        sponsorUserId,
        settings
      });
      throw error;
    }
  }

  /**
   * Update group basic information (sponsor only)
   */
  async updateGroupInfo(groupId: string, updates: { name?: string; description?: string }, sponsorUserId: string): Promise<Group> {
    try {
      const group = await this.getGroupById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      if (group.sponsorId !== sponsorUserId) {
        throw new Error('Only group sponsors can update group information');
      }

      // Validate updates
      if (updates.name && updates.name.trim().length < 3) {
        throw new Error('Group name must be at least 3 characters');
      }

      if (updates.description && updates.description.trim().length < 10) {
        throw new Error('Group description must be at least 10 characters');
      }

      // Update group
      if (updates.name) group.name = updates.name.trim();
      if (updates.description) group.description = updates.description.trim();
      group.updatedAt = new Date();

      await this.updateGroup(group);

      // Log activity
      await this.logGroupActivity(groupId, sponsorUserId, 'info_updated', 
        `Group information updated by sponsor`
      );

      errorService.logInfo('Group information updated', {
        groupId,
        sponsorUserId,
        updates
      });

      return group;
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupService.updateGroupInfo',
        groupId,
        sponsorUserId,
        updates
      });
      throw error;
    }
  }

  /**
   * Allow a member to leave a group voluntarily
   */
  async leaveGroup(groupId: string, userId: string, reason?: string): Promise<void> {
    try {
      const group = await this.getGroupById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      // Get member to remove
      const member = await this.getGroupMember(groupId, userId);
      if (!member) {
        throw new Error('You are not a member of this group');
      }

      if (member.role === 'sponsor') {
        throw new Error('Group sponsors cannot leave. You must transfer ownership or delete the group.');
      }

      // Remove member
      const allMembers = this.loadGroupMembers();
      const filteredMembers = allMembers.filter(m => m.id !== member.id);
      localStorage.setItem(GROUP_STORAGE_KEYS.GROUP_MEMBERS, JSON.stringify(filteredMembers));

      // Update group member count
      group.currentMemberCount -= 1;
      group.updatedAt = new Date();
      await this.updateGroup(group);

      // Log activity
      const reasonText = reason ? ` (${reason})` : '';
      await this.logGroupActivity(groupId, userId, 'member_left', 
        `Member left the group${reasonText}`
      );

      // Send notification to group chat
      await groupMessagingService.sendSystemNotification(
        groupId,
        `👋 A member has left the group${reasonText}`
      );

      // Send notification to remaining members
      await groupNotificationService.notifyMemberLeft(groupId, userId, reason);

      errorService.logInfo('Member left group', {
        groupId,
        userId,
        reason
      });

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupService.leaveGroup',
        groupId,
        userId
      });
      throw error;
    }
  }

  /**
   * Transfer group ownership to another member (sponsor only)
   */
  async transferOwnership(groupId: string, currentSponsorId: string, newSponsorId: string): Promise<void> {
    try {
      const group = await this.getGroupById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      if (group.sponsorId !== currentSponsorId) {
        throw new Error('Only the current sponsor can transfer ownership');
      }

      // Get both members
      const currentSponsor = await this.getGroupMember(groupId, currentSponsorId);
      const newSponsor = await this.getGroupMember(groupId, newSponsorId);

      if (!currentSponsor || !newSponsor) {
        throw new Error('One or both members not found in group');
      }

      // Update roles
      const allMembers = this.loadGroupMembers();
      const updatedMembers = allMembers.map(member => {
        if (member.id === currentSponsor.id) {
          return { ...member, role: 'member' as const };
        }
        if (member.id === newSponsor.id) {
          return { ...member, role: 'sponsor' as const };
        }
        return member;
      });

      // Update group sponsor
      group.sponsorId = newSponsorId;
      group.updatedAt = new Date();

      // Save changes
      localStorage.setItem(GROUP_STORAGE_KEYS.GROUP_MEMBERS, JSON.stringify(updatedMembers));
      await this.updateGroup(group);

      // Log activity
      await this.logGroupActivity(groupId, currentSponsorId, 'ownership_transferred', 
        `Group ownership transferred to ${newSponsorId}`
      );

      errorService.logInfo('Group ownership transferred', {
        groupId,
        fromUserId: currentSponsorId,
        toUserId: newSponsorId
      });

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupService.transferOwnership',
        groupId,
        currentSponsorId,
        newSponsorId
      });
      throw error;
    }
  }

  /**
   * Delete a group completely (sponsor only)
   */
  async deleteGroup(groupId: string, sponsorId: string): Promise<void> {
    try {
      const group = await this.getGroupById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      if (group.sponsorId !== sponsorId) {
        throw new Error('Only group sponsors can delete groups');
      }

      // Remove all members
      const allMembers = this.loadGroupMembers();
      const filteredMembers = allMembers.filter(m => m.groupId !== groupId);
      localStorage.setItem(GROUP_STORAGE_KEYS.GROUP_MEMBERS, JSON.stringify(filteredMembers));

      // Remove group
      const allGroups = this.loadGroups();
      const filteredGroups = allGroups.filter(g => g.id !== groupId);
      localStorage.setItem(GROUP_STORAGE_KEYS.USER_GROUPS, JSON.stringify(filteredGroups));

      // Clean up related data
      await this.cleanupGroupData(groupId);

      errorService.logInfo('Group deleted', {
        groupId,
        sponsorId
      });

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupService.deleteGroup',
        groupId,
        sponsorId
      });
      throw error;
    }
  }

  /**
   * Get group analytics (sponsor only)
   */
  async getGroupAnalytics(groupId: string, sponsorUserId: string): Promise<{
    memberCount: number;
    activeMembers: number;
    recentJoins: number;
    averageActivityScore: number;
    groupAge: number;
    memberActivitySummary: Array<{
      userId: string;
      joinDate: Date;
      lastActive: Date;
      activityScore: number;
      isActive: boolean;
    }>;
  }> {
    try {
      const group = await this.getGroupById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      if (group.sponsorId !== sponsorUserId) {
        throw new Error('Only group sponsors can view analytics');
      }

      const members = await this.getGroupMembers(groupId);
      const now = new Date();
      const groupAge = Math.floor((now.getTime() - new Date(group.createdAt).getTime()) / (1000 * 60 * 60 * 24));

      // Calculate member statistics
      const memberActivitySummary = members.map(member => {
        const daysSinceActive = Math.floor((now.getTime() - new Date(member.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24));
        const activityScore = Math.max(0, 100 - (daysSinceActive * 10)); // Simple scoring system
        
        return {
          userId: member.userId,
          joinDate: member.joinedAt,
          lastActive: member.lastActiveAt,
          activityScore,
          isActive: daysSinceActive <= 3
        };
      });

      const activeMembers = memberActivitySummary.filter(m => m.isActive).length;
      const recentJoins = members.filter(m => {
        const daysSinceJoin = Math.floor((now.getTime() - new Date(m.joinedAt).getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceJoin <= 7;
      }).length;

      const averageActivityScore = memberActivitySummary.length > 0 
        ? memberActivitySummary.reduce((sum, m) => sum + m.activityScore, 0) / memberActivitySummary.length
        : 0;

      return {
        memberCount: members.length,
        activeMembers,
        recentJoins,
        averageActivityScore: Math.round(averageActivityScore),
        groupAge,
        memberActivitySummary
      };
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupService.getGroupAnalytics',
        groupId,
        sponsorUserId
      });
      throw error;
    }
  }

  /**
   * Track user activity for group eligibility and achievements
   */
  async trackUserActivity(
    userId: string,
    activityType: ActivityType,
    metadata: any = {},
    groupId?: string
  ): Promise<void> {
    try {
      // Use the dedicated activity tracking service
      await activityTrackingService.trackActivity(userId, activityType, metadata, groupId);

      // Update member activity stats if in a group
      if (groupId) {
        await this.updateMemberActivityStats(userId, groupId, activityType, metadata);
        
        // Log activity for member engagement tracking
        const activityValue = this.extractActivityValue(activityType, metadata);
        await memberActivityService.logMemberActivity(groupId, userId, activityType, activityValue, metadata);
        
        // Check and log milestones for group feed
        await groupActivityFeedService.checkAndLogMilestones(groupId, userId, activityType, activityValue, metadata);
        
        // Check for new achievements
        await groupAchievementService.checkUserAchievements(userId, groupId, activityType);
      }

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupService.trackUserActivity',
        userId,
        activityType,
        groupId
      });
    }
  }

  // Private helper methods

  private async checkSevenDayActivity(userId: string): Promise<{
    met: boolean;
    daysActive: number;
    requiredDays: 7;
  }> {
    const eligibility = await activityTrackingService.checkActivityEligibility(userId, this.REQUIRED_ACTIVE_DAYS);
    
    return {
      met: eligibility.met,
      daysActive: eligibility.daysActive,
      requiredDays: 7 as const
    };
  }

  private async checkTrainingCompletion(userId: string): Promise<{
    met: boolean;
    modulesCompleted: number;
    requiredModules: 8;
  }> {
    try {
      // Use the training service for proper tracking
      const completedCount = await trainingService.getCompletedModulesCount(userId);
      
      return {
        met: completedCount >= this.REQUIRED_TRAINING_MODULES,
        modulesCompleted: completedCount,
        requiredModules: 8 as const
      };
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupService.checkTrainingCompletion',
        userId
      });
      
      return {
        met: false,
        modulesCompleted: 0,
        requiredModules: 8 as const
      };
    }
  }

  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async initializeMemberActivityStats(
    userId: string, 
    groupId: string
  ): Promise<MemberActivityStats> {
    return {
      userId,
      groupId,
      last7DaysActive: false,
      totalStepsLogged: 0,
      totalFoodEntriesLogged: 0,
      trainingModulesCompleted: 0,
      groupInteractions: 0,
      weeklyStreaks: {
        currentStreak: 0,
        longestStreak: 0,
        lastStreakDate: new Date().toISOString().split('T')[0]
      },
      lastUpdated: new Date()
    };
  }

  // Storage helper methods
  private async saveGroup(group: Group): Promise<void> {
    const groups = this.loadGroups();
    const index = groups.findIndex(g => g.id === group.id);
    
    if (index >= 0) {
      groups[index] = group;
    } else {
      groups.push(group);
    }
    
    localStorage.setItem(GROUP_STORAGE_KEYS.USER_GROUPS, JSON.stringify(groups));
  }

  private loadGroups(): Group[] {
    try {
      const stored = localStorage.getItem(GROUP_STORAGE_KEYS.USER_GROUPS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  async getGroupById(groupId: string): Promise<Group | null> {
    const groups = this.loadGroups();
    return groups.find(g => g.id === groupId) || null;
  }

  async getGroupByInviteCode(inviteCode: string): Promise<Group | null> {
    const groups = this.loadGroups();
    const cleanCode = inviteCode.trim().toUpperCase().replace('-', '');
    return groups.find(g => g.inviteCode === cleanCode) || null;
  }

  private async saveGroupMember(member: GroupMember): Promise<void> {
    const members = this.loadGroupMembers();
    const index = members.findIndex(m => m.id === member.id);
    
    if (index >= 0) {
      members[index] = member;
    } else {
      members.push(member);
    }
    
    localStorage.setItem(GROUP_STORAGE_KEYS.GROUP_MEMBERS, JSON.stringify(members));
  }

  private loadGroupMembers(): GroupMember[] {
    try {
      const stored = localStorage.getItem(GROUP_STORAGE_KEYS.GROUP_MEMBERS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async updateGroup(group: Group): Promise<void> {
    const groups = this.loadGroups();
    const index = groups.findIndex(g => g.id === group.id);
    
    if (index >= 0) {
      groups[index] = group;
      localStorage.setItem(GROUP_STORAGE_KEYS.USER_GROUPS, JSON.stringify(groups));
    }
  }

  private async getGroupMember(groupId: string, userId: string): Promise<GroupMember | null> {
    const members = this.loadGroupMembers();
    return members.find(m => m.groupId === groupId && m.userId === userId) || null;
  }

  private async getUserMemberships(userId: string): Promise<GroupMember[]> {
    const members = this.loadGroupMembers();
    return members.filter(m => m.userId === userId);
  }

  private async saveInvitation(invitation: GroupInvitation): Promise<void> {
    const invitations = this.loadInvitations();
    invitations.push(invitation);
    localStorage.setItem(GROUP_STORAGE_KEYS.GROUP_INVITATIONS, JSON.stringify(invitations));
  }

  private loadInvitations(): GroupInvitation[] {
    try {
      const stored = localStorage.getItem(GROUP_STORAGE_KEYS.GROUP_INVITATIONS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async saveUserActivity(activity: UserActivity): Promise<void> {
    const activities = this.loadUserActivities();
    activities.push(activity);
    
    // Keep only last 90 days of activity
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    const filteredActivities = activities.filter(a => 
      new Date(a.createdAt) > cutoffDate
    );
    
    localStorage.setItem('wellness_user_activities', JSON.stringify(filteredActivities));
  }

  private loadUserActivities(): UserActivity[] {
    try {
      const stored = localStorage.getItem('wellness_user_activities');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async logGroupActivity(
    groupId: string,
    userId: string,
    activityType: string,
    content: string,
    metadata: any = {}
  ): Promise<void> {
    const activity: GroupActivity = {
      id: this.generateId('group_activity'),
      groupId,
      userId,
      activityType: activityType as any,
      content,
      metadata,
      createdAt: new Date(),
      reactions: []
    };

    const activities = this.loadGroupActivities();
    activities.push(activity);
    
    localStorage.setItem(GROUP_STORAGE_KEYS.GROUP_ACTIVITY, JSON.stringify(activities));
  }

  private loadGroupActivities(): GroupActivity[] {
    try {
      const stored = localStorage.getItem(GROUP_STORAGE_KEYS.GROUP_ACTIVITY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async updateMemberActivityStats(
    userId: string,
    groupId: string,
    activityType: ActivityType,
    metadata: any
  ): Promise<void> {
    // Implementation for updating member activity statistics
    // This would track the member's engagement and progress
  }


  private extractActivityValue(activityType: ActivityType, metadata: any): number {
    switch (activityType) {
      case 'steps':
        return metadata.steps || 0;
      case 'food_entry':
        return metadata.foodEntries || 1;
      case 'training_completion':
        return 1;
      case 'group_interaction':
        return 1;
      default:
        return 1;
    }
  }

  private async cleanupGroupData(groupId: string): Promise<void> {
    try {
      // Clean up group activities
      const activities = this.loadGroupActivities();
      const filteredActivities = activities.filter(a => a.groupId !== groupId);
      localStorage.setItem(GROUP_STORAGE_KEYS.GROUP_ACTIVITY, JSON.stringify(filteredActivities));

      // Clean up group invitations
      const invitations = this.loadInvitations();
      const filteredInvitations = invitations.filter(i => i.groupId !== groupId);
      localStorage.setItem(GROUP_STORAGE_KEYS.GROUP_INVITATIONS, JSON.stringify(filteredInvitations));

      // Note: Member activity data could be preserved for historical purposes
      // or cleaned up based on requirements

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupService.cleanupGroupData',
        groupId
      });
    }
  }
}

// Create singleton instance
export const groupService = new GroupService();
export default groupService;