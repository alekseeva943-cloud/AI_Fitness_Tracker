import { WorkoutEntry, WeightEntry, Goal } from '../types';
import { METRICS } from '../constants/metrics';
import { formatDate } from './utils';

export interface ChartDataPoint {
  dateKey: string;
  displayDate: string;
  current: number | null;
  forecast: number | null;
  goal: number | undefined;
  ideal: number | null;
  unit: string;
  workout: boolean;
  isReal: boolean; // True if this point has actual data, not interpolated
  workoutsAtDate: WorkoutEntry[];
  measurementEntries: WeightEntry[];
  isForecast: boolean;
}

const isValidDate = (d: any) => {
  if (!d) return false;
  const date = new Date(d);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Extracts a specific metric value from a workout
 */
export const getMetricValueFromWorkout = (workout: WorkoutEntry, metricId: string): number => {
  if (metricId === 'caloriesBurned') return workout.caloriesBurned || 0;
  if (metricId === 'duration') return workout.duration || 0;
  if (metricId === 'distance') return workout.distance || 0;
  if (metricId === 'speed') return workout.speed || 0;
  if (metricId === 'heartRate') return workout.heartRate || 0;

  // Exercise specific weight (e.g., bench press weight)
  if (workout.category === 'STRENGTH' && workout.exercises) {
    const metricLabel = METRICS[metricId]?.label?.toLowerCase() || '';
    const ex = workout.exercises.find((e: any) => e.name?.toLowerCase().includes(metricLabel));
    if (ex && ex.weight) return ex.weight;
  }

  // Fallback to generically named properties
  const val = (workout as any)[metricId];
  return typeof val === 'number' ? val : 0;
};

/**
 * Builds a unified timeline for charting from multiple data sources
 */
export const buildChartTimeline = (
  measurements: WeightEntry[],
  workouts: WorkoutEntry[],
  goal?: Goal | null,
  metricId: string = 'weight',
  forecastedDate?: string | null
): ChartDataPoint[] => {
  const unit = METRICS[metricId]?.unit || goal?.unit || '';

  // 1. Collect all raw measurement points for this metric
  const dailyMeasurements = new Map<string, { avg: number, entries: WeightEntry[] }>();
  
  if (metricId === 'weight') {
    measurements.forEach(m => {
      if (!isValidDate(m.date)) return;
      const dayKey = new Date(m.date).toISOString().split('T')[0];
      const existing = dailyMeasurements.get(dayKey) || { avg: 0, entries: [] };
      existing.entries.push(m);
      dailyMeasurements.set(dayKey, existing);
    });
  }

  // 2. Identify relevant workouts for this metric
  const dailyWorkouts = new Map<string, WorkoutEntry[]>();
  const workoutPoints = new Map<string, number[]>();

  workouts.forEach(w => {
    if (!isValidDate(w.date)) return;
    const dayKey = new Date(w.date).toISOString().split('T')[0];
    
    // Track all workouts for markers
    const list = dailyWorkouts.get(dayKey) || [];
    list.push(w);
    dailyWorkouts.set(dayKey, list);

    // If it's a workout-based metric (not weight)
    if (metricId !== 'weight') {
      const val = getMetricValueFromWorkout(w, metricId);
      if (val > 0) {
        const vals = workoutPoints.get(dayKey) || [];
        vals.push(val);
        workoutPoints.set(dayKey, vals);
      }
    }
  });

  // Calculate averages for measurements
  dailyMeasurements.forEach((val) => {
    val.avg = val.entries.reduce((s, v) => s + v.value, 0) / val.entries.length;
  });

  // 3. Build a combined set of dates
  const allDates = new Set<string>();
  dailyMeasurements.forEach((_, k) => allDates.add(k));
  workoutPoints.forEach((_, k) => allDates.add(k));
  if (goal && isValidDate(goal.startDate)) {
    allDates.add(new Date(goal.startDate).toISOString().split('T')[0]);
  }

  // 4. Create sorted base timeline
  let timeline: ChartDataPoint[] = Array.from(allDates)
    .sort()
    .map(dateKey => {
      const measurement = dailyMeasurements.get(dateKey);
      const wPoints = workoutPoints.get(dateKey);
      
      let currentVal: number | null = null;
      if (metricId === 'weight' && measurement) {
        currentVal = measurement.avg;
      } else if (wPoints) {
        currentVal = wPoints.reduce((s, v) => s + v, 0) / wPoints.length;
      }

      return {
        dateKey,
        displayDate: formatDate(new Date(dateKey)),
        current: currentVal !== null ? Number(currentVal.toFixed(1)) : null,
        forecast: null,
        goal: goal?.targetValue,
        ideal: null,
        unit,
        workout: dailyWorkouts.has(dateKey),
        isReal: currentVal !== null,
        workoutsAtDate: dailyWorkouts.get(dateKey) || [],
        measurementEntries: measurement?.entries || [],
        isForecast: false
      };
    });

  // 5. Baseline handling
  if (goal && isValidDate(goal.startDate)) {
    const startIso = new Date(goal.startDate).toISOString().split('T')[0];
    const hasValidStartValue = typeof goal.startValue === 'number' && goal.startValue > 0;
    
    if (timeline.length === 0) {
      timeline.push({
        dateKey: startIso,
        displayDate: formatDate(goal.startDate),
        current: hasValidStartValue ? goal.startValue : null,
        forecast: null,
        goal: goal.targetValue,
        ideal: null,
        unit,
        workout: dailyWorkouts.has(startIso),
        isReal: hasValidStartValue,
        workoutsAtDate: dailyWorkouts.get(startIso) || [],
        measurementEntries: [],
        isForecast: false
      });
    } else if (startIso < timeline[0].dateKey) {
      timeline.unshift({
        dateKey: startIso,
        displayDate: formatDate(goal.startDate),
        current: hasValidStartValue ? goal.startValue : timeline[0].current,
        forecast: null,
        goal: goal.targetValue,
        ideal: null,
        unit,
        workout: dailyWorkouts.has(startIso),
        isReal: hasValidStartValue,
        workoutsAtDate: dailyWorkouts.get(startIso) || [],
        measurementEntries: [],
        isForecast: false
      });
    }
  }

  // Final fallback for first point if it's null
  if (timeline.length > 0 && timeline[0].current === null) {
     const firstReal = timeline.find(p => p.current !== null && p.current > 0);
     if (firstReal) {
       timeline[0].current = firstReal.current;
       timeline[0].isReal = true;
     }
  }

  // 6. Linear Interpolation for 'current' values
  for (let i = 1; i < timeline.length - 1; i++) {
    if (timeline[i].current === null) {
      let prev = null;
      for (let j = i - 1; j >= 0; j--) {
        if (timeline[j].current !== null) { prev = timeline[j]; break; }
      }
      let next = null;
      for (let j = i + 1; j < timeline.length; j++) {
        if (timeline[j].current !== null) { next = timeline[j]; break; }
      }

      if (prev && next) {
        const t1 = new Date(prev.dateKey).getTime();
        const t2 = new Date(next.dateKey).getTime();
        const t = new Date(timeline[i].dateKey).getTime();
        const ratio = (t - t1) / (t2 - t1);
        timeline[i].current = Number((prev.current! + (next.current! - prev.current!) * ratio).toFixed(1));
        timeline[i].isReal = false;
      } else if (prev) {
        timeline[i].current = prev.current;
        timeline[i].isReal = false;
      } else if (next) {
        timeline[i].current = next.current;
        timeline[i].isReal = false;
      }
    }
  }

  // 7. Forecast handling
  const lastRealPoint = timeline[timeline.length - 1];
  if (lastRealPoint && forecastedDate && goal && goal.status === 'ACTIVE' && isValidDate(forecastedDate)) {
    const forecastIso = new Date(forecastedDate).toISOString().split('T')[0];
    
    if (forecastIso > lastRealPoint.dateKey) {
      // Connect real data to forecast
      lastRealPoint.forecast = lastRealPoint.current;

      const daysGap = (new Date(forecastIso).getTime() - new Date(lastRealPoint.dateKey).getTime()) / (1000 * 3600 * 24);
      
      // Add a midpoint if gap is large
      if (daysGap > 30) {
        const midDate = new Date(new Date(lastRealPoint.dateKey).getTime() + (new Date(forecastIso).getTime() - new Date(lastRealPoint.dateKey).getTime()) / 2);
        timeline.push({
          dateKey: midDate.toISOString().split('T')[0],
          displayDate: formatDate(midDate),
          current: null,
          forecast: Number((( (lastRealPoint.current || 0) + goal.targetValue ) / 2).toFixed(1)),
          goal: goal.targetValue,
          ideal: null,
          unit,
          workout: false,
          isReal: false,
          workoutsAtDate: [],
          measurementEntries: [],
          isForecast: true
        });
      }

      timeline.push({
        dateKey: forecastIso,
        displayDate: formatDate(forecastedDate),
        current: null,
        forecast: Number(goal.targetValue.toFixed(1)),
        goal: goal.targetValue,
        ideal: null,
        unit,
        workout: false,
        isReal: false,
        workoutsAtDate: [],
        measurementEntries: [],
        isForecast: true
      });
    }
  }

  // 8. Ideal path calculation
  if (goal && isValidDate(goal.startDate) && timeline.length > 0) {
    const startDate = new Date(goal.startDate).getTime();
    const startVal = goal.startValue || timeline[0].current || 0;
    const targetVal = goal.targetValue;
    
    // Find absolute end date in timeline
    const endDate = new Date(timeline[timeline.length - 1].dateKey).getTime();
    
    if (endDate > startDate) {
      timeline.forEach(p => {
        const t = new Date(p.dateKey).getTime();
        if (t >= startDate) {
          const ratio = Math.min(1, (t - startDate) / (endDate - startDate));
          p.ideal = Number((startVal + (targetVal - startVal) * ratio).toFixed(1));
        } else {
          p.ideal = startVal;
        }
      });
    }
  }

  // Minimal single-point visibility
  if (timeline.length === 1) {
    const single = timeline[0];
    const nextDay = new Date(new Date(single.dateKey).getTime() + 86400000);
    timeline.push({
      ...single,
      dateKey: nextDay.toISOString().split('T')[0],
      displayDate: formatDate(nextDay),
    });
  }

  return timeline;
};
