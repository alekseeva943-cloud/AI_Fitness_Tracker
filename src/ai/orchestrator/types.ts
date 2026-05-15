export enum AIActionType {
  DEEP_ANALYSIS = 'DEEP_ANALYSIS',
  GOAL_STRATEGY = 'GOAL_STRATEGY',
  QUICK_QUESTION = 'QUICK_QUESTION',
  RECOVERY_ANALYSIS = 'RECOVERY_ANALYSIS',
  PLATEAU_BREAKER = 'PLATEAU_BREAKER',
  NUTRITION_AUDIT = 'NUTRITION_AUDIT',
}

export interface AIActionOptions {
  actionType: AIActionType;
  contextOverride?: any;
  userMessage?: string;
}

export interface AIResponse {
  summary: string;
  trend?: 'IMPROVING' | 'STAGNATING' | 'DECLINING';
  explanation?: string;
  mainRisk?: string;
  forecast?: string;
  recommendations: {
    type: string;
    text: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    reason?: string;
  }[];
  confidence?: number;
  reasoning?: string;
}
