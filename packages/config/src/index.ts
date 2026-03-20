export interface AppConfig {
  server: {
    port: number;
    host: string;
  };
  llm: {
    defaultProvider: string;
    providers: Record<string, {
      type: 'ollama' | 'openai' | 'claude';
      baseUrl?: string;
      apiKey?: string;
      model?: string;
    }>;
  };
  im: {
    adapters: Array<{
      platform: 'wechat' | 'qq';
      enabled: boolean;
      config?: Record<string, unknown>;
    }>;
  };
  storage: {
    type: 'memory' | 'redis';
    redis?: {
      host: string;
      port: number;
    };
  };
}

export const defaultConfig: AppConfig = {
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  llm: {
    defaultProvider: 'mock',
    providers: {},
  },
  im: {
    adapters: [],
  },
  storage: {
    type: 'memory',
  },
};

export function loadConfig(): AppConfig {
  return defaultConfig;
}
