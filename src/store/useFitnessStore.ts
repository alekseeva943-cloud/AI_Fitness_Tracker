import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FitnessState } from '../types';
import { INITIAL_DEMO_STATE } from '../types/demoData';
import { createProfileSlice, ProfileSlice } from './slices/profileSlice';
import { createGoalsSlice, GoalsSlice } from './slices/goalsSlice';
import { createEntriesSlice, EntriesSlice } from './slices/entriesSlice';
import { createAISlice, AISlice } from './slices/aiSlice';
import { createThemeSlice, ThemeSlice } from './slices/themeSlice';
import { logger } from '../lib/logger';

export type FitnessStore = FitnessState & 
  ProfileSlice & 
  GoalsSlice & 
  EntriesSlice & 
  AISlice & 
  ThemeSlice & {
    initialize: () => void;
    resetData: () => void;
  };

export const useFitnessStore = create<FitnessStore>()(
  persist(
    (set, get, api) => ({
      ...createProfileSlice(set as any, get as any, api as any),
      ...createGoalsSlice(set as any, get as any, api as any),
      ...createEntriesSlice(set as any, get as any, api as any),
      ...createAISlice(set as any, get as any, api as any),
      ...createThemeSlice(set as any, get as any, api as any),

      resetData: () => {
        logger.store('Resetting all data to empty state');
        set({
          profile: null,
          goals: [],
          workouts: [],
          weightHistory: [],
          analyses: [],
          isDemoMode: false
        });
        // Clear explicitly to be safe as well
        try {
          localStorage.removeItem('fitness-tracker-storage-v2');
        } catch (e) {
          logger.error('Failed to clear localStorage', e);
        }
      },

      initialize: () => {
        try {
          logger.store('Initializing store state');
          const state = get();
          
          // If the user has already loaded some data (even 1 entry), don't auto-populate demo data
          if (state.goals.length > 0 || state.workouts.length > 0 || state.weightHistory.length > 0) {
            return;
          }

          // If we are strictly empty and not explicitly marked as NOT demo, we can show demo data
          // But according to user request: "Users do not understand where demo data comes from"
          // Let's populate demo data only if they haven't "cleaned" the state yet.
          // Since resetData sets isDemoMode to false, we can use that.
          if (state.isDemoMode !== false) {
             logger.store('Populating empty store with initial demo data');
             set({ ...INITIAL_DEMO_STATE, isDemoMode: true });
          }
        } catch (err) {
          logger.error('Store initialization failed', err);
          // Fallback to demo data on total failure
          set({ ...INITIAL_DEMO_STATE });
        }
      },
    }),
    {
      name: 'fitness-tracker-storage-v2',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          logger.error('Store hydration failed', error);
        } else {
          logger.store('Store rehydrated successfully', { hasState: !!state });
        }
      },
      version: 1,
    }
  )
);

// Selectors for performance
export const useTheme = () => useFitnessStore((state) => state.theme);
export const useProfile = () => useFitnessStore((state) => state.profile);
export const useGoals = () => useFitnessStore((state) => state.goals);
export const useWorkouts = () => useFitnessStore((state) => state.workouts);
export const useWeightHistory = () => useFitnessStore((state) => state.weightHistory);
export const useAnalyses = () => useFitnessStore((state) => state.analyses);
export const useAnalysisRequest = () => useFitnessStore((state) => state.analysisRequest);
