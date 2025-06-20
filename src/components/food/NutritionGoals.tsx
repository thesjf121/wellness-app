import React, { useState, useEffect } from 'react';
import { useMockAuth } from '../../context/MockAuthContext';
import { foodService } from '../../services/foodService';
import { NutritionGoals as NutritionGoalsType } from '../../types/food';

interface NutritionGoalsProps {
  onClose?: () => void;
}

export const NutritionGoals: React.FC<NutritionGoalsProps> = ({ onClose }) => {
  const { user } = useMockAuth();
  const [goals, setGoals] = useState<NutritionGoalsType | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    dailyCalories: 2000,
    protein: 150,
    carbohydrates: 250,
    fat: 67,
    fiber: 25,
    sodium: 2300,
    sugar: 50
  });

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userGoals = await foodService.getNutritionGoals(user.id);
      if (userGoals) {
        setGoals(userGoals);
        setFormData({
          dailyCalories: userGoals.dailyCalories,
          protein: userGoals.macroGoals.protein,
          carbohydrates: userGoals.macroGoals.carbohydrates,
          fat: userGoals.macroGoals.fat,
          fiber: userGoals.macroGoals.fiber,
          sodium: userGoals.microGoals.sodium,
          sugar: userGoals.macroGoals.sugar
        });
      } else {
        setEditing(true); // Start in editing mode if no goals exist
      }
    } catch (error) {
      console.error('Failed to load nutrition goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const goalData = {
        dailyCalories: formData.dailyCalories,
        macroGoals: {
          protein: formData.protein,
          carbohydrates: formData.carbohydrates,
          fat: formData.fat,
          fiber: formData.fiber,
          sugar: formData.sugar
        },
        microGoals: {
          sodium: formData.sodium,
          potassium: 3500, // Default values for nutrients not in form
          calcium: 1000,
          iron: 18,
          vitaminC: 90,
          vitaminA: 900
        }
      };

      const savedGoals = await foodService.setNutritionGoals(user.id, goalData);
      setGoals(savedGoals);
      setEditing(false);
      alert('Nutrition goals saved successfully!');
    } catch (error) {
      console.error('Failed to save nutrition goals:', error);
      alert('Failed to save goals. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const calculateCaloriesFromMacros = () => {
    const proteinCals = formData.protein * 4;
    const carbCals = formData.carbohydrates * 4;
    const fatCals = formData.fat * 9;
    return proteinCals + carbCals + fatCals;
  };

  const getPresetGoals = (preset: 'maintenance' | 'weight-loss' | 'muscle-gain') => {
    switch (preset) {
      case 'maintenance':
        return {
          dailyCalories: 2000,
          protein: 100,
          carbohydrates: 250,
          fat: 67,
          fiber: 25,
          sodium: 2300,
          sugar: 50
        };
      case 'weight-loss':
        return {
          dailyCalories: 1500,
          protein: 120,
          carbohydrates: 150,
          fat: 50,
          fiber: 25,
          sodium: 2000,
          sugar: 30
        };
      case 'muscle-gain':
        return {
          dailyCalories: 2500,
          protein: 150,
          carbohydrates: 300,
          fat: 83,
          fiber: 30,
          sodium: 2500,
          sugar: 60
        };
      default:
        return formData;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Nutrition Goals</h2>
        <div className="flex space-x-2">
          {!editing && goals && (
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Edit Goals
            </button>
          )}
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
      </div>

      {editing ? (
        <div className="space-y-6">
          {/* Preset Goals */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Presets</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(['maintenance', 'weight-loss', 'muscle-gain'] as const).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setFormData(getPresetGoals(preset))}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                >
                  <div className="font-medium capitalize">{preset.replace('-', ' ')}</div>
                  <div className="text-sm text-gray-600">
                    {getPresetGoals(preset).dailyCalories} cal, 
                    {getPresetGoals(preset).protein}g protein
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Targets</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Calories
                  </label>
                  <input
                    type="number"
                    value={formData.dailyCalories}
                    onChange={(e) => setFormData({ ...formData, dailyCalories: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    value={formData.protein}
                    onChange={(e) => setFormData({ ...formData, protein: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carbohydrates (g)
                  </label>
                  <input
                    type="number"
                    value={formData.carbohydrates}
                    onChange={(e) => setFormData({ ...formData, carbohydrates: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    value={formData.fat}
                    onChange={(e) => setFormData({ ...formData, fat: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Targets</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fiber (g)
                  </label>
                  <input
                    type="number"
                    value={formData.fiber}
                    onChange={(e) => setFormData({ ...formData, fiber: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sugar (g)
                  </label>
                  <input
                    type="number"
                    value={formData.sugar}
                    onChange={(e) => setFormData({ ...formData, sugar: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sodium (mg)
                  </label>
                  <input
                    type="number"
                    value={formData.sodium}
                    onChange={(e) => setFormData({ ...formData, sodium: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Calculated calories from macros: {calculateCaloriesFromMacros()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Protein: {formData.protein * 4} cal, 
                    Carbs: {formData.carbohydrates * 4} cal, 
                    Fat: {formData.fat * 9} cal
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg"
            >
              {saving ? 'Saving...' : 'Save Goals'}
            </button>
            {goals && (
              <button
                onClick={() => setEditing(false)}
                className="border border-gray-300 hover:bg-gray-50 px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : goals ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Daily Targets</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-700">Calories:</span>
                  <span className="font-semibold text-blue-900">{goals.dailyCalories}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Protein:</span>
                  <span className="font-semibold text-blue-900">{goals.macroGoals.protein}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Carbohydrates:</span>
                  <span className="font-semibold text-blue-900">{goals.macroGoals.carbohydrates}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Fat:</span>
                  <span className="font-semibold text-blue-900">{goals.macroGoals.fat}g</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Additional Targets</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-700">Fiber:</span>
                  <span className="font-semibold text-green-900">{goals.macroGoals.fiber}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Sugar:</span>
                  <span className="font-semibold text-green-900">{goals.macroGoals.sugar}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Sodium:</span>
                  <span className="font-semibold text-green-900">{goals.microGoals.sodium}mg</span>
                </div>
                <div className="text-xs text-green-600 mt-2">
                  Last updated: {new Date(goals.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No nutrition goals set yet.</p>
          <button
            onClick={() => setEditing(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            Set Your Goals
          </button>
        </div>
      )}
    </div>
  );
};