// Health data service for step tracking and wellness metrics

import { Capacitor } from '@capacitor/core';
import { 
  StepEntry, 
  StepGoal, 
  StepStats, 
  StepSyncStatus,
  HealthPermissions,
  CreateStepEntryRequest,
  GetStepHistoryResponse,
  StepDataSource
} from '../types/steps';
import { errorService } from './errorService';
import { healthKitService } from './healthKitService';
import { googleFitService } from './googleFitService';
import { healthConnectService } from './healthConnectService';
import { notificationService } from './notificationService';
import { groupActivityFeedService } from './groupActivityFeedService';
import { groupService } from './groupService';

// Health plugin - graceful fallback when not available
let CapacitorHealth: any = null;
let HealthConnect: any = null;
try {
  // Only attempt to load if the package exists
  if (typeof require !== 'undefined') {
    const healthModule = require('capacitor-health');
    CapacitorHealth = healthModule?.CapacitorHealth;
    
    // Try to load Health Connect plugin for Android
    try {
      const healthConnectModule = require('capacitor-health-connect');
      HealthConnect = healthConnectModule?.HealthConnect;
    } catch (hcError) {
      console.warn('Health Connect plugin not available:', hcError);
    }
  }
} catch (error) {
  console.warn('Health plugin not available, using fallback mode:', error);
}

interface HealthServiceConfig {
  autoSync: boolean;
  syncInterval: number; // minutes
  enableNotifications: boolean;
}

class HealthService {
  private config: HealthServiceConfig = {
    autoSync: true,
    syncInterval: 60, // 1 hour
    enableNotifications: true
  };

  private syncInterval?: NodeJS.Timeout;
  private isInitialized = false;

  /**
   * Initialize the health service
   */
  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      // Initialize notification service
      await notificationService.initialize();

      // Check if we're on a supported platform
      if (!Capacitor.isNativePlatform()) {
        console.log('Health service: Running on web, using mock data');
        this.isInitialized = true;
        return;
      }

      // Initialize the health plugin if available
      if (CapacitorHealth) {
        await this.requestPermissions();
        
        if (this.config.autoSync) {
          this.startAutoSync();
        }
      }

      this.isInitialized = true;
      errorService.logInfo('Health service initialized successfully');
    } catch (error) {
      errorService.logError(error as Error, { context: 'HealthService.initialize' });
      throw error;
    }
  }

  /**
   * Request health data permissions
   */
  async requestPermissions(): Promise<HealthPermissions> {
    try {
      const platform = Capacitor.getPlatform();
      
      // Use platform-specific services
      if (platform === 'ios' && healthKitService.isHealthKitAvailable()) {
        return await healthKitService.requestHealthKitPermissions();
      } else if (platform === 'android') {
        // Try Health Connect first (preferred), then fallback to Google Fit
        if (healthConnectService.isHealthConnectAvailable()) {
          return await healthConnectService.requestHealthConnectPermissions();
        } else if (googleFitService.isGoogleFitAvailable()) {
          return await googleFitService.requestGoogleFitPermissions();
        }
      }

      // Fallback for web or unsupported platforms
      return {
        granted: false,
        stepsRead: false,
        distanceRead: false,
        activeEnergyRead: false,
        requestedAt: new Date()
      };
    } catch (error) {
      errorService.logError(error as Error, { context: 'HealthService.requestPermissions' });
      
      return {
        granted: false,
        stepsRead: false,
        distanceRead: false,
        activeEnergyRead: false,
        requestedAt: new Date(),
        deniedAt: new Date()
      };
    }
  }

  /**
   * Get step data for a date range
   */
  async getStepData(startDate: Date, endDate: Date): Promise<StepEntry[]> {
    try {
      const platform = Capacitor.getPlatform();
      
      // Use platform-specific services
      if (platform === 'ios' && healthKitService.isHealthKitAvailable()) {
        return await healthKitService.getStepCount(startDate, endDate);
      } else if (platform === 'android') {
        // Try Health Connect first (preferred), then fallback to Google Fit
        if (healthConnectService.isHealthConnectAvailable()) {
          return await healthConnectService.getStepCount(startDate, endDate);
        } else if (googleFitService.isGoogleFitAvailable()) {
          return await googleFitService.getStepCount(startDate, endDate);
        } else {
          // Return mock data for web/development
          return this.generateMockStepData(startDate, endDate);
        }
      } else {
        // Return mock data for web/development
        return this.generateMockStepData(startDate, endDate);
      }
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'HealthService.getStepData',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      // Fallback to localStorage data
      return this.getLocalStepData(startDate, endDate);
    }
  }

  /**
   * Add manual step entry
   */
  async addManualStepEntry(entry: CreateStepEntryRequest): Promise<StepEntry> {
    try {
      const stepEntry: StepEntry = {
        id: `${entry.date}_manual_${Date.now()}`,
        userId: 'current_user',
        date: entry.date,
        stepCount: entry.stepCount,
        distance: entry.distance,
        activeMinutes: entry.activeMinutes,
        caloriesBurned: entry.caloriesBurned,
        source: 'manual',
        synced: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deviceInfo: {
          platform: Capacitor.getPlatform() as 'ios' | 'android' | 'web',
        },
        hourlyData: entry.hourlyData
      };

      // Save to localStorage
      await this.saveStepEntryLocally(stepEntry);

      // TODO: Sync to backend
      // await this.syncStepEntry(stepEntry);

      return stepEntry;
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'HealthService.addManualStepEntry',
        entry 
      });
      throw error;
    }
  }

  /**
   * Set daily step goal
   */
  async setDailyStepGoal(target: number): Promise<StepGoal> {
    try {
      const goal: StepGoal = {
        id: `goal_${Date.now()}`,
        userId: 'current_user',
        dailyTarget: target,
        startDate: new Date(),
        isActive: true,
        createdAt: new Date()
      };

      // Save to localStorage
      localStorage.setItem('step_goal', JSON.stringify(goal));

      return goal;
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'HealthService.setDailyStepGoal',
        target 
      });
      throw error;
    }
  }

  /**
   * Get current step goal
   */
  async getCurrentStepGoal(): Promise<StepGoal | null> {
    try {
      const stored = localStorage.getItem('step_goal');
      if (!stored) return null;

      return JSON.parse(stored) as StepGoal;
    } catch (error) {
      errorService.logError(error as Error, { context: 'HealthService.getCurrentStepGoal' });
      return null;
    }
  }

  /**
   * Get step statistics
   */
  async getStepStats(): Promise<StepStats> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Last 30 days

      const stepData = await this.getStepData(startDate, endDate);
      const goal = await this.getCurrentStepGoal();

      const totalSteps = stepData.reduce((sum, entry) => sum + entry.stepCount, 0);
      const averageDailySteps = Math.round(totalSteps / stepData.length);
      const goalsReached = goal ? stepData.filter(entry => entry.stepCount >= goal.dailyTarget).length : 0;

      // Calculate streaks
      const { currentStreak, longestStreak } = this.calculateStepStreaks(stepData, goal?.dailyTarget || 8000);

      // Weekly stats
      const thisWeekData = stepData.filter(entry => {
        const entryDate = new Date(entry.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate >= weekAgo;
      });
      const thisWeekSteps = thisWeekData.reduce((sum, entry) => sum + entry.stepCount, 0);

      // Last week stats
      const lastWeekStart = new Date();
      lastWeekStart.setDate(lastWeekStart.getDate() - 14);
      const lastWeekEnd = new Date();
      lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
      
      const lastWeekData = stepData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= lastWeekStart && entryDate < lastWeekEnd;
      });
      const lastWeekSteps = lastWeekData.reduce((sum, entry) => sum + entry.stepCount, 0);

      const weeklyChange = lastWeekSteps > 0 ? ((thisWeekSteps - lastWeekSteps) / lastWeekSteps) * 100 : 0;

      return {
        userId: 'current_user',
        totalSteps,
        averageDailySteps,
        currentStreak,
        longestStreak,
        goalsReached,
        totalGoals: stepData.length,
        activeDays: stepData.filter(entry => entry.stepCount > 0).length,
        lastSyncDate: new Date(),
        thisWeekSteps,
        lastWeekSteps,
        weeklyChange: Math.round(weeklyChange),
        thisMonthSteps: totalSteps,
        lastMonthSteps: 0, // TODO: Calculate
        monthlyChange: 0
      };
    } catch (error) {
      errorService.logError(error as Error, { context: 'HealthService.getStepStats' });
      throw error;
    }
  }

  /**
   * Start automatic health data sync
   */
  private startAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      try {
        await this.syncHealthData();
      } catch (error) {
        errorService.logError(error as Error, { context: 'HealthService.autoSync' });
      }
    }, this.config.syncInterval * 60 * 1000);
  }

  /**
   * Sync health data from device
   */
  async syncHealthData(): Promise<void> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Last 7 days

      const stepData = await this.getStepData(startDate, endDate);
      
      // Save to local storage
      for (const entry of stepData) {
        await this.saveStepEntryLocally(entry);
      }

      // Check for achievements
      await this.checkForAchievements(stepData);

      errorService.logInfo('Health data sync completed', { 
        entriesCount: stepData.length,
        dateRange: `${startDate.toISOString()} to ${endDate.toISOString()}`
      });
    } catch (error) {
      errorService.logError(error as Error, { context: 'HealthService.syncHealthData' });
    }
  }

  /**
   * Generate mock step data for development/web
   */
  private generateMockStepData(startDate: Date, endDate: Date): StepEntry[] {
    const entries: StepEntry[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const baseSteps = 6000 + Math.random() * 8000; // 6k-14k steps
      const steps = Math.round(baseSteps);
      
      entries.push({
        id: `mock_${currentDate.toISOString().split('T')[0]}`,
        userId: 'current_user',
        date: currentDate.toISOString().split('T')[0],
        stepCount: steps,
        distance: steps * 0.7, // Rough conversion to meters
        activeMinutes: Math.round(steps / 100), // Rough conversion
        caloriesBurned: Math.round(steps * 0.04), // Rough conversion
        source: 'device',
        synced: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deviceInfo: {
          platform: 'web'
        }
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return entries;
  }

  /**
   * Get data source based on platform
   */
  private getDataSource(): StepDataSource {
    const platform = Capacitor.getPlatform();
    switch (platform) {
      case 'ios':
        return 'healthkit';
      case 'android':
        return 'googlefit';
      default:
        return 'device';
    }
  }

  /**
   * Save step entry to local storage
   */
  private async saveStepEntryLocally(entry: StepEntry): Promise<void> {
    try {
      const storageKey = 'step_entries';
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Update or add entry
      const index = existing.findIndex((e: StepEntry) => e.date === entry.date && e.source === entry.source);
      if (index >= 0) {
        existing[index] = entry;
      } else {
        existing.push(entry);
      }

      // Keep only last 90 days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);
      const filtered = existing.filter((e: StepEntry) => new Date(e.date) >= cutoffDate);

      localStorage.setItem(storageKey, JSON.stringify(filtered));

      // Check for step milestones and log group activity
      await this.checkStepMilestones(entry);
    } catch (error) {
      errorService.logError(error as Error, { context: 'HealthService.saveStepEntryLocally' });
    }
  }

  /**
   * Check for step milestones and log group activity
   */
  private async checkStepMilestones(entry: StepEntry): Promise<void> {
    try {
      // Only check for today's entries
      const today = new Date().toISOString().split('T')[0];
      if (entry.date !== today) return;

      const stepCount = entry.stepCount;
      
      // Check if user is in any groups
      if (typeof window !== 'undefined' && (window as any).Clerk?.user?.id) {
        const userId = (window as any).Clerk.user.id;
        const userGroups = await groupService.getUserGroups(userId);
        
        if (userGroups.length > 0) {
          // Log milestone activity for each group the user is in
          for (const group of userGroups) {
            // Check for common step milestones
            if (stepCount >= 10000 && !await this.hasLoggedMilestoneToday(userId, group.id, 'steps_10k')) {
              await groupActivityFeedService.logMilestoneActivity(
                group.id,
                userId,
                'daily_steps',
                stepCount,
                { milestone: '10k_steps', date: today }
              );
              await this.markMilestoneLogged(userId, group.id, 'steps_10k', today);
            }
            
            // Additional milestones
            if (stepCount >= 15000 && !await this.hasLoggedMilestoneToday(userId, group.id, 'steps_15k')) {
              await groupActivityFeedService.logMilestoneActivity(
                group.id,
                userId,
                'daily_steps',
                stepCount,
                { milestone: '15k_steps', date: today }
              );
              await this.markMilestoneLogged(userId, group.id, 'steps_15k', today);
            }
            
            if (stepCount >= 20000 && !await this.hasLoggedMilestoneToday(userId, group.id, 'steps_20k')) {
              await groupActivityFeedService.logMilestoneActivity(
                group.id,
                userId,
                'daily_steps',
                stepCount,
                { milestone: '20k_steps', date: today }
              );
              await this.markMilestoneLogged(userId, group.id, 'steps_20k', today);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking step milestones:', error);
      // Don't throw - milestone logging shouldn't break step saving
    }
  }

  /**
   * Check if milestone was already logged today to prevent duplicates
   */
  private async hasLoggedMilestoneToday(userId: string, groupId: string, milestone: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    const key = `milestone_logged_${userId}_${groupId}_${milestone}_${today}`;
    return localStorage.getItem(key) === 'true';
  }

  /**
   * Mark milestone as logged for today
   */
  private async markMilestoneLogged(userId: string, groupId: string, milestone: string, date: string): Promise<void> {
    const key = `milestone_logged_${userId}_${groupId}_${milestone}_${date}`;
    localStorage.setItem(key, 'true');
  }

  /**
   * Get step data from local storage
   */
  private getLocalStepData(startDate: Date, endDate: Date): StepEntry[] {
    try {
      const stored = localStorage.getItem('step_entries');
      if (!stored) return [];

      const entries: StepEntry[] = JSON.parse(stored);
      
      return entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      });
    } catch (error) {
      errorService.logError(error as Error, { context: 'HealthService.getLocalStepData' });
      return [];
    }
  }

  /**
   * Calculate step streaks
   */
  private calculateStepStreaks(stepData: StepEntry[], goalSteps: number): { currentStreak: number; longestStreak: number } {
    if (stepData.length === 0) return { currentStreak: 0, longestStreak: 0 };

    // Sort by date
    const sorted = stepData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Check current streak from most recent date
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].stepCount >= goalSteps) {
        if (i === 0 || this.isConsecutiveDay(sorted[i-1].date, sorted[i].date)) {
          currentStreak++;
          tempStreak++;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    // Find longest streak
    tempStreak = 0;
    for (const entry of sorted) {
      if (entry.stepCount >= goalSteps) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return { currentStreak, longestStreak };
  }

  /**
   * Check if two dates are consecutive days
   */
  private isConsecutiveDay(date1: string, date2: string): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d1.getTime() - d2.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }

  /**
   * Check for achievements and send notifications
   */
  private async checkForAchievements(stepData: StepEntry[]): Promise<void> {
    try {
      // Get current goal
      const goal = await this.getCurrentStepGoal();
      if (!goal) return;

      // Get today's data
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = stepData.find(entry => entry.date === today);
      if (!todayEntry) return;

      // Check if goal was reached today
      if (todayEntry.stepCount >= goal.dailyTarget) {
        const achievementKey = `goal_reached_${today}`;
        const alreadyNotified = localStorage.getItem(achievementKey);
        
        if (!alreadyNotified) {
          await notificationService.sendGoalReachedNotification(todayEntry.stepCount, goal.dailyTarget);
          localStorage.setItem(achievementKey, 'true');
        }
      }

      // Check for streak milestones
      const stats = await this.getStepStats();
      const streakKey = `streak_milestone_${stats.currentStreak}`;
      const streakNotified = localStorage.getItem(streakKey);
      
      if (!streakNotified && stats.currentStreak > 0) {
        await notificationService.sendStreakMilestoneNotification(stats.currentStreak);
        localStorage.setItem(streakKey, 'true');
      }

      // Check for personal best
      const personalBestKey = 'personal_best_steps';
      const previousBest = parseInt(localStorage.getItem(personalBestKey) || '0');
      
      if (todayEntry.stepCount > previousBest && previousBest > 0) {
        await notificationService.sendPersonalBestNotification(todayEntry.stepCount, previousBest);
        localStorage.setItem(personalBestKey, todayEntry.stepCount.toString());
      } else if (previousBest === 0) {
        // Set initial personal best without notification
        localStorage.setItem(personalBestKey, todayEntry.stepCount.toString());
      }

      // Check for weekly summary (on Sundays)
      const dayOfWeek = new Date().getDay();
      if (dayOfWeek === 0) { // Sunday
        const weeklySummaryKey = `weekly_summary_${today}`;
        const summaryNotified = localStorage.getItem(weeklySummaryKey);
        
        if (!summaryNotified) {
          // Calculate weekly stats
          const weekData = stepData.slice(-7);
          const totalSteps = weekData.reduce((sum, entry) => sum + entry.stepCount, 0);
          const avgSteps = Math.round(totalSteps / weekData.length);
          const goalsReached = weekData.filter(entry => entry.stepCount >= goal.dailyTarget).length;
          
          await notificationService.sendWeeklySummaryNotification(totalSteps, avgSteps, goalsReached);
          localStorage.setItem(weeklySummaryKey, 'true');
        }
      }
    } catch (error) {
      errorService.logError(error as Error, { context: 'HealthService.checkForAchievements' });
    }
  }

  /**
   * Cleanup and stop services
   */
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.isInitialized = false;
  }
}

// Create singleton instance
export const healthService = new HealthService();

export default healthService;