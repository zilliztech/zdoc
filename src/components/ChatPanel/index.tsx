import React, {useRef, useEffect, useState} from 'react';
import {useLocation, useHistory} from '@docusaurus/router';
import {
  Maximize2,
  Minimize2,
  SquarePen,
  Send,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  Search,
  Trash2,
  MessageSquare,
  X,
  Code,
  FileText,
  ArrowUp,
  Copy,
  Check,
} from 'lucide-react';
import '@zdoc/chat-ui/dist/style.css';
import {ConfidenceDot, SourceTag, GroundedMarkdown, isExternalUrl} from '@zdoc/chat-ui';
import {useChatContext} from './ChatContext';
import type {ChatHistoryEntry} from './types';
import type {ConfidenceLevel, Source, GroundingCitation} from '@zdoc/chat-ui';
import IconButton from '../IconButton';
import styles from './styles.module.css';

export {ChatProvider} from './ChatContext';

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

const DEFAULT_SUGGESTIONS = [
  'How do I get started with Zilliz Cloud?',
  'What are the API rate limits?',
  'Show me integration examples',
  'How to handle authentication?',
];

function getSuggestions(pathname: string): string[] {
  if (pathname.includes('/reference/python')) {
    return [
      'Show me a pymilvus insert example',
      'How do I search with filters?',
      'How to create a collection with dynamic schema?',
      'What index types are available?',
    ];
  }
  if (pathname.includes('/reference/')) {
    return [
      'Show me a code example for this API',
      'What are the required parameters?',
      'How do I handle errors?',
      'What are the rate limits for this endpoint?',
    ];
  }
  if (pathname.includes('/docs/byoc')) {
    return [
      'How do I deploy BYOC on AWS?',
      'What are the networking requirements?',
      'How to configure private endpoints?',
      'Compare BYOC vs Serverless',
    ];
  }
  if (pathname.includes('/docs')) {
    return [
      'Help me design a schema for my use case',
      'What cluster size do I need?',
      'Show me a vector search example',
      'How to optimize search performance?',
    ];
  }
  return DEFAULT_SUGGESTIONS;
}

interface ChatPanelProps {
  isExpanded: boolean;
  onToggle: () => void;
  toggleMode?: 'expand' | 'minimize';
}

function ZillizStarIcon() {
  return <img src="/icons/zilliz-star.svg" width="16" height="16" aria-hidden="true" />;
}

function AskAiAvatarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect width="20" height="20" rx="8" fill="#1D2939" />
      <path d="M5.5 11.8889L11.8 1.5L10.9 8.35965H14.5L7.3 18.5L9.1 11.8889H5.5Z" fill="#ffffff" />
    </svg>
  );
}

// Bolt mark identical to the topbar "Ask AI" button — used as the leading icon
// on the streaming/thinking indicator.
function AskAiBoltIcon() {
  return (
    <svg width="9" height="15" viewBox="0 0 8 14" fill="none" aria-hidden="true">
      <path d="M0 8.55556L5.6 0L4.8 5.64912H8L1.6 14L3.2 8.55556H0Z" fill="currentColor" />
    </svg>
  );
}

// Scramble "thinking…" indicator (gray) — resolves left→right, then loops.
function ThinkingText(): React.ReactElement {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let stopped = false;
    let raf = 0;
    let timer: ReturnType<typeof setTimeout>;
    const text = 'thinking in 768d..';
    const chars = ['.', ' '];
    const run = () => {
      const start = performance.now();
      const dur = 650;
      const tick = (now: number) => {
        if (stopped) return;
        const raw = Math.min((now - start) / dur, 1);
        const progress = 1 - Math.pow(1 - raw, 2);
        let out = '';
        for (let i = 0; i < text.length; i++) {
          const cp = progress * (text.length + 1) - i;
          out += cp >= 1 ? text[i] : chars[Math.floor(Math.random() * chars.length)];
        }
        el.textContent = out;
        if (raw < 1) raf = requestAnimationFrame(tick);
        else timer = setTimeout(() => { if (!stopped) run(); }, 500);
      };
      raf = requestAnimationFrame(tick);
    };
    run();
    return () => { stopped = true; cancelAnimationFrame(raf); clearTimeout(timer); };
  }, []);
  return <span ref={ref} className={styles.thinkingText} aria-label="Thinking" />;
}

function ChatHeader({onClose, onClear, showClear}: {onClose: () => void; onClear?: () => void; showClear?: boolean}) {
  return (
    <div className={styles.chatHeader}>
      <div className={styles.chatTitleGroup}>
        <span className={styles.chatAvatar}><AskAiAvatarIcon /></span>
        <span className={styles.chatTitle}>Ask AI</span>
      </div>
      <div className={styles.chatHeaderActions}>
        {showClear && onClear && (
          <button type="button" className={styles.chatClose} onClick={onClear} aria-label="Clear conversation" title="Clear conversation">
            <Trash2 size={15} />
          </button>
        )}
        <button type="button" className={styles.chatClose} onClick={onClose} aria-label="Close chat">
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

/* ── Chat history grouping helpers ── */

function getDateGroup(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const oneDay = 86400000;
  if (diff < oneDay) return 'Today';
  if (diff < 7 * oneDay) return 'Previous 7 days';
  return 'Older';
}

function groupHistory(history: ChatHistoryEntry[]): {label: string; items: ChatHistoryEntry[]}[] {
  const groups: Record<string, ChatHistoryEntry[]> = {};
  const order = ['Today', 'Previous 7 days', 'Older'];
  for (const entry of history) {
    const label = getDateGroup(entry.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(entry);
  }
  return order.filter(l => groups[l]).map(label => ({label, items: groups[label]}));
}

/* ── Chat Sidebar (expanded mode only) ── */

function ChatSidebar({
  chatHistory,
  activeChatId,
  onNewChat,
  onLoadChat,
  onDeleteChat,
}: {
  chatHistory: ChatHistoryEntry[];
  activeChatId: string | null;
  onNewChat: () => void;
  onLoadChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = search
    ? chatHistory.filter(e => e.title.toLowerCase().includes(search.toLowerCase()))
    : chatHistory;
  const grouped = groupHistory(filtered);

  return (
    <div className={styles.chatSidebar}>
      <div className={styles.sidebarHeader}>
        <button type="button" className={styles.newChatBtn} onClick={onNewChat}>
          <SquarePen size={14} />
          <span>New Chat</span>
        </button>
        <div className={styles.searchInputWrapper}>
          <Search size={13} className={styles.searchIcon} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search chats..."
            className={styles.searchInput}
          />
        </div>
      </div>
      <div className={styles.chatHistoryList}>
        {grouped.length === 0 && (
          <p className={styles.chatHistoryEmpty}>No chat history yet</p>
        )}
        {grouped.map(group => (
          <div key={group.label} className={styles.chatHistoryGroup}>
            <span className={styles.chatHistoryGroupLabel}>{group.label}</span>
            {group.items.map(entry => (
              <button
                key={entry.id}
                type="button"
                className={`${styles.chatHistoryItem} ${entry.id === activeChatId ? styles.chatHistoryItemActive : ''}`}
                onClick={() => onLoadChat(entry.id)}
              >
                <MessageSquare size={13} className={styles.chatHistoryItemIcon} />
                <span className={styles.chatHistoryItemTitle}>{entry.title}</span>
                <span
                  className={styles.chatHistoryDelete}
                  role="button"
                  tabIndex={0}
                  aria-label="Delete chat"
                  onClick={e => { e.stopPropagation(); onDeleteChat(entry.id); }}
                  onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); onDeleteChat(entry.id); } }}
                >
                  <Trash2 size={12} />
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChatPanel({onToggle, isExpanded, toggleMode = 'expand'}: ChatPanelProps): React.ReactElement {
  const {messages, input, setInput, isStreaming, send, newChat, rateFeedback, chatHistory, activeChatId, loadChat, deleteChat, contextChips, removeContextChip} = useChatContext();
  const location = useLocation();
  const history = useHistory();
  const suggestions = getSuggestions(location.pathname);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copyMessage = (idx: number, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(c => (c === idx ? null : c)), 1500);
    });
  };

  const chipRow = contextChips.length > 0 ? (
    <div className={styles.chipRow}>
      {contextChips.map(c => (
        <span key={c.id} className={styles.contextChip}>
          <span className={styles.contextChipIcon}>
            {c.kind === 'code' ? <Code size={12} /> : <FileText size={12} />}
          </span>
          <span className={styles.contextChipLabel}>{c.label}</span>
          <button
            type="button"
            className={styles.contextChipClose}
            onClick={() => removeContextChip(c.id)}
            aria-label="Remove context">
            <X size={11} />
          </button>
        </span>
      ))}
    </div>
  ) : null;

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTo({top: el.scrollHeight, behavior: 'smooth'});
    }
  }, [messages]);

  const hasMessages = messages.length > 0;

  // Handle source link click — client-side navigation
  const handleSourceClick = (e: React.MouseEvent, url: string) => {
    // Only handle internal doc links
    if (url.startsWith('/') || url.startsWith(window.location.origin)) {
      e.preventDefault();
      const path = url.startsWith('/') ? url : new URL(url).pathname;
      history.push(path);
    }
  };

  const conversationContent = (
    <>
      {!hasMessages ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyBody} />
          <div className={styles.suggestions}>
            {suggestions.map(q => (
              <button type="button" key={q} className={styles.suggestionBtn} onClick={() => send(q)}>
                {q}
              </button>
            ))}
          </div>

          <div className={styles.bottomInput}>
            <div className={styles.inputBox}>
              {chipRow}
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send(input)}
                placeholder="Ask a question..."
                className={styles.input}
                aria-label="Chat message"
              />
              <div className={styles.inputFooter}>
                <kbd className={styles.inputKbd}>{IS_MAC ? '⌘I' : 'Ctrl I'}</kbd>
                <button
                  type="button"
                  className={styles.sendRound}
                  onClick={() => send(input)}
                  disabled={!input.trim()}
                  aria-label="Send">
                  <ArrowUp size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.conversation}>
          <div className={styles.messages} ref={messagesContainerRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`${styles.messageBubble} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}>
                <div className={msg.role === 'assistant' ? styles.markdownContent : undefined}>
                  {/* Agent label */}
                  {msg.role === 'assistant' && msg.agent && (
                    <span className={isStreaming && i === messages.length - 1 ? styles.agentLabelStreaming : styles.agentLabel}>{msg.agent}</span>
                  )}
                  {msg.role === 'assistant' ? (
                    isStreaming && i === messages.length - 1 && !msg.text ? (
                      <span className={styles.thinkingRow}>
                        <span className={styles.thinkingBolt}><AskAiBoltIcon /></span>
                        {msg.toolCallCount ? (
                          <span className={styles.thinkingText}>
                            searching docs ({msg.toolCallCount} tool call{msg.toolCallCount > 1 ? 's' : ''})…
                          </span>
                        ) : (
                          <ThinkingText />
                        )}
                      </span>
                    ) : (
                      <GroundedMarkdown text={msg.text} sources={msg.sources} grounding={msg.grounding} />
                    )
                  ) : (
                    <p>{msg.text}</p>
                  )}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className={styles.sourcesSection}>
                      <span className={styles.sourcesLabel}>Sources</span>
                      <ul className={styles.sourcesList}>
                        {msg.sources.map((src, j) => (
                          <li key={j}>
                            <a
                              href={src.url}
                              onClick={e => handleSourceClick(e, src.url)}
                              className={styles.sourceLink}
                              title={src.title}
                              {...(isExternalUrl(src.url) ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
                            >
                              <span className={styles.sourceIndex}>{j + 1}</span>
                              <span>{src.title}</span>
                              <SourceTag section={src.section} url={src.url} />
                              {isExternalUrl(src.url) && <ExternalLink size={12} className={styles.externalIcon} />}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {msg.role === 'assistant' && msg.text && !isStreaming && (
                    <div className={styles.feedbackRow}>
                      <button
                        type="button"
                        className={`${styles.feedbackBtn} ${msg.feedback === 'up' ? styles.feedbackBtnActive : ''}`}
                        onClick={() => rateFeedback(i, 'up')}
                        aria-label="Helpful"
                        title="Helpful">
                        <ThumbsUp size={14} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.feedbackBtn} ${msg.feedback === 'down' ? styles.feedbackBtnActive : ''}`}
                        onClick={() => rateFeedback(i, 'down')}
                        aria-label="Not helpful"
                        title="Not helpful">
                        <ThumbsDown size={14} />
                      </button>
                      <button
                        type="button"
                        className={styles.feedbackBtn}
                        onClick={() => copyMessage(i, msg.text)}
                        aria-label="Copy"
                        title="Copy">
                        {copiedIdx === i ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                      <ConfidenceDot level={msg.confidence} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.bottomInput}>
            <div className={styles.inputBox}>
              {chipRow}
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send(input)}
                placeholder="Ask a question..."
                className={styles.input}
                aria-label="Chat message"
                disabled={isStreaming}
              />
              <div className={styles.inputFooter}>
                <kbd className={styles.inputKbd}>{IS_MAC ? '⌘I' : 'Ctrl I'}</kbd>
                <button
                  type="button"
                  className={styles.sendRound}
                  onClick={() => send(input)}
                  disabled={!input.trim() || isStreaming}
                  aria-label="Send">
                  <ArrowUp size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (isExpanded) {
    return (
      <div className={styles.chatInnerExpanded}>
        <ChatHeader onClose={onToggle} onClear={newChat} showClear={hasMessages} />
        <div className={styles.expandedWrapper}>
          <ChatSidebar
            chatHistory={chatHistory}
            activeChatId={activeChatId}
            onNewChat={newChat}
            onLoadChat={loadChat}
            onDeleteChat={deleteChat}
          />
          <div className={styles.expandedMain}>
            {conversationContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatInner}>
      <ChatHeader onClose={onToggle} onClear={newChat} showClear={hasMessages} />
      {conversationContent}
    </div>
  );
}
