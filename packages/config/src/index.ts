export interface AppConfig {
  app: {
    host: string;
    port: number;
  };
  qq: {
    enabled: boolean;
    httpPort: number;
    wsUrl: string;
    qqNumber?: string;
    token?: string;
  };
  llm: {
    provider: 'alibaba' | 'ollama' | 'mock';
    alibaba: {
      apiKey: string;
      baseUrl: string;
      model: string;
      timeout: number;
    };
    ollama: {
      baseUrl: string;
      model: string;
      timeout: number;
    };
    mock: Record<string, never>;
  };
  session: {
    storage: 'sqlite' | 'memory';
    sqlite: {
      dbPath: string;
    };
    memory: {
      maxMessages: number;
    };
    maxMessages: number;
  };
  trigger: {
    privateAutoReply: boolean;
    groupPrefix: string;
    groupAiTrigger: 'at' | 'mention' | 'both';
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
  };
}

export const defaultConfig: AppConfig = {
  app: {
    host: '0.0.0.0',
    port: 3000,
  },
  qq: {
    enabled: false,
    httpPort: 3001,
    wsUrl: 'ws://localhost:3001',
  },
  llm: {
    provider: 'alibaba',
    alibaba: {
      apiKey: '',
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      model: 'qwen-plus',
      timeout: 120000,
    },
    ollama: {
      baseUrl: 'http://localhost:11434',
      model: 'qwen2.5:7b',
      timeout: 120000,
    },
    mock: {},
  },
  session: {
    storage: 'sqlite',
    sqlite: {
      dbPath: './data/sessions.db',
    },
    memory: {
      maxMessages: 20,
    },
    maxMessages: 100,
  },
  trigger: {
    privateAutoReply: true,
    groupPrefix: '/ai',
    groupAiTrigger: 'both',
  },
  logging: {
    level: 'info',
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

  if (process.env.APP_HOST) config.app.host = process.env.APP_HOST;
  if (process.env.APP_PORT) config.app.port = parseEnvInt(process.env.APP_PORT, 3000);

  config.qq.enabled = parseEnvBool(process.env.QQ_ENABLED, false);
  if (process.env.QQ_HTTP_PORT) config.qq.httpPort = parseEnvInt(process.env.QQ_HTTP_PORT, 3001);
  if (process.env.QQ_WS_URL) config.qq.wsUrl = process.env.QQ_WS_URL;
  if (process.env.QQ_NUMBER) config.qq.qqNumber = process.env.QQ_NUMBER;
  if (process.env.QQ_TOKEN) config.qq.token = process.env.QQ_TOKEN;

  if (process.env.LLM_PROVIDER) {
    if (process.env.LLM_PROVIDER === 'alibaba' || process.env.LLM_PROVIDER === 'ollama' || process.env.LLM_PROVIDER === 'mock') {
      config.llm.provider = process.env.LLM_PROVIDER;
    }
  }
  if (process.env.ALIBABA_API_KEY) config.llm.alibaba.apiKey = process.env.ALIBABA_API_KEY;
  if (process.env.ALIBABA_BASE_URL) config.llm.alibaba.baseUrl = process.env.ALIBABA_BASE_URL;
  if (process.env.ALIBABA_MODEL) config.llm.alibaba.model = process.env.ALIBABA_MODEL;
  if (process.env.ALIBABA_TIMEOUT) config.llm.alibaba.timeout = parseEnvInt(process.env.ALIBABA_TIMEOUT, 120000);
  if (process.env.OLLAMA_BASE_URL) config.llm.ollama.baseUrl = process.env.OLLAMA_BASE_URL;
  if (process.env.OLLAMA_MODEL) config.llm.ollama.model = process.env.OLLAMA_MODEL;
  if (process.env.OLLAMA_TIMEOUT) config.llm.ollama.timeout = parseEnvInt(process.env.OLLAMA_TIMEOUT, 120000);

  if (process.env.SESSION_STORAGE) {
    if (process.env.SESSION_STORAGE === 'sqlite' || process.env.SESSION_STORAGE === 'memory') {
      config.session.storage = process.env.SESSION_STORAGE;
    }
  }
  if (process.env.SQLITE_DB_PATH) config.session.sqlite.dbPath = process.env.SQLITE_DB_PATH;
  if (process.env.MAX_MESSAGES) config.session.maxMessages = parseEnvInt(process.env.MAX_MESSAGES, 100);
  if (process.env.SESSION_MAX_MESSAGES) config.session.maxMessages = parseEnvInt(process.env.SESSION_MAX_MESSAGES, 100);

  if (process.env.CHAT_PREFIX) config.trigger.groupPrefix = process.env.CHAT_PREFIX;
  if (process.env.PRIVATE_AUTO_REPLY !== undefined) config.trigger.privateAutoReply = parseEnvBool(process.env.PRIVATE_AUTO_REPLY, true);
  if (process.env.GROUP_AI_TRIGGER) {
    const valid = ['at', 'mention', 'both'];
    if (valid.includes(process.env.GROUP_AI_TRIGGER)) {
      config.trigger.groupAiTrigger = process.env.GROUP_AI_TRIGGER as 'at' | 'mention' | 'both';
    }
  }

  if (process.env.LOG_LEVEL) {
    const validLevels = ['debug', 'info', 'warn', 'error'];
    if (validLevels.includes(process.env.LOG_LEVEL)) {
      config.logging.level = process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error';
    }
  }

  return config;
}
