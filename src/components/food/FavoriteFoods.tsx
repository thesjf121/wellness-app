import React, { useState, useEffect } from 'react';
import { useMockAuth } from '../../context/MockAuthContext';
import { foodService } from '../../services/foodService';
import { FavoriteFoodItem } from '../../types/food';
import { NutritionData } from '../../services/geminiService';

interface FavoriteFoodsProps {
  onSelectFood?: (nutritionData: NutritionData) => void;
  showActions?: boolean;
}

export const FavoriteFoods: React.FC<FavoriteFoodsProps> = ({ 
  onSelectFood, 
  showActions = true 
}) => {
  const { user } = useMockAuth();
  const [favorites, setFavorites] = useState<FavoriteFoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const favoriteFoods = await foodService.getFavoriteFoods(user.id);
      setFavorites(favoriteFoods);
    } catch (error) {
      console.error('Failed to load favorite foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (nutritionData: NutritionData) => {
    if (!user) return;

    try {
      await foodService.addToFavorites(user.id, nutritionData);
      await loadFavorites(); // Refresh the list
    } catch (error) {
      console.error('Failed to add to favorites:', error);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    if (!user) return;

    try {
      // Get current favorites
      const currentFavorites = await foodService.getFavoriteFoods(user.id);
      const updatedFavorites = currentFavorites.filter(fav => fav.id !== favoriteId);
      
      // Save updated list back to localStorage
      localStorage.setItem(
        `wellness_favorite_foods_${user.id}`, 
        JSON.stringify(updatedFavorites)
      );
      
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  const filteredFavorites = favorites.filter(favorite =>
    favorite.foodName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatLastUsed = (lastUsed: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - new Date(lastUsed).getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Favorite Foods</h3>
        <span className="text-sm text-gray-500">{favorites.length} favorites</span>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search favorite foods..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {filteredFavorites.length > 0 ? (
        <div className="space-y-3">
          {filteredFavorites.map((favorite) => (
            <div
              key={favorite.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{favorite.foodName}</h4>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {favorite.frequency}x used
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 mb-2">
                    <span>{Math.round(favorite.nutrition.calories)} cal</span>
                    <span>{Math.round(favorite.nutrition.macronutrients.protein)}g protein</span>
                    <span>{Math.round(favorite.nutrition.macronutrients.carbohydrates)}g carbs</span>
                    <span>{Math.round(favorite.nutrition.macronutrients.fat)}g fat</span>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Last used: {formatLastUsed(favorite.lastUsed)}
                  </p>
                </div>

                {showActions && (
                  <div className="flex space-x-2">
                    {onSelectFood && (
                      <button
                        onClick={() => onSelectFood(favorite.nutrition)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        title="Add to current meal"
                      >
                        Add
                      </button>
                    )}
                    <button
                      onClick={() => removeFavorite(favorite.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Remove from favorites"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchTerm ? 'No favorite foods match your search.' : 'No favorite foods yet.'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {!searchTerm && 'Foods you log frequently will appear here automatically.'}
          </p>
        </div>
      )}
    </div>
  );
};

// Standalone component for adding current foods to favorites
export const FavoriteFoodManager: React.FC = () => {
  const { user } = useMockAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFoodName, setNewFoodName] = useState('');

  const handleAddManualFavorite = async () => {
    if (!user || !newFoodName.trim()) return;

    const mockNutritionData: NutritionData = {
      foodItem: newFoodName.trim(),
      calories: 100, // Default values
      macronutrients: {
        protein: 5,
        carbohydrates: 15,
        fat: 2,
        fiber: 2,
        sugar: 5
      },
      micronutrients: {
        sodium: 100,
        potassium: 200,
        calcium: 50,
        iron: 1,
        vitaminC: 5,
        vitaminA: 100
      },
      servingSize: '1 serving',
      confidence: 0.7
    };

    try {
      await foodService.addToFavorites(user.id, mockNutritionData);
      setNewFoodName('');
      setShowAddForm(false);
      // Could emit an event or callback to refresh the favorites list
    } catch (error) {
      console.error('Failed to add manual favorite:', error);
    }
  };

  return (
    <div className="mt-4">
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full border border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
        >
          + Add Food to Favorites
        </button>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4">
          <input
            type="text"
            placeholder="Enter food name..."
            value={newFoodName}
            onChange={(e) => setNewFoodName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            onKeyPress={(e) => e.key === 'Enter' && handleAddManualFavorite()}
          />
          <div className="flex space-x-2">
            <button
              onClick={handleAddManualFavorite}
              disabled={!newFoodName.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded text-sm"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewFoodName('');
              }}
              className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};