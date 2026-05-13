import { StateCreator } from 'zustand';
import { Goal } from '../../types';

export interface GoalsSlice {
  goals: Goal[];
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
}

export const createGoalsSlice: StateCreator<
  any, // Typing can be complex with slices, using any for now to ensure compatibility
  [],
  [],
  GoalsSlice
> = (set) => ({
  goals: [],
  addGoal: (goal) => set((state: any) => {
    if (state.isDemoMode) {
      return {
        goals: [goal],
        workouts: [],
        weightHistory: [],
        analyses: [],
        isDemoMode: false
      };
    }
    return { goals: [...state.goals, goal] };
  }),
  updateGoal: (id, updates) => set((state: any) => ({
    goals: state.goals.map((g: Goal) => g.id === id ? { ...g, ...updates } : g)
  })),
  removeGoal: (id) => set((state: any) => ({
    goals: state.goals.filter((g: Goal) => g.id !== id)
  })),
});
