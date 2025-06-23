// Food journal service for managing food entries and nutrition data

import { FoodEntry, MealType, DailyNutrition, NutritionGoals, CreateFoodEntryRequest, FavoriteFoodItem } from '../types/food';
import { NutritionData } from './geminiService';
import { errorService } from './errorService';
import { activityTrackingService } from './activityTrackingService';
import { supabaseFoodService } from './supabaseFoodService';

class FoodService {
  private readonly FOOD_ENTRIES_KEY = 'wellness_food_entries';
  private readonly NUTRITION_GOALS_KEY = 'wellness_nutrition_goals';
  private readonly FAVORITES_KEY = 'wellness_favorite_foods';
  private readonly OFFLINE_QUEUE_KEY = 'wellness_offline_queue';
  private isOnline = navigator.onLine;
  private isInitialized = false;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  /**
   * Initialize the food service
   */
  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      // Migrate existing localStorage data to Supabase
      await this.migrateToSupabase();

      this.isInitialized = true;
      errorService.logInfo('Food service initialized successfully');
    } catch (error) {
      errorService.logError(error as Error, { context: 'FoodService.initialize' });
      throw error;
    }
  }

  /**
   * Migrate existing localStorage data to Supabase
   */
  private async migrateToSupabase(): Promise<void> {
    try {
      // Check if migration has already been done
      const migrationKey = 'food_data_migrated_to_supabase';
      if (localStorage.getItem(migrationKey) === 'true') {
        return;
      }

      console.log('Migrating food data from localStorage to Supabase...');
      await supabaseFoodService.migrateFromLocalStorage();
      
      // Mark migration as complete
      localStorage.setItem(migrationKey, 'true');
      console.log('Food data migration completed');
    } catch (error) {
      console.error('Error during food data migration:', error);
      // Don't throw - migration failure shouldn't break app initialization
    }
  }

  private handleOnline() {
    this.isOnline = true;
    this.processOfflineQueue();
  }

  private handleOffline() {
    this.isOnline = false;
  }

  /**
   * Create a new food entry
   */
  async createFoodEntry(request: CreateFoodEntryRequest, nutritionData: NutritionData[], userId: string): Promise<FoodEntry> {
    try {
      // Try to save to Supabase first (primary storage)
      try {
        const supabaseEntry = await supabaseFoodService.createFoodEntry(request, nutritionData);
        
        // Also save to localStorage as backup/offline cache
        await this.saveFoodEntryLocally(supabaseEntry);

        // Update favorites frequency
        await this.updateFoodFrequency(nutritionData, userId);

        // Track activity for group eligibility
        await activityTrackingService.trackFoodActivity(userId, 1);

        errorService.logInfo('Food entry created in Supabase', { 
          entryId: supabaseEntry.id,
          mealType: supabaseEntry.mealType,
          foodCount: nutritionData.length
        });

        return supabaseEntry;
      } catch (supabaseError) {
        console.warn('Failed to save to Supabase, using localStorage fallback:', supabaseError);
        
        // Fallback to localStorage-only if Supabase fails
        const entry: FoodEntry = {
          id: `food_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          date: request.date,
          mealType: request.mealType,
          foods: nutritionData,
          notes: request.notes,
          imageUrl: request.imageBase64,
          createdAt: new Date(),
          updatedAt: new Date(),
          synced: false
        };

        // Save locally
        await this.saveFoodEntryLocally(entry);
        
        if (this.isOnline) {
          // Process immediately when online
          await this.updateFoodFrequency(nutritionData, userId);
        } else {
          // Queue for later processing when offline
          this.addToOfflineQueue({
            type: 'create_food_entry',
            entry,
            userId,
            nutritionData,
            timestamp: new Date().toISOString()
          });
        }

        // Track activity for group eligibility
        await activityTrackingService.trackFoodActivity(userId, 1);

        errorService.logInfo('Food entry created locally', { 
          entryId: entry.id,
          mealType: entry.mealType,
          foodCount: nutritionData.length,
          offline: !this.isOnline
        });

        return entry;
      }
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'FoodService.createFoodEntry',
        request,
        userId
      });
      throw error;
    }
  }

  /**
   * Get all food entries for a user
   */
  async getFoodEntries(userId: string, startDate?: string, endDate?: string): Promise<FoodEntry[]> {
    try {
      // Try to get data from Supabase first
      try {
        const startDateObj = startDate ? new Date(startDate) : undefined;
        const endDateObj = endDate ? new Date(endDate) : undefined;
        
        const supabaseEntries = await supabaseFoodService.getFoodEntries(startDateObj, endDateObj);
        if (supabaseEntries.length > 0) {
          return supabaseEntries;
        }
      } catch (supabaseError) {
        console.warn('Failed to fetch from Supabase, using localStorage fallback:', supabaseError);
      }

      // Fallback to localStorage data
      const allEntries = this.loadFoodEntriesFromStorage();
      let userEntries = allEntries.filter(entry => entry.userId === userId);

      if (startDate) {
        userEntries = userEntries.filter(entry => entry.date >= startDate);
      }
      if (endDate) {
        userEntries = userEntries.filter(entry => entry.date <= endDate);
      }

      return userEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'FoodService.getFoodEntries',
        userId,
        startDate,
        endDate
      });
      return [];
    }
  }

  /**
   * Get food entries for a specific date
   */
  async getFoodEntriesForDate(userId: string, date: string): Promise<FoodEntry[]> {
    try {
      const allEntries = await this.getFoodEntries(userId);
      return allEntries.filter(entry => entry.date === date);
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'FoodService.getFoodEntriesForDate',
        userId,
        date
      });
      return [];
    }
  }

  /**
   * Update a food entry
   */
  async updateFoodEntry(entryId: string, updates: Partial<FoodEntry>): Promise<FoodEntry | null> {
    try {
      const allEntries = this.loadFoodEntriesFromStorage();
      const entryIndex = allEntries.findIndex(entry => entry.id === entryId);
      
      if (entryIndex === -1) {
        throw new Error('Food entry not found');
      }

      const updatedEntry = {
        ...allEntries[entryIndex],
        ...updates,
        updatedAt: new Date(),
        synced: false
      };

      allEntries[entryIndex] = updatedEntry;
      this.saveFoodEntriesToStorage(allEntries);

      return updatedEntry;
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'FoodService.updateFoodEntry',
        entryId,
        updates
      });
      return null;
    }
  }

  /**
   * Delete a food entry
   */
  async deleteFoodEntry(entryId: string): Promise<boolean> {
    try {
      const allEntries = this.loadFoodEntriesFromStorage();
      const filteredEntries = allEntries.filter(entry => entry.id !== entryId);
      
      if (filteredEntries.length === allEntries.length) {
        throw new Error('Food entry not found');
      }

      this.saveFoodEntriesToStorage(filteredEntries);
      
      // Queue for sync if offline
      if (!this.isOnline) {
        this.addToOfflineQueue({
          type: 'delete_food_entry',
          entryId,
          timestamp: new Date().toISOString()
        });
      }
      
      return true;
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'FoodService.deleteFoodEntry',
        entryId
      });
      return false;
    }
  }

  /**
   * Calculate daily nutrition summary
   */
  async getDailyNutrition(userId: string, date: string): Promise<DailyNutrition> {
    try {
      const entries = await this.getFoodEntriesForDate(userId, date);
      
      const mealBreakdown = {
        breakfast: this.calculateMealNutrition(entries.filter(e => e.mealType === 'breakfast')),
        lunch: this.calculateMealNutrition(entries.filter(e => e.mealType === 'lunch')),
        dinner: this.calculateMealNutrition(entries.filter(e => e.mealType === 'dinner')),
        snack: this.calculateMealNutrition(entries.filter(e => e.mealType === 'snack'))
      };

      const totalNutrition = this.calculateTotalNutrition(entries);

      return {
        date,
        totalCalories: totalNutrition.calories,
        totalMacros: totalNutrition.macros,
        totalMicros: totalNutrition.micros,
        totals: {
          calories: totalNutrition.calories,
          protein: totalNutrition.macros.protein,
          carbs: totalNutrition.macros.carbohydrates,
          fat: totalNutrition.macros.fat
        },
        foodEntries: entries.map(entry => ({
          ...entry,
          name: entry.foods[0]?.foodItem || '',
          quantity: '1 serving',
          calories: entry.foods.reduce((sum, food) => sum + (food.calories || 0), 0)
        })),
        mealBreakdown,
        entries
      };
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'FoodService.getDailyNutrition',
        userId,
        date
      });
      
      return {
        date,
        totalCalories: 0,
        totalMacros: { protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0 },
        totalMicros: { 
          // Essential Minerals
          sodium: 0, potassium: 0, calcium: 0, iron: 0, magnesium: 0, phosphorus: 0, zinc: 0, copper: 0, manganese: 0, selenium: 0, iodine: 0, chromium: 0, molybdenum: 0,
          // Additional Important Minerals
          fluoride: 0, chloride: 0, sulfur: 0, boron: 0, cobalt: 0,
          // Fat-soluble vitamins
          vitaminA: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0,
          // Water-soluble vitamins
          vitaminC: 0, thiamine: 0, riboflavin: 0, niacin: 0, pantothenicAcid: 0, vitaminB6: 0, biotin: 0, folate: 0, vitaminB12: 0, choline: 0 
        },
        totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        foodEntries: [],
        mealBreakdown: {
          breakfast: {},
          lunch: {},
          dinner: {},
          snack: {}
        },
        entries: []
      };
    }
  }

  /**
   * Set nutrition goals for a user
   */
  async setNutritionGoals(userId: string, goals: Omit<NutritionGoals, 'userId' | 'createdAt' | 'updatedAt'>): Promise<NutritionGoals> {
    try {
      // Try to save to Supabase first
      try {
        const supabaseGoals = await supabaseFoodService.setNutritionGoals(goals);
        
        // Also save to localStorage as backup
        localStorage.setItem(`${this.NUTRITION_GOALS_KEY}_${userId}`, JSON.stringify(supabaseGoals));

        return supabaseGoals;
      } catch (supabaseError) {
        console.warn('Failed to save nutrition goals to Supabase, using localStorage fallback:', supabaseError);
        
        // Fallback to localStorage-only if Supabase fails
        const nutritionGoals: NutritionGoals = {
          userId,
          ...goals,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        localStorage.setItem(`${this.NUTRITION_GOALS_KEY}_${userId}`, JSON.stringify(nutritionGoals));
        
        return nutritionGoals;
      }
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'FoodService.setNutritionGoals',
        userId,
        goals
      });
      throw error;
    }
  }

  /**
   * Get nutrition goals for a user
   */
  async getNutritionGoals(userId: string): Promise<NutritionGoals | null> {
    try {
      // Try Supabase first
      try {
        const supabaseGoals = await supabaseFoodService.getNutritionGoals();
        if (supabaseGoals) {
          return supabaseGoals;
        }
      } catch (supabaseError) {
        console.warn('Failed to fetch nutrition goals from Supabase, using localStorage fallback:', supabaseError);
      }

      // Fallback to localStorage
      const stored = localStorage.getItem(`${this.NUTRITION_GOALS_KEY}_${userId}`);
      if (!stored) return null;

      return JSON.parse(stored);
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'FoodService.getNutritionGoals',
        userId
      });
      return null;
    }
  }

  /**
   * Get favorite foods for a user
   */
  async getFavoriteFoods(userId: string): Promise<FavoriteFoodItem[]> {
    try {
      // Try Supabase first
      try {
        const supabaseFavorites = await supabaseFoodService.getFavoriteFoods();
        if (supabaseFavorites.length > 0) {
          return supabaseFavorites;
        }
      } catch (supabaseError) {
        console.warn('Failed to fetch favorite foods from Supabase, using localStorage fallback:', supabaseError);
      }

      // Fallback to localStorage
      const stored = localStorage.getItem(`${this.FAVORITES_KEY}_${userId}`);
      if (!stored) return [];

      const favorites: FavoriteFoodItem[] = JSON.parse(stored);
      return favorites.sort((a, b) => b.frequency - a.frequency);
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'FoodService.getFavoriteFoods',
        userId
      });
      return [];
    }
  }

  /**
   * Add food to favorites
   */
  async addToFavorites(userId: string, nutritionData: NutritionData): Promise<FavoriteFoodItem> {
    try {
      // Try to save to Supabase first
      try {
        const supabaseFavorite = await supabaseFoodService.addToFavorites(nutritionData);
        
        // Update localStorage with Supabase data
        const favorites = await this.getFavoriteFoods(userId);
        const existingIndex = favorites.findIndex(f => f.id === supabaseFavorite.id);
        
        if (existingIndex >= 0) {
          favorites[existingIndex] = supabaseFavorite;
        } else {
          favorites.push(supabaseFavorite);
        }
        
        localStorage.setItem(`${this.FAVORITES_KEY}_${userId}`, JSON.stringify(favorites));
        return supabaseFavorite;
      } catch (supabaseError) {
        console.warn('Failed to save favorite to Supabase, using localStorage fallback:', supabaseError);
        
        // Fallback to localStorage-only logic
        const favorites = await this.getFavoriteFoods(userId);
        const existingIndex = favorites.findIndex(f => f.foodName.toLowerCase() === nutritionData.foodItem.toLowerCase());

        let favoriteItem: FavoriteFoodItem;

        if (existingIndex >= 0) {
          // Update existing favorite
          favoriteItem = {
            ...favorites[existingIndex],
            frequency: favorites[existingIndex].frequency + 1,
            lastUsed: new Date(),
            nutrition: nutritionData
          };
          favorites[existingIndex] = favoriteItem;
        } else {
          // Create new favorite
          favoriteItem = {
            id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            foodName: nutritionData.foodItem,
            nutrition: nutritionData,
            frequency: 1,
            lastUsed: new Date(),
            createdAt: new Date()
          };
          favorites.push(favoriteItem);
        }

        localStorage.setItem(`${this.FAVORITES_KEY}_${userId}`, JSON.stringify(favorites));
        return favoriteItem;
      }
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'FoodService.addToFavorites',
        userId,
        nutritionData
      });
      throw error;
    }
  }

  /**
   * Search food entries
   */
  async searchFoodEntries(userId: string, query: string): Promise<FoodEntry[]> {
    try {
      const allEntries = await this.getFoodEntries(userId);
      const searchTerm = query.toLowerCase();

      return allEntries.filter(entry => 
        entry.foods.some(food => 
          food.foodItem.toLowerCase().includes(searchTerm)
        ) ||
        (entry.notes && entry.notes.toLowerCase().includes(searchTerm))
      );
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'FoodService.searchFoodEntries',
        userId,
        query
      });
      return [];
    }
  }

  /**
   * Get recent unique food items
   */
  async getRecentFoods(userId: string, limit: number = 10): Promise<Array<{ description: string; lastEaten: string }>> {
    try {
      const allEntries = await this.getFoodEntries(userId);
      const recentFoods = new Map<string, string>();

      // Sort entries by date (most recent first)
      const sortedEntries = allEntries.sort((a, b) => 
        new Date(b.timestamp || b.date).getTime() - new Date(a.timestamp || a.date).getTime()
      );

      // Extract unique food items
      for (const entry of sortedEntries) {
        if (recentFoods.size >= limit) break;
        
        const description = entry.name || entry.description || '';
        if (description && !recentFoods.has(description.toLowerCase())) {
          recentFoods.set(description.toLowerCase(), description);
        }
      }

      return Array.from(recentFoods.values()).map(description => ({
        description,
        lastEaten: new Date().toISOString()
      }));
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'FoodService.getRecentFoods',
        userId,
        limit
      });
      return [];
    }
  }

  /**
   * Get nutrition trends over time
   */
  async getNutritionTrends(userId: string, days: number = 7): Promise<Array<{ date: string; calories: number; protein: number; carbs: number; fat: number }>> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const trends = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dailyNutrition = await this.getDailyNutrition(userId, dateStr);
        
        trends.push({
          date: dateStr,
          calories: dailyNutrition.totalCalories,
          protein: dailyNutrition.totalMacros.protein,
          carbs: dailyNutrition.totalMacros.carbohydrates,
          fat: dailyNutrition.totalMacros.fat
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return trends;
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'FoodService.getNutritionTrends',
        userId,
        days
      });
      return [];
    }
  }

  /**
   * Calculate meal nutrition from entries
   */
  private calculateMealNutrition(entries: FoodEntry[]): Partial<DailyNutrition> {
    if (entries.length === 0) return {};

    const totals = entries.reduce((acc, entry) => {
      entry.foods.forEach(food => {
        acc.calories += food.calories;
        acc.protein += food.macronutrients.protein;
        acc.carbs += food.macronutrients.carbohydrates;
        acc.fat += food.macronutrients.fat;
        acc.fiber += food.macronutrients.fiber;
        acc.sugar += food.macronutrients.sugar;
        acc.sodium += food.micronutrients.sodium;
        acc.potassium += food.micronutrients.potassium;
        acc.calcium += food.micronutrients.calcium;
        acc.iron += food.micronutrients.iron;
        acc.magnesium += food.micronutrients.magnesium || 0;
        acc.phosphorus += food.micronutrients.phosphorus || 0;
        acc.zinc += food.micronutrients.zinc || 0;
        acc.copper += food.micronutrients.copper || 0;
        acc.manganese += food.micronutrients.manganese || 0;
        acc.selenium += food.micronutrients.selenium || 0;
        acc.iodine += food.micronutrients.iodine || 0;
        acc.vitaminA += food.micronutrients.vitaminA;
        acc.vitaminD += food.micronutrients.vitaminD || 0;
        acc.vitaminE += food.micronutrients.vitaminE || 0;
        acc.vitaminK += food.micronutrients.vitaminK || 0;
        acc.vitaminC += food.micronutrients.vitaminC;
        acc.thiamine += food.micronutrients.thiamine || 0;
        acc.riboflavin += food.micronutrients.riboflavin || 0;
        acc.niacin += food.micronutrients.niacin || 0;
        acc.pantothenicAcid += food.micronutrients.pantothenicAcid || 0;
        acc.vitaminB6 += food.micronutrients.vitaminB6 || 0;
        acc.biotin += food.micronutrients.biotin || 0;
        acc.folate += food.micronutrients.folate || 0;
        acc.vitaminB12 += food.micronutrients.vitaminB12 || 0;
        acc.choline += food.micronutrients.choline || 0;
      });
      return acc;
    }, {
      calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0,
      // Essential Minerals
      sodium: 0, potassium: 0, calcium: 0, iron: 0, magnesium: 0, phosphorus: 0, zinc: 0, copper: 0, manganese: 0, selenium: 0, iodine: 0, chromium: 0, molybdenum: 0,
      // Additional Important Minerals
      fluoride: 0, chloride: 0, sulfur: 0, boron: 0, cobalt: 0,
      // Fat-soluble vitamins
      vitaminA: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0,
      // Water-soluble vitamins
      vitaminC: 0, thiamine: 0, riboflavin: 0, niacin: 0, pantothenicAcid: 0, vitaminB6: 0, biotin: 0, folate: 0, vitaminB12: 0, choline: 0
    });

    return {
      totalCalories: totals.calories,
      totalMacros: {
        protein: totals.protein,
        carbohydrates: totals.carbs,
        fat: totals.fat,
        fiber: totals.fiber,
        sugar: totals.sugar
      },
      totalMicros: {
        // Essential Minerals
        sodium: totals.sodium, potassium: totals.potassium, calcium: totals.calcium, iron: totals.iron, magnesium: totals.magnesium, phosphorus: totals.phosphorus, zinc: totals.zinc,
        copper: totals.copper, manganese: totals.manganese, selenium: totals.selenium, iodine: totals.iodine, chromium: totals.chromium, molybdenum: totals.molybdenum,
        // Additional Important Minerals
        fluoride: totals.fluoride, chloride: totals.chloride, sulfur: totals.sulfur, boron: totals.boron, cobalt: totals.cobalt,
        // Fat-soluble vitamins
        vitaminA: totals.vitaminA, vitaminD: totals.vitaminD, vitaminE: totals.vitaminE, vitaminK: totals.vitaminK,
        // Water-soluble vitamins
        vitaminC: totals.vitaminC, thiamine: totals.thiamine, riboflavin: totals.riboflavin, niacin: totals.niacin, pantothenicAcid: totals.pantothenicAcid,
        vitaminB6: totals.vitaminB6, biotin: totals.biotin, folate: totals.folate, vitaminB12: totals.vitaminB12, choline: totals.choline
      }
    };
  }

  /**
   * Calculate total nutrition from entries
   */
  private calculateTotalNutrition(entries: FoodEntry[]) {
    const totals = entries.reduce((acc, entry) => {
      entry.foods.forEach(food => {
        acc.calories += food.calories;
        acc.macros.protein += food.macronutrients.protein;
        acc.macros.carbohydrates += food.macronutrients.carbohydrates;
        acc.macros.fat += food.macronutrients.fat;
        acc.macros.fiber += food.macronutrients.fiber;
        acc.macros.sugar += food.macronutrients.sugar;
        // Essential Minerals
        acc.micros.sodium += food.micronutrients.sodium;
        acc.micros.potassium += food.micronutrients.potassium;
        acc.micros.calcium += food.micronutrients.calcium;
        acc.micros.iron += food.micronutrients.iron;
        acc.micros.magnesium += food.micronutrients.magnesium || 0;
        acc.micros.phosphorus += food.micronutrients.phosphorus || 0;
        acc.micros.zinc += food.micronutrients.zinc || 0;
        acc.micros.copper += food.micronutrients.copper || 0;
        acc.micros.manganese += food.micronutrients.manganese || 0;
        acc.micros.selenium += food.micronutrients.selenium || 0;
        acc.micros.iodine += food.micronutrients.iodine || 0;
        acc.micros.chromium += food.micronutrients.chromium || 0;
        acc.micros.molybdenum += food.micronutrients.molybdenum || 0;
        // Additional Important Minerals
        acc.micros.fluoride += food.micronutrients.fluoride || 0;
        acc.micros.chloride += food.micronutrients.chloride || 0;
        acc.micros.sulfur += food.micronutrients.sulfur || 0;
        acc.micros.boron += food.micronutrients.boron || 0;
        acc.micros.cobalt += food.micronutrients.cobalt || 0;
        // Fat-soluble vitamins
        acc.micros.vitaminA += food.micronutrients.vitaminA;
        acc.micros.vitaminD += food.micronutrients.vitaminD || 0;
        acc.micros.vitaminE += food.micronutrients.vitaminE || 0;
        acc.micros.vitaminK += food.micronutrients.vitaminK || 0;
        // Water-soluble vitamins
        acc.micros.vitaminC += food.micronutrients.vitaminC;
        acc.micros.thiamine += food.micronutrients.thiamine || 0;
        acc.micros.riboflavin += food.micronutrients.riboflavin || 0;
        acc.micros.niacin += food.micronutrients.niacin || 0;
        acc.micros.pantothenicAcid += food.micronutrients.pantothenicAcid || 0;
        acc.micros.vitaminB6 += food.micronutrients.vitaminB6 || 0;
        acc.micros.biotin += food.micronutrients.biotin || 0;
        acc.micros.folate += food.micronutrients.folate || 0;
        acc.micros.vitaminB12 += food.micronutrients.vitaminB12 || 0;
        acc.micros.choline += food.micronutrients.choline || 0;
      });
      return acc;
    }, {
      calories: 0,
      macros: { protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0 },
      micros: { 
        // Essential Minerals
        sodium: 0, potassium: 0, calcium: 0, iron: 0, magnesium: 0, phosphorus: 0, zinc: 0, copper: 0, manganese: 0, selenium: 0, iodine: 0, chromium: 0, molybdenum: 0,
        // Additional Important Minerals
        fluoride: 0, chloride: 0, sulfur: 0, boron: 0, cobalt: 0,
        // Fat-soluble vitamins
        vitaminA: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0,
        // Water-soluble vitamins
        vitaminC: 0, thiamine: 0, riboflavin: 0, niacin: 0, pantothenicAcid: 0, vitaminB6: 0, biotin: 0, folate: 0, vitaminB12: 0, choline: 0 
      }
    });

    return totals;
  }

  /**
   * Update food frequency in favorites
   */
  private async updateFoodFrequency(nutritionData: NutritionData[], userId: string): Promise<void> {
    try {
      for (const food of nutritionData) {
        await this.addToFavorites(userId, food);
      }
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'FoodService.updateFoodFrequency' 
      });
    }
  }

  /**
   * Save food entry to local storage
   */
  private async saveFoodEntryLocally(entry: FoodEntry): Promise<void> {
    try {
      const allEntries = this.loadFoodEntriesFromStorage();
      allEntries.push(entry);
      this.saveFoodEntriesToStorage(allEntries);
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'FoodService.saveFoodEntryLocally' 
      });
    }
  }

  /**
   * Load food entries from localStorage
   */
  private loadFoodEntriesFromStorage(): FoodEntry[] {
    try {
      const stored = localStorage.getItem(this.FOOD_ENTRIES_KEY);
      if (!stored) return [];

      return JSON.parse(stored);
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'FoodService.loadFoodEntriesFromStorage' 
      });
      return [];
    }
  }

  /**
   * Save food entries to localStorage
   */
  private saveFoodEntriesToStorage(entries: FoodEntry[]): void {
    try {
      // Keep only last 1000 entries to prevent storage bloat
      const trimmed = entries.slice(-1000);
      localStorage.setItem(this.FOOD_ENTRIES_KEY, JSON.stringify(trimmed));
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'FoodService.saveFoodEntriesToStorage' 
      });
    }
  }

  /**
   * Clear all food data for a user
   */
  clearUserData(userId: string): void {
    try {
      localStorage.removeItem(`${this.NUTRITION_GOALS_KEY}_${userId}`);
      localStorage.removeItem(`${this.FAVORITES_KEY}_${userId}`);
      
      // Remove user's food entries
      const allEntries = this.loadFoodEntriesFromStorage();
      const filteredEntries = allEntries.filter(entry => entry.userId !== userId);
      this.saveFoodEntriesToStorage(filteredEntries);
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'FoodService.clearUserData',
        userId 
      });
    }
  }

  // Offline queue management methods
  private addToOfflineQueue(item: OfflineQueueItem): void {
    try {
      const queue = this.getOfflineQueue();
      queue.push(item);
      localStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'FoodService.addToOfflineQueue'
      });
    }
  }

  private getOfflineQueue(): OfflineQueueItem[] {
    try {
      const stored = localStorage.getItem(this.OFFLINE_QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'FoodService.getOfflineQueue'
      });
      return [];
    }
  }

  private async processOfflineQueue(): Promise<void> {
    const queue = this.getOfflineQueue();
    if (queue.length === 0) return;

    console.log(`Processing ${queue.length} offline items...`);
    
    const processedItems: string[] = [];
    
    for (const item of queue) {
      try {
        switch (item.type) {
          case 'create_food_entry':
            if (item.nutritionData && item.userId) {
              // Update favorites frequency (the entry is already saved locally)
              await this.updateFoodFrequency(item.nutritionData, item.userId);
              
              // Mark as synced
              if (item.entry) {
                const allEntries = this.loadFoodEntriesFromStorage();
                const entryIndex = allEntries.findIndex(e => e.id === item.entry!.id);
                if (entryIndex >= 0) {
                  allEntries[entryIndex].synced = true;
                  this.saveFoodEntriesToStorage(allEntries);
                }
              }
            }
            break;
          case 'delete_food_entry':
            // Already processed locally, just track as synced
            break;
        }
        
        processedItems.push(item.entry?.id || item.entryId || 'unknown');
      } catch (error) {
        errorService.logError(error as Error, { 
          context: 'FoodService.processOfflineQueue',
          item
        });
      }
    }

    // Clear processed items from queue
    const remainingQueue = queue.filter(item => 
      !processedItems.includes(item.entry?.id || item.entryId || 'unknown')
    );
    
    localStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));
    
    if (processedItems.length > 0) {
      console.log(`Successfully synced ${processedItems.length} offline items`);
    }
  }

  // Public methods for offline queue management
  getOfflineQueueStatus(): { count: number; isOnline: boolean } {
    return {
      count: this.getOfflineQueue().length,
      isOnline: this.isOnline
    };
  }

  async forceSync(): Promise<void> {
    if (this.isOnline) {
      await this.processOfflineQueue();
    }
  }

  clearOfflineQueue(): void {
    localStorage.removeItem(this.OFFLINE_QUEUE_KEY);
  }
}

// Types for offline queue
interface OfflineQueueItem {
  type: 'create_food_entry' | 'delete_food_entry';
  entry?: FoodEntry;
  userId?: string;
  nutritionData?: NutritionData[];
  entryId?: string;
  timestamp: string;
}

// Create singleton instance
export const foodService = new FoodService();

export default foodService;