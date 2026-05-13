/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum GoalType {
  WEIGHT_LOSS = 'WEIGHT_LOSS',
  MUSCLE_GAIN = 'MUSCLE_GAIN',
  MAINTENANCE = 'MAINTENANCE',
  STRENGTH = 'STRENGTH',
}

export enum ActivityLevel {
  SEDENTARY = 'SEDENTARY',
  LIGHT = 'LIGHT',
  MODERATE = 'MODERATE',
  ACTIVE = 'ACTIVE',
  VERY_ACTIVE = 'VERY_ACTIVE',
}

export interface Goal {
  id: string;
  title: string;
  type: GoalType;
  targetValue: number;
  currentValue: number;
  startValue: number;
  unit: string;
  startDate: string;
  deadline: string;
  createdAt: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface WorkoutEntry {
  id: string;
  date: string;
  type: string; // e.g., 'Running', 'Strength', 'Yoga'
  duration: number; // in minutes
  caloriesBurned?: number;
  notes?: string;
  weight?: number; // optional weight check at workout time
}

export interface WeightEntry {
  id: string;
  date: string;
  value: number;
  unit: string;
}

export interface AIRecommendation {
  id: string;
  type: 'EXERCISE' | 'DIET' | 'REST' | 'MOTIVATION';
  text: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface AIAnalysis {
  id: string;
  date: string;
  summary: string;
  trend: 'IMPROVING' | 'STAGNATING' | 'DECLINING';
  forecastDate?: string;
  forecastValue?: number;
  recommendations: AIRecommendation[];
}

export interface UserProfile {
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  height: number;
  startingWeight: number;
  activityLevel: ActivityLevel;
}

export interface FitnessState {
  profile: UserProfile | null;
  goals: Goal[];
  workouts: WorkoutEntry[];
  weightHistory: WeightEntry[];
  analyses: AIAnalysis[];
  isDemoMode?: boolean;
}
