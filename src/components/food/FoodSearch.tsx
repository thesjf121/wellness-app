import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { foodService } from '../../services/foodService';
import { FoodEntry, MealType } from '../../types/food';

interface FoodSearchProps {
  onClose?: () => void;
}

interface SearchFilters {
  query: string;
  startDate: string;
  endDate: string;
  mealType: MealType | 'all';
}

export const FoodSearch: React.FC<FoodSearchProps> = ({ onClose }) => {
  const { user } = useUser();
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    startDate: '',
    endDate: '',
    mealType: 'all'
  });
  const [searchResults, setSearchResults] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (filters.query.length >= 2 || filters.startDate || filters.endDate || filters.mealType !== 'all') {
      handleSearch();
    } else {
      setSearchResults([]);
      setHasSearched(false);
    }
  }, [filters, user]);

  const handleSearch = async () => {
    if (!user) return;

    setLoading(true);
    setHasSearched(true);

    try {
      let results: FoodEntry[] = [];

      if (filters.query.length >= 2) {
        // Text search
        results = await foodService.searchFoodEntries(user.id, filters.query);
      } else {
        // Get all entries in date range
        results = await foodService.getFoodEntries(user.id, filters.startDate, filters.endDate);
      }

      // Apply additional filters
      if (filters.mealType !== 'all') {
        results = results.filter(entry => entry.mealType === filters.mealType);
      }

      if (filters.startDate) {
        results = results.filter(entry => entry.date >= filters.startDate);
      }

      if (filters.endDate) {
        results = results.filter(entry => entry.date <= filters.endDate);
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      startDate: '',
      endDate: '',
      mealType: 'all'
    });
    setSearchResults([]);
    setHasSearched(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMealIcon = (mealType: MealType) => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎'
    };
    return icons[mealType];
  };

  return (
    <div className="bg-white w-full h-full md:rounded-lg md:shadow-md">
      {/* Mobile-friendly header with drag handle */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 md:p-6">
        <div className="flex items-center justify-between">
          {/* Drag handle for mobile */}
          <div className="md:hidden w-12 h-1 bg-gray-300 rounded-full mx-auto absolute left-1/2 transform -translate-x-1/2 -top-2"></div>
          
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Food History</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      
        {/* Search Filters - Mobile friendly */}
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Foods
            </label>
            <input
              type="text"
              placeholder="Enter food name..."
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meal Type
            </label>
            <select
              value={filters.mealType}
              onChange={(e) => setFilters({ ...filters, mealType: e.target.value as MealType | 'all' })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Meals</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          <div className="flex justify-center">
            <button
              onClick={clearFilters}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="p-4 md:p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Searching...</p>
          </div>
        ) : hasSearched ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Search Results ({searchResults.length} entries)
              </h3>
            </div>

            {searchResults.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {searchResults.map((entry) => (
                  <div key={entry.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{getMealIcon(entry.mealType)}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900 capitalize text-base">
                            {entry.mealType}
                          </h4>
                          <p className="text-sm text-gray-600">{formatDate(entry.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">
                          {entry.foods.reduce((sum, food) => sum + food.calories, 0)}
                        </p>
                        <p className="text-xs text-gray-500">calories</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2">
                        {entry.foods.map((food, index) => (
                          <span key={index} className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                            {food.foodItem}
                          </span>
                        ))}
                      </div>
                    </div>

                    {entry.notes && (
                      <p className="text-sm text-gray-600 mb-3 italic">{entry.notes}</p>
                    )}

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-sm font-semibold text-gray-900">
                          {Math.round(entry.foods.reduce((sum, food) => sum + food.macronutrients.protein, 0))}g
                        </div>
                        <div className="text-xs text-gray-500">Protein</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-sm font-semibold text-gray-900">
                          {Math.round(entry.foods.reduce((sum, food) => sum + food.macronutrients.carbohydrates, 0))}g
                        </div>
                        <div className="text-xs text-gray-500">Carbs</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-sm font-semibold text-gray-900">
                          {Math.round(entry.foods.reduce((sum, food) => sum + food.macronutrients.fat, 0))}g
                        </div>
                        <div className="text-xs text-gray-500">Fat</div>
                      </div>
                    </div>

                    {entry.imageUrl && (
                      <div className="mt-3">
                        <img 
                          src={entry.imageUrl} 
                          alt="Food" 
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No food entries found matching your search criteria.</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Enter search criteria to find your food entries.</p>
            <p className="text-sm text-gray-400 mt-1">Search by food name, date range, or meal type.</p>
          </div>
        )}
      </div>
    </div>
  );
};