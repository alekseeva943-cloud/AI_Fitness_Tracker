import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FitnessState } from '../types';
import { INITIAL_DEMO_STATE } from '../types/demoData';
import { createProfileSlice, ProfileSlice } from './slices/profileSlice';
import { createGoalsSlice, GoalsSlice } from './slices/goalsSlice';
import { createEntriesSlice, EntriesSlice } from './slices/entriesSlice';
import { createAISlice, AISlice } from './slices/aiSlice';
import { createThemeSlice, ThemeSlice } from './slices/themeSlice';

export type FitnessStore = FitnessState & 
  ProfileSlice & 
  GoalsSlice & 
  EntriesSlice & 
  AISlice & 
  ThemeSlice & {
    initialize: () => void;
  };

export const useFitnessStore = create<FitnessStore>()(
  persist(
    (set, get, api) => ({
      ...createProfileSlice(set as any, get as any, api as any),
      ...createGoalsSlice(set as any, get as any, api as any),
      ...createEntriesSlice(set as any, get as any, api as any),
      ...createAISlice(set as any, get as any, api as any),
      ...createThemeSlice(set as any, get as any, api as any),

      initialize: () => {
        const state = get();
        if (state.goals.length === 0 && state.weightHistory.length === 0) {
          set({ ...INITIAL_DEMO_STATE });
        }
      },
    }),
    {
      name: 'fitness-tracker-storage-v2',
      storage: createJSONStorage(() => localStorage),
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
