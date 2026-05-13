import { GoogleGenAI, Type } from '@google/genai';
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
    
    const prompt = `
      Ты – профессиональный фитнес-коуч с 20-летним опытом. 
      Твоя задача – проанализировать данные пользователя и дать глубокие, персонализированные инсайты.

      ДАННЫЕ ПОЛЬЗОВАТЕЛЯ:
      - Аналитика веса: ${JSON.stringify(analytics.weight)}
      - Статистика тренировок: ${JSON.stringify(analytics.workouts)}
      - Текущая цель: ${JSON.stringify(analytics.goal)}

      КОНТЕКСТ ДЛЯ АНАЛИЗА:
      - weeklyChange: Изменение средней массы тела за ТЕКУЩУЮ неделю относительно ПРЕДЫДУЩЕЙ недели.
      - totalChange: Разница между САМЫМ ПЕРВЫМ замером и ТЕКУЩИМ.
      - velocity: Среднее изменение веса в день за весь период наблюдений.
      
      ВАЖНО: Если weeklyChange около 0, но totalChange большой – это значит, что основной прогресс был в прошлом, а сейчас плато. 
      Не поздравляй пользователя с успехами, которые случились давно, как если бы они были вчера.

      ТРЕБОВАНИЯ К ОТВЕТУ:
      1. Проанализируй скорость изменений.
      2. Выяви возможные плато или периоды высокой эффективности.
      3. Дай 3-4 конкретных совета по тренировкам, питанию или отдыху.
      
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
