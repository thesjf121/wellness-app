import React, { useState } from 'react';

interface MoodTrackingExerciseProps {
  exerciseId: string;
  userId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  config: {
    trackingDays: number;
    emotions: string[];
    intensityScale: number;
    includesTriggers: boolean;
    includesReflection: boolean;
  };
}

interface MoodEntry {
  date: string;
  emotions: { emotion: string; intensity: number }[];
  triggers: string[];
  notes: string;
  overallMood: number;
}

export const MoodTrackingExercise: React.FC<MoodTrackingExerciseProps> = ({
  exerciseId,
  userId,
  onSubmit,
  onCancel,
  config
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [reflection, setReflection] = useState('');
  const [patterns, setPatterns] = useState('');

  // Initialize mood entries
  React.useEffect(() => {
    if (moodEntries.length === 0) {
      const entries: MoodEntry[] = [];
      const today = new Date();
      
      for (let i = 0; i < config.trackingDays; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (config.trackingDays - 1 - i));
        
        entries.push({
          date: date.toDateString(),
          emotions: [],
          triggers: [],
          notes: '',
          overallMood: 5
        });
      }
      
      setMoodEntries(entries);
    }
  }, [config.trackingDays, moodEntries.length]);

  const updateMoodEntry = (dayIndex: number, field: keyof MoodEntry, value: any) => {
    const newEntries = [...moodEntries];
    (newEntries[dayIndex] as any)[field] = value;
    setMoodEntries(newEntries);
  };

  const addEmotion = (dayIndex: number, emotion: string) => {
    const newEntries = [...moodEntries];
    const existing = newEntries[dayIndex].emotions.find(e => e.emotion === emotion);
    
    if (!existing) {
      newEntries[dayIndex].emotions.push({ emotion, intensity: 5 });
      setMoodEntries(newEntries);
    }
  };

  const updateEmotionIntensity = (dayIndex: number, emotion: string, intensity: number) => {
    const newEntries = [...moodEntries];
    const emotionEntry = newEntries[dayIndex].emotions.find(e => e.emotion === emotion);
    
    if (emotionEntry) {
      emotionEntry.intensity = intensity;
      setMoodEntries(newEntries);
    }
  };

  const removeEmotion = (dayIndex: number, emotion: string) => {
    const newEntries = [...moodEntries];
    newEntries[dayIndex].emotions = newEntries[dayIndex].emotions.filter(e => e.emotion !== emotion);
    setMoodEntries(newEntries);
  };

  const addTrigger = (dayIndex: number, trigger: string) => {
    if (trigger && !moodEntries[dayIndex].triggers.includes(trigger)) {
      const newEntries = [...moodEntries];
      newEntries[dayIndex].triggers.push(trigger);
      setMoodEntries(newEntries);
    }
  };

  const removeTrigger = (dayIndex: number, triggerIndex: number) => {
    const newEntries = [...moodEntries];
    newEntries[dayIndex].triggers.splice(triggerIndex, 1);
    setMoodEntries(newEntries);
  };

  const handleComplete = () => {
    const data = {
      exerciseId,
      userId,
      moodEntries,
      reflection,
      patterns,
      completedAt: new Date(),
      config
    };
    onSubmit(data);
  };

  const getEmotionColor = (emotion: string): string => {
    const colors: Record<string, string> = {
      'Happy': 'text-yellow-600 bg-yellow-100',
      'Sad': 'text-blue-600 bg-blue-100',
      'Angry': 'text-red-600 bg-red-100',
      'Anxious': 'text-purple-600 bg-purple-100',
      'Excited': 'text-green-600 bg-green-100',
      'Frustrated': 'text-orange-600 bg-orange-100',
      'Calm': 'text-teal-600 bg-teal-100',
      'Overwhelmed': 'text-gray-600 bg-gray-100'
    };
    return colors[emotion] || 'text-gray-600 bg-gray-100';
  };

  if (currentStep === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 Mood & Emotion Tracking</h2>
          <p className="text-gray-600">
            Track your emotions and moods for {config.trackingDays} days to develop emotional awareness and identify patterns.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What you'll do:</h3>
            <ul className="text-blue-800 space-y-1">
              <li>• Record emotions you experienced each day</li>
              <li>• Rate the intensity of each emotion (1-10)</li>
              <li>• Note triggers or situations that influenced your mood</li>
              <li>• Reflect on patterns and insights</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Available emotions to track:</h3>
            <div className="flex flex-wrap gap-2">
              {config.emotions.map((emotion) => (
                <span
                  key={emotion}
                  className={`px-2 py-1 rounded text-sm ${getEmotionColor(emotion)}`}
                >
                  {emotion}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentStep(1)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Start Mood Tracking
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
    const currentEntry = moodEntries[currentDayIndex];
    
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            📅 {currentEntry?.date}
          </h2>
          <div className="text-sm text-gray-600">
            Day {currentDayIndex + 1} of {config.trackingDays}
          </div>
        </div>

        <div className="space-y-6">
          {/* Overall Mood Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall mood for this day (1 = Very Low, 10 = Very High):
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">😔 1</span>
              <input
                type="range"
                min="1"
                max="10"
                value={currentEntry?.overallMood || 5}
                onChange={(e) => updateMoodEntry(currentDayIndex, 'overallMood', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-500">😊 10</span>
              <span className="text-lg font-bold text-blue-600 ml-2">
                {currentEntry?.overallMood || 5}
              </span>
            </div>
          </div>

          {/* Emotion Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select emotions you experienced today:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {config.emotions.map((emotion) => {
                const isSelected = currentEntry?.emotions.some(e => e.emotion === emotion);
                return (
                  <button
                    key={emotion}
                    onClick={() => {
                      if (isSelected) {
                        removeEmotion(currentDayIndex, emotion);
                      } else {
                        addEmotion(currentDayIndex, emotion);
                      }
                    }}
                    className={`p-2 rounded text-sm font-medium border transition-all ${
                      isSelected
                        ? `${getEmotionColor(emotion)} border-current`
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {emotion}
                  </button>
                );
              })}
            </div>

            {/* Emotion Intensity Sliders */}
            {currentEntry?.emotions.map((emotionEntry) => (
              <div key={emotionEntry.emotion} className="bg-gray-50 p-3 rounded-lg mb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{emotionEntry.emotion}</span>
                  <button
                    onClick={() => removeEmotion(currentDayIndex, emotionEntry.emotion)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-500">Low</span>
                  <input
                    type="range"
                    min="1"
                    max={config.intensityScale}
                    value={emotionEntry.intensity}
                    onChange={(e) => updateEmotionIntensity(currentDayIndex, emotionEntry.emotion, parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-500">High</span>
                  <span className="text-sm font-bold w-6">{emotionEntry.intensity}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Triggers */}
          {config.includesTriggers && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What triggered these emotions? (situations, events, thoughts)
              </label>
              <div className="space-y-2 mb-3">
                {currentEntry?.triggers.map((trigger, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{trigger}</span>
                    <button
                      onClick={() => removeTrigger(currentDayIndex, index)}
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
                  placeholder="Add a trigger (e.g., work stress, argument, good news)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addTrigger(currentDayIndex, (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                    addTrigger(currentDayIndex, input.value);
                    input.value = '';
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Daily Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional notes about your emotional state today:
            </label>
            <textarea
              value={currentEntry?.notes || ''}
              onChange={(e) => updateMoodEntry(currentDayIndex, 'notes', e.target.value)}
              placeholder="How did you feel today? What influenced your emotions?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentDayIndex(Math.max(0, currentDayIndex - 1))}
            disabled={currentDayIndex === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous Day
          </button>
          
          {currentDayIndex < config.trackingDays - 1 ? (
            <button
              onClick={() => setCurrentDayIndex(currentDayIndex + 1)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Next Day →
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              Analyze Patterns →
            </button>
          )}
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    const avgMood = moodEntries.reduce((sum, entry) => sum + entry.overallMood, 0) / moodEntries.length;
    const mostCommonEmotion = moodEntries
      .flatMap(entry => entry.emotions.map(e => e.emotion))
      .reduce((acc, emotion) => {
        acc[emotion] = (acc[emotion] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    const topEmotion = Object.entries(mostCommonEmotion)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📈 Your Mood Patterns</h2>
          <p className="text-gray-600">Review your emotional patterns and insights from the past week.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{avgMood.toFixed(1)}</div>
            <div className="text-sm text-blue-800">Average Mood</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{topEmotion}</div>
            <div className="text-sm text-green-800">Most Common Emotion</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">
              {moodEntries.filter(e => e.emotions.length > 0).length}
            </div>
            <div className="text-sm text-purple-800">Days with Tracked Emotions</div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What patterns do you notice in your emotions and moods?
            </label>
            <textarea
              value={patterns}
              onChange={(e) => setPatterns(e.target.value)}
              placeholder="Do certain emotions occur together? Are there specific triggers? What days tend to be better or worse?"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {config.includesReflection && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reflection: What insights have you gained about your emotional patterns?
              </label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="How can you use this awareness to better manage your emotions? What strategies might help?"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Benefits of Mood Tracking:</h3>
            <ul className="text-green-800 space-y-1 text-sm">
              <li>• Increased emotional self-awareness</li>
              <li>• Better recognition of patterns and triggers</li>
              <li>• Improved ability to anticipate and manage emotions</li>
              <li>• Enhanced communication about your emotional needs</li>
              <li>• Better decision-making about self-care strategies</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => setCurrentStep(1)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back to Tracking
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Complete Mood Tracking Exercise
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default MoodTrackingExercise;