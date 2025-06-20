import React, { useState, useEffect } from 'react';
import { ExerciseSubmission } from '../../types/training';
import { wellnessTrainingService } from '../../services/wellnessTrainingService';

interface ExerciseSubmissionHistoryProps {
  userId: string;
  moduleId?: string;
  exerciseId?: string;
  onClose: () => void;
}

export const ExerciseSubmissionHistory: React.FC<ExerciseSubmissionHistoryProps> = ({
  userId,
  moduleId,
  exerciseId,
  onClose
}) => {
  const [submissions, setSubmissions] = useState<ExerciseSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ExerciseSubmission | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, [userId, moduleId, exerciseId]);

  const loadSubmissions = () => {
    setLoading(true);
    try {
      const userSubmissions = wellnessTrainingService.getExerciseSubmissions(userId, moduleId, exerciseId);
      setSubmissions(userSubmissions);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number): string => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-blue-100 text-blue-800';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatTimeSpent = (timeInMs: number): string => {
    const minutes = Math.floor(timeInMs / 60000);
    const seconds = Math.floor((timeInMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading submission history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Exercise Submission History
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Submissions List */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-4">
                Submissions ({submissions.length})
              </h3>
              
              {submissions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📝</div>
                  <p className="text-gray-600">No submissions found</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Complete some exercises to see your submission history
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      onClick={() => setSelectedSubmission(submission)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedSubmission?.id === submission.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-900">
                          Exercise #{submission.exerciseId.split('_').pop()}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreBadgeColor(submission.score || 0)}`}>
                          {submission.score || 0}/100
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>📅 {new Date(submission.submittedAt).toLocaleDateString()} at {new Date(submission.submittedAt).toLocaleTimeString()}</div>
                        <div>⏱️ Time spent: {formatTimeSpent(submission.timeSpent)}</div>
                        <div>📊 Module: {submission.moduleId.replace('module_', 'Module ')}</div>
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500 line-clamp-2">
                        {submission.feedback}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submission Details */}
          <div className="w-1/2 overflow-y-auto">
            <div className="p-4">
              {selectedSubmission ? (
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Submission Details</h3>
                  
                  {/* Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-600 uppercase tracking-wide">Score</div>
                        <div className={`text-2xl font-bold ${getScoreColor(selectedSubmission.score || 0)}`}>
                          {selectedSubmission.score || 0}/100
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 uppercase tracking-wide">Time Spent</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatTimeSpent(selectedSubmission.timeSpent)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 uppercase tracking-wide">Submitted</div>
                        <div className="text-sm text-gray-900">
                          {new Date(selectedSubmission.submittedAt).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 uppercase tracking-wide">Exercise ID</div>
                        <div className="text-sm text-gray-900 font-mono">
                          {selectedSubmission.exerciseId}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Feedback</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800">{selectedSubmission.feedback}</p>
                    </div>
                  </div>

                  {/* Responses */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Your Responses</h4>
                    <div className="space-y-4">
                      {Object.entries(selectedSubmission.responses).map(([key, value]) => {
                        if (key === 'timeSpent' || key === 'completedAt') return null;
                        
                        return (
                          <div key={key} className="border border-gray-200 rounded-lg p-3">
                            <div className="text-sm font-medium text-gray-700 mb-1 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </div>
                            <div className="text-gray-900">
                              {Array.isArray(value) ? (
                                <ul className="list-disc list-inside space-y-1">
                                  {value.map((item, index) => (
                                    <li key={index}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
                                  ))}
                                </ul>
                              ) : typeof value === 'object' ? (
                                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                  {JSON.stringify(value, null, 2)}
                                </pre>
                              ) : (
                                <p className="whitespace-pre-wrap">{String(value)}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-gray-400 text-4xl mb-4">👈</div>
                    <p className="text-gray-600">Select a submission to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {submissions.length > 0 && (
                <>
                  Average Score: {Math.round(submissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / submissions.length)}/100
                  {' • '}
                  Total Time: {formatTimeSpent(submissions.reduce((sum, sub) => sum + sub.timeSpent, 0))}
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseSubmissionHistory;