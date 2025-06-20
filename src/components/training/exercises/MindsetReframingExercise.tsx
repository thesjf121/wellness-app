import React, { useState } from 'react';

interface MindsetReframingExerciseProps {
  exerciseId: string;
  userId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  config: {
    scenarios: string[];
    reframingTechniques: string[];
  };
}

interface ReframingEntry {
  scenario: string;
  automaticThought: string;
  emotions: string[];
  evidenceFor: string;
  evidenceAgainst: string;
  alternativePerspectives: string[];
  reframedThought: string;
  newEmotions: string[];
}

export const MindsetReframingExercise: React.FC<MindsetReframingExerciseProps> = ({
  exerciseId,
  userId,
  onSubmit,
  onCancel,
  config
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [reframingEntries, setReframingEntries] = useState<ReframingEntry[]>([]);
  const [reflection, setReflection] = useState('');
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);

  const emotionOptions = [
    'Anxious', 'Angry', 'Frustrated', 'Disappointed', 'Overwhelmed',
    'Sad', 'Worried', 'Confident', 'Calm', 'Hopeful', 'Determined', 'Optimistic'
  ];

  // Initialize selected scenarios and entries
  React.useEffect(() => {
    if (selectedScenarios.length === 0) {
      // Start with 3 scenarios for a manageable exercise
      const scenarios = config.scenarios.slice(0, 3);
      setSelectedScenarios(scenarios);
      
      const entries = scenarios.map(scenario => ({
        scenario,
        automaticThought: '',
        emotions: [],
        evidenceFor: '',
        evidenceAgainst: '',
        alternativePerspectives: [],
        reframedThought: '',
        newEmotions: []
      }));
      
      setReframingEntries(entries);
    }
  }, [config.scenarios, selectedScenarios.length]);

  const updateEntry = (index: number, field: keyof ReframingEntry, value: any) => {
    const newEntries = [...reframingEntries];
    (newEntries[index] as any)[field] = value;
    setReframingEntries(newEntries);
  };

  const addArrayItem = (index: number, field: 'emotions' | 'alternativePerspectives' | 'newEmotions', item: string) => {
    if (item && !reframingEntries[index][field].includes(item)) {
      const newEntries = [...reframingEntries];
      (newEntries[index][field] as string[]).push(item);
      setReframingEntries(newEntries);
    }
  };

  const removeArrayItem = (index: number, field: 'emotions' | 'alternativePerspectives' | 'newEmotions', itemIndex: number) => {
    const newEntries = [...reframingEntries];
    (newEntries[index][field] as string[]).splice(itemIndex, 1);
    setReframingEntries(newEntries);
  };

  const handleComplete = () => {
    const data = {
      exerciseId,
      userId,
      reframingEntries,
      reflection,
      completedAt: new Date(),
      config
    };
    onSubmit(data);
  };

  if (currentStep === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🧠 Cognitive Reframing Exercise</h2>
          <p className="text-gray-600">
            Learn to identify and challenge negative thought patterns to develop more balanced thinking.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What is Cognitive Reframing?</h3>
            <p className="text-blue-800 text-sm">
              Cognitive reframing is a technique that helps you identify negative or unhelpful thought patterns 
              and replace them with more balanced, realistic thoughts. This can reduce stress and improve emotional well-being.
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">You'll practice with these scenarios:</h3>
            <ul className="text-green-800 space-y-1 text-sm">
              {selectedScenarios.map((scenario, index) => (
                <li key={index}>• {scenario}</li>
              ))}
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">Reframing Techniques We'll Use:</h3>
            <ul className="text-yellow-800 space-y-1 text-sm">
              {config.reframingTechniques.map((technique, index) => (
                <li key={index}>• {technique}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentStep(1)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Start Reframing Exercise
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
    const currentEntry = reframingEntries[currentScenarioIndex];
    
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Scenario {currentScenarioIndex + 1}: Cognitive Reframing
          </h2>
          <div className="text-sm text-gray-600">
            {currentScenarioIndex + 1} of {selectedScenarios.length}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Scenario:</h3>
          <p className="text-blue-800">{currentEntry?.scenario}</p>
        </div>

        <div className="space-y-6">
          {/* Step 1: Automatic Thought */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              1. What is your first, automatic thought in this situation?
            </label>
            <textarea
              value={currentEntry?.automaticThought || ''}
              onChange={(e) => updateEntry(currentScenarioIndex, 'automaticThought', e.target.value)}
              placeholder="Write the immediate, negative thought that comes to mind..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Step 2: Initial Emotions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              2. What emotions does this thought create?
            </label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-3">
              {emotionOptions.filter(emotion => ['Anxious', 'Angry', 'Frustrated', 'Disappointed', 'Overwhelmed', 'Sad', 'Worried'].includes(emotion)).map((emotion) => {
                const isSelected = currentEntry?.emotions.includes(emotion);
                return (
                  <button
                    key={emotion}
                    onClick={() => {
                      if (isSelected) {
                        const index = currentEntry.emotions.indexOf(emotion);
                        removeArrayItem(currentScenarioIndex, 'emotions', index);
                      } else {
                        addArrayItem(currentScenarioIndex, 'emotions', emotion);
                      }
                    }}
                    className={`p-2 rounded text-sm font-medium border transition-all ${
                      isSelected
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {emotion}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Evidence For */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              3. What evidence supports this negative thought?
            </label>
            <textarea
              value={currentEntry?.evidenceFor || ''}
              onChange={(e) => updateEntry(currentScenarioIndex, 'evidenceFor', e.target.value)}
              placeholder="List facts (not opinions) that support this thought..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Step 4: Evidence Against */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              4. What evidence contradicts this thought?
            </label>
            <textarea
              value={currentEntry?.evidenceAgainst || ''}
              onChange={(e) => updateEntry(currentScenarioIndex, 'evidenceAgainst', e.target.value)}
              placeholder="List facts that challenge this negative thought..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Step 5: Alternative Perspectives */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              5. What are some alternative ways to view this situation?
            </label>
            <div className="space-y-2 mb-3">
              {currentEntry?.alternativePerspectives.map((perspective, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm">{perspective}</span>
                  <button
                    onClick={() => removeArrayItem(currentScenarioIndex, 'alternativePerspectives', index)}
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
                placeholder="Add an alternative perspective..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addArrayItem(currentScenarioIndex, 'alternativePerspectives', (e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  addArrayItem(currentScenarioIndex, 'alternativePerspectives', input.value);
                  input.value = '';
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Step 6: Reframed Thought */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              6. Create a more balanced, realistic thought:
            </label>
            <textarea
              value={currentEntry?.reframedThought || ''}
              onChange={(e) => updateEntry(currentScenarioIndex, 'reframedThought', e.target.value)}
              placeholder="Write a more balanced thought based on the evidence and alternative perspectives..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Step 7: New Emotions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              7. How do you feel with this reframed thought?
            </label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {emotionOptions.filter(emotion => ['Confident', 'Calm', 'Hopeful', 'Determined', 'Optimistic'].includes(emotion)).map((emotion) => {
                const isSelected = currentEntry?.newEmotions.includes(emotion);
                return (
                  <button
                    key={emotion}
                    onClick={() => {
                      if (isSelected) {
                        const index = currentEntry.newEmotions.indexOf(emotion);
                        removeArrayItem(currentScenarioIndex, 'newEmotions', index);
                      } else {
                        addArrayItem(currentScenarioIndex, 'newEmotions', emotion);
                      }
                    }}
                    className={`p-2 rounded text-sm font-medium border transition-all ${
                      isSelected
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {emotion}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentScenarioIndex(Math.max(0, currentScenarioIndex - 1))}
            disabled={currentScenarioIndex === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous Scenario
          </button>
          
          {currentScenarioIndex < selectedScenarios.length - 1 ? (
            <button
              onClick={() => setCurrentScenarioIndex(currentScenarioIndex + 1)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Next Scenario →
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              Complete & Reflect →
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🎯 Reframing Complete!</h2>
          <p className="text-gray-600">Reflect on your experience with cognitive reframing.</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">Your Reframing Summary:</h3>
          <div className="space-y-3">
            {reframingEntries.map((entry, index) => (
              <div key={index} className="bg-white p-3 rounded border">
                <div className="font-medium text-gray-900 mb-1">Scenario {index + 1}</div>
                <div className="text-sm text-gray-600 mb-2">Original: "{entry.automaticThought}"</div>
                <div className="text-sm text-green-700">Reframed: "{entry.reframedThought}"</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reflection: How was your experience with cognitive reframing?
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Which reframing techniques were most helpful? How did your emotions change? What will you do differently in similar situations?"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">🎯 Key Reframing Techniques:</h3>
            <ul className="text-green-800 space-y-1 text-sm">
              <li>• <strong>Evidence examination:</strong> Look for facts that support or contradict your thoughts</li>
              <li>• <strong>Alternative perspectives:</strong> Consider how others might view the situation</li>
              <li>• <strong>Worst/best/likely outcomes:</strong> Consider realistic possibilities, not just extremes</li>
              <li>• <strong>Learning opportunities:</strong> Ask "What can I learn from this situation?"</li>
            </ul>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">💡 Using This in Daily Life:</h3>
            <ul className="text-purple-800 space-y-1 text-sm">
              <li>• Notice when you have strong negative emotions</li>
              <li>• Pause and identify the thought behind the emotion</li>
              <li>• Ask yourself: "Is this thought helpful? Is it completely accurate?"</li>
              <li>• Practice reframing regularly—it gets easier with time</li>
              <li>• Be patient with yourself—changing thought patterns takes practice</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => setCurrentStep(1)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back to Scenarios
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Complete Reframing Exercise
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default MindsetReframingExercise;