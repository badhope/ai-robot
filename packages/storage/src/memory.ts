import type { SessionMessage, SessionStore } from '@ai-robot/core';

export interface MemorySessionStoreConfig {
  maxMessages?: number;
}

export class MemorySessionStore implements SessionStore {
  private sessions = new Map<string, SessionMessage[]>();
  private maxMessages: number;

  constructor(config: MemorySessionStoreConfig = {}) {
    this.maxMessages = config.maxMessages || 20;
  }

  async getSession(sessionId: string): Promise<SessionMessage[]> {
    return this.sessions.get(sessionId) || [];
  }

  async appendMessage(sessionId: string, message: SessionMessage): Promise<void> {
    const messages = await this.getSession(sessionId);
    messages.push(message);

    if (messages.length > this.maxMessages) {
      messages.splice(0, messages.length - this.maxMessages);
    }

    this.sessions.set(sessionId, messages);
  }

  async clearSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }
}
