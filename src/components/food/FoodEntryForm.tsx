import React, { useState, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { MealType } from '../../types/food';
import { geminiService, GeminiAnalysisResponse } from '../../services/geminiService';

interface FoodEntryFormProps {
  onAnalysisComplete?: (result: GeminiAnalysisResponse) => void;
  onClose?: () => void;
  defaultMealType?: MealType;
  defaultDate?: string;
}

export const FoodEntryForm: React.FC<FoodEntryFormProps> = ({
  onAnalysisComplete,
  onClose,
  defaultMealType,
  defaultDate
}) => {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [entryType, setEntryType] = useState<'text' | 'photo'>('text');
  const [mealType, setMealType] = useState<MealType>(defaultMealType || 'lunch');
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [textDescription, setTextDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string>('');

  const mealTypeOptions = [
    { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { value: 'lunch', label: 'Lunch', icon: '☀️' },
    { value: 'dinner', label: 'Dinner', icon: '🌙' },
    { value: 'snack', label: 'Snack', icon: '🍎' }
  ];

  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, HEIC, or WebP)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Please select an image smaller than 10MB');
      return;
    }

    setError('');
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setSelectedImage(base64String);
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage('');
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!user) {
      setError('Please sign in to analyze food');
      return;
    }

    if (entryType === 'text' && !textDescription.trim()) {
      setError('Please enter a food description');
      return;
    }

    if (entryType === 'photo' && !selectedImage) {
      setError('Please select an image to analyze');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      let result: GeminiAnalysisResponse;

      if (entryType === 'text') {
        result = await geminiService.analyzeFoodText({
          text: textDescription,
          mealType,
          userId: user.id
        });
      } else {
        result = await geminiService.analyzeFoodImage({
          imageBase64: selectedImage,
          mealType,
          userId: user.id
        });
      }

      if (result.success && onAnalysisComplete) {
        onAnalysisComplete(result);
      } else if (!result.success) {
        setError(result.error || 'Failed to analyze food');
      }

    } catch (error) {
      console.error('Analysis error:', error);
      setError('Failed to analyze food. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleQuickAdd = (foodText: string) => {
    setTextDescription(foodText);
    setEntryType('text');
  };

  const quickAddSuggestions = [
    'Apple with peanut butter',
    'Grilled chicken salad',
    'Greek yogurt with berries',
    'Avocado toast',
    'Protein smoothie',
    'Oatmeal with banana',
    'Turkey sandwich',
    'Mixed nuts'
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Add Food Entry</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

      {/* Entry Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How would you like to add your food?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setEntryType('text')}
            className={`flex items-center justify-center p-4 border-2 rounded-lg transition-colors ${
              entryType === 'text'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📝</div>
              <div className="font-medium">Describe Food</div>
              <div className="text-xs text-gray-500">Type what you ate</div>
            </div>
          </button>
          
          <button
            onClick={() => setEntryType('photo')}
            className={`flex items-center justify-center p-4 border-2 rounded-lg transition-colors ${
              entryType === 'photo'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📸</div>
              <div className="font-medium">Take Photo</div>
              <div className="text-xs text-gray-500">Snap a picture</div>
            </div>
          </button>
        </div>
      </div>

      {/* Meal Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meal Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {mealTypeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setMealType(option.value as MealType)}
                className={`flex items-center justify-center p-3 border rounded-lg transition-colors ${
                  mealType === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{option.icon}</span>
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {/* Food Input Based on Type */}
      {entryType === 'text' ? (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Food Description
          </label>
          <textarea
            value={textDescription}
            onChange={(e) => setTextDescription(e.target.value)}
            placeholder="e.g., Grilled chicken breast with steamed broccoli and brown rice"
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
          
          {/* Quick Add Suggestions */}
          <div className="mt-3">
            <div className="text-xs text-gray-600 mb-2">Quick suggestions:</div>
            <div className="flex flex-wrap gap-2">
              {quickAddSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAdd(suggestion)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Food Photo
          </label>
          
          {!imagePreview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelection}
                className="sr-only"
              />
              <div className="text-gray-400 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Select Photo
              </button>
              <p className="text-xs text-gray-500 mt-2">
                JPEG, PNG, HEIC, or WebP up to 10MB
              </p>
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Selected food"
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes about this meal..."
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        {onClose && (
          <button
            onClick={onClose}
            disabled={analyzing}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleAnalyze}
          disabled={analyzing || (!textDescription.trim() && !selectedImage)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {analyzing ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Analyzing...
            </div>
          ) : (
            'Analyze Food'
          )}
        </button>
      </div>

      {/* API Status Info */}
      {!geminiService.isConfigured() && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="text-yellow-800 text-sm">
            <strong>Demo Mode:</strong> Using mock nutrition data. Configure Google Gemini API key for real analysis.
          </div>
        </div>
      )}
    </div>
  );
};