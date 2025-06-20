import React, { useState } from 'react';

interface IfThenPlanningExerciseProps {
  exerciseId: string;
  userId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  config: {
    maxPlans: number;
    includesObstacles: boolean;
    categories: string[];
  };
}

interface IfThenPlan {
  id: string;
  category: string;
  type: 'habit_trigger' | 'obstacle_response' | 'recovery_plan';
  situation: string;
  response: string;
  specificity: number;
  confidence: number;
  notes: string;
}

interface PlanningTemplate {
  type: 'habit_trigger' | 'obstacle_response' | 'recovery_plan';
  title: string;
  description: string;
  examples: string[];
  prompts: {
    situation: string;
    response: string;
  };
}

export const IfThenPlanningExercise: React.FC<IfThenPlanningExerciseProps> = ({
  exerciseId,
  userId,
  onSubmit,
  onCancel,
  config
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  const [plans, setPlans] = useState<IfThenPlan[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PlanningTemplate | null>(null);
  const [insights, setInsights] = useState('');
  const [commitmentLevel, setCommitmentLevel] = useState(7);

  const planningTemplates: PlanningTemplate[] = [
    {
      type: 'habit_trigger',
      title: 'Habit Triggers',
      description: 'Create specific triggers to automatically start your new habits',
      examples: [
        'If I finish my morning coffee, then I will write in my gratitude journal',
        'If I sit down at my desk, then I will review my daily priorities',
        'If I get home from work, then I will change into workout clothes'
      ],
      prompts: {
        situation: 'When/where will this habit be triggered?',
        response: 'What exactly will you do?'
      }
    },
    {
      type: 'obstacle_response',
      title: 'Obstacle Responses',
      description: 'Plan how to handle common obstacles and temptations',
      examples: [
        'If I feel like skipping my workout, then I will commit to just 5 minutes',
        'If I want to eat junk food, then I will drink a glass of water first',
        'If I feel overwhelmed, then I will take 3 deep breaths and write down one priority'
      ],
      prompts: {
        situation: 'What obstacle or temptation might you face?',
        response: 'How will you respond to stay on track?'
      }
    },
    {
      type: 'recovery_plan',
      title: 'Recovery Plans',
      description: 'Bounce back quickly when you miss a habit or make a mistake',
      examples: [
        'If I miss my morning routine, then I will do a 2-minute version at lunch',
        'If I break my healthy eating streak, then I will plan a nutritious next meal',
        'If I skip meditation for 2 days, then I will do 1 minute before bed tonight'
      ],
      prompts: {
        situation: 'What setback or mistake might happen?',
        response: 'How will you get back on track immediately?'
      }
    }
  ];

  // Initialize with one plan
  React.useEffect(() => {
    if (plans.length === 0) {
      const initialPlan: IfThenPlan = {
        id: 'plan_1',
        category: config.categories[0],
        type: 'habit_trigger',
        situation: '',
        response: '',
        specificity: 5,
        confidence: 5,
        notes: ''
      };
      setPlans([initialPlan]);
      setSelectedTemplate(planningTemplates[0]);
    }
  }, [config.categories, plans.length]);

  const addPlan = (type: 'habit_trigger' | 'obstacle_response' | 'recovery_plan') => {
    if (plans.length < config.maxPlans) {
      const newPlan: IfThenPlan = {
        id: `plan_${plans.length + 1}`,
        category: config.categories[0],
        type,
        situation: '',
        response: '',
        specificity: 5,
        confidence: 5,
        notes: ''
      };
      setPlans([...plans, newPlan]);
      setCurrentPlanIndex(plans.length);
      setSelectedTemplate(planningTemplates.find(t => t.type === type) || planningTemplates[0]);
    }
  };

  const removePlan = (index: number) => {
    if (plans.length > 1) {
      const newPlans = plans.filter((_, i) => i !== index);
      setPlans(newPlans);
      if (currentPlanIndex >= newPlans.length) {
        setCurrentPlanIndex(Math.max(0, newPlans.length - 1));
      }
    }
  };

  const updatePlan = (index: number, field: keyof IfThenPlan, value: any) => {
    const newPlans = [...plans];
    (newPlans[index] as any)[field] = value;
    setPlans(newPlans);

    // Update template when type changes
    if (field === 'type') {
      const template = planningTemplates.find(t => t.type === value);
      if (template) setSelectedTemplate(template);
    }
  };

  const handleComplete = () => {
    const data = {
      exerciseId,
      userId,
      plans,
      insights,
      commitmentLevel,
      completedAt: new Date(),
      config
    };
    onSubmit(data);
  };

  const getSpecificityLabel = (level: number): string => {
    if (level <= 2) return 'Very Vague';
    if (level <= 4) return 'Somewhat Specific';
    if (level <= 6) return 'Moderately Specific';
    if (level <= 8) return 'Very Specific';
    return 'Extremely Specific';
  };

  const getConfidenceLabel = (level: number): string => {
    if (level <= 2) return 'Very Low';
    if (level <= 4) return 'Low';
    if (level <= 6) return 'Moderate';
    if (level <= 8) return 'High';
    return 'Very High';
  };

  const getScoreColor = (score: number): string => {
    if (score <= 3) return 'text-red-600';
    if (score <= 5) return 'text-yellow-600';
    if (score <= 7) return 'text-blue-600';
    return 'text-green-600';
  };

  if (currentStep === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🎯 If-Then Implementation Planning</h2>
          <p className="text-gray-600">
            Create specific if-then plans to automate your good habits and overcome obstacles.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">The Power of If-Then Planning</h3>
            <p className="text-blue-800 text-sm mb-3">
              Implementation intentions are specific plans that follow the format: <strong>"If X happens, then I will do Y."</strong>
            </p>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Increases follow-through by 200-300%</li>
              <li>• Removes decision-making in the moment</li>
              <li>• Creates automatic behavioral responses</li>
              <li>• Helps you prepare for obstacles in advance</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Three Types of Plans You'll Create:</h3>
            <div className="space-y-2 text-green-800 text-sm">
              <div><strong>🎯 Habit Triggers:</strong> Automatic cues to start good habits</div>
              <div><strong>🛡️ Obstacle Responses:</strong> How to handle temptations and barriers</div>
              <div><strong>🔄 Recovery Plans:</strong> Getting back on track after setbacks</div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">Examples of Effective If-Then Plans:</h3>
            <ul className="text-yellow-800 space-y-1 text-sm">
              <li>• "If I pour my morning coffee, then I will read one page of a book"</li>
              <li>• "If I feel stressed at work, then I will take 5 deep breaths"</li>
              <li>• "If I miss my workout, then I will do 10 push-ups before bed"</li>
              <li>• "If it's 7 PM on Sunday, then I will plan my meals for the week"</li>
            </ul>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">Keys to Success:</h3>
            <ul className="text-purple-800 space-y-1 text-sm">
              <li>• Be extremely specific about when and where</li>
              <li>• Choose realistic and achievable responses</li>
              <li>• Link new habits to existing routines</li>
              <li>• Practice visualizing the if-then scenario</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentStep(1)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Create If-Then Plans
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
    const currentPlan = plans[currentPlanIndex];
    const template = planningTemplates.find(t => t.type === currentPlan.type) || planningTemplates[0];
    
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            If-Then Plan #{currentPlanIndex + 1}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {currentPlanIndex + 1} of {plans.length}
            </div>
            <div className="flex space-x-2">
              <div className="relative">
                <select
                  onChange={(e) => addPlan(e.target.value as any)}
                  value=""
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <option value="">+ Add Plan</option>
                  <option value="habit_trigger">Habit Trigger</option>
                  <option value="obstacle_response">Obstacle Response</option>
                  <option value="recovery_plan">Recovery Plan</option>
                </select>
              </div>
              {plans.length > 1 && (
                <button
                  onClick={() => removePlan(currentPlanIndex)}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Plan Type and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Type
              </label>
              <select
                value={currentPlan.type}
                onChange={(e) => updatePlan(currentPlanIndex, 'type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="habit_trigger">🎯 Habit Trigger</option>
                <option value="obstacle_response">🛡️ Obstacle Response</option>
                <option value="recovery_plan">🔄 Recovery Plan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={currentPlan.category}
                onChange={(e) => updatePlan(currentPlanIndex, 'category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {config.categories.map(category => (
                  <option key={category} value={category}>
                    {category.replace('_', ' ').split(' ').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Template Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">{template.title}</h3>
            <p className="text-gray-700 text-sm mb-3">{template.description}</p>
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Examples:</div>
              {template.examples.map((example, index) => (
                <div key={index} className="text-sm text-gray-600 italic">
                  "{example}"
                </div>
              ))}
            </div>
          </div>

          {/* If-Then Structure */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-4">Create Your If-Then Plan</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  IF: {template.prompts.situation}
                </label>
                <input
                  type="text"
                  value={currentPlan.situation}
                  onChange={(e) => updatePlan(currentPlanIndex, 'situation', e.target.value)}
                  placeholder="Be as specific as possible about the time, place, or trigger..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="text-center text-blue-600 font-semibold">
                ↓ THEN ↓
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  THEN: {template.prompts.response}
                </label>
                <input
                  type="text"
                  value={currentPlan.response}
                  onChange={(e) => updatePlan(currentPlanIndex, 'response', e.target.value)}
                  placeholder="Describe exactly what you will do..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Preview */}
            {currentPlan.situation && currentPlan.response && (
              <div className="mt-4 p-3 bg-white rounded border-l-4 border-blue-500">
                <div className="text-sm font-medium text-gray-700">Your If-Then Plan:</div>
                <div className="text-gray-900 mt-1">
                  <strong>If</strong> {currentPlan.situation}, <strong>then</strong> {currentPlan.response}.
                </div>
              </div>
            )}
          </div>

          {/* Assessment Scales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How specific is this plan? (1 = Vague, 10 = Very Specific)
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">1</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentPlan.specificity}
                  onChange={(e) => updatePlan(currentPlanIndex, 'specificity', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500">10</span>
                <div className="ml-2 text-center">
                  <div className={`text-lg font-bold ${getScoreColor(currentPlan.specificity)}`}>
                    {currentPlan.specificity}
                  </div>
                  <div className="text-xs text-gray-600">
                    {getSpecificityLabel(currentPlan.specificity)}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How confident are you about following through? (1 = Very Low, 10 = Very High)
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">1</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentPlan.confidence}
                  onChange={(e) => updatePlan(currentPlanIndex, 'confidence', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500">10</span>
                <div className="ml-2 text-center">
                  <div className={`text-lg font-bold ${getScoreColor(currentPlan.confidence)}`}>
                    {currentPlan.confidence}
                  </div>
                  <div className="text-xs text-gray-600">
                    {getConfidenceLabel(currentPlan.confidence)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional notes or reminders:
            </label>
            <textarea
              value={currentPlan.notes}
              onChange={(e) => updatePlan(currentPlanIndex, 'notes', e.target.value)}
              placeholder="Any additional context, reminders, or details about this plan..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentPlanIndex(Math.max(0, currentPlanIndex - 1))}
            disabled={currentPlanIndex === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous Plan
          </button>
          
          {currentPlanIndex < plans.length - 1 ? (
            <button
              onClick={() => setCurrentPlanIndex(currentPlanIndex + 1)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Next Plan →
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              Review & Complete →
            </button>
          )}
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    const habitTriggers = plans.filter(p => p.type === 'habit_trigger');
    const obstacleResponses = plans.filter(p => p.type === 'obstacle_response');
    const recoveryPlans = plans.filter(p => p.type === 'recovery_plan');
    const averageSpecificity = plans.reduce((sum, p) => sum + p.specificity, 0) / plans.length;
    const averageConfidence = plans.reduce((sum, p) => sum + p.confidence, 0) / plans.length;
    
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📋 Your If-Then Implementation Plans</h2>
          <p className="text-gray-600">Review your plans and commit to putting them into action.</p>
        </div>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{plans.length}</div>
              <div className="text-sm text-blue-800">Total Plans</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{habitTriggers.length}</div>
              <div className="text-sm text-green-800">Habit Triggers</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className={`text-2xl font-bold ${getScoreColor(averageSpecificity)}`}>
                {averageSpecificity.toFixed(1)}
              </div>
              <div className="text-sm text-yellow-800">Avg Specificity</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className={`text-2xl font-bold ${getScoreColor(averageConfidence)}`}>
                {averageConfidence.toFixed(1)}
              </div>
              <div className="text-sm text-purple-800">Avg Confidence</div>
            </div>
          </div>

          {/* Plan Categories */}
          <div className="space-y-4">
            {habitTriggers.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-3">🎯 Habit Triggers</h3>
                {habitTriggers.map((plan, index) => (
                  <div key={plan.id} className="mb-2 p-3 bg-white rounded border">
                    <div className="text-green-800">
                      <strong>If</strong> {plan.situation}, <strong>then</strong> {plan.response}.
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      Specificity: {plan.specificity}/10 • Confidence: {plan.confidence}/10
                    </div>
                  </div>
                ))}
              </div>
            )}

            {obstacleResponses.length > 0 && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-900 mb-3">🛡️ Obstacle Responses</h3>
                {obstacleResponses.map((plan, index) => (
                  <div key={plan.id} className="mb-2 p-3 bg-white rounded border">
                    <div className="text-orange-800">
                      <strong>If</strong> {plan.situation}, <strong>then</strong> {plan.response}.
                    </div>
                    <div className="text-sm text-orange-600 mt-1">
                      Specificity: {plan.specificity}/10 • Confidence: {plan.confidence}/10
                    </div>
                  </div>
                ))}
              </div>
            )}

            {recoveryPlans.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">🔄 Recovery Plans</h3>
                {recoveryPlans.map((plan, index) => (
                  <div key={plan.id} className="mb-2 p-3 bg-white rounded border">
                    <div className="text-blue-800">
                      <strong>If</strong> {plan.situation}, <strong>then</strong> {plan.response}.
                    </div>
                    <div className="text-sm text-blue-600 mt-1">
                      Specificity: {plan.specificity}/10 • Confidence: {plan.confidence}/10
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Insights */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key insights from creating these if-then plans:
            </label>
            <textarea
              value={insights}
              onChange={(e) => setInsights(e.target.value)}
              placeholder="What did you learn about your habits and obstacles? Which plans feel most important? What surprised you?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Commitment Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How committed are you to using these if-then plans? (1 = Not at all, 10 = Extremely committed)
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">1</span>
              <input
                type="range"
                min="1"
                max="10"
                value={commitmentLevel}
                onChange={(e) => setCommitmentLevel(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-500">10</span>
              <div className="ml-2 text-center">
                <div className={`text-lg font-bold ${getScoreColor(commitmentLevel)}`}>
                  {commitmentLevel}
                </div>
                <div className="text-xs text-gray-600">
                  {getConfidenceLabel(commitmentLevel)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-900 mb-2">🚀 Next Steps for Success:</h3>
            <ul className="text-indigo-800 space-y-1 text-sm">
              <li>• Write your if-then plans where you'll see them daily</li>
              <li>• Practice visualizing the trigger scenarios in your mind</li>
              <li>• Start with your highest-confidence plans first</li>
              <li>• Adjust plans based on real-world experience</li>
              <li>• Review and update plans weekly for the first month</li>
              <li>• Celebrate when you successfully execute a plan</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => setCurrentStep(1)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back to Plans
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Complete If-Then Planning
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default IfThenPlanningExercise;