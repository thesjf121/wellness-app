import React, { useState } from 'react';

interface SleepAuditExerciseProps {
  exerciseId: string;
  userId: string;
  onSubmit: (responses: Record<string, any>) => void;
  onCancel: () => void;
  config: {
    categories: string[];
  };
}

interface SleepQuestion {
  id: string;
  category: string;
  question: string;
  type: 'scale' | 'multiple' | 'time' | 'text';
  options?: string[];
  scale?: { min: number; max: number; labels: string[] };
}

export const SleepAuditExercise: React.FC<SleepAuditExerciseProps> = ({
  exerciseId,
  userId,
  onSubmit,
  onCancel,
  config
}) => {
  const questions: SleepQuestion[] = [
    // Sleep Schedule
    {
      id: 'bedtime',
      category: 'Sleep Schedule',
      question: 'What time do you usually go to bed on weeknights?',
      type: 'time'
    },
    {
      id: 'wake_time',
      category: 'Sleep Schedule',
      question: 'What time do you usually wake up on weekdays?',
      type: 'time'
    },
    {
      id: 'schedule_consistency',
      category: 'Sleep Schedule',
      question: 'How consistent is your sleep schedule throughout the week?',
      type: 'scale',
      scale: { min: 1, max: 5, labels: ['Very inconsistent', 'Somewhat inconsistent', 'Neutral', 'Fairly consistent', 'Very consistent'] }
    },
    
    // Sleep Environment
    {
      id: 'room_temperature',
      category: 'Sleep Environment',
      question: 'How would you rate your bedroom temperature for sleep?',
      type: 'scale',
      scale: { min: 1, max: 5, labels: ['Too hot/cold', 'Somewhat uncomfortable', 'Okay', 'Comfortable', 'Perfect'] }
    },
    {
      id: 'noise_level',
      category: 'Sleep Environment',
      question: 'How noisy is your sleep environment?',
      type: 'scale',
      scale: { min: 1, max: 5, labels: ['Very noisy', 'Somewhat noisy', 'Moderate', 'Fairly quiet', 'Very quiet'] }
    },
    {
      id: 'light_exposure',
      category: 'Sleep Environment',
      question: 'How dark is your bedroom when you sleep?',
      type: 'scale',
      scale: { min: 1, max: 5, labels: ['Very bright', 'Somewhat bright', 'Moderate', 'Fairly dark', 'Very dark'] }
    },
    
    // Bedtime Routine
    {
      id: 'routine_consistency',
      category: 'Bedtime Routine',
      question: 'Do you have a consistent bedtime routine?',
      type: 'multiple',
      options: ['Yes, very consistent', 'Somewhat consistent', 'Occasionally', 'Rarely', 'No routine']
    },
    {
      id: 'screen_time',
      category: 'Bedtime Routine',
      question: 'How often do you use screens (phone, TV, tablet) within 1 hour of bedtime?',
      type: 'multiple',
      options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
    },
    {
      id: 'relaxation_activities',
      category: 'Bedtime Routine',
      question: 'What relaxing activities do you do before bed? (Select all that apply)',
      type: 'text'
    },
    
    // Daytime Habits
    {
      id: 'caffeine_timing',
      category: 'Daytime Habits',
      question: 'When do you typically have your last caffeinated drink?',
      type: 'multiple',
      options: ['Before 12 PM', '12-2 PM', '2-4 PM', '4-6 PM', 'After 6 PM', 'I don\'t drink caffeine']
    },
    {
      id: 'exercise_timing',
      category: 'Daytime Habits',
      question: 'When do you typically exercise?',
      type: 'multiple',
      options: ['Morning (6-10 AM)', 'Midday (10 AM-2 PM)', 'Afternoon (2-6 PM)', 'Evening (6-9 PM)', 'Night (after 9 PM)', 'I don\'t exercise regularly']
    },
    {
      id: 'nap_frequency',
      category: 'Daytime Habits',
      question: 'How often do you take naps during the day?',
      type: 'multiple',
      options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Daily']
    },
    
    // Sleep Quality
    {
      id: 'fall_asleep_time',
      category: 'Sleep Quality',
      question: 'How long does it typically take you to fall asleep?',
      type: 'multiple',
      options: ['Less than 10 minutes', '10-20 minutes', '20-30 minutes', '30-60 minutes', 'More than 60 minutes']
    },
    {
      id: 'night_awakenings',
      category: 'Sleep Quality',
      question: 'How often do you wake up during the night?',
      type: 'multiple',
      options: ['Never', 'Rarely (1-2 times/month)', 'Sometimes (1-2 times/week)', 'Often (3-4 times/week)', 'Nightly']
    },
    {
      id: 'sleep_satisfaction',
      category: 'Sleep Quality',
      question: 'How satisfied are you with your sleep quality overall?',
      type: 'scale',
      scale: { min: 1, max: 5, labels: ['Very unsatisfied', 'Somewhat unsatisfied', 'Neutral', 'Satisfied', 'Very satisfied'] }
    },
    
    // Energy Levels
    {
      id: 'morning_energy',
      category: 'Energy Levels',
      question: 'How do you typically feel when you wake up?',
      type: 'scale',
      scale: { min: 1, max: 5, labels: ['Exhausted', 'Tired', 'Neutral', 'Refreshed', 'Energized'] }
    },
    {
      id: 'daytime_fatigue',
      category: 'Energy Levels',
      question: 'How often do you feel tired or fatigued during the day?',
      type: 'multiple',
      options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
    },
    {
      id: 'afternoon_slump',
      category: 'Energy Levels',
      question: 'Do you experience an afternoon energy crash?',
      type: 'multiple',
      options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
    }
  ];

  const [responses, setResponses] = useState<Record<string, any>>({});
  const [currentSection, setCurrentSection] = useState(0);

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = () => {
    const categoryScores = calculateCategoryScores();
    const recommendations = generateRecommendations(categoryScores);
    const overallScore = Object.values(categoryScores).reduce((sum: number, score) => sum + (score as number), 0) / Object.keys(categoryScores).length;

    const submissionData = {
      responses,
      categoryScores,
      overallScore,
      recommendations,
      completedAt: new Date().toISOString()
    };
    
    onSubmit(submissionData);
  };

  const calculateCategoryScores = () => {
    const scores: Record<string, number> = {};
    
    config.categories.forEach(category => {
      const categoryQuestions = questions.filter(q => q.category === category);
      let categoryScore = 0;
      let questionCount = 0;

      categoryQuestions.forEach(question => {
        const response = responses[question.id];
        if (response !== undefined) {
          let score = 0;
          
          if (question.type === 'scale') {
            score = response;
          } else if (question.type === 'multiple') {
            // Convert multiple choice to score based on position (healthier choices = higher scores)
            const optionIndex = question.options?.indexOf(response) || 0;
            score = 5 - optionIndex; // Reverse score for most questions
            
            // Special cases where higher index is better
            if (question.id === 'routine_consistency' || question.id === 'light_exposure') {
              score = optionIndex + 1;
            }
          }
          
          categoryScore += score;
          questionCount++;
        }
      });

      scores[category] = questionCount > 0 ? categoryScore / questionCount : 0;
    });

    return scores;
  };

  const generateRecommendations = (scores: Record<string, number>) => {
    const recommendations: string[] = [];

    Object.entries(scores).forEach(([category, score]) => {
      if (score < 3) {
        switch (category) {
          case 'Sleep Schedule':
            recommendations.push('Try to maintain consistent bedtimes and wake times, even on weekends');
            break;
          case 'Sleep Environment':
            recommendations.push('Optimize your bedroom: keep it cool (60-67°F), dark, and quiet');
            break;
          case 'Bedtime Routine':
            recommendations.push('Establish a relaxing bedtime routine and avoid screens 1 hour before bed');
            break;
          case 'Daytime Habits':
            recommendations.push('Limit caffeine after 2 PM and avoid late evening exercise');
            break;
          case 'Sleep Quality':
            recommendations.push('If you have trouble falling asleep or staying asleep, consider speaking with a healthcare provider');
            break;
          case 'Energy Levels':
            recommendations.push('Focus on consistent sleep schedule and quality to improve daytime energy');
            break;
        }
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('Great job! Your sleep habits look healthy. Keep maintaining these good practices.');
    }

    return recommendations;
  };

  const getCurrentSectionQuestions = () => {
    const sectionCategories = config.categories;
    const currentCategory = sectionCategories[currentSection];
    return questions.filter(q => q.category === currentCategory);
  };

  const isCurrentSectionComplete = () => {
    const sectionQuestions = getCurrentSectionQuestions();
    return sectionQuestions.every(q => responses[q.id] !== undefined);
  };

  const renderQuestion = (question: SleepQuestion) => {
    const value = responses[question.id];

    switch (question.type) {
      case 'scale':
        return (
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{question.scale?.labels[0]}</span>
              <span>{question.scale?.labels[question.scale.labels.length - 1]}</span>
            </div>
            <div className="flex items-center space-x-2">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleResponseChange(question.id, i + 1)}
                  className={`w-12 h-12 rounded-full border-2 font-semibold transition-colors ${
                    value === i + 1
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            {value && question.scale && (
              <p className="text-sm text-blue-600 font-medium">
                {question.scale.labels[value - 1]}
              </p>
            )}
          </div>
        );

      case 'multiple':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleResponseChange(question.id, option)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  value === option
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 hover:border-gray-400'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case 'time':
        return (
          <input
            type="time"
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );

      case 'text':
        return (
          <textarea
            rows={3}
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Please describe..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );

      default:
        return null;
    }
  };

  const sectionQuestions = getCurrentSectionQuestions();
  const totalSections = config.categories.length;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Sleep Quality Audit</h2>
        <p className="text-gray-600">
          This assessment will help you understand your current sleep patterns and identify areas for improvement.
          Answer honestly to get the most accurate insights.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            Section {currentSection + 1} of {totalSections}: {config.categories[currentSection]}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(((currentSection + (isCurrentSectionComplete() ? 1 : 0)) / totalSections) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((currentSection + (isCurrentSectionComplete() ? 1 : 0)) / totalSections) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {config.categories.map((category, index) => (
            <button
              key={index}
              onClick={() => setCurrentSection(index)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentSection === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Current Section Questions */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {config.categories[currentSection]}
        </h3>
        
        {sectionQuestions.map((question, index) => (
          <div key={question.id} className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">
              {index + 1}. {question.question}
            </h4>
            {renderQuestion(question)}
          </div>
        ))}
      </div>

      {/* Sleep Tips */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💤 Sleep Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Adults typically need 7-9 hours of sleep per night</li>
          <li>• Consistency in sleep timing is as important as duration</li>
          <li>• Your bedroom should be cool, dark, and quiet</li>
          <li>• Avoid caffeine 6-8 hours before bedtime</li>
          <li>• Create a relaxing bedtime routine to signal your body it's time to sleep</li>
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
            onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            disabled={currentSection === 0}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous Section
          </button>
          {currentSection < totalSections - 1 ? (
            <button
              onClick={() => setCurrentSection(currentSection + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Next Section
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isCurrentSectionComplete()}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete Audit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SleepAuditExercise;