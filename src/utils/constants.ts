// Application constants

export const APP_CONFIG = {
  NAME: 'WellnessApp',
  VERSION: '1.0.0',
  DESCRIPTION: 'Creating wellness through movement, nutrition, and social connection',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ONBOARDING: '/onboarding',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  GROUPS: '/groups',
  FOOD_JOURNAL: '/food',
  NUTRITION_ANALYSIS: '/nutrition-analysis',
  STEP_COUNTER: '/steps',
  TRAINING: '/training',
  COACHING: '/coaching',
  WELCOME: '/welcome',
  HELP: '/help',
  ADMIN_VIDEOS: '/admin/videos',
} as const;

export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  GROUPS: '/api/groups',
  STEPS: '/api/steps',
  FOOD: '/api/food',
  TRAINING: '/api/training',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  STEP_DATA: 'step_data',
  FOOD_CACHE: 'food_cache',
} as const;

export const GROUP_CONFIG = {
  MAX_MEMBERS: 10,
  ELIGIBILITY_DAYS: 7,
  REQUIRED_TRAINING_MODULES: 8,
} as const;

export const HEALTH_GOALS = {
  DEFAULT_STEPS: 8000,
  DEFAULT_CALORIES: 2000,
  STEP_GOAL_RANGE: { min: 1000, max: 50000 },
  CALORIE_RANGE: { min: 1200, max: 4000 },
} as const;

export const TRAINING_CONFIG = {
  TOTAL_MODULES: 8,
  MODULE_NAMES: [
    'Introduction to Wellness Coaching & Holistic Health',
    'Physical Wellness – Movement, Exercise & Sleep',
    'Nutrition & Healthy Eating Habits',
    'Mental & Emotional Well-Being',
    'Stress Management & Mindfulness',
    'Healthy Habits & Behavior Change',
    'Self-Coaching & Long-Term Motivation',
    'Personal Wellness Plan'
  ],
  ESTIMATED_COMPLETION_TIME: 480, // minutes total
} as const;

export const MEAL_TYPES = [
  'breakfast',
  'lunch', 
  'dinner',
  'snack'
] as const;

export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary (little/no exercise)' },
  { value: 'lightly_active', label: 'Lightly Active (light exercise 1-3 days/week)' },
  { value: 'moderately_active', label: 'Moderately Active (moderate exercise 3-5 days/week)' },
  { value: 'very_active', label: 'Very Active (hard exercise 6-7 days/week)' }
] as const;

export const WELLNESS_GOALS = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'fitness', label: 'Fitness & Strength' },
  { value: 'nutrition', label: 'Better Nutrition' },
  { value: 'social', label: 'Social Support' }
] as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  AUTH_ERROR: 'Authentication failed. Please sign in again.',
  PERMISSION_DENIED: 'Permission denied. Please grant required permissions.',
  INVALID_INPUT: 'Invalid input. Please check your data.',
  SERVER_ERROR: 'Server error. Please try again later.',
  AI_SERVICE_ERROR: 'AI service unavailable. You can enter nutrition data manually.',
  HEALTH_DATA_ERROR: 'Unable to access health data. You can enter steps manually.',
} as const;

export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully!',
  GOAL_ACHIEVED: 'Congratulations! Goal achieved!',
  TRAINING_COMPLETED: 'Training module completed!',
  GROUP_JOINED: 'Successfully joined the group!',
  FOOD_LOGGED: 'Food entry saved successfully!',
} as const;