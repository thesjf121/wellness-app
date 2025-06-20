import React, { useState } from 'react';

interface HabitLoopAnalyzerExerciseProps {
  exerciseId: string;
  userId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  config: {
    habitCount: number;
    includesActionPlan: boolean;
    categories: string[];
  };
}

interface HabitAnalysis {
  id: string;
  habitName: string;
  category: string;
  type: 'positive' | 'negative';
  cue: string;
  routine: string;
  reward: string;
  frequency: string;
  impact: number;
  changeStrategy: string;
  replacement?: string;
}

export const HabitLoopAnalyzerExercise: React.FC<HabitLoopAnalyzerExerciseProps> = ({
  exerciseId,
  userId,
  onSubmit,
  onCancel,
  config
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentHabitIndex, setCurrentHabitIndex] = useState(0);
  const [habits, setHabits] = useState<HabitAnalysis[]>([]);
  const [actionPlan, setActionPlan] = useState('');
  const [insights, setInsights] = useState('');

  // Initialize habits array
  React.useEffect(() => {
    if (habits.length === 0) {
      const initialHabits = Array.from({ length: config.habitCount }, (_, index) => ({
        id: `habit_${index + 1}`,
        habitName: '',
        category: config.categories[0],
        type: index === 0 ? 'positive' as const : 'negative' as const,
        cue: '',
        routine: '',
        reward: '',
        frequency: 'daily',
        impact: 5,
        changeStrategy: '',
        replacement: ''
      }));
      setHabits(initialHabits);
    }
  }, [config.habitCount, config.categories, habits.length]);

  const updateHabit = (index: number, field: keyof HabitAnalysis, value: any) => {
    const newHabits = [...habits];
    (newHabits[index] as any)[field] = value;
    setHabits(newHabits);
  };

  const handleComplete = () => {
    const data = {
      exerciseId,
      userId,
      habits,
      actionPlan,
      insights,
      completedAt: new Date(),
      config
    };
    onSubmit(data);
  };

  const getImpactLabel = (impact: number): string => {
    if (impact <= 2) return 'Very Low';
    if (impact <= 4) return 'Low';
    if (impact <= 6) return 'Moderate';
    if (impact <= 8) return 'High';
    return 'Very High';
  };

  const getImpactColor = (impact: number): string => {
    if (impact <= 2) return 'text-green-600';
    if (impact <= 4) return 'text-yellow-600';
    if (impact <= 6) return 'text-orange-600';
    if (impact <= 8) return 'text-red-600';
    return 'text-red-800';
  };

  if (currentStep === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🔍 Habit Loop Analyzer</h2>
          <p className="text-gray-600">
            Analyze your current habits to understand how they work and how to change them.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">The Habit Loop</h3>
            <p className="text-blue-800 text-sm mb-3">
              Every habit follows a simple loop: <strong>Cue → Routine → Reward</strong>
            </p>
            <div className="space-y-2 text-blue-800 text-sm">
              <div><strong>Cue:</strong> The trigger that initiates the behavior (time, place, emotion, people, preceding action)</div>
              <div><strong>Routine:</strong> The behavior itself (the habit you want to change)</div>
              <div><strong>Reward:</strong> The benefit you get from the behavior (physical, emotional, mental satisfaction)</div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">What You'll Analyze:</h3>
            <ul className="text-green-800 space-y-1 text-sm">
              <li>• {config.habitCount} habits ({config.habitCount === 2 ? '1 positive, 1 negative' : 'mix of positive and negative'})</li>
              <li>• The cue, routine, and reward for each habit</li>
              <li>• How often you do each habit and its impact on your life</li>
              <li>• Strategies for strengthening good habits or changing bad ones</li>
              {config.includesActionPlan && <li>• A personalized action plan for habit change</li>}
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">💡 Tips for Success:</h3>
            <ul className="text-yellow-800 space-y-1 text-sm">
              <li>• Be honest about your habits—judgment won't help you change</li>
              <li>• Look for patterns in your cues (times, emotions, situations)</li>
              <li>• Focus on the real reward, not the obvious one</li>
              <li>• Start with small changes rather than dramatic overhauls</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentStep(1)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Start Habit Analysis
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
    const currentHabit = habits[currentHabitIndex];
    
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Habit Analysis #{currentHabitIndex + 1}
          </h2>
          <div className="text-sm text-gray-600">
            {currentHabitIndex + 1} of {config.habitCount}
          </div>
        </div>

        <div className="space-y-6">
          {/* Habit Name and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Habit Name
              </label>
              <input
                type="text"
                value={currentHabit.habitName}
                onChange={(e) => updateHabit(currentHabitIndex, 'habitName', e.target.value)}
                placeholder="e.g., Morning coffee, Checking phone, Exercise"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Habit Type
              </label>
              <select
                value={currentHabit.type}
                onChange={(e) => updateHabit(currentHabitIndex, 'type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="positive">Positive (want to strengthen)</option>
                <option value="negative">Negative (want to change)</option>
              </select>
            </div>
          </div>

          {/* Category and Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={currentHabit.category}
                onChange={(e) => updateHabit(currentHabitIndex, 'category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {config.categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency
              </label>
              <select
                value={currentHabit.frequency}
                onChange={(e) => updateHabit(currentHabitIndex, 'frequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="multiple_daily">Multiple times daily</option>
                <option value="daily">Daily</option>
                <option value="weekly">Few times a week</option>
                <option value="occasionally">Occasionally</option>
              </select>
            </div>
          </div>

          {/* The Habit Loop */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Break Down the Habit Loop</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎯 Cue: What triggers this habit?
                </label>
                <input
                  type="text"
                  value={currentHabit.cue}
                  onChange={(e) => updateHabit(currentHabitIndex, 'cue', e.target.value)}
                  placeholder="e.g., Feeling stressed, 3 PM, Waking up, Seeing my phone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔄 Routine: What do you actually do?
                </label>
                <input
                  type="text"
                  value={currentHabit.routine}
                  onChange={(e) => updateHabit(currentHabitIndex, 'routine', e.target.value)}
                  placeholder="e.g., Scroll social media, Eat a snack, Go for a run"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎁 Reward: What satisfaction do you get?
                </label>
                <input
                  type="text"
                  value={currentHabit.reward}
                  onChange={(e) => updateHabit(currentHabitIndex, 'reward', e.target.value)}
                  placeholder="e.g., Feel entertained, Temporary comfort, Energy boost, Sense of accomplishment"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Impact Assessment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Impact on Your Life (1 = Very Low, 10 = Very High)
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">1</span>
              <input
                type="range"
                min="1"
                max="10"
                value={currentHabit.impact}
                onChange={(e) => updateHabit(currentHabitIndex, 'impact', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-500">10</span>
              <div className="ml-2 text-center">
                <div className={`text-lg font-bold ${getImpactColor(currentHabit.impact)}`}>
                  {currentHabit.impact}
                </div>
                <div className="text-xs text-gray-600">
                  {getImpactLabel(currentHabit.impact)}
                </div>
              </div>
            </div>
          </div>

          {/* Change Strategy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {currentHabit.type === 'positive' ? 'How could you strengthen this habit?' : 'How could you change or replace this habit?'}
            </label>
            <textarea
              value={currentHabit.changeStrategy}
              onChange={(e) => updateHabit(currentHabitIndex, 'changeStrategy', e.target.value)}
              placeholder={currentHabit.type === 'positive' 
                ? "e.g., Make the cue more obvious, improve the environment, add rewards"
                : "e.g., Change the routine, modify the environment, find a healthier replacement"
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Replacement for negative habits */}
          {currentHabit.type === 'negative' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What healthier routine could provide the same reward?
              </label>
              <input
                type="text"
                value={currentHabit.replacement || ''}
                onChange={(e) => updateHabit(currentHabitIndex, 'replacement', e.target.value)}
                placeholder="e.g., Take a walk instead of stress-eating, call a friend instead of scrolling"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentHabitIndex(Math.max(0, currentHabitIndex - 1))}
            disabled={currentHabitIndex === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous Habit
          </button>
          
          {currentHabitIndex < config.habitCount - 1 ? (
            <button
              onClick={() => setCurrentHabitIndex(currentHabitIndex + 1)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Next Habit →
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
    const positiveHabits = habits.filter(h => h.type === 'positive');
    const negativeHabits = habits.filter(h => h.type === 'negative');
    
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 Your Habit Analysis Summary</h2>
          <p className="text-gray-600">Review your habits and create an action plan.</p>
        </div>

        <div className="space-y-6">
          {/* Habit Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {positiveHabits.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-3">✅ Positive Habits to Strengthen</h3>
                {positiveHabits.map((habit) => (
                  <div key={habit.id} className="mb-3 p-3 bg-white rounded border">
                    <div className="font-medium text-green-800">{habit.habitName}</div>
                    <div className="text-sm text-green-700 mt-1">
                      Loop: {habit.cue} → {habit.routine} → {habit.reward}
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      Impact: {habit.impact}/10 • {habit.frequency}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {negativeHabits.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-3">🔄 Habits to Change</h3>
                {negativeHabits.map((habit) => (
                  <div key={habit.id} className="mb-3 p-3 bg-white rounded border">
                    <div className="font-medium text-red-800">{habit.habitName}</div>
                    <div className="text-sm text-red-700 mt-1">
                      Loop: {habit.cue} → {habit.routine} → {habit.reward}
                    </div>
                    <div className="text-sm text-red-600 mt-1">
                      Impact: {habit.impact}/10 • {habit.frequency}
                    </div>
                    {habit.replacement && (
                      <div className="text-sm text-blue-600 mt-1">
                        Replacement: {habit.replacement}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Insights */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key insights from your habit analysis:
            </label>
            <textarea
              value={insights}
              onChange={(e) => setInsights(e.target.value)}
              placeholder="What patterns did you notice? What surprised you? Which habits have the biggest impact on your life?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Action Plan */}
          {config.includesActionPlan && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your habit change action plan:
              </label>
              <textarea
                value={actionPlan}
                onChange={(e) => setActionPlan(e.target.value)}
                placeholder="What specific steps will you take? Which habit will you focus on first? What environmental changes will you make? How will you track progress?"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">🎯 Next Steps for Habit Change:</h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Start with the highest-impact habit (positive or negative)</li>
              <li>• Make small changes to your environment to support new behaviors</li>
              <li>• Focus on changing one habit at a time for 2-4 weeks</li>
              <li>• Track your progress daily with a simple habit tracker</li>
              <li>• Be patient—new neural pathways take time to strengthen</li>
              <li>• When you slip up, get back on track immediately without judgment</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => setCurrentStep(1)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back to Habits
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Complete Habit Analysis
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default HabitLoopAnalyzerExercise;