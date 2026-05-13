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
export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Formats weights with precision.
 */
export function formatWeight(val: number): string {
  if (val === undefined || val === null || isNaN(val)) return '--';
  return Number(val).toFixed(1) + ' кг';
}

/**
 * Formats trend velocity (kg/week).
 */
export function formatVelocity(val: number): string {
  if (val === undefined || val === null || isNaN(val)) return '--';
  const perWeek = val * 7;
  const sign = perWeek > 0 ? '+' : '';
  return sign + perWeek.toFixed(1) + ' кг/нед';
}

/**
 * Formats percentages.
 */
export function formatPercent(val: number): string {
  if (val === undefined || isNaN(val)) return '0%';
  return Math.round(val) + '%';
}
