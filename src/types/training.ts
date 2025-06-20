// Training module types and interfaces

export interface TrainingModule {
  id: string;
  number: number;
  title: string;
  description: string;
  estimatedDuration: number; // in minutes
  isRequired: boolean;
  prerequisites: string[]; // module IDs
  sections: ModuleSection[];
  resources: ModuleResource[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ModuleSection {
  id: string;
  moduleId: string;
  number: number;
  title: string;
  content: SectionContent[];
  exercises: Exercise[];
  estimatedDuration: number;
  isRequired: boolean;
}

export interface SectionContent {
  id: string;
  type: 'text' | 'video' | 'audio' | 'image' | 'interactive';
  title?: string;
  content: string;
  metadata?: any;
  order: number;
}

export interface Exercise {
  id: string;
  sectionId: string;
  type: ExerciseType;
  title: string;
  instructions: string;
  estimatedDuration: number;
  isRequired: boolean;
  config: any; // Exercise-specific configuration
  order: number;
}

export type ModuleExercise = Exercise;

export type ExerciseType = 
  | 'reflection_journal'
  | 'wellness_wheel'
  | 'reflection'
  | 'movement_tracker'
  | 'movement_challenge'
  | 'sleep_audit'
  | 'mindful_eating_timer'
  | 'meal_planning'
  | 'mood_tracking'
  | 'mindset_reframing'
  | 'resilience_mapping'
  | 'guided_meditation'
  | 'breathing_exercise'
  | 'stress_inventory'
  | 'habit_loop_analyzer'
  | 'habit_tracker'
  | 'if_then_planning'
  | 'weekly_reflection'
  | 'self_coaching_checklist'
  | 'progress_celebration'
  | 'wellness_vision_builder'
  | 'smart_goal_setting'
  | 'wellness_plan_generator'
  | 'quiz_assessment';

export interface ModuleResource {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'audio' | 'worksheet' | 'template' | 'link' | 'article' | 'guide' | 'planner' | 'checklist';
  url: string;
  downloadable: boolean;
  fileSize?: number;
  duration?: number; // for videos/audio
}

export interface UserModuleProgress {
  id: string;
  userId: string;
  moduleId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
  currentSectionId?: string;
  completedSections: string[];
  completedExercises: string[];
  timeSpent: number; // in seconds
  progressPercentage: number;
  bookmarks: ModuleBookmark[];
  notes: ModuleNote[];
}

export interface ModuleBookmark {
  id: string;
  userId: string;
  moduleId: string;
  sectionId: string;
  contentId?: string;
  title: string;
  note?: string;
  createdAt: Date;
}

export interface ModuleNote {
  id: string;
  userId: string;
  moduleId: string;
  sectionId?: string;
  exerciseId?: string;
  content: string;
  isPrivate: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseSubmission {
  id: string;
  userId: string;
  exerciseId: string;
  moduleId: string;
  sectionId: string;
  responses: Record<string, any>;
  isComplete: boolean;
  submittedAt: Date;
  timeSpent: number;
  feedback?: string;
  score?: number;
}

export interface ModuleCertificate {
  id: string;
  userId: string;
  moduleId: string;
  certificateNumber: string;
  issuedAt: Date;
  validUntil?: Date;
  downloadUrl: string;
  metadata: {
    completionTime: number;
    score?: number;
    exercisesCompleted: number;
    totalExercises: number;
  };
}

export interface TrainingAssessment {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  questions: AssessmentQuestion[];
  passingScore: number;
  timeLimit?: number; // in minutes
  maxAttempts?: number;
  isRequired: boolean;
}

export interface AssessmentQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'rating_scale';
  question: string;
  options?: string[]; // for multiple choice
  correctAnswer?: string | number;
  points: number;
  explanation?: string;
  order: number;
}

export interface AssessmentAttempt {
  id: string;
  userId: string;
  assessmentId: string;
  moduleId: string;
  answers: Record<string, any>;
  score: number;
  maxScore: number;
  passed: boolean;
  startedAt: Date;
  submittedAt: Date;
  timeSpent: number;
  attemptNumber: number;
}

export interface TrainingBadge {
  id: string;
  moduleId?: string; // null for system-wide badges
  title: string;
  description: string;
  iconUrl: string;
  category: 'completion' | 'excellence' | 'engagement' | 'milestone';
  criteria: BadgeCriteria;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

export interface BadgeCriteria {
  type: 'module_completion' | 'score_threshold' | 'time_bonus' | 'exercise_mastery' | 'streak' | 'engagement';
  value: number;
  description: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
  moduleId?: string;
  metadata?: any;
}

// Storage keys for localStorage
export const TRAINING_STORAGE_KEYS = {
  MODULES: 'wellness_training_modules',
  USER_PROGRESS: 'wellness_user_module_progress',
  BOOKMARKS: 'wellness_module_bookmarks',
  NOTES: 'wellness_module_notes',
  EXERCISE_SUBMISSIONS: 'wellness_exercise_submissions',
  CERTIFICATES: 'wellness_module_certificates',
  ASSESSMENTS: 'wellness_training_assessments',
  ASSESSMENT_ATTEMPTS: 'wellness_assessment_attempts',
  BADGES: 'wellness_training_badges',
  USER_BADGES: 'wellness_user_badges'
} as const;