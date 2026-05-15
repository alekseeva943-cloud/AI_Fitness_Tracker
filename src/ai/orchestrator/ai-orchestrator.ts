import { AIActionType, AIActionOptions, AIResponse } from './types';
import { FitnessState } from '../../types';
import { AIContextBuilder } from '../context/context-builder';
import { MINIMAL_ANALYST_PROMPT } from '../prompts/minimal';
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

      const contextStr = AIContextBuilder.formatContextForPrompt(context);
      logger.log('ai', `[AI CONTEXT BUILT] Success. Length: ${contextStr.length} chars`);

      logger.log('ai', '[AI PROMPT BUILT] Using minimal stable prompts');
      const systemPrompt = MINIMAL_ANALYST_PROMPT;
      
      const userPrompt = userMessage 
        ? `USER QUESTION: ${userMessage}\n\nCONTEXT:\n${contextStr}`
        : `Analyze this data:\n${contextStr}`;

      logger.log('ai', '[AI PROVIDER START] Calling server API /api/ai...');
      
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionType,
          systemPrompt,
          userPrompt,
          provider: 'openai'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Sync failed' }));
        console.error('[AI PROVIDER ERROR]', errorData);
        throw new Error(errorData.error || `Server Error: ${response.status}`);
      }

      const parsedResponse = await response.json() as AIResponse;
      logger.log('ai', '[AI RESPONSE] Success');
      
      console.groupEnd();
      return parsedResponse;
    } catch (error: any) {
      console.error('[AI ERROR DETAILS]', {
        message: error.message,
        stack: error.stack,
        duration: Date.now() - startTime
      });
      console.groupEnd();
      throw error;
    }
  }

  private static getSystemPrompt(type: AIActionType): string {
    return MINIMAL_ANALYST_PROMPT;
  }
}
