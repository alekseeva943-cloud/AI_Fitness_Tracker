import React, { ErrorInfo } from 'react';
import { logger } from '../lib/logger';
import { RU } from '../constants';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { GradientButton } from './ui/GradientButton';

interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Uncaught error:', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="glass rounded-[2.5rem] p-12 max-w-lg w-full text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-display font-medium text-foreground">
                {RU.COMMON?.ERROR || 'Что-то пошло не так'}
              </h1>
              <p className="text-muted-foreground text-sm">
                Приложение столкнулось с непредвиденной ошибкой. Пожалуйста, попробуйте перезагрузить страницу.
              </p>
            </div>
            {this.state.error && (
              <pre className="p-4 bg-black/20 rounded-2xl text-[10px] font-mono text-left overflow-auto max-h-32 opacity-50">
                {this.state.error.message}
              </pre>
            )}
            <GradientButton 
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Обновить страницу
            </GradientButton>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
