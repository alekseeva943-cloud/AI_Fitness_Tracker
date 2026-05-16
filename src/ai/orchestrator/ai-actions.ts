import { AIOrchestrator } from './ai-orchestrator';
import { AIActionType } from './types';
import { useFitnessStore } from '../../store/useFitnessStore';
import { selectAnalyticsSummary } from '../../features/analytics/selectors/fitnessSelectors';
import { logger } from '../../lib/logger';
import { ChatMessage } from '../../store/slices/aiSlice';

const generateId = () => Math.random().toString(36).substring(2, 11);

export class AIActions {
  static async startDeepAnalysis() {
    const store = useFitnessStore.getState();
    const summary = selectAnalyticsSummary(store);
    
    if (!summary) throw new Error('Недостаточно данных для глубокого анализа. Добавьте ещё немного замеров (минимум 3).');

    store.setAnalysisRequestState({ status: 'loading', error: null });

    try {
      const response = await AIOrchestrator.executeAction(store, summary, {
        actionType: AIActionType.DEEP_ANALYSIS
      });

      const analysis = {
        id: generateId(),
        date: new Date().toISOString(),
        ...response
      } as any;

      store.addAIAnalysis(analysis);
      store.setAnalysisRequestState({ status: 'success' });
      
      return analysis;
    } catch (error: any) {
      store.setAnalysisRequestState({ status: 'error', error: error.message });
      throw error;
    }
  }

  static async askQuestion(question: string) {
    const store = useFitnessStore.getState();
    const summary = selectAnalyticsSummary(store);
    
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: question,
      timestamp: new Date().toISOString()
    };
    
    store.addChatMessage(userMsg);
    store.setAnalysisRequestState({ status: 'loading' });

    try {
      const response = await AIOrchestrator.executeAction(store, summary, {
        actionType: AIActionType.QUICK_QUESTION,
        userMessage: question
      });

      const aiMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response.summary,
        timestamp: new Date().toISOString(),
        metadata: response
      };

      store.addChatMessage(aiMsg);
      store.setAnalysisRequestState({ status: 'success' });
      
      return response;
    } catch (error: any) {
      store.setAnalysisRequestState({ status: 'error', error: error.message });
      throw error;
    }
  }

  static async getContextualGoalInsight(goalId: string, question: string) {
    const store = useFitnessStore.getState();
    const summary = selectAnalyticsSummary(store);
    const goal = store.goals.find(g => g.id === goalId);

    if (!goal) return null;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: question,
      timestamp: new Date().toISOString()
    };
    
    store.addChatMessage(userMsg, goalId);

    try {
      const response = await AIOrchestrator.executeAction(store, summary, {
        actionType: AIActionType.GOAL_STRATEGY,
        userMessage: `Goal: ${goal.title}. Context: ${question}. Focus on giving actionable advice.`
      });

      const aiMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response.summary,
        timestamp: new Date().toISOString(),
        metadata: response
      };

      store.addChatMessage(aiMsg, goalId);
      return response;
    } catch (error) {
       logger.error('Goal insight failed', error);
       return null;
    }
  }
}
