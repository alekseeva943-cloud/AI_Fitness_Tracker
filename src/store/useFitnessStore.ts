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
import { createDefaultProfile } from '../factories/createDefaultProfile';

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

      profile: createDefaultProfile(), // Initial state before hydration

      resetData: () => {
        logger.store('Resetting all data to empty state');
        set({
          profile: createDefaultProfile(),
          goals: [],
          activeGoalId: null,
          workouts: [],
          weightHistory: [],
          analyses: [],
          isDemoMode: false
        });
        // Clear explicitly to be safe as well
        try {
          localStorage.removeItem('fitness-tracker-storage-v3');
        } catch (e) {
          logger.error('Failed to clear localStorage', e);
        }
      },

      initialize: () => {
        try {
          logger.store('Initializing store state (Auto-init disabled for diagnostics)');
          // For diagnostics, we temporarily disable the cleanup and demo population logic
          // to see if it contributes to the React crash loop.
          
          /* 
          const state = get();
          // ... cleanup logic ...
          */
        } catch (err) {
          logger.error('Store initialization failed', err);
        }
      },
    }),
    {
      name: 'fitness-tracker-storage-v3',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        console.group('[STORE HYDRATION]');
        console.log('hydrated state:', state);
        console.log('profile:', state?.profile);
        console.log('error:', error);
        console.groupEnd();

        if (error) {
          logger.error('Store hydration failed', error);
        } else {
          logger.store('Store rehydrated successfully', { hasState: !!state });
        }
      },
      version: 3,
      migrate: (persistedState, version) => {
        const state = persistedState as any;
        
        // Initial migration logic
        if (version < 3) {
          logger.store(`Migrating store from version ${version} to 3`);
          
          // Ensure we preserve the whole state structure
          return {
            ...state,
            profile: {
              ...createDefaultProfile(),
              ...(state?.profile || {}),
            },
            // Explicitly ensure critical arrays exist to prevent map errors
            goals: state?.goals || [],
            workouts: state?.workouts || [],
            weightHistory: state?.weightHistory || [],
            analyses: state?.analyses || [],
            activeGoalId: state?.activeGoalId || null,
          };
        }
        
        return state;
      },
    }
  )
);

// Selectors for performance
export const useTheme = () => useFitnessStore((state) => state.theme);
export const useProfile = () => useFitnessStore((state) => state.profile);
export const useGoals = () => useFitnessStore((state) => state.goals);
export const useActiveGoalId = () => useFitnessStore((state) => state.activeGoalId);
export const useWorkouts = () => useFitnessStore((state) => state.workouts);
export const useWeightHistory = () => useFitnessStore((state) => state.weightHistory);
export const useAnalyses = () => useFitnessStore((state) => state.analyses);
export const useAnalysisRequest = () => useFitnessStore((state) => state.analysisRequest);
