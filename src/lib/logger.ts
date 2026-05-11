type LogLevel = 'info' | 'warn' | 'error' | 'success';

class Logger {
  private isEnabled = true;

  private formatMessage(group: string, message: string) {
    return `[${group.toUpperCase()}] ${message}`;
  }

  private group(name: string, content: () => void) {
    if (!this.isEnabled) return;
    console.group(`%c ${name.toUpperCase()} `, 'background: #DFFF00; color: #000; font-weight: bold; border-radius: 4px;');
    content();
    console.groupEnd();
  }

  log(group: string, message: any, data?: any) {
    if (!this.isEnabled) return;
    console.log(
      `%c ${group.toUpperCase()} %c ${message}`,
      'background: #333; color: #DFFF00; font-weight: bold; padding: 2px 4px; border-radius: 2px;',
      'color: inherit;',
      data || ''
    );
  }

  ai(message: string, data?: any) {
    this.log('ai', message, data);
  }

  store(message: string, data?: any) {
    this.log('store', message, data);
  }

  router(message: string, data?: any) {
    this.log('router', message, data);
  }

  error(message: string, data?: any) {
    console.error(`[ERROR] ${message}`, data || '');
  }

  warn(message: string, data?: any) {
    console.warn(`[WARN] ${message}`, data || '');
  }
}

export const logger = new Logger();
