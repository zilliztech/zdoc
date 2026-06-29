import React, {createContext, useContext, useState, useRef, useCallback, useEffect} from 'react';
import {useLocation} from '@docusaurus/router';
import type {Source, ChatMessage, ChatHistoryEntry, AgentType, ConfidenceLevel, GroundingCitation} from './types';
import {getChatStreamEndpoint, getFeedbackEndpoint} from './endpoints';
export type {Source, FeedbackRating, ChatMessage, ChatHistoryEntry, AgentType, ConfidenceLevel, GroundingCitation} from './types';

export interface ContextChip {
  id: string;
  kind: 'text' | 'code';
  label: string;
  content: string;
  lang?: string;
}

export interface ChatContextValue {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isStreaming: boolean;
  send: (text: string) => Promise<void>;
  newChat: () => void;
  rateFeedback: (messageIndex: number, rating: 'up' | 'down') => void;
  chatHistory: ChatHistoryEntry[];
  activeChatId: string | null;
  loadChat: (id: string) => void;
  deleteChat: (id: string) => void;
  contextChips: ContextChip[];
  removeContextChip: (id: string) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider');
  return ctx;
}

function getPageContext(): string | undefined {
  const article = document.querySelector('article');
  if (!article) return undefined;
  return (article.textContent || '').slice(0, 6000);
}

// Persistent user ID
const USER_ID_KEY = 'zd-user-id';

function uuid(): string {
  // crypto.randomUUID() requires a secure context (HTTPS / localhost).
  // Fall back to crypto.getRandomValues() for plain HTTP origins.
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15) >> (c === 'x' ? 0 : 2);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = uuid();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

const HISTORY_KEY = 'zd-chat-history';
const DEBUG_KEY = 'zd-chat-debug';

function summarizeClientText(text: string): {chars: number; bytes: number} {
  return {chars: text.length, bytes: new TextEncoder().encode(text).length};
}

function summarizeClientValue(value: unknown, key?: string, sensitiveContainer = false): unknown {
  const normalized = key?.replace(/[^a-z0-9]/gi, '').toLowerCase();
  const nextSensitiveContainer = sensitiveContainer || Boolean(normalized && /payload|data|messages|content|text|query|response|answer|context|error/.test(normalized));
  if (typeof value === 'string') {
    if (normalized === 'userid' || normalized === 'sessionid') return '[redacted]';
    if (nextSensitiveContainer || value.length > 100) return summarizeClientText(value);
    return value;
  }
  if (Array.isArray(value)) {
    return {length: value.length, items: value.slice(0, 5).map(item => summarizeClientValue(item, key, nextSensitiveContainer))};
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value).slice(0, 20)) {
      out[k] = summarizeClientValue(v, k, nextSensitiveContainer);
    }
    return out;
  }
  return value;
}

function resolveChatDebugEnabled(defaultEnabled: boolean): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    const param = params.get('chatDebug');
    if (param === '1') localStorage.setItem(DEBUG_KEY, '1');
    if (param === '0') localStorage.setItem(DEBUG_KEY, '0');
    const stored = localStorage.getItem(DEBUG_KEY);
    if (stored === '1') return true;
    if (stored === '0') return false;
  } catch {}
  return defaultEnabled;
}

type WebsiteAssistantSseEvent =
  | {type: 'connected'; session_id?: string}
  | {type: 'session_id'; session_id?: string}
  | {type: 'stream_event'; event_type?: string; block_index?: number; block_type?: string | null; delta?: string | null}
  | {type: 'chunk'; data?: {type?: string; text?: string; thinking?: string; id?: string; name?: string; is_error?: boolean; content?: unknown}}
  | {type: 'completed'; session_id?: string}
  | {type: 'error'; content?: string; error?: string}
  | {type?: string; [key: string]: any};

function parseSseData(record: string): string | null {
  const dataLines = record
    .split(/\r?\n/)
    .filter(line => line.startsWith('data:'))
    .map(line => line.slice(5).replace(/^ /, ''));
  return dataLines.length ? dataLines.join('\n') : null;
}

function isInactiveSessionError(errorText: string): boolean {
  return /^Session not found or inactive:/i.test(errorText.trim());
}

function loadHistory(): ChatHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as ChatHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function ChatProvider({chatEndpoint, debugDefault = false, children}: {chatEndpoint: string; debugDefault?: boolean; children: React.ReactNode}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryEntry[]>(() => loadHistory());
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [contextChips, setContextChips] = useState<ContextChip[]>([]);
  const contextChipsRef = useRef<ContextChip[]>([]);
  contextChipsRef.current = contextChips;
  const abortRef = useRef<AbortController | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const activeChatIdRef = useRef(activeChatId);
  activeChatIdRef.current = activeChatId;
  const location = useLocation();
  const debugEnabledRef = useRef(resolveChatDebugEnabled(debugDefault));
  const chatDebug = useCallback((event: string, data: Record<string, unknown> = {}) => {
    if (!debugEnabledRef.current) return;
    console.debug('[chat-debug]', {
      event,
      timestamp: new Date().toISOString(),
      ...summarizeClientValue(data) as Record<string, unknown>,
    });
  }, []);

  // Auto-save current chat to history when first assistant message arrives
  useEffect(() => {
    if (messages.length < 2) return;
    const hasAssistant = messages.some(m => m.role === 'assistant' && m.text);
    if (!hasAssistant) return;

    const firstUserMsg = messages.find(m => m.role === 'user');
    const title = firstUserMsg ? firstUserMsg.text.slice(0, 50) : 'New chat';

    if (activeChatIdRef.current) {
      setChatHistory(prev =>
        prev.map(entry =>
          entry.id === activeChatIdRef.current
            ? {...entry, title, messages: [...messages]}
            : entry
        )
      );
    } else {
      const id = uuid();
      setActiveChatId(id);
      activeChatIdRef.current = id;
      setChatHistory(prev => [{id, title, messages: [...messages], createdAt: Date.now()}, ...prev]);
    }
  }, [messages]);

  // Persist chat history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(chatHistory));
    } catch { /* quota exceeded */ }
  }, [chatHistory]);

  const removeContextChip = useCallback((id: string) => {
    setContextChips(prev => prev.filter(c => c.id !== id));
  }, []);

  // Snippets pushed in from the doc (text selection / code block "Ask AI").
  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail || {};
      if (!d.content) return;
      const chip: ContextChip = {
        id: uuid(),
        kind: d.kind === 'code' ? 'code' : 'text',
        label: String(d.label || d.content).replace(/\s+/g, ' ').trim(),
        content: String(d.content),
        lang: d.lang ? String(d.lang) : undefined,
      };
      setContextChips(prev =>
        prev.some(c => c.content === chip.content && c.kind === chip.kind) ? prev : [...prev, chip],
      );
    };
    document.addEventListener('ask-ai-context', handler);
    return () => document.removeEventListener('ask-ai-context', handler);
  }, []);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || abortRef.current) return;

    // Fold any pending context chips into the outgoing message, then clear them.
    const chips = contextChipsRef.current;
    const contextPrefix = chips.length
      ? chips
          .map(c => (c.kind === 'code' ? `\`\`\`${c.lang || ''}\n${c.content}\n\`\`\`` : `> ${c.content}`))
          .join('\n\n') + '\n\n'
      : '';
    if (chips.length) setContextChips([]);
    const outgoing = contextPrefix + text;

    const userMessage: ChatMessage = {role: 'user', text: outgoing};
    const updatedMessages = [...messagesRef.current, userMessage, {role: 'assistant' as const, text: ''}];
    setMessages(updatedMessages);
    setInput('');
    setIsStreaming(true);

    const requestId = uuid();
    const startedAt = Date.now();
    const eventCounts: Record<string, number> = {};
    const pageContext = getPageContext();
    chatDebug('chat.client.send.started', {
      requestId,
      pagePath: location.pathname,
      messageCount: updatedMessages.length,
      userText: text,
      pageContext,
    });

    try {
      abortRef.current = new AbortController();
      const userId = getUserId();
      const chatStreamEndpoint = getChatStreamEndpoint(chatEndpoint);
      const requestBody = {
        message: outgoing,
        ...(sessionIdRef.current ? {session_id: sessionIdRef.current} : {}),
        agent_config: {
          agent_config_code: 'zilliz-website-assistant',
        },
        streaming_mode: 'token',
        user_id: userId,
      };
      chatDebug('chat.client.fetch.started', {
        requestId,
        endpointPath: chatStreamEndpoint,
        pagePath: location.pathname,
        hasMessage: Boolean(outgoing.trim()),
        hasSessionId: Boolean(sessionIdRef.current),
        hasUserId: Boolean(userId),
      });
      const res = await fetch(chatStreamEndpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Accept': 'text/event-stream', 'X-Request-ID': requestId},
        body: JSON.stringify(requestBody),
        signal: abortRef.current.signal,
      });
      chatDebug('chat.client.fetch.response', {
        requestId,
        status: res.status,
        contentType: res.headers.get('content-type'),
        serverRequestId: res.headers.get('x-request-id'),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        const errorText = (errorBody as {detail?: string; error?: string}).detail || (errorBody as {error?: string}).error || `Error: ${res.status}`;
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === 'assistant') {
            updated[updated.length - 1] = {...last, text: errorText};
          }
          return updated;
        });
        chatDebug('chat.client.error', {requestId, status: res.status, error: errorText});
        setIsStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let assistantText = '';
      let pendingSources: Source[] | undefined;
      let pendingGrounding: GroundingCitation[] | undefined;
      let pendingConfidence: ConfidenceLevel | undefined;
      let pendingAgent: {type: AgentType; name: string} | undefined;
      let completed = false;
      const blockTypes = new Map<number, string | null>();
      let toolCallCount = 0;

      const updateLastAssistant = (patch: Partial<ChatMessage>) => {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === 'assistant') {
            updated[updated.length - 1] = {...last, ...patch};
          }
          return updated;
        });
      };

      const applyAssistantText = (nextText: string) => {
        assistantText = nextText;
        updateLastAssistant({text: assistantText});
      };

      const appendAssistantText = (delta: string) => {
        if (!delta) return;
        assistantText += delta;
        chatDebug('chat.client.delta.applied', {requestId, deltaChars: delta.length, assistantChars: assistantText.length});
        updateLastAssistant({text: assistantText});
      };

      const handleEvent = (rawData: string) => {
        if (rawData === '[DONE]') {
          eventCounts.done = (eventCounts.done || 0) + 1;
          chatDebug('chat.client.sse.event', {requestId, sseEvent: 'done', payload: rawData});
          return;
        }

        let parsed: WebsiteAssistantSseEvent;
        try {
          parsed = JSON.parse(rawData) as WebsiteAssistantSseEvent;
        } catch {
          chatDebug('chat.client.sse.event', {requestId, sseEvent: 'malformed', payload: rawData});
          return;
        }

        const eventType = parsed.type || 'unknown';
        eventCounts[eventType] = (eventCounts[eventType] || 0) + 1;
        chatDebug('chat.client.sse.event', {requestId, sseEvent: eventType, payload: parsed});

        if (parsed.type === 'session_id') {
          if (parsed.session_id) sessionIdRef.current = parsed.session_id;
          return;
        }

        if (parsed.type === 'stream_event') {
          if (typeof parsed.block_index !== 'number') return;
          if (parsed.event_type === 'block_start') {
            blockTypes.set(parsed.block_index, parsed.block_type ?? null);
            return;
          }
          if (parsed.event_type === 'delta') {
            const blockType = blockTypes.get(parsed.block_index);
            if (blockType === 'thinking') return;
            appendAssistantText(parsed.delta ?? '');
          }
          if (parsed.event_type === 'block_stop') {
            blockTypes.delete(parsed.block_index);
          }
          return;
        }

        if (parsed.type === 'chunk') {
          const chunk = parsed.data;
          if (!chunk?.type) return;
          if (chunk.type === 'tool_use') {
            toolCallCount += 1;
            updateLastAssistant({toolCallCount});
            pendingAgent = {type: 'general' as AgentType, name: 'Docs Agent'};
            updateLastAssistant({agent: pendingAgent.name, agentType: pendingAgent.type});
            return;
          }
          if (chunk.type === 'text' && typeof chunk.text === 'string') {
            appendAssistantText(chunk.text);
            return;
          }
          if (chunk.type === 'tool_result' && chunk.is_error) {
            chatDebug('chat.client.tool.error', {requestId, content: chunk.content});
          }
          return;
        }

        if (parsed.type === 'completed') {
          completed = true;
          if (parsed.session_id) sessionIdRef.current = parsed.session_id;
          return;
        }

        if (parsed.type === 'error') {
          const errorText = parsed.content || parsed.error || 'Something went wrong';
          if (isInactiveSessionError(errorText)) sessionIdRef.current = null;
          applyAssistantText(errorText);
        }
      };

      while (true) {
        const {done, value} = await reader.read();
        if (done) {
          if (buffer.trim()) {
            buffer += '\n\n';
          }
        } else {
          buffer += decoder.decode(value, {stream: true});
          chatDebug('chat.client.sse.chunk', {requestId, bytes: value.byteLength, bufferChars: buffer.length});
        }

        const records = buffer.split(/\r?\n\r?\n/);
        buffer = done ? '' : (records.pop() || '');

        for (const record of records) {
          const data = parseSseData(record);
          if (data !== null) handleEvent(data);
        }

        if (done) break;
      }

      chatDebug('chat.client.completed', {
        requestId,
        durationMs: Date.now() - startedAt,
        eventCounts,
        assistantText,
        completed,
        sourceCount: pendingSources?.length ?? 0,
        confidence: pendingConfidence,
        agentType: pendingAgent?.type,
      });

      // Attach sources, confidence, and agent to the last assistant message
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.role === 'assistant') {
          updated[updated.length - 1] = {
            ...last,
            ...(pendingSources && pendingSources.length > 0 ? {sources: pendingSources} : {}),
            ...(pendingGrounding && pendingGrounding.length > 0 ? {grounding: pendingGrounding} : {}),
            ...(pendingConfidence ? {confidence: pendingConfidence} : {}),
            ...(pendingAgent ? {agent: pendingAgent.name, agentType: pendingAgent.type} : {}),
          };
        }
        return updated;
      });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // User cancelled
      } else {
        const errorMsg = err instanceof Error ? err.message : 'Something went wrong';
        chatDebug('chat.client.error', {requestId, error: errorMsg});
        setMessages(prev => [...prev, {role: 'assistant', text: `Error: ${errorMsg}`}]);
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [chatDebug, chatEndpoint, location.pathname]);

  const rateFeedback = useCallback((messageIndex: number, rating: 'up' | 'down') => {
    setMessages(prev => {
      const updated = [...prev];
      const msg = updated[messageIndex];
      if (!msg || msg.role !== 'assistant') return prev;
      const newRating = msg.feedback === rating ? null : rating;
      updated[messageIndex] = {...msg, feedback: newRating};

      const endpoint = getFeedbackEndpoint(chatEndpoint);
      fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          messageIndex,
          rating: newRating || rating,
          pageUrl: location.pathname,
          user_id: getUserId(),
        }),
      }).catch(() => {});

      return updated;
    });
  }, [chatEndpoint, location.pathname]);

  const newChat = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setMessages([]);
    setInput('');
    setIsStreaming(false);
    setActiveChatId(null);
    sessionIdRef.current = null;
  }, []);

  const loadChat = useCallback((id: string) => {
    if (abortRef.current) abortRef.current.abort();
    const entry = chatHistory.find(e => e.id === id);
    if (!entry) return;
    setMessages([...entry.messages]);
    setActiveChatId(id);
    setInput('');
    setIsStreaming(false);
    sessionIdRef.current = null;
  }, [chatHistory]);

  // Listen for chat-send events from the search bar / DocRoot
  useEffect(() => {
    const handler = (e: Event) => {
      const query = (e as CustomEvent).detail?.query;
      if (query) {
        setInput(query);
        // Send on next tick after input is set
        setTimeout(() => send(query), 0);
      }
    };
    document.addEventListener('chat-send', handler);
    return () => document.removeEventListener('chat-send', handler);
  }, [setInput, send]);

  const deleteChat = useCallback((id: string) => {
    setChatHistory(prev => prev.filter(e => e.id !== id));
    if (activeChatIdRef.current === id) {
      setMessages([]);
      setActiveChatId(null);
      setInput('');
      sessionIdRef.current = null;
    }
  }, []);

  return (
    <ChatContext.Provider value={{messages, setMessages, input, setInput, isStreaming, send, newChat, rateFeedback, chatHistory, activeChatId, loadChat, deleteChat, contextChips, removeContextChip}}>
      {children}
    </ChatContext.Provider>
  );
}
