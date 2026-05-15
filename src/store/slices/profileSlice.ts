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
  updateProfile: (updates) => set((state) => {
    const currentProfile = state.profile || {
      id: crypto.randomUUID(),
      name: '',
      age: 25,
      gender: 'MALE',
      height: 175,
      activityLevel: 'MEDIUM' as any,
      baselines: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as UserProfile;

    return {
      profile: { 
        ...currentProfile, 
        ...updates,
        updatedAt: new Date().toISOString()
      }
    };
  }),
  updateBaseline: (metric) => set((state) => {
    if (!state.profile) return state;
    
    const baselines = state.profile.baselines || [];
    const existing = baselines.findIndex(b => b.id === metric.id);
    const newBaselines = [...baselines];
    
    if (existing >= 0) {
      newBaselines[existing] = metric;
    } else {
      newBaselines.push(metric);
    }
    
    return {
      profile: { 
        ...state.profile, 
        baselines: newBaselines,
        updatedAt: new Date().toISOString()
      }
    };
  }),
});
