import React, { useState, useEffect } from 'react';
import { TrainingModule, UserModuleProgress } from '../../types/training';
import { wellnessTrainingService } from '../../services/wellnessTrainingService';
import { errorService } from '../../services/errorService';

interface TrainingModuleNavigationProps {
  userId: string;
  currentModuleId?: string;
  onModuleSelect: (moduleId: string) => void;
}

export const TrainingModuleNavigation: React.FC<TrainingModuleNavigationProps> = ({
  userId,
  currentModuleId,
  onModuleSelect
}) => {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [userProgress, setUserProgress] = useState<UserModuleProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModulesAndProgress();
  }, [userId]);

  const loadModulesAndProgress = async () => {
    try {
      const modulesList = wellnessTrainingService.getTrainingModules();
      const progressList = wellnessTrainingService.getUserProgress(userId);
      
      setModules(modulesList);
      setUserProgress(progressList);
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'TrainingModuleNavigation.loadModulesAndProgress',
        userId
      });
    } finally {
      setLoading(false);
    }
  };

  const getModuleProgress = (moduleId: string): UserModuleProgress | null => {
    return userProgress.find(p => p.moduleId === moduleId) || null;
  };

  const getProgressPercentage = (moduleId: string): number => {
    const progress = getModuleProgress(moduleId);
    return progress?.progressPercentage || 0;
  };

  const getModuleStatus = (moduleId: string): 'not_started' | 'in_progress' | 'completed' => {
    const progress = getModuleProgress(moduleId);
    return progress?.status || 'not_started';
  };

  const isModuleAccessible = (module: TrainingModule): boolean => {
    // Module 1 is always accessible
    if (module.id === 'module_1') return true;
    
    // For testing purposes, make all modules accessible
    // In production, you might want stricter prerequisite checking
    return true;
    
    // Original logic (commented out for now):
    // Check if all prerequisites are completed
    // for (const prerequisiteId of module.prerequisites) {
    //   const prereqStatus = getModuleStatus(prerequisiteId);
    //   if (prereqStatus !== 'completed') {
    //     return false;
    //   }
    // }
    // return true;
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '🔄';
      default: return '⭕';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading modules...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Wellness Coaching Training</h2>
        <div className="text-sm text-gray-600">
          {userProgress.filter(p => p.status === 'completed').length} of {modules.length} completed
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900">Overall Progress</span>
          <span className="text-sm text-gray-600">
            {Math.round((userProgress.filter(p => p.status === 'completed').length / modules.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ 
              width: `${(userProgress.filter(p => p.status === 'completed').length / modules.length) * 100}%` 
            }}
          ></div>
        </div>
      </div>

      {/* Module List */}
      <div className="space-y-3">
        {modules.map((module) => {
          const status = getModuleStatus(module.id);
          const progress = getProgressPercentage(module.id);
          const isAccessible = isModuleAccessible(module);
          const isCurrent = currentModuleId === module.id;

          return (
            <div
              key={module.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                isCurrent 
                  ? 'border-blue-500 bg-blue-50' 
                  : isAccessible
                    ? 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed'
              }`}
              onClick={() => {
                if (isAccessible) {
                  onModuleSelect(module.id);
                }
              }}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <span className="text-2xl">{getStatusIcon(status)}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className={`text-sm font-medium ${
                        isAccessible ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        Module {module.number}: {module.title}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {module.estimatedDuration} min
                      </span>
                      {module.isRequired && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-800">
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className={`text-sm mt-1 ${
                    isAccessible ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {module.description}
                  </p>

                  {/* Prerequisites */}
                  {module.prerequisites.length > 0 && !isAccessible && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        Prerequisites: {module.prerequisites.map(prereqId => {
                          const prereqModule = modules.find(m => m.id === prereqId);
                          return prereqModule?.title || prereqId;
                        }).join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {status !== 'not_started' && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Progress</span>
                        <span className="text-xs text-gray-600">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full transition-all duration-300 ${
                            status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Last Accessed */}
                  {status !== 'not_started' && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        Last accessed: {new Date(getModuleProgress(module.id)?.lastAccessedAt || new Date()).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Training Statistics</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-600">
              {userProgress.filter(p => p.status === 'completed').length}
            </div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">
              {userProgress.filter(p => p.status === 'in_progress').length}
            </div>
            <div className="text-xs text-gray-600">In Progress</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-600">
              {modules.length - userProgress.length}
            </div>
            <div className="text-xs text-gray-600">Not Started</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingModuleNavigation;