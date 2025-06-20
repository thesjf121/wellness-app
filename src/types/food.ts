// Food journal and nutrition tracking types

import { NutritionData } from '../services/geminiService';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  mealType: MealType;
  foods: NutritionData[];
  notes?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  synced: boolean;
}

export interface DailyNutrition {
  date: string;
  totalCalories: number;
  totalMacros: {
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
  totalMicros: {
    sodium: number;
    potassium: number;
    calcium: number;
    iron: number;
    vitaminC: number;
    vitaminA: number;
  };
  mealBreakdown: {
    breakfast: Partial<DailyNutrition>;
    lunch: Partial<DailyNutrition>;
    dinner: Partial<DailyNutrition>;
    snack: Partial<DailyNutrition>;
  };
  entries: FoodEntry[];
}

export interface NutritionGoals {
  userId: string;
  dailyCalories: number;
  macroGoals: {
    protein: number; // grams
    carbohydrates: number; // grams
    fat: number; // grams
    fiber: number; // grams
    sugar: number; // grams
  };
  microGoals: {
    sodium: number; // mg (usually a limit)
    potassium: number; // mg
    calcium: number; // mg
    iron: number; // mg
    vitaminC: number; // mg
    vitaminA: number; // IU
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface FoodSearchResult {
  id: string;
  name: string;
  brand?: string;
  category: string;
  nutrition: NutritionData;
  isCommon: boolean;
  isFavorite: boolean;
}

export interface CreateFoodEntryRequest {
  date: string;
  mealType: MealType;
  textDescription?: string;
  imageBase64?: string;
  notes?: string;
}

export interface NutritionSummary {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  averageCalories: number;
  averageMacros: {
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
  goalAchievements: {
    caloriesAchieved: number; // percentage
    proteinAchieved: number;
    carbsAchieved: number;
    fatAchieved: number;
    fiberAchieved: number;
  };
  topFoods: Array<{
    foodItem: string;
    frequency: number;
    totalCalories: number;
  }>;
  insights: string[];
}

export interface FavoriteFoodItem {
  id: string;
  userId: string;
  foodName: string;
  nutrition: NutritionData;
  frequency: number; // how often it's used
  lastUsed: Date;
  createdAt: Date;
}

export interface NutritionInsight {
  type: 'positive' | 'warning' | 'suggestion';
  title: string;
  message: string;
  metric?: string;
  value?: number;
  target?: number;
}

// Nutrition database for common foods
export interface FoodDatabase {
  foods: Array<{
    id: string;
    name: string;
    aliases: string[];
    category: string;
    nutrition: NutritionData;
    isVerified: boolean;
  }>;
}

// Export types for food analysis
export interface FoodAnalysisJob {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input: {
    type: 'text' | 'image';
    data: string;
    mealType?: MealType;
  };
  result?: NutritionData[];
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

// Meal planning types
export interface MealPlan {
  id: string;
  userId: string;
  name: string;
  startDate: string;
  endDate: string;
  meals: Array<{
    date: string;
    mealType: MealType;
    plannedFoods: NutritionData[];
    notes?: string;
  }>;
  nutritionTargets: NutritionGoals;
  createdAt: Date;
  updatedAt: Date;
}

// Food preferences and restrictions
export interface DietaryProfile {
  userId: string;
  restrictions: Array<'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'nut-free' | 'low-sodium' | 'keto' | 'paleo'>;
  allergies: string[];
  preferences: string[];
  dislikedFoods: string[];
  caloricNeeds: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  updatedAt: Date;
}