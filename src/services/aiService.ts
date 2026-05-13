import { GoogleGenAI, Type } from "@google/genai";
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
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API ключ Gemini не найден. Пожалуйста, проверьте настройки проекта.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
        Ты – профессиональный фитнес-аналитик и коуч. Твоя задача – проанализировать прогресс пользователя относительно его КОНКРЕТНОЙ ЦЕЛИ.
        
        ЦЕЛЬ ПОЛЬЗОВАТЕЛЯ: ${goal ? `"${goal.title}" (Показатель: ${currentMetric.label}, Цель: ${goal.targetValue} ${goal.unit})` : 'Не установлена'}
        
        ДАННЫЕ ДЛЯ АНАЛИЗА:
        - Аналитика: ${JSON.stringify(analytics.goal)}
        - Семантика процесса: ${JSON.stringify(semanticContext)}
        
        ВЫХОДНОЙ ФОРМАТ: JSON
        {
          "summary": "Краткое описание прогресса",
          "trend": "IMPROVING" | "STAGNATING" | "DECLINING",
          "recommendations": [
            { "type": "EXERCISE" | "DIET" | "REST" | "MOTIVATION", "text": "Текст рекомендации", "priority": "LOW" | "MEDIUM" | "HIGH" }
          ]
        }
      `;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              trend: { type: Type.STRING },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    text: { type: Type.STRING },
                    priority: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });

      const resultJson = JSON.parse(result.text || "{}");
      
      return {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        summary: resultJson.summary,
        trend: resultJson.trend,
        recommendations: resultJson.recommendations
      };
    } catch (error) {
      console.error("AI Analysis failed:", error);
      throw error;
    }
  }
}
