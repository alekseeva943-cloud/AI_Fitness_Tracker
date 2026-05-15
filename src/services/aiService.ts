import { FitnessState, AIAnalysis } from '../types';
import { AIOrchestrator } from '../ai/orchestrator/ai-orchestrator';
import { AIActionType } from '../ai/orchestrator/types';
import { logger } from '../lib/logger';

export class AIService {
  static async analyzeProgress(state: FitnessState, analytics: any): Promise<AIAnalysis> {
    logger.log('ai', 'Delegating analysis to AIOrchestrator');
    
    const response = await AIOrchestrator.executeAction(state, analytics, {
      actionType: AIActionType.DEEP_ANALYSIS
    });

    return {
      id: Math.random().toString(36).substring(2, 11),
      date: new Date().toISOString(),
      ...response
    } as AIAnalysis;
  }
}

