import React, { useState } from 'react';

interface WellnessVisionBuilderExerciseProps {
  exerciseId: string;
  userId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  config: {
    visionAreas: string[];
    timeHorizons: string[];
    includesImagery: boolean;
    includesValues: boolean;
  };
}

interface VisionArea {
  area: string;
  currentState: string;
  desiredState: string;
  feelings: string[];
  visualImagery: string;
  keyElements: string[];
}

interface CoreValue {
  value: string;
  description: string;
  importance: number;
  currentAlignment: number;
  visionConnection: string;
}

interface VisionStatement {
  timeHorizon: string;
  statement: string;
  keyThemes: string[];
  emotionalCore: string;
}

export const WellnessVisionBuilderExercise: React.FC<WellnessVisionBuilderExerciseProps> = ({
  exerciseId,
  userId,
  onSubmit,
  onCancel,
  config
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
  const [visionAreas, setVisionAreas] = useState<VisionArea[]>([]);
  const [coreValues, setCoreValues] = useState<CoreValue[]>([]);
  const [visionStatements, setVisionStatements] = useState<VisionStatement[]>([]);
  const [overallVision, setOverallVision] = useState('');
  const [visionTitle, setVisionTitle] = useState('');
  const [actionableSteps, setActionableSteps] = useState<string[]>([]);
  const [motivation, setMotivation] = useState('');

  // Initialize vision areas
  React.useEffect(() => {
    if (visionAreas.length === 0) {
      const areas = config.visionAreas.map(area => ({
        area,
        currentState: '',
        desiredState: '',
        feelings: [],
        visualImagery: '',
        keyElements: []
      }));
      setVisionAreas(areas);
    }
  }, [config.visionAreas, visionAreas.length]);

  // Initialize core values if enabled
  React.useEffect(() => {
    if (config.includesValues && coreValues.length === 0) {
      const defaultValues = [
        { value: '', description: '', importance: 8, currentAlignment: 5, visionConnection: '' },
        { value: '', description: '', importance: 8, currentAlignment: 5, visionConnection: '' },
        { value: '', description: '', importance: 8, currentAlignment: 5, visionConnection: '' }
      ];
      setCoreValues(defaultValues);
    }
  }, [config.includesValues, coreValues.length]);

  // Initialize vision statements
  React.useEffect(() => {
    if (visionStatements.length === 0) {
      const statements = config.timeHorizons.map(horizon => ({
        timeHorizon: horizon,
        statement: '',
        keyThemes: [],
        emotionalCore: ''
      }));
      setVisionStatements(statements);
    }
  }, [config.timeHorizons, visionStatements.length]);

  const updateVisionArea = (index: number, field: keyof VisionArea, value: any) => {
    const newAreas = [...visionAreas];
    (newAreas[index] as any)[field] = value;
    setVisionAreas(newAreas);
  };

  const addAreaFeeling = (areaIndex: number, feeling: string) => {
    if (feeling) {
      const newAreas = [...visionAreas];
      newAreas[areaIndex].feelings.push(feeling);
      setVisionAreas(newAreas);
    }
  };

  const removeAreaFeeling = (areaIndex: number, feelingIndex: number) => {
    const newAreas = [...visionAreas];
    newAreas[areaIndex].feelings.splice(feelingIndex, 1);
    setVisionAreas(newAreas);
  };

  const addAreaElement = (areaIndex: number, element: string) => {
    if (element) {
      const newAreas = [...visionAreas];
      newAreas[areaIndex].keyElements.push(element);
      setVisionAreas(newAreas);
    }
  };

  const removeAreaElement = (areaIndex: number, elementIndex: number) => {
    const newAreas = [...visionAreas];
    newAreas[areaIndex].keyElements.splice(elementIndex, 1);
    setVisionAreas(newAreas);
  };

  const updateCoreValue = (index: number, field: keyof CoreValue, value: any) => {
    const newValues = [...coreValues];
    (newValues[index] as any)[field] = value;
    setCoreValues(newValues);
  };

  const addCoreValue = () => {
    const newValue: CoreValue = {
      value: '',
      description: '',
      importance: 8,
      currentAlignment: 5,
      visionConnection: ''
    };
    setCoreValues([...coreValues, newValue]);
  };

  const removeCoreValue = (index: number) => {
    if (coreValues.length > 1) {
      setCoreValues(coreValues.filter((_, i) => i !== index));
    }
  };

  const updateVisionStatement = (index: number, field: keyof VisionStatement, value: any) => {
    const newStatements = [...visionStatements];
    (newStatements[index] as any)[field] = value;
    setVisionStatements(newStatements);
  };

  const addTheme = (statementIndex: number, theme: string) => {
    if (theme) {
      const newStatements = [...visionStatements];
      newStatements[statementIndex].keyThemes.push(theme);
      setVisionStatements(newStatements);
    }
  };

  const removeTheme = (statementIndex: number, themeIndex: number) => {
    const newStatements = [...visionStatements];
    newStatements[statementIndex].keyThemes.splice(themeIndex, 1);
    setVisionStatements(newStatements);
  };

  const addActionableStep = (step: string) => {
    if (step && !actionableSteps.includes(step)) {
      setActionableSteps([...actionableSteps, step]);
    }
  };

  const removeActionableStep = (index: number) => {
    setActionableSteps(actionableSteps.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    const data = {
      exerciseId,
      userId,
      visionAreas,
      coreValues: config.includesValues ? coreValues : [],
      visionStatements,
      overallVision,
      visionTitle,
      actionableSteps,
      motivation,
      completedAt: new Date(),
      config
    };
    onSubmit(data);
  };

  const getAreaTitle = (area: string): string => {
    const titles: Record<string, string> = {
      physical: 'Physical Health & Vitality',
      mental: 'Mental Clarity & Focus',
      emotional: 'Emotional Well-being',
      social: 'Social Connections & Relationships',
      spiritual: 'Purpose & Meaning',
      lifestyle: 'Lifestyle & Daily Experience'
    };
    return titles[area] || area.charAt(0).toUpperCase() + area.slice(1);
  };

  const getAreaIcon = (area: string): string => {
    const icons: Record<string, string> = {
      physical: '💪',
      mental: '🧠',
      emotional: '❤️',
      social: '👥',
      spiritual: '🌟',
      lifestyle: '🌈'
    };
    return icons[area] || '✨';
  };

  const getTimeHorizonLabel = (horizon: string): string => {
    const labels: Record<string, string> = {
      '1_year': '1 Year Vision',
      '3_years': '3 Year Vision',
      '5_years': '5 Year Vision'
    };
    return labels[horizon] || horizon.replace('_', ' ');
  };

  if (currentStep === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🌟 Personal Wellness Vision Creation</h2>
          <p className="text-gray-600">
            Create a compelling, inspiring vision of your healthiest, most vibrant self.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Why Create a Wellness Vision?</h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• <strong>Direction:</strong> Provides a clear North Star for your wellness journey</li>
              <li>• <strong>Motivation:</strong> Creates emotional pull toward your desired future</li>
              <li>• <strong>Decision Making:</strong> Helps you choose actions aligned with your vision</li>
              <li>• <strong>Resilience:</strong> Sustains you through challenges and setbacks</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Vision Areas We'll Explore:</h3>
            <div className="grid grid-cols-2 gap-2">
              {config.visionAreas.map((area, index) => (
                <div key={index} className="flex items-center text-green-800 text-sm">
                  <span className="mr-2">{getAreaIcon(area)}</span>
                  <span>{getAreaTitle(area)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">Vision Building Process:</h3>
            <ol className="text-purple-800 space-y-1 text-sm list-decimal list-inside">
              <li>Explore each wellness dimension in detail</li>
              {config.includesValues && <li>Identify your core values and their connection to wellness</li>}
              <li>Create time-specific vision statements ({config.timeHorizons.length} horizons)</li>
              <li>Craft your unified wellness vision</li>
              <li>Identify actionable steps to begin living your vision</li>
            </ol>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">💡 Vision Creation Tips:</h3>
            <ul className="text-yellow-800 space-y-1 text-sm">
              <li>• Write in present tense as if you're already living it</li>
              <li>• Include specific, sensory details and emotions</li>
              <li>• Make it personal and meaningful to you</li>
              <li>• Balance aspiration with achievability</li>
              <li>• Focus on how you'll feel, not just what you'll do</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentStep(1)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Start Vision Creation
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
    const currentArea = visionAreas[currentAreaIndex];
    
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {getAreaIcon(currentArea.area)} {getAreaTitle(currentArea.area)}
          </h2>
          <div className="text-sm text-gray-600">
            {currentAreaIndex + 1} of {config.visionAreas.length}
          </div>
        </div>

        <div className="space-y-6">
          {/* Current State */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current State: How would you describe this area of your wellness right now?
            </label>
            <textarea
              value={currentArea.currentState}
              onChange={(e) => updateVisionArea(currentAreaIndex, 'currentState', e.target.value)}
              placeholder="Be honest about where you are now - this helps create a meaningful vision for growth"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Desired State */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Desired State: Describe your ideal vision for this area (write in present tense):
            </label>
            <textarea
              value={currentArea.desiredState}
              onChange={(e) => updateVisionArea(currentAreaIndex, 'desiredState', e.target.value)}
              placeholder="I am... I feel... I experience... (Write as if you're already living your vision)"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Feelings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How do you want to FEEL in this area of your life?
            </label>
            <div className="space-y-2 mb-3">
              {currentArea.feelings.map((feeling, index) => (
                <div key={index} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                  <span className="text-sm text-blue-800">{feeling}</span>
                  <button
                    onClick={() => removeAreaFeeling(currentAreaIndex, index)}
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
                placeholder="Add a feeling (e.g., 'energized', 'confident', 'peaceful', 'strong')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addAreaFeeling(currentAreaIndex, (e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  addAreaFeeling(currentAreaIndex, input.value);
                  input.value = '';
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Visual Imagery */}
          {config.includesImagery && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visual Imagery: What does this area look like in your vision?
              </label>
              <textarea
                value={currentArea.visualImagery}
                onChange={(e) => updateVisionArea(currentAreaIndex, 'visualImagery', e.target.value)}
                placeholder="Paint a picture with words - what do you see, hear, feel, smell? Be specific and vivid"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Key Elements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Elements: What specific things are part of your vision for this area?
            </label>
            <div className="space-y-2 mb-3">
              {currentArea.keyElements.map((element, index) => (
                <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded">
                  <span className="text-sm text-green-800">{element}</span>
                  <button
                    onClick={() => removeAreaElement(currentAreaIndex, index)}
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
                placeholder="Add a key element (e.g., 'morning yoga routine', 'hiking in nature', 'cooking healthy meals')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addAreaElement(currentAreaIndex, (e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  addAreaElement(currentAreaIndex, input.value);
                  input.value = '';
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
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
          
          {currentAreaIndex < config.visionAreas.length - 1 ? (
            <button
              onClick={() => setCurrentAreaIndex(currentAreaIndex + 1)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Next Area →
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(config.includesValues ? 2 : 3)}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              {config.includesValues ? 'Core Values →' : 'Vision Statements →'}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (currentStep === 2 && config.includesValues) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">⭐ Core Values & Wellness</h2>
          <p className="text-gray-600">Identify your core values and how they connect to your wellness vision.</p>
        </div>

        <div className="space-y-6">
          {coreValues.map((value, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Core Value #{index + 1}</h3>
                {coreValues.length > 1 && (
                  <button
                    onClick={() => removeCoreValue(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Core Value *
                    </label>
                    <input
                      type="text"
                      value={value.value}
                      onChange={(e) => updateCoreValue(index, 'value', e.target.value)}
                      placeholder="e.g., Authenticity, Growth, Connection, Excellence"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What does this value mean to you?
                    </label>
                    <input
                      type="text"
                      value={value.description}
                      onChange={(e) => updateCoreValue(index, 'description', e.target.value)}
                      placeholder="Brief description of what this value means in your life"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Importance (1-10)
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={value.importance}
                        onChange={(e) => updateCoreValue(index, 'importance', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-lg font-bold text-blue-600 w-8">{value.importance}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Alignment (1-10)
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={value.currentAlignment}
                        onChange={(e) => updateCoreValue(index, 'currentAlignment', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-lg font-bold text-green-600 w-8">{value.currentAlignment}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How does your wellness vision honor this value?
                  </label>
                  <textarea
                    value={value.visionConnection}
                    onChange={(e) => updateCoreValue(index, 'visionConnection', e.target.value)}
                    placeholder="Describe how living your wellness vision will align with and express this core value"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="text-center">
            <button
              onClick={addCoreValue}
              className="px-6 py-3 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-blue-600 hover:text-blue-700"
            >
              + Add Another Core Value
            </button>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Values & Wellness Connection:</h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Your wellness vision should deeply align with your core values</li>
              <li>• When wellness practices honor your values, they feel meaningful and sustainable</li>
              <li>• Use your values as a filter for choosing which wellness practices to pursue</li>
              <li>• Values-driven wellness creates intrinsic motivation that lasts</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => setCurrentStep(1)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back to Vision Areas
          </button>
          <button
            onClick={() => setCurrentStep(3)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Create Vision Statements →
          </button>
        </div>
      </div>
    );
  }

  const nextStep = config.includesValues ? 3 : 2;
  if (currentStep === nextStep) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🎯 Time-Specific Vision Statements</h2>
          <p className="text-gray-600">Create compelling vision statements for different time horizons.</p>
        </div>

        <div className="space-y-6">
          {visionStatements.map((statement, index) => (
            <div key={statement.timeHorizon} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">
                {getTimeHorizonLabel(statement.timeHorizon)}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vision Statement (write in present tense as if you're living it now):
                  </label>
                  <textarea
                    value={statement.statement}
                    onChange={(e) => updateVisionStatement(index, 'statement', e.target.value)}
                    placeholder="I am living a vibrant, healthy life where..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Themes for this time horizon:
                  </label>
                  <div className="space-y-2 mb-3">
                    {statement.keyThemes.map((theme, themeIndex) => (
                      <div key={themeIndex} className="flex items-center justify-between bg-purple-50 p-2 rounded">
                        <span className="text-sm text-purple-800">{theme}</span>
                        <button
                          onClick={() => removeTheme(index, themeIndex)}
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
                      placeholder="Add a theme (e.g., 'Adventure', 'Balance', 'Community', 'Mastery')"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addTheme(index, (e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                        addTheme(index, input.value);
                        input.value = '';
                      }}
                      className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emotional Core: How do you feel in this vision?
                  </label>
                  <input
                    type="text"
                    value={statement.emotionalCore}
                    onChange={(e) => updateVisionStatement(index, 'emotionalCore', e.target.value)}
                    placeholder="e.g., 'Deeply fulfilled, energized, and at peace with who I've become'"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">🌟 Vision Statement Guidelines:</h3>
            <ul className="text-green-800 space-y-1 text-sm">
              <li>• Write in present tense ("I am..." not "I will be...")</li>
              <li>• Include specific, sensory details that make it feel real</li>
              <li>• Focus on how you feel and who you've become, not just what you do</li>
              <li>• Make it personal and meaningful to you</li>
              <li>• Let each time horizon build on the previous one</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => setCurrentStep(config.includesValues ? 2 : 1)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back
          </button>
          <button
            onClick={() => setCurrentStep(nextStep + 1)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Create Unified Vision →
          </button>
        </div>
      </div>
    );
  }

  const finalStep = config.includesValues ? 4 : 3;
  if (currentStep === finalStep) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🌈 Your Unified Wellness Vision</h2>
          <p className="text-gray-600">Bring everything together into your personal wellness vision statement.</p>
        </div>

        <div className="space-y-6">
          {/* Vision Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Give your wellness vision a powerful title:
            </label>
            <input
              type="text"
              value={visionTitle}
              onChange={(e) => setVisionTitle(e.target.value)}
              placeholder="e.g., 'My Vibrant, Authentic Life', 'Living with Energy and Purpose', 'My Integrated Wellness Journey'"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Overall Vision */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Unified Wellness Vision Statement:
            </label>
            <textarea
              value={overallVision}
              onChange={(e) => setOverallVision(e.target.value)}
              placeholder="Integrate all your vision areas, values, and time horizons into one inspiring statement about your healthiest, most vibrant self..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Motivation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why is this vision important to you? What will achieving it mean?
            </label>
            <textarea
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Connect to your deeper why - what will living this vision enable in your life? How will it impact those you care about?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Actionable Steps */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Steps: What can you start doing THIS WEEK to move toward your vision?
            </label>
            <div className="space-y-2 mb-3">
              {actionableSteps.map((step, index) => (
                <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded">
                  <span className="text-sm text-green-800">{step}</span>
                  <button
                    onClick={() => removeActionableStep(index)}
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
                placeholder="Add an actionable step (e.g., 'Take a 10-minute walk daily', 'Meal prep on Sundays')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addActionableStep((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  addActionableStep(input.value);
                  input.value = '';
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add
              </button>
            </div>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-900 mb-2">🚀 Making Your Vision Real:</h3>
            <ul className="text-indigo-800 space-y-1 text-sm">
              <li>• Read your vision regularly to keep it alive and motivating</li>
              <li>• Use it as a filter for decisions: "Does this move me toward my vision?"</li>
              <li>• Update and refine it as you grow and learn</li>
              <li>• Share it with supportive people who can help you stay accountable</li>
              <li>• Connect daily actions to your larger vision for sustained motivation</li>
              <li>• Celebrate progress toward your vision, however small</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => setCurrentStep(nextStep)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back to Vision Statements
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Complete Vision Creation
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default WellnessVisionBuilderExercise;