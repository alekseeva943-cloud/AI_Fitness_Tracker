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
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export type BodyType = 'ECTOMORPH' | 'MESOMORPH' | 'ENDOMORPH';
export type FitnessLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

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
  status: 'ACTIVE' | 'SECONDARY' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED';
  motivation?: string;
  baselineMeasurements?: Record<string, number>; // e.g., { biceps: 38, waist: 85 }
  completedAt?: string;
  archivedAt?: string;
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
  metrics?: Record<string, number>; // Additional metrics like bodyFat, muscleMass
}

export type PlanEventSource = 'USER' | 'AI';
export type PlanEventType = 'WORKOUT' | 'NUTRITION' | 'RECOVERY' | 'REMINDER';

export interface PlanEvent {
  id: string;
  title: string;
  type: PlanEventType;
  source: PlanEventSource;
  date: string; // ISO string
  duration?: number; // minutes
  description?: string;
  isCompleted: boolean;
  metadata?: {
    intensity?: 'LOW' | 'MEDIUM' | 'HIGH';
    targetMuscle?: string;
    nutritionGoals?: { protein: number; carbs: number; fats: number };
    wasRescheduled?: boolean;
    originalDate?: string;
    category?: string;
  };
  createdAt: string;
}

export interface BehavioralPattern {
  id: string;
  type: 'PREFERENCE' | 'STRUGGLE' | 'STRENGTH' | 'TREND';
  title: string;
  description: string;
  icon?: string;
  observationDate: string;
  evidenceCount: number;
  lastOccurrence: string;
}

export interface AIMemory {
  patterns: BehavioralPattern[];
  lastInterventionDate?: string;
  coachingStyle: 'DEMANDING' | 'SUPPORTIVE' | 'ANALYTICAL';
  userNotes: string[];
}

export interface AIRecommendation {
  id: string;
  type: 'EXERCISE' | 'DIET' | 'REST' | 'MOTIVATION' | 'TRAINING' | 'NUTRITION' | 'RECOVERY' | 'CONSISTENCY';
  text: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  action?: {
    label: string;
    id: string;
  };
}

export interface AIAnalysis {
  id: string;
  date: string;
  goalId?: string; // Optional: link to a specific goal
  summary: string;
  verdict?: string;
  trend: 'IMPROVING' | 'STAGNATING' | 'DECLINING' | 'STABLE';
  explanation?: string;
  mainRisk?: string;
  forecast?: string;
  recommendations: (AIRecommendation & { reason?: string })[];
  nextSteps?: string[];
  tacticalPlan?: { title: string; description: string; isCompleted: boolean }[];
  suggestedEvents?: Partial<PlanEvent>[];
  followupQuestions?: string[];
  insights?: string[];
  motivation?: string;
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
  id: string;
  name: string;
  displayName: string;
  avatarUrl?: string;
  age: number | null;
  gender: Gender | null;
  height: number | null;
  weight?: number | null;
  bodyType?: BodyType | null;
  activityLevel: ActivityLevel | null;
  fitnessLevel?: FitnessLevel | null;
  
  // Health & Context
  injuries?: string[];
  chronicConditions?: string[];
  limitations?: string[];
  
  // Daily & Lifestyle
  sleepAverage?: number | null; // hours
  stressLevel?: number | null; // 1-10
  
  // Subjective / Textual data
  nutritionNotes?: string;
  recoveryNotes?: string;
  lifestyleNotes?: string;
  motivation?: string;
  customNotes?: string;
  
  baselines: MetricBaseline[]; // Matches existing baseline structure
  createdAt: string;
  updatedAt: string;
}

export interface FitnessState {
  profile: UserProfile | null;
  goals: Goal[];
  activeGoalId: string | null;
  workouts: WorkoutEntry[];
  weightHistory: WeightEntry[];
  planEvents: PlanEvent[];
  analyses: AIAnalysis[];
  aiMemory: AIMemory;
  isDemoMode?: boolean;
}
