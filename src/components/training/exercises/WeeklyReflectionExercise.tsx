import React, { useState } from 'react';

interface WeeklyReflectionExerciseProps {
  exerciseId: string;
  userId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  config: {
    reflectionAreas: string[];
    includesGoalSetting: boolean;
    trackingPeriod: number;
  };
}

interface ReflectionEntry {
  area: string;
  response: string;
  rating: number;
  insights: string[];
}

interface WeeklyGoal {
  id: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  specific: boolean;
  measurable: boolean;
  timebound: boolean;
}

export const WeeklyReflectionExercise: React.FC<WeeklyReflectionExerciseProps> = ({
  exerciseId,
  userId,
  onSubmit,
  onCancel,
  config
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
  const [reflectionEntries, setReflectionEntries] = useState<ReflectionEntry[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [overallReflection, setOverallReflection] = useState('');
  const [keyLearnings, setKeyLearnings] = useState<string[]>([]);
  const [gratitude, setGratitude] = useState<string[]>([]);
  const [nextWeekFocus, setNextWeekFocus] = useState('');

  const reflectionQuestions: Record<string, string[]> = {
    achievements: [
      'What are 3 things you accomplished this week that you\'re proud of?',
      'Which of your wellness goals did you make progress on?',
      'What new habits did you successfully practice this week?',
      'What moments brought you joy or satisfaction?'
    ],
    challenges: [
      'What obstacles or difficulties did you face this week?',
      'Which situations triggered stress or negative emotions?',
      'What habits or goals did you struggle with?',
      'What would you do differently if you faced these challenges again?'
    ],
    learnings: [
      'What did you learn about yourself this week?',
      'What insights did you gain about your wellness journey?',
      'Which strategies or approaches worked well for you?',
      'What patterns did you notice in your behavior or emotions?'
    ],
    goals: [
      'How well did you progress toward your wellness goals this week?',
      'Which goals need more attention or a different approach?',
      'What support or resources would help you achieve your goals?',
      'How aligned are your current goals with your values and priorities?'
    ],
    actions: [
      'What specific actions will you take next week?',
      'Which habits will you focus on building or maintaining?',
      'How will you apply what you learned this week?',
      'What will you do to prepare for anticipated challenges?'
    ]
  };

  // Initialize reflection entries
  React.useEffect(() => {
    if (reflectionEntries.length === 0) {
      const entries = config.reflectionAreas.map(area => ({
        area,
        response: '',
        rating: 5,
        insights: []
      }));
      setReflectionEntries(entries);
    }
  }, [config.reflectionAreas, reflectionEntries.length]);

  const updateReflectionEntry = (index: number, field: keyof ReflectionEntry, value: any) => {
    const newEntries = [...reflectionEntries];
    (newEntries[index] as any)[field] = value;
    setReflectionEntries(newEntries);
  };

  const addInsight = (areaIndex: number, insight: string) => {
    if (insight) {
      const newEntries = [...reflectionEntries];
      newEntries[areaIndex].insights.push(insight);
      setReflectionEntries(newEntries);
    }
  };

  const removeInsight = (areaIndex: number, insightIndex: number) => {
    const newEntries = [...reflectionEntries];
    newEntries[areaIndex].insights.splice(insightIndex, 1);
    setReflectionEntries(newEntries);
  };

  const addWeeklyGoal = () => {
    const newGoal: WeeklyGoal = {
      id: `goal_${weeklyGoals.length + 1}`,
      description: '',
      category: 'wellness',
      priority: 'medium',
      specific: false,
      measurable: false,
      timebound: false
    };
    setWeeklyGoals([...weeklyGoals, newGoal]);
  };

  const updateWeeklyGoal = (index: number, field: keyof WeeklyGoal, value: any) => {
    const newGoals = [...weeklyGoals];
    (newGoals[index] as any)[field] = value;
    setWeeklyGoals(newGoals);
  };

  const removeWeeklyGoal = (index: number) => {
    setWeeklyGoals(weeklyGoals.filter((_, i) => i !== index));
  };

  const addKeyLearning = (learning: string) => {
    if (learning && !keyLearnings.includes(learning)) {
      setKeyLearnings([...keyLearnings, learning]);
    }
  };

  const removeKeyLearning = (index: number) => {
    setKeyLearnings(keyLearnings.filter((_, i) => i !== index));
  };

  const addGratitude = (item: string) => {
    if (item && !gratitude.includes(item)) {
      setGratitude([...gratitude, item]);
    }
  };

  const removeGratitude = (index: number) => {
    setGratitude(gratitude.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    const data = {
      exerciseId,
      userId,
      reflectionEntries,
      weeklyGoals,
      overallReflection,
      keyLearnings,
      gratitude,
      nextWeekFocus,
      trackingPeriod: config.trackingPeriod,
      completedAt: new Date(),
      config
    };
    onSubmit(data);
  };

  const getAreaTitle = (area: string): string => {
    const titles: Record<string, string> = {
      achievements: 'Achievements & Wins',
      challenges: 'Challenges & Obstacles',
      learnings: 'Insights & Learnings',
      goals: 'Goal Progress',
      actions: 'Next Week Actions'
    };
    return titles[area] || area.charAt(0).toUpperCase() + area.slice(1);
  };

  const getAreaIcon = (area: string): string => {
    const icons: Record<string, string> = {
      achievements: '🏆',
      challenges: '🚧',
      learnings: '💡',
      goals: '🎯',
      actions: '📋'
    };
    return icons[area] || '📝';
  };

  const getRatingLabel = (rating: number): string => {
    if (rating <= 2) return 'Poor';
    if (rating <= 4) return 'Below Average';
    if (rating <= 6) return 'Average';
    if (rating <= 8) return 'Good';
    return 'Excellent';
  };

  const getRatingColor = (rating: number): string => {
    if (rating <= 3) return 'text-red-600';
    if (rating <= 5) return 'text-yellow-600';
    if (rating <= 7) return 'text-blue-600';
    return 'text-green-600';
  };

  if (currentStep === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📝 Weekly Self-Coaching Session</h2>
          <p className="text-gray-600">
            Reflect on your week and set yourself up for continued growth and success.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">The Power of Weekly Reflection</h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• <strong>Awareness:</strong> Notice patterns and progress you might miss day-to-day</li>
              <li>• <strong>Learning:</strong> Extract insights from both successes and challenges</li>
              <li>• <strong>Adjustment:</strong> Course-correct based on what's working and what isn't</li>
              <li>• <strong>Motivation:</strong> Celebrate wins and maintain momentum</li>
              <li>• <strong>Planning:</strong> Set clear intentions for the coming week</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">What You'll Reflect On:</h3>
            <div className="space-y-2">
              {config.reflectionAreas.map((area, index) => (
                <div key={index} className="flex items-center text-green-800 text-sm">
                  <span className="mr-2">{getAreaIcon(area)}</span>
                  <span><strong>{getAreaTitle(area)}</strong></span>
                </div>
              ))}
            </div>
            {config.includesGoalSetting && (
              <div className="flex items-center text-green-800 text-sm mt-2">
                <span className="mr-2">🎯</span>
                <span><strong>Weekly Goal Setting</strong></span>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">💡 Reflection Tips:</h3>
            <ul className="text-yellow-800 space-y-1 text-sm">
              <li>• Be honest but compassionate with yourself</li>
              <li>• Focus on learning rather than judging</li>
              <li>• Look for patterns across different areas of your life</li>
              <li>• Celebrate small wins alongside major achievements</li>
              <li>• Use insights to inform next week's actions</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentStep(1)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Begin Weekly Reflection
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
    const currentEntry = reflectionEntries[currentAreaIndex];
    const questions = reflectionQuestions[currentEntry.area] || [];
    
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {getAreaIcon(currentEntry.area)} {getAreaTitle(currentEntry.area)}
          </h2>
          <div className="text-sm text-gray-600">
            {currentAreaIndex + 1} of {config.reflectionAreas.length}
          </div>
        </div>

        <div className="space-y-6">
          {/* Guiding Questions */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Guiding Questions:</h3>
            <ul className="space-y-2">
              {questions.map((question, index) => (
                <li key={index} className="text-gray-700 text-sm">
                  <span className="text-blue-600 mr-2">•</span>
                  {question}
                </li>
              ))}
            </ul>
          </div>

          {/* Reflection Response */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your reflection on {currentEntry.area}:
            </label>
            <textarea
              value={currentEntry.response}
              onChange={(e) => updateReflectionEntry(currentAreaIndex, 'response', e.target.value)}
              placeholder="Take your time to reflect thoughtfully on this area. What stands out to you from this week?"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How would you rate this area this week? (1 = Poor, 10 = Excellent)
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">1</span>
              <input
                type="range"
                min="1"
                max="10"
                value={currentEntry.rating}
                onChange={(e) => updateReflectionEntry(currentAreaIndex, 'rating', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-500">10</span>
              <div className="ml-2 text-center">
                <div className={`text-lg font-bold ${getRatingColor(currentEntry.rating)}`}>
                  {currentEntry.rating}
                </div>
                <div className="text-xs text-gray-600">
                  {getRatingLabel(currentEntry.rating)}
                </div>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key insights or takeaways:
            </label>
            <div className="space-y-2 mb-3">
              {currentEntry.insights.map((insight, index) => (
                <div key={index} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                  <span className="text-sm text-blue-800">{insight}</span>
                  <button
                    onClick={() => removeInsight(currentAreaIndex, index)}
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
                placeholder="Add a key insight (e.g., 'I'm more motivated in the morning', 'Stress affects my sleep')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addInsight(currentAreaIndex, (e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  addInsight(currentAreaIndex, input.value);
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
          
          {currentAreaIndex < config.reflectionAreas.length - 1 ? (
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
              {config.includesGoalSetting ? 'Set Weekly Goals →' : 'Complete Reflection →'}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (currentStep === 2 && config.includesGoalSetting) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🎯 Weekly Goal Setting</h2>
          <p className="text-gray-600">Based on your reflection, set 1-3 focused goals for next week.</p>
        </div>

        <div className="space-y-6">
          {/* Current Goals */}
          {weeklyGoals.map((goal, index) => (
            <div key={goal.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Goal #{index + 1}</h3>
                <button
                  onClick={() => removeWeeklyGoal(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove Goal
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goal Description *
                  </label>
                  <input
                    type="text"
                    value={goal.description}
                    onChange={(e) => updateWeeklyGoal(index, 'description', e.target.value)}
                    placeholder="e.g., Exercise for 30 minutes, 4 times this week"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={goal.category}
                      onChange={(e) => updateWeeklyGoal(index, 'category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="wellness">General Wellness</option>
                      <option value="fitness">Fitness & Movement</option>
                      <option value="nutrition">Nutrition</option>
                      <option value="sleep">Sleep</option>
                      <option value="stress">Stress Management</option>
                      <option value="habits">Habits</option>
                      <option value="mindfulness">Mindfulness</option>
                      <option value="social">Social Connection</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={goal.priority}
                      onChange={(e) => updateWeeklyGoal(index, 'priority', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goal Quality Check:
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={goal.specific}
                        onChange={(e) => updateWeeklyGoal(index, 'specific', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Specific (clear what you'll do)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={goal.measurable}
                        onChange={(e) => updateWeeklyGoal(index, 'measurable', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Measurable (you'll know when it's done)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={goal.timebound}
                        onChange={(e) => updateWeeklyGoal(index, 'timebound', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Time-bound (includes when/how often)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add Goal Button */}
          {weeklyGoals.length < 3 && (
            <div className="text-center">
              <button
                onClick={addWeeklyGoal}
                className="px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600"
              >
                + Add Weekly Goal
              </button>
            </div>
          )}

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">🎯 Goal Setting Tips:</h3>
            <ul className="text-yellow-800 space-y-1 text-sm">
              <li>• Focus on 1-3 goals max—quality over quantity</li>
              <li>• Make goals specific and measurable</li>
              <li>• Choose goals that build on your reflection insights</li>
              <li>• Start with what feels achievable but slightly challenging</li>
              <li>• Consider what obstacles might arise and how to handle them</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => setCurrentStep(1)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back to Reflection
          </button>
          <button
            onClick={() => setCurrentStep(3)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Final Summary →
          </button>
        </div>
      </div>
    );
  }

  const finalStep = config.includesGoalSetting ? 3 : 2;

  if (currentStep === finalStep) {
    const averageRating = reflectionEntries.reduce((sum, entry) => sum + entry.rating, 0) / reflectionEntries.length;
    
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📋 Weekly Reflection Summary</h2>
          <p className="text-gray-600">Complete your reflection with gratitude and forward planning.</p>
        </div>

        <div className="space-y-6">
          {/* Reflection Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3">Your Week in Review</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getRatingColor(averageRating)}`}>
                  {averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-blue-800">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {reflectionEntries.reduce((sum, entry) => sum + entry.insights.length, 0)}
                </div>
                <div className="text-sm text-blue-800">Total Insights</div>
              </div>
              {config.includesGoalSetting && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {weeklyGoals.length}
                  </div>
                  <div className="text-sm text-blue-800">Weekly Goals</div>
                </div>
              )}
            </div>
          </div>

          {/* Key Learnings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What are your biggest learnings from this week?
            </label>
            <div className="space-y-2 mb-3">
              {keyLearnings.map((learning, index) => (
                <div key={index} className="flex items-center justify-between bg-purple-50 p-2 rounded">
                  <span className="text-sm text-purple-800">{learning}</span>
                  <button
                    onClick={() => removeKeyLearning(index)}
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
                placeholder="Add a key learning (e.g., 'I need more sleep to feel energized', 'Exercise boosts my mood')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addKeyLearning((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  addKeyLearning(input.value);
                  input.value = '';
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Gratitude */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What are you grateful for from this week?
            </label>
            <div className="space-y-2 mb-3">
              {gratitude.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded">
                  <span className="text-sm text-green-800">{item}</span>
                  <button
                    onClick={() => removeGratitude(index)}
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
                placeholder="Add something you're grateful for (e.g., 'Good health', 'Supportive friends', 'Beautiful sunset')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addGratitude((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  addGratitude(input.value);
                  input.value = '';
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Next Week Focus */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What will be your main focus for next week?
            </label>
            <textarea
              value={nextWeekFocus}
              onChange={(e) => setNextWeekFocus(e.target.value)}
              placeholder="Describe your primary intention or theme for the coming week..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Overall Reflection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Any additional thoughts or reflections?
            </label>
            <textarea
              value={overallReflection}
              onChange={(e) => setOverallReflection(e.target.value)}
              placeholder="Space for any other thoughts, feelings, or observations about your week..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-900 mb-2">🌟 Continue Your Self-Coaching Journey:</h3>
            <ul className="text-indigo-800 space-y-1 text-sm">
              <li>• Schedule your next weekly reflection session</li>
              <li>• Review your goals mid-week to stay on track</li>
              <li>• Notice patterns across multiple weeks of reflection</li>
              <li>• Celebrate progress and be compassionate with setbacks</li>
              <li>• Use your insights to inform longer-term planning</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => setCurrentStep(config.includesGoalSetting ? 2 : 1)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Complete Weekly Reflection
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default WeeklyReflectionExercise;