import { NapCatQQAdapter } from '@ai-robot/qq-adapter';
import { OllamaProvider } from '@ai-robot/ollama-adapter';
import { MockIMAdapter } from '@ai-robot/im-adapters';
import { MockLLMProvider } from '@ai-robot/llm-adapters';
import { MemorySessionStore } from '@ai-robot/storage';
import { logger } from '@ai-robot/logger';
import { buildSessionId } from '@ai-robot/shared';
import type { ChatMessageEvent, IMAdapter, LLMProvider } from '@ai-robot/core';
import { shouldTriggerAI, cleanGroupMessage } from './trigger.js';
import { loadConfig, type AppConfig } from '@ai-robot/config';

interface ServerOptions {
  config?: AppConfig;
  adapter?: IMAdapter;
  provider?: LLMProvider;
}

class ChatServer {
  private adapter: IMAdapter;
  private llmProvider: LLMProvider;
  private sessionStore: MemorySessionStore;
  private config: AppConfig;

  constructor(options: ServerOptions = {}) {
    this.config = options.config || loadConfig();
    this.sessionStore = new MemorySessionStore({
      maxMessages: this.config.storage.maxMessages || 20,
    });

    if (options.provider) {
      this.llmProvider = options.provider;
    } else if (this.config.llm.defaultProvider === 'ollama') {
      const ollamaConfig = this.config.llm.providers.ollama;
      this.llmProvider = new OllamaProvider({
        baseUrl: ollamaConfig?.baseUrl || 'http://localhost:11434',
        model: ollamaConfig?.model || 'qwen2.5:7b',
        timeout: ollamaConfig?.timeout || 120000,
      });
    } else {
      this.llmProvider = new MockLLMProvider();
    }

    if (options.adapter) {
      this.adapter = options.adapter;
    } else if (this.config.im.adapters.qq?.enabled) {
      this.adapter = new NapCatQQAdapter({
        httpPort: this.config.im.adapters.qq.httpPort,
        wsUrl: this.config.im.adapters.qq.wsUrl,
        qqNumber: this.config.im.adapters.qq.qqNumber,
        token: this.config.im.adapters.qq.token,
      });
    } else {
      this.adapter = new MockIMAdapter();
    }
  }

  async start(): Promise<void> {
    logger.info('Starting Chat Server...');

    this.adapter.onMessage(this.handleMessage.bind(this));
    await this.adapter.start();

    logger.info('Chat Server started successfully');
  }

  async stop(): Promise<void> {
    await this.adapter.stop();
    logger.info('Chat Server stopped');
  }

  private async handleMessage(event: ChatMessageEvent): Promise<void> {
    if (!shouldTriggerAI(event, this.config.chat)) {
      logger.debug(`Message ignored: ${event.messageId}`);
      return;
    }

    logger.info(`[Message] ${event.platform}:${event.chatType} from ${event.senderName}: ${event.text.substring(0, 50)}`);

    let messageText = event.text;
    if (event.chatType === 'group') {
      messageText = cleanGroupMessage(event.text, this.config.chat);
    }

    const sessionId = buildSessionId(event.platform, event.roomId, event.senderId);
    const history = await this.sessionStore.getSession(sessionId);

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
    if (this.config.chat.systemPrompt) {
      messages.push({ role: 'system', content: this.config.chat.systemPrompt });
    }
    for (const msg of history) {
      messages.push({ role: msg.role, content: msg.content });
    }
    messages.push({ role: 'user', content: messageText });

    try {
      const response = await this.llmProvider.generate({ messages });

      logger.info(`[AI Response] ${response.content.substring(0, 50)}...`);

      await this.adapter.sendReply(event, { text: response.content });

      await this.sessionStore.appendMessage(sessionId, { role: 'user', content: messageText, timestamp: Date.now() });
      await this.sessionStore.appendMessage(sessionId, { role: 'assistant', content: response.content, timestamp: Date.now() });
    } catch (error) {
      logger.error(`Error generating response: ${error}`);
      await this.adapter.sendReply(event, { text: '抱歉，发生了错误。' });
    }
  }

  getProvider(): LLMProvider {
    return this.llmProvider;
  }
}

async function main() {
  const config = loadConfig();

  logger.info('Initializing Chat Server with config:', {
    provider: config.llm.defaultProvider,
    model: config.llm.providers.ollama?.model,
    storage: config.storage.type,
    qqEnabled: config.im.adapters.qq?.enabled,
  });

  const server = new ChatServer({ config });

  process.on('SIGINT', async () => {
    logger.info('Shutting down...');
    await server.stop();
    process.exit(0);
  });

  await server.start();
}

export { ChatServer, main, type ServerOptions };

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
