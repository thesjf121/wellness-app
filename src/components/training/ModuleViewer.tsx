import React, { useState, useEffect } from 'react';
import { TrainingModule, ModuleSection, UserModuleProgress, ModuleExercise } from '../../types/training';
import { wellnessTrainingService } from '../../services/wellnessTrainingService';
import { errorService } from '../../services/errorService';
import { WellnessWheelExercise } from './exercises/WellnessWheelExercise';
import { ReflectionExercise } from './exercises/ReflectionExercise';
import { MovementTrackerExercise } from './exercises/MovementTrackerExercise';
import { MovementChallengeExercise } from './exercises/MovementChallengeExercise';
import { SleepAuditExercise } from './exercises/SleepAuditExercise';
import { MindfulEatingTimerExercise } from './exercises/MindfulEatingTimerExercise';
import { MealPlanningExercise } from './exercises/MealPlanningExercise';
import { MoodTrackingExercise } from './exercises/MoodTrackingExercise';
import { MindsetReframingExercise } from './exercises/MindsetReframingExercise';
import { ResilienceMappingExercise } from './exercises/ResilienceMappingExercise';
import { StressInventoryExercise } from './exercises/StressInventoryExercise';
import { BreathingExercise } from './exercises/BreathingExercise';
import { GuidedMeditationExercise } from './exercises/GuidedMeditationExercise';
import { HabitLoopAnalyzerExercise } from './exercises/HabitLoopAnalyzerExercise';
import { HabitTrackerExercise } from './exercises/HabitTrackerExercise';
import { IfThenPlanningExercise } from './exercises/IfThenPlanningExercise';
import { WeeklyReflectionExercise } from './exercises/WeeklyReflectionExercise';
import { SelfCoachingChecklistExercise } from './exercises/SelfCoachingChecklistExercise';
import { ProgressCelebrationExercise } from './exercises/ProgressCelebrationExercise';
import { WellnessVisionBuilderExercise } from './exercises/WellnessVisionBuilderExercise';
import { SmartGoalSettingExercise } from './exercises/SmartGoalSettingExercise';
import { WellnessPlanGeneratorExercise } from './exercises/WellnessPlanGeneratorExercise';
import { QuizAssessmentExercise } from './exercises/QuizAssessmentExercise';
import { ExerciseSubmissionHistory } from './ExerciseSubmissionHistory';
import { CertificateGenerator } from './CertificateGenerator';

interface ModuleViewerProps {
  userId: string;
  moduleId: string;
  onProgressUpdate?: () => void;
}

export const ModuleViewer: React.FC<ModuleViewerProps> = ({
  userId,
  moduleId,
  onProgressUpdate
}) => {
  const [module, setModule] = useState<TrainingModule | null>(null);
  const [progress, setProgress] = useState<UserModuleProgress | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeExercise, setActiveExercise] = useState<ModuleExercise | null>(null);
  const [showSubmissionHistory, setShowSubmissionHistory] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificate, setCertificate] = useState<any>(null);

  useEffect(() => {
    loadModuleAndProgress();
  }, [moduleId, userId]);

  const loadModuleAndProgress = async () => {
    try {
      setLoading(true);
      setError(null);

      const moduleData = wellnessTrainingService.getModuleById(moduleId);
      if (!moduleData) {
        setError('Module not found');
        return;
      }

      let progressData = wellnessTrainingService.getModuleProgress(userId, moduleId);
      if (!progressData) {
        // Start the module if not already started
        progressData = await wellnessTrainingService.startModule(userId, moduleId);
      }

      setModule(moduleData);
      setProgress(progressData);

      // Set current section based on progress
      if (progressData.currentSectionId) {
        const sectionIndex = moduleData.sections.findIndex(s => s.id === progressData!.currentSectionId);
        if (sectionIndex >= 0) {
          setCurrentSectionIndex(sectionIndex);
        }
      }

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'ModuleViewer.loadModuleAndProgress',
        userId,
        moduleId
      });
      setError('Failed to load module data');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionComplete = async (sectionId: string) => {
    try {
      await wellnessTrainingService.completeSection(userId, moduleId, sectionId);
      
      // Force advance to next section immediately
      if (currentSectionIndex < (module?.sections.length || 0) - 1) {
        setCurrentSectionIndex(currentSectionIndex + 1);
      }
      
      await loadModuleAndProgress(); // Refresh progress
      onProgressUpdate?.();
      
    } catch (error) {
      console.error('Section completion error:', error);
      // Force advance anyway
      if (currentSectionIndex < (module?.sections.length || 0) - 1) {
        setCurrentSectionIndex(currentSectionIndex + 1);
      }
    }
  };

  const isSectionCompleted = (sectionId: string): boolean => {
    return progress?.completedSections.includes(sectionId) || false;
  };

  const getCurrentSection = (): ModuleSection | null => {
    if (!module || currentSectionIndex >= module.sections.length) return null;
    return module.sections[currentSectionIndex];
  };

  const canNavigateToSection = (index: number): boolean => {
    if (index === 0) return true; // First section always accessible
    
    // Can access if previous section is completed
    const prevSection = module?.sections[index - 1];
    return prevSection ? isSectionCompleted(prevSection.id) : false;
  };

  const handleExerciseStart = (exercise: ModuleExercise) => {
    setActiveExercise(exercise);
  };

  const handleExerciseSubmit = async (responses: Record<string, any>) => {
    if (!activeExercise) return;

    try {
      // Add completion timestamp and calculate time spent
      const exerciseStartTime = Date.now() - (responses.timeSpent || 300000); // Default 5 minutes if not tracked
      const finalResponses = {
        ...responses,
        completedAt: new Date(),
        timeSpent: responses.timeSpent || (Date.now() - exerciseStartTime)
      };

      // Submit exercise with proper response tracking
      const submission = await wellnessTrainingService.submitExercise(
        userId, 
        moduleId, 
        activeExercise.id, 
        finalResponses,
        activeExercise.sectionId
      );

      // Refresh progress to show completion
      await loadModuleAndProgress();
      onProgressUpdate?.();

      setActiveExercise(null);

      // Exercise completed successfully - user can now mark section as complete manually

      // Show success message with score and feedback
      const scoreMessage = submission.score ? ` (Score: ${submission.score}/100)` : '';
      alert(`Exercise completed successfully!${scoreMessage}\n\n${submission.feedback}`);
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'ModuleViewer.handleExerciseSubmit',
        userId,
        moduleId,
        exerciseId: activeExercise.id
      });
      alert('Failed to submit exercise. Please try again.');
    }
  };

  const handleExerciseCancel = () => {
    setActiveExercise(null);
  };

  const renderExercise = (exercise: ModuleExercise) => {
    switch (exercise.type) {
      case 'wellness_wheel':
        return (
          <WellnessWheelExercise
            exerciseId={exercise.id}
            userId={userId}
            onSubmit={handleExerciseSubmit}
            onCancel={handleExerciseCancel}
            config={exercise.config}
          />
        );
      case 'reflection':
        return (
          <ReflectionExercise
            exerciseId={exercise.id}
            userId={userId}
            onSubmit={handleExerciseSubmit}
            onCancel={handleExerciseCancel}
            config={exercise.config}
          />
        );
      case 'movement_tracker':
        return (
          <MovementTrackerExercise
            exerciseId={exercise.id}
            userId={userId}
            onSubmit={handleExerciseSubmit}
            onCancel={handleExerciseCancel}
            config={exercise.config}
          />
        );
      case 'movement_challenge':
        return (
          <MovementChallengeExercise
            exerciseId={exercise.id}
            userId={userId}
            onSubmit={handleExerciseSubmit}
            onCancel={handleExerciseCancel}
            config={exercise.config}
          />
        );
      case 'sleep_audit':
        return (
          <SleepAuditExercise
            exerciseId={exercise.id}
            userId={userId}
            onSubmit={handleExerciseSubmit}
            onCancel={handleExerciseCancel}
            config={exercise.config}
          />
        );
      case 'mindful_eating_timer':
        return (
          <MindfulEatingTimerExercise
            exerciseId={exercise.id}
            userId={userId}
            onSubmit={handleExerciseSubmit}
            onCancel={handleExerciseCancel}
            config={exercise.config}
          />
        );
      case 'meal_planning':
        return (
          <MealPlanningExercise
            exerciseId={exercise.id}
            userId={userId}
            onSubmit={handleExerciseSubmit}
            onCancel={handleExerciseCancel}
            config={exercise.config}
          />
        );
      case 'mood_tracking':
        return (
          <MoodTrackingExercise
            exerciseId={exercise.id}
            userId={userId}
            onSubmit={handleExerciseSubmit}
            onCancel={handleExerciseCancel}
            config={exercise.config}
          />
        );
      case 'mindset_reframing':
        return (
          <MindsetReframingExercise
            exerciseId={exercise.id}
            userId={userId}
            onSubmit={handleExerciseSubmit}
            onCancel={handleExerciseCancel}
            config={exercise.config}
          />
        );
      case 'resilience_mapping':
        return (
          <ResilienceMappingExercise
            exerciseId={exercise.id}
            userId={userId}
            onSubmit={handleExerciseSubmit}
            onCancel={handleExerciseCancel}
            config={exercise.config}
          />
        );
      case 'stress_inventory':
        return (
          <StressInventoryExercise
            exerciseId={exercise.id}
            userId={userId}
            onSubmit={handleExerciseSubmit}
            onCancel={handleExerciseCancel}
            config={exercise.config}
          />
        );
      case 'breathing_exercise':
        return (
          <BreathingExercise
            exerciseId={exercise.id}
            userId={userId}
            onSubmit={handleExerciseSubmit}
            onCancel={handleExerciseCancel}
            config={exercise.config}
          />
        );
      case 'guided_meditation':
        return (
          <GuidedMeditationExercise
            exerciseId={exercise.id}
            userId={userId}
            onSubmit={handleExerciseSubmit}
            onCancel={handleExerciseCancel}
            config={exercise.config}
          />
        );
      case 'habit_loop_analyzer':
        return (
          <HabitLoopAnalyzerExercise
            exerciseId={exercise.id}
            userId={userId}
            onSubmit={handleExerciseSubmit}
            onCancel={handleExerciseCancel}
            config={exercise.config}
          />
        );
      case 'habit_tracker':
        return (
          <HabitTrackerExercise
            exerciseId={exercise.id}
            userId={userId}
            onSubmit={handleExerciseSubmit}
            onCancel={handleExerciseCancel}
            config={exercise.config}
          />
        );
      case 'if_then_planning':
        return (
          <IfThenPlanningExercise
            exerciseId={exercise.id}
            userId={userId}
            onSubmit={handleExerciseSubmit}
            onCancel={handleExerciseCancel}
            config={exercise.config}
          />
        );
      case 'weekly_reflection':
        return (
          <WeeklyReflectionExercise
            exerciseId={exercise.id}
            userId={userId}
            onSubmit={handleExerciseSubmit}
            onCancel={handleExerciseCancel}
            config={exercise.config}
          />
        );
      case 'self_coaching_checklist':
        return (
          <SelfCoachingChecklistExercise
            exerciseId={exercise.id}
            userId={userId}
            onSubmit={handleExerciseSubmit}
            onCancel={handleExerciseCancel}
            config={exercise.config}
          />
        );
      case 'progress_celebration':
        return (
          <ProgressCelebrationExercise
            exerciseId={exercise.id}
            userId={userId}
            onSubmit={handleExerciseSubmit}
            onCancel={handleExerciseCancel}
            config={exercise.config}
          />
        );
      case 'wellness_vision_builder':
        return (
          <WellnessVisionBuilderExercise
            exerciseId={exercise.id}
            userId={userId}
            onSubmit={handleExerciseSubmit}
            onCancel={handleExerciseCancel}
            config={exercise.config}
          />
        );
      case 'smart_goal_setting':
        return (
          <SmartGoalSettingExercise
            exerciseId={exercise.id}
            userId={userId}
            onSubmit={handleExerciseSubmit}
            onCancel={handleExerciseCancel}
            config={exercise.config}
          />
        );
      case 'wellness_plan_generator':
        return (
          <WellnessPlanGeneratorExercise
            exerciseId={exercise.id}
            userId={userId}
            onSubmit={handleExerciseSubmit}
            onCancel={handleExerciseCancel}
            config={exercise.config}
          />
        );
      case 'quiz_assessment':
        return (
          <QuizAssessmentExercise
            exerciseId={exercise.id}
            userId={userId}
            onSubmit={handleExerciseSubmit}
            onCancel={handleExerciseCancel}
            config={exercise.config}
          />
        );
      default:
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              Exercise type "{exercise.type}" is not yet supported.
            </p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading module...</p>
        </div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800">Error Loading Module</h3>
        <p className="text-red-700 mt-2">{error || 'Module not found'}</p>
        <button
          onClick={loadModuleAndProgress}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const currentSection = getCurrentSection();

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
      {/* Module Header */}
      <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-start justify-between space-y-4 md:space-y-0">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              Module {module.number}: {module.title}
            </h1>
            <p className="text-gray-600 mb-4 text-sm md:text-base">{module.description}</p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span>📅 {module.estimatedDuration} min</span>
              <span>📚 {module.sections.length} sections</span>
              {module.isRequired && (
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                  Required
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-row md:flex-col items-center md:items-end space-x-4 md:space-x-0 md:space-y-3">
            <div className="text-center md:text-right">
              <div className="text-sm text-gray-600 mb-1">Progress</div>
              <div className="text-xl md:text-2xl font-bold text-blue-600">
                {Math.round(progress?.progressPercentage || 0)}%
              </div>
            </div>
            
            <button
              onClick={() => setShowSubmissionHistory(true)}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border border-gray-300 whitespace-nowrap"
            >
              📊 History
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress?.progressPercentage || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Sections</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {module.sections.map((section, index) => {
            const isCompleted = isSectionCompleted(section.id);
            const isCurrent = index === currentSectionIndex;
            const canAccess = canNavigateToSection(index);

            return (
              <button
                key={section.id}
                onClick={() => {
                  if (canAccess) {
                    setCurrentSectionIndex(index);
                  }
                }}
                disabled={!canAccess}
                className={`text-left p-4 rounded-xl border text-sm transition-all ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : isCompleted
                      ? 'border-green-300 bg-green-50 hover:bg-green-100'
                      : canAccess
                        ? 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {section.number}. {section.title}
                  </span>
                  <span className="text-lg">
                    {isCompleted ? '✅' : isCurrent ? '▶️' : canAccess ? '⭕' : '🔒'}
                  </span>
                </div>
                <div className="text-gray-600 mt-1">
                  {section.estimatedDuration} min
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Section Content */}
      {currentSection && (
        <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-2 md:space-y-0">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              Section {currentSection.number}: {currentSection.title}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {currentSection.estimatedDuration} min
              </span>
              {isSectionCompleted(currentSection.id) && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Completed
                </span>
              )}
            </div>
          </div>

          {/* Section Content */}
          <div className="space-y-6">
            {currentSection.content.map((content) => (
              <div key={content.id} className="prose max-w-none">
                {content.title && (
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {content.title}
                  </h3>
                )}
                <div className="text-gray-700 leading-relaxed">
                  {content.content}
                </div>
              </div>
            ))}

            {/* Interactive Exercises */}
            {currentSection.exercises.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Interactive Exercises</h3>
                <div className="space-y-4">
                  {currentSection.exercises.map((exercise) => {
                    const isCompleted = wellnessTrainingService.isExerciseCompleted(userId, moduleId, exercise.id);
                    const submissions = wellnessTrainingService.getExerciseSubmissions(userId, moduleId, exercise.id);
                    const latestSubmission = submissions[0]; // Most recent submission
                    
                    return (
                      <div key={exercise.id} className={`p-4 rounded-lg ${isCompleted ? 'bg-green-50 border border-green-200' : 'bg-blue-50'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-gray-900">
                                {exercise.title}
                              </h4>
                              {isCompleted && (
                                <span className="text-green-600 text-lg">✅</span>
                              )}
                            </div>
                            <p className="text-gray-700 mb-3">
                              {exercise.instructions}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>⏱️ {exercise.estimatedDuration} minutes</span>
                              {isCompleted && latestSubmission && (
                                <>
                                  <span>📊 Score: {latestSubmission.score}/100</span>
                                  <span>📅 Completed: {new Date(latestSubmission.submittedAt).toLocaleDateString()}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => handleExerciseStart(exercise)}
                              className={`px-4 py-2 rounded-md text-white ${
                                isCompleted 
                                  ? 'bg-green-600 hover:bg-green-700' 
                                  : 'bg-blue-600 hover:bg-blue-700'
                              }`}
                            >
                              {isCompleted ? 'Redo Exercise' : 'Start Exercise'}
                            </button>
                            {isCompleted && latestSubmission && (
                              <button
                                onClick={() => {
                                  alert(`Feedback: ${latestSubmission.feedback}`);
                                }}
                                className="px-4 py-2 text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 text-sm"
                              >
                                View Feedback
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section Navigation */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between mt-8 pt-6 border-t space-y-3 md:space-y-0">
            <button
              onClick={() => {
                if (currentSectionIndex > 0) {
                  setCurrentSectionIndex(currentSectionIndex - 1);
                }
              }}
              disabled={currentSectionIndex === 0}
              className="px-4 py-3 md:py-2 border border-gray-300 rounded-xl md:rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              ← Previous Section
            </button>

            <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-2 md:space-y-0 md:space-x-3">
              <button
                onClick={() => {
                  // Mark section as complete if not already
                  if (!isSectionCompleted(currentSection.id)) {
                    wellnessTrainingService.completeSection(userId, moduleId, currentSection.id);
                  }
                  
                  // Navigate to next section or next module
                  if (currentSectionIndex < module.sections.length - 1) {
                    setCurrentSectionIndex(currentSectionIndex + 1);
                  } else {
                    // Last section - determine next module based on current module
                    const nextModuleNumber = parseInt(moduleId.split('_')[1]) + 1;
                    window.location.href = `/training/module_${nextModuleNumber}`;
                  }
                }}
                className="px-6 py-3 md:py-2 bg-blue-600 text-white rounded-xl md:rounded-md hover:bg-blue-700 font-medium"
              >
                {currentSectionIndex < module.sections.length - 1 ? 'Next Section →' : 'Next Module →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Module Completion */}
      {progress?.status === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <span className="text-3xl mr-3">🎉</span>
            <div>
              <h3 className="text-lg font-semibold text-green-900">
                Congratulations! Module Completed
              </h3>
              <p className="text-green-700 mt-1">
                You have successfully completed "{module.title}". 
                {progress.completedAt && (
                  <span className="ml-1">
                    Finished on {new Date(progress.completedAt).toLocaleDateString()}
                  </span>
                )}
              </p>
              <button
                onClick={async () => {
                  try {
                    // Get or generate certificate
                    const certificates = await wellnessTrainingService.getUserCertificates(userId);
                    let moduleCert = certificates.find(c => c.moduleId === moduleId);
                    
                    if (!moduleCert) {
                      // Generate certificate if not exists
                      moduleCert = await wellnessTrainingService.generateCertificate(userId, moduleId);
                    }
                    
                    setCertificate(moduleCert);
                    setShowCertificate(true);
                  } catch (error) {
                    console.error('Failed to get certificate:', error);
                    alert('Failed to generate certificate. Please try again.');
                  }
                }}
                className="mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                View Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Modal */}
      {activeExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-white rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {activeExercise.title}
                  </h3>
                  <button
                    onClick={handleExerciseCancel}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {activeExercise.instructions}
                </p>
              </div>
              <div className="p-4">
                {renderExercise(activeExercise)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Submission History Modal */}
      {showSubmissionHistory && (
        <ExerciseSubmissionHistory
          userId={userId}
          moduleId={moduleId}
          onClose={() => setShowSubmissionHistory(false)}
        />
      )}

      {/* Certificate Modal */}
      {showCertificate && certificate && module && (
        <CertificateGenerator
          certificate={certificate}
          module={module}
          userName="Wellness Champion" // You might want to get this from user profile
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
};

export default ModuleViewer;