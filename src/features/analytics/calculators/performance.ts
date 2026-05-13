import { WorkoutEntry } from "../../../types";
import { WorkoutStats } from "../types";
import { differenceInWeeks, differenceInDays } from "date-fns";
import { VALIDATION_LIMITS } from "../../../lib/validation";
import { ANALYTICS_CONSTANTS } from "../../../constants/analytics";

export const calculateWorkoutStats = (workouts: WorkoutEntry[]): WorkoutStats => {
  // Sanity filter
  const sanitized = workouts.filter(w => 
    w.duration >= VALIDATION_LIMITS.workout.duration.min && 
    w.duration <= VALIDATION_LIMITS.workout.duration.max &&
    (!w.caloriesBurned || (w.caloriesBurned >= VALIDATION_LIMITS.workout.calories.min && w.caloriesBurned <= VALIDATION_LIMITS.workout.calories.max))
  );

  if (sanitized.length === 0) {
    return {
      totalWorkouts: 0,
      avgWorkoutsPerWeek: 0,
      avgDuration: 0,
      totalDuration: 0,
      consistencyScore: 0,
      lastWorkoutDate: null
    };
  }

  const sorted = [...sanitized].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalWorkouts = sanitized.length;
  const totalDuration = sanitized.reduce((sum, w) => sum + w.duration, 0);
  const totalWeightLifted = sanitized.reduce((sum, w) => sum + (w.totalWeight || 0), 0);
  const totalDistance = sanitized.reduce((sum, w) => sum + (w.distance || 0), 0);
  
  const hrWeights = sanitized.filter(w => !!w.heartRate);
  const avgHeartRate = hrWeights.length > 0 
    ? Math.round(hrWeights.reduce((sum, w) => sum + (w.heartRate || 0), 0) / hrWeights.length)
    : undefined;

  const spanDays = differenceInDays(new Date(), new Date(sorted[sorted.length - 1].date)) || 1;
  const spanWeeks = Math.max(1, spanDays / 7);

  const avgWorkoutsPerWeek = totalWorkouts / spanWeeks;

  // Consistency score: (workouts per week / target frequency) * 100, capped at 100
  const targetFrequency = ANALYTICS_CONSTANTS.WORKOUT.TARGET_WEEKLY_FREQUENCY;
  const consistencyScore = Math.min(100, Math.round((avgWorkoutsPerWeek / targetFrequency) * 100));

  return {
    totalWorkouts,
    avgWorkoutsPerWeek: Number(avgWorkoutsPerWeek.toFixed(1)),
    avgDuration: Math.round(totalDuration / totalWorkouts),
    totalDuration,
    consistencyScore,
    lastWorkoutDate: sorted[0].date,
    totalVolume: totalWeightLifted,
    totalDistance,
    avgHeartRate
  };
};
