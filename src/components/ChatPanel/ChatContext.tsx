import React, {createContext, useContext, useState, useRef, useCallback, useEffect} from 'react';
import {useLocation} from '@docusaurus/router';
import type {Source, ChatMessage, ChatHistoryEntry, AgentType, ConfidenceLevel, GroundingCitation} from './types';
import {getFeedbackEndpoint} from './endpoints';
import {createAgentStreamState, parseAgentStreamEvent, type AgentStreamUpdate} from './agentStream';
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
  stop: () => void;
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
    if (normalized === 'userid' || normalized === 'sessionid' || normalized === 'conversationid') return '[redacted]';
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

function loadHistory(): ChatHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as ChatHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

interface ChatProviderProps {
  chatEndpoint: string;
  agentConfigCode: string;
  debugDefault?: boolean;
  children: React.ReactNode;
}

export function ChatProvider({chatEndpoint, agentConfigCode, debugDefault = false, children}: ChatProviderProps) {
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
  const conversationIdRef = useRef<string | null>(null);
  const requestGenerationRef = useRef(0);
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
            ? {
                ...entry,
                title,
                messages: [...messages],
                sessionId: sessionIdRef.current,
                conversationId: conversationIdRef.current,
              }
            : entry
        )
      );
    } else {
      const id = uuid();
      setActiveChatId(id);
      activeChatIdRef.current = id;
      setChatHistory(prev => [{
        id,
        title,
        messages: [...messages],
        createdAt: Date.now(),
        sessionId: sessionIdRef.current,
        conversationId: conversationIdRef.current,
      }, ...prev]);
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
    const generation = requestGenerationRef.current + 1;
    requestGenerationRef.current = generation;
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

    let controller: AbortController | null = null;
    const isCurrentRequest = () =>
      requestGenerationRef.current === generation && !controller?.signal.aborted;
    try {
      controller = new AbortController();
      abortRef.current = controller;
      if (!conversationIdRef.current) conversationIdRef.current = uuid();
      const conversationId = conversationIdRef.current;
      const requestBody = {
        message: outgoing,
        session_id: sessionIdRef.current,
        conversationId,
        streaming_mode: 'token',
        site: 'docs.zilliz.com',
        agent_config: {agent_config_code: agentConfigCode},
      };
      chatDebug('chat.client.fetch.started', {
        requestId,
        endpointPath: chatEndpoint,
        pagePath: location.pathname,
        hasSessionId: Boolean(sessionIdRef.current),
        conversationId,
        agentConfigCode,
      });
      const res = await fetch(chatEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          'X-Request-ID': requestId,
          'X-Conversation-ID': conversationId,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      if (!isCurrentRequest()) return;
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
      let currentEvent = '';
      const streamState = createAgentStreamState();
      let sourceCount = 0;
      let confidence: ConfidenceLevel | undefined;
      let agentType: AgentType | undefined;

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

      const applyUpdate = (update: AgentStreamUpdate) => {
        if (!isCurrentRequest()) return;
        if (update.type === 'session') {
          sessionIdRef.current = update.sessionId;
          return;
        }
        if (update.type === 'text') {
          assistantText += update.text;
          updateLastAssistant({text: assistantText, status: undefined});
          return;
        }
        if (update.type === 'agent') {
          agentType = update.agentType;
          updateLastAssistant({agent: update.name, agentType: update.agentType});
          return;
        }
        if (update.type === 'status') {
          updateLastAssistant({status: update.status, toolCallCount: undefined});
          return;
        }
        if (update.type === 'tool-call') {
          updateLastAssistant({toolCallCount: update.count, status: undefined});
          return;
        }
        if (update.type === 'sources') {
          sourceCount = update.sources.length;
          updateLastAssistant({sources: update.sources});
          return;
        }
        if (update.type === 'grounding') {
          updateLastAssistant({grounding: update.citations});
          return;
        }
        if (update.type === 'confidence') {
          confidence = update.level;
          updateLastAssistant({confidence: update.level});
          return;
        }
        if (update.type === 'error') {
          if (!assistantText) {
            assistantText = update.message;
            updateLastAssistant({text: assistantText, status: undefined});
          } else {
            updateLastAssistant({status: undefined});
          }
          return;
        }
        updateLastAssistant({status: undefined});
      };

      while (true) {
        const {done, value} = await reader.read();
        if (!isCurrentRequest()) break;
        if (done) {
          if (buffer.trim()) {
            buffer += '\n';
          }
        } else {
          buffer += decoder.decode(value, {stream: true});
          chatDebug('chat.client.sse.chunk', {requestId, bytes: value.byteLength, bufferChars: buffer.length});
        }

        const lines = buffer.split('\n');
        buffer = done ? '' : (lines.pop() || '');

        for (const line of lines) {
            if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            const eventName = currentEvent;
            currentEvent = '';
            let parsedForDebug: unknown = data;
            try { parsedForDebug = JSON.parse(data); } catch {}
            const effectiveEvent = eventName || (data === '[DONE]'
              ? 'done'
              : parsedForDebug && typeof parsedForDebug === 'object' && 'type' in parsedForDebug
                ? String((parsedForDebug as {type?: unknown}).type || '')
                : '');
            eventCounts[effectiveEvent] = (eventCounts[effectiveEvent] || 0) + 1;
            chatDebug('chat.client.sse.event', {requestId, sseEvent: effectiveEvent, payload: parsedForDebug});
            for (const update of parseAgentStreamEvent(eventName, data, streamState)) {
              if (!isCurrentRequest()) break;
              if (update.type === 'text') {
                chatDebug('chat.client.delta.applied', {
                  requestId,
                  deltaChars: update.text.length,
                  assistantChars: assistantText.length + update.text.length,
                });
              }
              applyUpdate(update);
            }
          }
        }

        if (done) break;
      }

      chatDebug('chat.client.completed', {
        requestId,
        durationMs: Date.now() - startedAt,
        eventCounts,
        assistantText,
        sourceCount,
        confidence,
        agentType,
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
      if (requestGenerationRef.current === generation) {
        setIsStreaming(false);
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    }
  }, [agentConfigCode, chatDebug, chatEndpoint, location.pathname]);

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
          sessionId: sessionIdRef.current,
          messageIndex,
          rating: newRating || rating,
          pageUrl: location.pathname,
          userId: getUserId(),
        }),
      }).catch(() => {});

      return updated;
    });
  }, [chatEndpoint, location.pathname]);

  const stop = useCallback(() => {
    const sessionId = sessionIdRef.current;
    const conversationId = conversationIdRef.current;
    if (sessionId && conversationId) {
      void fetch(`${chatEndpoint.replace(/\/+$/, '')}/interrupt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Conversation-ID': conversationId,
        },
        body: JSON.stringify({session_id: sessionId, conversationId}),
        keepalive: true,
      }).catch(() => {});
    }
    requestGenerationRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
    setMessages(prev => prev.map((message, index) =>
      index === prev.length - 1 && message.role === 'assistant'
        ? {...message, status: undefined}
        : message,
    ));
  }, [chatEndpoint]);

  const newChat = useCallback(() => {
    requestGenerationRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setInput('');
    setIsStreaming(false);
    setActiveChatId(null);
    sessionIdRef.current = null;
    conversationIdRef.current = null;
  }, []);

  const loadChat = useCallback((id: string) => {
    requestGenerationRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    const entry = chatHistory.find(e => e.id === id);
    if (!entry) return;
    setMessages([...entry.messages]);
    setActiveChatId(id);
    setInput('');
    setIsStreaming(false);
    sessionIdRef.current = entry.sessionId ?? null;
    conversationIdRef.current = entry.conversationId ?? null;
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
      conversationIdRef.current = null;
    }
  }, []);

  return (
    <ChatContext.Provider value={{messages, setMessages, input, setInput, isStreaming, send, stop, newChat, rateFeedback, chatHistory, activeChatId, loadChat, deleteChat, contextChips, removeContextChip}}>
      {children}
    </ChatContext.Provider>
  );
}
