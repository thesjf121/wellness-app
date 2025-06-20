// Food journal service for managing food entries and nutrition data

import { FoodEntry, MealType, DailyNutrition, NutritionGoals, CreateFoodEntryRequest, FavoriteFoodItem } from '../types/food';
import { NutritionData } from './geminiService';
import { errorService } from './errorService';
import { activityTrackingService } from './activityTrackingService';

class FoodService {
  private readonly FOOD_ENTRIES_KEY = 'wellness_food_entries';
  private readonly NUTRITION_GOALS_KEY = 'wellness_nutrition_goals';
  private readonly FAVORITES_KEY = 'wellness_favorite_foods';
  private readonly OFFLINE_QUEUE_KEY = 'wellness_offline_queue';
  private isOnline = navigator.onLine;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
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
      const entry: FoodEntry = {
        id: `food_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        date: request.date,
        mealType: request.mealType,
        foods: nutritionData,
        notes: request.notes,
        imageUrl: request.imageBase64, // In production, would upload to cloud storage
        createdAt: new Date(),
        updatedAt: new Date(),
        synced: this.isOnline
      };

      // Save locally first (works both online and offline)
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

      errorService.logInfo('Food entry created', { 
        entryId: entry.id,
        mealType: entry.mealType,
        foodCount: nutritionData.length,
        offline: !this.isOnline
      });

      return entry;
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
        totalMicros: { sodium: 0, potassium: 0, calcium: 0, iron: 0, vitaminC: 0, vitaminA: 0 },
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
      const nutritionGoals: NutritionGoals = {
        userId,
        ...goals,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      localStorage.setItem(`${this.NUTRITION_GOALS_KEY}_${userId}`, JSON.stringify(nutritionGoals));
      
      return nutritionGoals;
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
        acc.vitaminC += food.micronutrients.vitaminC;
        acc.vitaminA += food.micronutrients.vitaminA;
      });
      return acc;
    }, {
      calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0,
      sodium: 0, potassium: 0, calcium: 0, iron: 0, vitaminC: 0, vitaminA: 0
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
        sodium: totals.sodium,
        potassium: totals.potassium,
        calcium: totals.calcium,
        iron: totals.iron,
        vitaminC: totals.vitaminC,
        vitaminA: totals.vitaminA
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
        acc.micros.sodium += food.micronutrients.sodium;
        acc.micros.potassium += food.micronutrients.potassium;
        acc.micros.calcium += food.micronutrients.calcium;
        acc.micros.iron += food.micronutrients.iron;
        acc.micros.vitaminC += food.micronutrients.vitaminC;
        acc.micros.vitaminA += food.micronutrients.vitaminA;
      });
      return acc;
    }, {
      calories: 0,
      macros: { protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0 },
      micros: { sodium: 0, potassium: 0, calcium: 0, iron: 0, vitaminC: 0, vitaminA: 0 }
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