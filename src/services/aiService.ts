import { GoogleGenAI, Type } from "@google/genai";
import { FitnessState, AIAnalysis } from '../types';
import { AI_CONFIG } from '../constants/ai';
import { ANALYTICS_SYSTEM_PROMPT } from '../ai/prompts/analytics';
import { AIContextBuilder } from '../ai/context/context-builder';

export class AIService {
  static async analyzeProgress(state: FitnessState, analytics: any): Promise<AIAnalysis> {
    const context = AIContextBuilder.buildUserContext(state, analytics);
    const userContextStr = AIContextBuilder.formatContextForPrompt(context);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API ключ Gemini не найден. Пожалуйста, проверьте настройки проекта.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // DEBUG LOGGING
      console.group('[AI REQUEST]');
      console.log('SYSTEM PROMPT:', ANALYTICS_SYSTEM_PROMPT);
      console.log('USER CONTEXT:', context);
      console.log('FORMATTED CONTEXT:', userContextStr);
      console.groupEnd();

      const result = await ai.models.generateContent({
        model: AI_CONFIG.MODEL,
        contents: `${ANALYTICS_SYSTEM_PROMPT}\n\n${userContextStr}`,
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

      // DEBUG RESPONSE LOGGING
      console.group('[AI RESPONSE]');
      console.log('TEXT:', result.text);
      console.groupEnd();

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

