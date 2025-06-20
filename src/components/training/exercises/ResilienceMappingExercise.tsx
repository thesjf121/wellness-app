import React, { useState } from 'react';

interface ResilienceMappingExerciseProps {
  exerciseId: string;
  userId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  config: {
    resilienceAreas: string[];
    includesActionPlan: boolean;
    includesGoalSetting: boolean;
  };
}

interface ResilienceRating {
  area: string;
  currentRating: number;
  targetRating: number;
  strengths: string[];
  challenges: string[];
  actions: string[];
}

export const ResilienceMappingExercise: React.FC<ResilienceMappingExerciseProps> = ({
  exerciseId,
  userId,
  onSubmit,
  onCancel,
  config
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
  const [resilienceRatings, setResilienceRatings] = useState<ResilienceRating[]>([]);
  const [overallReflection, setOverallReflection] = useState('');
  const [topPriorities, setTopPriorities] = useState<string[]>([]);
  const [actionPlan, setActionPlan] = useState('');

  // Initialize resilience ratings
  React.useEffect(() => {
    if (resilienceRatings.length === 0) {
      const ratings = config.resilienceAreas.map(area => ({
        area,
        currentRating: 5,
        targetRating: 7,
        strengths: [],
        challenges: [],
        actions: []
      }));
      setResilienceRatings(ratings);
    }
  }, [config.resilienceAreas, resilienceRatings.length]);

  const updateRating = (index: number, field: keyof ResilienceRating, value: any) => {
    const newRatings = [...resilienceRatings];
    (newRatings[index] as any)[field] = value;
    setResilienceRatings(newRatings);
  };

  const addArrayItem = (index: number, field: 'strengths' | 'challenges' | 'actions', item: string) => {
    if (item) {
      const newRatings = [...resilienceRatings];
      (newRatings[index][field] as string[]).push(item);
      setResilienceRatings(newRatings);
    }
  };

  const removeArrayItem = (index: number, field: 'strengths' | 'challenges' | 'actions', itemIndex: number) => {
    const newRatings = [...resilienceRatings];
    (newRatings[index][field] as string[]).splice(itemIndex, 1);
    setResilienceRatings(newRatings);
  };

  const addPriority = (area: string) => {
    if (!topPriorities.includes(area) && topPriorities.length < 3) {
      setTopPriorities([...topPriorities, area]);
    }
  };

  const removePriority = (area: string) => {
    setTopPriorities(topPriorities.filter(p => p !== area));
  };

  const handleComplete = () => {
    const data = {
      exerciseId,
      userId,
      resilienceRatings,
      overallReflection,
      topPriorities,
      actionPlan,
      completedAt: new Date(),
      config
    };
    onSubmit(data);
  };

  const getAreaDescription = (area: string): string => {
    const descriptions: Record<string, string> = {
      'Emotional Regulation': 'Your ability to manage and respond to intense emotions in healthy ways',
      'Social Support': 'The strength of your relationships and support network',
      'Problem-Solving': 'Your capacity to find solutions and navigate challenges effectively',
      'Adaptability': 'How well you adjust to change and unexpected situations',
      'Self-Care': 'Your commitment to maintaining physical, mental, and emotional well-being',
      'Optimism': 'Your ability to maintain hope and positive outlook during difficulties',
      'Self-Efficacy': 'Your confidence in your ability to handle challenges and achieve goals',
      'Meaning & Purpose': 'Your sense of direction, values, and purpose in life'
    };
    return descriptions[area] || 'An important aspect of mental resilience';
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 8) return 'text-green-600';
    if (rating >= 6) return 'text-yellow-600';
    if (rating >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  if (currentStep === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🏗️ Personal Resilience Assessment</h2>
          <p className="text-gray-600">
            Assess your current resilience strengths and create a plan for building mental resilience.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What is Resilience?</h3>
            <p className="text-blue-800 text-sm">
              Resilience is your ability to adapt and bounce back from adversity, trauma, or significant stress. 
              It's not about avoiding difficulties, but developing skills to navigate them effectively and grow stronger.
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Resilience Areas We'll Assess:</h3>
            <div className="space-y-2">
              {config.resilienceAreas.map((area, index) => (
                <div key={index} className="text-green-800 text-sm">
                  <strong>{area}:</strong> {getAreaDescription(area)}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">What You'll Do:</h3>
            <ul className="text-purple-800 space-y-1 text-sm">
              <li>• Rate your current level in each resilience area (1-10)</li>
              <li>• Identify your strengths and challenges</li>
              <li>• Set target goals for improvement</li>
              <li>• Create specific action steps</li>
              <li>• Develop a personalized resilience-building plan</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentStep(1)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Start Resilience Assessment
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 1) {
    const currentRating = resilienceRatings[currentAreaIndex];
    
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {currentRating?.area}
          </h2>
          <div className="text-sm text-gray-600">
            {currentAreaIndex + 1} of {config.resilienceAreas.length}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-blue-800">{getAreaDescription(currentRating?.area || '')}</p>
        </div>

        <div className="space-y-6">
          {/* Current Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Level: How would you rate yourself in this area? (1 = Very Low, 10 = Excellent)
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">1</span>
              <input
                type="range"
                min="1"
                max="10"
                value={currentRating?.currentRating || 5}
                onChange={(e) => updateRating(currentAreaIndex, 'currentRating', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-500">10</span>
              <span className={`text-lg font-bold ml-2 ${getRatingColor(currentRating?.currentRating || 5)}`}>
                {currentRating?.currentRating || 5}
              </span>
            </div>
          </div>

          {/* Target Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Level: Where would you like to be in this area? (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">1</span>
              <input
                type="range"
                min="1"
                max="10"
                value={currentRating?.targetRating || 7}
                onChange={(e) => updateRating(currentAreaIndex, 'targetRating', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-500">10</span>
              <span className={`text-lg font-bold ml-2 ${getRatingColor(currentRating?.targetRating || 7)}`}>
                {currentRating?.targetRating || 7}
              </span>
            </div>
          </div>

          {/* Strengths */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What are your current strengths in this area?
            </label>
            <div className="space-y-2 mb-3">
              {currentRating?.strengths.map((strength, index) => (
                <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded">
                  <span className="text-sm text-green-800">{strength}</span>
                  <button
                    onClick={() => removeArrayItem(currentAreaIndex, 'strengths', index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add a strength (e.g., 'I stay calm under pressure')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addArrayItem(currentAreaIndex, 'strengths', (e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  addArrayItem(currentAreaIndex, 'strengths', input.value);
                  input.value = '';
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Challenges */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What challenges do you face in this area?
            </label>
            <div className="space-y-2 mb-3">
              {currentRating?.challenges.map((challenge, index) => (
                <div key={index} className="flex items-center justify-between bg-red-50 p-2 rounded">
                  <span className="text-sm text-red-800">{challenge}</span>
                  <button
                    onClick={() => removeArrayItem(currentAreaIndex, 'challenges', index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add a challenge (e.g., 'I get overwhelmed easily')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addArrayItem(currentAreaIndex, 'challenges', (e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  addArrayItem(currentAreaIndex, 'challenges', input.value);
                  input.value = '';
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Action Steps */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What specific actions could help you improve in this area?
            </label>
            <div className="space-y-2 mb-3">
              {currentRating?.actions.map((action, index) => (
                <div key={index} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                  <span className="text-sm text-blue-800">{action}</span>
                  <button
                    onClick={() => removeArrayItem(currentAreaIndex, 'actions', index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add an action step (e.g., 'Practice deep breathing daily')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addArrayItem(currentAreaIndex, 'actions', (e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  addArrayItem(currentAreaIndex, 'actions', input.value);
                  input.value = '';
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentAreaIndex(Math.max(0, currentAreaIndex - 1))}
            disabled={currentAreaIndex === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous Area
          </button>
          
          {currentAreaIndex < config.resilienceAreas.length - 1 ? (
            <button
              onClick={() => setCurrentAreaIndex(currentAreaIndex + 1)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Next Area →
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              Create Action Plan →
            </button>
          )}
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    const averageRating = resilienceRatings.reduce((sum, rating) => sum + rating.currentRating, 0) / resilienceRatings.length;
    const lowestAreas = resilienceRatings
      .sort((a, b) => a.currentRating - b.currentRating)
      .slice(0, 3);

    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 Your Resilience Profile</h2>
          <p className="text-gray-600">Review your assessment and create your action plan.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className={`text-2xl font-bold ${getRatingColor(averageRating)}`}>
              {averageRating.toFixed(1)}
            </div>
            <div className="text-sm text-blue-800">Overall Resilience Score</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {resilienceRatings.filter(r => r.currentRating >= 7).length}
            </div>
            <div className="text-sm text-green-800">Strong Areas</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {resilienceRatings.filter(r => r.currentRating < 6).length}
            </div>
            <div className="text-sm text-yellow-800">Growth Opportunities</div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Priority Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select your top 3 priority areas for improvement:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lowestAreas.map((rating) => {
                const isSelected = topPriorities.includes(rating.area);
                return (
                  <button
                    key={rating.area}
                    onClick={() => {
                      if (isSelected) {
                        removePriority(rating.area);
                      } else {
                        addPriority(rating.area);
                      }
                    }}
                    disabled={!isSelected && topPriorities.length >= 3}
                    className={`p-3 rounded border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-100 border-blue-300 text-blue-800'
                        : topPriorities.length >= 3
                          ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{rating.area}</div>
                    <div className="text-sm opacity-75">Current: {rating.currentRating}/10</div>
                  </button>
                );
              })}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Selected: {topPriorities.length}/3
            </div>
          </div>

          {/* Overall Reflection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall reflection on your resilience assessment:
            </label>
            <textarea
              value={overallReflection}
              onChange={(e) => setOverallReflection(e.target.value)}
              placeholder="What surprised you about your assessment? What patterns do you notice? How do these areas connect to your life experiences?"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Action Plan */}
          {config.includesActionPlan && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Create your resilience-building action plan:
              </label>
              <textarea
                value={actionPlan}
                onChange={(e) => setActionPlan(e.target.value)}
                placeholder="Based on your priority areas, what specific steps will you take? What resources do you need? How will you track progress?"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">🌟 Building Resilience Takes Time</h3>
            <ul className="text-purple-800 space-y-1 text-sm">
              <li>• Focus on 1-2 areas at a time for sustainable progress</li>
              <li>• Practice new skills consistently—small daily actions add up</li>
              <li>• Be patient with yourself—resilience develops gradually</li>
              <li>• Celebrate small improvements and progress milestones</li>
              <li>• Reassess your resilience regularly to track growth</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => setCurrentStep(1)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back to Assessment
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Complete Resilience Assessment
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default ResilienceMappingExercise;