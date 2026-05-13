import { METRICS } from '../constants/metrics';
import { FitnessState, AIAnalysis } from '../types';

export class AIService {
  static async analyzeProgress(state: FitnessState, analytics: any): Promise<AIAnalysis> {
    const goal = state.goals.find(g => g.id === state.activeGoalId) || null;
    const currentMetric = goal ? METRICS[goal.metricId] || METRICS.weight : METRICS.weight;

    const semanticContext = goal ? {
      goalType: goal.type,
      goalTitle: goal.title,
      metricId: goal.metricId,
      metricLabel: currentMetric.label,
      metricUnit: currentMetric.unit,
      expectedDirection: goal.targetValue > goal.startValue ? 'up' : 'down',
      actualDirection: analytics.goal.velocity < 0 ? 'down' : (analytics.goal.velocity > 0 ? 'up' : 'stable'),
      isTrendMatchingGoal: analytics.goal.status !== 'WRONG_DIRECTION' && analytics.goal.status !== 'STAGNANT',
      velocity: analytics.goal.velocity,
      workoutDiversity: state.workouts.reduce((acc: any, w) => {
        const cat = w.category || 'OTHER';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {}),
      recentIntensity: state.workouts.slice(0, 10).map(w => ({
        type: w.type,
        category: w.category,
        duration: w.duration,
        totalWeight: w.totalWeight,
        distance: w.distance,
        heartRate: w.heartRate,
        calories: w.caloriesBurned
      }))
    } : null;

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal: goal ? { ...goal, metricLabel: currentMetric.label } : null,
          analytics: analytics.goal,
          semanticContext
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to get AI recommendations');
      }

      const result = await response.json();
      
      return {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        summary: result.summary,
        trend: result.trend,
        recommendations: result.recommendations
      };
    } catch (error) {
      console.error("AI Analysis failed:", error);
      throw error;
    }
  }
}
