// Service for managing group activity feed and notifications

import { errorService } from './errorService';
import { groupService } from './groupService';
import { groupNotificationService } from './groupNotificationService';

interface GroupFeedActivity {
  id: string;
  groupId: string;
  userId: string;
  activityType: 'steps_milestone' | 'food_streak' | 'training_complete' | 'member_joined' | 'achievement_earned';
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  isHighlight: boolean; // Special activities that should be prominently displayed
  metadata: {
    value?: number;
    milestone?: string;
    streakDays?: number;
    achievementType?: string;
  };
  createdAt: Date;
}

class GroupActivityFeedService {
  private readonly STORAGE_KEY = 'wellness_group_feed_activities';

  /**
   * Log a milestone activity (e.g., 10,000 steps, 7-day streak)
   */
  async logMilestoneActivity(
    groupId: string,
    userId: string,
    milestoneType: 'daily_steps' | 'weekly_food_streak' | 'training_module',
    value: number,
    metadata: any = {}
  ): Promise<void> {
    try {
      let activityType: GroupFeedActivity['activityType'];
      let title: string;
      let description: string;
      let icon: string;
      let iconColor: string;
      let isHighlight = false;

      switch (milestoneType) {
        case 'daily_steps':
          if (value >= 10000) {
            activityType = 'steps_milestone';
            title = `${value.toLocaleString()} steps reached!`;
            description = `Hit their daily step goal`;
            icon = '🏆';
            iconColor = 'bg-yellow-100 text-yellow-600';
            isHighlight = true;
          } else {
            return; // Don't log non-milestone steps
          }
          break;

        case 'weekly_food_streak':
          if (value >= 7) {
            activityType = 'food_streak';
            title = `${value}-day food logging streak!`;
            description = `Consistently logging their meals`;
            icon = '🔥';
            iconColor = 'bg-orange-100 text-orange-600';
            isHighlight = value >= 14; // 2+ weeks is highlight
          } else {
            return; // Don't log short streaks
          }
          break;

        case 'training_module':
          activityType = 'training_complete';
          title = `Training module completed!`;
          description = `Finished module ${value}`;
          icon = '🎓';
          iconColor = 'bg-purple-100 text-purple-600';
          isHighlight = value === 8; // Final module is highlight
          break;

        default:
          return;
      }

      const activity: GroupFeedActivity = {
        id: this.generateId('feed'),
        groupId,
        userId,
        activityType,
        title,
        description,
        icon,
        iconColor,
        isHighlight,
        metadata: {
          value,
          milestone: milestoneType,
          ...metadata
        },
        createdAt: new Date()
      };

      await this.saveFeedActivity(activity);

      // Send milestone notification if it's a highlight
      if (isHighlight) {
        await groupNotificationService.notifyMilestoneReached(groupId, userId, title);
      }

      errorService.logInfo('Milestone activity logged', {
        groupId,
        userId,
        milestoneType,
        value
      });

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupActivityFeedService.logMilestoneActivity',
        groupId,
        userId,
        milestoneType
      });
    }
  }

  /**
   * Log member joining activity
   */
  async logMemberJoined(groupId: string, userId: string): Promise<void> {
    try {
      const activity: GroupFeedActivity = {
        id: this.generateId('feed'),
        groupId,
        userId,
        activityType: 'member_joined',
        title: 'New member joined!',
        description: 'Welcomed to the group',
        icon: '👋',
        iconColor: 'bg-blue-100 text-blue-600',
        isHighlight: true,
        metadata: {},
        createdAt: new Date()
      };

      await this.saveFeedActivity(activity);

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupActivityFeedService.logMemberJoined',
        groupId,
        userId
      });
    }
  }

  /**
   * Log achievement earned
   */
  async logAchievementEarned(
    groupId: string,
    userId: string,
    achievementTitle: string,
    achievementIcon: string,
    metadata: any = {}
  ): Promise<void> {
    try {
      const activity: GroupFeedActivity = {
        id: this.generateId('feed'),
        groupId,
        userId,
        activityType: 'achievement_earned',
        title: `Achievement unlocked!`,
        description: achievementTitle,
        icon: achievementIcon,
        iconColor: 'bg-yellow-100 text-yellow-600',
        isHighlight: true,
        metadata: {
          ...metadata
        },
        createdAt: new Date()
      };

      await this.saveFeedActivity(activity);

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupActivityFeedService.logAchievementEarned',
        groupId,
        userId
      });
    }
  }

  /**
   * Get recent feed activities for a group
   */
  async getGroupFeedActivities(groupId: string, limit: number = 20): Promise<GroupFeedActivity[]> {
    try {
      const activities = this.loadFeedActivities();
      
      return activities
        .filter(activity => activity.groupId === groupId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupActivityFeedService.getGroupFeedActivities',
        groupId
      });
      return [];
    }
  }

  /**
   * Get highlight activities (special milestones)
   */
  async getGroupHighlights(groupId: string, limit: number = 5): Promise<GroupFeedActivity[]> {
    try {
      const activities = await this.getGroupFeedActivities(groupId, 50);
      
      return activities
        .filter(activity => activity.isHighlight)
        .slice(0, limit);

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupActivityFeedService.getGroupHighlights',
        groupId
      });
      return [];
    }
  }

  /**
   * Auto-detect and log milestones from regular activities
   */
  async checkAndLogMilestones(
    groupId: string,
    userId: string,
    activityType: string,
    value: number,
    metadata: any = {}
  ): Promise<void> {
    try {
      switch (activityType) {
        case 'steps':
          // Check for daily step milestones
          if (value >= 10000) {
            await this.logMilestoneActivity(groupId, userId, 'daily_steps', value, metadata);
          }
          break;

        case 'food_entry':
          // Check for food logging streaks
          const foodStreak = await this.calculateFoodStreak(userId);
          if (foodStreak >= 7 && foodStreak % 7 === 0) { // Every 7 days
            await this.logMilestoneActivity(groupId, userId, 'weekly_food_streak', foodStreak, metadata);
          }
          break;

        case 'training_completion':
          // Log training module completion
          await this.logMilestoneActivity(groupId, userId, 'training_module', value, metadata);
          break;
      }

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupActivityFeedService.checkAndLogMilestones',
        groupId,
        userId
      });
    }
  }

  // Helper methods
  private async calculateFoodStreak(userId: string): Promise<number> {
    // This would calculate current food logging streak
    // For now, return a mock value
    return Math.floor(Math.random() * 14) + 1;
  }

  private async saveFeedActivity(activity: GroupFeedActivity): Promise<void> {
    const activities = this.loadFeedActivities();
    activities.push(activity);

    // Keep only last 90 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    const filteredActivities = activities.filter(a => 
      new Date(a.createdAt) > cutoffDate
    );

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredActivities));
  }

  private loadFeedActivities(): GroupFeedActivity[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create singleton instance
export const groupActivityFeedService = new GroupActivityFeedService();
export default groupActivityFeedService;