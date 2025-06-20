import React, { useState } from 'react';

interface MealPlanningExerciseProps {
  exerciseId: string;
  userId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  config: {
    days: number;
    mealsPerDay: number;
    includeSnacks: boolean;
    plateMethodRequired: boolean;
  };
}

interface Meal {
  id: string;
  name: string;
  protein: string;
  vegetables: string;
  carbohydrates: string;
  fats: string;
  notes: string;
}

interface DayPlan {
  date: string;
  meals: Meal[];
  snacks: string[];
}

export const MealPlanningExercise: React.FC<MealPlanningExerciseProps> = ({
  exerciseId,
  userId,
  onSubmit,
  onCancel,
  config
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [mealPlans, setMealPlans] = useState<DayPlan[]>([]);
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [reflection, setReflection] = useState('');

  // Initialize meal plans
  React.useEffect(() => {
    if (mealPlans.length === 0) {
      const plans: DayPlan[] = [];
      const today = new Date();
      
      for (let i = 0; i < config.days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const meals: Meal[] = [];
        const mealNames = ['Breakfast', 'Lunch', 'Dinner'];
        
        for (let j = 0; j < config.mealsPerDay; j++) {
          meals.push({
            id: `meal_${i}_${j}`,
            name: mealNames[j] || `Meal ${j + 1}`,
            protein: '',
            vegetables: '',
            carbohydrates: '',
            fats: '',
            notes: ''
          });
        }
        
        plans.push({
          date: date.toDateString(),
          meals,
          snacks: config.includeSnacks ? ['', ''] : []
        });
      }
      
      setMealPlans(plans);
    }
  }, [config.days, config.mealsPerDay, config.includeSnacks, mealPlans.length]);

  const updateMeal = (dayIndex: number, mealIndex: number, field: keyof Meal, value: string) => {
    const newPlans = [...mealPlans];
    newPlans[dayIndex].meals[mealIndex][field] = value;
    setMealPlans(newPlans);
  };

  const updateSnack = (dayIndex: number, snackIndex: number, value: string) => {
    const newPlans = [...mealPlans];
    newPlans[dayIndex].snacks[snackIndex] = value;
    setMealPlans(newPlans);
  };

  const generateShoppingList = () => {
    const items = new Set<string>();
    
    mealPlans.forEach(day => {
      day.meals.forEach(meal => {
        if (meal.protein) items.add(meal.protein);
        if (meal.vegetables) meal.vegetables.split(',').forEach(veg => items.add(veg.trim()));
        if (meal.carbohydrates) items.add(meal.carbohydrates);
        if (meal.fats) items.add(meal.fats);
      });
      
      day.snacks.forEach(snack => {
        if (snack) items.add(snack);
      });
    });
    
    setShoppingList(Array.from(items).filter(item => item.length > 0));
    setCurrentStep(2);
  };

  const addShoppingItem = (item: string) => {
    if (item && !shoppingList.includes(item)) {
      setShoppingList([...shoppingList, item]);
    }
  };

  const removeShoppingItem = (index: number) => {
    setShoppingList(shoppingList.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    const data = {
      exerciseId,
      userId,
      mealPlans,
      shoppingList,
      reflection,
      completedAt: new Date(),
      config
    };
    onSubmit(data);
  };

  if (currentStep === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🍽️ Weekly Meal Planning</h2>
          <p className="text-gray-600">
            Plan your meals for the next {config.days} days using the plate method for balanced nutrition.
          </p>
        </div>

        {config.plateMethodRequired && (
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">🍽️ The Plate Method</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-green-100 p-3 rounded">
                <strong>½ Plate: Vegetables</strong>
                <div className="text-green-700 text-xs mt-1">
                  Non-starchy vegetables like leafy greens, broccoli, peppers, tomatoes
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded">
                <strong>¼ Plate: Protein</strong>
                <div className="text-blue-700 text-xs mt-1">
                  Lean meats, fish, beans, tofu, eggs
                </div>
              </div>
              <div className="bg-yellow-100 p-3 rounded">
                <strong>¼ Plate: Carbohydrates</strong>
                <div className="text-yellow-700 text-xs mt-1">
                  Whole grains, sweet potatoes, quinoa
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded">
                <strong>Add: Healthy Fats</strong>
                <div className="text-purple-700 text-xs mt-1">
                  Avocado, nuts, olive oil, seeds
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentStep(1)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Start Planning Meals
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
    const currentDay = mealPlans[currentDayIndex];
    
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            📅 {currentDay?.date}
          </h2>
          <div className="text-sm text-gray-600">
            Day {currentDayIndex + 1} of {config.days}
          </div>
        </div>

        <div className="space-y-6">
          {currentDay?.meals.map((meal, mealIndex) => (
            <div key={meal.id} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">{meal.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Protein (¼ plate)
                  </label>
                  <input
                    type="text"
                    value={meal.protein}
                    onChange={(e) => updateMeal(currentDayIndex, mealIndex, 'protein', e.target.value)}
                    placeholder="e.g., Grilled chicken, salmon, beans"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vegetables (½ plate)
                  </label>
                  <input
                    type="text"
                    value={meal.vegetables}
                    onChange={(e) => updateMeal(currentDayIndex, mealIndex, 'vegetables', e.target.value)}
                    placeholder="e.g., Spinach, broccoli, bell peppers"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carbohydrates (¼ plate)
                  </label>
                  <input
                    type="text"
                    value={meal.carbohydrates}
                    onChange={(e) => updateMeal(currentDayIndex, mealIndex, 'carbohydrates', e.target.value)}
                    placeholder="e.g., Brown rice, quinoa, sweet potato"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Healthy Fats
                  </label>
                  <input
                    type="text"
                    value={meal.fats}
                    onChange={(e) => updateMeal(currentDayIndex, mealIndex, 'fats', e.target.value)}
                    placeholder="e.g., Avocado, olive oil, nuts"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}

          {config.includeSnacks && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">🍎 Snacks</h3>
              <div className="space-y-2">
                {currentDay?.snacks.map((snack, snackIndex) => (
                  <input
                    key={snackIndex}
                    type="text"
                    value={snack}
                    onChange={(e) => updateSnack(currentDayIndex, snackIndex, e.target.value)}
                    placeholder={`Healthy snack ${snackIndex + 1} (e.g., Apple with almond butter)`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentDayIndex(Math.max(0, currentDayIndex - 1))}
            disabled={currentDayIndex === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous Day
          </button>
          
          {currentDayIndex < config.days - 1 ? (
            <button
              onClick={() => setCurrentDayIndex(currentDayIndex + 1)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Next Day →
            </button>
          ) : (
            <button
              onClick={generateShoppingList}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              Generate Shopping List →
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🛒 Shopping List & Reflection</h2>
          <p className="text-gray-600">Review your automatically generated shopping list and add any missing items.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Shopping List</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2 mb-4">
                {shoppingList.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
                    <span>{item}</span>
                    <button
                      onClick={() => removeShoppingItem(index)}
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
                  placeholder="Add item to shopping list"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addShoppingItem((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                    addShoppingItem(input.value);
                    input.value = '';
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Reflection</h3>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="How do you feel about your meal plan? What challenges do you anticipate? What are you excited about?"
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">🎯 Meal Planning Tips</h3>
          <ul className="text-green-800 space-y-1 text-sm">
            <li>• Prep ingredients on weekends to save time during the week</li>
            <li>• Cook grains and proteins in batches</li>
            <li>• Keep emergency healthy snacks on hand</li>
            <li>• It's okay to repeat meals you enjoy</li>
            <li>• Allow flexibility for social meals and unexpected changes</li>
          </ul>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => setCurrentStep(1)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back to Meal Planning
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium"
          >
            Complete Meal Planning Exercise
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default MealPlanningExercise;