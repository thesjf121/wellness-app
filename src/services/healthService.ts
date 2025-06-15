import { Capacitor } from '@capacitor/core';
import { StepData, StepGoal, StepSummary, StepStreak, StepAchievement } from '../types';
import { apiService } from './api';
import { getDateString, getDaysAgo } from '../utils/helpers';

export interface HealthKitData {
  steps: number;
  distance?: number;
  activeMinutes?: number;
  calories?: number;
  date: string;
}

export interface StepEntryRequest {
  date: string;
  stepCount: number;
  distance?: number;
  activeMinutes?: number;
  calories?: number;
  source?: 'manual' | 'healthkit' | 'googlefit' | 'web';
}

class HealthService {
  private isNative: boolean;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  // Platform availability checks
  async isHealthKitAvailable(): Promise<boolean> {
    if (!this.isNative) return false;
    
    try {
      // This will be implemented when HealthKit plugin is added
      return Capacitor.getPlatform() === 'ios';
    } catch (error) {
      console.error('Error checking HealthKit availability:', error);
      return false;
    }
  }

  async isGoogleFitAvailable(): Promise<boolean> {
    if (!this.isNative) return false;
    
    try {
      // This will be implemented when Google Fit plugin is added
      return Capacitor.getPlatform() === 'android';
    } catch (error) {
      console.error('Error checking Google Fit availability:', error);
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (Capacitor.getPlatform() === 'ios') {
        return await this.requestHealthKitPermissions();
      } else if (Capacitor.getPlatform() === 'android') {
        return await this.requestGoogleFitPermissions();
      }
      return true; // Web platform doesn't need permissions
    } catch (error) {
      console.error('Error requesting health permissions:', error);
      return false;
    }
  }

  private async requestHealthKitPermissions(): Promise<boolean> {
    // TODO: Implement HealthKit permission request
    // This requires @capacitor-community/healthkit plugin
    return true; // Placeholder
  }

  private async requestGoogleFitPermissions(): Promise<boolean> {
    // TODO: Implement Google Fit permission request
    // This requires @capacitor-community/google-fit plugin
    return true; // Placeholder
  }

  // Step data retrieval
  async getTodaysSteps(): Promise<number> {
    try {
      const today = getDateString(new Date());
      const stepData = await this.getStepDataForDate(today);
      return stepData?.stepCount || 0;
    } catch (error) {
      console.error('Error getting today\'s steps:', error);
      return 0;
    }
  }

  async getStepDataForDate(date: string): Promise<StepData | null> {
    try {
      const response = await apiService.get<StepData>(`/steps/daily/${date}`);
      return response.success && response.data ? response.data : null;
    } catch (error) {
      console.error('Error getting step data for date:', error);
      return null;
    }
  }

  async getStepsHistory(days: number = 7): Promise<StepData[]> {
    try {
      const response = await apiService.get<StepData[]>(`/steps/history/${days}`);
      return response.success && response.data ? response.data : [];
    } catch (error) {
      console.error('Error getting steps history:', error);
      return [];
    }
  }

  // Manual step entry
  async addStepEntry(stepEntry: StepEntryRequest): Promise<StepData | null> {
    try {
      const entryData = {
        ...stepEntry,
        source: stepEntry.source || 'manual',
        synced: true
      };

      const response = await apiService.post<StepData>('/steps/entries', entryData);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.error || 'Failed to add step entry');
    } catch (error) {
      console.error('Error adding step entry:', error);
      throw error;
    }
  }

  async updateStepEntry(id: string, updates: Partial<StepEntryRequest>): Promise<StepData | null> {
    try {
      const response = await apiService.put<StepData>(`/steps/entries/${id}`, updates);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.error || 'Failed to update step entry');
    } catch (error) {
      console.error('Error updating step entry:', error);
      throw error;
    }
  }

  async deleteStepEntry(id: string): Promise<boolean> {
    try {
      const response = await apiService.delete(`/steps/entries/${id}`);
      return response.success;
    } catch (error) {
      console.error('Error deleting step entry:', error);
      return false;
    }
  }

  // Step goals management
  async getStepGoal(userId: string): Promise<StepGoal | null> {
    try {
      const response = await apiService.get<StepGoal>(`/users/${userId}/step-goal`);
      return response.success && response.data ? response.data : null;
    } catch (error) {
      console.error('Error getting step goal:', error);
      return null;
    }
  }

  async setStepGoal(userId: string, dailyStepGoal: number): Promise<StepGoal | null> {
    try {
      const goalData = {
        dailyStepGoal,
        weeklyStepGoal: dailyStepGoal * 7,
        monthlyStepGoal: dailyStepGoal * 30,
        isActive: true
      };

      const response = await apiService.post<StepGoal>(`/users/${userId}/step-goal`, goalData);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.error || 'Failed to set step goal');
    } catch (error) {
      console.error('Error setting step goal:', error);
      throw error;
    }
  }

  // Step summary and analytics
  async getStepSummary(userId: string): Promise<StepSummary | null> {
    try {
      const response = await apiService.get<StepSummary>(`/users/${userId}/step-summary`);
      return response.success && response.data ? response.data : null;
    } catch (error) {
      console.error('Error getting step summary:', error);
      return null;
    }
  }

  // Step streaks
  async getStepStreak(userId: string): Promise<StepStreak | null> {
    try {
      const response = await apiService.get<StepStreak>(`/users/${userId}/step-streak`);
      return response.success && response.data ? response.data : null;
    } catch (error) {
      console.error('Error getting step streak:', error);
      return null;
    }
  }

  // Achievements
  async getStepAchievements(userId: string): Promise<StepAchievement[]> {
    try {
      const response = await apiService.get<StepAchievement[]>(`/users/${userId}/step-achievements`);
      return response.success && response.data ? response.data : [];
    } catch (error) {
      console.error('Error getting step achievements:', error);
      return [];
    }
  }

  // Background sync (for native platforms)
  async syncStepsFromHealthPlatform(): Promise<HealthKitData[]> {
    try {
      const syncData: HealthKitData[] = [];
      
      if (Capacitor.getPlatform() === 'ios') {
        // Get last 7 days of data from HealthKit
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateString = getDateString(date);
          
          const steps = await this.getHealthKitSteps(date);
          syncData.push({
            steps,
            date: dateString
          });
        }
      } else if (Capacitor.getPlatform() === 'android') {
        // Get last 7 days of data from Google Fit
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateString = getDateString(date);
          
          const steps = await this.getGoogleFitSteps(date);
          syncData.push({
            steps,
            date: dateString
          });
        }
      }
      
      // Sync each day's data to server
      for (const dayData of syncData) {
        await this.syncStepsToServer(dayData);
      }
      
      return syncData;
    } catch (error) {
      console.error('Error syncing steps from health platform:', error);
      return [];
    }
  }

  private async getHealthKitSteps(date: Date): Promise<number> {
    // TODO: Implement actual HealthKit integration
    // For now, return realistic mock data
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const base = 6000 + (dayOfYear % 4000); // Vary between 6k-10k
    return Math.floor(base + (Math.random() * 2000));
  }

  private async getGoogleFitSteps(date: Date): Promise<number> {
    // TODO: Implement actual Google Fit integration
    // For now, return realistic mock data
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const base = 5500 + (dayOfYear % 4500); // Vary between 5.5k-10k
    return Math.floor(base + (Math.random() * 2000));
  }

  async syncStepsToServer(stepData: HealthKitData): Promise<boolean> {
    try {
      const entryData: StepEntryRequest = {
        date: stepData.date,
        stepCount: stepData.steps,
        distance: stepData.distance,
        activeMinutes: stepData.activeMinutes,
        calories: stepData.calories,
        source: Capacitor.getPlatform() === 'ios' ? 'healthkit' : 
                Capacitor.getPlatform() === 'android' ? 'googlefit' : 'web'
      };

      const response = await apiService.post('/steps/sync', entryData);
      return response.success;
    } catch (error) {
      console.error('Error syncing steps to server:', error);
      return false;
    }
  }

  // Utility methods
  calculateCaloriesFromSteps(steps: number, weightKg: number = 70): number {
    // Rough calculation: 0.04 calories per step per kg of body weight
    return Math.round(steps * 0.04 * weightKg);
  }

  calculateDistanceFromSteps(steps: number, strideLength: number = 0.762): number {
    // Default stride length is average for adults (0.762 meters)
    return steps * strideLength;
  }

  getStepGoalProgress(steps: number, goal: number): number {
    return Math.min((steps / goal) * 100, 100);
  }

  isGoalAchieved(steps: number, goal: number): boolean {
    return steps >= goal;
  }

  // Validation methods
  validateStepCount(steps: number): boolean {
    return steps >= 0 && steps <= 100000; // Reasonable daily step limit
  }

  validateStepGoal(goal: number): boolean {
    return goal >= 1000 && goal <= 50000; // Reasonable goal range
  }
}

export const healthService = new HealthService();