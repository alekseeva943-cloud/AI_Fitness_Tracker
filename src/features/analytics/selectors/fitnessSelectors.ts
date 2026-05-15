import { FitnessState } from "../../../types";
import { AnalyticsSummary } from "../types";
import { calculateWeightTrend } from "../calculators/trends";
import { calculateWorkoutStats } from "../calculators/performance";
import { calculateGoalProgress } from "../forecasting/engine";
import { logger } from "../../../lib/logger";
import { DataNormalizer } from "../../../lib/data-normalizer";

/**
 * High-performance selectors to compute internal analytics from state.
 * These follow the deterministic flow: Data -> Calc -> Summary.
 */
export const selectAnalyticsSummary = (state: FitnessState): AnalyticsSummary | null => {
  try {
    const activeGoal = state.goals.find(g => g.id === state.activeGoalId) || null; 
    
    // STRICT: Use normalized weight timeline instead of raw weightHistory
    const normalizedWeightHistory = DataNormalizer.getWeightTimeline(state);
    
    // Debug validation
    DataNormalizer.validateDataFlow(state, 'weight');

    const weightTrend = calculateWeightTrend(normalizedWeightHistory, activeGoal);
    const workoutStats = calculateWorkoutStats(state.workouts);
    const goalProgress = calculateGoalProgress(activeGoal, weightTrend);
    const forecast = weightTrend?.forecastedWeight;

    if (weightTrend) {
      logger.log('analytics', `Weight: curr=${weightTrend.currentWeight}, totalDelta=${weightTrend.totalChange.toFixed(1)}kg, weeklyDelta=${weightTrend.weeklyChange.toFixed(1)}kg, forecast30d=${forecast?.toFixed(1)}kg`);
    }

    if (goalProgress) {
      logger.log('analytics', `Goal: progress=${goalProgress.completionPercentage}%, remaining=${goalProgress.remainingValue.toFixed(1)}kg, status=${goalProgress.status}`);
    }

    if (!weightTrend) return null;

    return {
      weight: weightTrend,
      workouts: workoutStats,
      goal: goalProgress || {
        completionPercentage: 0,
        remainingValue: 0,
        estimatedCompletionDate: null,
        isImproving: false,
        status: 'STAGNANT',
        isAchieved: false
      }
    };
  } catch (error) {
    logger.error('Failed to calculate analytics summary', error);
    return null;
  }
};

/**
 * Transformer for Recharts.
 */
export const selectWeightChartData = (state: FitnessState) => {
  try {
    const normalized = DataNormalizer.getWeightTimeline(state);
    return normalized
      .map(e => ({
        date: new Date(e.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
        weight: e.value,
        timestamp: new Date(e.date).getTime()
      }))
      .reverse();
  } catch (error) {
    logger.error('Failed to transform chart data', error);
    return [];
  }
};
