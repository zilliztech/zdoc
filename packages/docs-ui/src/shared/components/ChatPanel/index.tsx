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
  ArrowDown,
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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="10" fill="#252F58" />
      <path
        d="M7 14L14 3L13 10.2632H17L9 21L11 14H7Z"
        fill="#ffffff"
        transform="translate(12 12) scale(0.9) translate(-12 -12)"
      />
    </svg>
  );
}

function EmptyBoltIcon() {
  return (
    <svg width="44" height="76" viewBox="0 0 44 76" fill="none" aria-hidden="true">
      <path
        d="M0.942375 43.7014L30.3424 0.280334L26.1424 30.5435H42.9424L9.34237 75.2803L17.7424 43.7014H0.942375Z"
        stroke="#E1DFD9"
        strokeWidth="0.8"
        strokeLinejoin="miter"
        strokeLinecap="butt"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function ThinkingGlyph() {
  return (
    <span className={styles.thinkingGlyph} aria-hidden="true">
      {Array.from({length: 6}).map((_, index) => (
        <span key={index} className={styles.thinkingDot} />
      ))}
    </span>
  );
}

function ThinkingText({label = 'Thinking'}: {label?: string}): React.ReactElement {
  return (
    <span className={styles.thinkingText} aria-label="Thinking">
      <span className={styles.thinkingLabel}>{label}</span>
      <span className={styles.thinkingDots} aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </span>
  );
}

function ChatHeader({onClose, onClear, showClear}: {onClose: () => void; onClear?: () => void; showClear?: boolean}) {
  return (
    <div className={styles.chatHeader}>
      <div className={styles.chatTitleGroup}>
        <span className={styles.chatAvatarWrap}>
          <span className={styles.chatAvatarButton} aria-hidden="true">
            <AskAiAvatarIcon />
          </span>
        </span>
        <span className={styles.chatTitle}>Ask AI</span>
      </div>
      <div className={styles.chatHeaderActions}>
        {showClear && onClear && (
          <button type="button" className={`${styles.chatClose} ${styles.chatClear}`} onClick={onClear} aria-label="Clear conversation" title="Clear conversation">
            <Trash2 size={12} />
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
  const {messages, input, setInput, isStreaming, send, stop, newChat, rateFeedback, chatHistory, activeChatId, loadChat, deleteChat, contextChips, removeContextChip} = useChatContext();
  const location = useLocation();
  const history = useHistory();
  const suggestions = getSuggestions(location.pathname);
  const conversationRef = useRef<HTMLDivElement>(null);
  const emptyInputRef = useRef<HTMLInputElement>(null);
  const conversationInputRef = useRef<HTMLInputElement>(null);
  const streamPauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [showStreamPauseIndicator, setShowStreamPauseIndicator] = useState(false);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);

  const scrollToBottom = () => {
    const el = conversationRef.current;
    if (el) el.scrollTo({top: el.scrollHeight, behavior: 'smooth'});
  };

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
    const el = conversationRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
        setShowJumpToLatest(false);
      });
    }
  }, [messages, isStreaming, showStreamPauseIndicator]);

  // Show a "Jump to latest" button once the user scrolls away from the bottom.
  useEffect(() => {
    const el = conversationRef.current;
    if (!el) return undefined;
    const onScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowJumpToLatest(distanceFromBottom > 140);
    };
    el.addEventListener('scroll', onScroll, {passive: true});
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, [messages.length]);

  const hasMessages = messages.length > 0;
  const lastMessage = messages[messages.length - 1];
  const lastAssistantText = lastMessage?.role === 'assistant' ? lastMessage.text : '';

  useEffect(() => {
    if (streamPauseTimerRef.current) {
      clearTimeout(streamPauseTimerRef.current);
      streamPauseTimerRef.current = null;
    }

    setShowStreamPauseIndicator(false);

    if (!isStreaming || lastMessage?.role !== 'assistant' || !lastAssistantText) {
      return undefined;
    }

    streamPauseTimerRef.current = setTimeout(() => {
      setShowStreamPauseIndicator(true);
    }, 850);

    return () => {
      if (streamPauseTimerRef.current) {
        clearTimeout(streamPauseTimerRef.current);
        streamPauseTimerRef.current = null;
      }
    };
  }, [isStreaming, lastMessage?.role, lastAssistantText]);

  const focusInputFromBox = (event: React.MouseEvent<HTMLDivElement>, inputRef: React.RefObject<HTMLInputElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.tagName === 'INPUT') return;
    event.preventDefault();
    inputRef.current?.focus();
  };

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
          <div className={styles.emptyBody}>
            <div className={styles.emptyBolt} aria-hidden="true">
              <EmptyBoltIcon />
            </div>
          </div>
          <div className={styles.suggestions}>
            {suggestions.map(q => (
              <button type="button" key={q} className={styles.suggestionBtn} onClick={() => send(q)}>
                {q}
              </button>
            ))}
          </div>

          <div className={styles.bottomInput}>
            <div className={styles.inputBox} onMouseDown={event => focusInputFromBox(event, emptyInputRef)}>
              {chipRow}
              <input
                ref={emptyInputRef}
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
          <div ref={conversationRef} className={`${styles.messages} ${isStreaming ? styles.messagesStreaming : ''}`}>
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
                        <ThinkingGlyph />
                        <ThinkingText label={msg.status || (msg.toolCallCount ? 'Searching' : 'Thinking')} />
                      </span>
                  ) : (
                    <>
                      <GroundedMarkdown text={msg.text} sources={msg.sources} grounding={msg.grounding} />
                      {isStreaming && i === messages.length - 1 && showStreamPauseIndicator && msg.text && (
                        <span className={`${styles.thinkingRow} ${styles.trailingThinkingRow}`}>
                          <ThinkingGlyph />
                          <ThinkingText label={msg.status || (msg.toolCallCount ? 'Searching' : 'Thinking')} />
                        </span>
                      )}
                    </>
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
            {showJumpToLatest && (
              <button
                type="button"
                className={styles.jumpToLatest}
                onClick={scrollToBottom}>
                <ArrowDown size={13} strokeWidth={2.4} />
                Bottom
              </button>
            )}
            <div className={styles.inputBox} onMouseDown={event => focusInputFromBox(event, conversationInputRef)}>
              {chipRow}
              <input
                ref={conversationInputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !isStreaming && send(input)}
                placeholder="Ask a question..."
                className={styles.input}
                aria-label="Chat message"
              />
              <div className={styles.inputFooter}>
                <kbd className={styles.inputKbd}>{IS_MAC ? '⌘I' : 'Ctrl I'}</kbd>
                <button
                  type="button"
                  className={`${styles.sendRound} ${isStreaming ? styles.stopRound : ''}`}
                  onClick={() => isStreaming ? stop() : send(input)}
                  disabled={!isStreaming && !input.trim()}
                  aria-label={isStreaming ? 'Stop response' : 'Send'}>
                  {isStreaming ? (
                    <>
                      <span className={styles.stopIcon} aria-hidden="true" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <ArrowUp size={16} strokeWidth={2.5} />
                  )}
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
