import { AIActionType, AIActionOptions, AIResponse } from './types';
import { FitnessState } from '../../types';
import { AIContextBuilder } from '../context/context-builder';

import {
  SYSTEM_PROMPT_BASE,
  WORKOUT_COACH_PROMPT,
  EXERCISE_CHAT_PROMPT,
  DASHBOARD_COACH_PROMPT
} from '../prompts/coach';

import { validateAIContext } from '../validation/context-validator';
import { logger } from '../../lib/logger';

export class AIOrchestrator {

  static async executeAction(
    state: FitnessState,
    analytics: any,
    options: AIActionOptions
  ): Promise<AIResponse> {

    const { actionType, userMessage } = options;

    console.group(`[AI PIPELINE] ${actionType}`);

    logger.log(
      'ai',
      `[AI REQUEST START] ${new Date().toISOString()}`
    );

    try {

      logger.log(
        'ai',
        '[AI CONTEXT BUILT] Starting context assembly...'
      );

      let context = await AIContextBuilder.buildUserContext(
        state,
        analytics
      );

      logger.log(
        'ai',
        '[AI CONTEXT VALIDATION] Validating context shape...'
      );

      context = validateAIContext(context);

      const contextStr =
        AIContextBuilder.formatContextForPrompt(
          context,
          options.contextOverride
        );

      logger.log(
        'ai',
        `[AI CONTEXT BUILT] Success. Length: ${contextStr.length} chars`
      );

      const systemPrompt =
        this.getSystemPrompt(actionType);

      logger.log(
        'ai',
        `[AI PROMPT BUILT] Mode: ${actionType}`
      );

      const userPrompt = userMessage
        ? `
=== КОНТЕКСТ ===

${contextStr}

=== ТЕКУЩИЙ ВОПРОС ПОЛЬЗОВАТЕЛЯ ===

${userMessage}

ВАЖНО:
- Ответь ИМЕННО на последний вопрос пользователя.
- Не меняй тему.
- Не уходи в общие рекомендации.
- Если пользователь спрашивает "как?" — объясни технику.
- Если пользователь пишет про боль — адаптируй упражнение.
`
        : `
Проанализируй текущую ситуацию пользователя
как его персональный coach.

${contextStr}
`;

      logger.log(
        'ai',
        '[AI PROVIDER START] Calling server API /api/ai...'
      );

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
        throw new Error(
          `Server Error: ${response.status}`
        );
      }

      try {

        const rawJson = JSON.parse(rawText);

        const parsedResponse =
          this.normalizeResponse(rawJson);

        logger.log(
          'ai',
          '[AI RESPONSE] Success Normalized'
        );

        console.groupEnd();

        return parsedResponse;

      } catch {

        logger.log(
          'ai',
          '[AI RESPONSE] Plain text response'
        );

        return this.normalizeResponse({
          text: rawText
        });
      }

    } catch (error: any) {

      console.error(
        '[AI ERROR DETAILS]',
        error
      );

      console.groupEnd();

      throw error;
    }
  }

  private static normalizeResponse(data: any): AIResponse {

    const isSuccess =
      data.success !== false;

    return {
      success: isSuccess,

      summary:
        data.summary ||
        data.text ||
        "Анализ завершен",

      verdict:
        data.verdict || null,

      trend:
        data.trend || "STABLE",

      recommendations:
        Array.isArray(data.recommendations)
          ? data.recommendations
          : [],

      nextSteps:
        Array.isArray(data.nextSteps)
          ? data.nextSteps
          : [],

      tacticalPlan:
        Array.isArray(data.tacticalPlan)
          ? data.tacticalPlan
          : [],

      suggestedEvents:
        Array.isArray(data.suggestedEvents)
          ? data.suggestedEvents
          : [],

      followupQuestions:
        Array.isArray(data.followupQuestions)
          ? data.followupQuestions
          : [],

      motivation:
        data.motivation || null,

      insights:
        Array.isArray(data.insights)
          ? data.insights
          : [],

      trends:
        Array.isArray(data.trends)
          ? data.trends
          : [],

      warnings:
        Array.isArray(data.warnings)
          ? data.warnings
          : [],

      overallProgress:
        typeof data.overallProgress === 'number'
          ? data.overallProgress
          : 0,

      mainRisk:
        data.mainRisk || null,

      date:
        data.date || new Date().toISOString()
    };
  }

  private static getSystemPrompt(
    type: AIActionType
  ): string {

    switch (type) {

      case AIActionType.WORKOUT_COACH:

        return `
${SYSTEM_PROMPT_BASE}

${WORKOUT_COACH_PROMPT}
`;

      case AIActionType.EXERCISE_COACH:

        return `
${SYSTEM_PROMPT_BASE}

${WORKOUT_COACH_PROMPT}

${EXERCISE_CHAT_PROMPT}
`;

      default:

        return `
${SYSTEM_PROMPT_BASE}

${DASHBOARD_COACH_PROMPT}

CURRENT ACTION: ${type}
`;
    }
  }
}

