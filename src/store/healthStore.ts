import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StepData, FoodEntry } from '../types';

interface HealthState {
  // Step tracking
  stepData: StepData[];
  todaysSteps: number;
  stepGoal: number;
  isHealthKitAvailable: boolean;
  isGoogleFitAvailable: boolean;
  healthPermissionsGranted: boolean;

  // Food tracking
  foodEntries: FoodEntry[];
  todaysCalories: number;
  calorieGoal: number;

  // Loading states
  isLoadingSteps: boolean;
  isLoadingFood: boolean;
  
  // Error states
  stepError: string | null;
  foodError: string | null;
}

interface HealthActions {
  // Step actions
  setStepData: (data: StepData[]) => void;
  addStepEntry: (entry: StepData) => void;
  updateTodaysSteps: (steps: number) => void;
  setStepGoal: (goal: number) => void;
  setHealthKitAvailable: (available: boolean) => void;
  setGoogleFitAvailable: (available: boolean) => void;
  setHealthPermissions: (granted: boolean) => void;
  setStepLoading: (loading: boolean) => void;
  setStepError: (error: string | null) => void;

  // Food actions
  setFoodEntries: (entries: FoodEntry[]) => void;
  addFoodEntry: (entry: FoodEntry) => void;
  updateFoodEntry: (id: string, updates: Partial<FoodEntry>) => void;
  deleteFoodEntry: (id: string) => void;
  updateTodaysCalories: (calories: number) => void;
  setCalorieGoal: (goal: number) => void;
  setFoodLoading: (loading: boolean) => void;
  setFoodError: (error: string | null) => void;

  // Combined actions
  clearAllData: () => void;
  clearErrors: () => void;
}

type HealthStore = HealthState & HealthActions;

export const useHealthStore = create<HealthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      stepData: [],
      todaysSteps: 0,
      stepGoal: 8000,
      isHealthKitAvailable: false,
      isGoogleFitAvailable: false,
      healthPermissionsGranted: false,
      
      foodEntries: [],
      todaysCalories: 0,
      calorieGoal: 2000,
      
      isLoadingSteps: false,
      isLoadingFood: false,
      stepError: null,
      foodError: null,

      // Step actions
      setStepData: (stepData) => set({ stepData }),

      addStepEntry: (entry) => {
        const currentData = get().stepData;
        const existingIndex = currentData.findIndex(
          item => item.date === entry.date
        );
        
        if (existingIndex >= 0) {
          const updated = [...currentData];
          updated[existingIndex] = entry;
          set({ stepData: updated });
        } else {
          set({ stepData: [...currentData, entry] });
        }
      },

      updateTodaysSteps: (todaysSteps) => set({ todaysSteps }),

      setStepGoal: (stepGoal) => set({ stepGoal }),

      setHealthKitAvailable: (isHealthKitAvailable) => set({ isHealthKitAvailable }),

      setGoogleFitAvailable: (isGoogleFitAvailable) => set({ isGoogleFitAvailable }),

      setHealthPermissions: (healthPermissionsGranted) => set({ healthPermissionsGranted }),

      setStepLoading: (isLoadingSteps) => set({ isLoadingSteps }),

      setStepError: (stepError) => set({ stepError }),

      // Food actions
      setFoodEntries: (foodEntries) => set({ foodEntries }),

      addFoodEntry: (entry) => {
        const currentEntries = get().foodEntries;
        set({ foodEntries: [...currentEntries, entry] });
        
        // Update today's calories if the entry is from today
        const today = new Date().toISOString().split('T')[0];
        if (entry.date === today) {
          const todaysEntries = [...currentEntries, entry].filter(
            e => e.date === today
          );
          const totalCalories = todaysEntries.reduce(
            (sum, e) => sum + e.calories, 0
          );
          set({ todaysCalories: totalCalories });
        }
      },

      updateFoodEntry: (id, updates) => {
        const currentEntries = get().foodEntries;
        const updatedEntries = currentEntries.map(entry =>
          entry.id === id ? { ...entry, ...updates } : entry
        );
        set({ foodEntries: updatedEntries });
        
        // Recalculate today's calories
        const today = new Date().toISOString().split('T')[0];
        const todaysEntries = updatedEntries.filter(e => e.date === today);
        const totalCalories = todaysEntries.reduce(
          (sum, e) => sum + e.calories, 0
        );
        set({ todaysCalories: totalCalories });
      },

      deleteFoodEntry: (id) => {
        const currentEntries = get().foodEntries;
        const filteredEntries = currentEntries.filter(entry => entry.id !== id);
        set({ foodEntries: filteredEntries });
        
        // Recalculate today's calories
        const today = new Date().toISOString().split('T')[0];
        const todaysEntries = filteredEntries.filter(e => e.date === today);
        const totalCalories = todaysEntries.reduce(
          (sum, e) => sum + e.calories, 0
        );
        set({ todaysCalories: totalCalories });
      },

      updateTodaysCalories: (todaysCalories) => set({ todaysCalories }),

      setCalorieGoal: (calorieGoal) => set({ calorieGoal }),

      setFoodLoading: (isLoadingFood) => set({ isLoadingFood }),

      setFoodError: (foodError) => set({ foodError }),

      // Combined actions
      clearAllData: () => set({
        stepData: [],
        todaysSteps: 0,
        foodEntries: [],
        todaysCalories: 0,
        isLoadingSteps: false,
        isLoadingFood: false,
        stepError: null,
        foodError: null,
      }),

      clearErrors: () => set({
        stepError: null,
        foodError: null,
      }),
    }),
    {
      name: 'health-storage',
      partialize: (state) => ({
        stepData: state.stepData,
        stepGoal: state.stepGoal,
        foodEntries: state.foodEntries,
        calorieGoal: state.calorieGoal,
        healthPermissionsGranted: state.healthPermissionsGranted,
      }),
    }
  )
);