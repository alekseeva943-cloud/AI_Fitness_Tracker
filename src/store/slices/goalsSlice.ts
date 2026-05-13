import { StateCreator } from 'zustand';
import { Goal } from '../../types';

export interface GoalsSlice {
  goals: Goal[];
  activeGoalId: string | null;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  setActiveGoal: (id: string | null) => void;
}

export const createGoalsSlice: StateCreator<
  any, // Typing can be complex with slices, using any for now to ensure compatibility
  [],
  [],
  GoalsSlice
> = (set) => ({
  goals: [],
  activeGoalId: null,
  addGoal: (goal) => set((state: any) => {
    // If this is the first goal, make it active
    const isActive = state.goals.length === 0;
    const newGoal = { ...goal, status: isActive ? 'ACTIVE' : 'SECONDARY' };
    
    if (state.isDemoMode) {
      return {
        goals: [newGoal],
        activeGoalId: newGoal.id,
        workouts: [],
        weightHistory: [],
        analyses: [],
        isDemoMode: false
      };
    }
    return { 
      goals: [...state.goals, newGoal],
      activeGoalId: isActive ? newGoal.id : state.activeGoalId
    };
  }),
  updateGoal: (id, updates) => set((state: any) => {
    // If a goal is being marked as 'ACTIVE', update all others to 'SECONDARY'
    // and update activeGoalId
    let extraUpdates = {};
    if (updates.status === 'ACTIVE') {
      extraUpdates = {
        activeGoalId: id,
        goals: state.goals.map((g: Goal) => 
          g.id === id 
            ? { ...g, ...updates } 
            : (g.status === 'ACTIVE' ? { ...g, status: 'SECONDARY' } : g)
        )
      };
    } else {
      extraUpdates = {
        goals: state.goals.map((g: Goal) => g.id === id ? { ...g, ...updates } : g)
      };
    }
    return extraUpdates;
  }),
  removeGoal: (id) => set((state: any) => {
    const isRemovingActive = state.activeGoalId === id;
    const remainingGoals = state.goals.filter((g: Goal) => g.id !== id);
    
    // If removing the active goal, try to set another one as active
    let nextActiveId = state.activeGoalId;
    let nextGoals = remainingGoals;
    
    if (isRemovingActive) {
      const firstActive = remainingGoals.find((g: Goal) => g.status === 'ACTIVE' || g.status === 'SECONDARY');
      nextActiveId = firstActive ? firstActive.id : null;
      if (firstActive) {
        nextGoals = remainingGoals.map((g: Goal) => g.id === nextActiveId ? { ...g, status: 'ACTIVE' } : g);
      }
    }
    
    return { 
      goals: nextGoals,
      activeGoalId: nextActiveId
    };
  }),
  setActiveGoal: (id) => set((state: any) => {
    // Logic to set a goal as ACTIVE and others as SECONDARY/Stay as they are
    return {
      activeGoalId: id,
      goals: state.goals.map((g: Goal) => {
        if (g.id === id) return { ...g, status: 'ACTIVE' };
        if (g.status === 'ACTIVE') return { ...g, status: 'SECONDARY' };
        return g;
      })
    };
  }),
});
