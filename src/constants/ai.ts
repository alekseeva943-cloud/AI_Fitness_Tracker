export const AI_CONFIG = {
  MODEL: "gemini-1.5-flash", // Using high-speed stable model
  TEMPERATURE: 0.2, // Lower temperature for more deterministic analysis
  MAX_TOKENS: 4096,
  RETRY_COUNT: 2,
  TIMEOUT: 30000,
};

export enum AI_RECOMMENDATION_TYPE {
  TRAINING = "EXERCISE",
  NUTRITION = "DIET",
  RECOVERY = "REST",
  CONSISTENCY = "MOTIVATION",
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
