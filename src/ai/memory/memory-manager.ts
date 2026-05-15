import { AIAnalysis } from '../../types';
import { logger } from '../../lib/logger';

interface AIMemoryState {
  longTermInsights: string[];
  lastDeepAnalysisDate: string | null;
  recurringIssues: string[];
}

export class AIMemoryManager {
  static async updateMemory(analyses: AIAnalysis[]): Promise<AIMemoryState> {
    logger.log('ai', '[AI MEMORY] Syncing history for memory extraction');
    
    // In a real app, this would summarize old analyses to keep token counts low
    // For now, we return a structured summary of the last few analyses
    const recent = analyses.slice(0, 5);
    
    return {
      longTermInsights: this.extractInsights(recent),
      lastDeepAnalysisDate: analyses[0]?.date || null,
      recurringIssues: this.identifyPatterns(recent)
    };
  }

  private static extractInsights(analyses: AIAnalysis[]): string[] {
    // Logic to extract recurring positive trends
    return analyses
      .filter(a => a.trend === 'IMPROVING')
      .map(a => a.summary)
      .slice(0, 3);
  }

  private static identifyPatterns(analyses: AIAnalysis[]): string[] {
    // Logic to identify recurring risks or plateaus
    return analyses
      .filter(a => a.trend === 'STAGNATING' || a.trend === 'DECLINING')
      .map(a => a.mainRisk || '')
      .filter(Boolean)
      .slice(0, 3);
  }
}
