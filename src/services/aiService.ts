import { GoogleGenAI, Type } from '@google/genai';
import { METRICS } from '../constants/metrics';
import { FitnessState, AIAnalysis } from '../types';

export class AIService {
  private static getClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing.');
    }
    return new GoogleGenAI({ apiKey });
  }

  static async analyzeProgress(state: FitnessState, analytics: any): Promise<AIAnalysis> {
    const ai = this.getClient();
    
    const goal = state.goals.find(g => g.id === state.activeGoalId) || null;
    const currentMetric = goal ? METRICS[goal.metricId] || METRICS.weight : METRICS.weight;

    // Enhanced semantic context for smarter AI insights
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

    const prompt = `
      Ты – профессиональный фитнес-аналитик и коуч. Твоя задача – проанализировать прогресс пользователя относительно его КОНКРЕТНОЙ ЦЕЛИ.
      
      ЦЕЛЬ ПОЛЬЗОВАТЕЛЯ: ${goal ? `"${goal.title}" (Показатель: ${currentMetric.label}, Цель: ${goal.targetValue} ${goal.unit})` : 'Не установлена'}
      
      ДАННЫЕ ДЛЯ АНАЛИЗА:
      - Аналитика: ${JSON.stringify(analytics.goal)}
      - Динамика веса (если применимо): ${JSON.stringify(analytics.weight)}
      - Семантика процесса: ${JSON.stringify(semanticContext)}
      
      КОНТЕКСТ:
      - velocity: Скорость изменения целевого показателя в день.
      - isTrendMatchingGoal: Идет ли пользователь к цели или от нее.
      
      ОСОБЫЕ ТРЕБОВАНИЯ:
      1. Если цель специфическая (например, "пробежать 5км за 20 минут" или "научиться плавать быстрее"), анализируй именно этот контекст.
      2. Если прогресс отрицательный (isTrendMatchingGoal: false), будь честным, но конструктивным. Объясни, ПРЯМО СЕЙЧАС пользователь удаляется от цели.
      3. Учитывай объем тренировок (recentIntensity). Если тренировок мало, а цель амбициозная – укажи на это.
      4. Не используй общие фразы. Используй цифры из данных.
      
      ВЫХОДНОЙ ФОРМАТ: JSON
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              trend: { type: Type.STRING, enum: ["IMPROVING", "STAGNATING", "DECLINING"] },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, enum: ["EXERCISE", "DIET", "REST", "MOTIVATION"] },
                    text: { type: Type.STRING },
                    priority: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] }
                  },
                  required: ["type", "text", "priority"]
                }
              }
            },
            required: ["summary", "trend", "recommendations"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      
      return {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        summary: result.summary,
        trend: result.trend,
        recommendations: result.recommendations
      };
    } catch (error) {
      console.error("Gemini Analysis failed:", error);
      throw error;
    }
  }
}
