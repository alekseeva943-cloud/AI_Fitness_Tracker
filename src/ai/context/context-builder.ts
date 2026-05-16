import { FitnessState, UserProfile } from '../../types';
import { METRICS } from '../../constants/metrics';
import { AIMemoryManager } from '../memory/memory-manager';
import { logger } from '../../lib/logger';

export interface AIUserContext {
  profile: UserProfile | null;
  activeGoals: any[];
  currentGoal: any | null;

  analytics: {
    goal: any;

    trends: {
      velocity: number;
      actualDirection: 'up' | 'down' | 'stable';
      isTrendMatchingGoal: boolean;
    };

    overallProgress: number;
  };

  activity: {
    workoutDiversity: Record<string, number>;
    recentWorkouts: any[];
    totalWorkouts: number;
    weeklyFrequency: number;
  };

  metrics: {
    weightHistory: any[];
    latestBaselines: any[];
  };

  memory: {
    recentAnalyses: any[];
  };

  systemMemory?: any;
}

export class AIContextBuilder {

  static async buildUserContext(
    state: FitnessState,
    analytics: any
  ): Promise<AIUserContext> {

    console.group('[AI CONTEXT TRACE]');

    logger.log(
      'ai',
      '[AI CONTEXT START] Initializing context assembly...'
    );

    const context: any = {

      profile: null,

      activeGoals: [],

      currentGoal: null,

      analytics: {
        goal: {
          status: 'UNKNOWN',
          velocity: 0
        },

        trends: {
          velocity: 0,
          actualDirection: 'stable',
          isTrendMatchingGoal: true
        },

        overallProgress: 0
      },

      activity: {
        workoutDiversity: {},
        recentWorkouts: [],
        totalWorkouts: 0,
        weeklyFrequency: 0
      },

      metrics: {
        weightHistory: [],
        latestBaselines: []
      },

      memory: {
        recentAnalyses: []
      },

      systemMemory: null
    };

    // =========================================
    // PROFILE
    // =========================================

    try {

      context.profile =
        state.profile || null;

      logger.log(
        'ai',
        '[STEP SUCCESS] Profile mapped'
      );

    } catch (e) {

      console.error(
        '[CONTEXT SECTION FAILED] profile',
        e
      );
    }

    // =========================================
    // GOALS
    // =========================================

    try {

      context.activeGoals =
        state.goals?.filter(
          g => g.status === 'ACTIVE'
        ) || [];

      const goal =
        state.goals?.find(
          g => g.id === state.activeGoalId
        ) || null;

      if (goal) {

        const currentMetric =
          METRICS[goal.metricId] ||
          METRICS.weight;

        context.currentGoal = {

          title: goal.title,

          type: goal.type,

          metricLabel: currentMetric.label,

          targetValue: goal.targetValue,

          unit: currentMetric.unit,

          startValue: goal.startValue,

          description: goal.motivation,

          progress:
            (analytics?.goal?.completionPercentage ?? 0) / 100,
        };
      }

      logger.log(
        'ai',
        '[STEP SUCCESS] Goals mapped'
      );

    } catch (e) {

      console.error(
        '[CONTEXT SECTION FAILED] goals',
        e
      );
    }

    // =========================================
    // ANALYTICS
    // =========================================

    try {

      console.log(
        '[AI SAFE CHECK] Analytics raw input:',
        analytics
      );

      const rootAnalytics =
        analytics || {};

      const goalObj =
        rootAnalytics.goal || {};

      const summaryObj =
        rootAnalytics.summary ||
        rootAnalytics ||
        {};

      const progressVal =
        summaryObj.overallProgress ??
        rootAnalytics.overallProgress ??
        goalObj.completionPercentage ??
        0;

      context.analytics.goal =
        goalObj;

      const velocity =
        goalObj.velocity ??
        rootAnalytics.weight?.velocity ??
        0;

      context.analytics.trends = {

        velocity,

        actualDirection:
          velocity < 0
            ? 'down'
            : velocity > 0
              ? 'up'
              : 'stable',

        isTrendMatchingGoal:
          goalObj.status !== 'WRONG_DIRECTION' &&
          goalObj.status !== 'STAGNANT',
      };

      context.analytics.overallProgress =
        typeof progressVal === 'number'
          ? progressVal
          : 0;

      console.log(
        '[AI SAFE CHECK] Context Analytics mapped:',
        context.analytics
      );

      logger.log(
        'ai',
        '[STEP SUCCESS] Analytics mapped'
      );

    } catch (e) {

      console.error(
        '[CONTEXT SECTION FAILED] analytics',
        e
      );
    }

    // =========================================
    // ACTIVITY
    // =========================================

    try {

      const workoutDiversity =
        (state.workouts || []).reduce(
          (acc: Record<string, number>, w) => {

            const category =
              w.category || 'OTHER';

            acc[category] =
              (acc[category] || 0) + 1;

            return acc;

          },
          {}
        );

      const recentWorkouts =
        (state.workouts || [])
          .slice(0, 5)
          .map(w => ({

            type: w.type,

            category: w.category,

            duration: w.duration,

            intensity:
              w.heartRate
                ? w.heartRate > 150
                  ? 'HIGH'
                  : 'MODERATE'
                : 'UNKNOWN',

            calories: w.caloriesBurned,

            date: w.date
          }));

      context.activity = {

        workoutDiversity,

        recentWorkouts,

        totalWorkouts:
          state.workouts?.length || 0,

        weeklyFrequency:
          (state.workouts || []).filter(w => {

            const d = new Date(w.date);

            const weekAgo = new Date();

            weekAgo.setDate(
              weekAgo.getDate() - 7
            );

            return d > weekAgo;

          }).length
      };

      logger.log(
        'ai',
        '[STEP SUCCESS] Activity mapped'
      );

    } catch (e) {

      console.error(
        '[CONTEXT SECTION FAILED] activity',
        e
      );
    }

    // =========================================
    // METRICS
    // =========================================

    try {

      context.metrics = {

        weightHistory:
          (state.weightHistory || [])
            .slice(-5)
            .map(w => ({
              date: w.date,
              value: w.value
            })),

        latestBaselines:
          state.profile?.baselines?.slice(-5) || []
      };

      logger.log(
        'ai',
        '[STEP SUCCESS] Metrics mapped'
      );

    } catch (e) {

      console.error(
        '[CONTEXT SECTION FAILED] metrics',
        e
      );
    }

    // =========================================
    // MEMORY
    // =========================================

    try {

      context.memory = {

        recentAnalyses:
          (state.analyses || [])
            .slice(0, 3)
            .map(a => ({

              date: a.date,

              summary: a.summary,

              trend: a.trend
            }))
      };

      context.systemMemory =
        await AIMemoryManager
          .updateMemory(state.analyses || [])
          .catch(e => {

            console.error(
              '[MEMORY UPDATE FAILED]',
              e
            );

            return null;
          });

      logger.log(
        'ai',
        '[STEP SUCCESS] Memory mapped'
      );

    } catch (e) {

      console.error(
        '[CONTEXT SECTION FAILED] memory',
        e
      );
    }

    console.log(
      '[CONTEXT SHAPE]',
      JSON.stringify(context, null, 2)
    );

    console.groupEnd();

    return context as AIUserContext;
  }

  static formatContextForPrompt(
    context: AIUserContext,
    activityContext?: any
  ): string {

    const {
      profile,
      currentGoal,
      analytics,
      activity,
      metrics,
      memory,
      systemMemory
    } = context;

    let prompt = `
=== PROFILE ===
`;

    // =========================================
    // PROFILE
    // =========================================

    if (profile) {

      prompt += `
Имя: ${profile.displayName}
Возраст: ${profile.age}
Пол: ${profile.gender}
Рост: ${profile.height} см
Телосложение: ${profile.bodyType}

Уровень подготовки: ${profile.fitnessLevel}
Активность: ${profile.activityLevel}
`;

      if (profile.injuries?.length) {

        prompt += `
Травмы/ограничения:
${profile.injuries.join(', ')}
`;
      }

      prompt += `
Сон: ${profile.sleepAverage}ч
Стресс: ${profile.stressLevel}/10
`;

      if (profile.nutritionNotes) {

        prompt += `
Питание:
${profile.nutritionNotes}
`;
      }

      if (profile.recoveryNotes) {

        prompt += `
Восстановление:
${profile.recoveryNotes}
`;
      }

      if (profile.motivation) {

        prompt += `
Мотивация:
${profile.motivation}
`;
      }
    }

    // =========================================
    // CURRENT WORKOUT CONTEXT
    // =========================================

    if (activityContext) {

      prompt += `

=== ТЕКУЩИЙ WORKOUT CONTEXT ===
`;

      // WORKOUT

      if (activityContext.workout) {

        prompt += `
Текущая тренировка:
${activityContext.workout.title}

Тип:
${activityContext.workout.type}

Длительность:
${activityContext.workout.duration} мин

Цель тренировки:
${activityContext.workout.description}
`;
      }

      // EXERCISE

      if (activityContext.exercise) {

        prompt += `

=== ACTIVE EXERCISE ===

Упражнение:
${activityContext.exercise.name}

Подходы:
${activityContext.exercise.sets}

Повторения:
${activityContext.exercise.reps}

Вес:
${activityContext.exercise.weight || 'Собственный вес'}
`;

        if (activityContext.exercise.notes) {

          prompt += `
Тренерские заметки:
${activityContext.exercise.notes}
`;
        }
      }

      // =========================================
      // CONVERSATION HISTORY
      // =========================================

      if (activityContext.chatHistory?.length) {

        prompt += `

=== АКТИВНЫЙ ДИАЛОГ С КОУЧЕМ ===
`;

        const recentMessages =
          activityContext.chatHistory.slice(-10);

        recentMessages.forEach((m: any) => {

          if (m.role === 'user') {

            prompt += `

Пользователь:
${m.content}
`;

          } else {

            prompt += `

Коуч:
${m.content}
`;
          }
        });

        prompt += `

=== ПРАВИЛА ДИАЛОГА ===

- Отвечай ИМЕННО на последний вопрос пользователя.
- Не меняй тему разговора.
- Не уходи в общие рекомендации.
- Если пользователь спрашивает:
  "как?"
  "почему?"
  "чем заменить?"
  трактуй вопрос в контексте предыдущего ответа коуча.

- Если обсуждается упражнение:
  объясняй:
  - технику,
  - дыхание,
  - положение суставов,
  - ошибки,
  - ощущения в мышцах,
  - контроль веса.

- Если пользователь пишет про боль:
  адаптируй упражнение безопасно.

- Если пользователь просит замену:
  предложи 2-3 реальные альтернативы
  и объясни почему они подходят.
`;
      }
    }

    // =========================================
    // GOAL
    // =========================================

    prompt += `

=== ACTIVE GOAL ===
`;

    if (currentGoal) {

      prompt += `
Цель:
${currentGoal.title}

Текущий прогресс:
${Math.round((currentGoal.progress ?? 0) * 100)}%

Целевое значение:
${currentGoal.targetValue} ${currentGoal.unit}

Старт:
${currentGoal.startValue}
`;

    } else {

      prompt += `
Активная цель отсутствует.
`;
    }

    // =========================================
    // ANALYTICS
    // =========================================

    prompt += `

=== ANALYTICS ===
`;

    if (analytics?.goal) {

      prompt += `
Статус:
${analytics.goal.status || 'UNKNOWN'}

Скорость:
${analytics.goal.velocity ?? 0}

Направление:
${analytics.trends?.actualDirection || 'stable'}
`;

    } else {

      prompt += `
Analytics unavailable.
`;
    }

    // =========================================
    // ACTIVITY
    // =========================================

    prompt += `

=== RECENT ACTIVITY ===
`;

    if (activity) {

      prompt += `
Тренировок за неделю:
${activity.weeklyFrequency ?? 0}

Всего тренировок:
${activity.totalWorkouts ?? 0}
`;

      if (activity.recentWorkouts?.length) {

        prompt += `
Последние тренировки:
${activity.recentWorkouts
  .slice(0, 3)
  .map(w => `${w.type} (${w.duration} мин)`)
  .join(', ')}
`;
      }
    }

    // =========================================
    // METRICS
    // =========================================

    prompt += `

=== RECENT METRICS ===
`;

    if (metrics?.weightHistory?.length) {

      prompt += `
История веса:
${metrics.weightHistory
  .map(w => w.value)
  .join(' → ')}
`;
    }

    // =========================================
    // MEMORY
    // =========================================

    if (memory?.recentAnalyses?.length) {

      prompt += `

=== PREVIOUS AI INSIGHTS ===
`;

      prompt += memory.recentAnalyses
        .map(
          a => `
- ${a.summary}
`
        )
        .join('\n');
    }

    // =========================================
    // LONG TERM MEMORY
    // =========================================

    if (systemMemory) {

      prompt += `

=== LONG TERM MEMORY ===
`;

      if (systemMemory.longTermInsights?.length) {

        prompt += `
Ключевые инсайты:
${systemMemory.longTermInsights.join('; ')}
`;
      }

      if (systemMemory.recurringIssues?.length) {

        prompt += `
Повторяющиеся проблемы:
${systemMemory.recurringIssues.join('; ')}
`;
      }
    }

    return prompt;
  }
}
