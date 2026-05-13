import { Goal, GoalType } from "../../../types";
import { WeightTrend, GoalProgress } from "../types";
import { addDays, differenceInDays } from "date-fns";
import { logger } from "../../../lib/logger";

export const calculateGoalProgress = (goal: Goal | null, trend: WeightTrend | null): GoalProgress | null => {
  if (!goal) return null;

  const current = trend ? trend.currentWeight : goal.currentValue;
  const target = goal.targetValue;
  const initial = goal.startValue; 
  
  logger.log('analytics', `Calculating progress for goal "${goal.title}": current=${current}, target=${target}, initial=${initial}`);

  // Completion Percentage
  let completionPercentage = 0;
  
  // Directions: lower is better for WEIGHT_LOSS, higher is better for others usually
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

  // Forecasting completion date - logic currently optimized for weight (velocity in kg/day)
  let estimatedCompletionDate: string | null = null;
  let status: GoalProgress['status'] = 'ON_TRACK';

  if (trend && trend.velocity !== 0) {
    const remainingValue = Math.abs(target - current);
    const velocity = trend.velocity;
    
    // Check if moving towards goal based on type
    const isMovingTowardsGoal = (isLoss && velocity < 0) || (isGain && velocity > 0);

    if (isMovingTowardsGoal) {
      const absVelocity = Math.abs(velocity);
      
      // Sanity check: minimum velocity to calculate date (0.01 kg/day ~ 0.07 kg/week)
      if (absVelocity > 0.01) {
        const daysToGoal = Math.ceil(remainingValue / absVelocity);
        
        // Sanity check: max 2 years forecast
        if (daysToGoal < 730) {
          estimatedCompletionDate = addDays(new Date(), daysToGoal).toISOString();
          
          const deadline = new Date(goal.deadline);
          const estimated = new Date(estimatedCompletionDate);
          
          if (estimated < deadline) {
            status = 'AHEAD_OF_SCHEDULE';
          } else if (differenceInDays(estimated, deadline) > 14) {
            status = 'BEHIND_SCHEDULE';
          }
        } else {
          // Progress is too slow for realistic date estimation
          estimatedCompletionDate = null;
        }
      } else {
        // Velocity is almost zero
        status = 'STAGNANT';
        estimatedCompletionDate = null;
      }
    } else {
      status = 'WRONG_DIRECTION';
      estimatedCompletionDate = null;
    }
  }

  if (trend?.isPlateau) {
    status = 'STAGNANT';
  }

  return {
    completionPercentage: Math.round(completionPercentage),
    remainingValue: Math.abs(target - current),
    estimatedCompletionDate,
    status
  };
};
