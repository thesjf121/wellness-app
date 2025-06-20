import React, { useState, useEffect, useRef } from 'react';

interface BreathingExerciseProps {
  exerciseId: string;
  userId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  config: {
    technique: string;
    duration: number;
    includesReflection: boolean;
    customInstructions?: string;
  };
}

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'pause';

interface BreathingPattern {
  name: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
  pause: number;
  cycles: number;
}

export const BreathingExercise: React.FC<BreathingExerciseProps> = ({
  exerciseId,
  userId,
  onSubmit,
  onCancel,
  config
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('inhale');
  const [currentCycle, setCurrentCycle] = useState(0);
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [reflection, setReflection] = useState('');
  const [beforeMood, setBeforeMood] = useState(5);
  const [afterMood, setAfterMood] = useState(5);
  const [experience, setExperience] = useState('');
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const breathingPatterns: Record<string, BreathingPattern> = {
    '4-7-8': {
      name: '4-7-8 Breathing',
      description: 'Inhale for 4, hold for 7, exhale for 8. Great for relaxation and sleep.',
      inhale: 4,
      hold: 7,
      exhale: 8,
      pause: 0,
      cycles: 4
    },
    'box': {
      name: 'Box Breathing',
      description: 'Equal timing for all phases (4-4-4-4). Used by Navy SEALs for focus.',
      inhale: 4,
      hold: 4,
      exhale: 4,
      pause: 4,
      cycles: 8
    },
    'coherent': {
      name: 'Coherent Breathing',
      description: '5-second inhale, 5-second exhale. Balances the nervous system.',
      inhale: 5,
      hold: 0,
      exhale: 5,
      pause: 0,
      cycles: 12
    },
    'energizing': {
      name: 'Energizing Breath',
      description: 'Quick inhale, longer exhale to energize while staying calm.',
      inhale: 4,
      hold: 2,
      exhale: 6,
      pause: 0,
      cycles: 10
    }
  };

  const currentPattern = breathingPatterns[config.technique] || breathingPatterns['4-7-8'];

  useEffect(() => {
    if (isActive) {
      startTimeRef.current = Date.now();
      startBreathingCycle();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  const startBreathingCycle = () => {
    setCurrentCycle(0);
    setCurrentPhase('inhale');
    setPhaseTimer(currentPattern.inhale);
    runPhaseTimer();
  };

  const runPhaseTimer = () => {
    intervalRef.current = setInterval(() => {
      setPhaseTimer((prev) => {
        if (prev <= 1) {
          moveToNextPhase();
          return getNextPhaseDuration();
        }
        return prev - 1;
      });

      if (startTimeRef.current) {
        setTotalTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);
  };

  const moveToNextPhase = () => {
    setCurrentPhase((prevPhase) => {
      switch (prevPhase) {
        case 'inhale':
          return currentPattern.hold > 0 ? 'hold' : 'exhale';
        case 'hold':
          return 'exhale';
        case 'exhale':
          return currentPattern.pause > 0 ? 'pause' : 'inhale';
        case 'pause':
          setCurrentCycle((prevCycle) => {
            const nextCycle = prevCycle + 1;
            if (nextCycle >= currentPattern.cycles) {
              completeExercise();
              return prevCycle;
            }
            return nextCycle;
          });
          return 'inhale';
        default:
          return 'inhale';
      }
    });
  };

  const getNextPhaseDuration = (): number => {
    switch (currentPhase) {
      case 'inhale':
        return currentPattern.hold > 0 ? currentPattern.hold : currentPattern.exhale;
      case 'hold':
        return currentPattern.exhale;
      case 'exhale':
        return currentPattern.pause > 0 ? currentPattern.pause : currentPattern.inhale;
      case 'pause':
        return currentPattern.inhale;
      default:
        return currentPattern.inhale;
    }
  };

  const completeExercise = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCurrentStep(2);
  };

  const startExercise = () => {
    setIsActive(true);
    setCurrentStep(1);
  };

  const stopExercise = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleComplete = () => {
    const data = {
      exerciseId,
      userId,
      technique: config.technique,
      duration: totalTime,
      completedCycles: currentCycle,
      beforeMood,
      afterMood,
      experience,
      reflection,
      completedAt: new Date(),
      config
    };
    onSubmit(data);
  };

  const getPhaseInstruction = (): string => {
    switch (currentPhase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      case 'pause':
        return 'Pause';
      default:
        return 'Breathe';
    }
  };

  const getPhaseColor = (): string => {
    switch (currentPhase) {
      case 'inhale':
        return 'text-blue-600';
      case 'hold':
        return 'text-purple-600';
      case 'exhale':
        return 'text-green-600';
      case 'pause':
        return 'text-gray-600';
      default:
        return 'text-blue-600';
    }
  };

  const getCircleSize = (): string => {
    const baseSize = 200;
    const expandedSize = 280;
    
    if (currentPhase === 'inhale') {
      const progress = (currentPattern.inhale - phaseTimer) / currentPattern.inhale;
      const size = baseSize + (expandedSize - baseSize) * progress;
      return `${size}px`;
    } else if (currentPhase === 'exhale') {
      const progress = phaseTimer / currentPattern.exhale;
      const size = expandedSize - (expandedSize - baseSize) * progress;
      return `${size}px`;
    }
    
    return currentPhase === 'hold' ? `${expandedSize}px` : `${baseSize}px`;
  };

  if (currentStep === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🌬️ Breathing Exercise</h2>
          <p className="text-gray-600">
            Practice {currentPattern.name} to reduce stress and promote relaxation.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">{currentPattern.name}</h3>
            <p className="text-blue-800 text-sm mb-3">{currentPattern.description}</p>
            <div className="text-blue-800 text-sm">
              <strong>Pattern:</strong> Inhale {currentPattern.inhale}s
              {currentPattern.hold > 0 && ` → Hold ${currentPattern.hold}s`}
              → Exhale {currentPattern.exhale}s
              {currentPattern.pause > 0 && ` → Pause ${currentPattern.pause}s`}
            </div>
            <div className="text-blue-800 text-sm mt-1">
              <strong>Cycles:</strong> {currentPattern.cycles} repetitions
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Before You Begin:</h3>
            <ul className="text-green-800 space-y-1 text-sm">
              <li>• Find a comfortable seated or lying position</li>
              <li>• Close your eyes or soften your gaze</li>
              <li>• Place one hand on your chest, one on your belly</li>
              <li>• Focus on breathing with your diaphragm (belly should rise)</li>
              <li>• If you feel dizzy, return to normal breathing</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">How are you feeling right now?</h3>
            <p className="text-yellow-800 text-sm mb-3">Rate your current stress/tension level:</p>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-yellow-700">Calm</span>
              <input
                type="range"
                min="1"
                max="10"
                value={beforeMood}
                onChange={(e) => setBeforeMood(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-yellow-700">Stressed</span>
              <span className="text-lg font-bold text-yellow-800 ml-2">{beforeMood}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={startExercise}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Start Breathing Exercise
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
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{currentPattern.name}</h2>
          <div className="text-sm text-gray-600">
            Cycle {currentCycle + 1} of {currentPattern.cycles} • {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}
          </div>
        </div>

        <div className="flex flex-col items-center space-y-8">
          {/* Breathing Circle */}
          <div className="relative flex items-center justify-center">
            <div
              className={`rounded-full border-4 transition-all duration-1000 ease-in-out ${
                currentPhase === 'inhale' ? 'border-blue-300 bg-blue-50' :
                currentPhase === 'hold' ? 'border-purple-300 bg-purple-50' :
                currentPhase === 'exhale' ? 'border-green-300 bg-green-50' :
                'border-gray-300 bg-gray-50'
              }`}
              style={{
                width: getCircleSize(),
                height: getCircleSize(),
              }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`text-4xl font-bold ${getPhaseColor()}`}>
                  {phaseTimer}
                </div>
                <div className={`text-lg ${getPhaseColor()}`}>
                  {getPhaseInstruction()}
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center">
            <div className="text-lg text-gray-700 mb-2">
              {config.customInstructions || `Follow the circle and breathe ${currentPhase === 'inhale' ? 'in slowly' : currentPhase === 'exhale' ? 'out slowly' : 'naturally'}`}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${((currentCycle) / currentPattern.cycles) * 100}%` }}
              ></div>
            </div>
            <div className="text-center text-sm text-gray-600 mt-2">
              Progress: {Math.round(((currentCycle) / currentPattern.cycles) * 100)}%
            </div>
          </div>

          {/* Controls */}
          <div className="flex space-x-4">
            <button
              onClick={stopExercise}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Pause
            </button>
            <button
              onClick={completeExercise}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Complete Early
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 Breathing Exercise Complete</h2>
          <p className="text-gray-600">
            You completed {currentCycle} cycles in {Math.floor(totalTime / 60)} minutes and {totalTime % 60} seconds.
          </p>
        </div>

        <div className="space-y-6">
          {/* Post-Exercise Mood */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-3">How are you feeling now?</h3>
            <p className="text-green-800 text-sm mb-3">Rate your current stress/tension level:</p>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-green-700">Calm</span>
              <input
                type="range"
                min="1"
                max="10"
                value={afterMood}
                onChange={(e) => setAfterMood(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-green-700">Stressed</span>
              <span className="text-lg font-bold text-green-800 ml-2">{afterMood}</span>
            </div>
            {afterMood < beforeMood && (
              <div className="mt-2 text-sm text-green-700">
                Great! Your stress level decreased by {beforeMood - afterMood} points.
              </div>
            )}
          </div>

          {/* Experience Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your experience during the breathing exercise:
            </label>
            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="How did your body feel? What did you notice about your breathing? Any challenges or insights?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Reflection */}
          {config.includesReflection && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reflection: How might you use breathing exercises in your daily life?
              </label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="When might this technique be most helpful? How could you remember to use it during stressful moments?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Tips for Daily Practice:</h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Practice breathing exercises at the same time each day to build a habit</li>
              <li>• Use breathing techniques before stressful situations (meetings, exams, etc.)</li>
              <li>• Try short 1-2 minute sessions when you feel overwhelmed</li>
              <li>• Combine with other mindfulness practices for greater benefits</li>
              <li>• Notice how different techniques affect you and choose your favorites</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => setCurrentStep(0)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Try Again
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Complete Exercise
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default BreathingExercise;