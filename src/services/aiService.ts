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

  static async analyzeProgress(state: FitnessState): Promise<AIAnalysis> {
    const openai = this.getClient();
    
    const userPrompt = `
      Данные пользователя:
      Цели: ${JSON.stringify(state.goals)}
      Недавние тренировки: ${JSON.stringify(state.workouts.slice(0, 5))}
      История веса: ${JSON.stringify(state.weightHistory.slice(0, 10))}
      Профиль: ${JSON.stringify(state.profile)}

      Выдай JSON с анализом:
      - summary (короткий отчет)
      - trend (IMPROVING/STAGNATING/DECLINING)
      - forecastDate (ISO дата достижения цели)
      - forecastValue (прогнозное значение)
      - recommendations (список объектов: type, text, priority)
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
