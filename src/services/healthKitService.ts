// iOS HealthKit specific integration service

import { Capacitor } from '@capacitor/core';
import { HealthPermissions, StepEntry, StepDataSource } from '../types/steps';
import { errorService } from './errorService';

// Health plugin for iOS HealthKit - graceful fallback when not available
let CapacitorHealth: any = null;
try {
  if (typeof require !== 'undefined') {
    const healthModule = require('capacitor-health');
    CapacitorHealth = healthModule?.CapacitorHealth;
  }
} catch (error) {
  console.warn('HealthKit plugin not available, using fallback mode:', error);
}

export interface HealthKitPermissions {
  steps: boolean;
  distance: boolean;
  activeEnergy: boolean;
  heartRate: boolean;
  bodyMass: boolean;
}

export interface HealthKitDataType {
  identifier: string;
  startDate: Date;
  endDate: Date;
  value: number;
  unit: string;
  metadata?: Record<string, any>;
}

class HealthKitService {
  private isAvailable = false;
  private permissionsGranted = false;

  constructor() {
    this.isAvailable = Capacitor.getPlatform() === 'ios' && !!CapacitorHealth;
  }

  /**
   * Check if HealthKit is available on this device
   */
  isHealthKitAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Request HealthKit permissions for step tracking
   */
  async requestHealthKitPermissions(): Promise<HealthPermissions> {
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

      // Request specific HealthKit permissions
      const permissions = await CapacitorHealth.requestPermissions({
        read: [
          'HKQuantityTypeIdentifierStepCount',
          'HKQuantityTypeIdentifierDistanceWalkingRunning',
          'HKQuantityTypeIdentifierActiveEnergyBurned',
          'HKQuantityTypeIdentifierHeartRate',
          'HKQuantityTypeIdentifierBodyMass'
        ],
        write: []
      });

      const result: HealthPermissions = {
        granted: permissions.granted || false,
        stepsRead: permissions.steps === 'granted',
        distanceRead: permissions.distance === 'granted',
        activeEnergyRead: permissions.activeEnergyBurned === 'granted',
        requestedAt: new Date()
      };

      if (result.granted) {
        result.grantedAt = new Date();
        this.permissionsGranted = true;
      } else {
        result.deniedAt = new Date();
      }

      errorService.logInfo('HealthKit permissions requested', { 
        granted: result.granted,
        permissions: result
      });

      return result;
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'HealthKitService.requestHealthKitPermissions' 
      });

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
   * Get step count data from HealthKit
   */
  async getStepCount(startDate: Date, endDate: Date): Promise<StepEntry[]> {
    try {
      if (!this.isAvailable || !this.permissionsGranted) {
        throw new Error('HealthKit not available or permissions not granted');
      }

      const stepData = await CapacitorHealth.queryHealthData({
        dataType: 'HKQuantityTypeIdentifierStepCount',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 1000 // Maximum number of samples
      });

      // Group by day and sum steps
      const dailySteps = this.groupStepsByDay(stepData);

      const deviceModel = await this.getDeviceModel();
      const deviceVersion = await this.getHealthKitVersion();
      
      const stepEntries: StepEntry[] = Object.entries(dailySteps).map(([date, data]) => ({
        id: `healthkit_${date}`,
        userId: 'current_user',
        date: date,
        stepCount: data.steps,
        distance: data.distance,
        activeMinutes: data.activeMinutes,
        caloriesBurned: data.calories,
        source: 'healthkit' as StepDataSource,
        synced: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deviceInfo: {
          platform: 'ios',
          model: deviceModel,
          version: deviceVersion
        }
      }));

      errorService.logInfo('HealthKit step data retrieved', { 
        entriesCount: stepEntries.length,
        dateRange: `${startDate.toISOString()} to ${endDate.toISOString()}`
      });

      return stepEntries;
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'HealthKitService.getStepCount',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      throw error;
    }
  }

  /**
   * Get distance data from HealthKit
   */
  async getDistanceData(startDate: Date, endDate: Date): Promise<HealthKitDataType[]> {
    try {
      if (!this.isAvailable || !this.permissionsGranted) {
        throw new Error('HealthKit not available or permissions not granted');
      }

      const distanceData = await CapacitorHealth.queryHealthData({
        dataType: 'HKQuantityTypeIdentifierDistanceWalkingRunning',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 1000
      });

      return distanceData.map((entry: any) => ({
        identifier: 'HKQuantityTypeIdentifierDistanceWalkingRunning',
        startDate: new Date(entry.startDate),
        endDate: new Date(entry.endDate),
        value: entry.value,
        unit: entry.unit || 'm',
        metadata: entry.metadata
      }));
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'HealthKitService.getDistanceData' 
      });
      throw error;
    }
  }

  /**
   * Get active energy data from HealthKit
   */
  async getActiveEnergyData(startDate: Date, endDate: Date): Promise<HealthKitDataType[]> {
    try {
      if (!this.isAvailable || !this.permissionsGranted) {
        throw new Error('HealthKit not available or permissions not granted');
      }

      const energyData = await CapacitorHealth.queryHealthData({
        dataType: 'HKQuantityTypeIdentifierActiveEnergyBurned',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 1000
      });

      return energyData.map((entry: any) => ({
        identifier: 'HKQuantityTypeIdentifierActiveEnergyBurned',
        startDate: new Date(entry.startDate),
        endDate: new Date(entry.endDate),
        value: entry.value,
        unit: entry.unit || 'cal',
        metadata: entry.metadata
      }));
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'HealthKitService.getActiveEnergyData' 
      });
      throw error;
    }
  }

  /**
   * Get heart rate data from HealthKit
   */
  async getHeartRateData(startDate: Date, endDate: Date): Promise<HealthKitDataType[]> {
    try {
      if (!this.isAvailable || !this.permissionsGranted) {
        throw new Error('HealthKit not available or permissions not granted');
      }

      const heartRateData = await CapacitorHealth.queryHealthData({
        dataType: 'HKQuantityTypeIdentifierHeartRate',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 1000
      });

      return heartRateData.map((entry: any) => ({
        identifier: 'HKQuantityTypeIdentifierHeartRate',
        startDate: new Date(entry.startDate),
        endDate: new Date(entry.endDate),
        value: entry.value,
        unit: entry.unit || 'count/min',
        metadata: entry.metadata
      }));
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'HealthKitService.getHeartRateData' 
      });
      throw error;
    }
  }

  /**
   * Write step data to HealthKit (if write permissions granted)
   */
  async writeStepData(steps: number, date: Date): Promise<boolean> {
    try {
      if (!this.isAvailable) {
        return false;
      }

      await CapacitorHealth.writeHealthData({
        dataType: 'HKQuantityTypeIdentifierStepCount',
        value: steps,
        unit: 'count',
        startDate: date.toISOString(),
        endDate: date.toISOString()
      });

      errorService.logInfo('Step data written to HealthKit', { steps, date });
      return true;
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'HealthKitService.writeStepData',
        steps,
        date: date.toISOString()
      });
      return false;
    }
  }

  /**
   * Check HealthKit authorization status
   */
  async getAuthorizationStatus(): Promise<string> {
    try {
      if (!this.isAvailable) {
        return 'notAvailable';
      }

      const status = await CapacitorHealth.getAuthorizationStatus({
        dataType: 'HKQuantityTypeIdentifierStepCount'
      });

      return status.status || 'unknown';
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'HealthKitService.getAuthorizationStatus' 
      });
      return 'error';
    }
  }

  /**
   * Group step data by day
   */
  private groupStepsByDay(stepData: any[]): Record<string, { 
    steps: number; 
    distance: number; 
    activeMinutes: number; 
    calories: number; 
  }> {
    const dailyData: Record<string, any> = {};

    stepData.forEach((entry: any) => {
      const date = new Date(entry.startDate).toISOString().split('T')[0];
      
      if (!dailyData[date]) {
        dailyData[date] = {
          steps: 0,
          distance: 0,
          activeMinutes: 0,
          calories: 0
        };
      }

      dailyData[date].steps += entry.value || 0;
      
      // Estimate other values based on steps if not provided
      if (!dailyData[date].distance) {
        dailyData[date].distance = (entry.value || 0) * 0.7; // Rough conversion
      }
      if (!dailyData[date].activeMinutes) {
        dailyData[date].activeMinutes = Math.round((entry.value || 0) / 100);
      }
      if (!dailyData[date].calories) {
        dailyData[date].calories = Math.round((entry.value || 0) * 0.04);
      }
    });

    return dailyData;
  }

  /**
   * Get device model information
   */
  private async getDeviceModel(): Promise<string> {
    try {
      // This would require additional Capacitor plugins for device info
      return 'iPhone'; // Placeholder
    } catch {
      return 'Unknown';
    }
  }

  /**
   * Get HealthKit version
   */
  private async getHealthKitVersion(): Promise<string> {
    try {
      // This would require checking iOS version
      return '1.0'; // Placeholder
    } catch {
      return 'Unknown';
    }
  }

  /**
   * Enable background delivery for step updates
   */
  async enableBackgroundDelivery(): Promise<boolean> {
    try {
      if (!this.isAvailable) {
        return false;
      }

      await CapacitorHealth.enableBackgroundDelivery({
        dataType: 'HKQuantityTypeIdentifierStepCount',
        frequency: 'immediate' // or 'hourly', 'daily', 'weekly'
      });

      errorService.logInfo('HealthKit background delivery enabled');
      return true;
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'HealthKitService.enableBackgroundDelivery' 
      });
      return false;
    }
  }

  /**
   * Disable background delivery
   */
  async disableBackgroundDelivery(): Promise<boolean> {
    try {
      if (!this.isAvailable) {
        return false;
      }

      await CapacitorHealth.disableBackgroundDelivery({
        dataType: 'HKQuantityTypeIdentifierStepCount'
      });

      errorService.logInfo('HealthKit background delivery disabled');
      return true;
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'HealthKitService.disableBackgroundDelivery' 
      });
      return false;
    }
  }
}

// Create singleton instance
export const healthKitService = new HealthKitService();

export default healthKitService;