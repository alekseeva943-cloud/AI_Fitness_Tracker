import { StateCreator } from 'zustand';
import { FitnessState, UserProfile } from '../../types';

export interface ProfileSlice {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
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
});
