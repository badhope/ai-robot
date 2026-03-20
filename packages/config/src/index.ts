export interface AppConfig {
  server: {
    port: number;
    host: string;
  };
  llm: {
    defaultProvider: 'ollama' | 'mock';
    providers: {
      ollama?: {
        baseUrl: string;
        model: string;
        timeout?: number;
      };
      mock?: Record<string, never>;
    };
  };
  im: {
    adapters: {
      wechat?: {
        enabled: boolean;
        puppetToken?: string;
      };
    };
  };
  storage: {
    type: 'memory';
    maxMessages?: number;
  };
  chat: {
    systemPrompt?: string;
    privateAutoReply: boolean;
    groupPrefix: string;
    groupAiTrigger: 'at' | 'mention' | 'both';
  };
}

export const defaultConfig: AppConfig = {
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  llm: {
    defaultProvider: 'ollama',
    providers: {
      ollama: {
        baseUrl: 'http://localhost:11434',
        model: 'qwen2.5:7b',
        timeout: 120000,
      },
    },
  },
  im: {
    adapters: {
      wechat: {
        enabled: true,
      },
    },
  },
  storage: {
    type: 'memory',
    maxMessages: 20,
  },
  chat: {
    systemPrompt: '你是一个有用的AI助手。',
    privateAutoReply: true,
    groupPrefix: '/ai',
    groupAiTrigger: 'both',
  },
};

export function loadConfig(): AppConfig {
  return defaultConfig;
}
