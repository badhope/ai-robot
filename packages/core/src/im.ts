export type Platform = 'wechat' | 'qq' | 'mock';

export type ChatType = 'private' | 'group';

export interface ChatMessageEvent {
  platform: Platform;
  chatType: ChatType;
  messageId: string;
  senderId: string;
  senderName?: string;
  roomId?: string;
  roomName?: string;
  text: string;
  mentions?: string[];
  isAt?: boolean;
  replyToMessageId?: string;
  timestamp: number;
  raw?: unknown;
}

export interface ChatReply {
  text: string;
  replyToMessageId?: string;
}

export interface IMAdapter {
  name: string;
  platform: Platform;
  start(): Promise<void>;
  stop(): Promise<void>;
  sendReply(event: ChatMessageEvent, reply: ChatReply): Promise<void>;
  onMessage(handler: (event: ChatMessageEvent) => Promise<void>): void;
}
