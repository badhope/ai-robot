import type { ChatMessageEvent, IMAdapter, ChatReply } from '@ai-robot/core';
import { createLoggerWithPrefix } from '@ai-robot/logger';
import { generateId } from '@ai-robot/shared';

const logger = createLoggerWithPrefix('NapCatQQAdapter');

export interface NapCatQQConfig {
  httpPort: number;
  wsUrl?: string;
  qqNumber?: string;
  token?: string;
}

interface NapCatWSMessage {
  post_type: string;
  message_type?: string;
  sub_type?: string;
  user_id?: number;
  group_id?: number;
  group_name?: string;
  sender?: {
    nickname?: string;
    card?: string;
  };
  raw_message?: string;
  message_id?: number;
  message?: Array<{ type: string; text: string; data?: Record<string, unknown> }>;
  self_id?: number;
  time?: number;
}

export class NapCatQQAdapter implements IMAdapter {
  name = 'NapCatQQAdapter';
  platform = 'qq' as const;
  private config: NapCatQQConfig;
  private messageHandler: ((event: ChatMessageEvent) => Promise<void>) | null = null;
  private ws: WebSocket | null = null;
  private running = false;
  private selfId: number | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private readonly baseReconnectDelay = 1000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: NapCatQQConfig) {
    this.config = {
      wsUrl: config.wsUrl || 'ws://localhost:3001',
      httpPort: config.httpPort || 3001,
      qqNumber: config.qqNumber,
      token: config.token,
    };
  }

  async start(): Promise<void> {
    if (this.running) {
      logger.warn('Adapter already started');
      return;
    }

    this.running = true;
    this.connectWebSocket();
    logger.info(`NapCatQQAdapter starting... HTTP: ${this.config.httpPort}, WS: ${this.config.wsUrl}`);
  }

  async stop(): Promise<void> {
    if (!this.running) return;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.running = false;
    this.reconnectAttempts = 0;
    logger.info('NapCatQQAdapter stopped');
  }

  async sendReply(event: ChatMessageEvent, reply: ChatReply): Promise<void> {
    logger.info(`[${event.platform}:${event.chatType}] Reply to ${event.senderId}: ${reply.text}`);

    const chatId = event.chatType === 'group' ? event.roomId : event.senderId;
    if (!chatId) {
      logger.error('No chatId for sending reply');
      return;
    }

    try {
      const url = `http://localhost:${this.config.httpPort}/send`;
      const body: Record<string, unknown> = {
        message_type: event.chatType,
        message: reply.text,
      };

      if (event.chatType === 'group') {
        body.group_id = BigInt(chatId);
      } else {
        body.user_id = BigInt(chatId);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        logger.error(`Failed to send reply: ${response.status}`);
      }
    } catch (error) {
      logger.error(`Error sending reply: ${error}`);
    }
  }

  onMessage(handler: (event: ChatMessageEvent) => Promise<void>): void {
    this.messageHandler = handler;
  }

  private connectWebSocket(): void {
    if (!this.running) return;

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error(`Max reconnection attempts (${this.maxReconnectAttempts}) reached. Please check NapCatQQ status or restart the server manually.`);
      return;
    }

    try {
      this.ws = new WebSocket(this.config.wsUrl!);

      this.ws.onopen = () => {
        logger.info('WebSocket connected to NapCatQQ');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data) as NapCatWSMessage;
          await this.handleWSMessage(data);
        } catch (error) {
          logger.error(`Error parsing WS message: ${error}`);
        }
      };

      this.ws.onerror = (error) => {
        logger.error(`WebSocket error: ${error}`);
      };

      this.ws.onclose = () => {
        if (this.running && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = Math.min(this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
          logger.warn(`WebSocket disconnected, reconnecting in ${delay/1000}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          this.reconnectTimer = setTimeout(() => this.connectWebSocket(), delay);
        }
      };
    } catch (error) {
      if (this.running && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
        logger.error(`Failed to connect WebSocket, retrying in ${delay/1000}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}): ${error}`);
        this.reconnectTimer = setTimeout(() => this.connectWebSocket(), delay);
      }
    }
  }

  private async handleWSMessage(data: NapCatWSMessage): Promise<void> {
    if (data.post_type !== 'message') return;

    const messageType = data.message_type;
    if (messageType !== 'group' && messageType !== 'private') return;

    const isGroup = messageType === 'group';
    const senderId = data.user_id?.toString() || '';
    const senderName = data.sender?.nickname || data.sender?.card || `QQ_${senderId}`;
    const roomId = isGroup ? data.group_id?.toString() : undefined;
    const roomName = isGroup ? data.group_name : undefined;

    let text = '';
    let isAt = false;
    let mentions: string[] = [];

    if (data.raw_message) {
      text = data.raw_message;
    } else if (data.message) {
      const parts: string[] = [];
      for (const msg of data.message) {
        if (msg.type === 'text') {
          parts.push(msg.text);
        } else if (msg.type === 'at') {
          const atQq = msg.data?.qq;
          if (atQq && this.selfId && atQq.toString() === this.selfId.toString()) {
            isAt = true;
          }
          if (atQq) mentions.push(atQq.toString());
          parts.push(`@${atQq}`);
        }
      }
      text = parts.join('').trim();
    }

    if (!text) return;

    const event: ChatMessageEvent = {
      platform: 'qq',
      chatType: isGroup ? 'group' : 'private',
      messageId: data.message_id?.toString() || generateId(),
      senderId,
      senderName,
      roomId,
      roomName,
      text,
      mentions: mentions.length > 0 ? mentions : undefined,
      isAt,
      timestamp: data.time ? data.time * 1000 : Date.now(),
      raw: data,
    };

    if (this.messageHandler) {
      await this.messageHandler(event);
    }
  }
}
