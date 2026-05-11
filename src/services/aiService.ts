import OpenAI from 'openai';
import { FitnessState, AIAnalysis } from '../types';
import { AI_CONFIG } from '../config/ai.config';

/**
 * Service to handle AI interactions using OpenAI API.
 * Centralized configuration and error handling.
 */
export class AIService {
  private static getClient() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is missing. Please add it to your environment variables.');
    }
    return new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Frontend execution as requested
    });
  }

  static async analyzeProgress(state: FitnessState, analytics: any): Promise<AIAnalysis> {
    const openai = this.getClient();
    
    const userPrompt = `
      Данные аналитики (сформированные движком):
      - Тренд веса: ${JSON.stringify(analytics.weight)}
      - Статистика тренировок: ${JSON.stringify(analytics.workouts)}
      - Прогресс цели: ${JSON.stringify(analytics.goal)}
      
      Интерпретируй эти данные как профессиональный фитнес-коуч.
      Выдай ответ ТОЛЬКО в формате JSON на РУССКОМ языке:
      {
        "summary": "Глубокая интерпретация текущего состояния (как профессиональный коуч)",
        "trend": "IMPROVING" | "STAGNATING" | "DECLINING",
        "recommendations": [
          {
            "type": "EXERCISE" | "DIET" | "REST" | "MOTIVATION",
            "text": "Конкретный совет на основе этих данных",
            "priority": "LOW" | "MEDIUM" | "HIGH"
          }
        ]
      }
    `;

    try {
      const response = await openai.chat.completions.create({
        model: AI_CONFIG.MODEL,
        messages: [
          { role: 'system', content: AI_CONFIG.SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0].message.content;
      const result = JSON.parse(content || '{}');
      
      return {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        ...result
      };
    } catch (error) {
      console.error("OpenAI Analysis failed:", error);
      throw error;
    }
  }
}
