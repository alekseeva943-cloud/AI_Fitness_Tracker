import { AIActionType, AIActionOptions, AIResponse } from './types';
import { FitnessState } from '../../types';
import { AIContextBuilder } from '../context/context-builder';
import { SYSTEM_PROMPT_BASE, COACH_PROMPT } from '../prompts/coach';
import { validateAIContext } from '../validation/context-validator';
import { logger } from '../../lib/logger';

export class AIOrchestrator {
  static async executeAction(state: FitnessState, analytics: any, options: AIActionOptions): Promise<AIResponse> {
    const { actionType, userMessage } = options;
    const startTime = Date.now();
    
    console.group(`[AI PIPELINE] ${actionType}`);
    logger.log('ai', `[AI REQUEST START] ${new Date().toISOString()}`);

    try {
      logger.log('ai', '[AI CONTEXT BUILT] Starting context assembly...');
      let context = await AIContextBuilder.buildUserContext(state, analytics);
      
      logger.log('ai', '[AI CONTEXT VALIDATION] Validating context shape...');
      context = validateAIContext(context);

      const contextStr = AIContextBuilder.formatContextForPrompt(context, options.contextOverride);
      logger.log('ai', `[AI CONTEXT BUILT] Success. Length: ${contextStr.length} chars`);

      logger.log('ai', '[AI PROMPT BUILT] Using Premium Coach Prompt');
      const systemPrompt = this.getSystemPrompt(actionType);
      
      const userPrompt = userMessage 
        ? `ВОПРОС ПОЛЬЗОВАТЕЛЯ: ${userMessage}\n\nКОНТЕКСТ ДАННЫХ:\n${contextStr}`
        : `Проанализируй мои данные и дай рекомендации как мой тренер:\n${contextStr}`;

      logger.log('ai', '[AI PROVIDER START] Calling server API /api/ai...');
      
      const payload = {
        actionType,
        systemPrompt,
        userPrompt,
        provider: 'openai'
      };

      console.group('[AI TRANSPORT]');
      console.log('[PAYLOAD]', payload);
      console.groupEnd();

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const rawText = await response.text();
      
      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      try {
        const rawJson = JSON.parse(rawText);
        const parsedResponse = this.normalizeResponse(rawJson);
        logger.log('ai', '[AI RESPONSE] Success Normalized');
        console.groupEnd();
        return parsedResponse;
      } catch (parseError) {
        return this.normalizeResponse({ text: rawText });
      }
    } catch (error: any) {
      console.error('[AI ERROR DETAILS]', error);
      console.groupEnd();
      throw error;
    }
  }

  private static normalizeResponse(data: any): AIResponse {
    const isSuccess = data.success !== false;
    
    return {
      success: isSuccess,
      summary: data.summary || data.text || "Анализ завершен",
      verdict: data.verdict || null,
      trend: data.trend || "STABLE",
      recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
      nextSteps: Array.isArray(data.nextSteps) ? data.nextSteps : [],
      tacticalPlan: Array.isArray(data.tacticalPlan) ? data.tacticalPlan : [],
      suggestedEvents: Array.isArray(data.suggestedEvents) ? data.suggestedEvents : [],
      followupQuestions: Array.isArray(data.followupQuestions) ? data.followupQuestions : [],
      motivation: data.motivation || null,
      insights: Array.isArray(data.insights) ? data.insights : [],
      trends: Array.isArray(data.trends) ? data.trends : [],
      warnings: Array.isArray(data.warnings) ? data.warnings : [],
      overallProgress: typeof data.overallProgress === 'number' ? data.overallProgress : 0,
      mainRisk: data.mainRisk || null,
      date: data.date || new Date().toISOString()
    };
  }

  private static getSystemPrompt(type: AIActionType): string {
    if (type === AIActionType.EXERCISE_COACH || type === AIActionType.WORKOUT_COACH) {
      return `${SYSTEM_PROMPT_BASE}\n\nТы сейчас работаешь в режиме "Полевого Коуча". Атлет находится прямо на тренировке. 
      Отвечай максимально коротко, технически точно и с учетом его травм и текущей программы. 
      Если он просит замену — подбери идеальный аналог по биомеханике. 
      Всегда возвращай JSON.`;
    }
    return `${SYSTEM_PROMPT_BASE}\n\n${COACH_PROMPT}\n\nCURRENT ACTION: ${type}`;
  }
}
