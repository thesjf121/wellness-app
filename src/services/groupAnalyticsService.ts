// Group analytics service for detailed statistics and reporting

import { GROUP_STORAGE_KEYS } from '../types/groups';
import { errorService } from './errorService';
import { groupService } from './groupService';
import { memberActivityService } from './memberActivityService';
import { groupAchievementService } from './groupAchievementService';
import { groupMessagingService } from './groupMessagingService';

export interface GroupAnalytics {
  groupId: string;
  groupName: string;
  memberCount: number;
  createdAt: Date;
  
  // Member engagement metrics
  memberEngagement: {
    activeMembers: number;
    inactiveMembers: number;
    averageActivityScore: number;
    memberRetentionRate: number;
    newMembersThisWeek: number;
    newMembersThisMonth: number;
  };

  // Activity statistics
  activityStats: {
    totalStepsLogged: number;
    totalFoodEntriesLogged: number;
    totalTrainingModulesCompleted: number;
    averageDailySteps: number;
    averageWeeklyFoodEntries: number;
    mostActiveDay: string;
    activityTrend: 'increasing' | 'decreasing' | 'stable';
  };

  // Achievement analytics
  achievementStats: {
    totalAchievementsEarned: number;
    uniqueAchievementTypes: number;
    mostEarnedAchievement: string;
    achievementDistribution: Record<string, number>;
    topPerformers: Array<{
      userId: string;
      achievementCount: number;
    }>;
  };

  // Communication metrics
  communicationStats: {
    totalMessages: number;
    messagesThisWeek: number;
    averageMessagesPerMember: number;
    mostActiveMessenger: string;
    messageActivityTrend: 'increasing' | 'decreasing' | 'stable';
  };

  // Time-based analytics
  timeAnalytics: {
    peakActivityHours: number[];
    peakActivityDays: string[];
    weeklyActivityPattern: Record<string, number>;
  };

  generatedAt: Date;
}

export interface MemberAnalytics {
  userId: string;
  groupId: string;
  joinedAt: Date;
  daysSinceJoined: number;
  
  // Activity metrics
  activityMetrics: {
    totalActivities: number;
    averageActivitiesPerDay: number;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: Date;
    activityScore: number;
    isActive: boolean;
  };

  // Specific activity counts
  activityCounts: {
    stepsLogged: number;
    foodEntriesLogged: number;
    trainingModulesCompleted: number;
    groupInteractions: number;
  };

  // Achievement progress
  achievementProgress: {
    totalAchievements: number;
    recentAchievements: Array<{
      title: string;
      earnedAt: Date;
    }>;
    achievementsByCategory: Record<string, number>;
  };

  // Communication activity
  communicationActivity: {
    messagesSent: number;
    reactionsGiven: number;
    averageMessagesPerDay: number;
  };

  // Comparison to group average
  performanceVsGroup: {
    activityScorePercentile: number;
    achievementCountPercentile: number;
    messageCountPercentile: number;
  };
}

class GroupAnalyticsService {
  /**
   * Generate comprehensive analytics for a group
   */
  async generateGroupAnalytics(groupId: string): Promise<GroupAnalytics> {
    try {
      const group = await groupService.getGroupById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      const members = await groupService.getGroupMembers(groupId);
      const now = new Date();

      // Get member engagement metrics
      const memberEngagement = await this.calculateMemberEngagement(groupId, members);
      
      // Get activity statistics
      const activityStats = await this.calculateActivityStats(groupId, members);
      
      // Get achievement statistics
      const achievementStats = await this.calculateAchievementStats(groupId);
      
      // Get communication metrics
      const communicationStats = await this.calculateCommunicationStats(groupId, members);
      
      // Get time-based analytics
      const timeAnalytics = await this.calculateTimeAnalytics(groupId);

      const analytics: GroupAnalytics = {
        groupId,
        groupName: group.name,
        memberCount: members.length,
        createdAt: group.createdAt,
        memberEngagement,
        activityStats,
        achievementStats,
        communicationStats,
        timeAnalytics,
        generatedAt: now
      };

      // Cache analytics for performance
      await this.cacheAnalytics(groupId, analytics);

      return analytics;
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupAnalyticsService.generateGroupAnalytics',
        groupId
      });
      throw error;
    }
  }

  /**
   * Generate analytics for a specific member
   */
  async generateMemberAnalytics(userId: string, groupId: string): Promise<MemberAnalytics> {
    try {
      const members = await groupService.getGroupMembers(groupId);
      const member = members.find(m => m.userId === userId);
      if (!member) {
        throw new Error('Member not found in group');
      }

      const now = new Date();
      const daysSinceJoined = Math.floor((now.getTime() - new Date(member.joinedAt).getTime()) / (1000 * 60 * 60 * 24));

      // Get member activities
      const activities = await memberActivityService.getGroupMemberActivities(groupId, 30);
      const memberActivities = activities.filter(a => a.userId === userId);

      // Calculate activity metrics
      const activityMetrics = await this.calculateMemberActivityMetrics(userId, groupId, memberActivities);
      
      // Get activity counts
      const activityCounts = await this.calculateMemberActivityCounts(memberActivities);
      
      // Get achievement progress
      const achievementProgress = await this.calculateMemberAchievementProgress(userId, groupId);
      
      // Get communication activity
      const communicationActivity = await this.calculateMemberCommunicationActivity(userId, groupId);
      
      // Calculate performance vs group
      const performanceVsGroup = await this.calculatePerformanceVsGroup(userId, groupId, members);

      return {
        userId,
        groupId,
        joinedAt: member.joinedAt,
        daysSinceJoined,
        activityMetrics,
        activityCounts,
        achievementProgress,
        communicationActivity,
        performanceVsGroup
      };
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupAnalyticsService.generateMemberAnalytics',
        userId,
        groupId
      });
      throw error;
    }
  }

  /**
   * Get analytics comparison between multiple groups
   */
  async compareGroups(groupIds: string[]): Promise<{
    groups: Array<{
      groupId: string;
      groupName: string;
      memberCount: number;
      averageActivityScore: number;
      totalAchievements: number;
      totalMessages: number;
      groupAge: number;
    }>;
    insights: string[];
  }> {
    try {
      const groupComparisons = await Promise.all(
        groupIds.map(async (groupId) => {
          const analytics = await this.generateGroupAnalytics(groupId);
          const group = await groupService.getGroupById(groupId);
          const groupAge = Math.floor((new Date().getTime() - new Date(group!.createdAt).getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            groupId,
            groupName: analytics.groupName,
            memberCount: analytics.memberCount,
            averageActivityScore: analytics.memberEngagement.averageActivityScore,
            totalAchievements: analytics.achievementStats.totalAchievementsEarned,
            totalMessages: analytics.communicationStats.totalMessages,
            groupAge
          };
        })
      );

      // Generate insights
      const insights = this.generateComparisonInsights(groupComparisons);

      return {
        groups: groupComparisons,
        insights
      };
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'GroupAnalyticsService.compareGroups',
        groupIds
      });
      throw error;
    }
  }

  // Private helper methods

  private async calculateMemberEngagement(groupId: string, members: any[]): Promise<GroupAnalytics['memberEngagement']> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let activeMembers = 0;
    let totalActivityScore = 0;
    let newMembersThisWeek = 0;
    let newMembersThisMonth = 0;

    for (const member of members) {
      const daysSinceActive = Math.floor((now.getTime() - new Date(member.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24));
      const activityScore = Math.max(0, 100 - (daysSinceActive * 10));
      totalActivityScore += activityScore;

      if (daysSinceActive <= 3) {
        activeMembers++;
      }

      if (new Date(member.joinedAt) > weekAgo) {
        newMembersThisWeek++;
      }
      if (new Date(member.joinedAt) > monthAgo) {
        newMembersThisMonth++;
      }
    }

    const averageActivityScore = members.length > 0 ? totalActivityScore / members.length : 0;
    const memberRetentionRate = members.length > 0 ? (activeMembers / members.length) * 100 : 0;

    return {
      activeMembers,
      inactiveMembers: members.length - activeMembers,
      averageActivityScore: Math.round(averageActivityScore),
      memberRetentionRate: Math.round(memberRetentionRate),
      newMembersThisWeek,
      newMembersThisMonth
    };
  }

  private async calculateActivityStats(groupId: string, members: any[]): Promise<GroupAnalytics['activityStats']> {
    const activities = await memberActivityService.getGroupMemberActivities(groupId, 30);
    
    let totalSteps = 0;
    let totalFoodEntries = 0;
    let totalTrainingModules = 0;
    const dailySteps: Record<string, number> = {};

    for (const activity of activities) {
      const date = activity.createdAt.toISOString().split('T')[0];
      
      switch (activity.activityType) {
        case 'steps':
          totalSteps += activity.value;
          dailySteps[date] = (dailySteps[date] || 0) + activity.value;
          break;
        case 'food_entry':
          totalFoodEntries += activity.value;
          break;
        case 'training_completion':
          totalTrainingModules += activity.value;
          break;
      }
    }

    const averageDailySteps = Object.keys(dailySteps).length > 0 
      ? Math.round(totalSteps / Object.keys(dailySteps).length) 
      : 0;

    const averageWeeklyFoodEntries = Math.round(totalFoodEntries / 4); // Assuming 30 days = ~4 weeks

    // Find most active day
    const mostActiveDay = Object.entries(dailySteps)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'No data';

    // Simple trend calculation (comparing first half vs second half of period)
    const dates = Object.keys(dailySteps).sort();
    const midPoint = Math.floor(dates.length / 2);
    const firstHalfAvg = dates.slice(0, midPoint).reduce((sum, date) => sum + dailySteps[date], 0) / midPoint;
    const secondHalfAvg = dates.slice(midPoint).reduce((sum, date) => sum + dailySteps[date], 0) / (dates.length - midPoint);
    
    let activityTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (secondHalfAvg > firstHalfAvg * 1.1) activityTrend = 'increasing';
    else if (secondHalfAvg < firstHalfAvg * 0.9) activityTrend = 'decreasing';

    return {
      totalStepsLogged: totalSteps,
      totalFoodEntriesLogged: totalFoodEntries,
      totalTrainingModulesCompleted: totalTrainingModules,
      averageDailySteps,
      averageWeeklyFoodEntries,
      mostActiveDay,
      activityTrend
    };
  }

  private async calculateAchievementStats(groupId: string): Promise<GroupAnalytics['achievementStats']> {
    const achievements = await groupAchievementService.getGroupAchievements(groupId);
    const leaderboard = await groupAchievementService.getGroupLeaderboard(groupId);

    const achievementDistribution: Record<string, number> = {};
    for (const achievement of achievements) {
      achievementDistribution[achievement.achievementType] = 
        (achievementDistribution[achievement.achievementType] || 0) + 1;
    }

    const mostEarnedAchievement = Object.entries(achievementDistribution)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    const topPerformers = leaderboard.slice(0, 3).map(entry => ({
      userId: entry.userId,
      achievementCount: entry.achievementCount
    }));

    return {
      totalAchievementsEarned: achievements.length,
      uniqueAchievementTypes: Object.keys(achievementDistribution).length,
      mostEarnedAchievement,
      achievementDistribution,
      topPerformers
    };
  }

  private async calculateCommunicationStats(groupId: string, members: any[]): Promise<GroupAnalytics['communicationStats']> {
    const messages = await groupMessagingService.getGroupMessages(groupId, 'system', 1000);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const messagesThisWeek = messages.messages.filter(msg => 
      new Date(msg.createdAt) > weekAgo
    ).length;

    const averageMessagesPerMember = members.length > 0 
      ? Math.round(messages.messages.length / members.length) 
      : 0;

    // Find most active messenger
    const messageCounts: Record<string, number> = {};
    for (const message of messages.messages) {
      if (message.senderId !== 'system') {
        messageCounts[message.senderId] = (messageCounts[message.senderId] || 0) + 1;
      }
    }

    const mostActiveMessenger = Object.entries(messageCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    // Simple trend calculation
    const allMessages = messages.messages.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const midPoint = Math.floor(allMessages.length / 2);
    const firstHalfCount = midPoint;
    const secondHalfCount = allMessages.length - midPoint;
    
    let messageActivityTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (secondHalfCount > firstHalfCount * 1.2) messageActivityTrend = 'increasing';
    else if (secondHalfCount < firstHalfCount * 0.8) messageActivityTrend = 'decreasing';

    return {
      totalMessages: messages.messages.length,
      messagesThisWeek,
      averageMessagesPerMember,
      mostActiveMessenger,
      messageActivityTrend
    };
  }

  private async calculateTimeAnalytics(groupId: string): Promise<GroupAnalytics['timeAnalytics']> {
    const activities = await memberActivityService.getGroupMemberActivities(groupId, 30);
    
    const hourCounts: Record<number, number> = {};
    const dayCounts: Record<string, number> = {};
    const weeklyPattern: Record<string, number> = {};

    for (const activity of activities) {
      const date = new Date(activity.createdAt);
      const hour = date.getHours();
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
      weeklyPattern[dayName] = (weeklyPattern[dayName] || 0) + 1;
    }

    // Find peak hours (top 3)
    const peakActivityHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    // Find peak days (top 3)
    const peakActivityDays = Object.entries(dayCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([day]) => day);

    return {
      peakActivityHours,
      peakActivityDays,
      weeklyActivityPattern: weeklyPattern
    };
  }

  private async calculateMemberActivityMetrics(userId: string, groupId: string, activities: any[]): Promise<MemberAnalytics['activityMetrics']> {
    const now = new Date();
    const totalActivities = activities.length;
    
    // Calculate days since first activity
    const firstActivity = activities.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )[0];
    
    const daysSinceFirst = firstActivity 
      ? Math.floor((now.getTime() - new Date(firstActivity.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    const averageActivitiesPerDay = daysSinceFirst > 0 ? totalActivities / daysSinceFirst : 0;

    // Calculate streaks (simplified)
    const activityDates = [...new Set(activities.map(a => 
      a.createdAt.toISOString().split('T')[0]
    ))].sort();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < activityDates.length; i++) {
      const prevDate = new Date(activityDates[i - 1]);
      const currDate = new Date(activityDates[i]);
      const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Current streak calculation
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    if (activityDates.includes(today) || activityDates.includes(yesterday)) {
      currentStreak = tempStreak;
    }

    const lastActiveDate = activities.length > 0 
      ? new Date(Math.max(...activities.map(a => new Date(a.createdAt).getTime())))
      : new Date(0);

    const daysSinceActive = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
    const activityScore = Math.max(0, 100 - (daysSinceActive * 10));
    const isActive = daysSinceActive <= 3;

    return {
      totalActivities,
      averageActivitiesPerDay: Math.round(averageActivitiesPerDay * 100) / 100,
      currentStreak,
      longestStreak,
      lastActiveDate,
      activityScore,
      isActive
    };
  }

  private async calculateMemberActivityCounts(activities: any[]): Promise<MemberAnalytics['activityCounts']> {
    const counts = {
      stepsLogged: 0,
      foodEntriesLogged: 0,
      trainingModulesCompleted: 0,
      groupInteractions: 0
    };

    for (const activity of activities) {
      switch (activity.activityType) {
        case 'steps':
          counts.stepsLogged += activity.value;
          break;
        case 'food_entry':
          counts.foodEntriesLogged += activity.value;
          break;
        case 'training_completion':
          counts.trainingModulesCompleted += activity.value;
          break;
        case 'group_interaction':
          counts.groupInteractions += activity.value;
          break;
      }
    }

    return counts;
  }

  private async calculateMemberAchievementProgress(userId: string, groupId: string): Promise<MemberAnalytics['achievementProgress']> {
    const achievements = await groupAchievementService.getUserAchievements(userId, groupId);
    
    const recentAchievements = achievements
      .filter(a => new Date(a.earnedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .map(a => ({
        title: a.title,
        earnedAt: a.earnedAt
      }));

    const achievementsByCategory: Record<string, number> = {};
    const availableAchievements = groupAchievementService.getAvailableAchievements();
    
    for (const achievement of achievements) {
      const definition = availableAchievements.find(d => d.type === achievement.achievementType);
      const category = definition?.category || 'other';
      achievementsByCategory[category] = (achievementsByCategory[category] || 0) + 1;
    }

    return {
      totalAchievements: achievements.length,
      recentAchievements,
      achievementsByCategory
    };
  }

  private async calculateMemberCommunicationActivity(userId: string, groupId: string): Promise<MemberAnalytics['communicationActivity']> {
    const messages = await groupMessagingService.getGroupMessages(groupId, userId, 1000);
    const userMessages = messages.messages.filter(m => m.senderId === userId);
    
    let reactionsGiven = 0;
    for (const message of messages.messages) {
      reactionsGiven += message.reactions.filter(r => r.userId === userId).length;
    }

    const daysSinceFirstMessage = userMessages.length > 0 
      ? Math.floor((new Date().getTime() - new Date(userMessages[0].createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const averageMessagesPerDay = daysSinceFirstMessage > 0 
      ? userMessages.length / daysSinceFirstMessage 
      : 0;

    return {
      messagesSent: userMessages.length,
      reactionsGiven,
      averageMessagesPerDay: Math.round(averageMessagesPerDay * 100) / 100
    };
  }

  private async calculatePerformanceVsGroup(userId: string, groupId: string, members: any[]): Promise<MemberAnalytics['performanceVsGroup']> {
    // Get all member analytics for comparison
    const memberAnalytics = await Promise.all(
      members.map(async (member) => {
        if (member.userId === userId) return null;
        try {
          return await this.generateMemberAnalytics(member.userId, groupId);
        } catch {
          return null;
        }
      })
    );

    const validAnalytics = memberAnalytics.filter(a => a !== null) as MemberAnalytics[];
    const userAnalytics = await this.generateMemberAnalytics(userId, groupId);

    const calculatePercentile = (userValue: number, allValues: number[]): number => {
      if (allValues.length === 0) return 50;
      const sorted = allValues.sort((a, b) => a - b);
      const rank = sorted.filter(v => v < userValue).length;
      return Math.round((rank / sorted.length) * 100);
    };

    const activityScores = validAnalytics.map(a => a.activityMetrics.activityScore);
    const achievementCounts = validAnalytics.map(a => a.achievementProgress.totalAchievements);
    const messageCounts = validAnalytics.map(a => a.communicationActivity.messagesSent);

    return {
      activityScorePercentile: calculatePercentile(userAnalytics.activityMetrics.activityScore, activityScores),
      achievementCountPercentile: calculatePercentile(userAnalytics.achievementProgress.totalAchievements, achievementCounts),
      messageCountPercentile: calculatePercentile(userAnalytics.communicationActivity.messagesSent, messageCounts)
    };
  }

  private generateComparisonInsights(groups: any[]): string[] {
    const insights: string[] = [];

    if (groups.length < 2) return insights;

    // Find most active group
    const mostActive = groups.reduce((max, group) => 
      group.averageActivityScore > max.averageActivityScore ? group : max
    );
    insights.push(`${mostActive.groupName} has the highest average activity score (${mostActive.averageActivityScore})`);

    // Find largest group
    const largest = groups.reduce((max, group) => 
      group.memberCount > max.memberCount ? group : max
    );
    insights.push(`${largest.groupName} has the most members (${largest.memberCount})`);

    // Find most social group
    const mostSocial = groups.reduce((max, group) => 
      group.totalMessages > max.totalMessages ? group : max
    );
    insights.push(`${mostSocial.groupName} is the most social with ${mostSocial.totalMessages} messages`);

    return insights;
  }

  private async cacheAnalytics(groupId: string, analytics: GroupAnalytics): Promise<void> {
    try {
      const cacheKey = `group_analytics_${groupId}`;
      localStorage.setItem(cacheKey, JSON.stringify(analytics));
    } catch (error) {
      // Cache failure is non-critical
      errorService.logError(error as Error, {
        context: 'GroupAnalyticsService.cacheAnalytics',
        groupId
      });
    }
  }

  /**
   * Get cached analytics if available and recent
   */
  async getCachedAnalytics(groupId: string, maxAgeMinutes: number = 30): Promise<GroupAnalytics | null> {
    try {
      const cacheKey = `group_analytics_${groupId}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return null;

      const analytics = JSON.parse(cached) as GroupAnalytics;
      const ageMinutes = (new Date().getTime() - new Date(analytics.generatedAt).getTime()) / (1000 * 60);
      
      if (ageMinutes <= maxAgeMinutes) {
        return analytics;
      }

      return null;
    } catch {
      return null;
    }
  }
}

export const groupAnalyticsService = new GroupAnalyticsService();
export default groupAnalyticsService;