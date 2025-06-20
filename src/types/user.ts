// User types and interfaces for the wellness app

export type UserRole = 'member' | 'team_sponsor' | 'super_admin';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type WellnessGoal = 'weight_loss' | 'muscle_gain' | 'endurance' | 'flexibility' | 'stress_reduction' | 'better_sleep' | 'nutrition' | 'general_health';

export interface UserProfile {
  // Basic Info
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  displayName?: string;
  bio?: string;
  phoneNumber?: string;
  
  // Wellness-specific fields
  dateOfBirth?: Date;
  height?: number; // in cm
  weight?: number; // in kg
  activityLevel?: ActivityLevel;
  primaryGoals?: WellnessGoal[];
  wellnessGoals?: WellnessGoal[];
  measurementSystem?: 'imperial' | 'metric';
  medicalConditions?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  
  // Health Goals
  dailyStepGoal: number;
  dailyCalorieGoal?: number;
  weeklyWeightLossGoal?: number; // in kg
  
  // System fields
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Wellness tracking
  trainingCompleted: boolean;
  trainingProgress: TrainingProgress;
  eligibilityDate?: Date; // When user becomes eligible for group creation
  groupMemberships: string[]; // Array of group IDs
  
  // Privacy settings
  dataPrivacy: {
    shareActivityData: boolean;
    shareProgressPhotos: boolean;
    allowGroupMessages: boolean;
    publicProfile: boolean;
  };
  
  // Preferences
  preferences: {
    notifications: NotificationPreferences;
    units: {
      weight: 'kg' | 'lbs';
      height: 'cm' | 'ft_in';
      distance: 'km' | 'miles';
    };
    timezone: string;
  };
}

export interface TrainingProgress {
  modulesCompleted: number[];
  totalModules: number;
  completionPercentage: number;
  lastModuleDate?: Date;
  certificateIssued: boolean;
}

export interface NotificationPreferences {
  dailyReminders: boolean;
  goalAchievements: boolean;
  groupActivity: boolean;
  trainingUpdates: boolean;
  weeklyReports: boolean;
  socialInteractions: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export interface UserStats {
  userId: string;
  
  // Step tracking
  totalSteps: number;
  averageDailySteps: number;
  stepStreakDays: number;
  longestStepStreak: number;
  
  // Food tracking
  totalFoodEntries: number;
  averageDailyCalories: number;
  nutritionStreakDays: number;
  
  // Training
  trainingCompletionDate?: Date;
  trainingTimeSpent: number; // in minutes
  
  // Social
  groupsJoined: number;
  groupsCreated: number;
  socialInteractions: number;
  
  // General
  accountAge: number; // days since creation
  lastActiveDate: Date;
  totalLogins: number;
}

export interface UserGoals {
  userId: string;
  
  // Current goals
  currentStepGoal: number;
  currentCalorieGoal?: number;
  currentWeightGoal?: number;
  
  // Goal history and progress
  goalHistory: GoalHistoryEntry[];
  achievedGoals: number;
  goalSuccessRate: number; // percentage
}

export interface GoalHistoryEntry {
  id: string;
  type: 'steps' | 'calories' | 'weight' | 'training' | 'social';
  targetValue: number;
  achievedValue: number;
  startDate: Date;
  endDate: Date;
  achieved: boolean;
  notes?: string;
}

export interface UserHealthData {
  userId: string;
  
  // Latest measurements
  currentWeight?: number;
  currentBMI?: number;
  bodyFatPercentage?: number;
  
  // Health metrics over time
  weightHistory: HealthMeasurement[];
  bloodPressureHistory: BloodPressureMeasurement[];
  heartRateHistory: HeartRateMeasurement[];
  
  // Integration status
  healthKitConnected: boolean;
  googleFitConnected: boolean;
  lastSyncDate?: Date;
}

export interface HealthMeasurement {
  date: Date;
  value: number;
  unit: string;
  source: 'manual' | 'healthkit' | 'googlefit' | 'device';
}

export interface BloodPressureMeasurement {
  date: Date;
  systolic: number;
  diastolic: number;
  source: 'manual' | 'device';
}

export interface HeartRateMeasurement {
  date: Date;
  bpm: number;
  type: 'resting' | 'active' | 'max';
  source: 'manual' | 'healthkit' | 'googlefit' | 'device';
}

// User creation and update interfaces
export interface CreateUserProfileRequest {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  activityLevel: ActivityLevel;
  primaryGoals: WellnessGoal[];
  dailyStepGoal: number;
  dateOfBirth?: Date;
  height?: number;
  weight?: number;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  dateOfBirth?: Date;
  height?: number;
  weight?: number;
  activityLevel?: ActivityLevel;
  primaryGoals?: WellnessGoal[];
  dailyStepGoal?: number;
  dailyCalorieGoal?: number;
  weeklyWeightLossGoal?: number;
  dataPrivacy?: Partial<UserProfile['dataPrivacy']>;
  preferences?: Partial<UserProfile['preferences']>;
}

// Helper types for forms and validation
export interface UserRegistrationForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  height: string;
  weight: string;
  activityLevel: ActivityLevel;
  primaryGoals: WellnessGoal[];
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

export interface UserProfileForm {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  height: string;
  weight: string;
  activityLevel: ActivityLevel;
  primaryGoals: WellnessGoal[];
  dailyStepGoal: string;
  dailyCalorieGoal: string;
  weeklyWeightLossGoal: string;
}

// Validation schemas (can be used with libraries like Yup or Zod)
export const USER_VALIDATION_RULES = {
  firstName: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  lastName: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  height: {
    min: 50, // cm
    max: 300 // cm
  },
  weight: {
    min: 20, // kg
    max: 300 // kg
  },
  dailyStepGoal: {
    min: 1000,
    max: 50000
  },
  dailyCalorieGoal: {
    min: 1200,
    max: 4000
  },
  weeklyWeightLossGoal: {
    min: 0.1,
    max: 2.0
  }
} as const;