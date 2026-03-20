import type { SessionMessage, SessionStore } from '@ai-robot/core';

export class MemorySessionStore implements SessionStore {
  private sessions = new Map<string, SessionMessage[]>();

  async getSession(sessionId: string): Promise<SessionMessage[]> {
    return this.sessions.get(sessionId) || [];
  }

  async appendMessage(sessionId: string, message: SessionMessage): Promise<void> {
    const messages = await this.getSession(sessionId);
    messages.push(message);
    this.sessions.set(sessionId, messages);
  }

  async clearSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }
}
