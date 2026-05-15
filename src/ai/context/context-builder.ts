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
  static async buildUserContext(state: FitnessState, analytics: any): Promise<AIUserContext> {
    console.group('[AI CONTEXT TRACE]');
    logger.log('ai', '[AI CONTEXT START] Initializing context assembly...');

    const context: any = {
      profile: null,
      activeGoals: [],
      currentGoal: null,
      analytics: {
        goal: { status: 'UNKNOWN', velocity: 0 },
        trends: { velocity: 0, actualDirection: 'stable', isTrendMatchingGoal: true },
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

    // SECTION: PROFILE
    try {
      context.profile = state.profile || null;
      logger.log('ai', '[STEP SUCCESS] Profile mapped');
    } catch (e) {
      console.error('[CONTEXT SECTION FAILED] profile', e);
    }

    // SECTION: GOALS
    try {
      context.activeGoals = state.goals?.filter(g => g.status === 'ACTIVE') || [];
      const goal = state.goals?.find(g => g.id === state.activeGoalId) || null;
      
      if (goal) {
        const currentMetric = METRICS[goal.metricId] || METRICS.weight;
        context.currentGoal = {
          title: goal.title,
          type: goal.type,
          metricLabel: currentMetric.label,
          targetValue: goal.targetValue,
          unit: currentMetric.unit,
          startValue: goal.startValue,
          description: goal.motivation,
          progress: (analytics?.goal?.completionPercentage ?? 0) / 100,
        };
      }
      logger.log('ai', '[STEP SUCCESS] Goals mapped');
    } catch (e) {
      console.error('[CONTEXT SECTION FAILED] goals', e);
    }

      // SECTION: ANALYTICS
    try {
      console.log('[AI SAFE CHECK] Analytics raw input:', analytics);
      
      // ROOT LEVEL DEFENSE
      const rootAnalytics = analytics || {};
      const goalObj = rootAnalytics.goal || {};
      
      // The user reported "Cannot read properties of undefined (reading 'overallProgress')"
      // We will check EVERY possible location where overallProgress might hide
      const summaryObj = rootAnalytics.summary || rootAnalytics || {};
      const progressVal = summaryObj.overallProgress ?? (rootAnalytics as any).overallProgress ?? (goalObj as any).completionPercentage ?? 0;

      context.analytics.goal = goalObj;
      
      const vel = goalObj.velocity ?? (rootAnalytics as any).weight?.velocity ?? 0;
      context.analytics.trends = {
        velocity: vel,
        actualDirection: vel < 0 ? 'down' : (vel > 0 ? 'up' : 'stable'),
        isTrendMatchingGoal: goalObj.status !== 'WRONG_DIRECTION' && goalObj.status !== 'STAGNANT',
      };
      
      context.analytics.overallProgress = typeof progressVal === 'number' ? progressVal : 0;
      
      console.log('[AI SAFE CHECK] Context Analytics mapped:', context.analytics);
      logger.log('ai', '[STEP SUCCESS] Analytics mapped');
    } catch (e) {
      console.error('[CONTEXT SECTION FAILED] analytics critical error:', e);
      // Fallback already partially handled by initial object if this catch is hit
    }

    // SECTION: ACTIVITY
    try {
      const workoutDiversity = (state.workouts || []).reduce((acc: Record<string, number>, w) => {
        const cat = w.category || 'OTHER';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

      const recentWorkouts = (state.workouts || []).slice(0, 5).map(w => ({
        type: w.type,
        category: w.category,
        duration: w.duration,
        intensity: w.heartRate ? (w.heartRate > 150 ? 'HIGH' : 'MODERATE') : 'UNKNOWN',
        calories: w.caloriesBurned,
        date: w.date
      }));

      context.activity = {
        workoutDiversity,
        recentWorkouts,
        totalWorkouts: state.workouts?.length || 0,
        weeklyFrequency: (state.workouts || []).filter(w => {
          const d = new Date(w.date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return d > weekAgo;
        }).length
      };
      logger.log('ai', '[STEP SUCCESS] Activity mapped');
    } catch (e) {
      console.error('[CONTEXT SECTION FAILED] activity', e);
    }

    // SECTION: METRICS
    try {
      context.metrics = {
        weightHistory: (state.weightHistory || []).slice(-5).map(w => ({ date: w.date, value: w.value })),
        latestBaselines: state.profile?.baselines?.slice(-5) || []
      };
      logger.log('ai', '[STEP SUCCESS] Metrics mapped');
    } catch (e) {
      console.error('[CONTEXT SECTION FAILED] metrics', e);
    }

    // SECTION: MEMORY
    try {
      context.memory = {
        recentAnalyses: (state.analyses || []).slice(0, 3).map(a => ({
          date: a.date,
          summary: a.summary,
          trend: a.trend
        }))
      };
      context.systemMemory = await AIMemoryManager.updateMemory(state.analyses || []).catch(e => {
        console.error('[MEMORY UPDATE FAILED]', e);
        return null;
      });
      logger.log('ai', '[STEP SUCCESS] Memory mapped');
    } catch (e) {
      console.error('[CONTEXT SECTION FAILED] memory', e);
    }

    console.log('[CONTEXT SHAPE]', JSON.stringify(context, null, 2));
    console.groupEnd();

    return context as AIUserContext;
  }

  static formatContextForPrompt(context: AIUserContext): string {
    const { profile, currentGoal, analytics, activity, metrics, memory, systemMemory } = context;

    let prompt = `--- PROFILE ---\n`;
    if (profile) {
      prompt += `User: ${profile.displayName} (${profile.age}y, ${profile.gender}, ${profile.height}cm, Body: ${profile.bodyType})\n`;
      prompt += `Fitness Level: ${profile.fitnessLevel}, Activity Level: ${profile.activityLevel}\n`;
      if (profile.injuries?.length) prompt += `Injuries: ${profile.injuries.join(', ')}\n`;
      prompt += `Sleep: ${profile.sleepAverage}h, Stress: ${profile.stressLevel}/10\n`;
      if (profile.nutritionNotes) prompt += `Nutrition: ${profile.nutritionNotes}\n`;
      if (profile.recoveryNotes) prompt += `Recovery: ${profile.recoveryNotes}\n`;
      if (profile.motivation) prompt += `Motivation: ${profile.motivation}\n`;
      if (profile.lifestyleNotes) prompt += `Lifestyle: ${profile.lifestyleNotes}\n`;
    }

    prompt += `\n--- ACTIVE GOAL ---\n`;
    if (currentGoal) {
      prompt += `Goal: "${currentGoal.title}"\n`;
      prompt += `Target: ${currentGoal.targetValue} ${currentGoal.unit} (Start: ${currentGoal.startValue}, Progress: ${Math.round((currentGoal.progress ?? 0) * 100)}%)\n`;
    } else {
      prompt += `No active goal.\n`;
    }

    prompt += `\n--- ANALYTICS ---\n`;
    if (analytics && analytics.goal) {
      prompt += `Status: ${analytics.goal.status || 'UNKNOWN'}\n`;
      prompt += `Velocity: ${analytics.goal.velocity ?? 0} ${currentGoal?.unit || ''}/week\n`;
      if (analytics.trends) {
        prompt += `Trend: ${analytics.trends.actualDirection || 'stable'} (Matching target: ${analytics.trends.isTrendMatchingGoal ? 'YES' : 'NO'})\n`;
      }
    } else {
      prompt += `Analytics data currently unavailable.\n`;
    }

    prompt += `\n--- RECENT ACTIVITY ---\n`;
    if (activity) {
      prompt += `Workouts/week: ${activity.weeklyFrequency ?? 0}, Total: ${activity.totalWorkouts ?? 0}\n`;
      if (activity.workoutDiversity) {
        prompt += `Types: ${Object.entries(activity.workoutDiversity).map(([k, v]) => `${k}:${v}`).join(', ')}\n`;
      }
      if (activity.recentWorkouts?.length) {
        prompt += `Last 3 sessions: ${activity.recentWorkouts.slice(0, 3).map(w => `${w.type}(${w.duration}min)`).join(', ')}\n`;
      }
    }

    prompt += `\n--- RECENT METRICS ---\n`;
    if (metrics) {
      if (metrics.weightHistory?.length) {
        prompt += `Weight: ${metrics.weightHistory.map(w => w.value).join(' -> ')}\n`;
      }
      if (metrics.latestBaselines?.length) {
        prompt += `Baselines: ${metrics.latestBaselines.map(b => `${b.name}:${b.value}${b.unit}`).join(', ')}\n`;
      }
    }

    if (memory?.recentAnalyses?.length) {
      prompt += `\n--- PREVIOUS AI INSIGHTS ---\n`;
      prompt += memory.recentAnalyses.map(a => `- ${a.date}: ${a.summary} (Trend: ${a.trend})`).join('\n');
    }

    if (systemMemory) {
      prompt += `\n--- LONG-TERM AI MEMORY ---\n`;
      if (systemMemory.longTermInsights?.length) {
        prompt += `Key Insights: ${systemMemory.longTermInsights.join('; ')}\n`;
      }
      if (systemMemory.recurringIssues?.length) {
        prompt += `Recurring Patterns/Issues: ${systemMemory.recurringIssues.join('; ')}\n`;
      }
    }

    return prompt;
  }
}
