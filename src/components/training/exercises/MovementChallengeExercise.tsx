import React, { useState } from 'react';

interface MovementChallengeExerciseProps {
  exerciseId: string;
  userId: string;
  onSubmit: (responses: Record<string, any>) => void;
  onCancel: () => void;
  config: {
    duration: number;
    challenges: string[];
  };
}

interface ChallengeDay {
  day: number;
  challenge: string;
  completed: boolean;
  notes: string;
  completedAt?: string;
}

export const MovementChallengeExercise: React.FC<MovementChallengeExerciseProps> = ({
  exerciseId,
  userId,
  onSubmit,
  onCancel,
  config
}) => {
  const [challengeDays, setChallengedays] = useState<ChallengeDay[]>(() => 
    config.challenges.map((challenge, index) => ({
      day: index + 1,
      challenge,
      completed: false,
      notes: '',
      completedAt: undefined
    }))
  );

  const [currentDay, setCurrentDay] = useState(0);

  const handleDayComplete = (dayIndex: number, completed: boolean) => {
    setChallengedays(prev => prev.map((day, index) => 
      index === dayIndex 
        ? { 
            ...day, 
            completed, 
            completedAt: completed ? new Date().toISOString() : undefined 
          }
        : day
    ));
  };

  const handleNotesChange = (dayIndex: number, notes: string) => {
    setChallengedays(prev => prev.map((day, index) => 
      index === dayIndex ? { ...day, notes } : day
    ));
  };

  const handleSubmit = () => {
    const completedCount = challengeDays.filter(day => day.completed).length;
    const completionRate = (completedCount / config.duration) * 100;
    
    const responses = {
      challengeDays,
      completedCount,
      totalDays: config.duration,
      completionRate,
      submittedAt: new Date().toISOString(),
      feedback: generateFeedback(completionRate)
    };
    
    onSubmit(responses);
  };

  const generateFeedback = (completionRate: number) => {
    if (completionRate === 100) {
      return {
        message: "Outstanding! You completed every challenge!",
        encouragement: "You've shown great commitment to building healthy movement habits. Keep this momentum going!",
        nextSteps: "Consider creating your own movement challenges or increasing the intensity of activities you enjoyed."
      };
    } else if (completionRate >= 70) {
      return {
        message: "Great job! You completed most of the challenges!",
        encouragement: "You're well on your way to building consistent movement habits. Every day you moved made a difference.",
        nextSteps: "Focus on the types of activities you enjoyed most and try to incorporate them into your regular routine."
      };
    } else if (completionRate >= 40) {
      return {
        message: "Good start! You made progress on your movement journey.",
        encouragement: "Building new habits takes time. What matters is that you started and learned about different ways to move.",
        nextSteps: "Choose 1-2 activities that felt manageable and try to do them consistently for the next week."
      };
    } else {
      return {
        message: "Every step counts, even the small ones!",
        encouragement: "Starting is often the hardest part, and you took that important first step. Don't be discouraged.",
        nextSteps: "Pick just one simple movement (like a 5-minute walk) and focus on doing it daily for the next week."
      };
    }
  };

  const getCurrentDay = () => challengeDays[currentDay];
  const completedCount = challengeDays.filter(day => day.completed).length;
  const allCompleted = challengeDays.every(day => day.completed);

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">7-Day Mini Movement Challenge</h2>
        <p className="text-gray-600">
          Complete a simple movement activity each day for a week. The goal is to explore different 
          types of movement and build momentum for a more active lifestyle.
        </p>
      </div>

      {/* Progress Overview */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Challenge Progress</h3>
          <div className="text-2xl font-bold text-blue-600">
            {completedCount}/{config.duration}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500" 
            style={{ width: `${(completedCount / config.duration) * 100}%` }}
          ></div>
        </div>
        <div className="text-sm text-gray-600 mt-2">
          {Math.round((completedCount / config.duration) * 100)}% Complete
        </div>
      </div>

      {/* Day Selector */}
      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {challengeDays.map((day, index) => (
            <button
              key={index}
              onClick={() => setCurrentDay(index)}
              className={`flex-shrink-0 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                currentDay === index
                  ? 'bg-blue-600 text-white shadow-lg'
                  : day.completed
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center space-x-1">
                <span>Day {day.day}</span>
                {day.completed && <span>✅</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Day Challenge */}
      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Day {getCurrentDay().day} Challenge
              </h3>
              <p className="text-lg text-gray-700 mt-2">
                {getCurrentDay().challenge}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDayComplete(currentDay, !getCurrentDay().completed)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  getCurrentDay().completed
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {getCurrentDay().completed ? 'Completed ✅' : 'Mark Complete'}
              </button>
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How did it go? (Optional)
            </label>
            <textarea
              rows={3}
              value={getCurrentDay().notes}
              onChange={(e) => handleNotesChange(currentDay, e.target.value)}
              placeholder="Share your experience: How did you feel? What did you enjoy? Any challenges?"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {getCurrentDay().completed && getCurrentDay().completedAt && (
            <div className="mt-3 text-sm text-green-600">
              ✅ Completed on {new Date(getCurrentDay().completedAt!).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Tips for Current Challenge */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">💡 Tips for Today's Challenge:</h4>
          <div className="text-sm text-yellow-800">
            {currentDay === 0 && (
              <ul className="space-y-1">
                <li>• Start with a comfortable pace</li>
                <li>• Focus on enjoying the movement rather than speed</li>
                <li>• Notice how you feel before and after</li>
              </ul>
            )}
            {currentDay === 1 && (
              <ul className="space-y-1">
                <li>• Keep your knees aligned over your toes</li>
                <li>• Go only as low as comfortable</li>
                <li>• Use a chair for support if needed</li>
              </ul>
            )}
            {currentDay === 2 && (
              <ul className="space-y-1">
                <li>• Hold each stretch for 15-30 seconds</li>
                <li>• Breathe deeply and relax into the stretch</li>
                <li>• Focus on major muscle groups</li>
              </ul>
            )}
            {currentDay === 3 && (
              <ul className="space-y-1">
                <li>• Look for opportunities throughout the day</li>
                <li>• Take one step at a time if needed</li>
                <li>• Use handrails for safety</li>
              </ul>
            )}
            {currentDay === 4 && (
              <ul className="space-y-1">
                <li>• Choose music that makes you feel good</li>
                <li>• Let yourself move freely and have fun</li>
                <li>• No judgment - just enjoy the rhythm</li>
              </ul>
            )}
            {currentDay === 5 && (
              <ul className="space-y-1">
                <li>• Stand arm's length from the wall</li>
                <li>• Keep your body straight as you push</li>
                <li>• Modify angle to adjust difficulty</li>
              </ul>
            )}
            {currentDay === 6 && (
              <ul className="space-y-1">
                <li>• Focus on a fixed point for stability</li>
                <li>• Use a wall or chair for support if needed</li>
                <li>• Start with just a few seconds and build up</li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* All Challenges Overview */}
      {completedCount > 0 && (
        <div className="mt-6 bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900 mb-3">Your Progress So Far:</h4>
          <div className="grid gap-2">
            {challengeDays.filter(day => day.completed).map((day) => (
              <div key={day.day} className="flex items-center text-sm text-green-800">
                <span className="w-6">✅</span>
                <span className="flex-1">Day {day.day}: {day.challenge}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
            onClick={() => setCurrentDay(Math.min(config.duration - 1, currentDay + 1))}
            disabled={currentDay === config.duration - 1}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next Day
          </button>
          <button
            onClick={handleSubmit}
            disabled={completedCount === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {allCompleted ? 'Complete Challenge! 🎉' : 'Submit Progress'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovementChallengeExercise;