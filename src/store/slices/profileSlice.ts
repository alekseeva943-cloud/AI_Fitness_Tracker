import { StateCreator } from 'zustand';
import { FitnessState, UserProfile, MetricBaseline } from '../../types';

export interface ProfileSlice {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateBaseline: (metric: MetricBaseline) => void;
}

export const createProfileSlice: StateCreator<
  FitnessState & ProfileSlice,
  [],
  [],
  ProfileSlice
> = (set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  updateProfile: (updates) => set((state) => ({
    profile: state.profile ? { ...state.profile, ...updates } : (updates as UserProfile)
  })),
  updateBaseline: (metric) => set((state) => {
    if (!state.profile) return state;
    
    const existing = state.profile.baselines.findIndex(b => b.id === metric.id);
    const newBaselines = [...state.profile.baselines];
    
    if (existing >= 0) {
      newBaselines[existing] = metric;
    } else {
      newBaselines.push(metric);
    }
    
    return {
      profile: { ...state.profile, baselines: newBaselines }
    };
  }),
});
