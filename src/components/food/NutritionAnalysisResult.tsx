import React, { useState } from 'react';
import { NutritionData } from '../../services/geminiService';

interface NutritionAnalysisResultProps {
  nutritionData: NutritionData[];
  onSave?: (data: NutritionData[]) => void;
  onEdit?: (index: number, data: NutritionData) => void;
  onRemove?: (index: number) => void;
  onCancel?: () => void;
  saving?: boolean;
}

export const NutritionAnalysisResult: React.FC<NutritionAnalysisResultProps> = ({
  nutritionData,
  onSave,
  onEdit,
  onRemove,
  onCancel,
  saving = false
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<NutritionData | null>(null);

  const handleEditStart = (index: number) => {
    setEditingIndex(index);
    setEditingData({ ...nutritionData[index] });
  };

  const handleEditSave = () => {
    if (editingIndex !== null && editingData && onEdit) {
      onEdit(editingIndex, editingData);
    }
    setEditingIndex(null);
    setEditingData(null);
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditingData(null);
  };

  const totalNutrition = nutritionData.reduce((total, item) => ({
    calories: total.calories + item.calories,
    protein: total.protein + item.macronutrients.protein,
    carbs: total.carbs + item.macronutrients.carbohydrates,
    fat: total.fat + item.macronutrients.fat,
    fiber: total.fiber + item.macronutrients.fiber,
    sugar: total.sugar + item.macronutrients.sugar,
    sodium: total.sodium + item.micronutrients.sodium,
    potassium: total.potassium + item.micronutrients.potassium,
    calcium: total.calcium + item.micronutrients.calcium,
    iron: total.iron + item.micronutrients.iron,
    vitaminC: total.vitaminC + item.micronutrients.vitaminC,
    vitaminA: total.vitaminA + item.micronutrients.vitaminA
  }), { 
    calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0,
    sodium: 0, potassium: 0, calcium: 0, iron: 0, vitaminC: 0, vitaminA: 0
  });

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Nutrition Analysis</h2>
        <div className="text-sm text-gray-500">
          {nutritionData.length} item{nutritionData.length !== 1 ? 's' : ''} detected
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-3">Total Nutrition Summary</h3>
        
        {/* Macronutrients */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center mb-4">
          <div>
            <div className="text-2xl font-bold text-blue-600">{Math.round(totalNutrition.calories)}</div>
            <div className="text-xs text-blue-700">Calories</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-700">{Math.round(totalNutrition.protein)}g</div>
            <div className="text-xs text-gray-600">Protein</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-700">{Math.round(totalNutrition.carbs)}g</div>
            <div className="text-xs text-gray-600">Carbs</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-700">{Math.round(totalNutrition.fat)}g</div>
            <div className="text-xs text-gray-600">Fat</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-700">{Math.round(totalNutrition.fiber)}g</div>
            <div className="text-xs text-gray-600">Fiber</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-700">{Math.round(totalNutrition.sugar)}g</div>
            <div className="text-xs text-gray-600">Sugar</div>
          </div>
        </div>

        {/* Micronutrients */}
        <div className="border-t pt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">📊 Micronutrients</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            <div className="bg-white rounded p-2 border">
              <div className="text-sm font-semibold text-red-600">{Math.round(totalNutrition.sodium)}mg</div>
              <div className="text-xs text-gray-600">Sodium</div>
            </div>
            <div className="bg-white rounded p-2 border">
              <div className="text-sm font-semibold text-orange-600">{Math.round(totalNutrition.potassium)}mg</div>
              <div className="text-xs text-gray-600">Potassium</div>
            </div>
            <div className="bg-white rounded p-2 border">
              <div className="text-sm font-semibold text-blue-600">{Math.round(totalNutrition.calcium)}mg</div>
              <div className="text-xs text-gray-600">Calcium</div>
            </div>
            <div className="bg-white rounded p-2 border">
              <div className="text-sm font-semibold text-gray-600">{Math.round(totalNutrition.iron)}mg</div>
              <div className="text-xs text-gray-600">Iron</div>
            </div>
            <div className="bg-white rounded p-2 border">
              <div className="text-sm font-semibold text-green-600">{Math.round(totalNutrition.vitaminC)}mg</div>
              <div className="text-xs text-gray-600">Vitamin C</div>
            </div>
            <div className="bg-white rounded p-2 border">
              <div className="text-sm font-semibold text-yellow-600">{Math.round(totalNutrition.vitaminA)}IU</div>
              <div className="text-xs text-gray-600">Vitamin A</div>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Food Items */}
      <div className="space-y-4">
        {nutritionData.map((item, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            {editingIndex === index && editingData ? (
              // Edit Mode
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Food Item
                    </label>
                    <input
                      type="text"
                      value={editingData.foodItem}
                      onChange={(e) => setEditingData({ ...editingData, foodItem: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Serving Size
                    </label>
                    <input
                      type="text"
                      value={editingData.servingSize}
                      onChange={(e) => setEditingData({ ...editingData, servingSize: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Calories
                    </label>
                    <input
                      type="number"
                      value={editingData.calories}
                      onChange={(e) => setEditingData({ ...editingData, calories: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      value={editingData.macronutrients.protein}
                      onChange={(e) => setEditingData({
                        ...editingData,
                        macronutrients: { ...editingData.macronutrients, protein: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      value={editingData.macronutrients.carbohydrates}
                      onChange={(e) => setEditingData({
                        ...editingData,
                        macronutrients: { ...editingData.macronutrients, carbohydrates: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fat (g)
                    </label>
                    <input
                      type="number"
                      value={editingData.macronutrients.fat}
                      onChange={(e) => setEditingData({
                        ...editingData,
                        macronutrients: { ...editingData.macronutrients, fat: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleEditCancel}
                    className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSave}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.foodItem}</h3>
                    <p className="text-sm text-gray-600">{item.servingSize}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(item.confidence)}`}>
                      {getConfidenceText(item.confidence)} confidence
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditStart(index)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {onRemove && (
                        <button
                          onClick={() => onRemove(index)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Remove"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-xl font-bold text-gray-900">{Math.round(item.calories)}</div>
                    <div className="text-xs text-gray-600">Calories</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-semibold text-gray-700">{Math.round(item.macronutrients.protein)}g</div>
                    <div className="text-xs text-gray-600">Protein</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-semibold text-gray-700">{Math.round(item.macronutrients.carbohydrates)}g</div>
                    <div className="text-xs text-gray-600">Carbs</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-semibold text-gray-700">{Math.round(item.macronutrients.fat)}g</div>
                    <div className="text-xs text-gray-600">Fat</div>
                  </div>
                </div>

                {/* Micronutrients - Now visible by default */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <h5 className="text-xs font-medium text-gray-700 mb-2">📊 Micronutrients</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sodium:</span>
                      <span className="font-medium text-red-600">{Math.round(item.micronutrients.sodium)}mg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Potassium:</span>
                      <span className="font-medium text-orange-600">{Math.round(item.micronutrients.potassium)}mg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Calcium:</span>
                      <span className="font-medium text-blue-600">{Math.round(item.micronutrients.calcium)}mg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Iron:</span>
                      <span className="font-medium text-gray-600">{Math.round(item.micronutrients.iron)}mg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vitamin C:</span>
                      <span className="font-medium text-green-600">{Math.round(item.micronutrients.vitaminC)}mg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vitamin A:</span>
                      <span className="font-medium text-yellow-600">{Math.round(item.micronutrients.vitaminA)}IU</span>
                    </div>
                  </div>
                </div>

                {/* Additional Macronutrients */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between p-2 bg-yellow-50 rounded">
                    <span className="text-gray-600">Fiber:</span>
                    <span className="font-medium text-yellow-600">{Math.round(item.macronutrients.fiber)}g</span>
                  </div>
                  <div className="flex justify-between p-2 bg-pink-50 rounded">
                    <span className="text-gray-600">Sugar:</span>
                    <span className="font-medium text-pink-600">{Math.round(item.macronutrients.sugar)}g</span>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        {onSave && (
          <button
            onClick={() => onSave(nutritionData)}
            disabled={saving}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              'Save to Food Log'
            )}
          </button>
        )}
      </div>
    </div>
  );
};