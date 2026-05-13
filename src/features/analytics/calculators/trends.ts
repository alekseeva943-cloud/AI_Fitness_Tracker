import { WeightEntry, Goal } from "../../../types";
import { WeightTrend } from "../types";
import { differenceInDays, subDays, isAfter } from "date-fns";
import { VALIDATION_LIMITS } from "../../../lib/validation";

export const calculateWeightTrend = (history: WeightEntry[], goal: Goal | null): WeightTrend | null => {
  // Sanity filter: keep only realistic values
  const sanitized = history.filter(e => 
    e.value >= VALIDATION_LIMITS.weight.value.min && 
    e.value <= VALIDATION_LIMITS.weight.value.max
  );

  if (sanitized.length === 0) return null;

  const sorted = [...sanitized].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const current = sorted[0].value;
  const starting = sorted[sorted.length - 1].value;

  const now = new Date();
  const last7Days = sorted.filter(e => isAfter(new Date(e.date), subDays(now, 7)));
  const prev7Days = sorted.filter(e => 
    isAfter(new Date(e.date), subDays(now, 14)) && 
    !isAfter(new Date(e.date), subDays(now, 7))
  );

  const avg7 = last7Days.length > 0 
    ? last7Days.reduce((sum, e) => sum + e.value, 0) / last7Days.length 
    : current;
  
  const avgPrev7 = prev7Days.length > 0 
    ? prev7Days.reduce((sum, e) => sum + e.value, 0) / prev7Days.length 
    : current;

  const weeklyChange = avg7 - avgPrev7;
  
  // Plateau detection: if change is less than 0.1kg in either direction over a week
  const isPlateau = Math.abs(weeklyChange) < 0.1 && history.length > 5;

  // Velocity: weighted average change per day
  // We'll give more weight to recent changes but filter out outliers
  const daysDiff = differenceInDays(new Date(sorted[0].date), new Date(sorted[sorted.length - 1].date)) || 1;
  
  // Basic overall velocity
  const overallVelocity = (current - starting) / daysDiff;
  
  // Short term velocity (last 3 entries or last 14 days)
  const shortTermEntries = sorted.slice(0, 5);
  let shortTermVelocity = overallVelocity;
  if (shortTermEntries.length >= 2) {
    const stDays = differenceInDays(new Date(shortTermEntries[0].date), new Date(shortTermEntries[shortTermEntries.length - 1].date)) || 1;
    shortTermVelocity = (shortTermEntries[0].value - shortTermEntries[shortTermEntries.length - 1].value) / stDays;
  }

  // Smooth velocity: 70% long-term, 30% short-term
  // This helps react to progress while staying stable
  let velocity = (overallVelocity * 0.7) + (shortTermVelocity * 0.3);

  // Sanity limit: max 0.3 kg/day (approx 2 kg/week)
  const MAX_VELOCITY = 0.3; 
  if (Math.abs(velocity) > MAX_VELOCITY) {
    velocity = velocity > 0 ? MAX_VELOCITY : -MAX_VELOCITY;
  }

  // Forecast for 30 days
  const forecastedWeight = current + (velocity * 30);

  return {
    currentWeight: current,
    startingWeight: starting,
    averageWeightLast7Days: avg7,
    averageWeightPrev7Days: avgPrev7,
    weeklyChange,
    totalChange: current - starting,
    isPlateau,
    velocity,
    forecastedWeight
  };
};
