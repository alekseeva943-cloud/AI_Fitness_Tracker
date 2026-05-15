/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WeightTrend {
  currentWeight: number;
  startingWeight: number;
  averageWeightLast7Days: number;
  averageWeightPrev7Days: number;
  weeklyChange: number; // Delta
  totalChange: number;
  isPlateau: boolean;
  velocity: number; // blended change per day
  overallVelocity: number; // long-term average change per day
  forecastedWeight: number; // Predicted weight in 30 days
}

export interface WorkoutStats {
  totalWorkouts: number;
  avgWorkoutsPerWeek: number;
  avgDuration: number;
  totalDuration: number;
  consistencyScore: number; // 0-100
  lastWorkoutDate: string | null;
  totalVolume?: number;
  totalDistance?: number;
  avgHeartRate?: number;
}

export interface GoalProgress {
  completionPercentage: number;
  remainingValue: number;
  estimatedCompletionDate: string | null;
  isImproving: boolean;
  status: 'AHEAD_OF_SCHEDULE' | 'ON_TRACK' | 'BEHIND_SCHEDULE' | 'STAGNANT' | 'WRONG_DIRECTION';
  isAchieved: boolean;
}

export interface AnalyticsSummary {
  weight: WeightTrend;
  workouts: WorkoutStats;
  goal: GoalProgress;
}
