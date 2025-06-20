// Step tracking types and interfaces

export type StepDataSource = 'healthkit' | 'googlefit' | 'manual' | 'device' | 'unknown';

export interface StepEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  stepCount: number;
  distance?: number; // in meters
  activeMinutes?: number;
  caloriesBurned?: number;
  source: StepDataSource;
  synced: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Metadata
  deviceInfo?: {
    platform: 'ios' | 'android' | 'web';
    model?: string;
    version?: string;
  };
  
  // Hourly breakdown (optional for detailed tracking)
  hourlyData?: HourlyStepData[];
}

export interface HourlyStepData {
  hour: number; // 0-23
  steps: number;
  timestamp: Date;
}

export interface StepGoal {
  id: string;
  userId: string;
  dailyTarget: number;
  startDate: Date;
  endDate?: Date; // null if current goal
  isActive: boolean;
  createdAt: Date;
}

export interface StepStreak {
  userId: string;
  currentStreak: number; // consecutive days
  longestStreak: number;
  lastStreakDate: string; // YYYY-MM-DD
  streakStartDate: string; // YYYY-MM-DD
}

export interface StepAchievement {
  id: string;
  userId: string;
  type: 'daily_goal' | 'streak' | 'milestone' | 'personal_best';
  title: string;
  description: string;
  achievedAt: Date;
  data: {
    stepCount?: number;
    streakDays?: number;
    goalReached?: boolean;
  };
  notified: boolean;
}

export interface StepStats {
  userId: string;
  totalSteps: number;
  averageDailySteps: number;
  currentStreak: number;
  longestStreak: number;
  goalsReached: number;
  totalGoals: number;
  activeDays: number;
  lastSyncDate?: Date;
  
  // Weekly stats
  thisWeekSteps: number;
  lastWeekSteps: number;
  weeklyChange: number; // percentage
  
  // Monthly stats
  thisMonthSteps: number;
  lastMonthSteps: number;
  monthlyChange: number; // percentage
}

export interface StepSyncStatus {
  userId: string;
  lastSyncDate?: Date;
  syncInProgress: boolean;
  lastSyncError?: string;
  healthKitConnected: boolean;
  googleFitConnected: boolean;
  permissionsGranted: boolean;
  autoSyncEnabled: boolean;
}

// API request/response types
export interface CreateStepEntryRequest {
  date: string;
  stepCount: number;
  distance?: number;
  activeMinutes?: number;
  caloriesBurned?: number;
  source: StepDataSource;
  hourlyData?: HourlyStepData[];
}

export interface UpdateStepEntryRequest {
  stepCount?: number;
  distance?: number;
  activeMinutes?: number;
  caloriesBurned?: number;
  hourlyData?: HourlyStepData[];
}

export interface GetStepHistoryRequest {
  startDate: string;
  endDate: string;
  includeHourly?: boolean;
}

export interface GetStepHistoryResponse {
  entries: StepEntry[];
  totalSteps: number;
  averageDaily: number;
  goalDaysReached: number;
  totalDays: number;
}

export interface SetStepGoalRequest {
  dailyTarget: number;
  startDate?: string; // defaults to today
}

// Chart/visualization data types
export interface StepChartData {
  date: string;
  steps: number;
  goal: number;
  goalReached: boolean;
}

export interface WeeklyStepData {
  weekStart: string;
  weekEnd: string;
  totalSteps: number;
  averageDaily: number;
  goalDaysReached: number;
  days: StepChartData[];
}

export interface MonthlyStepData {
  month: string; // YYYY-MM
  totalSteps: number;
  averageDaily: number;
  goalDaysReached: number;
  weeks: WeeklyStepData[];
}

// Form types
export interface ManualStepEntryForm {
  date: string;
  stepCount: string;
  distance: string;
  activeMinutes: string;
}

export interface StepGoalForm {
  dailyTarget: string;
  startDate: string;
}

// Validation rules
export const STEP_VALIDATION_RULES = {
  stepCount: {
    min: 0,
    max: 100000, // reasonable daily maximum
    required: true
  },
  distance: {
    min: 0,
    max: 100000, // meters
    required: false
  },
  activeMinutes: {
    min: 0,
    max: 1440, // minutes in a day
    required: false
  },
  dailyGoal: {
    min: 1000,
    max: 50000,
    default: 8000
  }
} as const;

// Helper types for calculations
export interface StepPeriodSummary {
  period: 'day' | 'week' | 'month' | 'year';
  startDate: string;
  endDate: string;
  totalSteps: number;
  averageDaily: number;
  goalDaysReached: number;
  totalDays: number;
  percentageChange?: number; // vs previous period
}

export interface StepTrend {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  description: string;
}

// Health data permissions
export interface HealthPermissions {
  granted: boolean;
  stepsRead: boolean;
  distanceRead: boolean;
  activeEnergyRead: boolean;
  requestedAt?: Date;
  grantedAt?: Date;
  deniedAt?: Date;
}

// Sync configuration
export interface StepSyncConfig {
  autoSync: boolean;
  syncInterval: number; // minutes
  syncOnAppOpen: boolean;
  syncOnAppClose: boolean;
  maxRetries: number;
  batchSize: number; // days to sync at once
}