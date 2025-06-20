import React, { useState } from 'react';

interface ProgressCelebrationExerciseProps {
  exerciseId: string;
  userId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  config: {
    victoryTypes: string[];
    celebrationMethods: string[];
    momentumBuilders: string[];
  };
}

interface Victory {
  id: string;
  type: string;
  description: string;
  date: string;
  impact: number;
  celebration: string;
  reflection: string;
}

interface CelebrationMethod {
  id: string;
  category: string;
  method: string;
  cost: 'free' | 'low' | 'medium' | 'high';
  timeRequired: string;
  energy: 'low' | 'medium' | 'high';
  effectiveness: number;
}

interface MomentumBuilder {
  id: string;
  type: string;
  description: string;
  frequency: string;
  currentUsage: boolean;
  effectiveness: number;
  barriers: string[];
  improvements: string;
}

export const ProgressCelebrationExercise: React.FC<ProgressCelebrationExerciseProps> = ({
  exerciseId,
  userId,
  onSubmit,
  onCancel,
  config
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [victories, setVictories] = useState<Victory[]>([]);
  const [celebrationMethods, setCelebrationMethods] = useState<CelebrationMethod[]>([]);
  const [momentumBuilders, setMomentumBuilders] = useState<MomentumBuilder[]>([]);
  const [celebrationCommitment, setCelebrationCommitment] = useState('');
  const [momentumPlan, setMomentumPlan] = useState('');
  const [reflections, setReflections] = useState('');

  // Initialize with one victory
  React.useEffect(() => {
    if (victories.length === 0) {
      const initialVictory: Victory = {
        id: 'victory_1',
        type: config.victoryTypes[0],
        description: '',
        date: new Date().toISOString().split('T')[0],
        impact: 5,
        celebration: '',
        reflection: ''
      };
      setVictories([initialVictory]);
    }
  }, [config.victoryTypes, victories.length]);

  // Initialize celebration methods
  React.useEffect(() => {
    if (celebrationMethods.length === 0) {
      const initialMethods = config.celebrationMethods.map((category, index) => ({
        id: `method_${index + 1}`,
        category,
        method: '',
        cost: 'free' as const,
        timeRequired: '5-10 minutes',
        energy: 'low' as const,
        effectiveness: 5
      }));
      setCelebrationMethods(initialMethods);
    }
  }, [config.celebrationMethods, celebrationMethods.length]);

  // Initialize momentum builders
  React.useEffect(() => {
    if (momentumBuilders.length === 0) {
      const initialBuilders = config.momentumBuilders.map((type, index) => ({
        id: `builder_${index + 1}`,
        type,
        description: '',
        frequency: 'weekly',
        currentUsage: false,
        effectiveness: 5,
        barriers: [],
        improvements: ''
      }));
      setMomentumBuilders(initialBuilders);
    }
  }, [config.momentumBuilders, momentumBuilders.length]);

  const addVictory = () => {
    const newVictory: Victory = {
      id: `victory_${victories.length + 1}`,
      type: config.victoryTypes[0],
      description: '',
      date: new Date().toISOString().split('T')[0],
      impact: 5,
      celebration: '',
      reflection: ''
    };
    setVictories([...victories, newVictory]);
  };

  const updateVictory = (index: number, field: keyof Victory, value: any) => {
    const newVictories = [...victories];
    (newVictories[index] as any)[field] = value;
    setVictories(newVictories);
  };

  const removeVictory = (index: number) => {
    if (victories.length > 1) {
      setVictories(victories.filter((_, i) => i !== index));
    }
  };

  const updateCelebrationMethod = (index: number, field: keyof CelebrationMethod, value: any) => {
    const newMethods = [...celebrationMethods];
    (newMethods[index] as any)[field] = value;
    setCelebrationMethods(newMethods);
  };

  const updateMomentumBuilder = (index: number, field: keyof MomentumBuilder, value: any) => {
    const newBuilders = [...momentumBuilders];
    (newBuilders[index] as any)[field] = value;
    setMomentumBuilders(newBuilders);
  };

  const addBarrier = (builderIndex: number, barrier: string) => {
    if (barrier) {
      const newBuilders = [...momentumBuilders];
      newBuilders[builderIndex].barriers.push(barrier);
      setMomentumBuilders(newBuilders);
    }
  };

  const removeBarrier = (builderIndex: number, barrierIndex: number) => {
    const newBuilders = [...momentumBuilders];
    newBuilders[builderIndex].barriers.splice(barrierIndex, 1);
    setMomentumBuilders(newBuilders);
  };

  const handleComplete = () => {
    const data = {
      exerciseId,
      userId,
      victories,
      celebrationMethods,
      momentumBuilders,
      celebrationCommitment,
      momentumPlan,
      reflections,
      completedAt: new Date(),
      config
    };
    onSubmit(data);
  };

  const getVictoryTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      daily_wins: 'Daily Wins',
      weekly_achievements: 'Weekly Achievements',
      milestone_moments: 'Milestone Moments',
      breakthrough_insights: 'Breakthrough Insights'
    };
    return labels[type] || type.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getCelebrationCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      personal_rewards: 'Personal Rewards',
      social_sharing: 'Social Sharing',
      reflection_rituals: 'Reflection Rituals',
      gratitude_practices: 'Gratitude Practices'
    };
    return labels[category] || category.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getMomentumBuilderLabel = (type: string): string => {
    const labels: Record<string, string> = {
      streak_tracking: 'Streak Tracking',
      progress_photos: 'Progress Photos',
      measurement_logs: 'Measurement Logs',
      energy_levels: 'Energy Level Tracking'
    };
    return labels[type] || type.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getImpactColor = (impact: number): string => {
    if (impact <= 3) return 'text-yellow-600';
    if (impact <= 6) return 'text-blue-600';
    return 'text-green-600';
  };

  const getEffectivenessLabel = (rating: number): string => {
    if (rating <= 3) return 'Low';
    if (rating <= 6) return 'Moderate';
    return 'High';
  };

  if (currentStep === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🏆 Personal Victory Tracker</h2>
          <p className="text-gray-600">
            Create a system for recognizing, celebrating, and building momentum from your wellness victories.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Why Celebrate Progress?</h3>
            <ul className="text-green-800 space-y-1 text-sm">
              <li>• <strong>Neurological:</strong> Celebration releases dopamine, reinforcing positive behaviors</li>
              <li>• <strong>Motivational:</strong> Recognition of progress fuels continued effort</li>
              <li>• <strong>Psychological:</strong> Builds self-efficacy and positive associations</li>
              <li>• <strong>Momentum:</strong> Small celebrations compound into lasting change</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What You'll Create:</h3>
            <div className="space-y-2">
              <div className="flex items-center text-blue-800 text-sm">
                <span className="mr-2">🎯</span>
                <span><strong>Victory Recognition System:</strong> Track different types of wins</span>
              </div>
              <div className="flex items-center text-blue-800 text-sm">
                <span className="mr-2">🎉</span>
                <span><strong>Celebration Methods:</strong> Personalized ways to acknowledge success</span>
              </div>
              <div className="flex items-center text-blue-800 text-sm">
                <span className="mr-2">📈</span>
                <span><strong>Momentum Builders:</strong> Systems that create forward progress</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">💡 Celebration Principles:</h3>
            <ul className="text-yellow-800 space-y-1 text-sm">
              <li>• Celebrate effort and process, not just outcomes</li>
              <li>• Make celebrations immediate and specific</li>
              <li>• Match celebration size to achievement size</li>
              <li>• Include both personal and social recognition</li>
              <li>• Focus on progress, however small</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentStep(1)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Start Victory Tracker
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
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🏆 Recent Victories & Wins</h2>
          <p className="text-gray-600">Document your recent successes to build momentum and motivation.</p>
        </div>

        <div className="space-y-6">
          {victories.map((victory, index) => (
            <div key={victory.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Victory #{index + 1}</h3>
                {victories.length > 1 && (
                  <button
                    onClick={() => removeVictory(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Victory Type
                    </label>
                    <select
                      value={victory.type}
                      onChange={(e) => updateVictory(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    >
                      {config.victoryTypes.map(type => (
                        <option key={type} value={type}>
                          {getVictoryTypeLabel(type)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={victory.date}
                      onChange={(e) => updateVictory(index, 'date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Victory Description *
                  </label>
                  <input
                    type="text"
                    value={victory.description}
                    onChange={(e) => updateVictory(index, 'description', e.target.value)}
                    placeholder="e.g., 'Completed my first week of morning workouts', 'Chose salad over pizza when stressed'"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Impact Level (1 = Small win, 10 = Major breakthrough)
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">1</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={victory.impact}
                      onChange={(e) => updateVictory(index, 'impact', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500">10</span>
                    <div className="ml-2 text-center">
                      <div className={`text-lg font-bold ${getImpactColor(victory.impact)}`}>
                        {victory.impact}
                      </div>
                      <div className="text-xs text-gray-600">
                        {victory.impact <= 3 ? 'Small' : victory.impact <= 6 ? 'Medium' : 'Major'}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How did you celebrate this victory?
                  </label>
                  <input
                    type="text"
                    value={victory.celebration}
                    onChange={(e) => updateVictory(index, 'celebration', e.target.value)}
                    placeholder="e.g., 'Told my partner', 'Bought myself flowers', 'Did a happy dance', 'Posted on social media'"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reflection: What made this victory possible?
                  </label>
                  <textarea
                    value={victory.reflection}
                    onChange={(e) => updateVictory(index, 'reflection', e.target.value)}
                    placeholder="What factors contributed to this success? What can you learn from it?"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="text-center">
            <button
              onClick={addVictory}
              className="px-6 py-3 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 text-green-600 hover:text-green-700"
            >
              + Add Another Victory
            </button>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">🌟 Victory Recognition Tips:</h3>
            <ul className="text-green-800 space-y-1 text-sm">
              <li>• Look for progress in all areas: physical, mental, emotional, social</li>
              <li>• Count process victories (showing up) as much as outcome victories (results)</li>
              <li>• Notice small daily wins alongside major milestones</li>
              <li>• Include victories that felt difficult or required courage</li>
              <li>• Remember that consistency itself is a victory worth celebrating</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => setCurrentStep(0)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back
          </button>
          <button
            onClick={() => setCurrentStep(2)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Design Celebration Methods →
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 Your Celebration Methods</h2>
          <p className="text-gray-600">Design personalized ways to acknowledge and celebrate your progress.</p>
        </div>

        <div className="space-y-6">
          {celebrationMethods.map((method, index) => (
            <div key={method.id} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">
                {getCelebrationCategoryLabel(method.category)}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specific celebration method:
                  </label>
                  <input
                    type="text"
                    value={method.method}
                    onChange={(e) => updateCelebrationMethod(index, 'method', e.target.value)}
                    placeholder={`e.g., ${method.category === 'personal_rewards' ? 'Buy a small treat, Take a relaxing bath' : 
                      method.category === 'social_sharing' ? 'Text my accountability partner, Post progress photo' :
                      method.category === 'reflection_rituals' ? 'Write in victory journal, Take 5 minutes to savor the feeling' :
                      'List 3 things I\'m grateful for, Thank someone who helped me'}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost
                    </label>
                    <select
                      value={method.cost}
                      onChange={(e) => updateCelebrationMethod(index, 'cost', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="free">Free</option>
                      <option value="low">Low ($1-10)</option>
                      <option value="medium">Medium ($10-50)</option>
                      <option value="high">High ($50+)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Required
                    </label>
                    <select
                      value={method.timeRequired}
                      onChange={(e) => updateCelebrationMethod(index, 'timeRequired', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="1-2 minutes">1-2 minutes</option>
                      <option value="5-10 minutes">5-10 minutes</option>
                      <option value="15-30 minutes">15-30 minutes</option>
                      <option value="1+ hours">1+ hours</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Energy Level
                    </label>
                    <select
                      value={method.energy}
                      onChange={(e) => updateCelebrationMethod(index, 'energy', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="low">Low Energy</option>
                      <option value="medium">Medium Energy</option>
                      <option value="high">High Energy</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Effectiveness (1-10)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={method.effectiveness}
                        onChange={(e) => updateCelebrationMethod(index, 'effectiveness', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm font-bold w-6">{method.effectiveness}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">🎯 Celebration Strategy:</h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Match celebration size to victory size (small wins = quick celebrations)</li>
              <li>• Have both immediate (2-minute) and meaningful (longer) celebrations ready</li>
              <li>• Include free options for daily use and special options for major milestones</li>
              <li>• Make celebrations positive and aligned with your wellness goals</li>
              <li>• Practice celebrating immediately when victories happen</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => setCurrentStep(1)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back to Victories
          </button>
          <button
            onClick={() => setCurrentStep(3)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Build Momentum Systems →
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 3) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📈 Momentum Building Systems</h2>
          <p className="text-gray-600">Create systems that help you maintain and build positive momentum.</p>
        </div>

        <div className="space-y-6">
          {momentumBuilders.map((builder, index) => (
            <div key={builder.id} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">
                {getMomentumBuilderLabel(builder.type)}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How will you implement this momentum builder?
                  </label>
                  <textarea
                    value={builder.description}
                    onChange={(e) => updateMomentumBuilder(index, 'description', e.target.value)}
                    placeholder={`e.g., ${builder.type === 'streak_tracking' ? 'Mark an X on my calendar for each day I complete my morning routine' :
                      builder.type === 'progress_photos' ? 'Take a photo every Friday morning to track physical changes' :
                      builder.type === 'measurement_logs' ? 'Weekly weigh-ins and monthly body measurements' :
                      'Rate my energy level 1-10 each evening in my wellness app'}`}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      value={builder.frequency}
                      onChange={(e) => updateMomentumBuilder(index, 'frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="bi-weekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currently Using?
                    </label>
                    <select
                      value={builder.currentUsage.toString()}
                      onChange={(e) => updateMomentumBuilder(index, 'currentUsage', e.target.value === 'true')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Effectiveness (1-10)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={builder.effectiveness}
                        onChange={(e) => updateMomentumBuilder(index, 'effectiveness', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm font-bold w-6">{builder.effectiveness}</span>
                    </div>
                  </div>
                </div>

                {/* Barriers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What might prevent you from using this system consistently?
                  </label>
                  <div className="space-y-2 mb-3">
                    {builder.barriers.map((barrier, barrierIndex) => (
                      <div key={barrierIndex} className="flex items-center justify-between bg-red-50 p-2 rounded">
                        <span className="text-sm text-red-800">{barrier}</span>
                        <button
                          onClick={() => removeBarrier(index, barrierIndex)}
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
                      placeholder="Add a potential barrier (e.g., 'Forgetting to track', 'Lack of time')"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addBarrier(index, (e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                        addBarrier(index, input.value);
                        input.value = '';
                      }}
                      className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Improvements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How could you make this system more effective or easier to use?
                  </label>
                  <input
                    type="text"
                    value={builder.improvements}
                    onChange={(e) => updateMomentumBuilder(index, 'improvements', e.target.value)}
                    placeholder="e.g., 'Set phone reminder', 'Use app instead of paper', 'Link to existing habit'"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">🚀 Momentum Building Tips:</h3>
            <ul className="text-purple-800 space-y-1 text-sm">
              <li>• Start with just 1-2 momentum builders to avoid overwhelm</li>
              <li>• Make tracking simple and quick (under 2 minutes)</li>
              <li>• Review your momentum data weekly to see patterns</li>
              <li>• Celebrate streaks and don't break them lightly</li>
              <li>• When you break a streak, restart immediately</li>
              <li>• Use visual progress indicators (charts, photos, calendars)</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => setCurrentStep(2)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back to Celebrations
          </button>
          <button
            onClick={() => setCurrentStep(4)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Create Action Plan →
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 4) {
    const totalVictories = victories.length;
    const recentVictories = victories.filter(v => {
      const victoryDate = new Date(v.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return victoryDate >= thirtyDaysAgo;
    }).length;

    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🎯 Your Victory & Momentum Action Plan</h2>
          <p className="text-gray-600">Commit to your celebration and momentum building practices.</p>
        </div>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{totalVictories}</div>
              <div className="text-sm text-green-800">Total Victories</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{recentVictories}</div>
              <div className="text-sm text-blue-800">Recent Wins (30 days)</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{celebrationMethods.length}</div>
              <div className="text-sm text-purple-800">Celebration Methods</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {momentumBuilders.filter(b => b.currentUsage).length}
              </div>
              <div className="text-sm text-yellow-800">Active Systems</div>
            </div>
          </div>

          {/* Celebration Commitment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your celebration commitment:
            </label>
            <textarea
              value={celebrationCommitment}
              onChange={(e) => setCelebrationCommitment(e.target.value)}
              placeholder="How will you commit to regularly celebrating your progress? What specific actions will you take daily, weekly, and monthly?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Momentum Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your momentum building plan:
            </label>
            <textarea
              value={momentumPlan}
              onChange={(e) => setMomentumPlan(e.target.value)}
              placeholder="Which momentum builders will you start with? How will you implement them? What's your timeline for getting these systems in place?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Overall Reflections */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall reflections and insights:
            </label>
            <textarea
              value={reflections}
              onChange={(e) => setReflections(e.target.value)}
              placeholder="What did you learn about your celebration patterns? Which momentum builders excite you most? How will this change your approach to wellness?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-900 mb-2">🌟 Sustaining Your Victory Mindset:</h3>
            <ul className="text-indigo-800 space-y-1 text-sm">
              <li>• Set a weekly reminder to review and celebrate your victories</li>
              <li>• Share your wins with supportive friends, family, or communities</li>
              <li>• Keep a running list of your victories to review during tough times</li>
              <li>• Notice and celebrate other people's victories to stay in a positive mindset</li>
              <li>• Remember: progress, not perfection, is the goal</li>
              <li>• Trust that small, consistent celebrations compound into lasting motivation</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => setCurrentStep(3)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back to Momentum
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Complete Victory Tracker
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default ProgressCelebrationExercise;