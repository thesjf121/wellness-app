// Global type definitions for the wellness app

export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'team_sponsor' | 'member';
  profilePicture?: string;
  profile: UserProfile;
  goals: UserGoals;
  trainingCompleted: boolean;
  eligibilityDate: Date | null;
  groupMemberships: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  dateOfBirth?: Date;
  height?: number;
  weight?: number;
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  primaryGoals: ('weight_loss' | 'fitness' | 'nutrition' | 'social')[];
}

export interface UserGoals {
  dailySteps: number;
  dailyCalories?: number;
  weeklyWeightLoss?: number;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  sponsorId: string;
  members: User[];
  maxMembers: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StepData {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  stepCount: number;
  goal: number;
  distance?: number; // in meters
  activeMinutes?: number;
  calories?: number;
  source: 'healthkit' | 'googlefit' | 'manual' | 'web';
  synced: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StepGoal {
  id: string;
  userId: string;
  dailyStepGoal: number;
  weeklyStepGoal?: number;
  monthlyStepGoal?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StepAchievement {
  id: string;
  userId: string;
  type: 'daily_goal' | 'weekly_goal' | 'monthly_goal' | 'streak' | 'milestone';
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
}

export interface StepStreak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  isActive: boolean;
}

export interface StepSummary {
  today: number;
  yesterday: number;
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
  average7Days: number;
  average30Days: number;
  totalSteps: number;
  goalAchievementRate: number; // percentage
}

export interface FoodEntry {
  id: string;
  userId: string;
  description: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  micronutrients: Record<string, number>;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string;
  createdAt: Date;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  isCompleted: boolean;
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  type: 'reflection' | 'interactive' | 'quiz';
  data: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}