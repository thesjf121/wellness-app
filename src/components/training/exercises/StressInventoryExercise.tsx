import React, { useState } from 'react';

interface StressInventoryExerciseProps {
  exerciseId: string;
  userId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  config: {
    stressAreas: string[];
    symptoms: string[];
    includesActionPlan: boolean;
  };
}

interface StressRating {
  area: string;
  level: number;
  triggers: string[];
  impact: string;
}

interface SymptomRating {
  category: string;
  severity: number;
  frequency: string;
  specificSymptoms: string[];
}

export const StressInventoryExercise: React.FC<StressInventoryExerciseProps> = ({
  exerciseId,
  userId,
  onSubmit,
  onCancel,
  config
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stressRatings, setStressRatings] = useState<StressRating[]>([]);
  const [symptomRatings, setSymptomRatings] = useState<SymptomRating[]>([]);
  const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
  const [actionPlan, setActionPlan] = useState('');
  const [reflection, setReflection] = useState('');
  const [copingStrategies, setCopingStrategies] = useState<string[]>([]);

  // Initialize ratings
  React.useEffect(() => {
    if (stressRatings.length === 0) {
      const ratings = config.stressAreas.map(area => ({
        area,
        level: 3,
        triggers: [],
        impact: ''
      }));
      setStressRatings(ratings);
    }
    
    if (symptomRatings.length === 0) {
      const symptoms = config.symptoms.map(category => ({
        category,
        severity: 2,
        frequency: 'sometimes',
        specificSymptoms: []
      }));
      setSymptomRatings(symptoms);
    }
  }, [config.stressAreas, config.symptoms, stressRatings.length, symptomRatings.length]);

  const updateStressRating = (index: number, field: keyof StressRating, value: any) => {
    const newRatings = [...stressRatings];
    (newRatings[index] as any)[field] = value;
    setStressRatings(newRatings);
  };

  const updateSymptomRating = (index: number, field: keyof SymptomRating, value: any) => {
    const newRatings = [...symptomRatings];
    (newRatings[index] as any)[field] = value;
    setSymptomRatings(newRatings);
  };

  const addTrigger = (areaIndex: number, trigger: string) => {
    if (trigger) {
      const newRatings = [...stressRatings];
      newRatings[areaIndex].triggers.push(trigger);
      setStressRatings(newRatings);
    }
  };

  const removeTrigger = (areaIndex: number, triggerIndex: number) => {
    const newRatings = [...stressRatings];
    newRatings[areaIndex].triggers.splice(triggerIndex, 1);
    setStressRatings(newRatings);
  };

  const addSymptom = (categoryIndex: number, symptom: string) => {
    if (symptom) {
      const newRatings = [...symptomRatings];
      newRatings[categoryIndex].specificSymptoms.push(symptom);
      setSymptomRatings(newRatings);
    }
  };

  const removeSymptom = (categoryIndex: number, symptomIndex: number) => {
    const newRatings = [...symptomRatings];
    newRatings[categoryIndex].specificSymptoms.splice(symptomIndex, 1);
    setSymptomRatings(newRatings);
  };

  const addCopingStrategy = (strategy: string) => {
    if (strategy && !copingStrategies.includes(strategy)) {
      setCopingStrategies([...copingStrategies, strategy]);
    }
  };

  const removeCopingStrategy = (index: number) => {
    setCopingStrategies(copingStrategies.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    const overallStressLevel = stressRatings.reduce((sum, rating) => sum + rating.level, 0) / stressRatings.length;
    const highestStressAreas = stressRatings
      .sort((a, b) => b.level - a.level)
      .slice(0, 3);

    const data = {
      exerciseId,
      userId,
      stressRatings,
      symptomRatings,
      overallStressLevel,
      highestStressAreas,
      copingStrategies,
      actionPlan,
      reflection,
      completedAt: new Date(),
      config
    };
    onSubmit(data);
  };

  const getStressColor = (level: number): string => {
    if (level <= 2) return 'text-green-600';
    if (level <= 4) return 'text-yellow-600';
    if (level <= 6) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStressLabel = (level: number): string => {
    if (level <= 2) return 'Low';
    if (level <= 4) return 'Moderate';
    if (level <= 6) return 'High';
    return 'Very High';
  };

  if (currentStep === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 Personal Stress Assessment</h2>
          <p className="text-gray-600">
            Identify and assess your personal stress levels, triggers, and symptoms to develop a personalized stress management plan.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What you'll assess:</h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Stress levels in different life areas</li>
              <li>• Specific triggers and situations</li>
              <li>• Physical and emotional symptoms</li>
              <li>• Current coping strategies</li>
              <li>• Action plan for stress management</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">Stress Areas We'll Evaluate:</h3>
            <div className="grid grid-cols-2 gap-2 text-yellow-800 text-sm">
              {config.stressAreas.map((area, index) => (
                <div key={index}>• {area}</div>
              ))}
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">Why This Matters:</h3>
            <p className="text-purple-800 text-sm">
              Understanding your stress patterns is the first step in developing effective coping strategies. 
              This assessment will help you identify priority areas and create a personalized action plan.
            </p>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentStep(1)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Start Stress Assessment
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
    const currentRating = stressRatings[currentAreaIndex];
    
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Stress Assessment: {currentRating?.area}
          </h2>
          <div className="text-sm text-gray-600">
            {currentAreaIndex + 1} of {config.stressAreas.length}
          </div>
        </div>

        <div className="space-y-6">
          {/* Stress Level Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How would you rate your stress level in this area? (1 = Very Low, 8 = Very High)
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">1</span>
              <input
                type="range"
                min="1"
                max="8"
                value={currentRating?.level || 3}
                onChange={(e) => updateStressRating(currentAreaIndex, 'level', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-500">8</span>
              <div className="ml-2 text-center">
                <div className={`text-lg font-bold ${getStressColor(currentRating?.level || 3)}`}>
                  {currentRating?.level || 3}
                </div>
                <div className="text-xs text-gray-600">
                  {getStressLabel(currentRating?.level || 3)}
                </div>
              </div>
            </div>
          </div>

          {/* Stress Triggers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What specific triggers cause stress in this area?
            </label>
            <div className="space-y-2 mb-3">
              {currentRating?.triggers.map((trigger, index) => (
                <div key={index} className="flex items-center justify-between bg-red-50 p-2 rounded">
                  <span className="text-sm text-red-800">{trigger}</span>
                  <button
                    onClick={() => removeTrigger(currentAreaIndex, index)}
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
                placeholder="Add a specific trigger (e.g., 'Tight deadlines', 'Financial uncertainty')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addTrigger(currentAreaIndex, (e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  addTrigger(currentAreaIndex, input.value);
                  input.value = '';
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Impact Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How does stress in this area impact your daily life?
            </label>
            <textarea
              value={currentRating?.impact || ''}
              onChange={(e) => updateStressRating(currentAreaIndex, 'impact', e.target.value)}
              placeholder="Describe how stress in this area affects your mood, relationships, sleep, productivity, etc."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
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
          
          {currentAreaIndex < config.stressAreas.length - 1 ? (
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
              Assess Symptoms →
            </button>
          )}
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Stress Symptom Assessment</h2>
          <p className="text-gray-600">Identify how stress manifests in your body and mind.</p>
        </div>

        <div className="space-y-6">
          {symptomRatings.map((symptom, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">{symptom.category}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Severity (1 = Mild, 5 = Severe)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={symptom.severity}
                      onChange={(e) => updateSymptomRating(index, 'severity', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-bold w-4">{symptom.severity}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select
                    value={symptom.frequency}
                    onChange={(e) => updateSymptomRating(index, 'frequency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="never">Never</option>
                    <option value="rarely">Rarely</option>
                    <option value="sometimes">Sometimes</option>
                    <option value="often">Often</option>
                    <option value="always">Always</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specific symptoms you experience:
                </label>
                <div className="space-y-1 mb-2">
                  {symptom.specificSymptoms.map((specificSymptom, symIndex) => (
                    <div key={symIndex} className="flex items-center justify-between bg-white p-2 rounded border">
                      <span className="text-sm">{specificSymptom}</span>
                      <button
                        onClick={() => removeSymptom(index, symIndex)}
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
                    placeholder="Add specific symptom"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addSymptom(index, (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                      addSymptom(index, input.value);
                      input.value = '';
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentStep(1)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back to Stress Areas
          </button>
          <button
            onClick={() => setCurrentStep(3)}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            Create Action Plan →
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 3) {
    const overallStress = stressRatings.reduce((sum, rating) => sum + rating.level, 0) / stressRatings.length;
    const highestStressAreas = stressRatings
      .sort((a, b) => b.level - a.level)
      .slice(0, 3);

    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📋 Your Stress Profile & Action Plan</h2>
          <p className="text-gray-600">Review your assessment results and create your personalized stress management plan.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className={`text-2xl font-bold ${getStressColor(overallStress)}`}>
              {overallStress.toFixed(1)}
            </div>
            <div className="text-sm text-blue-800">Overall Stress Level</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">
              {highestStressAreas[0]?.area.split('/')[0] || 'N/A'}
            </div>
            <div className="text-sm text-red-800">Highest Stress Area</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stressRatings.filter(r => r.level >= 6).length}
            </div>
            <div className="text-sm text-yellow-800">High Stress Areas</div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Current Coping Strategies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What stress management strategies do you currently use?
            </label>
            <div className="space-y-2 mb-3">
              {copingStrategies.map((strategy, index) => (
                <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded">
                  <span className="text-sm text-green-800">{strategy}</span>
                  <button
                    onClick={() => removeCopingStrategy(index)}
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
                placeholder="Add a coping strategy (e.g., 'Deep breathing', 'Exercise', 'Talking to friends')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addCopingStrategy((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  addCopingStrategy(input.value);
                  input.value = '';
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Action Plan */}
          {config.includesActionPlan && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Create your personalized stress management action plan:
              </label>
              <textarea
                value={actionPlan}
                onChange={(e) => setActionPlan(e.target.value)}
                placeholder="Based on your assessment, what specific steps will you take to manage stress? Include daily practices, trigger management, and support strategies."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Reflection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reflection: What insights did you gain from this assessment?
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What surprised you about your stress patterns? How do different stress areas connect? What will you prioritize first?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">🎯 Next Steps for Stress Management:</h3>
            <ul className="text-purple-800 space-y-1 text-sm">
              <li>• Focus on your top 2-3 highest stress areas first</li>
              <li>• Practice one new stress management technique daily</li>
              <li>• Monitor your stress levels weekly using this assessment</li>
              <li>• Build a support network for accountability and encouragement</li>
              <li>• Consider professional help if stress feels overwhelming</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => setCurrentStep(2)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back to Symptoms
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Complete Stress Assessment
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default StressInventoryExercise;