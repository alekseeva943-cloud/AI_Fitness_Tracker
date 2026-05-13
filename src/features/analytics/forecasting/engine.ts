import { Goal, GoalType } from "../../../types";
import { WeightTrend, GoalProgress } from "../types";
import { addDays, differenceInDays } from "date-fns";
import { logger } from "../../../lib/logger";
import { ANALYTICS_CONSTANTS } from "../../../constants/analytics";

export const calculateGoalProgress = (goal: Goal | null, trend: WeightTrend | null): GoalProgress | null => {
  if (!goal) return null;

  const current = trend ? trend.currentWeight : goal.currentValue;
  const target = goal.targetValue;
  const initial = goal.startValue; 
  
  logger.log('analytics', `Calculating progress for goal "${goal.title}": current=${current}, target=${target}, initial=${initial}`);

  // 1. Completion Percentage
  let completionPercentage = 0;
  
  const isLoss = goal.type === GoalType.WEIGHT_LOSS;
  const isGain = goal.type === GoalType.MUSCLE_GAIN || goal.type === GoalType.STRENGTH;

  if (isLoss) {
    const totalToLose = initial - target;
    const lostSoFar = initial - current;
    completionPercentage = totalToLose > 0 ? (lostSoFar / totalToLose) * 100 : 0;
  } else if (isGain) {
    const totalToGain = target - initial;
    const gainedSoFar = current - initial;
    completionPercentage = totalToGain > 0 ? (gainedSoFar / totalToGain) * 100 : 0;
  }
  
  completionPercentage = Math.max(0, Math.min(100, completionPercentage));

  // 2. Forecasting logic
  let estimatedCompletionDate: string | null = null;
  let status: GoalProgress['status'] = 'ON_TRACK';

  if (trend) {
    const remainingValue = Math.abs(target - current);
    
    // Direction Check
    const isWeightLoss = goal.type === GoalType.WEIGHT_LOSS;
    const isWeightGain = goal.type === GoalType.MUSCLE_GAIN || goal.type === GoalType.STRENGTH;
    
    // Moving correct direction based on overall progress
    const isImprovingOverall = isWeightLoss ? (current < initial + 0.1) : (current > initial - 0.1);
    
    // Status is primarily determined by blended (recent) velocity
    const isMovingTowardsGoalRecent = (isWeightLoss && trend.velocity < 0) || (isWeightGain && trend.velocity > 0);
    
    // Forecast uses blended velocity if it's the right way, 
    // otherwise fall back to overall velocity if THAT is the right way.
    let effectiveVelocity = trend.velocity;
    const isOverallMovingTowardsGoal = (isWeightLoss && trend.overallVelocity < 0) || (isWeightGain && trend.overallVelocity > 0);

    if (!isMovingTowardsGoalRecent && isOverallMovingTowardsGoal) {
      effectiveVelocity = trend.overallVelocity;
    }

    const canForecast = (isWeightLoss && effectiveVelocity < 0) || (isWeightGain && effectiveVelocity > 0);
    
    // Final check for status
    if (!isImprovingOverall) {
      status = 'WRONG_DIRECTION';
    } else if (canForecast) {
      const absVelocity = Math.abs(effectiveVelocity);
      
      if (absVelocity > ANALYTICS_CONSTANTS.WEIGHT.MIN_VELOCITY_FOR_FORECAST) {
        const daysToGoal = Math.ceil(remainingValue / absVelocity);
        
        if (daysToGoal < ANALYTICS_CONSTANTS.GOAL.MAX_FORECAST_DAYS) {
          estimatedCompletionDate = addDays(new Date(), daysToGoal).toISOString();
          
          const deadline = new Date(goal.deadline);
          const estimated = new Date(estimatedCompletionDate);
          
          if (estimated < deadline) {
            status = 'AHEAD_OF_SCHEDULE';
          } else if (differenceInDays(estimated, deadline) > ANALYTICS_CONSTANTS.GOAL.STAGNANT_DAYS_THRESHOLD) {
            status = 'BEHIND_SCHEDULE';
          }
        }
      } else {
        status = 'STAGNANT';
      }
    } else {
      status = 'WRONG_DIRECTION';
      estimatedCompletionDate = null;
    }

    return {
      completionPercentage: Math.round(completionPercentage),
      remainingValue: Math.abs(target - current),
      estimatedCompletionDate,
      isImproving: isImprovingOverall && (isMovingTowardsGoalRecent || isOverallMovingTowardsGoal),
      status
    };
  }

  if (trend?.isPlateau) {
    status = 'STAGNANT';
  }

  return {
    completionPercentage: Math.round(completionPercentage),
    remainingValue: Math.abs(target - current),
    estimatedCompletionDate,
    isImproving: false,
    status
  };
};
