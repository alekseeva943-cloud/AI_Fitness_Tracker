/**
 * AI Configuration for the fitness tracker.
 * Using OpenAI as per specific user request.
 */
export const AI_CONFIG = {
  MODEL: 'gpt-4o-mini',
  TEMPERATURE: 0.7,
  SYSTEM_PROMPT: `Ты — эксперт фитнес-тренер и аналитик данных. 
Анализируй данные пользователя и давай рекомендации на РУССКОМ языке.
Отвечай только в формате JSON.`,
};
