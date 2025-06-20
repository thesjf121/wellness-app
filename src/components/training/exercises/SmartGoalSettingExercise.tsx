import React, { useState } from 'react';

interface SmartGoalSettingExerciseProps {
  exerciseId: string;
  userId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  config: {
    goalCategories?: string[];
    timeframes?: string[];
    timelines?: string[];
    successMetrics?: string[];
    challengeTypes?: string[];
  };
}

interface SmartGoal {
  id: string;
  category: string;
  title: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
  timeline: string;
  successMetrics: string[];
  potentialChallenges: string[];
  actionSteps: string[];
  accountability: string;
  motivation: string;
  progress: number;
}

export const SmartGoalSettingExercise: React.FC<SmartGoalSettingExerciseProps> = ({
  exerciseId,
  userId,
  onSubmit,
  onCancel,
  config
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);
  const [goals, setGoals] = useState<SmartGoal[]>([]);
  const [overallPlan, setOverallPlan] = useState('');
  const [reviewSchedule, setReviewSchedule] = useState('');
  const [adjustmentStrategy, setAdjustmentStrategy] = useState('');

  // Initialize with first goal
  React.useEffect(() => {
    const availableCategories = config?.goalCategories || ['Physical Health', 'Nutrition', 'Mental Wellbeing'];
    const availableTimeframes = config?.timeframes || config?.timelines || ['30 days', '90 days', '6 months'];
    
    if (goals.length === 0) {
      const initialGoal: SmartGoal = {
        id: 'goal_1',
        category: availableCategories[0] || 'Physical Health',
        title: '',
        specific: '',
        measurable: '',
        achievable: '',
        relevant: '',
        timeBound: '',
        timeline: availableTimeframes[0] || '30 days',
        successMetrics: [],
        potentialChallenges: [],
        actionSteps: [],
        accountability: '',
        motivation: '',
        progress: 0
      };
      setGoals([initialGoal]);
    }
  }, [config, goals.length]);

  const updateGoal = (index: number, field: keyof SmartGoal, value: any) => {
    const newGoals = [...goals];
    (newGoals[index] as any)[field] = value;
    setGoals(newGoals);
  };

  const addGoalItem = (goalIndex: number, field: 'successMetrics' | 'potentialChallenges' | 'actionSteps', item: string) => {
    if (item) {
      const newGoals = [...goals];
      newGoals[goalIndex][field].push(item);
      setGoals(newGoals);
    }
  };

  const removeGoalItem = (goalIndex: number, field: 'successMetrics' | 'potentialChallenges' | 'actionSteps', itemIndex: number) => {
    const newGoals = [...goals];
    newGoals[goalIndex][field].splice(itemIndex, 1);
    setGoals(newGoals);
  };

  const addGoal = () => {
    const availableCategories = config?.goalCategories || ['Physical Health', 'Nutrition', 'Mental Wellbeing'];
    const availableTimeframes = config?.timeframes || config?.timelines || ['30 days', '90 days', '6 months'];
    
    const newGoal: SmartGoal = {
      id: `goal_${goals.length + 1}`,
      category: availableCategories[0] || 'Physical Health',
      title: '',
      specific: '',
      measurable: '',
      achievable: '',
      relevant: '',
      timeBound: '',
      timeline: availableTimeframes[0] || '30 days',
      successMetrics: [],
      potentialChallenges: [],
      actionSteps: [],
      accountability: '',
      motivation: '',
      progress: 0
    };
    setGoals([...goals, newGoal]);
  };

  const removeGoal = (index: number) => {
    if (goals.length > 1) {
      setGoals(goals.filter((_, i) => i !== index));
      if (currentGoalIndex >= goals.length - 1) {
        setCurrentGoalIndex(Math.max(0, goals.length - 2));
      }
    }
  };

  const getSmartScore = (goal: SmartGoal): number => {
    if (!goal) return 0;
    const fields = ['specific', 'measurable', 'achievable', 'relevant', 'timeBound'];
    const completedFields = fields.filter(field => (goal as any)[field]?.trim()).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const handleComplete = () => {
    const data = {
      exerciseId,
      userId,
      goals,
      overallPlan,
      reviewSchedule,
      adjustmentStrategy,
      completedAt: new Date(),
      config
    };
    onSubmit(data);
  };

  if (currentStep === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🎯 SMART Wellness Goal Setting</h2>
          <p className="text-gray-600">
            Transform your wellness vision into specific, achievable SMART goals that drive real progress.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What Makes a Goal SMART?</h3>
            <ul className="text-blue-800 space-y-2 text-sm">
              <li><strong>Specific:</strong> Clear and well-defined</li>
              <li><strong>Measurable:</strong> Trackable with concrete metrics</li>
              <li><strong>Achievable:</strong> Realistic given your current situation</li>
              <li><strong>Relevant:</strong> Aligned with your values and vision</li>
              <li><strong>Time-bound:</strong> Has a clear deadline</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Goal Categories Available:</h3>
            <div className="grid grid-cols-2 gap-2">
              {(config?.goalCategories || ['Physical Health', 'Nutrition', 'Mental Wellbeing']).map((category, index) => (
                <div key={index} className="text-green-800 text-sm">
                  • {category}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">💡 Goal Setting Tips:</h3>
            <ul className="text-purple-800 space-y-1 text-sm">
              <li>• Start with 1-3 goals to maintain focus</li>
              <li>• Connect each goal to your deeper why</li>
              <li>• Break large goals into smaller milestones</li>
              <li>• Plan for obstacles and setbacks</li>
              <li>• Include accountability measures</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentStep(1)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Start Setting Goals
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
    const currentGoal = goals[currentGoalIndex];
    if (!currentGoal) {
      return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
          <div className="text-center">
            <p className="text-gray-600">Loading goal data...</p>
          </div>
        </div>
      );
    }
    const smartScore = getSmartScore(currentGoal);

    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Goal {currentGoalIndex + 1}: {currentGoal.title || 'Untitled Goal'}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              SMART Score: <span className={`font-bold ${smartScore >= 80 ? 'text-green-600' : smartScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {smartScore}%
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {currentGoalIndex + 1} of {goals.length}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Goal Basics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Category
              </label>
              <select
                value={currentGoal.category}
                onChange={(e) => updateGoal(currentGoalIndex, 'category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {(config?.goalCategories || ['Physical Health', 'Nutrition', 'Mental Wellbeing']).map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeline
              </label>
              <select
                value={currentGoal.timeline}
                onChange={(e) => updateGoal(currentGoalIndex, 'timeline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {(config?.timeframes || config?.timelines || ['30 days', '90 days', '6 months']).map((timeline) => (
                  <option key={timeline} value={timeline}>{timeline}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal Title *
            </label>
            <input
              type="text"
              value={currentGoal.title}
              onChange={(e) => updateGoal(currentGoalIndex, 'title', e.target.value)}
              placeholder="e.g., 'Establish consistent morning exercise routine'"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* SMART Criteria */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-900">SMART Criteria</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-blue-600">S</span>pecific: What exactly will you accomplish?
              </label>
              <textarea
                value={currentGoal.specific}
                onChange={(e) => updateGoal(currentGoalIndex, 'specific', e.target.value)}
                placeholder="Be clear and specific about what you want to achieve..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-green-600">M</span>easurable: How will you measure progress and success?
              </label>
              <textarea
                value={currentGoal.measurable}
                onChange={(e) => updateGoal(currentGoalIndex, 'measurable', e.target.value)}
                placeholder="Include specific numbers, frequencies, or metrics..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-yellow-600">A</span>chievable: Why is this goal realistic for you right now?
              </label>
              <textarea
                value={currentGoal.achievable}
                onChange={(e) => updateGoal(currentGoalIndex, 'achievable', e.target.value)}
                placeholder="Consider your current situation, resources, and constraints..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-purple-600">R</span>elevant: How does this goal connect to your wellness vision?
              </label>
              <textarea
                value={currentGoal.relevant}
                onChange={(e) => updateGoal(currentGoalIndex, 'relevant', e.target.value)}
                placeholder="Connect this goal to your values, vision, and overall wellness journey..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-600">T</span>ime-bound: What is your specific deadline?
              </label>
              <textarea
                value={currentGoal.timeBound}
                onChange={(e) => updateGoal(currentGoalIndex, 'timeBound', e.target.value)}
                placeholder="Set a clear deadline with milestones if needed..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Success Metrics */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Success Metrics: How will you track progress?
            </label>
            <div className="space-y-2 mb-3">
              {currentGoal.successMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                  <span className="text-sm text-blue-800">{metric}</span>
                  <button
                    onClick={() => removeGoalItem(currentGoalIndex, 'successMetrics', index)}
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
                placeholder="Add a success metric (e.g., 'Exercise 4 times per week')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addGoalItem(currentGoalIndex, 'successMetrics', (e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  addGoalItem(currentGoalIndex, 'successMetrics', input.value);
                  input.value = '';
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Add
              </button>
            </div>
          </div>

          {/* Potential Challenges */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Potential Challenges: What obstacles might you face?
            </label>
            <div className="space-y-2 mb-3">
              {currentGoal.potentialChallenges.map((challenge, index) => (
                <div key={index} className="flex items-center justify-between bg-yellow-50 p-2 rounded">
                  <span className="text-sm text-yellow-800">{challenge}</span>
                  <button
                    onClick={() => removeGoalItem(currentGoalIndex, 'potentialChallenges', index)}
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
                placeholder="Add a potential challenge (e.g., 'Busy work schedule')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addGoalItem(currentGoalIndex, 'potentialChallenges', (e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  addGoalItem(currentGoalIndex, 'potentialChallenges', input.value);
                  input.value = '';
                }}
                className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
              >
                Add
              </button>
            </div>
          </div>

          {/* Action Steps */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Steps: What specific steps will you take?
            </label>
            <div className="space-y-2 mb-3">
              {currentGoal.actionSteps.map((step, index) => (
                <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded">
                  <span className="text-sm text-green-800">{step}</span>
                  <button
                    onClick={() => removeGoalItem(currentGoalIndex, 'actionSteps', index)}
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
                placeholder="Add an action step (e.g., 'Block gym time in calendar every Sunday')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addGoalItem(currentGoalIndex, 'actionSteps', (e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  addGoalItem(currentGoalIndex, 'actionSteps', input.value);
                  input.value = '';
                }}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                Add
              </button>
            </div>
          </div>

          {/* Accountability & Motivation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accountability: Who or what will keep you accountable?
              </label>
              <textarea
                value={currentGoal.accountability}
                onChange={(e) => updateGoal(currentGoalIndex, 'accountability', e.target.value)}
                placeholder="e.g., 'Weekly check-ins with my workout partner'"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personal Motivation: Why is this goal important to you?
              </label>
              <textarea
                value={currentGoal.motivation}
                onChange={(e) => updateGoal(currentGoalIndex, 'motivation', e.target.value)}
                placeholder="Connect to your deeper why..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Goal Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentGoalIndex(Math.max(0, currentGoalIndex - 1))}
              disabled={currentGoalIndex === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous Goal
            </button>
            
            {goals.length > 1 && (
              <button
                onClick={() => removeGoal(currentGoalIndex)}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
              >
                Delete Goal
              </button>
            )}
          </div>

          <div className="text-center">
            <button
              onClick={addGoal}
              className="px-6 py-2 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-blue-600 hover:text-blue-700"
            >
              + Add Another Goal
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {currentGoalIndex < goals.length - 1 ? (
              <button
                onClick={() => setCurrentGoalIndex(currentGoalIndex + 1)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Next Goal →
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                Review & Plan →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📋 Goal Review & Implementation Plan</h2>
          <p className="text-gray-600">Review your goals and create a plan for success.</p>
        </div>

        <div className="space-y-6">
          {/* Goals Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your SMART Goals Summary</h3>
            <div className="space-y-4">
              {goals.map((goal, index) => {
                const smartScore = getSmartScore(goal);
                return (
                  <div key={goal.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        Goal {index + 1}: {goal.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-600">{goal.category}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          smartScore >= 80 ? 'bg-green-100 text-green-800' : 
                          smartScore >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {smartScore}% SMART
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{goal.specific}</p>
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Timeline:</span> {goal.timeline} • 
                      <span className="font-medium ml-2">Deadline:</span> {goal.timeBound}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overall Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Implementation Strategy
            </label>
            <textarea
              value={overallPlan}
              onChange={(e) => setOverallPlan(e.target.value)}
              placeholder="How will you approach working on these goals together? What's your overall strategy?"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Review Schedule */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Schedule: When will you check progress?
            </label>
            <textarea
              value={reviewSchedule}
              onChange={(e) => setReviewSchedule(e.target.value)}
              placeholder="e.g., 'Weekly review every Sunday evening, monthly deep review on the first of each month'"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Adjustment Strategy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adjustment Strategy: How will you adapt when things don't go as planned?
            </label>
            <textarea
              value={adjustmentStrategy}
              onChange={(e) => setAdjustmentStrategy(e.target.value)}
              placeholder="What's your plan for obstacles, setbacks, or when goals need to be modified?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-900 mb-2">🚀 Implementation Success Tips:</h3>
            <ul className="text-indigo-800 space-y-1 text-sm">
              <li>• Start with the smallest possible action to build momentum</li>
              <li>• Focus on systems and habits, not just outcomes</li>
              <li>• Celebrate small wins along the way</li>
              <li>• Be flexible and adjust goals as you learn and grow</li>
              <li>• Use your support system for accountability and encouragement</li>
              <li>• Track progress regularly but don't obsess over perfect compliance</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => setCurrentStep(1)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back to Goals
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Complete Goal Setting
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default SmartGoalSettingExercise;