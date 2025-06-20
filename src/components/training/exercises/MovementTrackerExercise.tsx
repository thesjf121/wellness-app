import React, { useState } from 'react';

interface MovementTrackerExerciseProps {
  exerciseId: string;
  userId: string;
  onSubmit: (responses: Record<string, any>) => void;
  onCancel: () => void;
  config: {
    trackingPeriod: number;
    categories: string[];
  };
}

interface DayEntry {
  date: string;
  activities: Record<string, { duration: number; intensity: string; notes: string }>;
}

export const MovementTrackerExercise: React.FC<MovementTrackerExerciseProps> = ({
  exerciseId,
  userId,
  onSubmit,
  onCancel,
  config
}) => {
  const [currentDay, setCurrentDay] = useState(0);
  const [weekData, setWeekData] = useState<DayEntry[]>(() => {
    const days = [];
    for (let i = 0; i < config.trackingPeriod; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        activities: config.categories.reduce((acc, category) => {
          acc[category] = { duration: 0, intensity: 'light', notes: '' };
          return acc;
        }, {} as Record<string, { duration: number; intensity: string; notes: string }>)
      });
    }
    return days;
  });

  const handleActivityChange = (category: string, field: string, value: string | number) => {
    setWeekData(prev => {
      const newData = [...prev];
      newData[currentDay] = {
        ...newData[currentDay],
        activities: {
          ...newData[currentDay].activities,
          [category]: {
            ...newData[currentDay].activities[category],
            [field]: value
          }
        }
      };
      return newData;
    });
  };

  const handleSubmit = () => {
    const totalActivities = weekData.reduce((total, day) => {
      return total + Object.values(day.activities).reduce((dayTotal, activity) => {
        return dayTotal + activity.duration;
      }, 0);
    }, 0);

    const responses = {
      weekData,
      totalMinutes: totalActivities,
      averageDaily: totalActivities / config.trackingPeriod,
      completedAt: new Date().toISOString(),
      insights: generateInsights()
    };
    
    onSubmit(responses);
  };

  const generateInsights = () => {
    const totalMinutes = weekData.reduce((total, day) => {
      return total + Object.values(day.activities).reduce((dayTotal, activity) => {
        return dayTotal + activity.duration;
      }, 0);
    }, 0);

    const insights = [];
    const avgDaily = totalMinutes / config.trackingPeriod;

    if (avgDaily >= 30) {
      insights.push('Great job! You\'re meeting the recommended daily activity guidelines.');
    } else if (avgDaily >= 15) {
      insights.push('You\'re on the right track! Try to gradually increase your daily activity.');
    } else {
      insights.push('Small steps count! Focus on adding just 5-10 minutes of movement each day.');
    }

    // Find most common activity
    const categoryTotals = config.categories.reduce((acc, category) => {
      acc[category] = weekData.reduce((total, day) => total + day.activities[category].duration, 0);
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryTotals).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    if (categoryTotals[topCategory] > 0) {
      insights.push(`Your most frequent activity this week was ${topCategory.toLowerCase()}.`);
    }

    return insights;
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const getCurrentDayData = () => weekData[currentDay];
  const isComplete = weekData.every(day => 
    Object.values(day.activities).some(activity => activity.duration > 0)
  );

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Daily Movement Assessment</h2>
        <p className="text-gray-600">
          Track your movement patterns for {config.trackingPeriod} days to understand your current activity level.
          Include all types of movement, not just formal exercise.
        </p>
      </div>

      {/* Day Navigation */}
      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {weekData.map((day, index) => (
            <button
              key={index}
              onClick={() => setCurrentDay(index)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentDay === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div>Day {index + 1}</div>
              <div className="text-xs">{getDayName(day.date)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Day Form */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {getDayName(getCurrentDayData().date)} - {new Date(getCurrentDayData().date).toLocaleDateString()}
        </h3>

        <div className="grid gap-4">
          {config.categories.map((category) => {
            const activity = getCurrentDayData().activities[category];
            return (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">{category}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1440"
                      value={activity.duration}
                      onChange={(e) => handleActivityChange(category, 'duration', parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Intensity
                    </label>
                    <select
                      value={activity.intensity}
                      onChange={(e) => handleActivityChange(category, 'intensity', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="light">Light</option>
                      <option value="moderate">Moderate</option>
                      <option value="vigorous">Vigorous</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <input
                      type="text"
                      value={activity.notes}
                      onChange={(e) => handleActivityChange(category, 'notes', e.target.value)}
                      placeholder="e.g., felt energized"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Weekly Progress</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-blue-600 font-bold text-lg">
              {weekData.reduce((total, day) => 
                total + Object.values(day.activities).reduce((dayTotal, activity) => 
                  dayTotal + activity.duration, 0
                ), 0
              )}
            </div>
            <div className="text-blue-800">Total Minutes</div>
          </div>
          <div>
            <div className="text-blue-600 font-bold text-lg">
              {Math.round(weekData.reduce((total, day) => 
                total + Object.values(day.activities).reduce((dayTotal, activity) => 
                  dayTotal + activity.duration, 0
                ), 0
              ) / config.trackingPeriod)}
            </div>
            <div className="text-blue-800">Daily Average</div>
          </div>
          <div>
            <div className="text-blue-600 font-bold text-lg">
              {weekData.filter(day => 
                Object.values(day.activities).some(activity => activity.duration > 0)
              ).length}
            </div>
            <div className="text-blue-800">Active Days</div>
          </div>
          <div>
            <div className="text-blue-600 font-bold text-lg">
              {weekData.filter(day => 
                Object.values(day.activities).reduce((total, activity) => 
                  total + activity.duration, 0
                ) >= 30
              ).length}
            </div>
            <div className="text-blue-800">30+ Min Days</div>
          </div>
        </div>
      </div>

      {/* Activity Guidelines */}
      <div className="mt-6 bg-green-50 p-4 rounded-lg">
        <h4 className="font-medium text-green-900 mb-2">💡 Activity Guidelines:</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Aim for at least 150 minutes of moderate activity per week</li>
          <li>• Include both planned exercise and daily activities</li>
          <li>• Light: Easy walking, gentle stretching, light household tasks</li>
          <li>• Moderate: Brisk walking, recreational cycling, active games</li>
          <li>• Vigorous: Running, competitive sports, intense workouts</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentDay(Math.max(0, currentDay - 1))}
            disabled={currentDay === 0}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous Day
          </button>
          <button
            onClick={() => setCurrentDay(Math.min(config.trackingPeriod - 1, currentDay + 1))}
            disabled={currentDay === config.trackingPeriod - 1}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next Day
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isComplete}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Complete Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovementTrackerExercise;