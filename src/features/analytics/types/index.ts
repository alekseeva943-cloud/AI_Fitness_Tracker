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
  velocity: number; // change per day
}

export interface WorkoutStats {
  totalWorkouts: number;
  avgWorkoutsPerWeek: number;
  avgDuration: number;
  totalDuration: number;
  consistencyScore: number; // 0-100
  lastWorkoutDate: string | null;
}

export interface GoalProgress {
  completionPercentage: number;
  remainingValue: number;
  estimatedCompletionDate: string | null;
  status: 'AHEAD_OF_SCHEDULE' | 'ON_TRACK' | 'BEHIND_SCHEDULE' | 'STAGNANT';
}

export interface AnalyticsSummary {
  weight: WeightTrend;
  workouts: WorkoutStats;
  goal: GoalProgress;
}
