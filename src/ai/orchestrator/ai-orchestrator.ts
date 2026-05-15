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
      
      const payload = {
        actionType,
        systemPrompt,
        userPrompt,
        provider: 'openai'
      };

      console.group('[AI TRANSPORT]');
      console.log('[FETCH CONFIG]', {
        url: '/api/ai',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        payloadSize: JSON.stringify(payload).length
      });
      console.log('[PAYLOAD]', payload);
      console.groupEnd();

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('[FETCH RESPONSE STATUS]', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      });

      const rawText = await response.text();
      console.log('[RAW RESPONSE FROM SERVER]', rawText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(rawText);
        } catch (e) {
          errorData = { error: rawText || 'Sync failed' };
        }
        
        console.error('[AI PROVIDER ERROR RESPONSE]', errorData);
        throw new Error(errorData.error || `Server Error: ${response.status}`);
      }

      try {
        const parsedResponse = JSON.parse(rawText) as AIResponse;
        logger.log('ai', '[AI RESPONSE] Success');
        console.groupEnd();
        return parsedResponse;
      } catch (parseError) {
        console.error('[AI RESPONSE PARSE ERROR]', parseError);
        throw new Error('Failed to parse AI response as JSON');
      }
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
