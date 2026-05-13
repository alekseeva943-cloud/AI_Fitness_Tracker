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
  metricId: string; // The ID from METRICS registry
  targetValue: number;
  currentValue: number;
  startValue: number;
  unit: string;
  startDate: string;
  deadline: string;
  createdAt: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  motivation?: string;
}

export interface WorkoutEntry {
  id: string;
  date: string;
  type: string; // e.g., 'Running', 'Strength', 'Yoga'
  category?: 'STRENGTH' | 'CARDIO' | 'ENDURANCE' | 'FLEXIBILITY' | 'OTHER';
  duration: number; // in minutes
  caloriesBurned?: number;
  notes?: string;
  weight?: number; // optional weight check at workout time
  
  // Strength metrics
  sets?: number;
  reps?: number;
  workingWeight?: number;
  volume?: number;
  
  // Cardio & Endurance metrics
  distance?: number; // km
  pace?: string; // min/km
  heartRate?: number;
  speed?: number; // km/h
  incline?: number;
  cadence?: number;
}

export interface WeightEntry {
  id: string;
  date: string;
  value: number;
  unit: string;
  notes?: string;
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
  baselines?: Record<string, number>; // Baseline metrics for comparison
}

export interface FitnessState {
  profile: UserProfile | null;
  goals: Goal[];
  workouts: WorkoutEntry[];
  weightHistory: WeightEntry[];
  analyses: AIAnalysis[];
  isDemoMode?: boolean;
}
