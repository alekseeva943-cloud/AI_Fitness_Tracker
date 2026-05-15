import { UserProfile } from "../types";

export const createDefaultProfile = (): UserProfile => ({
  id: crypto.randomUUID(),
  name: 'Новый пользователь',
  age: null,
  gender: null,
  height: null,
  weight: null,
  bodyType: null,
  fitnessLevel: null,
  activityLevel: null,

  injuries: [],
  chronicConditions: [],
  limitations: [],

  sleepAverage: null,
  stressLevel: null,

  nutritionNotes: '',
  recoveryNotes: '',
  lifestyleNotes: '',
  motivation: '',
  customNotes: '',

  baselines: [],

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
