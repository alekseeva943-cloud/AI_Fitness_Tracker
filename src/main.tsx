import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { logger } from './lib/logger';

logger.log('system', 'Root initialization starting...');

// Global error handlers for debugging white screens
window.onerror = (message, source, lineno, colno, error) => {
  logger.error('Global Error Detected', { message, source, lineno, colno, error });
};

window.onunhandledrejection = (event) => {
  logger.error('Unhandled Promise Rejection', { reason: event.reason });
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
