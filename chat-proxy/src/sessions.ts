import {randomUUID} from 'crypto';
import type {ChatMessage} from './types.js';

interface Session {
  id: string;
  messages: ChatMessage[];
  pageUrl?: string;
  createdAt: number;
  lastActiveAt: number;
}

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_SESSIONS = 10_000;
const MAX_EXCHANGES = 8; // keep last 8 exchanges (16 messages)

const sessions = new Map<string, Session>();

// Periodic cleanup
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.lastActiveAt > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }
}, CLEANUP_INTERVAL_MS);

function evictOldest(): void {
  if (sessions.size <= MAX_SESSIONS) return;
  let oldestId: string | null = null;
  let oldestTime = Infinity;
  for (const [id, session] of sessions) {
    if (session.lastActiveAt < oldestTime) {
      oldestTime = session.lastActiveAt;
      oldestId = id;
    }
  }
  if (oldestId) sessions.delete(oldestId);
}

export function getOrCreateSession(sessionId?: string): {session: Session; isNew: boolean} {
  if (sessionId) {
    const existing = sessions.get(sessionId);
    if (existing) {
      existing.lastActiveAt = Date.now();
      return {session: existing, isNew: false};
    }
  }

  // Create new session
  evictOldest();
  const session: Session = {
    id: randomUUID(),
    messages: [],
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  };
  sessions.set(session.id, session);
  return {session, isNew: true};
}

/**
 * Append new messages to session and return the sliding window for the LLM.
 * Keeps last MAX_EXCHANGES exchanges (user+assistant pairs).
 */
export function appendAndWindow(
  session: Session,
  newMessages: ChatMessage[],
): ChatMessage[] {
  // Append only truly new messages (client sends full history, we keep last few)
  session.messages = newMessages;

  // Sliding window: keep last MAX_EXCHANGES * 2 messages
  const maxMessages = MAX_EXCHANGES * 2;
  if (session.messages.length > maxMessages) {
    session.messages = session.messages.slice(-maxMessages);
  }

  return session.messages;
}

export function clearSessionMessages(sessionId: string): boolean {
  const session = sessions.get(sessionId);
  if (!session) return false;
  session.messages = [];
  session.pageUrl = undefined;
  session.lastActiveAt = Date.now();
  return true;
}

/**
 * Check if page context should be re-injected.
 * Returns true on first request or when the page URL changes.
 * Updates session.pageUrl after the check so the *next* call can compare.
 */
export function shouldInjectPageContext(session: Session, pageUrl?: string): boolean {
  if (!pageUrl) return true; // no URL to compare, always inject
  const changed = session.pageUrl !== pageUrl;
  session.pageUrl = pageUrl; // update *after* comparison
  return changed || !session.pageUrl; // first time (was undefined) or navigated
}

export function getSessionCount(): number {
  return sessions.size;
}

export interface SessionListItem {
  id: string;
  messageCount: number;
  createdAt: number;
  lastActiveAt: number;
  firstQuestion?: string;
}

export function listSessions(options?: {
  page?: number;
  pageSize?: number;
  agent?: string;
}): { sessions: SessionListItem[]; total: number } {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;

  let all = Array.from(sessions.values())
    .sort((a, b) => b.lastActiveAt - a.lastActiveAt);

  const total = all.length;
  const start = (page - 1) * pageSize;
  const paged = all.slice(start, start + pageSize);

  return {
    sessions: paged.map(s => ({
      id: s.id,
      messageCount: s.messages.length,
      createdAt: s.createdAt,
      lastActiveAt: s.lastActiveAt,
      firstQuestion: s.messages.find(m => m.role === 'user')?.content?.slice(0, 100),
    })),
    total,
  };
}

export function getSession(id: string) {
  return sessions.get(id);
}
