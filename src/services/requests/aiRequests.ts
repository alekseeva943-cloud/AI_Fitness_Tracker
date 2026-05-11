import { AIService } from "../aiService";
import { useFitnessStore } from "../../store/useFitnessStore";
import { AIError, ERROR_MESSAGES } from "../errors/AppError";
import { FitnessAnalysisSummary } from "../../features/analytics/types/analytics";

/**
 * Centered Request Manager for AI interactions.
 * Handles loading states, errors, and store synchronization.
 */
export const AIRequestManager = {
  async performDeepAnalysis(summary: FitnessAnalysisSummary) {
    const store = useFitnessStore.getState();
    
    // Check if already loading
    if (store.analysisRequest.status === 'loading') return;

    store.setAnalysisRequestState({ status: 'loading', error: null });

    try {
      const state = store; // Use current state for analysis
      const analysis = await AIService.analyzeProgress(state, summary);
      
      store.addAIAnalysis(analysis);
      store.setAnalysisRequestState({ 
        status: 'success', 
        error: null,
        lastUpdated: Date.now() 
      });
      
      return analysis;
    } catch (error: any) {
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
