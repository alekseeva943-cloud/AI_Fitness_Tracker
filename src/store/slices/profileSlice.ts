import { StateCreator } from 'zustand';
import { FitnessState, UserProfile } from '../../types';

export interface ProfileSlice {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
}

export const createProfileSlice: StateCreator<
  FitnessState & ProfileSlice,
  [],
  [],
  ProfileSlice
> = (set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
});
