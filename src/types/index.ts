/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum GoalType {
  WEIGHT_LOSS = 'WEIGHT_LOSS',
  MUSCLE_GAIN = 'MUSCLE_GAIN',
  MAINTENANCE = 'MAINTENANCE',
  STRENGTH = 'STRENGTH',
  ENDURANCE = 'ENDURANCE',
  FLEXIBILITY = 'FLEXIBILITY',
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
  workoutTypeFilter?: string; // Optional filter to link specific workout types to this goal
  metricId: string; // The ID from METRICS registry
  targetValue: number;
  currentValue: number;
  startValue: number;
  unit: string;
  startDate: string;
  deadline: string;
  createdAt: string;
  status: 'ACTIVE' | 'SECONDARY' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  motivation?: string;
  baselineMeasurements?: Record<string, number>; // e.g., { biceps: 38, waist: 85 }
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  totalWeight: number;
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
  exercises?: Exercise[];
  sets?: number;
  reps?: number;
  workingWeight?: number;
  totalWeight?: number; // Sum of all exercises totalWeight
  
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

export interface MetricBaseline {
  id: string; // matches METRICS registry or custom ID
  name: string;
  value: number;
  unit: string;
  date: string;
  isCustom?: boolean;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  height: number;
  startingWeight: number;
  activityLevel: ActivityLevel;
  baselines: MetricBaseline[]; // Centralized baseline metrics
}

export interface FitnessState {
  profile: UserProfile | null;
  goals: Goal[];
  activeGoalId: string | null;
  workouts: WorkoutEntry[];
  weightHistory: WeightEntry[];
  analyses: AIAnalysis[];
  isDemoMode?: boolean;
}
