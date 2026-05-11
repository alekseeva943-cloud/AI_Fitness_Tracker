import { StateCreator } from 'zustand';
import { AIAnalysis } from '../../types';
import { RequestState, INITIAL_REQUEST_STATE } from '../../types/requests';

export interface AISlice {
  analyses: AIAnalysis[];
  analysisRequest: RequestState;
  addAIAnalysis: (analysis: AIAnalysis) => void;
  setAnalysisRequestState: (requestState: Partial<RequestState>) => void;
}

export const createAISlice: StateCreator<
  any,
  [],
  [],
  AISlice
> = (set) => ({
  analyses: [],
  analysisRequest: INITIAL_REQUEST_STATE,
  addAIAnalysis: (analysis) => set((state: any) => ({
    analyses: [analysis, ...state.analyses].slice(0, 50)
  })),
  setAnalysisRequestState: (requestState) => set((state: any) => ({
    analysisRequest: { ...state.analysisRequest, ...requestState }
  })),
});
