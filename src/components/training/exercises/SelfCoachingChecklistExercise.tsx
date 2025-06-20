import React, { useState } from 'react';

interface SelfCoachingChecklistExerciseProps {
  exerciseId: string;
  userId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  config: {
    assessmentAreas: string[];
    includesActionPlan: boolean;
    reviewFrequency: string;
  };
}

interface AssessmentItem {
  id: string;
  area: string;
  question: string;
  currentRating: number;
  importance: number;
  confidence: number;
  notes: string;
  actionSteps: string[];
}

interface MotivationSource {
  id: string;
  type: 'intrinsic' | 'extrinsic';
  description: string;
  strength: number;
  reliability: number;
  enhancement: string;
}

export const SelfCoachingChecklistExercise: React.FC<SelfCoachingChecklistExerciseProps> = ({
  exerciseId,
  userId,
  onSubmit,
  onCancel,
  config
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
  const [assessmentItems, setAssessmentItems] = useState<AssessmentItem[]>([]);
  const [motivationSources, setMotivationSources] = useState<MotivationSource[]>([]);
  const [overallInsights, setOverallInsights] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [motivationChallenges, setMotivationChallenges] = useState<string[]>([]);
  const [supportSystems, setSupportSystems] = useState<string[]>([]);

  const assessmentQuestions: Record<string, string[]> = {
    values_alignment: [
      'My wellness goals align with my core personal values',
      'I understand why my wellness journey matters to me personally',
      'My daily actions reflect my stated wellness priorities',
      'I feel internally motivated to pursue my wellness goals'
    ],
    progress_tracking: [
      'I have clear metrics for measuring my wellness progress',
      'I regularly review and celebrate my progress',
      'I adjust my approach based on what the data tells me',
      'I can see meaningful progress toward my goals'
    ],
    reward_systems: [
      'I regularly acknowledge and celebrate my wellness wins',
      'I have meaningful rewards for reaching milestones',
      'My reward system motivates rather than undermines my goals',
      'I find intrinsic satisfaction in my wellness practices'
    ],
    social_support: [
      'I have people who support and encourage my wellness journey',
      'I feel comfortable sharing my struggles and successes',
      'My social environment supports my healthy choices',
      'I have accountability partners or systems in place'
    ],
    purpose_connection: [
      'I understand how my wellness connects to my life purpose',
      'My wellness goals serve something larger than myself',
      'I can articulate why my wellness matters for my future',
      'I feel energized when I think about my wellness vision'
    ]
  };

  // Initialize assessment items
  React.useEffect(() => {
    if (assessmentItems.length === 0) {
      const items: AssessmentItem[] = [];
      config.assessmentAreas.forEach(area => {
        const questions = assessmentQuestions[area] || [];
        questions.forEach((question, index) => {
          items.push({
            id: `${area}_${index}`,
            area,
            question,
            currentRating: 5,
            importance: 7,
            confidence: 6,
            notes: '',
            actionSteps: []
          });
        });
      });
      setAssessmentItems(items);
    }
  }, [config.assessmentAreas, assessmentItems.length]);

  // Initialize motivation sources
  React.useEffect(() => {
    if (motivationSources.length === 0) {
      const defaultSources: MotivationSource[] = [
        {
          id: 'intrinsic_1',
          type: 'intrinsic',
          description: '',
          strength: 5,
          reliability: 5,
          enhancement: ''
        },
        {
          id: 'extrinsic_1', 
          type: 'extrinsic',
          description: '',
          strength: 5,
          reliability: 5,
          enhancement: ''
        }
      ];
      setMotivationSources(defaultSources);
    }
  }, [motivationSources.length]);

  const updateAssessmentItem = (index: number, field: keyof AssessmentItem, value: any) => {
    const newItems = [...assessmentItems];
    (newItems[index] as any)[field] = value;
    setAssessmentItems(newItems);
  };

  const addActionStep = (itemIndex: number, step: string) => {
    if (step) {
      const newItems = [...assessmentItems];
      newItems[itemIndex].actionSteps.push(step);
      setAssessmentItems(newItems);
    }
  };

  const removeActionStep = (itemIndex: number, stepIndex: number) => {
    const newItems = [...assessmentItems];
    newItems[itemIndex].actionSteps.splice(stepIndex, 1);
    setAssessmentItems(newItems);
  };

  const updateMotivationSource = (index: number, field: keyof MotivationSource, value: any) => {
    const newSources = [...motivationSources];
    (newSources[index] as any)[field] = value;
    setMotivationSources(newSources);
  };

  const addMotivationSource = (type: 'intrinsic' | 'extrinsic') => {
    const newSource: MotivationSource = {
      id: `${type}_${motivationSources.length + 1}`,
      type,
      description: '',
      strength: 5,
      reliability: 5,
      enhancement: ''
    };
    setMotivationSources([...motivationSources, newSource]);
  };

  const removeMotivationSource = (index: number) => {
    if (motivationSources.length > 2) {
      setMotivationSources(motivationSources.filter((_, i) => i !== index));
    }
  };

  const addChallenge = (challenge: string) => {
    if (challenge && !motivationChallenges.includes(challenge)) {
      setMotivationChallenges([...motivationChallenges, challenge]);
    }
  };

  const removeChallenge = (index: number) => {
    setMotivationChallenges(motivationChallenges.filter((_, i) => i !== index));
  };

  const addSupport = (support: string) => {
    if (support && !supportSystems.includes(support)) {
      setSupportSystems([...supportSystems, support]);
    }
  };

  const removeSupport = (index: number) => {
    setSupportSystems(supportSystems.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    const data = {
      exerciseId,
      userId,
      assessmentItems,
      motivationSources,
      overallInsights,
      actionPlan,
      motivationChallenges,
      supportSystems,
      reviewFrequency: config.reviewFrequency,
      completedAt: new Date(),
      config
    };
    onSubmit(data);
  };

  const getAreaTitle = (area: string): string => {
    const titles: Record<string, string> = {
      values_alignment: 'Values Alignment',
      progress_tracking: 'Progress Tracking',
      reward_systems: 'Reward Systems',
      social_support: 'Social Support',
      purpose_connection: 'Purpose Connection'
    };
    return titles[area] || area.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getAreaIcon = (area: string): string => {
    const icons: Record<string, string> = {
      values_alignment: '⭐',
      progress_tracking: '📊',
      reward_systems: '🎁',
      social_support: '👥',
      purpose_connection: '🎯'
    };
    return icons[area] || '📋';
  };

  const getRatingColor = (rating: number): string => {
    if (rating <= 3) return 'text-red-600';
    if (rating <= 5) return 'text-yellow-600';
    if (rating <= 7) return 'text-blue-600';
    return 'text-green-600';
  };

  const getRatingLabel = (rating: number): string => {
    if (rating <= 2) return 'Very Low';
    if (rating <= 4) return 'Low';
    if (rating <= 6) return 'Moderate';
    if (rating <= 8) return 'High';
    return 'Very High';
  };

  const getCurrentAreaItems = () => {
    const currentArea = config.assessmentAreas[currentAreaIndex];
    return assessmentItems.filter(item => item.area === currentArea);
  };

  if (currentStep === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🎯 Personal Motivation Assessment</h2>
          <p className="text-gray-600">
            Evaluate your motivation sources and create a system for sustained wellness commitment.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Why Assess Your Motivation?</h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• <strong>Awareness:</strong> Understand what truly drives your wellness choices</li>
              <li>• <strong>Sustainability:</strong> Build motivation systems that last long-term</li>
              <li>• <strong>Optimization:</strong> Strengthen your most reliable motivation sources</li>
              <li>• <strong>Prevention:</strong> Prepare for motivation dips and challenges</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Assessment Areas:</h3>
            <div className="space-y-2">
              {config.assessmentAreas.map((area, index) => (
                <div key={index} className="flex items-center text-green-800 text-sm">
                  <span className="mr-2">{getAreaIcon(area)}</span>
                  <span><strong>{getAreaTitle(area)}</strong></span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">💡 Assessment Guidelines:</h3>
            <ul className="text-yellow-800 space-y-1 text-sm">
              <li>• Be honest about your current state, not where you want to be</li>
              <li>• Consider both intrinsic (internal) and extrinsic (external) motivations</li>
              <li>• Think about what's worked in the past and what hasn't</li>
              <li>• Focus on building systems, not just identifying problems</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentStep(1)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Begin Assessment
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
    const currentArea = config.assessmentAreas[currentAreaIndex];
    const areaItems = getCurrentAreaItems();
    
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {getAreaIcon(currentArea)} {getAreaTitle(currentArea)}
          </h2>
          <div className="text-sm text-gray-600">
            {currentAreaIndex + 1} of {config.assessmentAreas.length}
          </div>
        </div>

        <div className="space-y-6">
          {areaItems.map((item, index) => {
            const itemIndex = assessmentItems.findIndex(i => i.id === item.id);
            return (
              <div key={item.id} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-4">{item.question}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Current Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Rating (1-10)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={item.currentRating}
                        onChange={(e) => updateAssessmentItem(itemIndex, 'currentRating', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className={`text-lg font-bold ${getRatingColor(item.currentRating)} min-w-8`}>
                        {item.currentRating}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {getRatingLabel(item.currentRating)}
                    </div>
                  </div>

                  {/* Importance */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Importance (1-10)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={item.importance}
                        onChange={(e) => updateAssessmentItem(itemIndex, 'importance', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className={`text-lg font-bold ${getRatingColor(item.importance)} min-w-8`}>
                        {item.importance}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      How important this is to you
                    </div>
                  </div>

                  {/* Confidence */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confidence (1-10)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={item.confidence}
                        onChange={(e) => updateAssessmentItem(itemIndex, 'confidence', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className={`text-lg font-bold ${getRatingColor(item.confidence)} min-w-8`}>
                        {item.confidence}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      How confident you are in improving
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes & Observations:
                  </label>
                  <textarea
                    value={item.notes}
                    onChange={(e) => updateAssessmentItem(itemIndex, 'notes', e.target.value)}
                    placeholder="What specifically affects this area? What patterns do you notice?"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Action Steps */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Potential Action Steps:
                  </label>
                  <div className="space-y-2 mb-3">
                    {item.actionSteps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                        <span className="text-sm text-blue-800">{step}</span>
                        <button
                          onClick={() => removeActionStep(itemIndex, stepIndex)}
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
                      placeholder="Add an action step to improve this area..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addActionStep(itemIndex, (e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                        addActionStep(itemIndex, input.value);
                        input.value = '';
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentAreaIndex(Math.max(0, currentAreaIndex - 1))}
            disabled={currentAreaIndex === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous Area
          </button>
          
          {currentAreaIndex < config.assessmentAreas.length - 1 ? (
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
              Motivation Sources →
            </button>
          )}
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">💪 Your Motivation Sources</h2>
          <p className="text-gray-600">Identify and strengthen what truly motivates your wellness journey.</p>
        </div>

        <div className="space-y-6">
          {/* Motivation Sources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Intrinsic Sources */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-3">🌱 Intrinsic Motivations</h3>
              <p className="text-green-800 text-sm mb-4">Internal satisfaction, personal values, enjoyment</p>
              {motivationSources.filter(s => s.type === 'intrinsic').map((source, index) => {
                const sourceIndex = motivationSources.findIndex(s => s.id === source.id);
                return (
                  <div key={source.id} className="space-y-3 mb-4 p-3 bg-white rounded border">
                    <div>
                      <input
                        type="text"
                        value={source.description}
                        onChange={(e) => updateMotivationSource(sourceIndex, 'description', e.target.value)}
                        placeholder="e.g., 'I feel energized and confident when I exercise'"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600">Strength (1-10)</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={source.strength}
                          onChange={(e) => updateMotivationSource(sourceIndex, 'strength', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <span className="text-xs font-bold">{source.strength}</span>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Reliability (1-10)</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={source.reliability}
                          onChange={(e) => updateMotivationSource(sourceIndex, 'reliability', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <span className="text-xs font-bold">{source.reliability}</span>
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={source.enhancement}
                        onChange={(e) => updateMotivationSource(sourceIndex, 'enhancement', e.target.value)}
                        placeholder="How could you strengthen this motivation?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    {motivationSources.filter(s => s.type === 'intrinsic').length > 1 && (
                      <button
                        onClick={() => removeMotivationSource(sourceIndex)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
              <button
                onClick={() => addMotivationSource('intrinsic')}
                className="w-full py-2 border-2 border-dashed border-green-300 rounded text-green-700 hover:bg-green-100 text-sm"
              >
                + Add Intrinsic Motivation
              </button>
            </div>

            {/* Extrinsic Sources */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3">🏆 Extrinsic Motivations</h3>
              <p className="text-blue-800 text-sm mb-4">External rewards, social approval, consequences</p>
              {motivationSources.filter(s => s.type === 'extrinsic').map((source, index) => {
                const sourceIndex = motivationSources.findIndex(s => s.id === source.id);
                return (
                  <div key={source.id} className="space-y-3 mb-4 p-3 bg-white rounded border">
                    <div>
                      <input
                        type="text"
                        value={source.description}
                        onChange={(e) => updateMotivationSource(sourceIndex, 'description', e.target.value)}
                        placeholder="e.g., 'My workout buddy expects me to show up'"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600">Strength (1-10)</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={source.strength}
                          onChange={(e) => updateMotivationSource(sourceIndex, 'strength', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <span className="text-xs font-bold">{source.strength}</span>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Reliability (1-10)</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={source.reliability}
                          onChange={(e) => updateMotivationSource(sourceIndex, 'reliability', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <span className="text-xs font-bold">{source.reliability}</span>
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={source.enhancement}
                        onChange={(e) => updateMotivationSource(sourceIndex, 'enhancement', e.target.value)}
                        placeholder="How could you strengthen this motivation?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    {motivationSources.filter(s => s.type === 'extrinsic').length > 1 && (
                      <button
                        onClick={() => removeMotivationSource(sourceIndex)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
              <button
                onClick={() => addMotivationSource('extrinsic')}
                className="w-full py-2 border-2 border-dashed border-blue-300 rounded text-blue-700 hover:bg-blue-100 text-sm"
              >
                + Add Extrinsic Motivation
              </button>
            </div>
          </div>

          {/* Challenges */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What typically challenges or undermines your motivation?
            </label>
            <div className="space-y-2 mb-3">
              {motivationChallenges.map((challenge, index) => (
                <div key={index} className="flex items-center justify-between bg-red-50 p-2 rounded">
                  <span className="text-sm text-red-800">{challenge}</span>
                  <button
                    onClick={() => removeChallenge(index)}
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
                placeholder="Add a motivation challenge (e.g., 'Stress at work', 'Lack of time', 'Social pressure')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addChallenge((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  addChallenge(input.value);
                  input.value = '';
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Support Systems */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What support systems help maintain your motivation?
            </label>
            <div className="space-y-2 mb-3">
              {supportSystems.map((support, index) => (
                <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded">
                  <span className="text-sm text-green-800">{support}</span>
                  <button
                    onClick={() => removeSupport(index)}
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
                placeholder="Add a support system (e.g., 'Family encouragement', 'Fitness app', 'Online community')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addSupport((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  addSupport(input.value);
                  input.value = '';
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add
              </button>
            </div>
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
            onClick={() => setCurrentStep(3)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Create Action Plan →
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 3) {
    const averageRating = assessmentItems.reduce((sum, item) => sum + item.currentRating, 0) / assessmentItems.length;
    const priorityAreas = assessmentItems
      .filter(item => item.currentRating <= 5 && item.importance >= 7)
      .sort((a, b) => (b.importance - b.currentRating) - (a.importance - a.currentRating))
      .slice(0, 3);

    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📋 Your Motivation Assessment Results</h2>
          <p className="text-gray-600">Review your insights and create your motivation maintenance plan.</p>
        </div>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className={`text-2xl font-bold ${getRatingColor(averageRating)}`}>
                {averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-blue-800">Overall Average</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {motivationSources.filter(s => s.type === 'intrinsic').length}
              </div>
              <div className="text-sm text-green-800">Intrinsic Sources</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {motivationSources.filter(s => s.type === 'extrinsic').length}
              </div>
              <div className="text-sm text-purple-800">Extrinsic Sources</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {priorityAreas.length}
              </div>
              <div className="text-sm text-yellow-800">Priority Areas</div>
            </div>
          </div>

          {/* Overall Insights */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key insights from your motivation assessment:
            </label>
            <textarea
              value={overallInsights}
              onChange={(e) => setOverallInsights(e.target.value)}
              placeholder="What patterns do you notice? Which motivation sources are strongest? What surprised you about your assessment?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Action Plan */}
          {config.includesActionPlan && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your motivation maintenance action plan:
              </label>
              <textarea
                value={actionPlan}
                onChange={(e) => setActionPlan(e.target.value)}
                placeholder="Based on your assessment, what specific steps will you take to strengthen your motivation? How will you address challenges and leverage your support systems?"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-900 mb-2">🔄 Motivation Maintenance Tips:</h3>
            <ul className="text-indigo-800 space-y-1 text-sm">
              <li>• Review this assessment {config.reviewFrequency} to track changes</li>
              <li>• Focus on strengthening your top 2-3 motivation sources</li>
              <li>• Develop backup motivation sources for when primary ones fade</li>
              <li>• Connect daily actions to your deeper values and purpose</li>
              <li>• Prepare specific strategies for your known motivation challenges</li>
              <li>• Celebrate progress to build positive momentum</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => setCurrentStep(2)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back to Motivation Sources
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Complete Assessment
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default SelfCoachingChecklistExercise;