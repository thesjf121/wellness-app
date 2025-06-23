// Android Health Connect integration service
// Health Connect is the new platform replacing Google Fit APIs

import { Capacitor } from '@capacitor/core';
import { HealthPermissions, StepEntry } from '../types/steps';
import { errorService } from './errorService';

// Health Connect plugin - graceful fallback when not available
let HealthConnect: any = null;
try {
  if (typeof require !== 'undefined') {
    const healthConnectModule = require('capacitor-health-connect');
    HealthConnect = healthConnectModule?.HealthConnect;
  }
} catch (error) {
  console.warn('Health Connect plugin not available, using fallback mode:', error);
}

export interface HealthConnectPermissions {
  read: string[];
  write: string[];
}

export interface HealthConnectRecord {
  recordType: string;
  count?: number;
  startTime: string;
  endTime: string;
}

class HealthConnectService {
  private isAvailable = false;
  private permissionsGranted = false;

  constructor() {
    this.isAvailable = Capacitor.getPlatform() === 'android' && !!HealthConnect;
  }

  /**
   * Check if Health Connect is available on this device
   */
  isHealthConnectAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Check Health Connect availability on device
   */
  async checkAvailability(): Promise<{ isAvailable: boolean; status: string }> {
    try {
      if (!this.isAvailable) {
        return { isAvailable: false, status: 'Plugin not available' };
      }

      const result = await HealthConnect.checkAvailability();
      return result;
    } catch (error) {
      errorService.logError(error as Error, { context: 'HealthConnectService.checkAvailability' });
      return { isAvailable: false, status: 'Error checking availability' };
    }
  }

  /**
   * Request Health Connect permissions for health data
   */
  async requestHealthConnectPermissions(): Promise<HealthPermissions> {
    try {
      if (!this.isAvailable) {
        return {
          granted: false,
          stepsRead: false,
          distanceRead: false,
          activeEnergyRead: false,
          requestedAt: new Date()
        };
      }

      // Request permissions for steps, heart rate, and calories
      const permissionResult = await HealthConnect.requestHealthPermissions({
        read: ['Steps', 'ActiveCaloriesBurned', 'Distance'],
        write: ['Steps']
      });

      this.permissionsGranted = permissionResult.hasAllPermissions;

      return {
        granted: permissionResult.hasAllPermissions,
        stepsRead: permissionResult.hasAllPermissions,
        distanceRead: permissionResult.hasAllPermissions,
        activeEnergyRead: permissionResult.hasAllPermissions,
        requestedAt: new Date()
      };
    } catch (error) {
      errorService.logError(error as Error, { context: 'HealthConnectService.requestHealthConnectPermissions' });
      
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
   * Check current Health Connect permissions
   */
  async checkHealthConnectPermissions(): Promise<HealthPermissions> {
    try {
      if (!this.isAvailable) {
        return {
          granted: false,
          stepsRead: false,
          distanceRead: false,
          activeEnergyRead: false,
          requestedAt: new Date()
        };
      }

      const currentPermissions = await HealthConnect.checkHealthPermissions({
        read: ['Steps', 'ActiveCaloriesBurned', 'Distance'],
        write: ['Steps']
      });

      this.permissionsGranted = currentPermissions.hasAllPermissions;

      return {
        granted: currentPermissions.hasAllPermissions,
        stepsRead: currentPermissions.hasAllPermissions,
        distanceRead: currentPermissions.hasAllPermissions,
        activeEnergyRead: currentPermissions.hasAllPermissions,
        requestedAt: new Date()
      };
    } catch (error) {
      errorService.logError(error as Error, { context: 'HealthConnectService.checkHealthConnectPermissions' });
      
      return {
        granted: false,
        stepsRead: false,
        distanceRead: false,
        activeEnergyRead: false,
        requestedAt: new Date()
      };
    }
  }

  /**
   * Get step count data from Health Connect
   */
  async getStepCount(startDate: Date, endDate: Date): Promise<StepEntry[]> {
    try {
      if (!this.isAvailable || !this.permissionsGranted) {
        throw new Error('Health Connect not available or permissions not granted');
      }

      const result = await HealthConnect.readRecords({
        type: 'Steps',
        timeRangeFilter: {
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString()
        },
        ascendingOrder: true,
        pageSize: 1000
      });

      // Convert Health Connect records to StepEntry format
      const stepEntries: StepEntry[] = [];
      const dailySteps: { [date: string]: number } = {};

      // Aggregate steps by date
      result.records.forEach((record: any) => {
        const date = new Date(record.startTime).toISOString().split('T')[0];
        dailySteps[date] = (dailySteps[date] || 0) + (record.count || 0);
      });

      // Convert to StepEntry format
      Object.entries(dailySteps).forEach(([date, stepCount]) => {
        stepEntries.push({
          id: `hc_${date}`,
          userId: 'current_user',
          date,
          stepCount,
          distance: stepCount * 0.7, // Rough conversion to meters
          activeMinutes: Math.round(stepCount / 100), // Rough conversion
          caloriesBurned: Math.round(stepCount * 0.04), // Rough conversion
          source: 'healthconnect',
          synced: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          deviceInfo: {
            platform: 'android',
            model: 'Health Connect'
          }
        });
      });

      return stepEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'HealthConnectService.getStepCount',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      throw error;
    }
  }

  /**
   * Insert step count data to Health Connect
   */
  async insertStepCount(steps: number, startTime: Date, endTime?: Date): Promise<boolean> {
    try {
      if (!this.isAvailable || !this.permissionsGranted) {
        throw new Error('Health Connect not available or permissions not granted');
      }

      const endTimeValue = endTime || startTime;

      await HealthConnect.insertRecords({
        records: [{
          recordType: 'Steps',
          count: steps,
          startTime: startTime.toISOString(),
          endTime: endTimeValue.toISOString()
        }]
      });

      return true;
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'HealthConnectService.insertStepCount',
        steps,
        startTime: startTime.toISOString()
      });
      return false;
    }
  }

  /**
   * Get active calories burned data from Health Connect
   */
  async getActiveCalories(startDate: Date, endDate: Date): Promise<any[]> {
    try {
      if (!this.isAvailable || !this.permissionsGranted) {
        throw new Error('Health Connect not available or permissions not granted');
      }

      const result = await HealthConnect.readRecords({
        type: 'ActiveCaloriesBurned',
        timeRangeFilter: {
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString()
        },
        ascendingOrder: true,
        pageSize: 1000
      });

      return result.records;
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'HealthConnectService.getActiveCalories',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      throw error;
    }
  }

  /**
   * Get heart rate data from Health Connect
   */
  async getHeartRate(startDate: Date, endDate: Date): Promise<any[]> {
    try {
      if (!this.isAvailable || !this.permissionsGranted) {
        throw new Error('Health Connect not available or permissions not granted');
      }

      const result = await HealthConnect.readRecords({
        type: 'HeartRate',
        timeRangeFilter: {
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString()
        },
        ascendingOrder: true,
        pageSize: 1000
      });

      return result.records;
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'HealthConnectService.getHeartRate',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      throw error;
    }
  }
}

// Create singleton instance
export const healthConnectService = new HealthConnectService();

export default healthConnectService;