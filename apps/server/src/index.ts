import { MockIMAdapter } from '@ai-robot/im-adapters';
import { MockLLMProvider } from '@ai-robot/llm-adapters';
import { MemorySessionStore } from '@ai-robot/storage';
import { logger } from '@ai-robot/logger';
import { buildSessionId } from '@ai-robot/shared';
import type { ChatMessageEvent, ChatReply } from '@ai-robot/core';
import { SimpleProviderSelector } from './selector.js';

class ChatServer {
  private imAdapter: MockIMAdapter;
  private llmProvider: MockLLMProvider;
  private sessionStore: MemorySessionStore;
  private selector: SimpleProviderSelector;

  constructor() {
    this.imAdapter = new MockIMAdapter();
    this.llmProvider = new MockLLMProvider();
    this.sessionStore = new MemorySessionStore();
    this.selector = new SimpleProviderSelector(this.llmProvider);
  }

  async start(): Promise<void> {
    logger.info('Starting Chat Server...');

    this.imAdapter.onMessage(this.handleMessage.bind(this));
    await this.imAdapter.start();

    logger.info('Chat Server started successfully');
  }

  async stop(): Promise<void> {
    await this.imAdapter.stop();
    logger.info('Chat Server stopped');
  }

  private async handleMessage(event: ChatMessageEvent): Promise<void> {
    logger.info(`[Message] ${event.platform}:${event.chatType} from ${event.senderId}: ${event.text}`);

    const sessionId = buildSessionId(event.platform, event.roomId, event.senderId);

    await this.sessionStore.appendMessage(sessionId, {
      role: 'user',
      content: event.text,
      timestamp: event.timestamp,
    });

    const history = await this.sessionStore.getSession(sessionId);

    const provider = await this.selector.select({ event });

    const response = await provider.generate({
      messages: history.map(m => ({ role: m.role, content: m.content })),
    });

    const reply: ChatReply = {
      text: response.content,
      replyToMessageId: event.messageId,
    };

    await this.imAdapter.sendReply(event, reply);

    await this.sessionStore.appendMessage(sessionId, {
      role: 'assistant',
      content: response.content,
      timestamp: Date.now(),
    });
  }

  getAdapter(): MockIMAdapter {
    return this.imAdapter;
  }
}

async function main() {
  const server = new ChatServer();

  await server.start();

  const adapter = server.getAdapter();

  await new Promise(resolve => setTimeout(resolve, 500));

  await adapter.simulateMessage('Hello, bot!', 'user-001', 'Test User');

  await new Promise(resolve => setTimeout(resolve, 1000));

  await server.stop();

  logger.info('Demo completed');
}

main().catch(console.error);
