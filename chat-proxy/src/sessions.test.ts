import {describe, it, expect, vi, beforeEach} from 'vitest';
import {getOrCreateSession, appendAndWindow, clearSessionMessages, shouldInjectPageContext} from './sessions.js';

describe('getOrCreateSession', () => {
  it('creates new session when no ID provided', () => {
    const {session, isNew} = getOrCreateSession();
    expect(isNew).toBe(true);
    expect(session.id).toBeTruthy();
    expect(typeof session.id).toBe('string');
  });

  it('returns existing session by ID', () => {
    const {session: first} = getOrCreateSession();
    const {session: second, isNew} = getOrCreateSession(first.id);
    expect(isNew).toBe(false);
    expect(second.id).toBe(first.id);
  });

  it('updates lastActiveAt on access', () => {
    const {session: first} = getOrCreateSession();
    const originalTime = first.lastActiveAt;
    vi.advanceTimersByTime(1000);
    const {session: second} = getOrCreateSession(first.id);
    expect(second.lastActiveAt).toBeGreaterThanOrEqual(originalTime);
  });

  it('creates new session when ID not found', () => {
    const {session, isNew} = getOrCreateSession('nonexistent-id');
    expect(isNew).toBe(true);
    expect(session.id).not.toBe('nonexistent-id');
  });
});

describe('appendAndWindow', () => {
  it('stores messages correctly', () => {
    const {session} = getOrCreateSession();
    const messages = [
      {role: 'user' as const, content: 'Hello'},
      {role: 'assistant' as const, content: 'Hi there'},
    ];
    const result = appendAndWindow(session, messages);
    expect(result).toHaveLength(2);
    expect(result[0].content).toBe('Hello');
  });

  it('applies sliding window at 16 messages', () => {
    const {session} = getOrCreateSession();
    // Create 20 messages (10 exchanges)
    const messages = Array.from({length: 20}, (_, i) => ({
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: `Message ${i}`,
    }));
    const result = appendAndWindow(session, messages);
    // Should keep only last 16 messages
    expect(result).toHaveLength(16);
    expect(result[0].content).toBe('Message 4');
    expect(result[15].content).toBe('Message 19');
  });

  it('keeps all messages when under window limit', () => {
    const {session} = getOrCreateSession();
    const messages = Array.from({length: 10}, (_, i) => ({
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: `Message ${i}`,
    }));
    const result = appendAndWindow(session, messages);
    expect(result).toHaveLength(10);
  });
});

describe('clearSessionMessages', () => {
  it('clears messages and page URL for an existing session', () => {
    const {session} = getOrCreateSession();
    appendAndWindow(session, [
      {role: 'user', content: 'Hello'},
      {role: 'assistant', content: 'Hi'},
    ]);
    shouldInjectPageContext(session, '/docs/intro');

    const cleared = clearSessionMessages(session.id);
    const {session: resolved, isNew} = getOrCreateSession(session.id);

    expect(cleared).toBe(true);
    expect(isNew).toBe(false);
    expect(resolved.messages).toEqual([]);
    expect(shouldInjectPageContext(resolved, '/docs/intro')).toBe(true);
  });

  it('returns false when session does not exist', () => {
    expect(clearSessionMessages('missing-session')).toBe(false);
  });
});

describe('shouldInjectPageContext', () => {
  it('returns true on first request (no previous URL)', () => {
    const {session} = getOrCreateSession();
    expect(shouldInjectPageContext(session, '/docs/intro')).toBe(true);
  });

  it('returns false when same page URL', () => {
    const {session} = getOrCreateSession();
    shouldInjectPageContext(session, '/docs/intro');
    expect(shouldInjectPageContext(session, '/docs/intro')).toBe(false);
  });

  it('returns true on page change', () => {
    const {session} = getOrCreateSession();
    shouldInjectPageContext(session, '/docs/intro');
    expect(shouldInjectPageContext(session, '/docs/other')).toBe(true);
  });

  it('returns true when no pageUrl provided', () => {
    const {session} = getOrCreateSession();
    expect(shouldInjectPageContext(session)).toBe(true);
  });
});
