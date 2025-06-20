import React, { useState } from 'react';

interface HabitTrackerExerciseProps {
  exerciseId: string;
  userId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  config: {
    maxHabits: number;
    trackingPeriod: number;
    includesReminders: boolean;
    categories: string[];
  };
}

interface Habit {
  id: string;
  name: string;
  category: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'custom';
  customDays?: string[];
  timeOfDay: string;
  trigger: string;
  reward: string;
  minimumViableHabit: string;
  reminderTime?: string;
  trackingMethod: 'simple' | 'numeric' | 'duration';
  unit?: string;
  target?: number;
}

interface TrackerSetup {
  trackingMethod: 'physical' | 'digital' | 'both';
  physicalMethod: string;
  digitalMethod: string;
  reviewSchedule: string;
  accountabilityPartner: string;
}

export const HabitTrackerExercise: React.FC<HabitTrackerExerciseProps> = ({
  exerciseId,
  userId,
  onSubmit,
  onCancel,
  config
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentHabitIndex, setCurrentHabitIndex] = useState(0);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [trackerSetup, setTrackerSetup] = useState<TrackerSetup>({
    trackingMethod: 'digital',
    physicalMethod: '',
    digitalMethod: '',
    reviewSchedule: 'weekly',
    accountabilityPartner: ''
  });
  const [motivation, setMotivation] = useState('');
  const [barriers, setBarriers] = useState<string[]>([]);
  const [strategies, setStrategies] = useState<string[]>([]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Initialize habits array
  React.useEffect(() => {
    if (habits.length === 0) {
      const initialHabits = Array.from({ length: 1 }, (_, index) => ({
        id: `habit_${index + 1}`,
        name: '',
        category: config.categories[0],
        description: '',
        frequency: 'daily' as const,
        customDays: [],
        timeOfDay: 'morning',
        trigger: '',
        reward: '',
        minimumViableHabit: '',
        reminderTime: '',
        trackingMethod: 'simple' as const,
        unit: '',
        target: 1
      }));
      setHabits(initialHabits);
    }
  }, [config.categories, habits.length]);

  const addHabit = () => {
    if (habits.length < config.maxHabits) {
      const newHabit: Habit = {
        id: `habit_${habits.length + 1}`,
        name: '',
        category: config.categories[0],
        description: '',
        frequency: 'daily',
        customDays: [],
        timeOfDay: 'morning',
        trigger: '',
        reward: '',
        minimumViableHabit: '',
        reminderTime: '',
        trackingMethod: 'simple',
        unit: '',
        target: 1
      };
      setHabits([...habits, newHabit]);
    }
  };

  const removeHabit = (index: number) => {
    if (habits.length > 1) {
      const newHabits = habits.filter((_, i) => i !== index);
      setHabits(newHabits);
      if (currentHabitIndex >= newHabits.length) {
        setCurrentHabitIndex(Math.max(0, newHabits.length - 1));
      }
    }
  };

  const updateHabit = (index: number, field: keyof Habit, value: any) => {
    const newHabits = [...habits];
    (newHabits[index] as any)[field] = value;
    setHabits(newHabits);
  };

  const updateTrackerSetup = (field: keyof TrackerSetup, value: any) => {
    setTrackerSetup(prev => ({ ...prev, [field]: value }));
  };

  const addBarrier = (barrier: string) => {
    if (barrier && !barriers.includes(barrier)) {
      setBarriers([...barriers, barrier]);
    }
  };

  const removeBarrier = (index: number) => {
    setBarriers(barriers.filter((_, i) => i !== index));
  };

  const addStrategy = (strategy: string) => {
    if (strategy && !strategies.includes(strategy)) {
      setStrategies([...strategies, strategy]);
    }
  };

  const removeStrategy = (index: number) => {
    setStrategies(strategies.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    const data = {
      exerciseId,
      userId,
      habits,
      trackerSetup,
      motivation,
      barriers,
      strategies,
      trackingPeriod: config.trackingPeriod,
      completedAt: new Date(),
      config
    };
    onSubmit(data);
  };

  if (currentStep === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📋 Habit Tracker Setup</h2>
          <p className="text-gray-600">
            Create a personalized habit tracking system for lasting behavior change.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Why Track Habits?</h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• <strong>Awareness:</strong> See your patterns and progress clearly</li>
              <li>• <strong>Motivation:</strong> Visual progress creates momentum</li>
              <li>• <strong>Accountability:</strong> Makes it harder to skip or forget</li>
              <li>• <strong>Adjustment:</strong> Identify what works and what doesn't</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">What You'll Set Up:</h3>
            <ul className="text-green-800 space-y-1 text-sm">
              <li>• Up to {config.maxHabits} habits to track for {config.trackingPeriod} days</li>
              <li>• Specific triggers and rewards for each habit</li>
              <li>• Your preferred tracking method (digital, physical, or both)</li>
              <li>• Strategies for overcoming common obstacles</li>
              {config.includesReminders && <li>• Reminder system to help you stay consistent</li>}
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">🎯 Success Tips:</h3>
            <ul className="text-yellow-800 space-y-1 text-sm">
              <li>• Start with 1-3 habits max—quality over quantity</li>
              <li>• Make habits so small they're impossible to fail</li>
              <li>• Focus on consistency, not perfection</li>
              <li>• Link new habits to existing routines</li>
              <li>• Celebrate small wins to build momentum</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentStep(1)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Set Up Habit Tracker
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
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Habit #{currentHabitIndex + 1}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {currentHabitIndex + 1} of {habits.length}
            </div>
            <div className="flex space-x-2">
              {habits.length < config.maxHabits && (
                <button
                  onClick={addHabit}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  + Add Habit
                </button>
              )}
              {habits.length > 1 && (
                <button
                  onClick={() => removeHabit(currentHabitIndex)}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Habit Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Habit Name *
              </label>
              <input
                type="text"
                value={currentHabit.name}
                onChange={(e) => updateHabit(currentHabitIndex, 'name', e.target.value)}
                placeholder="e.g., Drink water, Meditate, Read"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
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
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (What exactly will you do?)
            </label>
            <input
              type="text"
              value={currentHabit.description}
              onChange={(e) => updateHabit(currentHabitIndex, 'description', e.target.value)}
              placeholder="e.g., Drink one glass of water, Meditate for 5 minutes, Read 1 page"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Frequency and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency
              </label>
              <select
                value={currentHabit.frequency}
                onChange={(e) => updateHabit(currentHabitIndex, 'frequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="daily">Every day</option>
                <option value="weekly">Certain days of the week</option>
                <option value="custom">Custom schedule</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time of Day
              </label>
              <select
                value={currentHabit.timeOfDay}
                onChange={(e) => updateHabit(currentHabitIndex, 'timeOfDay', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="anytime">Anytime</option>
              </select>
            </div>
          </div>

          {/* Custom Days for Weekly Frequency */}
          {currentHabit.frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Which days? (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {daysOfWeek.map(day => (
                  <label key={day} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={currentHabit.customDays?.includes(day) || false}
                      onChange={(e) => {
                        const days = currentHabit.customDays || [];
                        if (e.target.checked) {
                          updateHabit(currentHabitIndex, 'customDays', [...days, day]);
                        } else {
                          updateHabit(currentHabitIndex, 'customDays', days.filter(d => d !== day));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{day.slice(0, 3)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Habit Design */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Habit Design</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trigger: What will remind you to do this habit?
                </label>
                <input
                  type="text"
                  value={currentHabit.trigger}
                  onChange={(e) => updateHabit(currentHabitIndex, 'trigger', e.target.value)}
                  placeholder="e.g., After I brush my teeth, When I sit at my desk, At 7 AM"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Viable Habit: What's the smallest version?
                </label>
                <input
                  type="text"
                  value={currentHabit.minimumViableHabit}
                  onChange={(e) => updateHabit(currentHabitIndex, 'minimumViableHabit', e.target.value)}
                  placeholder="e.g., Put on workout clothes, Open the book, Fill water bottle"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reward: How will you celebrate?
                </label>
                <input
                  type="text"
                  value={currentHabit.reward}
                  onChange={(e) => updateHabit(currentHabitIndex, 'reward', e.target.value)}
                  placeholder="e.g., Say 'Yes!', Check it off, Enjoy a healthy snack"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Tracking Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How do you want to track this habit?
            </label>
            <select
              value={currentHabit.trackingMethod}
              onChange={(e) => updateHabit(currentHabitIndex, 'trackingMethod', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 mb-3"
            >
              <option value="simple">Simple (Yes/No checkbox)</option>
              <option value="numeric">Numeric (Count or amount)</option>
              <option value="duration">Duration (Time spent)</option>
            </select>

            {currentHabit.trackingMethod === 'numeric' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={currentHabit.unit || ''}
                    onChange={(e) => updateHabit(currentHabitIndex, 'unit', e.target.value)}
                    placeholder="e.g., glasses, pages, reps"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daily Target</label>
                  <input
                    type="number"
                    value={currentHabit.target || ''}
                    onChange={(e) => updateHabit(currentHabitIndex, 'target', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Reminder */}
          {config.includesReminders && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Time (optional)
              </label>
              <input
                type="time"
                value={currentHabit.reminderTime || ''}
                onChange={(e) => updateHabit(currentHabitIndex, 'reminderTime', e.target.value)}
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
          
          {currentHabitIndex < habits.length - 1 ? (
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
              Set Up Tracking →
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📱 Tracking System Setup</h2>
          <p className="text-gray-600">Configure how you'll track your habits and stay motivated.</p>
        </div>

        <div className="space-y-6">
          {/* Tracking Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How do you prefer to track your habits?
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="digital"
                  checked={trackerSetup.trackingMethod === 'digital'}
                  onChange={(e) => updateTrackerSetup('trackingMethod', e.target.value)}
                  className="mr-3"
                />
                <span className="text-sm">📱 Digital (Apps, spreadsheets, online tools)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="physical"
                  checked={trackerSetup.trackingMethod === 'physical'}
                  onChange={(e) => updateTrackerSetup('trackingMethod', e.target.value)}
                  className="mr-3"
                />
                <span className="text-sm">📝 Physical (Journal, calendar, sticky notes)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="both"
                  checked={trackerSetup.trackingMethod === 'both'}
                  onChange={(e) => updateTrackerSetup('trackingMethod', e.target.value)}
                  className="mr-3"
                />
                <span className="text-sm">🔄 Both digital and physical</span>
              </label>
            </div>
          </div>

          {/* Digital Method Details */}
          {(trackerSetup.trackingMethod === 'digital' || trackerSetup.trackingMethod === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Digital tracking method:
              </label>
              <input
                type="text"
                value={trackerSetup.digitalMethod}
                onChange={(e) => updateTrackerSetup('digitalMethod', e.target.value)}
                placeholder="e.g., Habitica app, Google Sheets, Apple Notes, Streaks app"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Physical Method Details */}
          {(trackerSetup.trackingMethod === 'physical' || trackerSetup.trackingMethod === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Physical tracking method:
              </label>
              <input
                type="text"
                value={trackerSetup.physicalMethod}
                onChange={(e) => updateTrackerSetup('physicalMethod', e.target.value)}
                placeholder="e.g., Wall calendar with X's, Habit journal, Whiteboard, Index cards"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Review Schedule */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How often will you review your progress?
            </label>
            <select
              value={trackerSetup.reviewSchedule}
              onChange={(e) => updateTrackerSetup('reviewSchedule', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="daily">Daily (quick check-in)</option>
              <option value="weekly">Weekly (detailed review)</option>
              <option value="monthly">Monthly (comprehensive assessment)</option>
            </select>
          </div>

          {/* Accountability Partner */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accountability partner (optional):
            </label>
            <input
              type="text"
              value={trackerSetup.accountabilityPartner}
              onChange={(e) => updateTrackerSetup('accountabilityPartner', e.target.value)}
              placeholder="e.g., Spouse, friend, workout buddy, online community"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Motivation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why are these habits important to you?
            </label>
            <textarea
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Write your personal motivation for building these habits. What will change in your life?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Potential Barriers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What obstacles might prevent you from sticking to these habits?
            </label>
            <div className="space-y-2 mb-3">
              {barriers.map((barrier, index) => (
                <div key={index} className="flex items-center justify-between bg-red-50 p-2 rounded">
                  <span className="text-sm text-red-800">{barrier}</span>
                  <button
                    onClick={() => removeBarrier(index)}
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
                placeholder="Add a potential barrier (e.g., 'Traveling', 'Busy schedule', 'Lack of motivation')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addBarrier((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  addBarrier(input.value);
                  input.value = '';
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Strategies for Overcoming Barriers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How will you overcome these obstacles?
            </label>
            <div className="space-y-2 mb-3">
              {strategies.map((strategy, index) => (
                <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded">
                  <span className="text-sm text-green-800">{strategy}</span>
                  <button
                    onClick={() => removeStrategy(index)}
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
                placeholder="Add a strategy (e.g., 'Pack habits for travel', 'Set phone reminders', 'Find accountability buddy')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addStrategy((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  addStrategy(input.value);
                  input.value = '';
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add
              </button>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">🏆 Your Habit Tracking Success Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-purple-800 text-sm">
              <div>
                <strong>Habits to track:</strong> {habits.filter(h => h.name).length}
              </div>
              <div>
                <strong>Tracking period:</strong> {config.trackingPeriod} days
              </div>
              <div>
                <strong>Review schedule:</strong> {trackerSetup.reviewSchedule}
              </div>
              <div>
                <strong>Method:</strong> {trackerSetup.trackingMethod}
              </div>
            </div>
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
            Complete Habit Tracker Setup
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default HabitTrackerExercise;