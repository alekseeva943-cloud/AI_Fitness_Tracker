export const AI_CONFIG = {
  MODEL: "gemini-3-flash-preview",
  TEMPERATURE: 0.7,
  MAX_TOKENS: 2048,
};

export enum AI_RECOMMENDATION_TYPE {
  EXERCISE = "EXERCISE",
  DIET = "DIET",
  REST = "REST",
  MOTIVATION = "MOTIVATION",
}

export enum AI_TREND {
  IMPROVING = "IMPROVING",
  STAGNATING = "STAGNATING",
  DECLINING = "DECLINING",
}

export enum AI_PRIORITY {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}
