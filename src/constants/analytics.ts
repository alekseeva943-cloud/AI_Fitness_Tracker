/**
 * Constants for the analytics engine.
 */

export const ANALYTICS_CONSTANTS = {
  WEIGHT: {
    MAX_VELOCITY: 0.3, // Max 0.3 kg/day
    PLATEAU_THRESHOLD: 0.1, // Minimum change to be considered non-plateau (kg/week)
    MIN_VELOCITY_FOR_FORECAST: 0.01, // Minimum absolute velocity for date estimation (kg/day)
    OUTLIER_THRESHOLD: 0.15, // Max 15% change from previous measurement to be considered a jump
    SMOOTHING_WINDOW: 5, // Number of samples for smoothing
    RECENT_WEIGHT: 0.3, // Weight for short-term trend in blended velocity
    TOTAL_WEIGHT: 0.7, // Weight for long-term trend in blended velocity
  },
  GOAL: {
    MAX_FORECAST_DAYS: 730, // 2 years max forecast
    STAGNANT_DAYS_THRESHOLD: 14, // Days behind schedule to be considered "behind"
  },
  WORKOUT: {
    TARGET_WEEKLY_FREQUENCY: 4,
  }
};
