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
  date: string;
  steps: number;
  goal: number;
  synced: boolean;
  createdAt: Date;
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