import { FitnessState, UserProfile } from '../../types';
import { METRICS } from '../../constants/metrics';
import { AIMemoryManager } from '../memory/memory-manager';

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
    const memory = await AIMemoryManager.updateMemory(state.analyses || []);
    const goal = state.goals.find(g => g.id === state.activeGoalId) || null;
    const currentMetric = goal ? METRICS[goal.metricId] || METRICS.weight : METRICS.weight;

    const workoutDiversity = state.workouts.reduce((acc: Record<string, number>, w) => {
      const cat = w.category || 'OTHER';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const recentWorkouts = state.workouts.slice(0, 5).map(w => ({
      type: w.type,
      category: w.category,
      duration: w.duration,
      intensity: w.heartRate ? (w.heartRate > 150 ? 'HIGH' : 'MODERATE') : 'UNKNOWN',
      calories: w.caloriesBurned,
      date: w.date
    }));

    return {
      profile: state.profile,
      activeGoals: state.goals.filter(g => g.status === 'ACTIVE'),
      currentGoal: goal ? {
        title: goal.title,
        type: goal.type,
        metricLabel: currentMetric.label,
        targetValue: goal.targetValue,
        unit: currentMetric.unit,
        startValue: goal.startValue,
        description: goal.motivation,
        progress: analytics.goal.completionPercentage / 100,
      } : null,
      analytics: {
        goal: analytics.goal,
        trends: {
          velocity: analytics.goal.velocity,
          actualDirection: analytics.goal.velocity < 0 ? 'down' : (analytics.goal.velocity > 0 ? 'up' : 'stable'),
          isTrendMatchingGoal: analytics.goal.status !== 'WRONG_DIRECTION' && analytics.goal.status !== 'STAGNANT',
        },
        overallProgress: analytics.summary.overallProgress
      },
      activity: {
        workoutDiversity,
        recentWorkouts,
        totalWorkouts: state.workouts.length,
        weeklyFrequency: state.workouts.filter(w => {
          const d = new Date(w.date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return d > weekAgo;
        }).length
      },
      metrics: {
        weightHistory: state.weightHistory.slice(-5).map(w => ({ date: w.date, value: w.value })),
        latestBaselines: state.profile?.baselines?.slice(-5) || []
      },
      memory: {
        recentAnalyses: state.analyses.slice(0, 3).map(a => ({
          date: a.date,
          summary: a.summary,
          trend: a.trend
        }))
      },
      systemMemory: memory
    };
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
      prompt += `Target: ${currentGoal.targetValue} ${currentGoal.unit} (Start: ${currentGoal.startValue}, Progress: ${Math.round(currentGoal.progress * 100)}%)\n`;
    } else {
      prompt += `No active goal.\n`;
    }

    prompt += `\n--- ANALYTICS ---\n`;
    prompt += `Status: ${analytics.goal.status}\n`;
    prompt += `Velocity: ${analytics.goal.velocity} ${currentGoal?.unit || ''}/week\n`;
    prompt += `Trend: ${analytics.trends.actualDirection} (Matching target: ${analytics.trends.isTrendMatchingGoal ? 'YES' : 'NO'})\n`;

    prompt += `\n--- RECENT ACTIVITY ---\n`;
    prompt += `Workouts/week: ${activity.weeklyFrequency}, Total: ${activity.totalWorkouts}\n`;
    prompt += `Types: ${Object.entries(activity.workoutDiversity).map(([k, v]) => `${k}:${v}`).join(', ')}\n`;
    prompt += `Last 3 sessions: ${activity.recentWorkouts.slice(0, 3).map(w => `${w.type}(${w.duration}min)`).join(', ')}\n`;

    prompt += `\n--- RECENT METRICS ---\n`;
    if (metrics.weightHistory.length) {
      prompt += `Weight: ${metrics.weightHistory.map(w => w.value).join(' -> ')}\n`;
    }
    if (metrics.latestBaselines.length) {
      prompt += `Baselines: ${metrics.latestBaselines.map(b => `${b.name}:${b.value}${b.unit}`).join(', ')}\n`;
    }

    if (memory.recentAnalyses.length) {
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
