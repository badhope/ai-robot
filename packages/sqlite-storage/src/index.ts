import type { SessionMessage, SessionStore } from '@ai-robot/core';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface SQLiteSessionStoreConfig {
  dbPath?: string;
  maxMessages?: number;
}

export class SQLiteSessionStore implements SessionStore {
  private db: Database.Database;
  private maxMessages: number;

  constructor(config: SQLiteSessionStoreConfig = {}) {
    const dbPath = config.dbPath || path.resolve(__dirname, '../../data/sessions.db');
    const dir = path.dirname(dbPath);
    
    if (dir && dir !== '.' && dir !== '') {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    this.db = new Database(dbPath);
    this.maxMessages = config.maxMessages || 100;

    this.initSchema();
  }

  private initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      );
      
      CREATE INDEX IF NOT EXISTS idx_session_id ON sessions(session_id);
      CREATE INDEX IF NOT EXISTS idx_timestamp ON sessions(session_id, timestamp);
    `);
  }

  async getSession(sessionId: string): Promise<SessionMessage[]> {
    const stmt = this.db.prepare(`
      SELECT role, content, timestamp 
      FROM sessions 
      WHERE session_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    
    const rows = stmt.all(sessionId, this.maxMessages) as Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
      timestamp: number;
    }>;
    
    return rows.reverse();
  }

  async appendMessage(sessionId: string, message: SessionMessage): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO sessions (session_id, role, content, timestamp)
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run(sessionId, message.role, message.content, message.timestamp || Date.now());
    
    this.pruneSession(sessionId);
  }

  private pruneSession(sessionId: string): void {
    const countStmt = this.db.prepare('SELECT COUNT(*) as count FROM sessions WHERE session_id = ?');
    const { count } = countStmt.get(sessionId) as { count: number };
    
    if (count > this.maxMessages) {
      const deleteStmt = this.db.prepare(`
        DELETE FROM sessions 
        WHERE session_id = ? 
        AND id IN (
          SELECT id FROM sessions 
          WHERE session_id = ? 
          ORDER BY timestamp ASC 
          LIMIT ?
        )
      `);
      deleteStmt.run(sessionId, sessionId, count - this.maxMessages);
    }
  }

  async clearSession(sessionId: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM sessions WHERE session_id = ?');
    stmt.run(sessionId);
  }

  close(): void {
    this.db.close();
  }
}
