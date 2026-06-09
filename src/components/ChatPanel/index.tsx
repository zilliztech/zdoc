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
} from 'lucide-react';
import '@zdoc/chat-ui/dist/style.css';
import {ConfidenceDot, SourceTag, GroundedMarkdown, isExternalUrl} from '@zdoc/chat-ui';
import {useChatContext} from './ChatContext';
import type {ChatHistoryEntry} from './types';
import type {ConfidenceLevel, Source, GroundingCitation} from '@zdoc/chat-ui';
import IconButton from '../IconButton';
import styles from './styles.module.css';

export {ChatProvider} from './ChatContext';

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

function ChatHeader({
  onNewChat,
  onToggle,
  isExpanded,
  toggleMode = 'expand',
}: {
  onNewChat: () => void;
  onToggle: () => void;
  isExpanded: boolean;
  toggleMode?: 'expand' | 'minimize';
}) {
  const isMinimizeToggle = toggleMode === 'minimize';
  const toggleTitle = isMinimizeToggle ? 'Minimize' : isExpanded ? 'Minimize' : 'Expand';
  return (
    <div className={styles.chatHeader}>
      <div className={styles.chatTitleGroup}>
        <div className={styles.chatAvatar}>
          <ZillizStarIcon />
        </div>
        <span className={styles.chatTitle}>Zilliz Copilot</span>
        <span className={styles.chatOnline} aria-hidden="true" />
      </div>
      <div className={styles.chatHeaderActions}>
        {!isExpanded && (
          <IconButton onClick={onNewChat} title="New chat" aria-label="New chat">
            <SquarePen size={15} />
          </IconButton>
        )}
        <IconButton onClick={onToggle} title={toggleTitle} aria-label={`${toggleTitle} chat`}>
          {isExpanded || isMinimizeToggle ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </IconButton>
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
  const {messages, input, setInput, isStreaming, send, newChat, rateFeedback, chatHistory, activeChatId, loadChat, deleteChat} = useChatContext();
  const location = useLocation();
  const history = useHistory();
  const suggestions = getSuggestions(location.pathname);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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
          <div className={styles.greetingBlock}>
            <p className={styles.greetingLine}>How can I help you</p>
            <p className={styles.greetingLineAccent}>with Zilliz Cloud?</p>
          </div>

          <div className={styles.inputArea}>
            <div className={styles.inputRow}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send(input)}
                placeholder="Ask a question..."
                className={styles.input}
                aria-label="Chat message"
              />
              <button
                type="button"
                className={styles.sendRound}
                onClick={() => send(input)}
                disabled={!input.trim()}
                aria-label="Send">
                <Send size={14} strokeWidth={2.5} />
              </button>
            </div>

            <div className={styles.suggestions}>
              <p className={styles.suggestionsLabel}>Suggested questions</p>
              {suggestions.map(q => (
                <button type="button" key={q} className={styles.suggestionBtn} onClick={() => send(q)}>
                  <span>{q}</span>
                  <ChevronRight size={13} strokeWidth={2.5} />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.conversation}>
          <div className={styles.messages} ref={messagesContainerRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`${styles.messageBubble} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}>
                {msg.role === 'assistant' && (
                  <div className={styles.assistantAvatar}><ZillizStarIcon /></div>
                )}
                <div className={msg.role === 'assistant' ? styles.markdownContent : undefined}>
                  {/* Agent label */}
                  {msg.role === 'assistant' && msg.agent && (
                    <span className={isStreaming && i === messages.length - 1 ? styles.agentLabelStreaming : styles.agentLabel}>{msg.agent}</span>
                  )}
                  {msg.role === 'assistant' ? (
                    isStreaming && i === messages.length - 1 && !msg.text ? (
                      <span className={styles.thinkingText}>
                        {msg.toolCallCount
                          ? `searching docs (${msg.toolCallCount} tool call${msg.toolCallCount > 1 ? 's' : ''})...`
                          : 'thinking...'}
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
                      <ConfidenceDot level={msg.confidence} />
                      <button
                        type="button"
                        className={`${styles.feedbackBtn} ${msg.feedback === 'up' ? styles.feedbackBtnActive : ''}`}
                        onClick={() => rateFeedback(i, 'up')}
                        aria-label="Helpful"
                        title="Helpful"
                      >
                        <ThumbsUp size={12} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.feedbackBtn} ${msg.feedback === 'down' ? styles.feedbackBtnActive : ''}`}
                        onClick={() => rateFeedback(i, 'down')}
                        aria-label="Not helpful"
                        title="Not helpful"
                      >
                        <ThumbsDown size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.bottomInput}>
            <div className={styles.inputRow}>
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
              <button
                type="button"
                className={styles.sendRound}
                onClick={() => send(input)}
                disabled={!input.trim() || isStreaming}
                aria-label="Send">
                <Send size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (isExpanded) {
    return (
      <div className={styles.chatInnerExpanded}>
        <ChatHeader onNewChat={newChat} onToggle={onToggle} isExpanded={isExpanded} toggleMode={toggleMode} />
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
      <ChatHeader onNewChat={newChat} onToggle={onToggle} isExpanded={isExpanded} toggleMode={toggleMode} />
      {conversationContent}
    </div>
  );
}
