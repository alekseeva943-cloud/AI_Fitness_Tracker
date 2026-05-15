import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { logger } from './lib/logger';

logger.log('system', 'Root initialization starting...');

// Global error handlers for debugging white screens
window.onerror = (message, source, lineno, colno, error) => {
  console.group('[GLOBAL ERROR]');
  console.error('Message:', message);
  console.error('Source:', source);
  console.error('Line:', lineno, 'Column:', colno);
  console.error('Error object:', error);
  console.groupEnd();
  
  if (typeof logger !== 'undefined') {
    logger.error('Global Error Detected', { message, source, lineno, colno, error });
  }
};

window.onunhandledrejection = (event) => {
  console.group('[PROMISE ERROR]');
  console.error('Reason:', event.reason);
  console.groupEnd();

  if (typeof logger !== 'undefined') {
    logger.error('Unhandled Promise Rejection', { reason: event.reason });
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
