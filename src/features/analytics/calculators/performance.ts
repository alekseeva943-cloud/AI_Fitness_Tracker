import { WorkoutEntry } from "../../../types";
import { WorkoutStats } from "../types";
import { differenceInWeeks, differenceInDays } from "date-fns";

export const calculateWorkoutStats = (workouts: WorkoutEntry[]): WorkoutStats => {
  if (workouts.length === 0) {
    return {
      totalWorkouts: 0,
      avgWorkoutsPerWeek: 0,
      avgDuration: 0,
      totalDuration: 0,
      consistencyScore: 0,
      lastWorkoutDate: null
    };
  }

  const sorted = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalWorkouts = workouts.length;
  const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
  
  const spanDays = differenceInDays(new Date(), new Date(sorted[sorted.length - 1].date)) || 1;
  const spanWeeks = spanDays / 7 || 1;

  const avgWorkoutsPerWeek = totalWorkouts / spanWeeks;

  // Consistency score: (workouts per week / target frequency (3)) * 100, capped at 100
  const targetFrequency = 4;
  const consistencyScore = Math.min(100, Math.round((avgWorkoutsPerWeek / targetFrequency) * 100));

  return {
    totalWorkouts,
    avgWorkoutsPerWeek: Number(avgWorkoutsPerWeek.toFixed(1)),
    avgDuration: Math.round(totalDuration / totalWorkouts),
    totalDuration,
    consistencyScore,
    lastWorkoutDate: sorted[0].date
  };
};
