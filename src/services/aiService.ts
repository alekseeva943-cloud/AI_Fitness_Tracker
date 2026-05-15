import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from 'openai';
import { FitnessState, AIAnalysis } from '../types';
import { AI_CONFIG, AI_RECOMMENDATION_TYPE, AI_PRIORITY, AI_TREND } from '../constants/ai';
import { ANALYST_PROMPT, COACH_PROMPT, FORECASTER_PROMPT } from '../ai/prompts/prompts';
import { AIContextBuilder } from '../ai/context/context-builder';
import { logger } from '../lib/logger';

export class AIService {
  private static getOpenAIClient(): OpenAI | null {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;
    return new OpenAI({ 
      apiKey,
      dangerouslyAllowBrowser: true // Common for client-side demos, but secret should be in env
    });
  }

  private static getGeminiClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  }

  static async analyzeProgress(state: FitnessState, analytics: any): Promise<AIAnalysis> {
    const context = AIContextBuilder.buildUserContext(state, analytics);
    const contextStr = AIContextBuilder.formatContextForPrompt(context);
    
    const systemPrompt = `
${ANALYST_PROMPT}

${COACH_PROMPT}

${FORECASTER_PROMPT}

ВЫХОДНОЙ ФОРМАТ (СТРОГИЙ JSON):
{
  "summary": "Краткий обзор текущего состояния",
  "trend": "IMPROVING" | "STAGNATING" | "DECLINING",
  "explanation": "Объяснение на основе данных: почему сделан такой вывод (конкретные цифры)",
  "mainRisk": "Главный риск для прогресса в данный момент",
  "forecast": "Реалистичный прогноз на ближайшие 2-4 недели",
  "recommendations": [
    {
      "type": "EXERCISE" | "DIET" | "REST" | "MOTIVATION",
      "text": "Конкретная рекомендация",
      "priority": "LOW" | "MEDIUM" | "HIGH",
      "reason": "Почему это важно прямо сейчас"
    }
  ]
}
`;

    const fullPrompt = `${systemPrompt}\n\nUSER DATA:\n${contextStr}`;

    logger.log('ai', 'Starting AI Analysis pipeline');

    try {
      const openai = this.getOpenAIClient();
      
      if (openai) {
        logger.log('ai', 'Using OpenAI provider');
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Analyze this user data:\n${contextStr}` }
          ],
          response_format: { type: 'json_object' }
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error('Empty response from OpenAI');
        return this.parseResponse(content);
      }

      // Fallback to Gemini
      const gemini = this.getGeminiClient();
      if (!gemini) {
        throw new Error("No AI API keys found. Please check your project settings.");
      }

      logger.log('ai', 'Using Gemini provider (fallback or default)');
      
      const result = await gemini.models.generateContent({
        model: AI_CONFIG.MODEL,
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        config: {
          responseMimeType: "application/json",
        }
      });

      const text = result.text || '';
      return this.parseResponse(text);

    } catch (error) {
      logger.error('AI Analysis failed', error);
      throw error;
    }
  }

  private static parseResponse(rawJson: string): AIAnalysis {
    try {
      const data = JSON.parse(rawJson);
      
      return {
        id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
        date: new Date().toISOString(),
        summary: data.summary || 'Анализ завершен успешно.',
        trend: data.trend || AI_TREND.STAGNATING,
        explanation: data.explanation,
        mainRisk: data.mainRisk,
        forecast: data.forecast,
        recommendations: (data.recommendations || []).map((r: any) => ({
          id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
          type: r.type || AI_RECOMMENDATION_TYPE.CONSISTENCY,
          text: r.text || 'Продолжайте движение к цели.',
          priority: r.priority || AI_PRIORITY.MEDIUM,
          reason: r.reason
        }))
      };
    } catch (e) {
      logger.error('Failed to parse AI response', e);
      throw new Error('Некорректный формат ответа AI');
    }
  }
}

