import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ModuleProgress {
  moduleId: string;
  moduleName: string;
  isCompleted: boolean;
  completedAt?: Date;
  progressPercentage: number;
  estimatedTimeMinutes: number;
  category: string;
}

interface TrainingProgressWidgetProps {
  compact?: boolean;
  showDetails?: boolean;
}

const TrainingProgressWidget: React.FC<TrainingProgressWidgetProps> = ({ 
  compact = false, 
  showDetails = true 
}) => {
  const navigate = useNavigate();
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrainingProgress();
  }, []);

  const loadTrainingProgress = () => {
    setLoading(true);
    
    // Load actual training progress from localStorage
    const stored = localStorage.getItem('training_progress');
    const progressData = stored ? JSON.parse(stored) : {};
    
    const modules: ModuleProgress[] = [
      {
        moduleId: 'module1',
        moduleName: 'Introduction to Wellness Coaching',
        isCompleted: false,
        progressPercentage: 0,
        estimatedTimeMinutes: 45,
        category: 'Foundation'
      },
      {
        moduleId: 'module2',
        moduleName: 'Physical Wellness & Movement',
        isCompleted: false,
        progressPercentage: 0,
        estimatedTimeMinutes: 60,
        category: 'Physical'
      },
      {
        moduleId: 'module3',
        moduleName: 'Nutrition & Healthy Eating',
        isCompleted: false,
        progressPercentage: 0,
        estimatedTimeMinutes: 55,
        category: 'Nutrition'
      },
      {
        moduleId: 'module4',
        moduleName: 'Mental & Emotional Well-Being',
        isCompleted: false,
        progressPercentage: 0,
        estimatedTimeMinutes: 50,
        category: 'Mental'
      },
      {
        moduleId: 'module5',
        moduleName: 'Stress Management & Mindfulness',
        isCompleted: false,
        progressPercentage: 0,
        estimatedTimeMinutes: 65,
        category: 'Mental'
      },
      {
        moduleId: 'module6',
        moduleName: 'Healthy Habits & Behavior Change',
        isCompleted: false,
        progressPercentage: 0,
        estimatedTimeMinutes: 70,
        category: 'Behavioral'
      },
      {
        moduleId: 'module7',
        moduleName: 'Self-Coaching & Motivation',
        isCompleted: false,
        progressPercentage: 0,
        estimatedTimeMinutes: 55,
        category: 'Coaching'
      },
      {
        moduleId: 'module8',
        moduleName: 'Personal Wellness Plan',
        isCompleted: false,
        progressPercentage: 0,
        estimatedTimeMinutes: 80,
        category: 'Planning'
      }
    ];

    // Update with actual progress data
    const updatedModules = modules.map(module => {
      const progress = progressData[module.moduleId];
      if (progress) {
        return {
          ...module,
          isCompleted: progress.completed || false,
          completedAt: progress.completedAt ? new Date(progress.completedAt) : undefined,
          progressPercentage: progress.progressPercentage || 0
        };
      }
      return module;
    });

    setModuleProgress(updatedModules);
    setLoading(false);
  };

  const completedModules = moduleProgress.filter(module => module.isCompleted).length;
  const totalModules = moduleProgress.length;
  const overallProgress = Math.round((completedModules / totalModules) * 100);
  const totalTimeSpent = moduleProgress
    .filter(module => module.isCompleted)
    .reduce((sum, module) => sum + module.estimatedTimeMinutes, 0);
  const totalTimeRemaining = moduleProgress
    .filter(module => !module.isCompleted)
    .reduce((sum, module) => sum + module.estimatedTimeMinutes, 0);

  const currentModule = moduleProgress.find(module => !module.isCompleted && module.progressPercentage > 0) || 
                       moduleProgress.find(module => !module.isCompleted);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Foundation': return 'bg-blue-100 text-blue-800';
      case 'Physical': return 'bg-green-100 text-green-800';
      case 'Nutrition': return 'bg-orange-100 text-orange-800';
      case 'Mental': return 'bg-purple-100 text-purple-800';
      case 'Behavioral': return 'bg-yellow-100 text-yellow-800';
      case 'Coaching': return 'bg-indigo-100 text-indigo-800';
      case 'Planning': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${compact ? 'h-48' : 'h-64'}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm">Training Progress</h3>
          <span className="text-2xl">🎓</span>
        </div>
        
        <div className="mb-3">
          <div className="text-2xl font-bold text-purple-600">
            {completedModules}/{totalModules}
          </div>
          <div className="text-xs text-gray-500">
            Modules completed
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className="h-2 rounded-full bg-purple-500 transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-600">
          <span>{overallProgress}% complete</span>
          <span>{formatTime(totalTimeSpent)} spent</span>
        </div>
        
        {currentModule && (
          <button
            onClick={() => navigate(`/training/${currentModule.moduleId}`)}
            className="w-full mt-2 text-xs bg-purple-50 text-purple-700 py-1 px-2 rounded hover:bg-purple-100"
          >
            Continue: {currentModule.moduleName.split(' ').slice(0, 3).join(' ')}...
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 text-lg">Training Progress</h3>
        <span className="text-2xl">🎓</span>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {completedModules}/{totalModules}
          </div>
          <div className="text-xs text-gray-500">Modules</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {overallProgress}%
          </div>
          <div className="text-xs text-gray-500">Complete</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatTime(totalTimeSpent)}
          </div>
          <div className="text-xs text-gray-500">Time Spent</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {formatTime(totalTimeRemaining)}
          </div>
          <div className="text-xs text-gray-500">Remaining</div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Course Completion</span>
          <span>{overallProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Current Module */}
      {currentModule && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg">
          <h4 className="font-medium text-purple-900 mb-2">Continue Learning</h4>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-800">{currentModule.moduleName}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(currentModule.category)}`}>
              {currentModule.category}
            </span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-purple-600">
              {currentModule.progressPercentage}% complete • {formatTime(currentModule.estimatedTimeMinutes)} estimated
            </span>
          </div>
          <button
            onClick={() => navigate(`/training/${currentModule.moduleId}`)}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Continue Module
          </button>
        </div>
      )}

      {/* Module List */}
      {showDetails && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">All Modules</h4>
          <div className="space-y-3">
            {moduleProgress.map((module, index) => (
              <div 
                key={module.moduleId}
                className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  module.isCompleted 
                    ? 'border-green-200 bg-green-50' 
                    : module === currentModule
                      ? 'border-purple-200 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => navigate(`/training/${module.moduleId}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      module.isCompleted 
                        ? 'bg-green-500 text-white' 
                        : module === currentModule
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                    }`}>
                      {module.isCompleted ? '✓' : index + 1}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 text-sm">{module.moduleName}</h5>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(module.category)}`}>
                          {module.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(module.estimatedTimeMinutes)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {module.isCompleted && module.completedAt && (
                    <span className="text-xs text-green-600">
                      {module.completedAt.toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                {!module.isCompleted && module.progressPercentage > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="h-1 rounded-full bg-purple-500"
                        style={{ width: `${module.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificate Badge */}
      {completedModules === totalModules && (
        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🏆</span>
            <div>
              <h4 className="font-semibold text-yellow-900">Congratulations!</h4>
              <p className="text-yellow-800 text-sm">
                You've completed all wellness coaching modules. You're now eligible to create groups!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingProgressWidget;