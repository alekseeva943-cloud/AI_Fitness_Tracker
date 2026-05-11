import { StateCreator } from 'zustand';
import { WorkoutEntry, WeightEntry } from '../../types';

export interface EntriesSlice {
  workouts: WorkoutEntry[];
  weightHistory: WeightEntry[];
  addWorkout: (workout: WorkoutEntry) => void;
  addWeightEntry: (entry: WeightEntry) => void;
}

export const createEntriesSlice: StateCreator<
  any,
  [],
  [],
  EntriesSlice
> = (set) => ({
  workouts: [],
  weightHistory: [],
  addWorkout: (workout) => set((state: any) => ({
    workouts: [workout, ...state.workouts]
  })),
  addWeightEntry: (entry) => set((state: any) => ({
    weightHistory: [entry, ...state.weightHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  })),
});
