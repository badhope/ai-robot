import type { ChatMessageEvent, IMAdapter, ChatReply } from '@ai-robot/core';
import { createLoggerWithPrefix } from '@ai-robot/logger';
import { generateId } from '@ai-robot/shared';

const logger = createLoggerWithPrefix('MockIMAdapter');

export class MockIMAdapter implements IMAdapter {
  name = 'MockIMAdapter';
  platform = 'mock' as const;
  private messageHandler: ((event: ChatMessageEvent) => Promise<void>) | null = null;
  private running = false;

  async start(): Promise<void> {
    this.running = true;
    logger.info('Mock IM adapter started');
  }

  async stop(): Promise<void> {
    this.running = false;
    logger.info('Mock IM adapter stopped');
  }

  async sendReply(event: ChatMessageEvent, reply: ChatReply): Promise<void> {
    logger.info(`[${event.platform}:${event.chatType}] Sending reply to ${event.senderId}: ${reply.text}`);
  }

  onMessage(handler: (event: ChatMessageEvent) => Promise<void>): void {
    this.messageHandler = handler;
  }

  async simulateMessage(text: string, senderId: string = 'mock-user', senderName: string = 'Mock User'): Promise<void> {
    if (!this.running || !this.messageHandler) {
      throw new Error('Adapter not started or no message handler registered');
    }

    const event: ChatMessageEvent = {
      platform: 'wechat',
      chatType: 'private',
      messageId: generateId(),
      senderId,
      senderName,
      text,
      timestamp: Date.now(),
    };

    logger.info(`Simulating message from ${senderName}: ${text}`);
    await this.messageHandler(event);
  }
}
