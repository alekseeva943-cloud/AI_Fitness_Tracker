import { AIUserContext } from '../context/context-builder';
import { logger } from '../../lib/logger';

export function validateAIContext(context: AIUserContext): AIUserContext {
  const issues: string[] = [];

  // Critical checks
  if (!context.analytics) {
    issues.push('Missing analytics object');
  }

  if (context.analytics && !context.analytics.goal) {
    issues.push('Missing analytics.goal object');
  }

  if (issues.length > 0) {
    logger.log('ai', '[AI CONTEXT VALIDATION] Potential issues found:', issues);
  }

  // Ensure analytics nested objects exist
  context.analytics = context.analytics || { 
    goal: { status: 'UNKNOWN', velocity: 0 }, 
    trends: { velocity: 0, actualDirection: 'stable', isTrendMatchingGoal: true },
    overallProgress: 0 
  };
  
  if (context.analytics && !context.analytics.goal) {
    context.analytics.goal = { status: 'UNKNOWN', velocity: 0 };
    issues.push('Missing analytics.goal object - using default');
  }

  if (context.analytics && !context.analytics.trends) {
    context.analytics.trends = { velocity: 0, actualDirection: 'stable', isTrendMatchingGoal: true };
    issues.push('Missing analytics.trends object - using default');
  }

  // Ensure arrays exist
  context.activeGoals = context.activeGoals || [];
  context.activity = context.activity || {
    workoutDiversity: {},
    recentWorkouts: [],
    totalWorkouts: 0,
    weeklyFrequency: 0
  };
  context.metrics = context.metrics || { weightHistory: [], latestBaselines: [] };
  context.memory = context.memory || { recentAnalyses: [] };

  return context;
}
