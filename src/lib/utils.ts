import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for merging Tailwind classes effectively.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats dates for the fitness app.
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Formats weights with precision.
 */
export function formatWeight(val: number): string {
  if (val === undefined || isNaN(val)) return '--';
  return val.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' кг';
}

/**
 * Formats trend velocity (kg/week).
 */
export function formatVelocity(val: number): string {
  if (val === undefined || isNaN(val)) return '--';
  const sign = val > 0 ? '+' : '';
  return sign + val.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' кг/нед';
}

/**
 * Formats percentages.
 */
export function formatPercent(val: number): string {
  if (val === undefined || isNaN(val)) return '0%';
  return Math.round(val) + '%';
}
