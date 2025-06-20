// Training service for wellness coaching modules

import { 
  TrainingModule, 
  UserModuleProgress, 
  ModuleBookmark, 
  ModuleNote,
  ExerciseSubmission,
  ModuleCertificate,
  TRAINING_STORAGE_KEYS
} from '../types/training';
import { errorService } from './errorService';

class TrainingService {
  /**
   * Get all training modules
   */
  getTrainingModules(): TrainingModule[] {
    try {
      const stored = localStorage.getItem(TRAINING_STORAGE_KEYS.MODULES);
      if (stored) {
        return JSON.parse(stored);
      }
      
      return this.getDefaultModules();
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.getTrainingModules'
      });
      return this.getDefaultModules();
    }
  }

  /**
   * Get a specific module by ID
   */
  getModuleById(moduleId: string): TrainingModule | null {
    const modules = this.getTrainingModules();
    return modules.find(m => m.id === moduleId) || null;
  }

  /**
   * Get user's progress for all modules
   */
  getUserProgress(userId: string): UserModuleProgress[] {
    try {
      const stored = localStorage.getItem(TRAINING_STORAGE_KEYS.USER_PROGRESS);
      const allProgress = stored ? JSON.parse(stored) : [];
      const userProgress = allProgress.filter((p: UserModuleProgress) => p.userId === userId);
      
      // Recalculate progress percentages to fix any incorrect calculations
      userProgress.forEach(progress => {
        const module = this.getModuleById(progress.moduleId);
        if (module && progress.completedSections.length > 0) {
          const totalSections = module.sections.length;
          progress.progressPercentage = Math.min(100, (progress.completedSections.length / totalSections) * 100);
          
          // Update status if needed
          if (progress.completedSections.length >= totalSections) {
            progress.status = 'completed';
            if (!progress.completedAt) {
              progress.completedAt = new Date();
            }
          }
        }
      });
      
      // Save the corrected progress
      if (userProgress.length > 0) {
        const allProgressCorrected = allProgress.map((p: UserModuleProgress) => 
          p.userId === userId ? userProgress.find(up => up.id === p.id) || p : p
        );
        localStorage.setItem(TRAINING_STORAGE_KEYS.USER_PROGRESS, JSON.stringify(allProgressCorrected));
      }
      
      return userProgress;
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.getUserProgress',
        userId
      });
      return [];
    }
  }

  /**
   * Get user's progress for a specific module
   */
  getModuleProgress(userId: string, moduleId: string): UserModuleProgress | null {
    const userProgress = this.getUserProgress(userId);
    return userProgress.find(p => p.moduleId === moduleId) || null;
  }

  /**
   * Start a module for a user
   */
  async startModule(userId: string, moduleId: string): Promise<UserModuleProgress> {
    try {
      const module = this.getModuleById(moduleId);
      if (!module) {
        throw new Error('Module not found');
      }

      let progress = this.getModuleProgress(userId, moduleId);
      
      if (progress) {
        progress.lastAccessedAt = new Date();
        if (progress.status === 'not_started') {
          progress.status = 'in_progress';
          progress.startedAt = new Date();
        }
      } else {
        progress = {
          id: this.generateId('progress'),
          userId,
          moduleId,
          status: 'in_progress',
          startedAt: new Date(),
          lastAccessedAt: new Date(),
          completedSections: [],
          completedExercises: [],
          timeSpent: 0,
          progressPercentage: 0,
          bookmarks: [],
          notes: []
        };
      }

      await this.saveUserProgress(progress);
      return progress;
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.startModule',
        userId,
        moduleId
      });
      throw error;
    }
  }

  /**
   * Complete a section
   */
  async completeSection(userId: string, moduleId: string, sectionId: string): Promise<void> {
    try {
      let progress = this.getModuleProgress(userId, moduleId);
      if (!progress) {
        progress = await this.startModule(userId, moduleId);
      }

      if (!progress.completedSections.includes(sectionId)) {
        progress.completedSections.push(sectionId);
        progress.lastAccessedAt = new Date();
        
        // Calculate progress based on actual module sections
        const module = this.getModuleById(moduleId);
        if (module) {
          const totalSections = module.sections.length;
          progress.progressPercentage = Math.min(100, (progress.completedSections.length / totalSections) * 100);
          
          // Mark as completed if all sections done
          if (progress.completedSections.length >= totalSections) {
            progress.status = 'completed';
            progress.completedAt = new Date();
          }
        } else {
          // Fallback if module not found
          progress.progressPercentage = Math.min(100, (progress.completedSections.length / 3) * 100);
          if (progress.completedSections.length >= 3) {
            progress.status = 'completed';
            progress.completedAt = new Date();
          }
        }

        await this.saveUserProgress(progress);
      }
    } catch (error) {
      console.error('Error completing section:', error);
      // Don't throw error, just log it
    }
  }

  /**
   * Submit an exercise response
   */
  async submitExercise(userId: string, moduleId: string, exerciseId: string, responses: Record<string, any>, sectionId?: string): Promise<ExerciseSubmission> {
    try {
      // If sectionId not provided, try to find it from the module
      let exerciseSectionId = sectionId;
      if (!exerciseSectionId) {
        const module = this.getModuleById(moduleId);
        if (module) {
          for (const section of module.sections) {
            const exercise = section.exercises.find(e => e.id === exerciseId);
            if (exercise) {
              exerciseSectionId = section.id;
              break;
            }
          }
        }
      }

      const submission: ExerciseSubmission = {
        id: this.generateId('submission'),
        userId,
        moduleId,
        exerciseId,
        sectionId: exerciseSectionId || '',
        responses,
        isComplete: true,
        submittedAt: new Date(),
        score: this.calculateExerciseScore(responses),
        feedback: this.generateFeedback(responses),
        timeSpent: responses.timeSpent || 0
      };

      // Save submission
      await this.saveExerciseSubmission(submission);

      // Mark exercise as completed
      await this.completeExercise(userId, moduleId, exerciseId, submission);

      return submission;
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.submitExercise',
        userId,
        moduleId,
        exerciseId
      });
      throw error;
    }
  }

  /**
   * Complete an exercise
   */
  async completeExercise(userId: string, moduleId: string, exerciseId: string, submission: ExerciseSubmission): Promise<void> {
    try {
      let progress = this.getModuleProgress(userId, moduleId);
      if (!progress) {
        progress = await this.startModule(userId, moduleId);
      }

      if (!progress.completedExercises.includes(exerciseId)) {
        progress.completedExercises.push(exerciseId);
        progress.lastAccessedAt = new Date();
        progress.timeSpent += submission.timeSpent;

        await this.saveUserProgress(progress);
      }
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.completeExercise',
        userId,
        moduleId,
        exerciseId
      });
      throw error;
    }
  }

  /**
   * Get exercise submissions for a user
   */
  getExerciseSubmissions(userId: string, moduleId?: string, exerciseId?: string): ExerciseSubmission[] {
    try {
      const stored = localStorage.getItem(TRAINING_STORAGE_KEYS.EXERCISE_SUBMISSIONS);
      const allSubmissions: ExerciseSubmission[] = stored ? JSON.parse(stored) : [];
      
      let filtered = allSubmissions.filter(s => s.userId === userId);
      
      if (moduleId) {
        filtered = filtered.filter(s => s.moduleId === moduleId);
      }
      
      if (exerciseId) {
        filtered = filtered.filter(s => s.exerciseId === exerciseId);
      }
      
      return filtered.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.getExerciseSubmissions',
        userId,
        moduleId,
        exerciseId
      });
      return [];
    }
  }

  /**
   * Check if exercise is completed
   */
  isExerciseCompleted(userId: string, moduleId: string, exerciseId: string): boolean {
    const progress = this.getModuleProgress(userId, moduleId);
    return progress?.completedExercises.includes(exerciseId) || false;
  }

  /**
   * Get completed modules count for user
   */
  getCompletedModulesCount(userId: string): number {
    const userProgress = this.getUserProgress(userId);
    return userProgress.filter(p => p.status === 'completed').length;
  }

  /**
   * Get user certificates
   */
  async getUserCertificates(userId: string): Promise<ModuleCertificate[]> {
    try {
      const stored = localStorage.getItem(TRAINING_STORAGE_KEYS.CERTIFICATES);
      const allCertificates: ModuleCertificate[] = stored ? JSON.parse(stored) : [];
      return allCertificates.filter(c => c.userId === userId);
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.getUserCertificates',
        userId
      });
      return [];
    }
  }

  /**
   * Get user bookmarks
   */
  async getUserBookmarks(userId: string, moduleId?: string): Promise<ModuleBookmark[]> {
    try {
      const stored = localStorage.getItem(TRAINING_STORAGE_KEYS.BOOKMARKS);
      const allBookmarks: ModuleBookmark[] = stored ? JSON.parse(stored) : [];
      
      let filtered = allBookmarks.filter(b => b.userId === userId);
      if (moduleId) {
        filtered = filtered.filter(b => b.moduleId === moduleId);
      }
      
      return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.getUserBookmarks',
        userId,
        moduleId
      });
      return [];
    }
  }

  /**
   * Add bookmark
   */
  async addBookmark(userId: string, moduleId: string, sectionId: string, contentId: string, title: string): Promise<ModuleBookmark> {
    try {
      const bookmark: ModuleBookmark = {
        id: this.generateId('bookmark'),
        userId,
        moduleId,
        sectionId,
        contentId,
        title,
        createdAt: new Date()
      };

      const stored = localStorage.getItem(TRAINING_STORAGE_KEYS.BOOKMARKS);
      const bookmarks: ModuleBookmark[] = stored ? JSON.parse(stored) : [];
      bookmarks.push(bookmark);
      localStorage.setItem(TRAINING_STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));

      return bookmark;
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.addBookmark',
        userId,
        moduleId,
        sectionId
      });
      throw error;
    }
  }

  /**
   * Remove bookmark
   */
  async removeBookmark(bookmarkId: string): Promise<void> {
    try {
      const stored = localStorage.getItem(TRAINING_STORAGE_KEYS.BOOKMARKS);
      const bookmarks: ModuleBookmark[] = stored ? JSON.parse(stored) : [];
      const filtered = bookmarks.filter(b => b.id !== bookmarkId);
      localStorage.setItem(TRAINING_STORAGE_KEYS.BOOKMARKS, JSON.stringify(filtered));
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.removeBookmark',
        bookmarkId
      });
      throw error;
    }
  }

  /**
   * Get user notes
   */
  async getUserNotes(userId: string, moduleId?: string): Promise<ModuleNote[]> {
    try {
      const stored = localStorage.getItem(TRAINING_STORAGE_KEYS.NOTES);
      const allNotes: ModuleNote[] = stored ? JSON.parse(stored) : [];
      
      let filtered = allNotes.filter(n => n.userId === userId);
      if (moduleId) {
        filtered = filtered.filter(n => n.moduleId === moduleId);
      }
      
      return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.getUserNotes',
        userId,
        moduleId
      });
      return [];
    }
  }

  /**
   * Add note
   */
  async addNote(userId: string, moduleId: string, sectionId: string, content: string, isPrivate: boolean = true): Promise<ModuleNote> {
    try {
      const note: ModuleNote = {
        id: this.generateId('note'),
        userId,
        moduleId,
        sectionId,
        content,
        isPrivate,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const stored = localStorage.getItem(TRAINING_STORAGE_KEYS.NOTES);
      const notes: ModuleNote[] = stored ? JSON.parse(stored) : [];
      notes.push(note);
      localStorage.setItem(TRAINING_STORAGE_KEYS.NOTES, JSON.stringify(notes));

      return note;
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.addNote',
        userId,
        moduleId,
        sectionId
      });
      throw error;
    }
  }

  /**
   * Update note
   */
  async updateNote(noteId: string, content: string): Promise<ModuleNote> {
    try {
      const stored = localStorage.getItem(TRAINING_STORAGE_KEYS.NOTES);
      const notes: ModuleNote[] = stored ? JSON.parse(stored) : [];
      
      const noteIndex = notes.findIndex(n => n.id === noteId);
      if (noteIndex === -1) {
        throw new Error('Note not found');
      }

      notes[noteIndex].content = content;
      notes[noteIndex].updatedAt = new Date();
      
      localStorage.setItem(TRAINING_STORAGE_KEYS.NOTES, JSON.stringify(notes));
      return notes[noteIndex];
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.updateNote',
        noteId
      });
      throw error;
    }
  }

  /**
   * Delete note
   */
  async deleteNote(noteId: string): Promise<void> {
    try {
      const stored = localStorage.getItem(TRAINING_STORAGE_KEYS.NOTES);
      const notes: ModuleNote[] = stored ? JSON.parse(stored) : [];
      const filtered = notes.filter(n => n.id !== noteId);
      localStorage.setItem(TRAINING_STORAGE_KEYS.NOTES, JSON.stringify(filtered));
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.deleteNote',
        noteId
      });
      throw error;
    }
  }

  /**
   * Track resource download
   */
  async trackResourceDownload(userId: string, resourceId: string): Promise<void> {
    try {
      const key = 'wellness_resource_downloads';
      const stored = localStorage.getItem(key);
      const downloads = stored ? JSON.parse(stored) : [];
      
      downloads.push({
        userId,
        resourceId,
        downloadedAt: new Date()
      });
      
      localStorage.setItem(key, JSON.stringify(downloads));
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.trackResourceDownload',
        userId,
        resourceId
      });
    }
  }

  /**
   * Generate certificate for completed module
   */
  async generateCertificate(userId: string, moduleId: string): Promise<ModuleCertificate> {
    try {
      const module = this.getModuleById(moduleId);
      const progress = this.getModuleProgress(userId, moduleId);
      
      if (!module || !progress || progress.status !== 'completed') {
        throw new Error('Module not completed or not found');
      }

      const certificate: ModuleCertificate = {
        id: this.generateId('cert'),
        userId,
        moduleId,
        certificateNumber: this.generateCertificateNumber(),
        issuedAt: new Date(),
        downloadUrl: `#certificate/${userId}/${moduleId}`,
        metadata: {
          completionTime: progress.timeSpent,
          exercisesCompleted: progress.completedExercises.length,
          totalExercises: module.sections.reduce((total, section) => total + section.exercises.length, 0)
        }
      };

      // Save certificate
      const stored = localStorage.getItem(TRAINING_STORAGE_KEYS.CERTIFICATES);
      const certificates: ModuleCertificate[] = stored ? JSON.parse(stored) : [];
      certificates.push(certificate);
      localStorage.setItem(TRAINING_STORAGE_KEYS.CERTIFICATES, JSON.stringify(certificates));

      return certificate;
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.generateCertificate',
        userId,
        moduleId
      });
      throw error;
    }
  }


  private async saveExerciseSubmission(submission: ExerciseSubmission): Promise<void> {
    try {
      const stored = localStorage.getItem(TRAINING_STORAGE_KEYS.EXERCISE_SUBMISSIONS);
      const submissions: ExerciseSubmission[] = stored ? JSON.parse(stored) : [];
      
      submissions.push(submission);
      localStorage.setItem(TRAINING_STORAGE_KEYS.EXERCISE_SUBMISSIONS, JSON.stringify(submissions));
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingService.saveExerciseSubmission',
        submissionId: submission.id
      });
      throw error;
    }
  }

  private calculateExerciseScore(responses: Record<string, any>): number {
    // Calculate a basic score based on completion and quality of responses
    let score = 0;
    let totalFields = 0;

    for (const [key, value] of Object.entries(responses)) {
      if (key === 'timeSpent' || key === 'completedAt' || key === 'totalWords') continue;
      
      totalFields++;
      
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value === 'string') {
          if (value.trim().length > 0) {
            score += 2; // Any meaningful text response gets full score
          }
        } else if (Array.isArray(value) && value.length > 0) {
          score += 2; // Array responses get full score if not empty
        } else if (typeof value === 'number' && value > 0) {
          score += 2; // Numeric responses get full score
        } else {
          score += 2; // Any other completed response gets full score
        }
      }
    }

    // For reflection exercises, be more generous with scoring
    if (responses.responses && typeof responses.responses === 'object') {
      // This is likely a reflection exercise with nested responses
      const reflectionResponses = responses.responses;
      score = 0;
      totalFields = Object.keys(reflectionResponses).length;
      
      for (const [key, value] of Object.entries(reflectionResponses)) {
        if (typeof value === 'string' && value.trim().length > 0) {
          score += 2; // Full score for any text response
        }
      }
    }

    // Calculate percentage score
    const maxPossibleScore = totalFields * 2;
    return maxPossibleScore > 0 ? Math.min(100, Math.round((score / maxPossibleScore) * 100)) : 100;
  }

  private generateFeedback(responses: Record<string, any>): string {
    const score = this.calculateExerciseScore(responses);
    
    if (score >= 90) {
      return "Excellent work! Your responses show deep reflection and engagement with the material. You're demonstrating strong commitment to your wellness journey.";
    } else if (score >= 70) {
      return "Great job! Your responses show good understanding and effort. Consider adding more detail to deepen your insights.";
    } else if (score >= 50) {
      return "Good start! Your responses show engagement with the exercise. Try to provide more detailed reflections for maximum benefit.";
    } else {
      return "You've completed the exercise! For the most benefit, consider revisiting some sections and providing more detailed responses.";
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCertificateNumber(): string {
    return `WC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private async saveUserProgress(progress: UserModuleProgress): Promise<void> {
    const allProgress = this.loadUserProgress();
    const index = allProgress.findIndex(p => p.id === progress.id);
    
    if (index >= 0) {
      allProgress[index] = progress;
    } else {
      allProgress.push(progress);
    }
    
    localStorage.setItem(TRAINING_STORAGE_KEYS.USER_PROGRESS, JSON.stringify(allProgress));
  }

  private loadUserProgress(): UserModuleProgress[] {
    try {
      const stored = localStorage.getItem(TRAINING_STORAGE_KEYS.USER_PROGRESS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private loadCertificates(): ModuleCertificate[] {
    try {
      const stored = localStorage.getItem(TRAINING_STORAGE_KEYS.CERTIFICATES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getDefaultModules(): TrainingModule[] {
    return [
      {
        id: 'module_1',
        number: 1,
        title: 'Introduction to Wellness Coaching & Holistic Health',
        description: 'Understand the foundations of wellness coaching and the holistic approach to health.',
        estimatedDuration: 60,
        isRequired: true,
        prerequisites: [],
        sections: [
          {
            id: 'section_1_1',
            moduleId: 'module_1',
            number: 1,
            title: 'What is Wellness Coaching?',
            content: [
              {
                id: 'content_1_1_1',
                type: 'text',
                title: 'Introduction to Wellness Coaching',
                content: 'Wellness coaching is a collaborative process that helps individuals achieve their health and wellness goals through guidance, support, and accountability. Unlike traditional medical approaches that focus on treating illness, wellness coaching takes a proactive approach to help people optimize their overall well-being and prevent health issues before they arise.',
                order: 1
              },
              {
                id: 'content_1_1_2',
                type: 'text',
                title: 'Core Principles of Wellness Coaching',
                content: 'Effective wellness coaching is built on several key principles: 1) Client-centered approach - focusing on individual needs and goals, 2) Empowerment - helping clients develop their own solutions and strategies, 3) Accountability - providing structure and support for consistent progress, 4) Evidence-based methods - using proven techniques and strategies, and 5) Sustainable change - focusing on long-term lifestyle modifications rather than quick fixes.',
                order: 2
              },
              {
                id: 'content_1_1_3',
                type: 'text',
                title: 'The Role of a Wellness Coach',
                content: 'A wellness coach serves as a guide, motivator, and accountability partner. They help clients identify their values, set meaningful goals, overcome obstacles, and develop sustainable healthy habits. Coaches do not prescribe specific treatments or provide medical advice, but rather facilitate the client\'s own journey toward better health and well-being.',
                order: 3
              }
            ],
            exercises: [
              {
                id: 'exercise_1_1_1',
                sectionId: 'section_1_1',
                type: 'wellness_wheel',
                title: 'Wellness Wheel Assessment',
                instructions: 'Complete the wellness wheel to assess your current state in different life areas. This will help you identify your strengths and areas for improvement.',
                estimatedDuration: 15,
                isRequired: true,
                config: {
                  categories: ['Physical', 'Mental', 'Emotional', 'Social', 'Spiritual', 'Environmental', 'Occupational', 'Financial']
                },
                order: 1
              }
            ],
            estimatedDuration: 25,
            isRequired: true
          },
          {
            id: 'section_1_2',
            moduleId: 'module_1',
            number: 2,
            title: 'The Holistic Approach to Health',
            content: [
              {
                id: 'content_1_2_1',
                type: 'text',
                title: 'Understanding Holistic Health',
                content: 'Holistic health recognizes that true wellness encompasses more than just physical health. It considers the interconnectedness of mind, body, and spirit, as well as environmental and social factors that influence our overall well-being. This comprehensive approach acknowledges that all aspects of our lives impact our health.',
                order: 1
              },
              {
                id: 'content_1_2_2',
                type: 'text',
                title: 'The Eight Dimensions of Wellness',
                content: 'The holistic model typically includes eight key dimensions: 1) Physical - exercise, nutrition, sleep, 2) Mental - learning, creativity, critical thinking, 3) Emotional - stress management, emotional awareness, 4) Social - relationships, communication, community, 5) Spiritual - purpose, values, meaning, 6) Environmental - surroundings, sustainability, safety, 7) Occupational - career satisfaction, work-life balance, and 8) Financial - budgeting, financial security, money management.',
                order: 2
              },
              {
                id: 'content_1_2_3',
                type: 'text',
                title: 'The Interconnected Nature of Wellness',
                content: 'Each dimension of wellness influences and is influenced by the others. For example, chronic stress (emotional) can lead to physical health problems, social isolation can impact mental health, and financial worries can affect sleep quality. Understanding these connections helps us address wellness challenges more effectively by considering multiple dimensions simultaneously.',
                order: 3
              }
            ],
            exercises: [],
            estimatedDuration: 15,
            isRequired: true
          },
          {
            id: 'section_1_3',
            moduleId: 'module_1',
            number: 3,
            title: 'Getting Started with Self-Coaching',
            content: [
              {
                id: 'content_1_3_1',
                type: 'text',
                title: 'Developing Self-Awareness',
                content: 'Self-coaching begins with honest self-assessment. This involves regularly checking in with yourself, recognizing patterns in your thoughts and behaviors, and understanding your triggers and motivations. Self-awareness is the foundation for all positive change.',
                order: 1
              },
              {
                id: 'content_1_3_2',
                type: 'text',
                title: 'Setting Meaningful Goals',
                content: 'Effective wellness goals are SMART (Specific, Measurable, Achievable, Relevant, Time-bound) and aligned with your values. They should inspire you while being realistic enough to maintain motivation. Start with small, manageable changes that build momentum toward larger transformations.',
                order: 2
              },
              {
                id: 'content_1_3_3',
                type: 'text',
                title: 'Creating Accountability Systems',
                content: 'Accountability is crucial for sustained behavior change. This can include tracking your progress, sharing goals with supportive friends or family, joining wellness groups, or working with a coach. The key is finding systems that provide gentle pressure and encouragement without judgment.',
                order: 3
              }
            ],
            exercises: [
              {
                id: 'exercise_1_3_1',
                sectionId: 'section_1_3',
                type: 'reflection',
                title: 'Personal Wellness Vision',
                instructions: 'Write a personal vision statement describing your ideal state of wellness. Consider all eight dimensions and how they would look in your best life.',
                estimatedDuration: 10,
                isRequired: false,
                config: {
                  questions: [
                    'What does optimal wellness look like for you?',
                    'Which dimensions of wellness are most important to you right now?',
                    'What would change in your daily life if you achieved your wellness vision?'
                  ]
                },
                order: 1
              }
            ],
            estimatedDuration: 20,
            isRequired: true
          }
        ],
        resources: [
          {
            id: 'resource_1_1',
            moduleId: 'module_1',
            title: 'Wellness Wheel Template',
            description: 'A printable template for ongoing wellness assessments',
            type: 'pdf',
            url: '/resources/wellness-wheel-template.pdf',
            downloadable: true
          },
          {
            id: 'resource_1_2',
            moduleId: 'module_1',
            title: 'SMART Goals Worksheet',
            description: 'A guide for setting effective wellness goals',
            type: 'pdf',
            url: '/resources/smart-goals-worksheet.pdf',
            downloadable: true
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'module_2',
        number: 2,
        title: 'Physical Wellness – Movement, Exercise & Sleep',
        description: 'Explore the fundamentals of physical health through movement, exercise, and quality sleep.',
        estimatedDuration: 75,
        isRequired: true,
        prerequisites: ['module_1'],
        sections: [
          {
            id: 'section_2_1',
            moduleId: 'module_2',
            number: 1,
            title: 'The Foundation of Physical Wellness',
            content: [
              {
                id: 'content_2_1_1',
                type: 'text',
                title: 'Understanding Physical Wellness',
                content: 'Physical wellness encompasses more than just exercise. It includes regular physical activity, proper nutrition, adequate sleep, and preventive healthcare. This holistic approach to physical health forms the foundation for overall well-being and supports all other dimensions of wellness.',
                order: 1
              },
              {
                id: 'content_2_1_2',
                type: 'text',
                title: 'The Movement Continuum',
                content: 'Physical activity exists on a continuum from basic daily movements to structured exercise. This includes: 1) Daily activities (walking, climbing stairs, household tasks), 2) Recreational activities (gardening, dancing, playing with children), 3) Structured exercise (planned workouts, sports, fitness classes), and 4) Competitive athletics. Every movement counts toward your physical wellness.',
                order: 2
              },
              {
                id: 'content_2_1_3',
                type: 'text',
                title: 'Benefits of Regular Movement',
                content: 'Regular physical activity provides numerous benefits: improved cardiovascular health, stronger muscles and bones, better mood and mental health, enhanced sleep quality, increased energy levels, better weight management, reduced risk of chronic diseases, improved cognitive function, and greater longevity. These benefits compound over time with consistent activity.',
                order: 3
              }
            ],
            exercises: [
              {
                id: 'exercise_2_1_1',
                sectionId: 'section_2_1',
                type: 'movement_tracker',
                title: 'Daily Movement Assessment',
                instructions: 'Track your current movement patterns to establish a baseline for improvement.',
                estimatedDuration: 10,
                isRequired: true,
                config: {
                  trackingPeriod: 7,
                  categories: ['Walking', 'Stairs', 'Exercise', 'Sports', 'Household', 'Other']
                },
                order: 1
              }
            ],
            estimatedDuration: 25,
            isRequired: true
          },
          {
            id: 'section_2_2',
            moduleId: 'module_2',
            number: 2,
            title: 'Creating Your Movement Practice',
            content: [
              {
                id: 'content_2_2_1',
                type: 'text',
                title: 'Finding Activities You Enjoy',
                content: 'The best exercise is the one you\'ll actually do consistently. Explore different types of physical activities to find what you enjoy: walking, swimming, cycling, dancing, yoga, strength training, team sports, martial arts, or outdoor activities. Consider your personality, schedule, and physical capabilities when choosing activities.',
                order: 1
              },
              {
                id: 'content_2_2_2',
                type: 'text',
                title: 'The FITT Principle',
                content: 'Use the FITT principle to structure your exercise routine: Frequency (how often), Intensity (how hard), Time (how long), and Type (what kind). For general health, aim for 150 minutes of moderate-intensity or 75 minutes of vigorous-intensity aerobic activity per week, plus muscle-strengthening activities twice per week.',
                order: 2
              },
              {
                id: 'content_2_2_3',
                type: 'text',
                title: 'Starting Small and Building Habits',
                content: 'Begin with small, manageable changes that you can sustain. This might mean a 10-minute walk after dinner, taking the stairs instead of the elevator, or doing 5 minutes of stretching in the morning. Focus on consistency over intensity initially, then gradually increase duration and intensity as habits form.',
                order: 3
              }
            ],
            exercises: [
              {
                id: 'exercise_2_2_1',
                sectionId: 'section_2_2',
                type: 'movement_challenge',
                title: '7-Day Mini Movement Challenge',
                instructions: 'Complete a simple daily movement challenge to build momentum and explore different activities.',
                estimatedDuration: 15,
                isRequired: true,
                config: {
                  duration: 7,
                  challenges: [
                    'Take a 10-minute walk',
                    'Do 10 bodyweight squats',
                    'Stretch for 5 minutes',
                    'Take the stairs whenever possible',
                    'Dance to 3 songs',
                    'Do wall push-ups for 2 minutes',
                    'Practice balance on one foot for 1 minute each'
                  ]
                },
                order: 1
              }
            ],
            estimatedDuration: 30,
            isRequired: true
          },
          {
            id: 'section_2_3',
            moduleId: 'module_2',
            number: 3,
            title: 'The Importance of Quality Sleep',
            content: [
              {
                id: 'content_2_3_1',
                type: 'text',
                title: 'Why Sleep Matters',
                content: 'Quality sleep is essential for physical recovery, immune function, mental health, and cognitive performance. During sleep, your body repairs tissues, consolidates memories, releases important hormones, and clears waste from the brain. Poor sleep affects every aspect of health and well-being.',
                order: 1
              },
              {
                id: 'content_2_3_2',
                type: 'text',
                title: 'Sleep Architecture and Cycles',
                content: 'Sleep occurs in cycles of approximately 90 minutes, progressing through different stages: light sleep, deep sleep, and REM sleep. Each stage serves different functions. Most adults need 7-9 hours of sleep per night to complete enough cycles for optimal restoration and recovery.',
                order: 2
              },
              {
                id: 'content_2_3_3',
                type: 'text',
                title: 'Creating Good Sleep Hygiene',
                content: 'Sleep hygiene includes practices that promote good sleep: maintaining a consistent sleep schedule, creating a comfortable sleep environment (cool, dark, quiet), avoiding screens before bedtime, limiting caffeine and alcohol, establishing a relaxing bedtime routine, and getting natural light exposure during the day.',
                order: 3
              }
            ],
            exercises: [
              {
                id: 'exercise_2_3_1',
                sectionId: 'section_2_3',
                type: 'sleep_audit',
                title: 'Personal Sleep Quality Audit',
                instructions: 'Assess your current sleep patterns and identify areas for improvement.',
                estimatedDuration: 15,
                isRequired: true,
                config: {
                  categories: [
                    'Sleep Schedule',
                    'Sleep Environment',
                    'Bedtime Routine',
                    'Daytime Habits',
                    'Sleep Quality',
                    'Energy Levels'
                  ]
                },
                order: 1
              }
            ],
            estimatedDuration: 20,
            isRequired: true
          }
        ],
        resources: [
          {
            id: 'resource_2_1',
            moduleId: 'module_2',
            title: 'Movement Tracking Sheet',
            description: 'A weekly log for tracking different types of physical activity',
            type: 'pdf',
            url: '/resources/movement-tracking-sheet.pdf',
            downloadable: true
          },
          {
            id: 'resource_2_2',
            moduleId: 'module_2',
            title: 'Exercise Safety Guidelines',
            description: 'Essential safety tips for starting a new exercise routine',
            type: 'pdf',
            url: '/resources/exercise-safety-guidelines.pdf',
            downloadable: true
          },
          {
            id: 'resource_2_3',
            moduleId: 'module_2',
            title: 'Sleep Hygiene Checklist',
            description: 'A comprehensive guide to improving sleep quality',
            type: 'pdf',
            url: '/resources/sleep-hygiene-checklist.pdf',
            downloadable: true
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'module_3',
        number: 3,
        title: 'Nutrition & Healthy Eating Habits',
        description: 'Learn the fundamentals of nutrition and develop sustainable healthy eating habits.',
        estimatedDuration: 80,
        isRequired: true,
        prerequisites: ['module_2'],
        sections: [
          {
            id: 'section_3_1',
            moduleId: 'module_3',
            number: 1,
            title: 'Nutrition Fundamentals',
            content: [
              {
                id: 'content_3_1_1',
                type: 'text',
                title: 'Understanding Macronutrients',
                content: 'Macronutrients are the main nutrients your body needs in large amounts: carbohydrates, proteins, and fats. Carbohydrates provide energy for daily activities and brain function. Proteins build and repair tissues, support immune function, and maintain muscle mass. Fats are essential for hormone production, nutrient absorption, and brain health. A balanced diet includes all three macronutrients in appropriate proportions.',
                order: 1
              },
              {
                id: 'content_3_1_2',
                type: 'text',
                title: 'Micronutrients and Their Importance',
                content: 'Micronutrients include vitamins and minerals that are needed in smaller amounts but are crucial for optimal health. Vitamins support energy production, immune function, and wound healing. Minerals like calcium, iron, and zinc support bone health, oxygen transport, and immune function. A varied diet with plenty of fruits, vegetables, whole grains, and lean proteins typically provides adequate micronutrients.',
                order: 2
              },
              {
                id: 'content_3_1_3',
                type: 'text',
                title: 'Hydration and Its Role in Health',
                content: 'Water makes up about 60% of your body weight and is essential for virtually every bodily function. Proper hydration supports temperature regulation, joint lubrication, nutrient transport, and waste elimination. Most adults need about 8 glasses of water daily, but individual needs vary based on activity level, climate, and overall health. Signs of good hydration include pale yellow urine and consistent energy levels.',
                order: 3
              }
            ],
            exercises: [
              {
                id: 'exercise_3_1_1',
                sectionId: 'section_3_1',
                type: 'mindful_eating_timer',
                title: 'Mindful Eating Practice',
                instructions: 'Practice mindful eating with a meal or snack. Focus on the taste, texture, and experience of eating without distractions.',
                estimatedDuration: 20,
                isRequired: true,
                config: {
                  duration: 20,
                  prompts: [
                    'Take three deep breaths before eating',
                    'Notice the colors, smells, and textures',
                    'Chew slowly and thoroughly',
                    'Put your utensils down between bites',
                    'Notice hunger and fullness cues'
                  ]
                },
                order: 1
              }
            ],
            estimatedDuration: 30,
            isRequired: true
          },
          {
            id: 'section_3_2',
            moduleId: 'module_3',
            number: 2,
            title: 'Building Healthy Eating Patterns',
            content: [
              {
                id: 'content_3_2_1',
                type: 'text',
                title: 'The Plate Method for Balanced Meals',
                content: 'The plate method is a simple visual guide for creating balanced meals. Fill half your plate with non-starchy vegetables (leafy greens, broccoli, peppers), one quarter with lean protein (chicken, fish, beans, tofu), and one quarter with healthy carbohydrates (whole grains, sweet potatoes). Add a serving of healthy fats (avocado, nuts, olive oil) and a piece of fruit or dairy for a complete meal.',
                order: 1
              },
              {
                id: 'content_3_2_2',
                type: 'text',
                title: 'Meal Planning and Preparation',
                content: 'Meal planning involves deciding what to eat ahead of time, which helps ensure nutritious choices and reduces food waste. Start by planning 3-4 meals and snacks, create a shopping list, and consider batch cooking grains, proteins, and vegetables. Meal prep can include washing and chopping vegetables, cooking grains in bulk, or preparing complete meals to reheat later. This strategy saves time and supports consistent healthy eating.',
                order: 2
              },
              {
                id: 'content_3_2_3',
                type: 'text',
                title: 'Reading Food Labels and Making Smart Choices',
                content: 'Food labels provide important information about nutritional content. Focus on the ingredient list (ingredients are listed by weight, with the most prominent first) and the nutrition facts panel. Look for foods with minimal added sugars, moderate sodium levels, and adequate fiber and protein. Choose whole foods when possible, and when buying packaged foods, select options with recognizable, whole food ingredients.',
                order: 3
              }
            ],
            exercises: [
              {
                id: 'exercise_3_2_1',
                sectionId: 'section_3_2',
                type: 'meal_planning',
                title: 'Weekly Meal Planning Exercise',
                instructions: 'Plan your meals for the upcoming week using the plate method and create a shopping list.',
                estimatedDuration: 25,
                isRequired: true,
                config: {
                  days: 7,
                  mealsPerDay: 3,
                  includeSnacks: true,
                  plateMethodRequired: true
                },
                order: 1
              }
            ],
            estimatedDuration: 35,
            isRequired: true
          },
          {
            id: 'section_3_3',
            moduleId: 'module_3',
            number: 3,
            title: 'Overcoming Common Nutrition Challenges',
            content: [
              {
                id: 'content_3_3_1',
                type: 'text',
                title: 'Managing Emotional Eating',
                content: 'Emotional eating involves using food to cope with feelings rather than physical hunger. Common triggers include stress, boredom, loneliness, or celebration. To manage emotional eating, practice identifying true hunger versus emotional triggers, develop alternative coping strategies (like calling a friend, taking a walk, or practicing deep breathing), and create an environment that supports healthy choices by keeping nutritious foods readily available.',
                order: 1
              },
              {
                id: 'content_3_3_2',
                type: 'text',
                title: 'Eating Out and Social Situations',
                content: 'Maintaining healthy eating habits while dining out or in social situations requires planning and flexibility. Review menus ahead of time, look for grilled, baked, or steamed options, ask for dressings and sauces on the side, and consider sharing large portions. Focus on enjoying the social aspect of meals rather than just the food, and remember that one meal won\'t derail your overall health goals.',
                order: 2
              },
              {
                id: 'content_3_3_3',
                type: 'text',
                title: 'Building a Sustainable Relationship with Food',
                content: 'A healthy relationship with food involves viewing food as nourishment while also allowing for enjoyment and flexibility. Avoid labeling foods as "good" or "bad," practice moderation rather than restriction, and listen to your body\'s hunger and fullness cues. Focus on how foods make you feel rather than strict rules, and remember that perfect eating doesn\'t exist – aim for consistent, nourishing choices most of the time.',
                order: 3
              }
            ],
            exercises: [],
            estimatedDuration: 15,
            isRequired: true
          }
        ],
        resources: [
          {
            id: 'resource_3_1',
            moduleId: 'module_3',
            title: 'Balanced Meal Planning Template',
            description: 'A weekly meal planning template using the plate method',
            type: 'pdf',
            url: '/resources/meal-planning-template.pdf',
            downloadable: true
          },
          {
            id: 'resource_3_2',
            moduleId: 'module_3',
            title: 'Healthy Recipe Collection',
            description: 'A collection of simple, nutritious recipes for beginners',
            type: 'pdf',
            url: '/resources/healthy-recipes.pdf',
            downloadable: true
          },
          {
            id: 'resource_3_3',
            moduleId: 'module_3',
            title: 'Food Label Reading Guide',
            description: 'A guide to understanding and interpreting food labels',
            type: 'pdf',
            url: '/resources/food-label-guide.pdf',
            downloadable: true
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'module_4',
        number: 4,
        title: 'Mental & Emotional Well-Being',
        description: 'Develop emotional intelligence, mental resilience, and healthy coping strategies for optimal psychological wellness.',
        estimatedDuration: 85,
        isRequired: true,
        prerequisites: ['module_3'],
        sections: [
          {
            id: 'section_4_1',
            moduleId: 'module_4',
            number: 1,
            title: 'Understanding Emotions and Mental Health',
            content: [
              {
                id: 'content_4_1_1',
                type: 'text',
                title: 'What is Mental Health?',
                content: 'Mental health encompasses our emotional, psychological, and social well-being. It affects how we think, feel, and act, influencing how we handle stress, relate to others, and make choices. Good mental health is more than the absence of mental illness—it includes the ability to cope with life\'s challenges, work productively, maintain relationships, and contribute to your community. Mental health exists on a continuum and can change throughout your life.',
                order: 1
              },
              {
                id: 'content_4_1_2',
                type: 'text',
                title: 'The Role of Emotions in Daily Life',
                content: 'Emotions are natural responses to our experiences and serve important functions. They provide information about our environment, motivate behavior, and help us communicate with others. All emotions—including difficult ones like sadness, anger, or fear—have value and purpose. The goal isn\'t to eliminate negative emotions but to develop emotional awareness, understand their messages, and respond to them in healthy ways.',
                order: 2
              },
              {
                id: 'content_4_1_3',
                type: 'text',
                title: 'Building Emotional Intelligence',
                content: 'Emotional intelligence (EI) is the ability to recognize, understand, and manage our own emotions while effectively recognizing and responding to others\' emotions. EI includes four key components: self-awareness (recognizing your emotions), self-management (regulating emotions), social awareness (understanding others\' emotions), and relationship management (handling relationships skillfully). Developing EI improves communication, reduces conflict, and enhances overall well-being.',
                order: 3
              }
            ],
            exercises: [
              {
                id: 'exercise_4_1_1',
                sectionId: 'section_4_1',
                type: 'mood_tracking',
                title: 'Daily Mood and Emotion Tracker',
                instructions: 'Track your emotions and moods for a week to develop emotional awareness and identify patterns.',
                estimatedDuration: 15,
                isRequired: true,
                config: {
                  trackingDays: 7,
                  emotions: ['Happy', 'Sad', 'Angry', 'Anxious', 'Excited', 'Frustrated', 'Calm', 'Overwhelmed'],
                  intensityScale: 10,
                  includesTriggers: true,
                  includesReflection: true
                },
                order: 1
              }
            ],
            estimatedDuration: 30,
            isRequired: true
          },
          {
            id: 'section_4_2',
            moduleId: 'module_4',
            number: 2,
            title: 'Developing Healthy Coping Strategies',
            content: [
              {
                id: 'content_4_2_1',
                type: 'text',
                title: 'Understanding Stress and Its Impact',
                content: 'Stress is a natural response to challenging or threatening situations. While some stress can be motivating (eustress), chronic stress can negatively impact physical and mental health. Common signs include fatigue, irritability, difficulty concentrating, changes in appetite or sleep, and physical symptoms like headaches or muscle tension. Understanding your stress signals is the first step in developing effective coping strategies.',
                order: 1
              },
              {
                id: 'content_4_2_2',
                type: 'text',
                title: 'Healthy vs. Unhealthy Coping Mechanisms',
                content: 'Coping mechanisms are strategies we use to deal with stress and difficult emotions. Healthy coping strategies (like exercise, talking to friends, problem-solving, relaxation techniques) help us process emotions and build resilience. Unhealthy coping mechanisms (like substance abuse, emotional eating, isolation, or aggression) may provide temporary relief but often create additional problems and don\'t address underlying issues.',
                order: 2
              },
              {
                id: 'content_4_2_3',
                type: 'text',
                title: 'Building Your Coping Toolkit',
                content: 'Effective coping requires having multiple strategies for different situations. Your toolkit might include immediate calming techniques (deep breathing, progressive muscle relaxation), physical outlets (exercise, walking), creative expression (journaling, art, music), social support (talking to friends, joining groups), and professional resources (therapy, counseling). The key is practicing these techniques regularly so they\'re available when you need them most.',
                order: 3
              }
            ],
            exercises: [
              {
                id: 'exercise_4_2_1',
                sectionId: 'section_4_2',
                type: 'mindset_reframing',
                title: 'Cognitive Reframing Exercise',
                instructions: 'Practice identifying and reframing negative thought patterns to develop more balanced thinking.',
                estimatedDuration: 20,
                isRequired: true,
                config: {
                  scenarios: [
                    'Work deadline causing stress',
                    'Conflict with a friend',
                    'Making a mistake on an important task',
                    'Facing rejection or disappointment',
                    'Dealing with unexpected changes'
                  ],
                  reframingTechniques: ['Evidence examination', 'Alternative perspectives', 'Worst/best/most likely outcomes', 'Learning opportunities']
                },
                order: 1
              }
            ],
            estimatedDuration: 35,
            isRequired: true
          },
          {
            id: 'section_4_3',
            moduleId: 'module_4',
            number: 3,
            title: 'Building Resilience and Mental Strength',
            content: [
              {
                id: 'content_4_3_1',
                type: 'text',
                title: 'What is Resilience?',
                content: 'Resilience is the ability to adapt and bounce back from adversity, trauma, tragedy, threats, or significant sources of stress. It\'s not about avoiding difficulties but developing the skills to navigate them effectively. Resilient people don\'t experience less stress or avoid emotional pain—they\'ve learned to process these experiences in ways that promote growth and recovery. Resilience can be developed through practice and intentional skill-building.',
                order: 1
              },
              {
                id: 'content_4_3_2',
                type: 'text',
                title: 'Key Components of Mental Resilience',
                content: 'Resilience includes several key elements: emotional regulation (managing intense emotions), realistic optimism (maintaining hope while acknowledging challenges), cognitive flexibility (adapting thinking to new situations), social connection (maintaining supportive relationships), self-efficacy (confidence in your ability to handle challenges), and meaning-making (finding purpose in difficult experiences). These skills work together to build overall mental strength.',
                order: 2
              },
              {
                id: 'content_4_3_3',
                type: 'text',
                title: 'Practical Resilience-Building Strategies',
                content: 'Building resilience involves daily practices: developing a growth mindset (viewing challenges as opportunities to learn), practicing gratitude (focusing on positive aspects of life), building strong relationships (investing in supportive connections), taking care of physical health (exercise, sleep, nutrition), setting realistic goals (breaking large challenges into manageable steps), and learning from setbacks (reflecting on what went well and what could be improved).',
                order: 3
              }
            ],
            exercises: [
              {
                id: 'exercise_4_3_1',
                sectionId: 'section_4_3',
                type: 'resilience_mapping',
                title: 'Personal Resilience Assessment',
                instructions: 'Assess your current resilience strengths and create a plan for building mental resilience.',
                estimatedDuration: 25,
                isRequired: true,
                config: {
                  resilienceAreas: [
                    'Emotional Regulation',
                    'Social Support',
                    'Problem-Solving',
                    'Adaptability',
                    'Self-Care',
                    'Optimism',
                    'Self-Efficacy',
                    'Meaning & Purpose'
                  ],
                  includesActionPlan: true,
                  includesGoalSetting: true
                },
                order: 1
              }
            ],
            estimatedDuration: 20,
            isRequired: true
          }
        ],
        resources: [
          {
            id: 'resource_4_1',
            moduleId: 'module_4',
            title: 'Emotion Tracking Journal',
            description: 'A daily journal template for tracking emotions and identifying patterns',
            type: 'pdf',
            url: '/resources/emotion-tracking-journal.pdf',
            downloadable: true
          },
          {
            id: 'resource_4_2',
            moduleId: 'module_4',
            title: 'Healthy Coping Strategies Guide',
            description: 'A comprehensive list of healthy coping mechanisms and when to use them',
            type: 'pdf',
            url: '/resources/coping-strategies-guide.pdf',
            downloadable: true
          },
          {
            id: 'resource_4_3',
            moduleId: 'module_4',
            title: 'Resilience Building Workbook',
            description: 'Exercises and activities to build mental resilience and emotional strength',
            type: 'pdf',
            url: '/resources/resilience-workbook.pdf',
            downloadable: true
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'module_5',
        number: 5,
        title: 'Stress Management & Mindfulness',
        description: 'Learn effective stress management techniques and develop mindfulness practices for better mental clarity and emotional balance.',
        estimatedDuration: 90,
        isRequired: true,
        prerequisites: ['module_4'],
        sections: [
          {
            id: 'section_5_1',
            moduleId: 'module_5',
            number: 1,
            title: 'Understanding Stress and Its Impact',
            content: [
              {
                id: 'content_5_1_1',
                type: 'text',
                title: 'What is Stress?',
                content: 'Stress is your body\'s natural response to challenges, threats, or demands. It\'s a survival mechanism that can be helpful in short bursts but becomes problematic when chronic. Stress triggers the release of hormones like cortisol and adrenaline, affecting your physical, mental, and emotional state. Understanding the difference between acute stress (short-term) and chronic stress (long-term) is crucial for effective management.',
                order: 1
              },
              {
                id: 'content_5_1_2',
                type: 'text',
                title: 'The Physical and Mental Effects of Stress',
                content: 'Chronic stress affects every system in your body. Physical effects include headaches, muscle tension, fatigue, digestive issues, and weakened immune function. Mental effects include difficulty concentrating, memory problems, and decision-making challenges. Emotional effects include anxiety, irritability, depression, and mood swings. Behavioral effects can include changes in appetite, sleep patterns, and social withdrawal.',
                order: 2
              },
              {
                id: 'content_5_1_3',
                type: 'text',
                title: 'Common Sources of Stress',
                content: 'Stressors can be external (work demands, relationship conflicts, financial pressures, major life changes) or internal (perfectionism, negative self-talk, unrealistic expectations). Daily hassles like traffic, technology problems, or time pressures can accumulate. Major life events such as moving, job changes, or loss also create significant stress. Identifying your personal stress triggers is the first step in managing them effectively.',
                order: 3
              }
            ],
            exercises: [
              {
                id: 'exercise_5_1_1',
                sectionId: 'section_5_1',
                type: 'stress_inventory',
                title: 'Personal Stress Assessment',
                instructions: 'Identify and assess your personal stress levels, triggers, and symptoms to develop a personalized stress management plan.',
                estimatedDuration: 20,
                isRequired: true,
                config: {
                  stressAreas: [
                    'Work/Career',
                    'Relationships',
                    'Finances',
                    'Health',
                    'Family',
                    'Social',
                    'Environment',
                    'Technology'
                  ],
                  symptoms: [
                    'Physical (headaches, tension, fatigue)',
                    'Emotional (anxiety, irritability, sadness)',
                    'Mental (concentration, memory, decision-making)',
                    'Behavioral (sleep, appetite, social withdrawal)'
                  ],
                  includesActionPlan: true
                },
                order: 1
              }
            ],
            estimatedDuration: 35,
            isRequired: true
          },
          {
            id: 'section_5_2',
            moduleId: 'module_5',
            number: 2,
            title: 'Breathing Techniques and Relaxation',
            content: [
              {
                id: 'content_5_2_1',
                type: 'text',
                title: 'The Power of Breathing',
                content: 'Breathing is the only part of your autonomic nervous system you can consciously control, making it a powerful tool for stress management. Deep, intentional breathing activates the parasympathetic nervous system, triggering the body\'s relaxation response. This reduces heart rate, lowers blood pressure, and decreases stress hormones while promoting feelings of calm and clarity.',
                order: 1
              },
              {
                id: 'content_5_2_2',
                type: 'text',
                title: 'Fundamental Breathing Techniques',
                content: 'Diaphragmatic breathing (belly breathing) is the foundation of stress relief. The 4-7-8 technique (inhale for 4, hold for 7, exhale for 8) is excellent for anxiety. Box breathing (4-4-4-4 pattern) helps with focus and calm. Coherent breathing (5 seconds in, 5 seconds out) balances the nervous system. Each technique serves different purposes and can be used in various situations throughout your day.',
                order: 2
              },
              {
                id: 'content_5_2_3',
                type: 'text',
                title: 'Progressive Muscle Relaxation',
                content: 'Progressive muscle relaxation (PMR) involves systematically tensing and then relaxing different muscle groups throughout your body. This technique helps you recognize the difference between tension and relaxation, making it easier to release physical stress. PMR can reduce muscle tension, improve sleep quality, and lower overall stress levels. It\'s particularly effective when combined with breathing exercises.',
                order: 3
              }
            ],
            exercises: [
              {
                id: 'exercise_5_2_1',
                sectionId: 'section_5_2',
                type: 'breathing_exercise',
                title: 'Guided Breathing Practice',
                instructions: 'Practice different breathing techniques with guided timers and learn to use breath as a stress management tool.',
                estimatedDuration: 15,
                isRequired: true,
                config: {
                  techniques: [
                    {
                      name: '4-7-8 Breathing',
                      description: 'Calming technique for anxiety relief',
                      pattern: { inhale: 4, hold: 7, exhale: 8 },
                      cycles: 4
                    },
                    {
                      name: 'Box Breathing',
                      description: 'Balancing technique for focus',
                      pattern: { inhale: 4, hold: 4, exhale: 4, pause: 4 },
                      cycles: 6
                    },
                    {
                      name: 'Coherent Breathing',
                      description: 'Rhythmic breathing for balance',
                      pattern: { inhale: 5, exhale: 5 },
                      cycles: 10
                    }
                  ],
                  includesTimer: true,
                  includesVisualGuide: true
                },
                order: 1
              }
            ],
            estimatedDuration: 30,
            isRequired: true
          },
          {
            id: 'section_5_3',
            moduleId: 'module_5',
            number: 3,
            title: 'Introduction to Mindfulness',
            content: [
              {
                id: 'content_5_3_1',
                type: 'text',
                title: 'What is Mindfulness?',
                content: 'Mindfulness is the practice of paying attention to the present moment without judgment. It involves observing your thoughts, feelings, and sensations as they arise, without getting caught up in them or trying to change them. Research shows mindfulness reduces stress, improves focus, enhances emotional regulation, and promotes overall well-being. It\'s a skill that can be developed through regular practice.',
                order: 1
              },
              {
                id: 'content_5_3_2',
                type: 'text',
                title: 'Basic Mindfulness Practices',
                content: 'Mindfulness can be practiced formally through meditation or informally throughout daily activities. Formal practices include breath awareness, body scans, and walking meditation. Informal practices involve bringing mindful attention to routine activities like eating, washing dishes, or walking. Starting with just 5-10 minutes daily can create meaningful benefits. Consistency is more important than duration when beginning.',
                order: 2
              },
              {
                id: 'content_5_3_3',
                type: 'text',
                title: 'Mindfulness for Stress Reduction',
                content: 'Mindfulness interrupts the stress cycle by creating space between stressful events and your reactions. It helps you observe stress patterns without being overwhelmed by them. Regular practice strengthens your ability to respond rather than react to stressful situations. Mindfulness also improves your relationship with difficult thoughts and emotions, reducing their power to create stress and anxiety.',
                order: 3
              }
            ],
            exercises: [
              {
                id: 'exercise_5_3_1',
                sectionId: 'section_5_3',
                type: 'guided_meditation',
                title: 'Mindfulness Meditation Practice',
                instructions: 'Experience guided mindfulness meditation sessions to develop present-moment awareness and stress reduction skills.',
                estimatedDuration: 25,
                isRequired: true,
                config: {
                  sessions: [
                    {
                      name: 'Breath Awareness',
                      duration: 10,
                      description: 'Focus on natural breathing patterns',
                      guidance: 'Basic mindfulness of breath'
                    },
                    {
                      name: 'Body Scan',
                      duration: 15,
                      description: 'Mindful awareness of body sensations',
                      guidance: 'Progressive body awareness'
                    },
                    {
                      name: 'Loving Kindness',
                      duration: 12,
                      description: 'Cultivate compassion and kindness',
                      guidance: 'Heart-centered meditation'
                    }
                  ],
                  includesTimer: true,
                  includesBackgroundSounds: true,
                  includesProgress: true
                },
                order: 1
              }
            ],
            estimatedDuration: 25,
            isRequired: true
          }
        ],
        resources: [
          {
            id: 'resource_5_1',
            moduleId: 'module_5',
            title: 'Stress Assessment Worksheet',
            description: 'Comprehensive tool for identifying personal stress patterns and triggers',
            type: 'pdf',
            url: '/resources/stress-assessment-worksheet.pdf',
            downloadable: true
          },
          {
            id: 'resource_5_2',
            moduleId: 'module_5',
            title: 'Breathing Techniques Quick Reference',
            description: 'Pocket guide to breathing exercises for different situations',
            type: 'pdf',
            url: '/resources/breathing-techniques-guide.pdf',
            downloadable: true
          },
          {
            id: 'resource_5_3',
            moduleId: 'module_5',
            title: 'Daily Mindfulness Practices',
            description: 'Simple mindfulness exercises for everyday stress management',
            type: 'pdf',
            url: '/resources/daily-mindfulness-practices.pdf',
            downloadable: true
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Module 6: Healthy Habits & Behavior Change
      {
        id: 'module_6',
        number: 6,
        title: 'Healthy Habits & Behavior Change',
        description: 'Understand the science of habit formation and develop strategies for lasting behavior change.',
        estimatedDuration: 90,
        isRequired: true,
        prerequisites: ['module_5'],
        sections: [
          {
            id: 'section_6_1',
            moduleId: 'module_6',
            number: 1,
            title: 'The Science of Habit Formation',
            content: [
              {
                id: 'content_6_1_1',
                type: 'text',
                title: 'Understanding the Habit Loop',
                content: 'Habits follow a three-part neurological loop: cue, routine, and reward. The cue triggers your brain to automatically perform a behavior, the routine is the behavior itself, and the reward helps your brain remember the pattern for the future. Understanding this loop is key to changing habits. For example, stress (cue) might lead to snacking (routine) which provides temporary comfort (reward). To change habits, you need to identify and modify these components.',
                order: 1
              },
              {
                id: 'content_6_1_2',
                type: 'text',
                title: 'The Role of Environment in Habit Formation',
                content: 'Your environment significantly influences your habits. Environmental cues can trigger automatic behaviors without conscious thought. To build good habits, design your environment to make healthy choices easier and unhealthy choices harder. For example, keep healthy snacks visible and junk food out of sight, lay out workout clothes the night before, or remove apps from your phone that waste time. Small environmental changes can lead to significant behavioral shifts.',
                order: 2
              },
              {
                id: 'content_6_1_3',
                type: 'text',
                title: 'Why Willpower Isn\'t Enough',
                content: 'Willpower is limited and unreliable for long-term behavior change. It depletes throughout the day and is weaker when you\'re tired, stressed, or hungry. Instead of relying on willpower, focus on creating systems and environments that support your desired behaviors. Use habit stacking (adding new habits to existing ones), start with tiny habits, and leverage social accountability. The goal is to make good choices automatic rather than effortful.',
                order: 3
              }
            ],
            exercises: [
              {
                id: 'exercise_6_1_1',
                sectionId: 'section_6_1',
                type: 'habit_loop_analyzer',
                title: 'Habit Loop Analysis',
                instructions: 'Identify and analyze the habit loops of one positive and one negative habit in your life.',
                estimatedDuration: 20,
                isRequired: true,
                config: {
                  habitCount: 2,
                  includesActionPlan: true,
                  categories: ['health', 'productivity', 'relationships', 'self-care', 'other']
                },
                order: 1
              }
            ],
            estimatedDuration: 25,
            isRequired: true
          },
          {
            id: 'section_6_2',
            moduleId: 'module_6',
            number: 2,
            title: 'Strategies for Building New Habits',
            content: [
              {
                id: 'content_6_2_1',
                type: 'text',
                title: 'The 2-Minute Rule and Habit Stacking',
                content: 'The 2-minute rule states that new habits should take less than two minutes to complete. This makes them easy to start and builds momentum. For example, "read for 30 minutes" becomes "read one page" or "do yoga for an hour" becomes "put on workout clothes." Habit stacking links new habits to existing ones: "After I pour my morning coffee, I will write three things I\'m grateful for." This leverages existing neural pathways to build new behaviors.',
                order: 1
              },
              {
                id: 'content_6_2_2',
                type: 'text',
                title: 'Creating Implementation Intentions',
                content: 'Implementation intentions are if-then plans that specify when and where you\'ll perform a habit. Research shows they increase the likelihood of following through by 200-300%. Instead of saying "I will exercise more," say "If it\'s 7 AM on Monday, Wednesday, or Friday, then I will go to the gym for 30 minutes." This removes decision-making in the moment and creates automatic behavioral triggers.',
                order: 2
              },
              {
                id: 'content_6_2_3',
                type: 'text',
                title: 'Tracking Progress and Building Momentum',
                content: 'Habit tracking provides visual evidence of progress and creates a satisfying sense of completion. Use simple methods like marking an X on a calendar or using a habit tracking app. Focus on consistency over perfection—aim for showing up every day rather than perfect execution. If you miss a day, get back on track immediately rather than giving up. Small wins build confidence and motivation for continued progress.',
                order: 3
              }
            ],
            exercises: [
              {
                id: 'exercise_6_2_1',
                sectionId: 'section_6_2',
                type: 'habit_tracker',
                title: 'Habit Tracking Setup',
                instructions: 'Set up a habit tracking system for 3-5 new habits you want to build.',
                estimatedDuration: 25,
                isRequired: true,
                config: {
                  maxHabits: 5,
                  trackingPeriod: 30,
                  includesReminders: true,
                  categories: ['health', 'fitness', 'nutrition', 'mindfulness', 'productivity', 'relationships']
                },
                order: 1
              }
            ],
            estimatedDuration: 30,
            isRequired: true
          },
          {
            id: 'section_6_3',
            moduleId: 'module_6',
            number: 3,
            title: 'Breaking Bad Habits and Overcoming Obstacles',
            content: [
              {
                id: 'content_6_3_1',
                type: 'text',
                title: 'Identifying and Replacing Bad Habits',
                content: 'Breaking bad habits is harder than building new ones because the neural pathways are already established. Focus on replacement rather than elimination—substitute the routine while keeping the same cue and reward. For example, if you stress-eat (cue: stress, routine: eating, reward: comfort), try stress-walking or calling a friend instead. Make the bad habit harder to do by adding friction, and make the replacement habit easier by removing barriers.',
                order: 1
              },
              {
                id: 'content_6_3_2',
                type: 'text',
                title: 'Common Obstacles and How to Overcome Them',
                content: 'Common obstacles include lack of time, motivation dips, social pressure, and perfectionism. Overcome these by starting small (you always have 2 minutes), preparing for motivation dips with systems, finding supportive communities, and embracing "good enough" progress. Plan for setbacks—they\'re normal and expected. Have a reset plan ready: acknowledge the slip, understand why it happened, and immediately return to your habit without self-judgment.',
                order: 2
              },
              {
                id: 'content_6_3_3',
                type: 'text',
                title: 'The Power of Identity-Based Habits',
                content: 'The most effective way to change habits is to focus on who you want to become rather than what you want to achieve. Instead of "I want to run a marathon," think "I am a runner." Each time you perform a habit, you cast a vote for that identity. Start with small wins that reinforce your desired identity. Ask "What would a healthy person do?" or "What would an organized person do?" and then do that thing, even in small ways.',
                order: 3
              }
            ],
            exercises: [
              {
                id: 'exercise_6_3_1',
                sectionId: 'section_6_3',
                type: 'if_then_planning',
                title: 'If-Then Implementation Planning',
                instructions: 'Create specific if-then plans for your new habits and potential obstacles.',
                estimatedDuration: 20,
                isRequired: true,
                config: {
                  maxPlans: 10,
                  includesObstacles: true,
                  categories: ['habit_triggers', 'obstacle_responses', 'recovery_plans']
                },
                order: 1
              }
            ],
            estimatedDuration: 25,
            isRequired: true
          }
        ],
        resources: [
          {
            id: 'resource_6_1',
            moduleId: 'module_6',
            type: 'article',
            title: 'The Science of Habit Formation',
            description: 'Research-backed insights into how habits work and how to change them',
            url: '#',
            downloadable: false
          },
          {
            id: 'resource_6_2',
            moduleId: 'module_6',
            type: 'worksheet',
            title: 'Habit Loop Worksheet',
            description: 'Template for analyzing your current habits and planning new ones',
            url: '#',
            downloadable: true
          },
          {
            id: 'resource_6_3',
            moduleId: 'module_6',
            type: 'video',
            title: 'Building Atomic Habits',
            description: 'Video guide to implementing small changes for big results',
            url: '#',
            downloadable: false
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Module 7: Self-Coaching & Long-Term Motivation
      {
        id: 'module_7',
        number: 7,
        title: 'Self-Coaching & Long-Term Motivation',
        description: 'Develop self-coaching skills and create sustainable motivation systems for lasting wellness.',
        estimatedDuration: 85,
        isRequired: true,
        prerequisites: ['module_6'],
        sections: [
          {
            id: 'section_7_1',
            moduleId: 'module_7',
            number: 1,
            title: 'The Art of Self-Coaching',
            content: [
              {
                id: 'content_7_1_1',
                type: 'text',
                title: 'What is Self-Coaching?',
                content: 'Self-coaching is the practice of guiding your own personal and professional development through structured self-reflection, goal-setting, and action planning. Unlike traditional coaching where you work with an external coach, self-coaching puts you in the driver\'s seat of your own growth. It involves developing awareness of your thoughts, emotions, and behaviors, asking yourself powerful questions, and creating accountability systems to achieve your goals.',
                order: 1
              },
              {
                id: 'content_7_1_2',
                type: 'text',
                title: 'The Self-Coaching Mindset',
                content: 'Effective self-coaching requires adopting a growth mindset and becoming your own compassionate observer. This means viewing challenges as opportunities for learning, treating setbacks as data rather than failures, and maintaining curiosity about your patterns and behaviors. The self-coaching mindset involves being both supportive and accountable to yourself—like having an encouraging yet honest coach in your head.',
                order: 2
              },
              {
                id: 'content_7_1_3',
                type: 'text',
                title: 'Key Self-Coaching Skills',
                content: 'Essential self-coaching skills include self-awareness (understanding your values, strengths, and challenges), powerful questioning (asking yourself thought-provoking questions), reflective listening (paying attention to your inner dialogue), goal setting (creating clear, achievable objectives), and action planning (breaking goals into manageable steps). These skills can be developed through practice and conscious effort.',
                order: 3
              }
            ],
            exercises: [
              {
                id: 'exercise_7_1_1',
                sectionId: 'section_7_1',
                type: 'weekly_reflection',
                title: 'Weekly Self-Coaching Session',
                instructions: 'Conduct a structured weekly reflection session using proven self-coaching questions and frameworks.',
                estimatedDuration: 30,
                isRequired: true,
                config: {
                  reflectionAreas: ['achievements', 'challenges', 'learnings', 'goals', 'actions'],
                  includesGoalSetting: true,
                  trackingPeriod: 4
                },
                order: 1
              }
            ],
            estimatedDuration: 30,
            isRequired: true
          },
          {
            id: 'section_7_2',
            moduleId: 'module_7',
            number: 2,
            title: 'Building Sustainable Motivation',
            content: [
              {
                id: 'content_7_2_1',
                type: 'text',
                title: 'Intrinsic vs. Extrinsic Motivation',
                content: 'Intrinsic motivation comes from internal satisfaction—doing something because it\'s personally meaningful, enjoyable, or aligned with your values. Extrinsic motivation relies on external rewards or consequences. While both have their place, intrinsic motivation is more sustainable for long-term behavior change. To build intrinsic motivation, connect your wellness goals to your deeper values and personal meaning.',
                order: 1
              },
              {
                id: 'content_7_2_2',
                type: 'text',
                title: 'The Motivation Myth',
                content: 'Waiting for motivation to strike is a common trap. Motivation often follows action, not the other way around. Instead of relying on feeling motivated, create systems and routines that don\'t depend on your emotional state. Use the "motivation equation" of Progress + Autonomy + Purpose = Sustainable motivation. Focus on making consistent progress, maintaining control over your choices, and connecting to your deeper purpose.',
                order: 2
              },
              {
                id: 'content_7_2_3',
                type: 'text',
                title: 'Creating Your Motivation System',
                content: 'A robust motivation system includes clear values and purpose, regular progress tracking, meaningful rewards and celebrations, social support and accountability, variety and novelty in your approaches, and connection to something larger than yourself. Build multiple sources of motivation so you\'re not dependent on any single factor. When one source wanes, others can carry you forward.',
                order: 3
              }
            ],
            exercises: [
              {
                id: 'exercise_7_2_1',
                sectionId: 'section_7_2',
                type: 'self_coaching_checklist',
                title: 'Personal Motivation Assessment',
                instructions: 'Evaluate your current motivation sources and create a personalized motivation maintenance system.',
                estimatedDuration: 25,
                isRequired: true,
                config: {
                  assessmentAreas: ['values_alignment', 'progress_tracking', 'reward_systems', 'social_support', 'purpose_connection'],
                  includesActionPlan: true,
                  reviewFrequency: 'monthly'
                },
                order: 1
              }
            ],
            estimatedDuration: 30,
            isRequired: true
          },
          {
            id: 'section_7_3',
            moduleId: 'module_7',
            number: 3,
            title: 'Progress Celebration & Momentum Building',
            content: [
              {
                id: 'content_7_3_1',
                type: 'text',
                title: 'The Science of Celebration',
                content: 'Celebrating progress, no matter how small, releases dopamine and reinforces positive behaviors. This neurochemical reward system helps your brain recognize and repeat successful patterns. Celebration doesn\'t have to be elaborate—it can be as simple as acknowledging your effort, sharing your success with someone, or doing something you enjoy. The key is consistency and immediacy.',
                order: 1
              },
              {
                id: 'content_7_3_2',
                type: 'text',
                title: 'Building Positive Momentum',
                content: 'Momentum is the force that carries you forward when motivation is low. Build momentum by starting with small wins, stacking successes together, tracking your progress visually, and linking new behaviors to existing strong habits. When you experience setbacks, focus on getting back on track quickly rather than making up for lost time. One good day can restart your momentum.',
                order: 2
              },
              {
                id: 'content_7_3_3',
                type: 'text',
                title: 'Long-Term Sustainability Strategies',
                content: 'Sustainable wellness requires systems that work even when life gets challenging. Build flexibility into your routines, prepare for common obstacles, maintain social support, regularly review and adjust your goals, and practice self-compassion when you fall short. Remember that wellness is a lifelong journey, not a destination. Focus on progress, not perfection.',
                order: 3
              }
            ],
            exercises: [
              {
                id: 'exercise_7_3_1',
                sectionId: 'section_7_3',
                type: 'progress_celebration',
                title: 'Personal Victory Tracker',
                instructions: 'Create a system for recognizing, celebrating, and building momentum from your wellness victories.',
                estimatedDuration: 20,
                isRequired: true,
                config: {
                  victoryTypes: ['daily_wins', 'weekly_achievements', 'milestone_moments', 'breakthrough_insights'],
                  celebrationMethods: ['personal_rewards', 'social_sharing', 'reflection_rituals', 'gratitude_practices'],
                  momentumBuilders: ['streak_tracking', 'progress_photos', 'measurement_logs', 'energy_levels']
                },
                order: 1
              }
            ],
            estimatedDuration: 25,
            isRequired: true
          }
        ],
        resources: [
          {
            id: 'resource_7_1',
            moduleId: 'module_7',
            type: 'worksheet',
            title: 'Self-Coaching Question Bank',
            description: 'Powerful questions for weekly self-reflection and goal planning',
            url: '#',
            downloadable: true
          },
          {
            id: 'resource_7_2',
            moduleId: 'module_7',
            type: 'template',
            title: 'Motivation Assessment Template',
            description: 'Framework for evaluating and strengthening your motivation sources',
            url: '#',
            downloadable: true
          },
          {
            id: 'resource_7_3',
            moduleId: 'module_7',
            type: 'guide',
            title: 'Celebration & Momentum Building Guide',
            description: 'Strategies for recognizing progress and maintaining forward movement',
            url: '#',
            downloadable: true
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Module 8: Personal Wellness Plan
      {
        id: 'module_8',
        number: 8,
        title: 'Personal Wellness Plan',
        description: 'Create a comprehensive, personalized wellness plan that integrates everything you\'ve learned.',
        estimatedDuration: 100,
        isRequired: true,
        prerequisites: ['module_7'],
        sections: [
          {
            id: 'section_8_1',
            moduleId: 'module_8',
            number: 1,
            title: 'Creating Your Wellness Vision',
            content: [
              {
                id: 'content_8_1_1',
                type: 'text',
                title: 'The Power of a Wellness Vision',
                content: 'A wellness vision is a clear, inspiring picture of your healthiest, most vibrant self. It goes beyond specific goals to capture the essence of how you want to feel, look, and live. Your vision serves as a North Star, guiding decisions and motivating action when challenges arise. It should be personal, meaningful, and emotionally compelling—something that energizes you just thinking about it.',
                order: 1
              },
              {
                id: 'content_8_1_2',
                type: 'text',
                title: 'Elements of an Effective Wellness Vision',
                content: 'An effective wellness vision includes multiple dimensions of health: physical (energy, strength, vitality), mental (clarity, focus, resilience), emotional (joy, peace, confidence), social (meaningful connections, community), and spiritual (purpose, meaning, values alignment). It should be specific enough to be compelling but flexible enough to evolve. Your vision should describe not just what you\'ll do, but who you\'ll become and how you\'ll feel.',
                order: 2
              },
              {
                id: 'content_8_1_3',
                type: 'text',
                title: 'From Vision to Reality',
                content: 'A vision without action remains a dream, but action without vision lacks direction. The key is connecting your inspiring vision to concrete daily practices. Break down your vision into themes and areas, then identify the habits and systems that will bring it to life. Your vision should feel both aspirational and achievable—something that stretches you while remaining grounded in reality.',
                order: 3
              }
            ],
            exercises: [
              {
                id: 'exercise_8_1_1',
                sectionId: 'section_8_1',
                type: 'wellness_vision_builder',
                title: 'Personal Wellness Vision Creation',
                instructions: 'Create a compelling, comprehensive vision for your healthiest, most vibrant self.',
                estimatedDuration: 45,
                isRequired: true,
                config: {
                  visionAreas: ['physical', 'mental', 'emotional', 'social', 'spiritual', 'lifestyle'],
                  timeHorizons: ['1_year', '3_years', '5_years'],
                  includesImagery: true,
                  includesValues: true
                },
                order: 1
              }
            ],
            estimatedDuration: 35,
            isRequired: true
          },
          {
            id: 'section_8_2',
            moduleId: 'module_8',
            number: 2,
            title: 'SMART Goal Setting & Prioritization',
            content: [
              {
                id: 'content_8_2_1',
                type: 'text',
                title: 'The SMART Goal Framework',
                content: 'SMART goals are Specific, Measurable, Achievable, Relevant, and Time-bound. Specific goals clearly define what you want to accomplish. Measurable goals include concrete criteria for tracking progress. Achievable goals are realistic given your current situation and resources. Relevant goals align with your values and vision. Time-bound goals have clear deadlines that create urgency and focus.',
                order: 1
              },
              {
                id: 'content_8_2_2',
                type: 'text',
                title: 'Layered Goal Setting',
                content: 'Effective wellness planning uses multiple goal layers: outcome goals (what you want to achieve), process goals (what you\'ll do consistently), and learning goals (what you want to discover or develop). Outcome goals provide direction, process goals drive daily action, and learning goals maintain growth mindset. Balance all three types for comprehensive progress.',
                order: 2
              },
              {
                id: 'content_8_2_3',
                type: 'text',
                title: 'Goal Prioritization Strategies',
                content: 'Not all goals are equally important. Use frameworks like the impact/effort matrix to prioritize: high-impact, low-effort goals first, followed by high-impact, high-effort goals. Consider your current life context, available resources, and which goals will create positive momentum. Focus on 3-5 major goals at a time to avoid overwhelm while maintaining meaningful progress.',
                order: 3
              }
            ],
            exercises: [
              {
                id: 'exercise_8_2_1',
                sectionId: 'section_8_2',
                type: 'smart_goal_setting',
                title: 'SMART Wellness Goals Creator',
                instructions: 'Create specific, measurable, achievable, relevant, and time-bound goals aligned with your wellness vision.',
                estimatedDuration: 40,
                isRequired: true,
                config: {
                  goalCategories: ['physical_health', 'nutrition', 'mental_wellbeing', 'stress_management', 'habits', 'social_wellness'],
                  goalTypes: ['outcome', 'process', 'learning'],
                  timeframes: ['30_days', '90_days', '6_months', '1_year'],
                  maxGoals: 8,
                  includesPrioritization: true
                },
                order: 1
              }
            ],
            estimatedDuration: 35,
            isRequired: true
          },
          {
            id: 'section_8_3',
            moduleId: 'module_8',
            number: 3,
            title: 'Integrated Wellness Plan Creation',
            content: [
              {
                id: 'content_8_3_1',
                type: 'text',
                title: 'Systems Thinking for Wellness',
                content: 'Wellness is not about isolated behaviors but interconnected systems. Your sleep affects your nutrition choices, which impacts your energy for exercise, which influences your mood and stress levels. An integrated wellness plan recognizes these connections and creates synergies. Design your plan so that success in one area supports success in others, creating positive feedback loops.',
                order: 1
              },
              {
                id: 'content_8_3_2',
                type: 'text',
                title: 'Creating Your Wellness Architecture',
                content: 'Think of your wellness plan as architecture—foundational habits that support everything else, load-bearing routines that structure your days, and finishing touches that add joy and meaning. Your foundation might include sleep, nutrition, and movement basics. Your structure includes morning routines, meal timing, and stress management practices. Your finishing touches are the practices that express your unique personality and values.',
                order: 2
              },
              {
                id: 'content_8_3_3',
                type: 'text',
                title: 'Implementation and Adaptation Strategies',
                content: 'A great plan implemented poorly beats a perfect plan never started. Begin with your foundation and add complexity gradually. Build in regular review periods to assess what\'s working and what needs adjustment. Expect your plan to evolve—what works in one life season may need modification in another. Focus on principles and systems rather than rigid rules, allowing for flexibility while maintaining consistency.',
                order: 3
              }
            ],
            exercises: [
              {
                id: 'exercise_8_3_1',
                sectionId: 'section_8_3',
                type: 'wellness_plan_generator',
                title: 'Comprehensive Wellness Plan',
                instructions: 'Integrate everything you\'ve learned into a personalized, comprehensive wellness plan.',
                estimatedDuration: 50,
                isRequired: true,
                config: {
                  planDuration: '12',
                  wellnessAreas: ['Physical Health', 'Nutrition', 'Mental Health', 'Emotional Wellness', 'Social Connection', 'Spiritual Growth', 'Sleep & Recovery', 'Stress Management'],
                  planTypes: ['Comprehensive Plan', 'Focused Plan', 'Maintenance Plan', 'Intensive Plan'],
                  integrationMethods: ['Daily Habits', 'Weekly Reviews', 'Monthly Assessments', 'Accountability Partners', 'Progress Tracking', 'Support Systems']
                },
                order: 1
              }
            ],
            estimatedDuration: 30,
            isRequired: true
          }
        ],
        resources: [
          {
            id: 'resource_8_1',
            moduleId: 'module_8',
            type: 'template',
            title: 'Wellness Vision Template',
            description: 'Guided template for creating your personal wellness vision',
            url: '#',
            downloadable: true
          },
          {
            id: 'resource_8_2',
            moduleId: 'module_8',
            type: 'worksheet',
            title: 'SMART Goals Worksheet',
            description: 'Comprehensive worksheet for setting and tracking SMART wellness goals',
            url: '#',
            downloadable: true
          },
          {
            id: 'resource_8_3',
            moduleId: 'module_8',
            type: 'planner',
            title: 'Wellness Plan Implementation Guide',
            description: 'Step-by-step guide for implementing and maintaining your wellness plan',
            url: '#',
            downloadable: true
          },
          {
            id: 'resource_8_4',
            moduleId: 'module_8',
            type: 'checklist',
            title: 'Wellness Plan Review Checklist',
            description: 'Monthly and quarterly review checklist for optimizing your wellness plan',
            url: '#',
            downloadable: true
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
}

export const wellnessTrainingService = new TrainingService();
export default wellnessTrainingService;