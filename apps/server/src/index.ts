import 'dotenv/config';
import { NapCatQQAdapter } from '@ai-robot/qq-adapter';
import { OllamaProvider } from '@ai-robot/ollama-adapter';
import { AlibabaProvider } from '@ai-robot/alibaba-adapter';
import { MockIMAdapter } from '@ai-robot/im-adapters';
import { MockLLMProvider } from '@ai-robot/llm-adapters';
import { MemorySessionStore } from '@ai-robot/storage';
import { logger } from '@ai-robot/logger';
import { buildSessionId } from '@ai-robot/shared';
import type { ChatMessageEvent, IMAdapter, LLMProvider, SessionStore } from '@ai-robot/core';
import { shouldTriggerAI, cleanGroupMessage } from './trigger.js';
import { handleCommand, isCommand } from './commands.js';
import { loadConfig, type AppConfig } from '@ai-robot/config';

interface ServerOptions {
  config?: AppConfig;
  adapter?: IMAdapter;
  provider?: LLMProvider;
  sessionStore?: SessionStore;
}

async function createSessionStore(config: AppConfig, options?: { sessionStore?: SessionStore }): Promise<SessionStore> {
  if (options?.sessionStore) {
    return options.sessionStore;
  }

  if (config.session.storage === 'sqlite') {
    try {
      const { SQLiteSessionStore } = await import('@ai-robot/sqlite-storage');
      return new SQLiteSessionStore({
        dbPath: config.session.sqlite.dbPath,
        maxMessages: config.session.maxMessages,
      });
    } catch (error) {
      logger.warn('SQLite storage unavailable, falling back to memory storage');
      return new MemorySessionStore({ maxMessages: config.session.maxMessages });
    }
  }

  return new MemorySessionStore({
    maxMessages: config.session.memory.maxMessages,
  });
}

class ChatServer {
  private adapter: IMAdapter;
  private llmProvider: LLMProvider;
  private sessionStore: SessionStore;
  private config: AppConfig;

  constructor(options: ServerOptions = {}) {
    this.config = options.config || loadConfig();

    this.sessionStore = new MemorySessionStore({
      maxMessages: this.config.session.memory.maxMessages,
    });

    if (options.provider) {
      this.llmProvider = options.provider;
    } else if (this.config.llm.provider === 'alibaba') {
      this.llmProvider = new AlibabaProvider({
        apiKey: this.config.llm.alibaba.apiKey,
        baseUrl: this.config.llm.alibaba.baseUrl,
        model: this.config.llm.alibaba.model,
        timeout: this.config.llm.alibaba.timeout,
      });
    } else if (this.config.llm.provider === 'ollama') {
      this.llmProvider = new OllamaProvider({
        baseUrl: this.config.llm.ollama.baseUrl,
        model: this.config.llm.ollama.model,
        timeout: this.config.llm.ollama.timeout,
      });
    } else {
      this.llmProvider = new MockLLMProvider();
    }

    if (options.adapter) {
      this.adapter = options.adapter;
    } else if (this.config.qq.enabled) {
      this.adapter = new NapCatQQAdapter({
        httpPort: this.config.qq.httpPort,
        wsUrl: this.config.qq.wsUrl,
        qqNumber: this.config.qq.qqNumber,
        token: this.config.qq.token,
      });
    } else {
      this.adapter = new MockIMAdapter();
    }

    if (options.sessionStore) {
      this.sessionStore = options.sessionStore;
    }
  }

  async init(): Promise<void> {
    if (!this.sessionStore || this.sessionStore instanceof MemorySessionStore) {
      this.sessionStore = await createSessionStore(this.config, { sessionStore: this.sessionStore });
    }
  }

  async start(): Promise<void> {
    logger.info('Starting Chat Server...');
    logger.info(`QQ adapter: ${this.config.qq.enabled ? 'enabled' : 'disabled'}`);
    logger.info(`LLM provider: ${this.config.llm.provider}`);
    logger.info(`Session storage: ${this.config.session.storage}`);

    this.adapter.onMessage(this.handleMessage.bind(this));
    
    try {
      await this.adapter.start();
      logger.info('Adapter started successfully');
    } catch (error) {
      logger.error(`Failed to start adapter: ${error}`);
      throw error;
    }

    try {
      const healthOk = await this.llmProvider.healthCheck();
      if (healthOk) {
        logger.info('LLM provider health check passed');
      } else {
        logger.warn('LLM provider health check failed');
      }
    } catch (error) {
      logger.warn(`LLM provider not available: ${error}`);
    }

    logger.info('Chat Server started successfully');
  }

  async stop(): Promise<void> {
    await this.adapter.stop();
    if (this.sessionStore && 'close' in this.sessionStore) {
      (this.sessionStore as { close: () => void }).close();
    }
    logger.info('Chat Server stopped');
  }

  private async handleMessage(event: ChatMessageEvent): Promise<void> {
    const sessionId = buildSessionId(event.platform, event.roomId, event.senderId);
    logger.debug(`[Message] ${event.messageId} from ${event.senderName}`);

    const text = event.text?.trim() || '';
    if (!text) {
      logger.debug('[Message] Empty message ignored');
      return;
    }

    const isGroup = event.chatType === 'group';

    if (isCommand(text)) {
      const result = await handleCommand(event, {
        sessionId,
        clearSession: (id) => this.sessionStore.clearSession(id),
        sendReply: (replyText) => this.adapter.sendReply(event, { text: replyText }),
      });

      if (result.handled) {
        logger.info(`[Command] handled: ${text}`);
        await this.adapter.sendReply(event, { text: result.response! });
        return;
      }
    }

    if (!shouldTriggerAI(event, this.config.trigger)) {
      logger.debug(`[Trigger] message ignored: ${event.messageId}`);
      return;
    }

    logger.info(`[Trigger] AI activated for ${event.platform}:${event.chatType} from ${event.senderName}`);

    let messageText = text;
    if (isGroup) {
      messageText = cleanGroupMessage(text, this.config.trigger);
    }

    const history = await this.sessionStore.getSession(sessionId);

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
    for (const msg of history) {
      messages.push({ role: msg.role, content: msg.content });
    }
    messages.push({ role: 'user', content: messageText });

    try {
      logger.debug(`[LLM] generating response (${messages.length} messages in context)`);
      const response = await this.llmProvider.generate({ messages });

      logger.info(`[LLM] response received: ${response.content.substring(0, 50)}...`);

      await this.adapter.sendReply(event, { text: response.content });

      await this.sessionStore.appendMessage(sessionId, { role: 'user', content: messageText, timestamp: Date.now() });
      await this.sessionStore.appendMessage(sessionId, { role: 'assistant', content: response.content, timestamp: Date.now() });
    } catch (error) {
      logger.error(`[LLM] Error: ${error}`);
      
      let errorMessage = '抱歉，发生了错误。';
      if (error instanceof Error) {
        if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
          errorMessage = 'AI 服务暂时不可用，请稍后再试。';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'AI 响应超时，请稍后再试。';
        } else if (error.message.includes('model')) {
          errorMessage = 'AI 模型配置错误。';
        }
      }
      
      await this.adapter.sendReply(event, { text: errorMessage });
    }
  }

  getProvider(): LLMProvider {
    return this.llmProvider;
  }

  getSessionStore(): SessionStore {
    return this.sessionStore;
  }
}

async function main() {
  const config = loadConfig();

  logger.info('='.repeat(50));
  logger.info('AI Robot Server v0.1.0');
  logger.info('='.repeat(50));

  if (!config.qq.enabled && config.llm.provider === 'mock') {
    logger.warn('Warning: Both QQ and LLM provider are disabled. Server will run in mock mode.');
  }

  const server = new ChatServer({ config });

  process.on('SIGINT', async () => {
    logger.info('Shutting down...');
    await server.stop();
    process.exit(0);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled rejection: ${reason}`);
  });

  try {
    await server.init();
    await server.start();
  } catch (error) {
    logger.error(`Failed to start server: ${error}`);
    process.exit(1);
  }
}

export { ChatServer, main, type ServerOptions };

const isMain = process.argv[1]?.endsWith('index.js') || process.argv[1]?.includes('server');
if (isMain) {
  main().catch((error) => {
    logger.error(`Fatal error: ${error}`);
    process.exit(1);
  });
}
