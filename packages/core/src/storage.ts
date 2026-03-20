export interface SessionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface SessionStore {
  getSession(sessionId: string): Promise<SessionMessage[]>;
  appendMessage(sessionId: string, message: SessionMessage): Promise<void>;
  clearSession(sessionId: string): Promise<void>;
}
