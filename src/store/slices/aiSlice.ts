import { StateCreator } from 'zustand';
import { AIAnalysis, AIMemory, BehavioralPattern } from '../../types';
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
  aiMemory: AIMemory;
  addAIAnalysis: (analysis: AIAnalysis) => void;
  setAnalysisRequestState: (requestState: Partial<RequestState>) => void;
  addChatMessage: (message: ChatMessage, goalId?: string) => void;
  clearChatHistory: (goalId?: string) => void;
  updateAIMemory: (memory: Partial<AIMemory>) => void;
  addBehavioralPattern: (pattern: BehavioralPattern) => void;
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
  aiMemory: {
    patterns: [],
    coachingStyle: 'SUPPORTIVE',
    userNotes: []
  },
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
  updateAIMemory: (memory) => set((state: any) => ({
    aiMemory: { ...state.aiMemory, ...memory }
  })),
  addBehavioralPattern: (pattern) => set((state: any) => ({
    aiMemory: {
      ...state.aiMemory,
      patterns: [pattern, ...state.aiMemory.patterns].slice(0, 20)
    }
  })),
});
