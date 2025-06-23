// Supabase-powered health service for cross-device sync
import { supabase, getCurrentUserId } from '../lib/supabase';
import { StepEntry, CreateStepEntryRequest, StepGoal } from '../types/steps';
import { errorService } from './errorService';

export class SupabaseHealthService {
  
  /**
   * Get step data for a date range from Supabase
   */
  async getStepData(startDate: Date, endDate: Date): Promise<StepEntry[]> {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        console.warn('No user ID available for step data fetch');
        return [];
      }

      const { data, error } = await supabase
        .from('step_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching step data:', error);
        throw error;
      }

      // Convert Supabase data to StepEntry format
      return (data || []).map(row => ({
        id: row.id,
        userId: row.user_id,
        date: row.date,
        stepCount: row.step_count,
        distance: row.distance,
        activeMinutes: row.active_minutes,
        caloriesBurned: row.calories_burned,
        source: row.source as any,
        synced: true,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        deviceInfo: {
          platform: 'web' as const
        }
      }));

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'SupabaseHealthService.getStepData',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      return [];
    }
  }

  /**
   * Add manual step entry to Supabase
   */
  async addManualStepEntry(entry: CreateStepEntryRequest): Promise<StepEntry> {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('No user ID available');
      }

      const { data, error } = await supabase
        .from('step_entries')
        .upsert({
          user_id: userId,
          date: entry.date,
          step_count: entry.stepCount,
          distance: entry.distance,
          active_minutes: entry.activeMinutes,
          calories_burned: entry.caloriesBurned,
          source: entry.source || 'manual'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving step entry:', error);
        throw error;
      }

      // Convert back to StepEntry format
      const stepEntry: StepEntry = {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        stepCount: data.step_count,
        distance: data.distance,
        activeMinutes: data.active_minutes,
        caloriesBurned: data.calories_burned,
        source: data.source as any,
        synced: true,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        deviceInfo: {
          platform: 'web' as const
        }
      };

      return stepEntry;

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'SupabaseHealthService.addManualStepEntry',
        entry
      });
      throw error;
    }
  }

  /**
   * Set daily step goal in Supabase
   */
  async setDailyStepGoal(target: number): Promise<StepGoal> {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('No user ID available');
      }

      // First, deactivate any existing daily step goals
      await supabase
        .from('user_goals')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('goal_type', 'daily_steps')
        .eq('is_active', true);

      // Insert new goal
      const { data, error } = await supabase
        .from('user_goals')
        .insert({
          user_id: userId,
          goal_type: 'daily_steps',
          target_value: target,
          start_date: new Date().toISOString().split('T')[0],
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error setting step goal:', error);
        throw error;
      }

      const goal: StepGoal = {
        id: data.id,
        userId: data.user_id,
        dailyTarget: data.target_value,
        startDate: new Date(data.start_date),
        endDate: data.end_date ? new Date(data.end_date) : undefined,
        isActive: data.is_active,
        createdAt: new Date(data.created_at)
      };

      return goal;

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'SupabaseHealthService.setDailyStepGoal',
        target
      });
      throw error;
    }
  }

  /**
   * Get current step goal from Supabase
   */
  async getCurrentStepGoal(): Promise<StepGoal | null> {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        return null;
      }

      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('goal_type', 'daily_steps')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching step goal:', error);
        throw error;
      }

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        dailyTarget: data.target_value,
        startDate: new Date(data.start_date),
        endDate: data.end_date ? new Date(data.end_date) : undefined,
        isActive: data.is_active,
        createdAt: new Date(data.created_at)
      };

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'SupabaseHealthService.getCurrentStepGoal'
      });
      return null;
    }
  }

  /**
   * Sync data from localStorage to Supabase (migration helper)
   */
  async migrateFromLocalStorage(): Promise<void> {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        console.warn('No user ID available for migration');
        return;
      }

      // Get existing localStorage step entries
      const localStepEntries = localStorage.getItem('step_entries');
      if (localStepEntries) {
        const entries = JSON.parse(localStepEntries);
        
        for (const entry of entries) {
          // Convert localStorage format to Supabase format
          await supabase
            .from('step_entries')
            .upsert({
              user_id: userId,
              date: entry.date,
              step_count: entry.stepCount,
              distance: entry.distance,
              active_minutes: entry.activeMinutes,
              calories_burned: entry.caloriesBurned,
              source: entry.source || 'device'
            });
        }

        console.log(`Migrated ${entries.length} step entries to Supabase`);
      }

      // Get existing localStorage step goal
      const localStepGoal = localStorage.getItem('step_goal');
      if (localStepGoal) {
        const goal = JSON.parse(localStepGoal);
        await this.setDailyStepGoal(goal.dailyTarget);
        console.log('Migrated step goal to Supabase');
      }

    } catch (error) {
      errorService.logError(error as Error, {
        context: 'SupabaseHealthService.migrateFromLocalStorage'
      });
    }
  }
}

export const supabaseHealthService = new SupabaseHealthService();