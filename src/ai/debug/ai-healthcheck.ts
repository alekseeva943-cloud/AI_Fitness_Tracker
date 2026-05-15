import { logger } from '../../lib/logger';

export interface AIStatus {
  online: boolean;
  provider: string;
  latency: number;
  error?: string;
  lastChecked: string;
}

export class AIHealthCheck {
  static async check(): Promise<AIStatus> {
    const start = Date.now();
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'HEALTH_CHECK',
          systemPrompt: 'Respond with a JSON object: {"status": "ok"}',
          userPrompt: 'ping',
          provider: 'openai'
        })
      });

      const latency = Date.now() - start;

      if (response.ok) {
        return {
          online: true,
          provider: 'openai',
          latency,
          lastChecked: new Date().toISOString()
        };
      } else {
        const err = await response.json().catch(() => ({ error: 'Sync failed' }));
        return {
          online: false,
          provider: 'openai',
          latency,
          error: err.error,
          lastChecked: new Date().toISOString()
        };
      }
    } catch (error: any) {
      return {
        online: false,
        provider: 'none',
        latency: Date.now() - start,
        error: error.message,
        lastChecked: new Date().toISOString()
      };
    }
  }
}
