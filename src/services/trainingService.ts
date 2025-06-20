// Training service for managing training module completion and verification

import { activityTrackingService } from './activityTrackingService';
import { errorService } from './errorService';

export interface TrainingModule {
  id: number;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
  completedAt?: Date;
}

export interface TrainingProgress {
  userId: string;
  completedModules: number[];
  totalModules: number;
  completionPercentage: number;
  isFullyCompleted: boolean;
  lastCompletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class TrainingService {
  private readonly TRAINING_PROGRESS_KEY = 'wellness_training_progress';
  private readonly TRAINING_MODULES_KEY = 'wellness_training_modules';

  private readonly defaultModules: Omit<TrainingModule, 'completed' | 'completedAt'>[] = [
    {
      id: 1,
      title: 'Introduction to Wellness Coaching & Holistic Health',
      description: 'Learn the fundamentals of wellness coaching and holistic health approaches.',
      duration: '60 minutes'
    },
    {
      id: 2,
      title: 'Physical Wellness – Movement, Exercise & Sleep',
      description: 'Understand the importance of physical activity and quality sleep.',
      duration: '60 minutes'
    },
    {
      id: 3,
      title: 'Nutrition & Healthy Eating Habits',
      description: 'Develop sustainable nutrition habits and meal planning skills.',
      duration: '60 minutes'
    },
    {
      id: 4,
      title: 'Mental & Emotional Well-Being',
      description: 'Explore strategies for mental and emotional health.',
      duration: '60 minutes'
    },
    {
      id: 5,
      title: 'Stress Management & Mindfulness',
      description: 'Learn techniques for managing stress and practicing mindfulness.',
      duration: '60 minutes'
    },
    {
      id: 6,
      title: 'Healthy Habits & Behavior Change',
      description: 'Understanding how to create and maintain healthy habits.',
      duration: '60 minutes'
    },
    {
      id: 7,
      title: 'Self-Coaching & Long-Term Motivation',
      description: 'Develop self-coaching skills and maintain long-term motivation.',
      duration: '60 minutes'
    },
    {
      id: 8,
      title: 'Personal Wellness Plan',
      description: 'Create your personalized wellness plan for ongoing success.',
      duration: '60 minutes'
    }
  ];

  /**
   * Get training modules for a user with completion status
   */
  async getTrainingModules(userId: string): Promise<TrainingModule[]> {
    try {
      const progress = await this.getTrainingProgress(userId);
      
      return this.defaultModules.map(module => ({
        ...module,
        completed: progress.completedModules.includes(module.id),
        completedAt: progress.completedModules.includes(module.id) ? progress.lastCompletedAt : undefined
      }));
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.getTrainingModules',
        userId
      });
      return this.defaultModules.map(module => ({
        ...module,
        completed: false
      }));
    }
  }

  /**
   * Get training progress for a user
   */
  async getTrainingProgress(userId: string): Promise<TrainingProgress> {
    try {
      const stored = localStorage.getItem(`${this.TRAINING_PROGRESS_KEY}_${userId}`);
      
      if (stored) {
        const progress = JSON.parse(stored);
        return {
          ...progress,
          createdAt: new Date(progress.createdAt),
          updatedAt: new Date(progress.updatedAt),
          lastCompletedAt: progress.lastCompletedAt ? new Date(progress.lastCompletedAt) : undefined
        };
      }

      // Create new progress if none exists
      const newProgress: TrainingProgress = {
        userId,
        completedModules: [],
        totalModules: this.defaultModules.length,
        completionPercentage: 0,
        isFullyCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveTrainingProgress(newProgress);
      return newProgress;
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.getTrainingProgress',
        userId
      });
      
      return {
        userId,
        completedModules: [],
        totalModules: this.defaultModules.length,
        completionPercentage: 0,
        isFullyCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }

  /**
   * Complete a training module
   */
  async completeModule(userId: string, moduleId: number): Promise<TrainingProgress> {
    try {
      const progress = await this.getTrainingProgress(userId);
      
      // Don't add if already completed
      if (progress.completedModules.includes(moduleId)) {
        return progress;
      }

      // Validate module ID
      if (!this.defaultModules.find(m => m.id === moduleId)) {
        throw new Error(`Invalid module ID: ${moduleId}`);
      }

      const updatedProgress: TrainingProgress = {
        ...progress,
        completedModules: [...progress.completedModules, moduleId],
        lastCompletedAt: new Date(),
        updatedAt: new Date()
      };

      // Update calculated fields
      updatedProgress.completionPercentage = (updatedProgress.completedModules.length / updatedProgress.totalModules) * 100;
      updatedProgress.isFullyCompleted = updatedProgress.completedModules.length === updatedProgress.totalModules;

      await this.saveTrainingProgress(updatedProgress);

      // Track activity for group eligibility
      await activityTrackingService.trackTrainingActivity(userId, `module_${moduleId}`);

      errorService.logInfo('Training module completed', {
        userId,
        moduleId,
        totalCompleted: updatedProgress.completedModules.length,
        isFullyCompleted: updatedProgress.isFullyCompleted
      });

      return updatedProgress;
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.completeModule',
        userId,
        moduleId
      });
      throw error;
    }
  }

  /**
   * Uncomplete a training module (for testing/undo)
   */
  async uncompleteModule(userId: string, moduleId: number): Promise<TrainingProgress> {
    try {
      const progress = await this.getTrainingProgress(userId);
      
      const updatedProgress: TrainingProgress = {
        ...progress,
        completedModules: progress.completedModules.filter(id => id !== moduleId),
        updatedAt: new Date()
      };

      // Update calculated fields
      updatedProgress.completionPercentage = (updatedProgress.completedModules.length / updatedProgress.totalModules) * 100;
      updatedProgress.isFullyCompleted = updatedProgress.completedModules.length === updatedProgress.totalModules;

      await this.saveTrainingProgress(updatedProgress);

      errorService.logInfo('Training module uncompleted', {
        userId,
        moduleId,
        totalCompleted: updatedProgress.completedModules.length
      });

      return updatedProgress;
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.uncompleteModule',
        userId,
        moduleId
      });
      throw error;
    }
  }

  /**
   * Check if user has completed all training modules
   */
  async isTrainingCompleted(userId: string): Promise<boolean> {
    try {
      const progress = await this.getTrainingProgress(userId);
      return progress.isFullyCompleted;
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.isTrainingCompleted',
        userId
      });
      return false;
    }
  }

  /**
   * Get training completion percentage
   */
  async getCompletionPercentage(userId: string): Promise<number> {
    try {
      const progress = await this.getTrainingProgress(userId);
      return progress.completionPercentage;
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.getCompletionPercentage',
        userId
      });
      return 0;
    }
  }

  /**
   * Get completed modules count
   */
  async getCompletedModulesCount(userId: string): Promise<number> {
    try {
      const progress = await this.getTrainingProgress(userId);
      return progress.completedModules.length;
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.getCompletedModulesCount',
        userId
      });
      return 0;
    }
  }

  /**
   * Reset training progress for a user
   */
  async resetTrainingProgress(userId: string): Promise<void> {
    try {
      const resetProgress: TrainingProgress = {
        userId,
        completedModules: [],
        totalModules: this.defaultModules.length,
        completionPercentage: 0,
        isFullyCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveTrainingProgress(resetProgress);
      
      errorService.logInfo('Training progress reset', { userId });
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.resetTrainingProgress',
        userId
      });
      throw error;
    }
  }

  /**
   * Simulate completing all modules (for testing)
   */
  async simulateCompletion(userId: string): Promise<TrainingProgress> {
    try {
      const allModuleIds = this.defaultModules.map(m => m.id);
      
      const progress: TrainingProgress = {
        userId,
        completedModules: allModuleIds,
        totalModules: this.defaultModules.length,
        completionPercentage: 100,
        isFullyCompleted: true,
        lastCompletedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveTrainingProgress(progress);

      // Track activity for all modules
      for (const moduleId of allModuleIds) {
        await activityTrackingService.trackTrainingActivity(userId, `module_${moduleId}`);
      }

      errorService.logInfo('Training completion simulated', { 
        userId,
        modulesCompleted: allModuleIds.length 
      });

      return progress;
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.simulateCompletion',
        userId
      });
      throw error;
    }
  }

  /**
   * Save training progress to localStorage
   */
  private async saveTrainingProgress(progress: TrainingProgress): Promise<void> {
    try {
      const progressData = {
        ...progress,
        createdAt: progress.createdAt.toISOString(),
        updatedAt: progress.updatedAt.toISOString(),
        lastCompletedAt: progress.lastCompletedAt?.toISOString()
      };
      
      localStorage.setItem(`${this.TRAINING_PROGRESS_KEY}_${progress.userId}`, JSON.stringify(progressData));
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.saveTrainingProgress',
        userId: progress.userId
      });
      throw error;
    }
  }

  /**
   * Migrate old training data format
   */
  async migrateOldData(userId: string): Promise<void> {
    try {
      // Check for old format data
      const oldData = localStorage.getItem('wellness-training');
      if (!oldData) return;

      const oldProgress = JSON.parse(oldData);
      const completedModules = Object.keys(oldProgress)
        .filter(key => oldProgress[key] === true)
        .map(key => parseInt(key));

      if (completedModules.length > 0) {
        const newProgress: TrainingProgress = {
          userId,
          completedModules,
          totalModules: this.defaultModules.length,
          completionPercentage: (completedModules.length / this.defaultModules.length) * 100,
          isFullyCompleted: completedModules.length === this.defaultModules.length,
          lastCompletedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await this.saveTrainingProgress(newProgress);

        // Track activities for completed modules
        for (const moduleId of completedModules) {
          await activityTrackingService.trackTrainingActivity(userId, `module_${moduleId}`);
        }

        // Remove old data
        localStorage.removeItem('wellness-training');
        
        errorService.logInfo('Training data migrated', {
          userId,
          migratedModules: completedModules.length
        });
      }
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.migrateOldData',
        userId
      });
    }
  }

  /**
   * Clear training data for a user
   */
  clearUserData(userId: string): void {
    try {
      localStorage.removeItem(`${this.TRAINING_PROGRESS_KEY}_${userId}`);
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.clearUserData',
        userId
      });
    }
  }
}

// Create singleton instance
export const trainingService = new TrainingService();
export default trainingService;