import React, { useState } from 'react';

interface ReflectionExerciseProps {
  exerciseId: string;
  userId: string;
  onSubmit: (responses: Record<string, any>) => void;
  onCancel: () => void;
  config: {
    questions: string[];
  };
}

export const ReflectionExercise: React.FC<ReflectionExerciseProps> = ({
  exerciseId,
  userId,
  onSubmit,
  onCancel,
  config
}) => {
  const [responses, setResponses] = useState<Record<string, string>>(
    config.questions.reduce((acc, _, index) => {
      acc[`question_${index}`] = '';
      return acc;
    }, {} as Record<string, string>)
  );

  const handleResponseChange = (questionIndex: number, value: string) => {
    setResponses(prev => ({
      ...prev,
      [`question_${questionIndex}`]: value
    }));
  };

  const handleSubmit = () => {
    const submissionData = {
      responses,
      completedAt: new Date().toISOString(),
      totalWords: Object.values(responses).join(' ').split(' ').filter(word => word.length > 0).length
    };
    
    onSubmit(submissionData);
  };

  const isComplete = Object.values(responses).some(response => response.trim().length > 0);

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reflection Exercise</h2>
        <p className="text-gray-600">
          Take a moment to reflect on these questions. There are no right or wrong answers - 
          this is your personal journey of self-discovery.
        </p>
      </div>

      <div className="space-y-6">
        {config.questions.map((question, index) => (
          <div key={index} className="space-y-3">
            <label className="block text-sm font-medium text-gray-900">
              {index + 1}. {question}
            </label>
            <textarea
              rows={4}
              value={responses[`question_${index}`] || ''}
              onChange={(e) => handleResponseChange(index, e.target.value)}
              placeholder="Take your time to reflect and write your thoughts here..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="text-xs text-gray-500">
              {responses[`question_${index}`]?.length || 0} characters
            </div>
          </div>
        ))}
      </div>

      {/* Reflection Tips */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Reflection Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Be honest and authentic with yourself</li>
          <li>• There's no need to write perfect answers</li>
          <li>• Consider both current realities and future aspirations</li>
          <li>• Think about specific examples from your life</li>
          <li>• Use this as an opportunity for personal insight</li>
        </ul>
      </div>

      {/* Word Count Summary */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-600">
          Total words: {Object.values(responses).join(' ').split(' ').filter(word => word.length > 0).length}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isComplete}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Complete Reflection
        </button>
      </div>
    </div>
  );
};

export default ReflectionExercise;