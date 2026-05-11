import { Goal, GoalType } from "../../../types";
import { WeightTrend, GoalProgress } from "../types";
import { addDays } from "date-fns";

export const calculateGoalProgress = (goal: Goal | null, trend: WeightTrend | null): GoalProgress | null => {
  if (!goal) return null;

  const current = goal.currentValue;
  const target = goal.targetValue;
  const initial = goal.type === GoalType.WEIGHT_LOSS ? trend?.startingWeight || current : current; // Simplified

  // Completion Percentage
  let completionPercentage = 0;
  if (goal.type === GoalType.WEIGHT_LOSS) {
    const totalToLose = Math.abs(initial - target);
    const lostSoFar = Math.abs(initial - current);
    completionPercentage = totalToLose > 0 ? (lostSoFar / totalToLose) * 100 : 100;
  } else if (goal.type === GoalType.MUSCLE_GAIN) {
    const totalToGain = target - initial;
    const gainedSoFar = current - initial;
    completionPercentage = totalToGain > 0 ? (gainedSoFar / totalToGain) * 100 : 100;
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
