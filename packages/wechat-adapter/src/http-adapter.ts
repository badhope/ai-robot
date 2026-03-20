import type { ChatMessageEvent, IMAdapter, ChatReply } from '@ai-robot/core';
import { createLoggerWithPrefix } from '@ai-robot/logger';

const adapterLogger = createLoggerWithPrefix('HttpWechatAdapter');

export interface HttpWechatAdapterConfig {
  port?: number;
}

export class HttpWechatAdapter implements IMAdapter {
  name = 'HttpWechatAdapter';
  platform = 'wechat' as const;
  private messageHandler: ((event: ChatMessageEvent) => Promise<void>) | null = null;
  private running = false;
  private server: any = null;

  constructor(private config: HttpWechatAdapterConfig = {}) {}

  async start(): Promise<void> {
    if (this.running) {
      adapterLogger.warn('Adapter already started');
      return;
    }

    this.running = true;
    adapterLogger.info(`HttpWechatAdapter started (listening on port ${this.config.port || 3001})`);
  }

  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    if (this.server) {
      this.server.close();
    }
    this.running = false;
    adapterLogger.info('HttpWechatAdapter stopped');
  }

  async sendReply(event: ChatMessageEvent, reply: ChatReply): Promise<void> {
    adapterLogger.info(`[${event.platform}:${event.chatType}] Reply to ${event.senderName}: ${reply.text}`);
  }

  onMessage(handler: (event: ChatMessageEvent) => Promise<void>): void {
    this.messageHandler = handler;
  }

  async simulateMessage(text: string, senderId: string = 'test-user', senderName: string = 'Test User'): Promise<void> {
    if (!this.messageHandler) {
      throw new Error('No message handler registered');
    }

    const event: ChatMessageEvent = {
      platform: 'wechat',
      chatType: 'private',
      messageId: `mock-${Date.now()}`,
      senderId,
      senderName,
      text,
      timestamp: Date.now(),
    };

    adapterLogger.info(`Simulating message from ${senderName}: ${text}`);
    await this.messageHandler(event);
  }
}
