import React, { useState, useEffect, useRef } from 'react';

interface GuidedMeditationExerciseProps {
  exerciseId: string;
  userId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  config: {
    meditationType: string;
    duration: number;
    includesReflection: boolean;
    customInstructions?: string;
  };
}

interface MeditationStep {
  id: string;
  title: string;
  instruction: string;
  duration: number;
  audioDescription?: string;
}

interface MeditationProgram {
  name: string;
  description: string;
  totalDuration: number;
  steps: MeditationStep[];
}

export const GuidedMeditationExercise: React.FC<GuidedMeditationExerciseProps> = ({
  exerciseId,
  userId,
  onSubmit,
  onCancel,
  config
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepTimer, setStepTimer] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [beforeMood, setBeforeMood] = useState(5);
  const [afterMood, setAfterMood] = useState(5);
  const [clarity, setClarity] = useState(5);
  const [experience, setExperience] = useState('');
  const [reflection, setReflection] = useState('');
  const [insights, setInsights] = useState<string[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const meditationPrograms: Record<string, MeditationProgram> = {
    'body_scan': {
      name: 'Body Scan Meditation',
      description: 'Progressive awareness of physical sensations throughout the body',
      totalDuration: 600, // 10 minutes
      steps: [
        {
          id: 'settling',
          title: 'Settling In',
          instruction: 'Find a comfortable position. Close your eyes and take three deep breaths. Allow your body to relax with each exhale.',
          duration: 60
        },
        {
          id: 'feet',
          title: 'Feet & Legs',
          instruction: 'Bring your attention to your feet. Notice any sensations - warmth, coolness, tingling, or tension. Slowly move your awareness up through your calves, knees, and thighs.',
          duration: 120
        },
        {
          id: 'torso',
          title: 'Torso & Arms',
          instruction: 'Shift your focus to your lower back and abdomen. Notice your breathing. Move your attention to your chest, shoulders, and down through your arms to your fingertips.',
          duration: 120
        },
        {
          id: 'neck_head',
          title: 'Neck & Head',
          instruction: 'Focus on your neck and throat. Move your awareness to your face - jaw, cheeks, eyes, forehead. Notice any tension and allow it to soften.',
          duration: 90
        },
        {
          id: 'whole_body',
          title: 'Whole Body Awareness',
          instruction: 'Now expand your awareness to your entire body. Feel yourself as a complete, integrated whole. Rest in this full-body awareness.',
          duration: 120
        },
        {
          id: 'closing',
          title: 'Closing',
          instruction: 'Take a few deeper breaths. Gently wiggle your fingers and toes. When ready, slowly open your eyes and return to the room.',
          duration: 90
        }
      ]
    },
    'loving_kindness': {
      name: 'Loving-Kindness Meditation',
      description: 'Cultivate compassion and goodwill toward yourself and others',
      totalDuration: 480, // 8 minutes
      steps: [
        {
          id: 'centering',
          title: 'Centering',
          instruction: 'Sit comfortably and close your eyes. Take a few deep breaths and allow your body to relax. Bring to mind the feeling of being loved.',
          duration: 60
        },
        {
          id: 'self',
          title: 'Self-Compassion',
          instruction: 'Direct loving-kindness toward yourself. Silently repeat: "May I be happy. May I be healthy. May I be at peace. May I live with ease." Feel these wishes for yourself.',
          duration: 120
        },
        {
          id: 'loved_one',
          title: 'Loved One',
          instruction: 'Bring to mind someone you care about deeply. Send them loving-kindness: "May you be happy. May you be healthy. May you be at peace. May you live with ease."',
          duration: 90
        },
        {
          id: 'neutral',
          title: 'Neutral Person',
          instruction: 'Think of someone neutral - perhaps someone you see regularly but don\'t know well. Extend the same wishes: "May you be happy. May you be healthy. May you be at peace."',
          duration: 90
        },
        {
          id: 'difficult',
          title: 'Difficult Person',
          instruction: 'Bring to mind someone you have difficulty with. This may be challenging. Gently offer: "May you be happy. May you be healthy. May you be at peace."',
          duration: 60
        },
        {
          id: 'all_beings',
          title: 'All Beings',
          instruction: 'Expand your loving-kindness to all beings everywhere: "May all beings be happy. May all beings be healthy. May all beings be at peace." Rest in this universal compassion.',
          duration: 60
        }
      ]
    },
    'mindfulness': {
      name: 'Mindfulness of Breath',
      description: 'Develop focused attention and present-moment awareness',
      totalDuration: 360, // 6 minutes
      steps: [
        {
          id: 'preparation',
          title: 'Preparation',
          instruction: 'Sit with your back straight but not rigid. Close your eyes or soften your gaze. Take three intentional deep breaths to arrive in this moment.',
          duration: 60
        },
        {
          id: 'natural_breath',
          title: 'Natural Breathing',
          instruction: 'Allow your breathing to return to its natural rhythm. Simply observe your breath without trying to change it. Notice where you feel it most clearly.',
          duration: 90
        },
        {
          id: 'counting',
          title: 'Counting Breaths',
          instruction: 'Begin counting each exhale from 1 to 10, then start over. If you lose count or your mind wanders, gently return to 1. This is normal and part of the practice.',
          duration: 120
        },
        {
          id: 'qualities',
          title: 'Breath Qualities',
          instruction: 'Stop counting and simply observe your breath. Notice its temperature, depth, rhythm. When thoughts arise, acknowledge them and return to the breath.',
          duration: 60
        },
        {
          id: 'closing',
          title: 'Closing',
          instruction: 'Appreciate this time you\'ve given yourself. Take a moment to set an intention for carrying this mindfulness into your day. Gently open your eyes.',
          duration: 30
        }
      ]
    }
  };

  const currentProgram = meditationPrograms[config.meditationType] || meditationPrograms['mindfulness'];

  useEffect(() => {
    if (isActive) {
      startTimeRef.current = Date.now();
      setStepTimer(currentProgram.steps[currentStepIndex].duration);
      runTimer();
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
  }, [isActive, currentStepIndex]);

  const runTimer = () => {
    intervalRef.current = setInterval(() => {
      setStepTimer((prev) => {
        if (prev <= 1) {
          moveToNextStep();
          return 0;
        }
        return prev - 1;
      });

      if (startTimeRef.current) {
        setTotalTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);
  };

  const moveToNextStep = () => {
    if (currentStepIndex < currentProgram.steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setStepTimer(currentProgram.steps[nextIndex].duration);
    } else {
      completeMeditation();
    }
  };

  const completeMeditation = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCurrentStep(2);
  };

  const startMeditation = () => {
    setIsActive(true);
    setCurrentStep(1);
    setCurrentStepIndex(0);
  };

  const pauseMeditation = () => {
    setIsActive(false);
  };

  const resumeMeditation = () => {
    setIsActive(true);
  };

  const addInsight = (insight: string) => {
    if (insight && !insights.includes(insight)) {
      setInsights([...insights, insight]);
    }
  };

  const removeInsight = (index: number) => {
    setInsights(insights.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    const data = {
      exerciseId,
      userId,
      meditationType: config.meditationType,
      duration: totalTime,
      completedSteps: currentStepIndex + 1,
      totalSteps: currentProgram.steps.length,
      beforeMood,
      afterMood,
      clarity,
      experience,
      reflection,
      insights,
      completedAt: new Date(),
      config
    };
    onSubmit(data);
  };

  const getCurrentStepProgress = (): number => {
    const currentStepDuration = currentProgram.steps[currentStepIndex]?.duration || 1;
    return ((currentStepDuration - stepTimer) / currentStepDuration) * 100;
  };

  const getOverallProgress = (): number => {
    const completedSteps = currentStepIndex;
    const currentStepProgress = getCurrentStepProgress() / 100;
    return ((completedSteps + currentStepProgress) / currentProgram.steps.length) * 100;
  };

  if (currentStep === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🧘 Guided Meditation</h2>
          <p className="text-gray-600">
            {currentProgram.name} - {Math.floor(currentProgram.totalDuration / 60)} minutes
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">{currentProgram.name}</h3>
            <p className="text-purple-800 text-sm mb-3">{currentProgram.description}</p>
            <div className="text-purple-800 text-sm">
              <strong>Duration:</strong> {Math.floor(currentProgram.totalDuration / 60)} minutes ({currentProgram.steps.length} steps)
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Meditation Steps:</h3>
            <div className="space-y-2">
              {currentProgram.steps.map((step, index) => (
                <div key={step.id} className="text-blue-800 text-sm flex justify-between">
                  <span>{index + 1}. {step.title}</span>
                  <span>{Math.floor(step.duration / 60)}:{(step.duration % 60).toString().padStart(2, '0')}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Preparation Tips:</h3>
            <ul className="text-green-800 space-y-1 text-sm">
              <li>• Find a quiet space where you won't be disturbed</li>
              <li>• Sit comfortably with your back straight</li>
              <li>• Turn off notifications and distractions</li>
              <li>• It's normal for your mind to wander - gently return focus</li>
              <li>• Don't judge your experience, just observe</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">How are you feeling right now?</h3>
            <p className="text-yellow-800 text-sm mb-3">Rate your current stress/anxiety level:</p>
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
              <span className="text-sm text-yellow-700">Anxious</span>
              <span className="text-lg font-bold text-yellow-800 ml-2">{beforeMood}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={startMeditation}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Begin Meditation
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
    const currentStepData = currentProgram.steps[currentStepIndex];
    
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{currentProgram.name}</h2>
          <div className="text-sm text-gray-600">
            Step {currentStepIndex + 1} of {currentProgram.steps.length} • {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}
          </div>
        </div>

        <div className="space-y-8">
          {/* Current Step */}
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-purple-900 mb-4">
              {currentStepData.title}
            </h3>
            <div className="max-w-2xl mx-auto">
              <p className="text-lg text-gray-700 leading-relaxed">
                {currentStepData.instruction}
              </p>
            </div>
          </div>

          {/* Timer Circle */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.floor(stepTimer / 60)}:{(stepTimer % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-gray-600">remaining</div>
                </div>
              </div>
              <svg className="absolute top-0 left-0 w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-purple-600"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - getCurrentStepProgress() / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
            </div>
          </div>

          {/* Step Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step Progress</span>
              <span>{Math.round(getCurrentStepProgress())}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${getCurrentStepProgress()}%` }}
              ></div>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Overall Progress</span>
              <span>{Math.round(getOverallProgress())}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-700 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${getOverallProgress()}%` }}
              ></div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            {isActive ? (
              <button
                onClick={pauseMeditation}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Pause
              </button>
            ) : (
              <button
                onClick={resumeMeditation}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Resume
              </button>
            )}
            <button
              onClick={() => moveToNextStep()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next Step
            </button>
            <button
              onClick={completeMeditation}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Complete
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🌟 Meditation Complete</h2>
          <p className="text-gray-600">
            You completed {currentStepIndex + 1} of {currentProgram.steps.length} steps in {Math.floor(totalTime / 60)} minutes and {totalTime % 60} seconds.
          </p>
        </div>

        <div className="space-y-6">
          {/* Post-Meditation Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-3">Stress/Anxiety Level</h3>
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
                <span className="text-sm text-green-700">Anxious</span>
                <span className="text-lg font-bold text-green-800 ml-2">{afterMood}</span>
              </div>
              {afterMood < beforeMood && (
                <div className="mt-2 text-sm text-green-700">
                  Improvement: -{beforeMood - afterMood} points
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3">Mental Clarity</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-blue-700">Foggy</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={clarity}
                  onChange={(e) => setClarity(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-blue-700">Clear</span>
                <span className="text-lg font-bold text-blue-800 ml-2">{clarity}</span>
              </div>
            </div>
          </div>

          {/* Experience Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your meditation experience:
            </label>
            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="What did you notice during the meditation? How did your mind and body respond? Any challenges or peaceful moments?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Insights */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key insights or realizations:
            </label>
            <div className="space-y-2 mb-3">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-center justify-between bg-purple-50 p-2 rounded">
                  <span className="text-sm text-purple-800">{insight}</span>
                  <button
                    onClick={() => removeInsight(index)}
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
                placeholder="Add an insight (e.g., 'I noticed my mind wandering less', 'Felt more connected to my body')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addInsight((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  addInsight(input.value);
                  input.value = '';
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Reflection */}
          {config.includesReflection && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reflection: How will you integrate this practice into your life?
              </label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="When might you practice meditation? What benefits do you hope to gain? How can you remember to make time for it?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          )}

          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-900 mb-2">🙏 Meditation Benefits:</h3>
            <ul className="text-indigo-800 space-y-1 text-sm">
              <li>• Regular practice improves focus and emotional regulation</li>
              <li>• Even short sessions (5-10 minutes) can reduce stress</li>
              <li>• Consistency matters more than duration</li>
              <li>• Try different meditation types to find what resonates</li>
              <li>• Be patient—benefits often develop gradually over time</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => setCurrentStep(0)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Meditate Again
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

export default GuidedMeditationExercise;