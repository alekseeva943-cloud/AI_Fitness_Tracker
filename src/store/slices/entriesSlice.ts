import { StateCreator } from 'zustand';
import { WorkoutEntry, WeightEntry } from '../../types';

export interface EntriesSlice {
  workouts: WorkoutEntry[];
  weightHistory: WeightEntry[];
  addWorkout: (workout: WorkoutEntry) => void;
  addWeightEntry: (entry: WeightEntry) => void;
  updateWorkout: (id: string, workout: any) => void;
  updateWeightEntry: (id: string, entry: any) => void;
  removeWorkout: (id: string) => void;
  removeWeightEntry: (id: string) => void;
}

export const createEntriesSlice: StateCreator<
  any,
  [],
  [],
  EntriesSlice
> = (set) => ({
  workouts: [],
  weightHistory: [],
  addWorkout: (workout) => set((state: any) => {
    if (state.isDemoMode) {
      // Transition out of demo mode but keep context if possible, 
      // or at least don't wipe goals/profile
      return { 
        workouts: [workout, ...state.workouts], 
        isDemoMode: false 
      };
    }
    return { workouts: [workout, ...state.workouts] };
  }),
  addWeightEntry: (entry) => set((state: any) => {
    if (state.isDemoMode) {
      return { 
        weightHistory: [entry, ...state.weightHistory], 
        isDemoMode: false 
      };
    }
    return {
      weightHistory: [entry, ...state.weightHistory].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    };
  }),
  updateWorkout: (id, workout) => set((state: any) => ({
    workouts: state.workouts.map((w: any) => w.id === id ? { ...w, ...workout } : w)
  })),
  updateWeightEntry: (id, entry) => set((state: any) => ({
    weightHistory: state.weightHistory.map((w: any) => w.id === id ? { ...w, ...entry } : w)
  })),
  removeWorkout: (id) => set((state: any) => ({
    workouts: state.workouts.filter((w: any) => w.id !== id)
  })),
  removeWeightEntry: (id) => set((state: any) => ({
    weightHistory: state.weightHistory.filter((w: any) => w.id !== id)
  })),
});
