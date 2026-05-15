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
          logger.store('Initializing store state');
          const state = get();
          
          // Cleanup step: Ensure all workouts and weight history have unique IDs
          // This fixes a bug where new entries might have received 'undefined' as an ID
          let needsIdCleanup = false;
          const cleanedWorkouts = (state.workouts || []).map(w => {
            if (!w.id || w.id === 'undefined') {
              needsIdCleanup = true;
              return { ...w, id: crypto.randomUUID() };
            }
            return w;
          });

          const cleanedWeight = (state.weightHistory || []).map(w => {
            if (!w.id || w.id === 'undefined') {
              needsIdCleanup = true;
              return { ...w, id: crypto.randomUUID() };
            }
            return w;
          });

          const cleanedGoals = (state.goals || []).map(g => {
            if (!g.id || g.id === 'undefined') {
              needsIdCleanup = true;
              return { ...g, id: crypto.randomUUID() };
            }
            return g;
          });

          // Ensure activeGoalId is valid
          let activeGoalId = state.activeGoalId;
          const activeGoalExists = (state.goals || []).find(g => g.id === activeGoalId);
          if (!activeGoalId || !activeGoalExists) {
            const firstActive = (state.goals || []).find(g => g.status === 'ACTIVE' || g.status === 'SECONDARY');
            if (firstActive) {
              activeGoalId = firstActive.id;
              needsIdCleanup = true;
            }
          }

          if (needsIdCleanup) {
            logger.store('Cleaned up entries with missing or invalid IDs');
            set({ 
              workouts: cleanedWorkouts, 
              weightHistory: cleanedWeight,
              goals: cleanedGoals,
              activeGoalId: activeGoalId
            });
          }

          // If the user has already loaded some data (even 1 entry), don't auto-populate demo data
          if ((state.goals && state.goals.length > 0) || (state.workouts && state.workouts.length > 0) || (state.weightHistory && state.weightHistory.length > 0)) {
            return;
          }

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
          // Explicitly call initialize after hydration to ensure consistency
          state?.initialize();
        }
      },
      version: 3,
      migrate: (persistedState, version) => {
        const state = persistedState as any;
        if (version < 3) {
          logger.store(`Migrating store from version ${version} to 3`);
          return {
            ...state,
            profile: {
              ...createDefaultProfile(),
              ...(state?.profile || {}),
            },
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
