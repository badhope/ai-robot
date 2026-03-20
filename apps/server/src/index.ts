import { HttpWechatAdapter } from '@ai-robot/wechat-adapter';
import { OllamaProvider } from '@ai-robot/ollama-adapter';
import { MockIMAdapter } from '@ai-robot/im-adapters';
import { MockLLMProvider } from '@ai-robot/llm-adapters';
import { MemorySessionStore } from '@ai-robot/storage';
import { logger } from '@ai-robot/logger';
import { buildSessionId } from '@ai-robot/shared';
import type { ChatMessageEvent, ChatReply, IMAdapter, LLMProvider } from '@ai-robot/core';
import { SimpleProviderSelector } from './selector.js';
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
  private selector: SimpleProviderSelector;
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
    } else if (this.config.im.adapters.wechat?.enabled) {
      this.adapter = new HttpWechatAdapter();
    } else {
      this.adapter = new MockIMAdapter();
    }

    this.selector = new SimpleProviderSelector(this.llmProvider);
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

    const sessionId = buildSessionId(event.platform, event.roomId || '', event.senderId);

    await this.sessionStore.appendMessage(sessionId, {
      role: 'user',
      content: messageText,
      timestamp: event.timestamp,
    });

    const history = await this.sessionStore.getSession(sessionId);

    const provider = await this.selector.select({ event });

    try {
      const response = await provider.generate({
        systemPrompt: this.config.chat.systemPrompt,
        messages: history.map(m => ({ role: m.role, content: m.content })),
      });

      const reply: ChatReply = {
        text: response.content,
        replyToMessageId: event.messageId,
      };

      await this.adapter.sendReply(event, reply);

      await this.sessionStore.appendMessage(sessionId, {
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
      });

      logger.info(`[Reply] sent to ${event.senderId}: ${response.content.substring(0, 50)}...`);
    } catch (error) {
      logger.error(`Failed to generate response:`, error);

      const errorReply: ChatReply = {
        text: '抱歉，AI 服务暂时不可用，请稍后重试。',
        replyToMessageId: event.messageId,
      };
      await this.adapter.sendReply(event, errorReply);
    }
  }

  getAdapter(): IMAdapter {
    return this.adapter;
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
