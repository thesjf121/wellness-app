// Supabase-powered food service for cross-device sync
import { supabase, getCurrentUserId } from '../lib/supabase';
import { FoodEntry, CreateFoodEntryRequest, NutritionGoals, FavoriteFoodItem } from '../types/food';
import { NutritionData } from './geminiService';
import { errorService } from './errorService';

export class SupabaseFoodService {
  
  /**
   * Get food entries for a date range from Supabase
   */
  async getFoodEntries(startDate?: Date, endDate?: Date): Promise<FoodEntry[]> {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        console.warn('No user ID available for food entries fetch');
        return [];
      }

      let query = supabase
        .from('food_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate.toISOString().split('T')[0]);
      }
      if (endDate) {
        query = query.lte('date', endDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching food entries:', error);
        throw error;
      }

      // Convert Supabase data to FoodEntry format
      return (data || []).map(row => ({
        id: row.id,
        userId: row.user_id,
        date: row.date,
        mealType: row.meal_type,
        foods: JSON.parse(row.foods_json),
        notes: row.notes,
        imageUrl: row.image_url,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        synced: true
      }));

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'SupabaseFoodService.getFoodEntries',
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      });
      return [];
    }
  }

  /**
   * Create food entry in Supabase
   */
  async createFoodEntry(request: CreateFoodEntryRequest, nutritionData: NutritionData[]): Promise<FoodEntry> {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('No user ID available');
      }

      const { data, error } = await supabase
        .from('food_entries')
        .insert({
          user_id: userId,
          date: request.date,
          meal_type: request.mealType,
          foods_json: JSON.stringify(nutritionData),
          notes: request.notes,
          image_url: request.imageBase64
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating food entry:', error);
        throw error;
      }

      // Convert back to FoodEntry format
      const foodEntry: FoodEntry = {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        mealType: data.meal_type,
        foods: JSON.parse(data.foods_json),
        notes: data.notes,
        imageUrl: data.image_url,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        synced: true
      };

      return foodEntry;

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'SupabaseFoodService.createFoodEntry',
        request,
        nutritionData
      });
      throw error;
    }
  }

  /**
   * Update food entry in Supabase
   */
  async updateFoodEntry(entryId: string, updates: Partial<FoodEntry>): Promise<FoodEntry | null> {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('No user ID available');
      }

      const updateData: any = {};
      
      if (updates.date !== undefined) updateData.date = updates.date;
      if (updates.mealType !== undefined) updateData.meal_type = updates.mealType;
      if (updates.foods !== undefined) updateData.foods_json = JSON.stringify(updates.foods);
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;

      const { data, error } = await supabase
        .from('food_entries')
        .update(updateData)
        .eq('id', entryId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating food entry:', error);
        throw error;
      }

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        mealType: data.meal_type,
        foods: JSON.parse(data.foods_json),
        notes: data.notes,
        imageUrl: data.image_url,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        synced: true
      };

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'SupabaseFoodService.updateFoodEntry',
        entryId,
        updates
      });
      return null;
    }
  }

  /**
   * Delete food entry from Supabase
   */
  async deleteFoodEntry(entryId: string): Promise<boolean> {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('No user ID available');
      }

      const { error } = await supabase
        .from('food_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting food entry:', error);
        throw error;
      }

      return true;

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'SupabaseFoodService.deleteFoodEntry',
        entryId
      });
      return false;
    }
  }

  /**
   * Set nutrition goals in Supabase
   */
  async setNutritionGoals(goals: Omit<NutritionGoals, 'userId' | 'createdAt' | 'updatedAt'>): Promise<NutritionGoals> {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('No user ID available');
      }

      // First, deactivate any existing nutrition goals
      await supabase
        .from('user_goals')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('goal_type', 'nutrition')
        .eq('is_active', true);

      // Insert new nutrition goals
      const { data, error } = await supabase
        .from('user_goals')
        .insert({
          user_id: userId,
          goal_type: 'nutrition',
          target_value: goals.dailyCalories,
          metadata: JSON.stringify({
            macroGoals: goals.macroGoals,
            microGoals: goals.microGoals
          }),
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error setting nutrition goals:', error);
        throw error;
      }

      const metadata = JSON.parse(data.metadata || '{}');
      
      const nutritionGoals: NutritionGoals = {
        userId: data.user_id,
        dailyCalories: data.target_value,
        macroGoals: metadata.macroGoals || {
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          fiber: 0,
          sugar: 0
        },
        microGoals: metadata.microGoals || {
          sodium: 0, potassium: 0, calcium: 0, iron: 0, magnesium: 0, phosphorus: 0, zinc: 0, copper: 0, manganese: 0, selenium: 0, iodine: 0, chromium: 0, molybdenum: 0,
          fluoride: 0, chloride: 0, sulfur: 0, boron: 0, cobalt: 0,
          vitaminA: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0,
          vitaminC: 0, thiamine: 0, riboflavin: 0, niacin: 0, pantothenicAcid: 0, vitaminB6: 0, biotin: 0, folate: 0, vitaminB12: 0, choline: 0
        },
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      return nutritionGoals;

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'SupabaseFoodService.setNutritionGoals',
        goals
      });
      throw error;
    }
  }

  /**
   * Get nutrition goals from Supabase
   */
  async getNutritionGoals(): Promise<NutritionGoals | null> {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        return null;
      }

      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('goal_type', 'nutrition')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching nutrition goals:', error);
        throw error;
      }

      if (!data) {
        return null;
      }

      const metadata = JSON.parse(data.metadata || '{}');

      return {
        userId: data.user_id,
        dailyCalories: data.target_value,
        macroGoals: metadata.macroGoals || {
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          fiber: 0,
          sugar: 0
        },
        microGoals: metadata.microGoals || {
          sodium: 0, potassium: 0, calcium: 0, iron: 0, magnesium: 0, phosphorus: 0, zinc: 0, copper: 0, manganese: 0, selenium: 0, iodine: 0, chromium: 0, molybdenum: 0,
          fluoride: 0, chloride: 0, sulfur: 0, boron: 0, cobalt: 0,
          vitaminA: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0,
          vitaminC: 0, thiamine: 0, riboflavin: 0, niacin: 0, pantothenicAcid: 0, vitaminB6: 0, biotin: 0, folate: 0, vitaminB12: 0, choline: 0
        },
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'SupabaseFoodService.getNutritionGoals'
      });
      return null;
    }
  }

  /**
   * Get or create favorite foods from Supabase
   */
  async getFavoriteFoods(): Promise<FavoriteFoodItem[]> {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        return [];
      }

      const { data, error } = await supabase
        .from('favorite_foods')
        .select('*')
        .eq('user_id', userId)
        .order('frequency', { ascending: false });

      if (error) {
        console.error('Error fetching favorite foods:', error);
        throw error;
      }

      return (data || []).map(row => ({
        id: row.id,
        userId: row.user_id,
        foodName: row.food_name,
        nutrition: JSON.parse(row.nutrition_json),
        frequency: row.frequency,
        lastUsed: new Date(row.last_used),
        createdAt: new Date(row.created_at)
      }));

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'SupabaseFoodService.getFavoriteFoods'
      });
      return [];
    }
  }

  /**
   * Add or update favorite food in Supabase
   */
  async addToFavorites(nutritionData: NutritionData): Promise<FavoriteFoodItem> {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('No user ID available');
      }

      // Check if food already exists in favorites
      const { data: existing, error: selectError } = await supabase
        .from('favorite_foods')
        .select('*')
        .eq('user_id', userId)
        .ilike('food_name', nutritionData.foodItem)
        .maybeSingle();

      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
      }

      let result: any;

      if (existing) {
        // Update existing favorite
        const { data, error } = await supabase
          .from('favorite_foods')
          .update({
            frequency: existing.frequency + 1,
            nutrition_json: JSON.stringify(nutritionData),
            last_used: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new favorite
        const { data, error } = await supabase
          .from('favorite_foods')
          .insert({
            user_id: userId,
            food_name: nutritionData.foodItem,
            nutrition_json: JSON.stringify(nutritionData),
            frequency: 1,
            last_used: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return {
        id: result.id,
        userId: result.user_id,
        foodName: result.food_name,
        nutrition: JSON.parse(result.nutrition_json),
        frequency: result.frequency,
        lastUsed: new Date(result.last_used),
        createdAt: new Date(result.created_at)
      };

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'SupabaseFoodService.addToFavorites',
        nutritionData
      });
      throw error;
    }
  }

  /**
   * Migrate existing localStorage data to Supabase
   */
  async migrateFromLocalStorage(): Promise<void> {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        console.warn('No user ID available for food data migration');
        return;
      }

      // Migrate food entries
      const localFoodEntries = localStorage.getItem('wellness_food_entries');
      if (localFoodEntries) {
        const entries = JSON.parse(localFoodEntries);
        const userEntries = entries.filter((entry: any) => entry.userId === userId);
        
        for (const entry of userEntries) {
          await supabase
            .from('food_entries')
            .upsert({
              id: entry.id,
              user_id: entry.userId,
              date: entry.date,
              meal_type: entry.mealType,
              foods_json: JSON.stringify(entry.foods),
              notes: entry.notes,
              image_url: entry.imageUrl,
              created_at: entry.createdAt,
              updated_at: entry.updatedAt
            });
        }

        console.log(`Migrated ${userEntries.length} food entries to Supabase`);
      }

      // Migrate nutrition goals
      const localNutritionGoals = localStorage.getItem(`wellness_nutrition_goals_${userId}`);
      if (localNutritionGoals) {
        const goals = JSON.parse(localNutritionGoals);
        await this.setNutritionGoals(goals);
        console.log('Migrated nutrition goals to Supabase');
      }

      // Migrate favorite foods
      const localFavorites = localStorage.getItem(`wellness_favorite_foods_${userId}`);
      if (localFavorites) {
        const favorites = JSON.parse(localFavorites);
        
        for (const favorite of favorites) {
          await supabase
            .from('favorite_foods')
            .upsert({
              id: favorite.id,
              user_id: favorite.userId,
              food_name: favorite.foodName,
              nutrition_json: JSON.stringify(favorite.nutrition),
              frequency: favorite.frequency,
              last_used: favorite.lastUsed,
              created_at: favorite.createdAt
            });
        }

        console.log(`Migrated ${favorites.length} favorite foods to Supabase`);
      }

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'SupabaseFoodService.migrateFromLocalStorage'
      });
    }
  }
}

export const supabaseFoodService = new SupabaseFoodService();