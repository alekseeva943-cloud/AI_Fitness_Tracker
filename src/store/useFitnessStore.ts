import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FitnessState, Goal, WorkoutEntry, WeightEntry, AIAnalysis, UserProfile } from '../types';

export type ThemeType = 'light' | 'dark';

interface FitnessStore extends FitnessState {
  theme: ThemeType;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
  
  // Actions
  setProfile: (profile: UserProfile) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  addWorkout: (workout: WorkoutEntry) => void;
  addWeightEntry: (entry: WeightEntry) => void;
  addAIAnalysis: (analysis: AIAnalysis) => void;
}

export const useFitnessStore = create<FitnessStore>()(
  persist(
    (set) => ({
      profile: null,
      goals: [],
      workouts: [],
      weightHistory: [],
      analyses: [],
      theme: 'dark',

      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'dark' ? 'light' : 'dark' 
      })),
      
      setTheme: (theme) => set({ theme }),

      setProfile: (profile) => set({ profile }),
      
      addGoal: (goal) => set((state) => ({ 
        goals: [...state.goals, goal] 
      })),

      updateGoal: (id, updates) => set((state) => ({
        goals: state.goals.map((g) => g.id === id ? { ...g, ...updates } : g)
      })),

      removeGoal: (id) => set((state) => ({
        goals: state.goals.filter((g) => g.id !== id)
      })),

      addWorkout: (workout) => set((state) => ({
        workouts: [workout, ...state.workouts]
      })),

      addWeightEntry: (entry) => set((state) => ({
        weightHistory: [entry, ...state.weightHistory].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      })),

      addAIAnalysis: (analysis) => set((state) => ({
        analyses: [analysis, ...state.analyses].slice(0, 50) 
      })),
    }),
    {
      name: 'fitness-tracker-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
