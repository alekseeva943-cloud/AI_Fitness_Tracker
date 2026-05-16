import { FitnessState, WorkoutEntry, WeightEntry } from '../types';
import { METRICS, MetricCategory } from '../constants/metrics';
import { isAfter, subDays } from 'date-fns';

/**
 * Data Normalizer Central Layer
 * Ensures strict separation between BODY metrics and WORKOUT metrics.
 * Prevents "data pollution" where training weights leak into body weight analytics.
 */
export class DataNormalizer {
  
  // --- Safe Math Utils ---
  
  static safeNum(val: any, fallback = 0): number {
    if (val === null || val === undefined) return fallback;
    const n = typeof val === 'number' ? val : parseFloat(String(val));
    return isNaN(n) || !isFinite(n) ? fallback : n;
  }

  static safeDivide(a: number, b: number, fallback = 0): number {
    const n1 = this.safeNum(a);
    const n2 = this.safeNum(b);
    if (n2 === 0) return fallback;
    return n1 / n2;
  }

  static safeAverage(nums: number[], fallback = 0): number {
    const valid = nums.map(n => this.safeNum(n)).filter(n => n > 0);
    if (valid.length === 0) return fallback;
    const sum = valid.reduce((s, v) => s + v, 0);
    return this.safeDivide(sum, valid.length, fallback);
  }

  static isValidDate(d: any): boolean {
    if (!d) return false;
    const date = new Date(d);
    return date instanceof Date && !isNaN(date.getTime());
  }

  // --- Body Metrics Normalized Access ---

  /**
   * Retrieves body-only metrics from weightHistory.
   * STRICT: Only looks at BODY category metrics.
   */
  static getBodyMeasurements(state: FitnessState, metricId: string): WeightEntry[] {
    const metricDef = METRICS[metricId];
    if (!metricDef || metricDef.category !== 'BODY') {
      return [];
    }

    const history = state.weightHistory || [];
    
    const normalized = history
      .map(e => {
        let val = 0;
        if (metricId === 'weight') {
          val = this.safeNum(e.value);
        } else {
          val = this.safeNum(e.metrics?.[metricId]);
        }
        
        return {
          ...e,
          value: val
        };
      })
      .filter(e => this.isValidDate(e.date) && e.value > 0 && e.value < 1000); // Sanity check

    // Return chronological (oldest first)
    return normalized.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Specifically handles weight, potentially merging from workouts IF AND ONLY IF 
   * the workout entry has a valid body weight check.
   */
  static getWeightTimeline(state: FitnessState): WeightEntry[] {
    const measurements = this.getBodyMeasurements(state, 'weight');
    
    // Also extract weight checks from workouts if they exist and are plausible
    const workoutWeights: WeightEntry[] = state.workouts
      .filter(w => this.isValidDate(w.date) && this.safeNum(w.weight) > 30) // Minimum plausible body weight
      .map(w => ({
        id: `w-${w.id}`,
        date: w.date,
        value: this.safeNum(w.weight),
        unit: 'кг',
        notes: `Измерено во время тренировки: ${w.type}`
      }));

    const combined = [...measurements, ...workoutWeights];
    return combined.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Get the absolute latest valid body weight.
   * Priority: weightHistory > profile baseline > profile weight field
   */
  static getLatestWeight(state: FitnessState): number {
    const timeline = this.getWeightTimeline(state);
    if (timeline.length > 0) return timeline[timeline.length - 1].value;
    
    const baseline = state.profile?.baselines.find(b => b.id === 'weight')?.value;
    if (baseline !== undefined) return this.safeNum(baseline);
    
    return this.safeNum(state.profile?.weight, 0);
  }

  // --- Workout Metrics Normalized Access ---

  /**
   * Retrieves performance metrics specifically from workouts.
   * EXCLUDES any body measurements.
   */
  static getWorkoutMetrics(state: FitnessState, metricId: string): WorkoutEntry[] {
    const metricDef = METRICS[metricId];
    if (!metricDef || metricDef.category === 'BODY') {
      return []; // STRICT: Body metrics don't come from here
    }

    return state.workouts
      .filter(w => {
        const val = this.getMetricValueFromWorkout(w, metricId);
        return this.isValidDate(w.date) && val > 0;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Extract value from workout based on metric rules.
   */
  static getMetricValueFromWorkout(workout: Optional<WorkoutEntry>, metricId: string): number {
    if (!workout) return 0;
    
    // 1. Direct mapping for known workout metrics
    if (metricId === 'caloriesBurned') return this.safeNum(workout.caloriesBurned);
    if (metricId === 'duration') return this.safeNum(workout.duration);
    if (metricId === 'distance') return this.safeNum(workout.distance);
    if (metricId === 'speed') return this.safeNum(workout.speed);
    if (metricId === 'heartRate') return this.safeNum(workout.heartRate);
    if (metricId === 'workingWeight') return this.safeNum(workout.workingWeight);
    if (metricId === 'volume') return this.safeNum(workout.totalWeight);

    // 2. Strength exercise lookup
    if (workout.category === 'STRENGTH' && workout.exercises) {
      const metricLabel = METRICS[metricId]?.label?.toLowerCase() || '';
      const ex = workout.exercises.find((e: any) => e.name?.toLowerCase().includes(metricLabel));
      if (ex && ex.weight) return this.safeNum(ex.weight);
    }

    // 3. Fallback to generic property if not a Body Metric
    if (METRICS[metricId]?.category !== 'BODY') {
        return this.safeNum((workout as any)[metricId]);
    }

    return 0;
  }

  // --- Unified Factory ---

  static getMetricTimeline(state: FitnessState, metricId: string): { date: string, value: number, original: any }[] {
    const def = METRICS[metricId];
    if (!def) return [];

    if (def.category === 'BODY') {
      const data = metricId === 'weight' ? this.getWeightTimeline(state) : this.getBodyMeasurements(state, metricId);
      return data.map(d => ({ date: d.date, value: d.value, original: d }));
    } else {
      const data = this.getWorkoutMetrics(state, metricId);
      return data.map(d => ({ date: d.date, value: this.getMetricValueFromWorkout(d, metricId), original: d }));
    }
  }

  static getLatestMetricValue(state: FitnessState, metricId: string): number {
    if (metricId === 'weight' && state.profile?.weight) return this.safeNum(state.profile.weight);
    const timeline = this.getMetricTimeline(state, metricId);
    if (timeline.length === 0) {
      if (metricId === 'weight') return this.safeNum(state.profile?.baselines.find(b => b.id === 'weight')?.value, 0);
      return 0;
    }
    return timeline[timeline.length - 1].value;
  }

  // --- Debug & Validation ---

  static validateDataFlow(state: FitnessState, metricId: string) {
    console.group(`[DATA FLOW VALIDATION: ${metricId}]`);
    const timeline = this.getMetricTimeline(state, metricId);
    const latest = this.getLatestMetricValue(state, metricId);
    
    console.log('Final Timeline Length:', timeline.length);
    console.log('Resolved Current Value:', latest);
    
    if (metricId === 'weight') {
      const rawWeights = state.weightHistory.length;
      const workoutWeights = state.workouts.filter(w => (w.weight || 0) > 0).length;
      console.log(`Sources: ${rawWeights} direct, ${workoutWeights} from workouts`);
    }

    if (timeline.length > 0) {
      const sortedDates = timeline.every((val, i, arr) => !i || new Date(val.date) >= new Date(arr[i-1].date));
      console.log('Chronological sorting verified:', sortedDates);
    }
    console.groupEnd();
  }
}

type Optional<T> = T | null | undefined;
