import { AIService } from "../aiService";
import { useFitnessStore } from "../../store/useFitnessStore";
import { AIError, ERROR_MESSAGES } from "../errors/AppError";
import { FitnessAnalysisSummary } from "../../features/analytics/types/analytics";
import { logger } from "../../lib/logger";

/**
 * Centered Request Manager for AI interactions.
 * Handles loading states, errors, and store synchronization.
 */
export const AIRequestManager = {
  async performDeepAnalysis(summary: FitnessAnalysisSummary) {
    const store = useFitnessStore.getState();
    logger.ai('Starting Deep Analysis request', { summary });
    
    // Check if already loading
    if (store.analysisRequest.status === 'loading') {
      logger.warn('Analysis attempt while already loading');
      return;
    }

    store.setAnalysisRequestState({ status: 'loading', error: null });

    try {
      const state = store; // Use current state for analysis
      const analysis = await AIService.analyzeProgress(state, summary);
      
      logger.ai('Analysis successful', { analysis });
      store.addAIAnalysis(analysis);
      store.setAnalysisRequestState({ 
        status: 'success', 
        error: null,
        lastUpdated: Date.now() 
      });
      
      return analysis;
    } catch (error: any) {
      logger.error('Analysis request failed', error);
      const errorMessage = error.message.includes('API') 
        ? ERROR_MESSAGES.AI_INVALID_KEY 
        : ERROR_MESSAGES.GENERIC;
        
      const aiError = new AIError(
        errorMessage,
        'ANALYSIS_FAILED',
        error
      );

      store.setAnalysisRequestState({ 
        status: 'error', 
        error: aiError.message 
      });
      
      throw aiError;
    }
  }
};
