import React, { useState } from 'react';
import { ExerciseSubmission } from '../../../types/training';

interface WellnessWheelExerciseProps {
  exerciseId: string;
  userId: string;
  onSubmit: (responses: Record<string, any>) => void;
  onCancel: () => void;
  config: {
    categories: string[];
  };
}

interface WellnessCategoryRating {
  category: string;
  rating: number;
  notes: string;
}

export const WellnessWheelExercise: React.FC<WellnessWheelExerciseProps> = ({
  exerciseId,
  userId,
  onSubmit,
  onCancel,
  config
}) => {
  const [ratings, setRatings] = useState<WellnessCategoryRating[]>(
    config.categories.map(category => ({
      category,
      rating: 5,
      notes: ''
    }))
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [reflectionNotes, setReflectionNotes] = useState('');

  const handleRatingChange = (categoryIndex: number, rating: number) => {
    const newRatings = [...ratings];
    newRatings[categoryIndex].rating = rating;
    setRatings(newRatings);
  };

  const handleNotesChange = (categoryIndex: number, notes: string) => {
    const newRatings = [...ratings];
    newRatings[categoryIndex].notes = notes;
    setRatings(newRatings);
  };

  const handleSubmit = () => {
    const responses = {
      ratings,
      reflectionNotes,
      completedAt: new Date().toISOString(),
      overallScore: ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    };
    
    onSubmit(responses);
  };

  const getColorForRating = (rating: number): string => {
    if (rating >= 8) return 'text-green-600 bg-green-100';
    if (rating >= 6) return 'text-yellow-600 bg-yellow-100';
    if (rating >= 4) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getCurrentCategory = (): WellnessCategoryRating => {
    return ratings[currentStep] || ratings[0];
  };

  const isLastStep = currentStep === ratings.length;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wellness Wheel Assessment</h2>
        <p className="text-gray-600">
          Rate your current satisfaction level in each area of wellness on a scale of 1-10.
          This assessment will help you identify areas where you're thriving and areas that need attention.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            {isLastStep ? 'Reflection' : `Category ${currentStep + 1} of ${ratings.length}`}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(((currentStep + (isLastStep ? 1 : 0)) / (ratings.length + 1)) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((currentStep + (isLastStep ? 1 : 0)) / (ratings.length + 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      {!isLastStep ? (
        // Category Rating Step
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {getCurrentCategory().category} Wellness
            </h3>
            <p className="text-gray-600">
              How satisfied are you with your current {getCurrentCategory().category.toLowerCase()} wellness?
            </p>
          </div>

          {/* Rating Scale */}
          <div className="space-y-4">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${getColorForRating(getCurrentCategory().rating)}`}>
                {getCurrentCategory().rating}
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="10"
                value={getCurrentCategory().rating}
                onChange={(e) => handleRatingChange(currentStep, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1 - Very Poor</span>
                <span>5 - Average</span>
                <span>10 - Excellent</span>
              </div>
            </div>
          </div>

          {/* Category-Specific Guidance */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Consider these aspects:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {getCurrentCategory().category === 'Physical' && (
                <>
                  <li>• Exercise and movement habits</li>
                  <li>• Sleep quality and duration</li>
                  <li>• Energy levels throughout the day</li>
                  <li>• Overall physical health</li>
                </>
              )}
              {getCurrentCategory().category === 'Mental' && (
                <>
                  <li>• Ability to focus and concentrate</li>
                  <li>• Learning and growth mindset</li>
                  <li>• Mental clarity and sharpness</li>
                  <li>• Cognitive challenges and stimulation</li>
                </>
              )}
              {getCurrentCategory().category === 'Emotional' && (
                <>
                  <li>• Emotional awareness and regulation</li>
                  <li>• Stress management abilities</li>
                  <li>• Overall mood and happiness</li>
                  <li>• Resilience in difficult times</li>
                </>
              )}
              {getCurrentCategory().category === 'Social' && (
                <>
                  <li>• Quality of relationships</li>
                  <li>• Social support network</li>
                  <li>• Communication skills</li>
                  <li>• Sense of belonging and connection</li>
                </>
              )}
              {getCurrentCategory().category === 'Spiritual' && (
                <>
                  <li>• Sense of purpose and meaning</li>
                  <li>• Connection to something greater</li>
                  <li>• Personal values alignment</li>
                  <li>• Inner peace and fulfillment</li>
                </>
              )}
              {getCurrentCategory().category === 'Environmental' && (
                <>
                  <li>• Living and working space quality</li>
                  <li>• Environmental safety and comfort</li>
                  <li>• Connection with nature</li>
                  <li>• Sustainable lifestyle practices</li>
                </>
              )}
              {getCurrentCategory().category === 'Occupational' && (
                <>
                  <li>• Job satisfaction and fulfillment</li>
                  <li>• Work-life balance</li>
                  <li>• Career growth and development</li>
                  <li>• Workplace relationships</li>
                </>
              )}
              {getCurrentCategory().category === 'Financial' && (
                <>
                  <li>• Financial security and stability</li>
                  <li>• Budgeting and money management</li>
                  <li>• Future financial planning</li>
                  <li>• Stress related to finances</li>
                </>
              )}
            </ul>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={getCurrentCategory().notes}
              onChange={(e) => handleNotesChange(currentStep, e.target.value)}
              placeholder={`What specific aspects of ${getCurrentCategory().category.toLowerCase()} wellness are working well or need improvement?`}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {currentStep === ratings.length - 1 ? 'Continue to Reflection' : 'Next'}
            </button>
          </div>
        </div>
      ) : (
        // Reflection Step
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Wellness Wheel</h3>
            
            {/* Results Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {ratings.map((rating, index) => (
                <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-bold ${getColorForRating(rating.rating)}`}>
                    {rating.rating}
                  </div>
                  <div className="text-xs text-gray-600">{rating.category}</div>
                </div>
              ))}
            </div>

            {/* Overall Score */}
            <div className="text-center mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {(ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)}
              </div>
              <div className="text-sm text-blue-800">Overall Wellness Score</div>
            </div>
          </div>

          {/* Reflection Questions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reflection Notes
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Looking at your wellness wheel, what patterns do you notice? Which areas are your strongest? 
              Which areas would you like to focus on improving?
            </p>
            <textarea
              rows={5}
              value={reflectionNotes}
              onChange={(e) => setReflectionNotes(e.target.value)}
              placeholder="Write your reflections here..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Action Items */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Suggested Next Steps:</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Identify your top 2-3 wellness areas that need attention</li>
              <li>• Set specific, achievable goals for improvement</li>
              <li>• Consider what resources or support you might need</li>
              <li>• Plan to reassess your wellness wheel in 3-6 months</li>
            </ul>
          </div>

          {/* Final Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back to Review
            </button>
            <div className="space-x-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Complete Exercise
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WellnessWheelExercise;