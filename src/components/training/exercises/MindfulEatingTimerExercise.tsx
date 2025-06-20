import React, { useState, useEffect } from 'react';

interface MindfulEatingTimerExerciseProps {
  exerciseId: string;
  userId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  config: {
    duration: number;
    prompts: string[];
  };
}

export const MindfulEatingTimerExercise: React.FC<MindfulEatingTimerExerciseProps> = ({
  exerciseId,
  userId,
  onSubmit,
  onCancel,
  config
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(config.duration * 60); // Convert to seconds
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [reflection, setReflection] = useState('');
  const [experienceRating, setExperienceRating] = useState(5);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setIsActive(false);
            setIsCompleted(true);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsActive(false);
      setIsCompleted(true);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, timeRemaining]);

  // Auto-advance prompts
  useEffect(() => {
    if (isActive && !isPaused) {
      const promptInterval = Math.floor((config.duration * 60) / config.prompts.length);
      const elapsed = (config.duration * 60) - timeRemaining;
      const newPromptIndex = Math.min(
        Math.floor(elapsed / promptInterval),
        config.prompts.length - 1
      );
      setCurrentPromptIndex(newPromptIndex);
    }
  }, [timeRemaining, isActive, isPaused, config.duration, config.prompts.length]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    setCurrentStep(1);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeRemaining(config.duration * 60);
    setCurrentPromptIndex(0);
    setCurrentStep(1);
    setIsCompleted(false);
  };

  const handleComplete = () => {
    const data = {
      exerciseId,
      userId,
      duration: config.duration * 60 - timeRemaining,
      reflection,
      experienceRating,
      completedAt: new Date(),
      prompts: config.prompts
    };
    onSubmit(data);
  };

  if (currentStep === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🍽️ Mindful Eating Practice</h2>
          <p className="text-gray-600">
            Take {config.duration} minutes to practice mindful eating with your next meal or snack.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What you'll need:</h3>
            <ul className="text-blue-800 space-y-1">
              <li>• A meal or healthy snack</li>
              <li>• A quiet space without distractions</li>
              <li>• No phone, TV, or other devices</li>
              <li>• An open mindset to focus on the experience</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">During the exercise:</h3>
            <ul className="text-green-800 space-y-1">
              {config.prompts.map((prompt, index) => (
                <li key={index}>• {prompt}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleStart}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Start Mindful Eating Timer
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

  if (currentStep === 1 && !isCompleted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🍽️ Mindful Eating in Progress</h2>
          <div className="text-4xl font-mono text-blue-600 mb-4">
            {formatTime(timeRemaining)}
          </div>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg mb-6 text-center">
          <div className="text-lg font-medium text-yellow-900 mb-2">Current Focus:</div>
          <div className="text-yellow-800 text-lg">
            {config.prompts[currentPromptIndex]}
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={handlePause}
            className={`px-6 py-3 rounded-lg font-medium ${
              isPaused 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            }`}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>
        </div>

        {isPaused && (
          <div className="mt-4 text-center text-gray-600">
            Timer paused. Take your time and resume when ready.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 Mindful Eating Complete!</h2>
        <p className="text-gray-600">How was your mindful eating experience?</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rate your experience (1 = Difficult, 10 = Amazing):
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">1</span>
            <input
              type="range"
              min="1"
              max="10"
              value={experienceRating}
              onChange={(e) => setExperienceRating(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-gray-500">10</span>
            <span className="text-lg font-bold text-blue-600 ml-2">{experienceRating}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reflection: What did you notice during this mindful eating experience?
          </label>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Describe what you noticed about the taste, texture, smell, or your hunger/fullness cues..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">Benefits of Mindful Eating:</h3>
          <ul className="text-green-800 space-y-1 text-sm">
            <li>• Better digestion and nutrient absorption</li>
            <li>• Improved recognition of hunger and fullness cues</li>
            <li>• Reduced emotional eating</li>
            <li>• Greater appreciation and enjoyment of food</li>
            <li>• More conscious food choices</li>
          </ul>
        </div>
      </div>

      <div className="flex space-x-4 mt-6">
        <button
          onClick={handleComplete}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium"
        >
          Complete Exercise
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
};

export default MindfulEatingTimerExercise;