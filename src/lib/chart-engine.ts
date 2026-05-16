import { WorkoutEntry, WeightEntry, Goal } from '../types';
import { METRICS } from '../constants/metrics';
import { formatDate } from './utils';
import { DataNormalizer } from './data-normalizer';

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
  rawMeasurements: WeightEntry[],
  rawWorkouts: WorkoutEntry[],
  goal?: Goal | null,
  metricId: string = 'weight',
  forecastedDate?: string | null
): ChartDataPoint[] => {
  const unit = METRICS[metricId]?.unit || goal?.unit || '';

  // Use DataNormalizer to get clean, sorted, filtered data
  const stateMock = { 
    weightHistory: rawMeasurements, 
    workouts: rawWorkouts,
    profile: null,
    goals: [],
    activeGoalId: null,
    analyses: [],
    analysesHistory: []
  } as any;

  const cleanData = DataNormalizer.getMetricTimeline(stateMock, metricId);
  
  // 1. Collect all raw points for this metric
  const dailyData = new Map<string, { avg: number, entries: any[] }>();
  
  cleanData.forEach(p => {
    if (!isValidDate(p.date)) return;
    const dayKey = new Date(p.date).toISOString().split('T')[0];
    const existing = dailyData.get(dayKey) || { avg: 0, entries: [] };
    
    existing.entries.push(p.original);
    dailyData.set(dayKey, existing);
  });

  // Calculate averages for days with multiple entries
  dailyData.forEach((val) => {
    val.avg = DataNormalizer.safeAverage(val.entries.map(e => e.value || DataNormalizer.getMetricValueFromWorkout(e, metricId)));
  });

  // 2. Identify all workouts for markers (even if they don't have the metric)
  const workoutMarkers = new Map<string, WorkoutEntry[]>();
  rawWorkouts.forEach(w => {
    if (!isValidDate(w.date)) return;
    const dayKey = new Date(w.date).toISOString().split('T')[0];
    const list = workoutMarkers.get(dayKey) || [];
    list.push(w);
    workoutMarkers.set(dayKey, list);
  });

  // 3. Build a combined set of dates
  const allDates = new Set<string>();
  dailyData.forEach((_, k) => allDates.add(k));
  
  try {
    if (goal && isValidDate(goal.startDate)) {
      allDates.add(new Date(goal.startDate).toISOString().split('T')[0]);
    }
  } catch (e) {
    console.error('Invalid goal.startDate in chart engine', goal?.startDate);
  }

  // 4. Create sorted base timeline
  let timeline: ChartDataPoint[] = Array.from(allDates)
    .sort()
    .map(dateKey => {
      const data = dailyData.get(dateKey);
      const workoutsAtDate = workoutMarkers.get(dateKey) || [];
      
      const currentVal = data ? data.avg : null;

      let displayDate = '—';
      try {
        displayDate = formatDate(dateKey);
      } catch (e) {}

      return {
        dateKey,
        displayDate,
        current: currentVal !== null ? Number(currentVal.toFixed(1)) : null,
        forecast: null,
        goal: goal?.targetValue,
        ideal: null,
        unit,
        workout: workoutsAtDate.length > 0,
        isReal: currentVal !== null,
        workoutsAtDate: workoutsAtDate,
        measurementEntries: data?.entries || [],
        isForecast: false
      };
    });

  // 5. Baseline handling
  if (goal && isValidDate(goal.startDate)) {
    const startIso = new Date(goal.startDate).toISOString().split('T')[0];
    const hasValidStartValue = typeof goal.startValue === 'number' && goal.startValue > 0;
    
    // Find absolute first real value in timeline for fallback
    const firstRealInTimeline = timeline.find(p => p.current !== null && p.current > 0)?.current;
    const fallbackStart = hasValidStartValue ? goal.startValue : (firstRealInTimeline || 0);

    if (timeline.length === 0) {
      timeline.push({
        dateKey: startIso,
        displayDate: formatDate(goal.startDate),
        current: hasValidStartValue ? goal.startValue : null,
        forecast: null,
        goal: goal.targetValue,
        ideal: null,
        unit,
        workout: workoutMarkers.has(startIso),
        isReal: hasValidStartValue,
        workoutsAtDate: workoutMarkers.get(startIso) || [],
        measurementEntries: [],
        isForecast: false
      });
    } else if (!timeline.some(p => p.dateKey === startIso)) {
        const point = {
          dateKey: startIso,
          displayDate: formatDate(goal.startDate),
          current: hasValidStartValue ? goal.startValue : timeline[0].current,
          forecast: null,
          goal: goal.targetValue,
          ideal: null,
          unit,
          workout: workoutMarkers.has(startIso),
          isReal: hasValidStartValue,
          workoutsAtDate: workoutMarkers.get(startIso) || [],
          measurementEntries: [],
          isForecast: false
        };
        if (startIso < timeline[0].dateKey) timeline.unshift(point);
        else {
          timeline.push(point);
          timeline.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
        }
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
    // Determine where the ideal line should start visually
    const firstPoint = timeline[0];
    const effectiveStartDate = new Date(firstPoint.dateKey).getTime();
    
    // Values for calculation
    const startVal = (typeof goal.startValue === 'number' && goal.startValue > 0) 
      ? goal.startValue 
      : (timeline.find(p => p.current !== null && p.current > 0)?.current || 0);
      
    const targetVal = goal.targetValue;
    
    // End date is either forecast date or goal deadline
    const finalDateStr = forecastedDate || goal.deadline;
    const endDate = isValidDate(finalDateStr) ? new Date(finalDateStr).getTime() : new Date(timeline[timeline.length - 1].dateKey).getTime();
    
    if (endDate > effectiveStartDate && startVal > 0) {
      timeline.forEach(p => {
        const t = new Date(p.dateKey).getTime();
        // Calculate point on the ideal linear path
        const ratio = Math.max(0, Math.min(1, (t - effectiveStartDate) / (endDate - effectiveStartDate)));
        p.ideal = Number((startVal + (targetVal - startVal) * ratio).toFixed(1));
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
