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
      qq?: {
        enabled: boolean;
        httpPort: number;
        wsUrl?: string;
        qqNumber?: string;
        token?: string;
      };
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
      qq: {
        enabled: false,
        httpPort: 3001,
        wsUrl: 'ws://localhost:3001',
      },
      wechat: {
        enabled: false,
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

function parseEnvBool(val: string | undefined, defaultVal: boolean): boolean {
  if (val === undefined) return defaultVal;
  return val === 'true' || val === '1';
}

function parseEnvInt(val: string | undefined, defaultVal: number): number {
  if (val === undefined) return defaultVal;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? defaultVal : parsed;
}

export function loadConfig(): AppConfig {
  const config: AppConfig = JSON.parse(JSON.stringify(defaultConfig));

  if (process.env.OLLAMA_BASE_URL) {
    config.llm.providers.ollama!.baseUrl = process.env.OLLAMA_BASE_URL;
  }
  if (process.env.OLLAMA_MODEL) {
    config.llm.providers.ollama!.model = process.env.OLLAMA_MODEL;
  }
  if (process.env.OLLAMA_TIMEOUT) {
    config.llm.providers.ollama!.timeout = parseEnvInt(process.env.OLLAMA_TIMEOUT, 120000);
  }

  config.im.adapters.qq!.enabled = parseEnvBool(process.env.QQ_ENABLED, false);
  if (process.env.QQ_HTTP_PORT) {
    config.im.adapters.qq!.httpPort = parseEnvInt(process.env.QQ_HTTP_PORT, 3001);
  }
  if (process.env.QQ_WS_URL) {
    config.im.adapters.qq!.wsUrl = process.env.QQ_WS_URL;
  }
  if (process.env.QQ_NUMBER) {
    config.im.adapters.qq!.qqNumber = process.env.QQ_NUMBER;
  }
  if (process.env.QQ_TOKEN) {
    config.im.adapters.qq!.token = process.env.QQ_TOKEN;
  }

  if (process.env.LOG_LEVEL) {
    const validLevels = ['debug', 'info', 'warn', 'error'];
    if (validLevels.includes(process.env.LOG_LEVEL)) {
      process.env.LOG_LEVEL = process.env.LOG_LEVEL;
    }
  }

  if (process.env.SERVER_PORT) {
    config.server.port = parseEnvInt(process.env.SERVER_PORT, 3000);
  }

  if (process.env.MAX_MESSAGES) {
    config.storage.maxMessages = parseEnvInt(process.env.MAX_MESSAGES, 20);
  }

  if (process.env.CHAT_PREFIX) {
    config.chat.groupPrefix = process.env.CHAT_PREFIX;
  }

  if (process.env.PRIVATE_AUTO_REPLY) {
    config.chat.privateAutoReply = parseEnvBool(process.env.PRIVATE_AUTO_REPLY, true);
  }

  if (process.env.GROUP_AI_TRIGGER) {
    const valid = ['at', 'mention', 'both'];
    if (valid.includes(process.env.GROUP_AI_TRIGGER)) {
      config.chat.groupAiTrigger = process.env.GROUP_AI_TRIGGER as 'at' | 'mention' | 'both';
    }
  }

  return config;
}
