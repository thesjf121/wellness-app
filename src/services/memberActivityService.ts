// Member activity tracking service for group engagement monitoring

import { 
  GroupMember, 
  MemberActivityStats, 
  ActivityType, 
  GROUP_STORAGE_KEYS 
} from '../types/groups';
import { errorService } from './errorService';

interface MemberActivityEntry {
  id: string;
  memberId: string;
  groupId: string;
  userId: string;
  activityType: ActivityType;
  activityDate: string; // YYYY-MM-DD
  value: number; // steps count, food entries count, etc.
  metadata: {
    details?: string;
    source?: 'manual' | 'auto';
    achievements?: string[];
  };
  createdAt: Date;
}

interface MemberEngagementMetrics {
  memberId: string;
  groupId: string;
  last7Days: {
    stepsLogged: number;
    foodEntriesLogged: number;
    trainingModulesCompleted: number;
    groupInteractions: number;
    activeDays: number;
  };
  last30Days: {
    stepsLogged: number;
    foodEntriesLogged: number;
    trainingModulesCompleted: number;
    groupInteractions: number;
    activeDays: number;
  };
  streaks: {
    currentDailyStreak: number;
    longestDailyStreak: number;
    lastActiveDate: string;
  };
  engagement: {
    level: 'high' | 'medium' | 'low' | 'inactive';
    score: number; // 0-100
    trend: 'increasing' | 'stable' | 'decreasing';
  };
}

class MemberActivityService {
  private readonly STORAGE_KEY = 'wellness_member_activities';

  /**
   * Log member activity within a group
   */
  async logMemberActivity(
    groupId: string,
    userId: string,
    activityType: ActivityType,
    value: number,
    metadata: any = {}
  ): Promise<void> {
    try {
      // Get member info
      const member = await this.getGroupMember(groupId, userId);
      if (!member) {
        throw new Error('User is not a member of this group');
      }

      const activity: MemberActivityEntry = {
        id: this.generateId('activity'),
        memberId: member.id,
        groupId,
        userId,
        activityType,
        activityDate: new Date().toISOString().split('T')[0],
        value,
        metadata: {
          source: 'auto',
          ...metadata
        },
        createdAt: new Date()
      };

      // Save activity
      await this.saveActivity(activity);

      // Update member's activity stats
      await this.updateMemberStats(member.id, groupId, activityType, value);

      errorService.logInfo('Member activity logged', {
        groupId,
        userId,
        activityType,
        value
      });

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'MemberActivityService.logMemberActivity',
        groupId,
        userId,
        activityType
      });
      throw error;
    }
  }

  /**
   * Get member engagement metrics
   */
  async getMemberEngagement(groupId: string, userId: string): Promise<MemberEngagementMetrics | null> {
    try {
      const member = await this.getGroupMember(groupId, userId);
      if (!member) return null;

      const activities = await this.getMemberActivities(member.id, groupId);
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Calculate 7-day metrics
      const last7Days = this.calculatePeriodMetrics(activities, sevenDaysAgo, now);
      
      // Calculate 30-day metrics
      const last30Days = this.calculatePeriodMetrics(activities, thirtyDaysAgo, now);

      // Calculate streaks
      const streaks = this.calculateStreaks(activities);

      // Calculate engagement level and score
      const engagement = this.calculateEngagementLevel(last7Days, last30Days);

      return {
        memberId: member.id,
        groupId,
        last7Days,
        last30Days,
        streaks,
        engagement
      };

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'MemberActivityService.getMemberEngagement',
        groupId,
        userId
      });
      return null;
    }
  }

  /**
   * Get all member activities for a group
   */
  async getGroupMemberActivities(groupId: string, days: number = 30): Promise<MemberActivityEntry[]> {
    try {
      const activities = this.loadActivities();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      return activities
        .filter(activity => 
          activity.groupId === groupId && 
          new Date(activity.activityDate) >= cutoffDate
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'MemberActivityService.getGroupMemberActivities',
        groupId
      });
      return [];
    }
  }

  /**
   * Get group engagement summary
   */
  async getGroupEngagementSummary(groupId: string): Promise<{
    totalMembers: number;
    activeMembers: number; // active in last 7 days
    engagementLevels: {
      high: number;
      medium: number;
      low: number;
      inactive: number;
    };
    averageEngagementScore: number;
    topPerformers: Array<{
      userId: string;
      engagementScore: number;
      activeDays: number;
    }>;
  }> {
    try {
      const members = await this.getGroupMembers(groupId);
      const engagementData = await Promise.all(
        members.map(member => this.getMemberEngagement(groupId, member.userId))
      );

      const validEngagement = engagementData.filter(e => e !== null) as MemberEngagementMetrics[];

      const engagementLevels = {
        high: validEngagement.filter(e => e.engagement.level === 'high').length,
        medium: validEngagement.filter(e => e.engagement.level === 'medium').length,
        low: validEngagement.filter(e => e.engagement.level === 'low').length,
        inactive: validEngagement.filter(e => e.engagement.level === 'inactive').length
      };

      const averageEngagementScore = validEngagement.length > 0
        ? validEngagement.reduce((sum, e) => sum + e.engagement.score, 0) / validEngagement.length
        : 0;

      const topPerformers = validEngagement
        .sort((a, b) => b.engagement.score - a.engagement.score)
        .slice(0, 5)
        .map(e => ({
          userId: members.find(m => m.id === e.memberId)?.userId || '',
          engagementScore: e.engagement.score,
          activeDays: e.last7Days.activeDays
        }));

      return {
        totalMembers: members.length,
        activeMembers: validEngagement.filter(e => e.last7Days.activeDays > 0).length,
        engagementLevels,
        averageEngagementScore: Math.round(averageEngagementScore),
        topPerformers
      };

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'MemberActivityService.getGroupEngagementSummary',
        groupId
      });
      throw error;
    }
  }

  /**
   * Update member activity stats in their group profile
   */
  private async updateMemberStats(
    memberId: string, 
    groupId: string, 
    activityType: ActivityType, 
    value: number
  ): Promise<void> {
    try {
      const members = this.loadGroupMembers();
      const memberIndex = members.findIndex(m => m.id === memberId && m.groupId === groupId);
      
      if (memberIndex === -1) return;

      const member = members[memberIndex];
      const stats = member.activityStats;

      // Update stats based on activity type
      switch (activityType) {
        case 'steps':
          stats.totalStepsLogged += value;
          break;
        case 'food_entry':
          stats.totalFoodEntriesLogged += value;
          break;
        case 'training_completion':
          stats.trainingModulesCompleted += 1;
          break;
        case 'group_interaction':
          stats.groupInteractions += 1;
          break;
      }

      // Update last activity date
      member.lastActiveAt = new Date();
      stats.lastUpdated = new Date();

      // Update streak
      this.updateMemberStreak(stats);

      // Save updated member
      members[memberIndex] = member;
      localStorage.setItem(GROUP_STORAGE_KEYS.GROUP_MEMBERS, JSON.stringify(members));

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'MemberActivityService.updateMemberStats',
        memberId,
        groupId
      });
    }
  }

  // Helper methods
  private calculatePeriodMetrics(activities: MemberActivityEntry[], startDate: Date, endDate: Date) {
    const periodActivities = activities.filter(a => {
      const activityDate = new Date(a.activityDate);
      return activityDate >= startDate && activityDate <= endDate;
    });

    const activeDays = new Set(periodActivities.map(a => a.activityDate)).size;

    return {
      stepsLogged: periodActivities
        .filter(a => a.activityType === 'steps')
        .reduce((sum, a) => sum + a.value, 0),
      foodEntriesLogged: periodActivities
        .filter(a => a.activityType === 'food_entry')
        .reduce((sum, a) => sum + a.value, 0),
      trainingModulesCompleted: periodActivities
        .filter(a => a.activityType === 'training_completion').length,
      groupInteractions: periodActivities
        .filter(a => a.activityType === 'group_interaction').length,
      activeDays
    };
  }

  private calculateStreaks(activities: MemberActivityEntry[]) {
    const sortedDates = Array.from(new Set(activities.map(a => a.activityDate))).sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date().toISOString().split('T')[0];
    let lastActiveDate = sortedDates[sortedDates.length - 1] || today;

    // Calculate streaks
    for (let i = sortedDates.length - 1; i >= 0; i--) {
      const currentDate = sortedDates[i];
      const nextDate = sortedDates[i + 1];

      if (!nextDate || this.isConsecutiveDay(currentDate, nextDate)) {
        tempStreak++;
        if (currentDate === today || (i === sortedDates.length - 1)) {
          currentStreak = tempStreak;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    return {
      currentDailyStreak: currentStreak,
      longestDailyStreak: longestStreak,
      lastActiveDate
    };
  }

  private calculateEngagementLevel(last7Days: any, last30Days: any) {
    let score = 0;

    // Points for daily activity (max 40 points)
    score += Math.min(last7Days.activeDays * 6, 40);

    // Points for steps (max 20 points)
    const avgDailySteps = last7Days.stepsLogged / 7;
    score += Math.min((avgDailySteps / 8000) * 20, 20);

    // Points for food entries (max 20 points)
    const avgDailyFood = last7Days.foodEntriesLogged / 7;
    score += Math.min((avgDailyFood / 3) * 20, 20);

    // Points for training and interactions (max 20 points)
    score += Math.min((last7Days.trainingModulesCompleted + last7Days.groupInteractions) * 2, 20);

    score = Math.round(Math.max(0, Math.min(100, score)));

    let level: 'high' | 'medium' | 'low' | 'inactive';
    if (score >= 80) level = 'high';
    else if (score >= 60) level = 'medium';
    else if (score >= 30) level = 'low';
    else level = 'inactive';

    // Determine trend based on 7-day vs 30-day comparison
    const recent7DayAvg = last7Days.activeDays / 7;
    const overall30DayAvg = last30Days.activeDays / 30;
    
    let trend: 'increasing' | 'stable' | 'decreasing';
    if (recent7DayAvg > overall30DayAvg * 1.2) trend = 'increasing';
    else if (recent7DayAvg < overall30DayAvg * 0.8) trend = 'decreasing';
    else trend = 'stable';

    return { level, score, trend };
  }

  private isConsecutiveDay(date1: string, date2: string): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }

  private updateMemberStreak(stats: MemberActivityStats): void {
    const today = new Date().toISOString().split('T')[0];
    const lastStreakDate = stats.weeklyStreaks.lastStreakDate;

    if (lastStreakDate === today) {
      // Already logged today, no change
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastStreakDate === yesterdayStr) {
      // Consecutive day
      stats.weeklyStreaks.currentStreak++;
    } else {
      // Streak broken, start new
      stats.weeklyStreaks.currentStreak = 1;
    }

    stats.weeklyStreaks.longestStreak = Math.max(
      stats.weeklyStreaks.longestStreak,
      stats.weeklyStreaks.currentStreak
    );
    stats.weeklyStreaks.lastStreakDate = today;
  }

  // Storage and utility methods
  private async saveActivity(activity: MemberActivityEntry): Promise<void> {
    const activities = this.loadActivities();
    activities.push(activity);

    // Keep only last 90 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    const filteredActivities = activities.filter(a => 
      new Date(a.createdAt) > cutoffDate
    );

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredActivities));
  }

  private loadActivities(): MemberActivityEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async getMemberActivities(memberId: string, groupId: string): Promise<MemberActivityEntry[]> {
    const activities = this.loadActivities();
    return activities.filter(a => a.memberId === memberId && a.groupId === groupId);
  }

  private async getGroupMember(groupId: string, userId: string): Promise<GroupMember | null> {
    const members = this.loadGroupMembers();
    return members.find(m => m.groupId === groupId && m.userId === userId) || null;
  }

  private async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    const members = this.loadGroupMembers();
    return members.filter(m => m.groupId === groupId);
  }

  private loadGroupMembers(): GroupMember[] {
    try {
      const stored = localStorage.getItem(GROUP_STORAGE_KEYS.GROUP_MEMBERS);
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
export const memberActivityService = new MemberActivityService();
export default memberActivityService;