import { Capacitor } from '@capacitor/core';
import { StepData } from '../types';

export interface HealthKitData {
  steps: number;
  distance?: number;
  activeMinutes?: number;
  date: string;
}

class HealthService {
  private isNative: boolean;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

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
      return false;
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

  async getTodaysSteps(): Promise<number> {
    try {
      if (Capacitor.getPlatform() === 'ios') {
        return await this.getHealthKitSteps(new Date());
      } else if (Capacitor.getPlatform() === 'android') {
        return await this.getGoogleFitSteps(new Date());
      }
      return 0;
    } catch (error) {
      console.error('Error getting today\'s steps:', error);
      return 0;
    }
  }

  async getStepsForDate(date: Date): Promise<HealthKitData> {
    try {
      if (Capacitor.getPlatform() === 'ios') {
        const steps = await this.getHealthKitSteps(date);
        return {
          steps,
          date: date.toISOString().split('T')[0]
        };
      } else if (Capacitor.getPlatform() === 'android') {
        const steps = await this.getGoogleFitSteps(date);
        return {
          steps,
          date: date.toISOString().split('T')[0]
        };
      }
      return {
        steps: 0,
        date: date.toISOString().split('T')[0]
      };
    } catch (error) {
      console.error('Error getting steps for date:', error);
      return {
        steps: 0,
        date: date.toISOString().split('T')[0]
      };
    }
  }

  async getStepsHistory(days: number = 7): Promise<HealthKitData[]> {
    const history: HealthKitData[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const data = await this.getStepsForDate(date);
      history.push(data);
    }
    
    return history.reverse(); // Return oldest to newest
  }

  private async getHealthKitSteps(date: Date): Promise<number> {
    // TODO: Implement actual HealthKit integration
    // For now, return mock data
    return Math.floor(Math.random() * 10000) + 2000;
  }

  private async getGoogleFitSteps(date: Date): Promise<number> {
    // TODO: Implement actual Google Fit integration
    // For now, return mock data
    return Math.floor(Math.random() * 10000) + 2000;
  }

  async syncStepsToServer(stepData: HealthKitData): Promise<boolean> {
    try {
      // TODO: Implement API call to sync steps to backend
      console.log('Syncing steps to server:', stepData);
      return true;
    } catch (error) {
      console.error('Error syncing steps to server:', error);
      return false;
    }
  }
}

export const healthService = new HealthService();