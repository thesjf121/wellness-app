// Android Google Fit integration service

import { Capacitor } from '@capacitor/core';
import { HealthPermissions, StepEntry, StepDataSource } from '../types/steps';
import { errorService } from './errorService';

// Import the health plugin for Android Google Fit
let CapacitorHealth: any;
try {
  const { CapacitorHealth: Health } = require('capacitor-health');
  CapacitorHealth = Health;
} catch (error) {
  console.warn('Google Fit plugin not available:', error);
}

export interface GoogleFitPermissions {
  activityRead: boolean;
  bodyRead: boolean;
  locationRead: boolean;
  nutritionRead: boolean;
}

export interface GoogleFitDataPoint {
  dataTypeName: string;
  startTimeMillis: number;
  endTimeMillis: number;
  value: number;
  unit: string;
  dataSourceId?: string;
}

class GoogleFitService {
  private isAvailable = false;
  private permissionsGranted = false;

  constructor() {
    this.isAvailable = Capacitor.getPlatform() === 'android' && !!CapacitorHealth;
  }

  /**
   * Check if Google Fit is available on this device
   */
  isGoogleFitAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Request Google Fit permissions for health data
   */
  async requestGoogleFitPermissions(): Promise<HealthPermissions> {
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

      // Request specific Google Fit permissions
      const permissions = await CapacitorHealth.requestPermissions({
        read: [
          'com.google.step_count.delta',
          'com.google.distance.delta',
          'com.google.active_minutes',
          'com.google.calories.expended',
          'com.google.heart_rate.bpm',
          'com.google.weight'
        ],
        write: [
          'com.google.step_count.delta'
        ]
      });

      const result: HealthPermissions = {
        granted: permissions.granted || false,
        stepsRead: permissions.steps === 'granted',
        distanceRead: permissions.distance === 'granted',
        activeEnergyRead: permissions.calories === 'granted',
        requestedAt: new Date()
      };

      if (result.granted) {
        result.grantedAt = new Date();
        this.permissionsGranted = true;
      } else {
        result.deniedAt = new Date();
      }

      errorService.logInfo('Google Fit permissions requested', { 
        granted: result.granted,
        permissions: result
      });

      return result;
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'GoogleFitService.requestGoogleFitPermissions' 
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
   * Get step count data from Google Fit
   */
  async getStepCount(startDate: Date, endDate: Date): Promise<StepEntry[]> {
    try {
      if (!this.isAvailable || !this.permissionsGranted) {
        throw new Error('Google Fit not available or permissions not granted');
      }

      const stepData = await CapacitorHealth.queryHealthData({
        dataType: 'com.google.step_count.delta',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        bucketType: 'day' // Group by day
      });

      // Get additional data for more complete entries
      const [distanceData, caloriesData] = await Promise.all([
        this.getDistanceData(startDate, endDate),
        this.getCaloriesData(startDate, endDate)
      ]);

      const deviceModel = await this.getDeviceModel();
      const deviceVersion = await this.getGoogleFitVersion();
      
      const stepEntries: StepEntry[] = stepData.map((entry: any) => {
        const date = new Date(entry.startTimeMillis).toISOString().split('T')[0];
        
        // Find matching distance and calories data
        const distanceEntry = distanceData.find(d => 
          new Date(d.startTimeMillis).toISOString().split('T')[0] === date
        );
        const caloriesEntry = caloriesData.find(c => 
          new Date(c.startTimeMillis).toISOString().split('T')[0] === date
        );
        
        return {
          id: `googlefit_${date}`,
          userId: 'current_user',
          date: date,
          stepCount: entry.value || 0,
          distance: distanceEntry?.value || 0,
          activeMinutes: this.estimateActiveMinutes(entry.value || 0),
          caloriesBurned: caloriesEntry?.value || 0,
          source: 'googlefit' as StepDataSource,
          synced: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          deviceInfo: {
            platform: 'android',
            model: deviceModel,
            version: deviceVersion
          }
        };
      });

      errorService.logInfo('Google Fit step data retrieved', { 
        entriesCount: stepEntries.length,
        dateRange: `${startDate.toISOString()} to ${endDate.toISOString()}`
      });

      return stepEntries;
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'GoogleFitService.getStepCount',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      throw error;
    }
  }

  /**
   * Get distance data from Google Fit
   */
  async getDistanceData(startDate: Date, endDate: Date): Promise<GoogleFitDataPoint[]> {
    try {
      if (!this.isAvailable || !this.permissionsGranted) {
        throw new Error('Google Fit not available or permissions not granted');
      }

      const distanceData = await CapacitorHealth.queryHealthData({
        dataType: 'com.google.distance.delta',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        bucketType: 'day'
      });

      return distanceData.map((entry: any) => ({
        dataTypeName: 'com.google.distance.delta',
        startTimeMillis: entry.startTimeMillis,
        endTimeMillis: entry.endTimeMillis,
        value: entry.value,
        unit: 'm',
        dataSourceId: entry.dataSourceId
      }));
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'GoogleFitService.getDistanceData' 
      });
      return [];
    }
  }

  /**
   * Get calories data from Google Fit
   */
  async getCaloriesData(startDate: Date, endDate: Date): Promise<GoogleFitDataPoint[]> {
    try {
      if (!this.isAvailable || !this.permissionsGranted) {
        throw new Error('Google Fit not available or permissions not granted');
      }

      const caloriesData = await CapacitorHealth.queryHealthData({
        dataType: 'com.google.calories.expended',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        bucketType: 'day'
      });

      return caloriesData.map((entry: any) => ({
        dataTypeName: 'com.google.calories.expended',
        startTimeMillis: entry.startTimeMillis,
        endTimeMillis: entry.endTimeMillis,
        value: entry.value,
        unit: 'cal',
        dataSourceId: entry.dataSourceId
      }));
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'GoogleFitService.getCaloriesData' 
      });
      return [];
    }
  }

  /**
   * Get heart rate data from Google Fit
   */
  async getHeartRateData(startDate: Date, endDate: Date): Promise<GoogleFitDataPoint[]> {
    try {
      if (!this.isAvailable || !this.permissionsGranted) {
        throw new Error('Google Fit not available or permissions not granted');
      }

      const heartRateData = await CapacitorHealth.queryHealthData({
        dataType: 'com.google.heart_rate.bpm',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        bucketType: 'day'
      });

      return heartRateData.map((entry: any) => ({
        dataTypeName: 'com.google.heart_rate.bpm',
        startTimeMillis: entry.startTimeMillis,
        endTimeMillis: entry.endTimeMillis,
        value: entry.value,
        unit: 'bpm',
        dataSourceId: entry.dataSourceId
      }));
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'GoogleFitService.getHeartRateData' 
      });
      return [];
    }
  }

  /**
   * Write step data to Google Fit
   */
  async writeStepData(steps: number, startDate: Date, endDate: Date): Promise<boolean> {
    try {
      if (!this.isAvailable) {
        return false;
      }

      await CapacitorHealth.writeHealthData({
        dataType: 'com.google.step_count.delta',
        value: steps,
        unit: 'count',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      errorService.logInfo('Step data written to Google Fit', { 
        steps, 
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      return true;
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'GoogleFitService.writeStepData',
        steps,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      return false;
    }
  }

  /**
   * Check if Google Fit is installed and connected
   */
  async isConnected(): Promise<boolean> {
    try {
      if (!this.isAvailable) {
        return false;
      }

      const status = await CapacitorHealth.isConnected();
      return status.connected || false;
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'GoogleFitService.isConnected' 
      });
      return false;
    }
  }

  /**
   * Connect to Google Fit
   */
  async connect(): Promise<boolean> {
    try {
      if (!this.isAvailable) {
        return false;
      }

      await CapacitorHealth.connect();
      errorService.logInfo('Connected to Google Fit');
      return true;
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'GoogleFitService.connect' 
      });
      return false;
    }
  }

  /**
   * Disconnect from Google Fit
   */
  async disconnect(): Promise<boolean> {
    try {
      if (!this.isAvailable) {
        return false;
      }

      await CapacitorHealth.disconnect();
      errorService.logInfo('Disconnected from Google Fit');
      return true;
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'GoogleFitService.disconnect' 
      });
      return false;
    }
  }

  /**
   * Get Google Fit data sources
   */
  async getDataSources(): Promise<any[]> {
    try {
      if (!this.isAvailable) {
        return [];
      }

      const sources = await CapacitorHealth.getDataSources({
        dataType: 'com.google.step_count.delta'
      });

      return sources.dataSources || [];
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'GoogleFitService.getDataSources' 
      });
      return [];
    }
  }

  /**
   * Estimate active minutes based on steps
   */
  private estimateActiveMinutes(steps: number): number {
    // Rough estimation: 100 steps ≈ 1 minute of activity
    return Math.round(steps / 100);
  }

  /**
   * Get device model information
   */
  private async getDeviceModel(): Promise<string> {
    try {
      // This would require additional Capacitor plugins for device info
      return 'Android'; // Placeholder
    } catch {
      return 'Unknown';
    }
  }

  /**
   * Get Google Fit version
   */
  private async getGoogleFitVersion(): Promise<string> {
    try {
      // This would require checking Google Play Services version
      return '1.0'; // Placeholder
    } catch {
      return 'Unknown';
    }
  }

  /**
   * Subscribe to data updates
   */
  async subscribeToDataUpdates(): Promise<boolean> {
    try {
      if (!this.isAvailable) {
        return false;
      }

      await CapacitorHealth.subscribe({
        dataType: 'com.google.step_count.delta'
      });

      errorService.logInfo('Subscribed to Google Fit data updates');
      return true;
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'GoogleFitService.subscribeToDataUpdates' 
      });
      return false;
    }
  }

  /**
   * Unsubscribe from data updates
   */
  async unsubscribeFromDataUpdates(): Promise<boolean> {
    try {
      if (!this.isAvailable) {
        return false;
      }

      await CapacitorHealth.unsubscribe({
        dataType: 'com.google.step_count.delta'
      });

      errorService.logInfo('Unsubscribed from Google Fit data updates');
      return true;
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'GoogleFitService.unsubscribeFromDataUpdates' 
      });
      return false;
    }
  }
}

// Create singleton instance
export const googleFitService = new GoogleFitService();

export default googleFitService;