import { WeightEntry, Goal } from "../../../types";
import { WeightTrend } from "../types";
import { differenceInDays, subDays, isAfter } from "date-fns";
import { VALIDATION_LIMITS } from "../../../lib/validation";
import { ANALYTICS_CONSTANTS } from "../../../constants/analytics";
import { DataNormalizer } from "../../../lib/data-normalizer";

export const calculateWeightTrend = (history: WeightEntry[], goal: Goal | null): WeightTrend | null => {
  // 1. Initial Sanitization (Static Limits + Date Validation)
  const initialSanitized = history.filter(e => 
    DataNormalizer.isValidDate(e.date) &&
    e.value >= VALIDATION_LIMITS.weight.value.min && 
    e.value <= VALIDATION_LIMITS.weight.value.max
  );

  if (initialSanitized.length === 0) return null;

  // 2. Sort chronology
  const chronological = [...initialSanitized].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // 3. Dynamic Anomaly Detection (Outlier Rejection)
  // We reject entries that represent an impossible jump (>15% of body weight in a short period)
  const sanitized: WeightEntry[] = [];
  chronological.forEach((entry, i) => {
    if (i === 0) {
      sanitized.push(entry);
      return;
    }
    const prev = sanitized[sanitized.length - 1];
    const diff = Math.abs(entry.value - prev.value);
    const percentChange = DataNormalizer.safeDivide(diff, prev.value);
    const daysSince = Math.max(1, differenceInDays(new Date(entry.date), new Date(prev.date)));
    
    // If weight jumped more than 5% in 1 day, it's likely an error, unless verified over multiple days
    const isAnomaly = percentChange > ANALYTICS_CONSTANTS.WEIGHT.OUTLIER_THRESHOLD && daysSince < 3;
    
    if (!isAnomaly) {
      sanitized.push(entry);
    }
  });

  if (sanitized.length === 0) return null;

  const sorted = [...sanitized].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const analyticsCurrent = sorted[0].value;
  const starting = sorted[sorted.length - 1].value;

  // Real current weight from non-outlier filtered data (but still statistically valid)
  const actualCurrentWeight = chronological[chronological.length - 1].value;

  // 4. Moving Average (Smoothing)
  const now = new Date();
  const last7Days = sorted.filter(e => isAfter(new Date(e.date), subDays(now, 7)));
  const prev7Days = sorted.filter(e => 
    isAfter(new Date(e.date), subDays(now, 14)) && 
    !isAfter(new Date(e.date), subDays(now, 7))
  );

  const avg7 = last7Days.length > 0 
    ? DataNormalizer.safeAverage(last7Days.map(e => e.value)) 
    : analyticsCurrent;
  
  const avgPrev7 = prev7Days.length > 0 
    ? DataNormalizer.safeAverage(prev7Days.map(e => e.value)) 
    : (last7Days.length > 0 ? (sorted.find(e => !isAfter(new Date(e.date), subDays(now, 7)))?.value ?? starting) : analyticsCurrent);

  const weeklyChange = avg7 - avgPrev7;
  
  // Plateau detection
  const isPlateau = Math.abs(weeklyChange) < ANALYTICS_CONSTANTS.WEIGHT.PLATEAU_THRESHOLD && sanitized.length > 5;

  // 5. Robust Velocity Calculation
  const daysDiff = Math.max(1, differenceInDays(new Date(sorted[0].date), new Date(sorted[sorted.length - 1].date)));
  const overallVelocity = (analyticsCurrent - starting) / daysDiff;
  
  // Recent trend (last 14 days or last 5 entries)
  const recentThreshold = subDays(new Date(sorted[0].date), 14);
  const recentEntries = sorted.filter(e => isAfter(new Date(e.date), recentThreshold)).slice(0, 5);
  
  let shortTermVelocity = overallVelocity;
  if (recentEntries.length >= 2) {
    const stDays = Math.max(1, differenceInDays(new Date(recentEntries[0].date), new Date(recentEntries[recentEntries.length - 1].date)));
    shortTermVelocity = (recentEntries[0].value - recentEntries[recentEntries.length - 1].value) / stDays;
  }

  // Blended Velocity
  let velocity = (overallVelocity * ANALYTICS_CONSTANTS.WEIGHT.TOTAL_WEIGHT) + 
                 (shortTermVelocity * ANALYTICS_CONSTANTS.WEIGHT.RECENT_WEIGHT);

  // Sanity velocity limits
  const maxV = ANALYTICS_CONSTANTS.WEIGHT.MAX_VELOCITY;
  if (Math.abs(velocity) > maxV) {
    velocity = velocity > 0 ? maxV : -maxV;
  }

  // Forecast uses the actual current weight for projection
  const forecastedWeight = actualCurrentWeight + (velocity * 30);

  return {
    currentWeight: actualCurrentWeight,
    startingWeight: starting,
    averageWeightLast7Days: avg7,
    averageWeightPrev7Days: avgPrev7,
    weeklyChange,
    totalChange: actualCurrentWeight - starting,
    isPlateau,
    velocity,
    overallVelocity,
    forecastedWeight
  };
};
