import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FitnessState } from '../types';
import { INITIAL_DEMO_STATE } from '../types/demoData';
import { createProfileSlice, ProfileSlice } from './slices/profileSlice';
import { createGoalsSlice, GoalsSlice } from './slices/goalsSlice';
import { createEntriesSlice, EntriesSlice } from './slices/entriesSlice';
import { createPlanSlice, PlanSlice } from './slices/planSlice';
import { createAISlice, AISlice } from './slices/aiSlice';
import { createThemeSlice, ThemeSlice } from './slices/themeSlice';
import { logger } from '../lib/logger';
import { createDefaultProfile } from '../factories/createDefaultProfile';

export type FitnessStore = FitnessState & 
  ProfileSlice & 
  GoalsSlice & 
  EntriesSlice & 
  PlanSlice &
  AISlice & 
  ThemeSlice & {
    initialize: () => void;
    resetData: () => void;
    _lastInit?: number;
  };

const generateId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11);

export const useFitnessStore = create<FitnessStore>()(
  persist(
    (set, get, api) => ({
      ...createProfileSlice(set as any, get as any, api as any),
      ...createGoalsSlice(set as any, get as any, api as any),
      ...createEntriesSlice(set as any, get as any, api as any),
      ...createPlanSlice(set as any, get as any, api as any),
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
          planEvents: [],
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
          const now = Date.now();
          const state = get();
          
          // Rate limit initialization to once per second to prevent rapid loops
          if (state._lastInit && now - state._lastInit < 1000) {
            return;
          }
          
          let needsIdCleanup = false;
          // Use more strict checks for missing IDs
          const cleanedWorkouts = (state.workouts || []).map(w => {
            if (w.id === undefined || w.id === null || w.id === 'undefined' || w.id === '') {
              needsIdCleanup = true;
              return { ...w, id: generateId() };
            }
            return w;
          });

          const cleanedWeight = (state.weightHistory || []).map(w => {
            if (w.id === undefined || w.id === null || w.id === 'undefined' || w.id === '') {
              needsIdCleanup = true;
              return { ...w, id: generateId() };
            }
            return w;
          });

          const cleanedGoals = (state.goals || []).map(g => {
            if (g.id === undefined || g.id === null || g.id === 'undefined' || g.id === '') {
              needsIdCleanup = true;
              return { ...g, id: generateId() };
            }
            return g;
          });

          const cleanedEvents = (state.planEvents || []).map(e => {
            if (e.id === undefined || e.id === null || e.id === 'undefined' || e.id === '') {
              needsIdCleanup = true;
              return { ...e, id: generateId() };
            }
            return e;
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
              planEvents: cleanedEvents,
              activeGoalId: activeGoalId,
              _lastInit: now
            });
          } else {
            set({ _lastInit: now });
          }

          // If the user has already loaded some data (even 1 entry), don't auto-populate demo data
          const hasData = (state.goals?.length > 0) || (state.workouts?.length > 0) || (state.weightHistory?.length > 0);
          
          if (!hasData && state.isDemoMode !== false) {
             logger.store('Populating empty store with initial demo data');
             set({ ...INITIAL_DEMO_STATE, isDemoMode: true });
          }
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
      version: 4,
      migrate: (persistedState, version) => {
        const state = persistedState as any;
        
        if (version < 4) {
          logger.store(`Migrating store from version ${version} to 4`);
          
          return {
            ...state,
            profile: {
              ...createDefaultProfile(),
              ...(state?.profile || {}),
              // Ensure critical new fields exist
              displayName: state?.profile?.displayName || state?.profile?.name || 'Пользователь',
              avatarUrl: state?.profile?.avatarUrl || undefined,
            },
            goals: state?.goals || [],
            workouts: state?.workouts || [],
            weightHistory: state?.weightHistory || [],
            planEvents: state?.planEvents || [],
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
