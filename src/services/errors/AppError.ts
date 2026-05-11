export class AppError extends Error {
  constructor(
    public message: string,
    public code: string = 'UNKNOWN_ERROR',
    public originalError?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AIError extends AppError {
  constructor(message: string, code: string = 'AI_ERROR', originalError?: any) {
    super(message, code, originalError);
    this.name = 'AIError';
  }
}

export const ERROR_MESSAGES = {
  AI_OFFLINE: 'ИИ временно недоступен. Проверьте подключение к сети.',
  AI_TIMEOUT: 'Время ожидания ответа от ИИ истекло.',
  AI_INVALID_KEY: 'Ошибка конфигурации API. Обратитесь в поддержку.',
  DATA_INCONSISTENT: 'Недостаточно данных для анализа.',
  GENERIC: 'Произошла непредвиденная ошибка. Попробуйте позже.',
};
