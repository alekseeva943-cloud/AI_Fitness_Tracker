import { FitnessState } from "../../../types";
import { AnalyticsSummary } from "../types";
import { calculateWeightTrend } from "../calculators/trends";
import { calculateWorkoutStats } from "../calculators/performance";
import { calculateGoalProgress } from "../forecasting/engine";
import { logger } from "../../../lib/logger";

/**
 * High-performance selectors to compute internal analytics from state.
 * These follow the deterministic flow: Data -> Calc -> Summary.
 */
export const selectAnalyticsSummary = (state: FitnessState): AnalyticsSummary | null => {
  try {
    const activeGoal = state.goals[0] || null; // Use first goal for primary analytics
    
    const weightTrend = calculateWeightTrend(state.weightHistory, activeGoal);
    const workoutStats = calculateWorkoutStats(state.workouts);
    const goalProgress = calculateGoalProgress(activeGoal, weightTrend);

    if (!weightTrend) return null;

    return {
      weight: weightTrend,
      workouts: workoutStats,
      goal: goalProgress || {
        completionPercentage: 0,
        remainingValue: 0,
        estimatedCompletionDate: null,
        status: 'STAGNANT'
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
    return state.weightHistory
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
