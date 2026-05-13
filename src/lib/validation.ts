export const VALIDATION_LIMITS = {
  workout: {
    duration: { min: 5, max: 300, label: 'длительность' },
    calories: { min: 0, max: 5000, label: 'калории' },
    title: { minLength: 3, maxLength: 50, label: 'название' }
  },
  weight: {
    value: { min: 30, max: 300, label: 'вес' }
  },
  goal: {
    title: { minLength: 5, maxLength: 100, label: 'название цели' }
  }
};

export const isValidTitle = (title: string): boolean => {
  const trimmed = title.trim();
  if (trimmed.length < 3) return false;
  // Reject garbage like "111" or "ыыыы" if it's too short and repetitive?
  // Actually, minLength 3 covers a lot. Let's add a regex for at least one letter or digit that isn't just symbols.
  return /[a-zA-Zа-яА-Я0-9]/.test(trimmed);
};

export const validateNumeric = (value: number | string, limits: { min: number; max: number }): string | null => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 'Введите корректное число';
  if (num < limits.min) return `Минимальное значение: ${limits.min}`;
  if (num > limits.max) return `Максимальное значение: ${limits.max}`;
  return null;
};
