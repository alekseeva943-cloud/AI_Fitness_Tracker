import { StateCreator } from 'zustand';

export type ThemeType = 'light' | 'dark';

export interface ThemeSlice {
  theme: ThemeType;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

export const createThemeSlice: StateCreator<
  any,
  [],
  [],
  ThemeSlice
> = (set) => ({
  theme: 'dark',
  toggleTheme: () => set((state: any) => ({ 
    theme: state.theme === 'dark' ? 'light' : 'dark' 
  })),
  setTheme: (theme) => set({ theme }),
});
