import { MemberAchievement, AchievementType, GROUP_STORAGE_KEYS } from '../types/groups';
import { errorService } from './errorService';
import { memberActivityService } from './memberActivityService';
import { groupService } from './groupService';
import { groupActivityFeedService } from './groupActivityFeedService';
import { groupMessagingService } from './groupMessagingService';
import { groupNotificationService } from './groupNotificationService';

interface AchievementDefinition {
  type: AchievementType;
  title: string;
  description: string;
  iconEmoji: string;
  checkCondition: (userId: string, groupId: string, activityData?: any) => Promise<boolean>;
  category: 'activity' | 'consistency' | 'social' | 'milestone';
  difficulty: 'easy' | 'medium' | 'hard';
}

class GroupAchievementService {
  private readonly achievementDefinitions: AchievementDefinition[] = [
    {
      type: 'first_week_complete',
      title: 'First Week Warrior',
      description: 'Stayed active for your first 7 days in the group',
      iconEmoji: '🏆',
      category: 'milestone',
      difficulty: 'easy',
      checkCondition: async (userId: string, groupId: string) => {
        const members = await groupService.getGroupMembers(groupId);
        const userMember = members.find(m => m.userId === userId);
        if (!userMember) return false;
        
        const daysSinceJoin = Math.floor(
          (new Date().getTime() - new Date(userMember.joinedAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceJoin < 7) return false;
        
        const allActivities = await memberActivityService.getGroupMemberActivities(groupId, 7);
        const activities = allActivities.filter(a => a.userId === userId);
        return activities.length >= 5; // Active at least 5 of 7 days
      }
    },
    {
      type: 'step_goal_streak',
      title: 'Step Master',
      description: 'Reached daily step goal for 7 consecutive days',
      iconEmoji: '👟',
      category: 'activity',
      difficulty: 'medium',
      checkCondition: async (userId: string, groupId: string) => {
        const groups = JSON.parse(localStorage.getItem('wellness_user_groups') || '[]');
        const group = groups.find((g: any) => g.id === groupId);
        if (!group) return false;
        
        const stepGoal = group.settings.activityGoals.dailyStepsGoal;
        const allActivities = await memberActivityService.getGroupMemberActivities(groupId, 7);
        const activities = allActivities.filter(a => a.userId === userId);
        
        // Check if last 7 days all have step activities meeting goal
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        });
        
        return last7Days.every(date => {
          const dayActivity = activities.find(a => 
            a.activityType === 'steps' && 
            a.createdAt.toISOString().split('T')[0] === date
          );
          return dayActivity && dayActivity.value >= stepGoal;
        });
      }
    },
    {
      type: 'food_logging_champion',
      title: 'Nutrition Champion',
      description: 'Logged food entries for 14 consecutive days',
      iconEmoji: '🥗',
      category: 'consistency',
      difficulty: 'medium',
      checkCondition: async (userId: string, groupId: string) => {
        const allActivities = await memberActivityService.getGroupMemberActivities(groupId, 14);
        const activities = allActivities.filter(a => a.userId === userId);
        
        const last14Days = Array.from({ length: 14 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        });
        
        return last14Days.every(date => {
          return activities.some(a => 
            a.activityType === 'food_entry' && 
            a.createdAt.toISOString().split('T')[0] === date
          );
        });
      }
    },
    {
      type: 'training_graduate',
      title: 'Training Graduate',
      description: 'Completed 5 training modules while in the group',
      iconEmoji: '🎓',
      category: 'milestone',
      difficulty: 'medium',
      checkCondition: async (userId: string, groupId: string) => {
        const allActivities = await memberActivityService.getGroupMemberActivities(groupId, 30);
        const activities = allActivities.filter(a => a.userId === userId);
        const trainingActivities = activities.filter(a => a.activityType === 'training_completion');
        return trainingActivities.length >= 5;
      }
    },
    {
      type: 'group_motivator',
      title: 'Group Motivator',
      description: 'Most active member in group interactions this month',
      iconEmoji: '🌟',
      category: 'social',
      difficulty: 'hard',
      checkCondition: async (userId: string, groupId: string) => {
        const members = await groupService.getGroupMembers(groupId);
        if (members.length < 3) return false; // Need at least 3 members
        
        const allMemberInteractions = await Promise.all(
          members.map(async (member) => {
            const allActivities = await memberActivityService.getGroupMemberActivities(groupId, 30);
          const activities = allActivities.filter(a => a.userId === member.userId);
            const interactions = activities.filter(a => a.activityType === 'group_interaction');
            return { userId: member.userId, count: interactions.length };
          })
        );
        
        const sortedByInteractions = allMemberInteractions.sort((a, b) => b.count - a.count);
        return sortedByInteractions[0]?.userId === userId && sortedByInteractions[0]?.count >= 10;
      }
    },
    {
      type: 'consistency_king',
      title: 'Consistency King',
      description: 'Active every single day for 30 days straight',
      iconEmoji: '👑',
      category: 'consistency',
      difficulty: 'hard',
      checkCondition: async (userId: string, groupId: string) => {
        const allActivities = await memberActivityService.getGroupMemberActivities(groupId, 30);
        const activities = allActivities.filter(a => a.userId === userId);
        
        const last30Days = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        });
        
        return last30Days.every(date => {
          return activities.some(a => 
            a.createdAt.toISOString().split('T')[0] === date
          );
        });
      }
    },
    {
      type: 'milestone_crusher',
      title: 'Milestone Crusher',
      description: 'Achieved 3 different personal milestones in one week',
      iconEmoji: '💥',
      category: 'milestone',
      difficulty: 'hard',
      checkCondition: async (userId: string, groupId: string) => {
        const feedActivities = await groupActivityFeedService.getGroupFeedActivities(groupId, 50);
        const userMilestones = feedActivities.filter(a => 
          a.userId === userId && 
          (a.activityType === 'steps_milestone' || a.activityType === 'food_streak' || a.activityType === 'training_complete') &&
          new Date(a.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
        
        return userMilestones.length >= 3;
      }
    }
  ];

  /**
   * Check if a user has earned any new achievements
   */
  async checkUserAchievements(userId: string, groupId: string, triggerActivity?: string): Promise<MemberAchievement[]> {
    try {
      const existingAchievements = await this.getUserAchievements(userId, groupId);
      const earnedTypes = new Set(existingAchievements.map(a => a.achievementType));
      const newAchievements: MemberAchievement[] = [];

      // Check each achievement definition
      for (const definition of this.achievementDefinitions) {
        if (earnedTypes.has(definition.type)) continue; // Already earned
        
        try {
          const earned = await definition.checkCondition(userId, groupId);
          if (earned) {
            const achievement = await this.awardAchievement(userId, groupId, definition);
            newAchievements.push(achievement);
          }
        } catch (error) {
          errorService.logError(error as Error, {
            context: 'GroupAchievementService.checkUserAchievements',
            achievementType: definition.type,
            userId,
            groupId
          });
        }
      }

      return newAchievements;
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupAchievementService.checkUserAchievements',
        userId,
        groupId
      });
      return [];
    }
  }

  /**
   * Award an achievement to a user
   */
  async awardAchievement(
    userId: string, 
    groupId: string, 
    definition: AchievementDefinition
  ): Promise<MemberAchievement> {
    try {
      const achievement: MemberAchievement = {
        id: this.generateId('achievement'),
        userId,
        groupId,
        achievementType: definition.type,
        title: definition.title,
        description: definition.description,
        iconEmoji: definition.iconEmoji,
        earnedAt: new Date(),
        isSharedWithGroup: true // Default to sharing
      };

      // Save achievement
      await this.saveAchievement(achievement);

      // Update member's achievement list
      await this.updateMemberAchievements(userId, groupId, achievement);

      // Log to group activity feed
      await groupActivityFeedService.logAchievementEarned(
        groupId,
        userId,
        achievement.title,
        achievement.iconEmoji,
        {
          difficulty: definition.difficulty,
          category: definition.category,
          description: achievement.description
        }
      );

      // Send achievement notification to group chat
      await groupMessagingService.sendSystemNotification(
        groupId,
        `🏆 User ${userId.slice(-8)} earned the "${achievement.title}" achievement! ${achievement.iconEmoji}`
      );

      // Send notifications to group members
      await groupNotificationService.notifyAchievementEarned(groupId, userId, achievement.title);

      errorService.logInfo('Achievement awarded', {
        achievementId: achievement.id,
        achievementType: achievement.achievementType,
        userId,
        groupId
      });

      return achievement;
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupAchievementService.awardAchievement',
        userId,
        groupId,
        achievementType: definition.type
      });
      throw error;
    }
  }

  /**
   * Get all achievements for a user in a group
   */
  async getUserAchievements(userId: string, groupId: string): Promise<MemberAchievement[]> {
    try {
      const allAchievements = this.loadAchievements();
      return allAchievements.filter(a => a.userId === userId && a.groupId === groupId)
        .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime());
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupAchievementService.getUserAchievements',
        userId,
        groupId
      });
      return [];
    }
  }

  /**
   * Get all achievements for a group
   */
  async getGroupAchievements(groupId: string): Promise<MemberAchievement[]> {
    try {
      const allAchievements = this.loadAchievements();
      return allAchievements.filter(a => a.groupId === groupId && a.isSharedWithGroup)
        .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime());
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupAchievementService.getGroupAchievements',
        groupId
      });
      return [];
    }
  }

  /**
   * Get achievement leaderboard for a group
   */
  async getGroupLeaderboard(groupId: string): Promise<Array<{
    userId: string;
    achievementCount: number;
    achievements: MemberAchievement[];
    categories: Record<string, number>;
  }>> {
    try {
      const groupAchievements = await this.getGroupAchievements(groupId);
      const memberMap = new Map<string, MemberAchievement[]>();

      // Group achievements by user
      for (const achievement of groupAchievements) {
        if (!memberMap.has(achievement.userId)) {
          memberMap.set(achievement.userId, []);
        }
        memberMap.get(achievement.userId)!.push(achievement);
      }

      // Create leaderboard entries
      const leaderboard = Array.from(memberMap.entries()).map(([userId, achievements]) => {
        const categories = achievements.reduce((acc, achievement) => {
          const definition = this.achievementDefinitions.find(d => d.type === achievement.achievementType);
          const category = definition?.category || 'other';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return {
          userId,
          achievementCount: achievements.length,
          achievements: achievements.slice(0, 5), // Top 5 most recent
          categories
        };
      });

      // Sort by achievement count
      return leaderboard.sort((a, b) => b.achievementCount - a.achievementCount);
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupAchievementService.getGroupLeaderboard',
        groupId
      });
      return [];
    }
  }

  /**
   * Get available achievements (definitions)
   */
  getAvailableAchievements(): AchievementDefinition[] {
    return this.achievementDefinitions.map(def => ({
      ...def,
      checkCondition: undefined as any // Don't expose the check function
    }));
  }

  /**
   * Get achievement progress for a user
   */
  async getUserAchievementProgress(userId: string, groupId: string): Promise<Array<{
    type: AchievementType;
    title: string;
    description: string;
    iconEmoji: string;
    isEarned: boolean;
    earnedAt?: Date;
    category: string;
    difficulty: string;
    progress?: {
      current: number;
      target: number;
      percentage: number;
    };
  }>> {
    try {
      const userAchievements = await this.getUserAchievements(userId, groupId);
      const earnedTypes = new Set(userAchievements.map(a => a.achievementType));

      return this.achievementDefinitions.map(def => {
        const earned = userAchievements.find(a => a.achievementType === def.type);
        
        return {
          type: def.type,
          title: def.title,
          description: def.description,
          iconEmoji: def.iconEmoji,
          isEarned: earnedTypes.has(def.type),
          earnedAt: earned?.earnedAt,
          category: def.category,
          difficulty: def.difficulty,
          // TODO: Add progress calculation for partially completed achievements
          progress: undefined
        };
      });
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupAchievementService.getUserAchievementProgress',
        userId,
        groupId
      });
      return [];
    }
  }

  // Private helper methods

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async saveAchievement(achievement: MemberAchievement): Promise<void> {
    const achievements = this.loadAchievements();
    achievements.push(achievement);
    localStorage.setItem(GROUP_STORAGE_KEYS.MEMBER_ACHIEVEMENTS, JSON.stringify(achievements));
  }

  private loadAchievements(): MemberAchievement[] {
    try {
      const stored = localStorage.getItem(GROUP_STORAGE_KEYS.MEMBER_ACHIEVEMENTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async updateMemberAchievements(
    userId: string, 
    groupId: string, 
    achievement: MemberAchievement
  ): Promise<void> {
    // This would update the member's achievement list in the GroupMember record
    // For now, achievements are stored separately and referenced by userId + groupId
  }

}

export const groupAchievementService = new GroupAchievementService();
export default groupAchievementService;