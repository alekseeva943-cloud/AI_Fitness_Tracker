import { StateCreator } from 'zustand';
import { AIAnalysis } from '../../types';
import { RequestState, INITIAL_REQUEST_STATE } from '../../types/requests';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: any;
}

export interface AISlice {
  analyses: AIAnalysis[];
  analysisRequest: RequestState;
  chatMessages: ChatMessage[];
  goalChatMessages: Record<string, ChatMessage[]>;
  addAIAnalysis: (analysis: AIAnalysis) => void;
  setAnalysisRequestState: (requestState: Partial<RequestState>) => void;
  addChatMessage: (message: ChatMessage, goalId?: string) => void;
  clearChatHistory: (goalId?: string) => void;
}

export const createAISlice: StateCreator<
  any,
  [],
  [],
  AISlice
> = (set) => ({
  analyses: [],
  analysisRequest: INITIAL_REQUEST_STATE,
  chatMessages: [],
  goalChatMessages: {},
  addAIAnalysis: (analysis) => set((state: any) => ({
    analyses: [analysis, ...state.analyses].slice(0, 50)
  })),
  setAnalysisRequestState: (requestState) => set((state: any) => ({
    analysisRequest: { ...state.analysisRequest, ...requestState }
  })),
  addChatMessage: (message, goalId) => set((state: any) => {
    if (goalId) {
      const history = state.goalChatMessages[goalId] || [];
      return {
        goalChatMessages: {
          ...state.goalChatMessages,
          [goalId]: [...history, message].slice(-50)
        }
      };
    }
    return {
      chatMessages: [...state.chatMessages, message].slice(-50)
    };
  }),
  clearChatHistory: (goalId) => set((state: any) => {
    if (goalId) {
      return {
        goalChatMessages: {
          ...state.goalChatMessages,
          [goalId]: []
        }
      };
    }
    return { chatMessages: [] };
  }),
});
