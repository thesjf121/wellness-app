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
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  GROUPS: '/groups',
  FOOD_JOURNAL: '/food',
  STEP_COUNTER: '/steps',
  TRAINING: '/training',
  WELCOME: '/welcome',
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
  DEFAULT_STEPS: 10000,
  DEFAULT_CALORIES: 2000,
  STEP_GOAL_RANGE: { min: 5000, max: 20000 },
  CALORIE_RANGE: { min: 1200, max: 4000 },
} as const;