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
  if (goal.type === GoalType.WEIGHT_LOSS) {
    const totalToLose = initial - target;
    const lostSoFar = initial - current;
    completionPercentage = totalToLose > 0 ? (lostSoFar / totalToLose) * 100 : 0;
  } else if (goal.type === GoalType.MUSCLE_GAIN) {
    const totalToGain = target - initial;
    const gainedSoFar = current - initial;
    completionPercentage = totalToGain > 0 ? (gainedSoFar / totalToGain) * 100 : 0;
  }
  
  completionPercentage = Math.max(0, Math.min(100, completionPercentage));

  // Forecasting completion date
  let estimatedCompletionDate: string | null = null;
  let status: GoalProgress['status'] = 'ON_TRACK';

  if (trend && trend.velocity !== 0) {
    const remainingValue = Math.abs(target - current);
    const velocity = Math.abs(trend.velocity); // absolute change per day
    
    if (velocity > 0) {
      const daysToGoal = Math.ceil(remainingValue / velocity);
      estimatedCompletionDate = addDays(new Date(), daysToGoal).toISOString();
      
      const deadline = new Date(goal.deadline);
      const estimated = new Date(estimatedCompletionDate);
      
      if (estimated < deadline) {
        status = 'AHEAD_OF_SCHEDULE';
      } else if (differenceInDays(estimated, deadline) > 14) {
        status = 'BEHIND_SCHEDULE';
      }
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
