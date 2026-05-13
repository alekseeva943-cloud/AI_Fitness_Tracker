
/**
 * Global theme constants for the AI Fitness application.
 * Centralizing colors and styles ensures consistency across modules.
 */

export const THEME = {
  colors: {
    primary: '#DFFF00', // Neon Yellow
    secondary: '#00FFCC', // Cyan
    background: {
      light: '#f9fafb', // Soft background for light mode
      dark: '#09090b',  // Zinc-950 for dark mode
    },
    accent: '#fb923c', // Orange for calories
    duration: '#60a5fa', // Blue for time
    success: '#4ade80',
    error: '#ef4444',
    warning: '#facc15',
  },
  typography: {
    display: 'font-display',
    sans: 'font-sans',
    mono: 'font-mono',
  },
  borderRadius: {
    card: '2.5rem',
    button: '1rem',
    input: '1.25rem',
  },
  transitions: {
    default: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    slow: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  shadows: {
    neon: '0 0 20px rgba(223, 255, 0, 0.15)',
    premium: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  }
};
