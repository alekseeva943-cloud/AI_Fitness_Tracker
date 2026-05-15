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
  addAIAnalysis: (analysis: AIAnalysis) => void;
  setAnalysisRequestState: (requestState: Partial<RequestState>) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChatHistory: () => void;
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
  addAIAnalysis: (analysis) => set((state: any) => ({
    analyses: [analysis, ...state.analyses].slice(0, 50)
  })),
  setAnalysisRequestState: (requestState) => set((state: any) => ({
    analysisRequest: { ...state.analysisRequest, ...requestState }
  })),
  addChatMessage: (message) => set((state: any) => ({
    chatMessages: [...state.chatMessages, message].slice(-50)
  })),
  clearChatHistory: () => set({ chatMessages: [] }),
});
