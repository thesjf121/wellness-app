// Activity tracking service for group eligibility and engagement metrics

import { UserActivity, ActivityType, ActivityMetadata } from '../types/groups';
import { errorService } from './errorService';

class ActivityTrackingService {
  private readonly ACTIVITY_STORAGE_KEY = 'wellness_user_activities';
  private readonly ACTIVITY_RETENTION_DAYS = 90; // Keep 90 days of activity data

  /**
   * Track a user activity for group eligibility
   */
  async trackActivity(
    userId: string,
    activityType: ActivityType,
    metadata: ActivityMetadata = {},
    groupId?: string
  ): Promise<void> {
    try {
      const activity: UserActivity = {
        id: this.generateId(),
        userId,
        groupId,
        activityType,
        activityDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        metadata,
        createdAt: new Date()
      };

      await this.saveActivity(activity);
      
      errorService.logInfo('Activity tracked', {
        userId,
        activityType,
        date: activity.activityDate
      });
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'ActivityTrackingService.trackActivity',
        userId,
        activityType
      });
    }
  }

  /**
   * Get user's activity for the last N days
   */
  async getUserActivity(userId: string, days: number = 7): Promise<UserActivity[]> {
    try {
      const allActivities = this.loadActivities();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoffDateString = cutoffDate.toISOString().split('T')[0];

      return allActivities.filter(activity => 
        activity.userId === userId && 
        activity.activityDate >= cutoffDateString
      ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'ActivityTrackingService.getUserActivity',
        userId,
        days
      });
      return [];
    }
  }

  /**
   * Check if user has been active for the required number of days
   */
  async checkActivityEligibility(userId: string, requiredDays: number = 7): Promise<{
    met: boolean;
    daysActive: number;
    requiredDays: number;
    activeDates: string[];
    missingDates: string[];
  }> {
    try {
      const activities = await this.getUserActivity(userId, requiredDays);
      
      // Get unique dates with activity
      const activeDates = Array.from(new Set(activities.map(a => a.activityDate)));
      
      // Generate list of required dates
      const requiredDates = Array.from({ length: requiredDays }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      });

      // Find missing dates
      const missingDates = requiredDates.filter(date => !activeDates.includes(date));

      return {
        met: activeDates.length >= requiredDays,
        daysActive: activeDates.length,
        requiredDays,
        activeDates: activeDates.sort(),
        missingDates: missingDates.sort()
      };
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'ActivityTrackingService.checkActivityEligibility',
        userId,
        requiredDays
      });
      return {
        met: false,
        daysActive: 0,
        requiredDays,
        activeDates: [],
        missingDates: []
      };
    }
  }

  /**
   * Get activity summary for a user
   */
  async getActivitySummary(userId: string, days: number = 30): Promise<{
    totalActivities: number;
    activeDays: number;
    activityByType: Record<ActivityType, number>;
    streakCount: number;
    longestStreak: number;
    averageActivitiesPerDay: number;
  }> {
    try {
      const activities = await this.getUserActivity(userId, days);
      
      // Count activities by type
      const activityByType: Record<ActivityType, number> = {
        steps: 0,
        food_entry: 0,
        training_completion: 0,
        group_interaction: 0
      };

      activities.forEach(activity => {
        activityByType[activity.activityType] = (activityByType[activity.activityType] || 0) + 1;
      });

      // Calculate unique active days
      const activeDates = Array.from(new Set(activities.map(a => a.activityDate))).sort();
      
      // Calculate current streak
      const streakCount = this.calculateCurrentStreak(activeDates);
      const longestStreak = this.calculateLongestStreak(activeDates);

      return {
        totalActivities: activities.length,
        activeDays: activeDates.length,
        activityByType,
        streakCount,
        longestStreak,
        averageActivitiesPerDay: activeDates.length > 0 ? activities.length / activeDates.length : 0
      };
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'ActivityTrackingService.getActivitySummary',
        userId,
        days
      });
      return {
        totalActivities: 0,
        activeDays: 0,
        activityByType: { steps: 0, food_entry: 0, training_completion: 0, group_interaction: 0 },
        streakCount: 0,
        longestStreak: 0,
        averageActivitiesPerDay: 0
      };
    }
  }

  /**
   * Track step activity (called from steps service)
   */
  async trackStepActivity(userId: string, steps: number, groupId?: string): Promise<void> {
    await this.trackActivity(userId, 'steps', { steps }, groupId);
  }

  /**
   * Track food entry activity (called from food service)
   */
  async trackFoodActivity(userId: string, entryCount: number = 1, groupId?: string): Promise<void> {
    await this.trackActivity(userId, 'food_entry', { foodEntries: entryCount }, groupId);
  }

  /**
   * Track training completion (called from training service)
   */
  async trackTrainingActivity(userId: string, moduleId: string, groupId?: string): Promise<void> {
    await this.trackActivity(userId, 'training_completion', { trainingModule: moduleId }, groupId);
  }

  /**
   * Track group interaction (messages, reactions, etc.)
   */
  async trackGroupInteraction(
    userId: string, 
    groupId: string, 
    interactionType: 'message' | 'reaction' | 'achievement_share',
    targetId: string
  ): Promise<void> {
    await this.trackActivity(userId, 'group_interaction', {
      groupInteraction: {
        type: interactionType,
        targetId
      }
    }, groupId);
  }

  /**
   * Get detailed activity breakdown for dashboard
   */
  async getActivityBreakdown(userId: string, startDate: string, endDate: string): Promise<{
    dailyBreakdown: Array<{
      date: string;
      activities: UserActivity[];
      activityCount: number;
      activityTypes: string[];
    }>;
    summary: {
      totalDays: number;
      activeDays: number;
      totalActivities: number;
      consistencyPercentage: number;
    };
  }> {
    try {
      const allActivities = this.loadActivities();
      const userActivities = allActivities.filter(activity => 
        activity.userId === userId &&
        activity.activityDate >= startDate &&
        activity.activityDate <= endDate
      );

      // Group activities by date
      const activitiesByDate = userActivities.reduce((acc, activity) => {
        if (!acc[activity.activityDate]) {
          acc[activity.activityDate] = [];
        }
        acc[activity.activityDate].push(activity);
        return acc;
      }, {} as Record<string, UserActivity[]>);

      // Generate date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dateRange: string[] = [];
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dateRange.push(d.toISOString().split('T')[0]);
      }

      // Create daily breakdown
      const dailyBreakdown = dateRange.map(date => {
        const activities = activitiesByDate[date] || [];
        const activityTypes = Array.from(new Set(activities.map(a => a.activityType)));
        
        return {
          date,
          activities,
          activityCount: activities.length,
          activityTypes
        };
      });

      const activeDays = dailyBreakdown.filter(day => day.activityCount > 0).length;
      const consistencyPercentage = (activeDays / dateRange.length) * 100;

      return {
        dailyBreakdown,
        summary: {
          totalDays: dateRange.length,
          activeDays,
          totalActivities: userActivities.length,
          consistencyPercentage
        }
      };
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'ActivityTrackingService.getActivityBreakdown',
        userId,
        startDate,
        endDate
      });
      return {
        dailyBreakdown: [],
        summary: {
          totalDays: 0,
          activeDays: 0,
          totalActivities: 0,
          consistencyPercentage: 0
        }
      };
    }
  }

  // Private helper methods

  private calculateCurrentStreak(activeDates: string[]): number {
    if (activeDates.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    let currentDate = new Date();

    // Check backwards from today
    while (true) {
      const dateString = currentDate.toISOString().split('T')[0];
      
      if (activeDates.includes(dateString)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // Allow one day gap for today if user hasn't been active yet
        if (dateString === today && streak === 0) {
          currentDate.setDate(currentDate.getDate() - 1);
          continue;
        }
        break;
      }
    }

    return streak;
  }

  private calculateLongestStreak(activeDates: string[]): number {
    if (activeDates.length === 0) return 0;

    let longestStreak = 0;
    let currentStreak = 1;

    for (let i = 1; i < activeDates.length; i++) {
      const prevDate = new Date(activeDates[i - 1]);
      const currentDate = new Date(activeDates[i]);
      
      // Check if dates are consecutive
      const diffTime = currentDate.getTime() - prevDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }

    return Math.max(longestStreak, currentStreak);
  }

  private generateId(): string {
    return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async saveActivity(activity: UserActivity): Promise<void> {
    const activities = this.loadActivities();
    activities.push(activity);

    // Clean up old activities (keep only last 90 days)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.ACTIVITY_RETENTION_DAYS);
    const cutoffDateString = cutoffDate.toISOString().split('T')[0];

    const filteredActivities = activities.filter(a => a.activityDate >= cutoffDateString);

    localStorage.setItem(this.ACTIVITY_STORAGE_KEY, JSON.stringify(filteredActivities));
  }

  private loadActivities(): UserActivity[] {
    try {
      const stored = localStorage.getItem(this.ACTIVITY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'ActivityTrackingService.loadActivities'
      });
      return [];
    }
  }

  /**
   * Clear all activity data for a user (for testing/reset purposes)
   */
  async clearUserActivity(userId: string): Promise<void> {
    try {
      const activities = this.loadActivities();
      const filteredActivities = activities.filter(a => a.userId !== userId);
      localStorage.setItem(this.ACTIVITY_STORAGE_KEY, JSON.stringify(filteredActivities));
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'ActivityTrackingService.clearUserActivity',
        userId
      });
    }
  }

  /**
   * Simulate activity for testing (adds random activities for past days)
   */
  async simulateActivity(userId: string, days: number = 7): Promise<void> {
    try {
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];

        // Add 1-3 random activities per day
        const activitiesPerDay = Math.floor(Math.random() * 3) + 1;
        const activityTypes: ActivityType[] = ['steps', 'food_entry', 'training_completion'];

        for (let j = 0; j < activitiesPerDay; j++) {
          const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
          
          const activity: UserActivity = {
            id: this.generateId(),
            userId,
            activityType,
            activityDate: dateString,
            metadata: this.generateMockMetadata(activityType),
            createdAt: new Date(date.getTime() + j * 60000) // Spread activities throughout the day
          };

          const activities = this.loadActivities();
          activities.push(activity);
          localStorage.setItem(this.ACTIVITY_STORAGE_KEY, JSON.stringify(activities));
        }
      }

      console.log(`Simulated ${days} days of activity for user ${userId}`);
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'ActivityTrackingService.simulateActivity',
        userId,
        days
      });
    }
  }

  private generateMockMetadata(activityType: ActivityType): ActivityMetadata {
    switch (activityType) {
      case 'steps':
        return { steps: Math.floor(Math.random() * 5000) + 3000 };
      case 'food_entry':
        return { foodEntries: 1 };
      case 'training_completion':
        return { trainingModule: `module_${Math.floor(Math.random() * 8) + 1}` };
      default:
        return {};
    }
  }
}

// Create singleton instance
export const activityTrackingService = new ActivityTrackingService();
export default activityTrackingService;