import { FitnessState } from '../../types';
import { METRICS } from '../../constants/metrics';

export interface AIUserContext {
  goal: {
    title: string;
    type: string;
    metricLabel: string;
    targetValue: number;
    unit: string;
    startValue: number;
    expectedDirection: 'up' | 'down';
  } | null;
  analytics: {
    goal: any;
    trends: {
      velocity: number;
      actualDirection: 'up' | 'down' | 'stable';
      isTrendMatchingGoal: boolean;
    };
  };
  activity: {
    workoutDiversity: Record<string, number>;
    recentIntensity: any[];
  };
}

export class AIContextBuilder {
  static buildUserContext(state: FitnessState, analytics: any): AIUserContext {
    const goal = state.goals.find(g => g.id === state.activeGoalId) || null;
    const currentMetric = goal ? METRICS[goal.metricId] || METRICS.weight : METRICS.weight;

    const workoutDiversity = state.workouts.reduce((acc: Record<string, number>, w) => {
      const cat = w.category || 'OTHER';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const recentIntensity = state.workouts.slice(0, 10).map(w => ({
      type: w.type,
      category: w.category,
      duration: w.duration,
      totalWeight: w.totalWeight,
      distance: w.distance,
      heartRate: w.heartRate,
      calories: w.caloriesBurned,
      date: w.date
    }));

    return {
      goal: goal ? {
        title: goal.title,
        type: goal.type,
        metricLabel: currentMetric.label,
        targetValue: goal.targetValue,
        unit: currentMetric.unit,
        startValue: goal.startValue,
        expectedDirection: goal.targetValue > goal.startValue ? 'up' : 'down',
      } : null,
      analytics: {
        goal: analytics.goal,
        trends: {
          velocity: analytics.goal.velocity,
          actualDirection: analytics.goal.velocity < 0 ? 'down' : (analytics.goal.velocity > 0 ? 'up' : 'stable'),
          isTrendMatchingGoal: analytics.goal.status !== 'WRONG_DIRECTION' && analytics.goal.status !== 'STAGNANT',
        }
      },
      activity: {
        workoutDiversity,
        recentIntensity
      }
    };
  }

  static formatContextForPrompt(context: AIUserContext): string {
    const { goal, analytics, activity } = context;

    let prompt = `ЦЕЛЬ ПОЛЬЗОВАТЕЛЯ: ${goal ? `"${goal.title}" (Показатель: ${goal.metricLabel}, Цель: ${goal.targetValue} ${goal.unit})` : 'Не установлена'}\n\n`;
    
    prompt += `ДАННЫЕ АНАЛИТИКИ:\n`;
    prompt += `- Состояние цели: ${analytics.goal.status}\n`;
    prompt += `- Скорость изменения: ${analytics.goal.velocity} ${goal?.unit || ''}/нед\n`;
    prompt += `- Направление тренда: ${analytics.trends.actualDirection}\n`;
    prompt += `- Соответствие цели: ${analytics.trends.isTrendMatchingGoal ? 'Да' : 'Нет'}\n\n`;

    prompt += `ДАННЫЕ АКТИВНОСТИ:\n`;
    prompt += `- Разнообразие тренировок: ${JSON.stringify(activity.workoutDiversity)}\n`;
    prompt += `- Последние тренировки: ${JSON.stringify(activity.recentIntensity)}\n`;

    return prompt;
  }
}
