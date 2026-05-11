import { AnalyticsSummary } from "../types";
import { RU } from "../../../constants";

export interface DeterministicRecommendation {
  type: 'EXERCISE' | 'DIET' | 'REST' | 'MOTIVATION';
  text: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const getDeterministicRecommendations = (summary: AnalyticsSummary): DeterministicRecommendation[] => {
  const recommendations: DeterministicRecommendation[] = [];

  // Workout frequency logic
  if (summary.workouts.avgWorkoutsPerWeek < 2) {
    recommendations.push({
      type: 'EXERCISE',
      text: 'Ваша частота тренировок низкая. Попробуйте добавить хотя бы одну короткую прогулку или разминку.',
      priority: 'HIGH'
    });
  }

  // Plateau logic
  if (summary.weight.isPlateau) {
    recommendations.push({
      type: 'DIET',
      text: 'Вы вышли на плато. ИИ рекомендует пересмотреть калорийность рациона или изменить тип нагрузки.',
      priority: 'MEDIUM'
    });
  }

  // Consistency logic
  if (summary.workouts.consistencyScore > 90) {
    recommendations.push({
      type: 'MOTIVATION',
      text: 'Потрясающая стабильность! Вы в топ-10% активных пользователей.',
      priority: 'LOW'
    });
  }

  // Velocity logic (Weight Loss specific example)
  if (summary.weight.weeklyChange > 0.5) {
    recommendations.push({
      type: 'REST',
      text: 'Вес растет быстрее плана. Убедитесь, что это не задержка воды из-за чрезмерных нагрузок.',
      priority: 'MEDIUM'
    });
  }

  return recommendations;
};
