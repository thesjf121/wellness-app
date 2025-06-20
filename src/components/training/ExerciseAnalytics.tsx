import React, { useState, useEffect } from 'react';
import { ExerciseSubmission } from '../../types/training';
import { wellnessTrainingService } from '../../services/wellnessTrainingService';

interface ExerciseAnalyticsProps {
  userId: string;
}

interface AnalyticsData {
  totalSubmissions: number;
  averageScore: number;
  totalTimeSpent: number;
  completionRate: number;
  moduleProgress: { [moduleId: string]: { completed: number; total: number; averageScore: number } };
  recentActivity: ExerciseSubmission[];
  streaks: {
    current: number;
    longest: number;
  };
}

export const ExerciseAnalytics: React.FC<ExerciseAnalyticsProps> = ({ userId }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateAnalytics();
  }, [userId]);

  const calculateAnalytics = () => {
    setLoading(true);
    try {
      const submissions = wellnessTrainingService.getExerciseSubmissions(userId);
      const userProgress = wellnessTrainingService.getUserProgress(userId);
      const modules = wellnessTrainingService.getTrainingModules();

      // Calculate basic metrics
      const totalSubmissions = submissions.length;
      const averageScore = submissions.length > 0 
        ? submissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / submissions.length 
        : 0;
      const totalTimeSpent = submissions.reduce((sum, sub) => sum + sub.timeSpent, 0);

      // Calculate module progress
      const moduleProgress: { [moduleId: string]: { completed: number; total: number; averageScore: number } } = {};
      
      modules.forEach(module => {
        const totalExercises = module.sections.reduce((total, section) => total + section.exercises.length, 0);
        const moduleSubmissions = submissions.filter(sub => sub.moduleId === module.id);
        const completedExercises = new Set(moduleSubmissions.map(sub => sub.exerciseId)).size;
        const moduleAverageScore = moduleSubmissions.length > 0
          ? moduleSubmissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / moduleSubmissions.length
          : 0;

        moduleProgress[module.id] = {
          completed: completedExercises,
          total: totalExercises,
          averageScore: moduleAverageScore
        };
      });

      // Calculate overall completion rate
      const totalExercises = Object.values(moduleProgress).reduce((sum, prog) => sum + prog.total, 0);
      const totalCompleted = Object.values(moduleProgress).reduce((sum, prog) => sum + prog.completed, 0);
      const completionRate = totalExercises > 0 ? (totalCompleted / totalExercises) * 100 : 0;

      // Calculate streaks
      const sortedSubmissions = [...submissions].sort((a, b) => 
        new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
      );
      
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let lastDate: Date | null = null;

      sortedSubmissions.forEach(submission => {
        const submissionDate = new Date(submission.submittedAt);
        submissionDate.setHours(0, 0, 0, 0);

        if (lastDate) {
          const daysDiff = Math.floor((submissionDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === 1) {
            tempStreak++;
          } else if (daysDiff === 0) {
            // Same day, don't break streak
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        } else {
          tempStreak = 1;
        }

        lastDate = submissionDate;
      });

      longestStreak = Math.max(longestStreak, tempStreak);

      // Calculate current streak (only if recent activity)
      if (lastDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysSinceLastSubmission = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastSubmission <= 1) {
          currentStreak = tempStreak;
        }
      }

      // Get recent activity (last 10 submissions)
      const recentActivity = submissions.slice(0, 10);

      setAnalytics({
        totalSubmissions,
        averageScore: Math.round(averageScore),
        totalTimeSpent,
        completionRate: Math.round(completionRate),
        moduleProgress,
        recentActivity,
        streaks: {
          current: currentStreak,
          longest: longestStreak
        }
      });
    } catch (error) {
      console.error('Failed to calculate analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeSpent = (timeInMs: number): string => {
    const hours = Math.floor(timeInMs / 3600000);
    const minutes = Math.floor((timeInMs % 3600000) / 60000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <p className="text-gray-600">No exercise data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Exercise Analytics Overview</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{analytics.totalSubmissions}</div>
            <div className="text-sm text-gray-600 mt-1">Total Exercises</div>
          </div>
          
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(analytics.averageScore)}`}>
              {analytics.averageScore}/100
            </div>
            <div className="text-sm text-gray-600 mt-1">Average Score</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {formatTimeSpent(analytics.totalTimeSpent)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Time Spent</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{analytics.completionRate}%</div>
            <div className="text-sm text-gray-600 mt-1">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Streaks */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Streaks</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{analytics.streaks.current}</div>
            <div className="text-sm text-orange-700 mt-1">🔥 Current Streak</div>
            <div className="text-xs text-orange-600 mt-1">consecutive days</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{analytics.streaks.longest}</div>
            <div className="text-sm text-red-700 mt-1">🏆 Longest Streak</div>
            <div className="text-xs text-red-600 mt-1">consecutive days</div>
          </div>
        </div>
      </div>

      {/* Module Progress */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress by Module</h3>
        
        <div className="space-y-4">
          {Object.entries(analytics.moduleProgress).map(([moduleId, progress]) => {
            const progressPercentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
            const moduleNumber = moduleId.replace('module_', '');
            
            return (
              <div key={moduleId} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900">Module {moduleNumber}</div>
                  <div className="text-sm text-gray-600">
                    {progress.completed}/{progress.total} exercises
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(progressPercentage)}`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{Math.round(progressPercentage)}% complete</span>
                  {progress.completed > 0 && (
                    <span className={`font-medium ${getScoreColor(progress.averageScore)}`}>
                      Avg: {Math.round(progress.averageScore)}/100
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {analytics.recentActivity.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          
          <div className="space-y-3">
            {analytics.recentActivity.slice(0, 5).map((submission) => (
              <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    Exercise #{submission.exerciseId.split('_').pop()}
                  </div>
                  <div className="text-xs text-gray-600">
                    {submission.moduleId.replace('module_', 'Module ')} • {new Date(submission.submittedAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className={`text-sm font-medium ${getScoreColor(submission.score || 0)}`}>
                    {submission.score || 0}/100
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTimeSpent(submission.timeSpent)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseAnalytics;