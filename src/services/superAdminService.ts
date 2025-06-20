// Super admin service for system-wide group management and oversight

import { Group, GroupMember, GROUP_STORAGE_KEYS } from '../types/groups';
import { errorService } from './errorService';
import { groupService } from './groupService';
import { groupAnalyticsService, GroupAnalytics } from './groupAnalyticsService';
import { groupNotificationService } from './groupNotificationService';

export interface SystemOverview {
  totalGroups: number;
  totalMembers: number;
  activeGroups: number;
  inactiveGroups: number;
  totalMessages: number;
  totalAchievements: number;
  averageGroupSize: number;
  memberRetentionRate: number;
  mostActiveGroup: {
    groupId: string;
    groupName: string;
    activityScore: number;
  } | null;
  recentlyCreatedGroups: number; // Last 7 days
  systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
  lastUpdated: Date;
}

export interface GroupOverview {
  group: Group;
  memberCount: number;
  activeMembers: number;
  recentActivity: number; // Activities in last 7 days
  achievementCount: number;
  messageCount: number;
  healthScore: number; // 0-100
  status: 'thriving' | 'active' | 'declining' | 'inactive';
  lastActivity: Date;
  sponsor: {
    userId: string;
    isActive: boolean;
    lastSeen: Date;
  };
  flags: string[]; // Issues that need attention
}

export interface UserOverview {
  userId: string;
  groupMemberships: Array<{
    groupId: string;
    groupName: string;
    role: 'member' | 'sponsor' | 'super_admin';
    joinedAt: Date;
    isActive: boolean;
  }>;
  totalGroups: number;
  sponsoredGroups: number;
  totalAchievements: number;
  activityScore: number;
  isActive: boolean;
  lastSeen: Date;
  flags: string[];
}

export interface SystemAlert {
  id: string;
  type: 'group_inactive' | 'sponsor_inactive' | 'group_full' | 'low_engagement' | 'spam_detected' | 'error_spike';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  groupId?: string;
  userId?: string;
  data?: any;
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

class SuperAdminService {
  private readonly ALERTS_KEY = 'wellness_super_admin_alerts';
  
  /**
   * Get system-wide overview statistics
   */
  async getSystemOverview(): Promise<SystemOverview> {
    try {
      const allGroups = this.loadAllGroups();
      const allMembers = this.loadAllGroupMembers();
      const allMessages = this.loadAllMessages();
      const allAchievements = this.loadAllAchievements();

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Calculate active groups (groups with activity in last 7 days)
      const activeGroups = allGroups.filter(group => {
        const groupMembers = allMembers.filter(m => m.groupId === group.id);
        return groupMembers.some(member => 
          new Date(member.lastActiveAt) > weekAgo
        );
      }).length;

      // Calculate member retention (active members / total members)
      const activeMembers = allMembers.filter(member => 
        new Date(member.lastActiveAt) > weekAgo
      ).length;
      const memberRetentionRate = allMembers.length > 0 
        ? (activeMembers / allMembers.length) * 100 
        : 0;

      // Find most active group
      let mostActiveGroup: SystemOverview['mostActiveGroup'] = null;
      if (allGroups.length > 0) {
        const groupActivityScores = await Promise.all(
          allGroups.map(async (group) => {
            try {
              const analytics = await groupAnalyticsService.generateGroupAnalytics(group.id);
              return {
                groupId: group.id,
                groupName: group.name,
                activityScore: analytics.memberEngagement.averageActivityScore
              };
            } catch {
              return {
                groupId: group.id,
                groupName: group.name,
                activityScore: 0
              };
            }
          })
        );

        mostActiveGroup = groupActivityScores.reduce((max, current) => 
          current.activityScore > max.activityScore ? current : max
        );
      }

      // Recently created groups
      const recentlyCreatedGroups = allGroups.filter(group => 
        new Date(group.createdAt) > weekAgo
      ).length;

      // Calculate average group size
      const averageGroupSize = allGroups.length > 0 
        ? allMembers.length / allGroups.length 
        : 0;

      // Determine system health
      let systemHealth: SystemOverview['systemHealth'] = 'poor';
      if (memberRetentionRate >= 80 && activeGroups >= allGroups.length * 0.8) {
        systemHealth = 'excellent';
      } else if (memberRetentionRate >= 60 && activeGroups >= allGroups.length * 0.6) {
        systemHealth = 'good';
      } else if (memberRetentionRate >= 40 && activeGroups >= allGroups.length * 0.4) {
        systemHealth = 'fair';
      }

      return {
        totalGroups: allGroups.length,
        totalMembers: allMembers.length,
        activeGroups,
        inactiveGroups: allGroups.length - activeGroups,
        totalMessages: allMessages.length,
        totalAchievements: allAchievements.length,
        averageGroupSize: Math.round(averageGroupSize * 10) / 10,
        memberRetentionRate: Math.round(memberRetentionRate),
        mostActiveGroup,
        recentlyCreatedGroups,
        systemHealth,
        lastUpdated: now
      };
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'SuperAdminService.getSystemOverview'
      });
      throw error;
    }
  }

  /**
   * Get overview of all groups with health metrics
   */
  async getAllGroupsOverview(): Promise<GroupOverview[]> {
    try {
      const allGroups = this.loadAllGroups();
      const allMembers = this.loadAllGroupMembers();
      const allMessages = this.loadAllMessages();
      const allAchievements = this.loadAllAchievements();

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const groupOverviews = await Promise.all(
        allGroups.map(async (group) => {
          const groupMembers = allMembers.filter(m => m.groupId === group.id);
          const activeMembers = groupMembers.filter(member => 
            new Date(member.lastActiveAt) > weekAgo
          );
          
          const groupMessages = allMessages.filter(m => m.groupId === group.id);
          const recentMessages = groupMessages.filter(msg => 
            new Date(msg.createdAt) > weekAgo
          );
          
          const groupAchievements = allAchievements.filter(a => a.groupId === group.id);
          
          // Find sponsor
          const sponsor = groupMembers.find(m => m.role === 'sponsor');
          const sponsorInfo = sponsor ? {
            userId: sponsor.userId,
            isActive: new Date(sponsor.lastActiveAt) > weekAgo,
            lastSeen: sponsor.lastActiveAt
          } : {
            userId: 'unknown',
            isActive: false,
            lastSeen: new Date(0)
          };

          // Calculate health score (0-100)
          let healthScore = 0;
          const memberActivityRate = groupMembers.length > 0 ? (activeMembers.length / groupMembers.length) : 0;
          const messageActivityRate = recentMessages.length / 7; // Messages per day
          const achievementRate = groupAchievements.length / Math.max(1, groupMembers.length);

          healthScore += memberActivityRate * 40; // 40 points for member activity
          healthScore += Math.min(messageActivityRate * 10, 30); // Up to 30 points for messaging
          healthScore += Math.min(achievementRate * 10, 20); // Up to 20 points for achievements
          healthScore += sponsorInfo.isActive ? 10 : 0; // 10 points for active sponsor

          // Determine status
          let status: GroupOverview['status'] = 'inactive';
          if (healthScore >= 80) status = 'thriving';
          else if (healthScore >= 60) status = 'active';
          else if (healthScore >= 30) status = 'declining';

          // Identify flags/issues
          const flags: string[] = [];
          if (!sponsorInfo.isActive) flags.push('Inactive sponsor');
          if (memberActivityRate < 0.3) flags.push('Low member engagement');
          if (groupMembers.length === 0) flags.push('No members');
          if (group.currentMemberCount >= group.maxMembers) flags.push('Group full');
          if (recentMessages.length === 0) flags.push('No recent messages');

          // Get last activity date
          const lastActivity = groupMembers.length > 0 
            ? new Date(Math.max(...groupMembers.map(m => new Date(m.lastActiveAt).getTime())))
            : group.createdAt;

          return {
            group,
            memberCount: groupMembers.length,
            activeMembers: activeMembers.length,
            recentActivity: recentMessages.length,
            achievementCount: groupAchievements.length,
            messageCount: groupMessages.length,
            healthScore: Math.round(healthScore),
            status,
            lastActivity,
            sponsor: sponsorInfo,
            flags
          };
        })
      );

      // Sort by health score (descending)
      return groupOverviews.sort((a, b) => b.healthScore - a.healthScore);
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'SuperAdminService.getAllGroupsOverview'
      });
      throw error;
    }
  }

  /**
   * Get overview of all users across groups
   */
  async getAllUsersOverview(): Promise<UserOverview[]> {
    try {
      const allMembers = this.loadAllGroupMembers();
      const allGroups = this.loadAllGroups();
      const allAchievements = this.loadAllAchievements();

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Group members by user
      const userMap = new Map<string, GroupMember[]>();
      for (const member of allMembers) {
        if (!userMap.has(member.userId)) {
          userMap.set(member.userId, []);
        }
        userMap.get(member.userId)!.push(member);
      }

      const userOverviews: UserOverview[] = [];

      for (const [userId, userMemberships] of userMap.entries()) {
        const groupMemberships = userMemberships.map(membership => {
          const group = allGroups.find(g => g.id === membership.groupId);
          return {
            groupId: membership.groupId,
            groupName: group?.name || 'Unknown Group',
            role: membership.role,
            joinedAt: membership.joinedAt,
            isActive: new Date(membership.lastActiveAt) > weekAgo
          };
        });

        const sponsoredGroups = userMemberships.filter(m => m.role === 'sponsor').length;
        const userAchievements = allAchievements.filter(a => a.userId === userId);
        
        // Calculate activity score
        const activeMemberships = groupMemberships.filter(gm => gm.isActive).length;
        const activityScore = groupMemberships.length > 0 
          ? (activeMemberships / groupMemberships.length) * 100 
          : 0;

        const isActive = groupMemberships.some(gm => gm.isActive);
        const lastSeen = new Date(Math.max(...userMemberships.map(m => new Date(m.lastActiveAt).getTime())));

        // Identify flags
        const flags: string[] = [];
        if (!isActive) flags.push('Inactive user');
        if (sponsoredGroups > 0 && !groupMemberships.some(gm => gm.role === 'sponsor' && gm.isActive)) {
          flags.push('Inactive sponsor');
        }
        if (groupMemberships.length > 5) flags.push('Too many groups');

        userOverviews.push({
          userId,
          groupMemberships,
          totalGroups: groupMemberships.length,
          sponsoredGroups,
          totalAchievements: userAchievements.length,
          activityScore: Math.round(activityScore),
          isActive,
          lastSeen,
          flags
        });
      }

      // Sort by activity score (descending)
      return userOverviews.sort((a, b) => b.activityScore - a.activityScore);
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'SuperAdminService.getAllUsersOverview'
      });
      throw error;
    }
  }

  /**
   * Get system alerts and issues
   */
  async getSystemAlerts(): Promise<SystemAlert[]> {
    try {
      let alerts = this.loadAlerts();
      
      // Generate new alerts based on current system state
      const newAlerts = await this.generateSystemAlerts();
      
      // Add new alerts
      for (const newAlert of newAlerts) {
        const existingAlert = alerts.find(a => 
          a.type === newAlert.type && 
          a.groupId === newAlert.groupId && 
          a.userId === newAlert.userId &&
          !a.resolvedAt
        );
        
        if (!existingAlert) {
          alerts.push(newAlert);
        }
      }

      // Save updated alerts
      localStorage.setItem(this.ALERTS_KEY, JSON.stringify(alerts));

      // Return unresolved alerts sorted by severity and date
      return alerts
        .filter(alert => !alert.resolvedAt)
        .sort((a, b) => {
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
          if (severityDiff !== 0) return severityDiff;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'SuperAdminService.getSystemAlerts'
      });
      return [];
    }
  }

  /**
   * Resolve a system alert
   */
  async resolveAlert(alertId: string, adminUserId: string): Promise<void> {
    try {
      const alerts = this.loadAlerts();
      const alertIndex = alerts.findIndex(a => a.id === alertId);
      
      if (alertIndex >= 0) {
        alerts[alertIndex].resolvedAt = new Date();
        alerts[alertIndex].resolvedBy = adminUserId;
        localStorage.setItem(this.ALERTS_KEY, JSON.stringify(alerts));
      }
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'SuperAdminService.resolveAlert',
        alertId,
        adminUserId
      });
      throw error;
    }
  }

  /**
   * Force delete a group (super admin only)
   */
  async forceDeleteGroup(groupId: string, adminUserId: string, reason: string): Promise<void> {
    try {
      const group = await groupService.getGroupById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      // Log the action
      errorService.logInfo('Super admin force deleted group', {
        groupId,
        groupName: group.name,
        adminUserId,
        reason
      });

      // Notify all members
      await groupNotificationService.sendGroupNotification(
        groupId,
        'group_deleted',
        'Group Deleted by Administrator',
        `This group has been deleted by an administrator. Reason: ${reason}`,
        {
          data: { adminUserId, reason },
          priority: 'high',
          isPersistent: true
        }
      );

      // Delete the group
      await groupService.deleteGroup(groupId, group.sponsorId);

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'SuperAdminService.forceDeleteGroup',
        groupId,
        adminUserId
      });
      throw error;
    }
  }

  /**
   * Suspend a user from all groups
   */
  async suspendUser(userId: string, adminUserId: string, reason: string, durationDays?: number): Promise<void> {
    try {
      const userMemberships = this.loadAllGroupMembers().filter(m => m.userId === userId);
      
      // Remove user from all groups
      for (const membership of userMemberships) {
        try {
          if (membership.role === 'sponsor') {
            // Transfer ownership first or delete group if no other members
            const groupMembers = await groupService.getGroupMembers(membership.groupId);
            const otherMembers = groupMembers.filter(m => m.userId !== userId);
            
            if (otherMembers.length > 0) {
              // Transfer to first available member
              await groupService.transferOwnership(membership.groupId, userId, otherMembers[0].userId);
            } else {
              // Delete empty group
              await this.forceDeleteGroup(membership.groupId, adminUserId, 'Group sponsor suspended');
            }
          } else {
            // Remove as regular member
            await groupService.removeMember(membership.groupId, userId, adminUserId);
          }
        } catch (error) {
          errorService.logError(error as Error, {
            context: 'SuperAdminService.suspendUser.removeMember',
            groupId: membership.groupId,
            userId
          });
        }
      }

      // Log the suspension
      errorService.logInfo('User suspended by super admin', {
        userId,
        adminUserId,
        reason,
        durationDays,
        groupsAffected: userMemberships.length
      });

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'SuperAdminService.suspendUser',
        userId,
        adminUserId
      });
      throw error;
    }
  }

  // Private helper methods

  private async generateSystemAlerts(): Promise<SystemAlert[]> {
    const alerts: SystemAlert[] = [];
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    try {
      const groupOverviews = await this.getAllGroupsOverview();
      
      for (const overview of groupOverviews) {
        // Inactive sponsor alert
        if (!overview.sponsor.isActive) {
          alerts.push({
            id: this.generateId('alert'),
            type: 'sponsor_inactive',
            severity: 'medium',
            title: 'Inactive Group Sponsor',
            message: `Sponsor of "${overview.group.name}" has been inactive for over a week`,
            groupId: overview.group.id,
            userId: overview.sponsor.userId,
            data: { lastSeen: overview.sponsor.lastSeen },
            createdAt: now
          });
        }

        // Low engagement alert
        if (overview.healthScore < 30 && overview.memberCount > 0) {
          alerts.push({
            id: this.generateId('alert'),
            type: 'low_engagement',
            severity: 'low',
            title: 'Low Group Engagement',
            message: `"${overview.group.name}" has low engagement (Health Score: ${overview.healthScore})`,
            groupId: overview.group.id,
            data: { healthScore: overview.healthScore, memberCount: overview.memberCount },
            createdAt: now
          });
        }

        // Group full alert
        if (overview.group.currentMemberCount >= overview.group.maxMembers) {
          alerts.push({
            id: this.generateId('alert'),
            type: 'group_full',
            severity: 'low',
            title: 'Group at Capacity',
            message: `"${overview.group.name}" is at maximum capacity (${overview.group.currentMemberCount}/${overview.group.maxMembers})`,
            groupId: overview.group.id,
            data: { memberCount: overview.group.currentMemberCount, maxMembers: overview.group.maxMembers },
            createdAt: now
          });
        }

        // Inactive group alert
        if (new Date(overview.lastActivity) < weekAgo && overview.memberCount > 0) {
          alerts.push({
            id: this.generateId('alert'),
            type: 'group_inactive',
            severity: 'medium',
            title: 'Inactive Group',
            message: `"${overview.group.name}" has had no activity for over a week`,
            groupId: overview.group.id,
            data: { lastActivity: overview.lastActivity, memberCount: overview.memberCount },
            createdAt: now
          });
        }
      }

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'SuperAdminService.generateSystemAlerts'
      });
    }

    return alerts;
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadAllGroups(): Group[] {
    try {
      const stored = localStorage.getItem(GROUP_STORAGE_KEYS.USER_GROUPS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private loadAllGroupMembers(): GroupMember[] {
    try {
      const stored = localStorage.getItem(GROUP_STORAGE_KEYS.GROUP_MEMBERS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private loadAllMessages(): any[] {
    try {
      const stored = localStorage.getItem(GROUP_STORAGE_KEYS.GROUP_MESSAGES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private loadAllAchievements(): any[] {
    try {
      const stored = localStorage.getItem(GROUP_STORAGE_KEYS.MEMBER_ACHIEVEMENTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private loadAlerts(): SystemAlert[] {
    try {
      const stored = localStorage.getItem(this.ALERTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

export const superAdminService = new SuperAdminService();
export default superAdminService;