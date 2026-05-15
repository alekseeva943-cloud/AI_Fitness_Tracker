import { FitnessState, UserProfile } from '../../types';
import { METRICS } from '../../constants/metrics';

export interface AIUserContext {
  profile: UserProfile | null;
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
  history: {
    weightEntries: any[];
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
      profile: state.profile,
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
      },
      history: {
        weightEntries: state.weightHistory.slice(-10).map(w => ({ date: w.date, value: w.value }))
      }
    };
  }

  static formatContextForPrompt(context: AIUserContext): string {
    const { goal, analytics, activity, profile } = context;

    let prompt = `--- ЛИЧНЫЙ ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ ---\n`;
    if (profile) {
      prompt += `- Имя: ${profile.displayName || profile.name || 'Не указано'}\n`;
      prompt += `- Возраст: ${profile.age} лет, Пол: ${profile.gender}, Рост: ${profile.height} см, Текущий вес: ${profile.weight || 'Не указан'} кг\n`;
      prompt += `- Телосложение: ${profile.bodyType}, Уровень подготовки: ${profile.fitnessLevel}\n`;
      prompt += `- Уровень активности: ${profile.activityLevel}\n`;
      
      if (profile.baselines?.length) {
        prompt += `- Исходные замеры (Baselines):\n`;
        profile.baselines.forEach(b => {
          prompt += `  * ${b.name}: ${b.value} ${b.unit} (Дата: ${new Date(b.date).toLocaleDateString('ru-RU')})\n`;
        });
      }

      if (profile.injuries?.length) prompt += `- Травмы/Ограничения: ${profile.injuries.join(', ')}\n`;
      if (profile.lifestyleNotes) prompt += `- Стиль жизни: ${profile.lifestyleNotes}\n`;
      if (profile.nutritionNotes) prompt += `- Питание: ${profile.nutritionNotes}\n`;
      prompt += `- Сон: ~${profile.sleepAverage}ч, Стресс: ${profile.stressLevel}/10\n\n`;
    } else {
      prompt += `Профиль не заполнен.\n\n`;
    }

    prompt += `--- ЦЕЛЬ ПОЛЬЗОВАТЕЛЯ ---\n`;
    prompt += `${goal ? `"${goal.title}" (Показатель: ${goal.metricLabel}, Цель: ${goal.targetValue} ${goal.unit})` : 'Не установлена'}\n\n`;
    
    prompt += `ДАННЫЕ АНАЛИТИКИ:\n`;
    prompt += `- Состояние цели: ${analytics.goal.status}\n`;
    prompt += `- Скорость изменения: ${analytics.goal.velocity} ${goal?.unit || ''}/нед\n`;
    prompt += `- Направление тренда: ${analytics.trends.actualDirection}\n`;
    prompt += `- Соответствие цели: ${analytics.trends.isTrendMatchingGoal ? 'Да' : 'Нет'}\n\n`;

    prompt += `ДАННЫЕ АКТИВНОСТИ:\n`;
    prompt += `- Разнообразие тренировок: ${JSON.stringify(activity.workoutDiversity)}\n`;
    prompt += `- Последние тренировки: ${JSON.stringify(activity.recentIntensity)}\n\n`;

    if (context.history.weightEntries.length > 0) {
      prompt += `ИСТОРИЯ ВЕСА (последние замеры):\n`;
      context.history.weightEntries.forEach(w => {
        prompt += `- ${new Date(w.date).toLocaleDateString('ru-RU')}: ${w.value} кг\n`;
      });
    }

    return prompt;
  }
}
