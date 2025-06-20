import React, { useState } from 'react';

interface WellnessPlanGeneratorExerciseProps {
  exerciseId: string;
  userId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  config: any;
}

export const WellnessPlanGeneratorExercise: React.FC<WellnessPlanGeneratorExerciseProps> = ({
  exerciseId,
  userId,
  onSubmit,
  onCancel,
  config
}) => {
  const [planType, setPlanType] = useState('comprehensive');
  const [planTitle, setPlanTitle] = useState('');
  const [planDescription, setPlanDescription] = useState('');

  const handleSubmit = () => {
    const data = {
      planType,
      planTitle,
      planDescription,
      completedAt: new Date()
    };
    onSubmit(data);
  };

  // Safe config access
  const planTypes = config?.planTypes || ['Comprehensive Plan', 'Focused Plan', 'Maintenance Plan', 'Intensive Plan'];
  const wellnessAreas = config?.wellnessAreas || ['Physical Health', 'Nutrition', 'Mental Health', 'Emotional Wellness'];

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🌟 Integrated Wellness Plan Generator</h2>
        <p className="text-gray-600">
          Create a comprehensive, personalized wellness plan that integrates all areas of your well-being.
        </p>
      </div>

      <div className="space-y-6">
        {/* Plan Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plan Type
          </label>
          <select
            value={planType}
            onChange={(e) => setPlanType(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {planTypes.map((type: string) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Plan Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plan Title
          </label>
          <input
            type="text"
            value={planTitle}
            onChange={(e) => setPlanTitle(e.target.value)}
            placeholder="Enter a title for your wellness plan"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Plan Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plan Description
          </label>
          <textarea
            rows={4}
            value={planDescription}
            onChange={(e) => setPlanDescription(e.target.value)}
            placeholder="Describe your wellness goals and approach"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Wellness Areas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wellness Areas to Focus On
          </label>
          <div className="grid grid-cols-2 gap-3">
            {wellnessAreas.map((area: string, index: number) => (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  id={`area-${index}`}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`area-${index}`} className="ml-2 block text-sm text-gray-900">
                  {area}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!planTitle || !planDescription}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Complete Exercise
        </button>
      </div>
    </div>
  );
};

export default WellnessPlanGeneratorExercise;