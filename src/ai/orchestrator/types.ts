export enum AIActionType {
  DEEP_ANALYSIS = 'DEEP_ANALYSIS',
  GOAL_STRATEGY = 'GOAL_STRATEGY',
  QUICK_QUESTION = 'QUICK_QUESTION',
  RECOVERY_ANALYSIS = 'RECOVERY_ANALYSIS',
  PLATEAU_BREAKER = 'PLATEAU_BREAKER',
  NUTRITION_AUDIT = 'NUTRITION_AUDIT',
  COACH_CHAT = 'COACH_CHAT',
}

export interface AIActionOptions {
  actionType: AIActionType;
  contextOverride?: any;
  userMessage?: string;
}

export interface AIResponse {
  summary: string;
  verdict?: string;
  trend?: 'IMPROVING' | 'STAGNATING' | 'DECLINING' | 'STABLE';
  explanation?: string;
  mainRisk?: string | null;
  forecast?: string;
  recommendations: {
    type: string;
    text: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    reason?: string;
    action?: {
      label: string;
      id: string; // e.g. "NAVIGATE_NUTRITION", "CREATE_WORKOUT"
    };
  }[];
  nextSteps?: string[];
  tacticalPlan?: { title: string; description: string; isCompleted: boolean }[];
  suggestedEvents?: any[];
  followupQuestions?: string[];
  motivation?: string;
  confidence?: number;
  reasoning?: string;
  insights?: string[];
  trends?: string[];
  warnings?: string[];
  overallProgress?: number;
  date?: string;
  success?: boolean;
}
