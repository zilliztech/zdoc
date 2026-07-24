import React, {useRef, useEffect} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {Send, ChevronRight, ThumbsUp, ThumbsDown, FileText, ArrowLeft} from 'lucide-react';
import {ChatProvider, useChatContext} from '@site/src/components/ChatPanel/ChatContext';
import {DEFAULT_CHAT_ENDPOINT} from '@site/src/components/ChatPanel/endpoints';
import styles from '../styles.module.css';

function BgDecor() {
  return (
    <svg
      className={styles.bgDecor}
      viewBox="0 0 1400 800"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="nf-splash1" cx="0.15" cy="0.2" r="0.4">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nf-splash2" cx="0.85" cy="0.75" r="0.35">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nf-splashWarm" cx="0.9" cy="0.1" r="0.2">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient gradient splashes */}
      <circle cx="200" cy="120" r="320" fill="url(#nf-splash1)" />
      <circle cx="1200" cy="600" r="280" fill="url(#nf-splash2)" />
      <circle cx="1300" cy="80" r="160" fill="url(#nf-splashWarm)" />

      {/* Flowing curves — group 1 */}
      <g className={styles.driftGroup1}>
        <path d="M-20 240 C160 100, 360 200, 500 120 S720 40, 880 160" stroke="#818cf8" strokeWidth="1.8" strokeOpacity="0.25" fill="none" />
        <path d="M-40 440 C100 300, 300 460, 480 340 S680 220, 840 380" stroke="#60a5fa" strokeWidth="1.5" strokeOpacity="0.2" fill="none" />
        <path d="M-10 620 C160 500, 320 600, 460 500 S640 400, 780 520" stroke="#a78bfa" strokeWidth="1.5" strokeOpacity="0.15" fill="none" />
      </g>

      {/* Flowing curves — group 2 */}
      <g className={styles.driftGroup2}>
        <path d="M700 60 C860 180, 1000 40, 1160 140 S1320 240, 1440 80" stroke="#818cf8" strokeWidth="1.8" strokeOpacity="0.3" fill="none" />
        <path d="M660 280 C820 160, 1000 320, 1160 220 S1320 120, 1440 280" stroke="#93c5fd" strokeWidth="1.5" strokeOpacity="0.2" fill="none" />
        <path d="M720 500 C880 380, 1040 520, 1200 420 S1360 320, 1440 480" stroke="#60a5fa" strokeWidth="1.5" strokeOpacity="0.2" fill="none" />
        <path d="M780 680 C920 580, 1080 700, 1240 600 S1380 500, 1440 640" stroke="#a78bfa" strokeWidth="1.5" strokeOpacity="0.15" fill="none" />
      </g>

      {/* Accent dots */}
      <circle cx="640" cy="360" r="4" fill="#818cf8" fillOpacity="0.5" />
      <circle cx="1000" cy="460" r="3.5" fill="#60a5fa" fillOpacity="0.45" />
      <circle cx="380" cy="220" r="3" fill="#a78bfa" fillOpacity="0.4" />
      <circle cx="1160" cy="160" r="2.5" fill="#f97316" fillOpacity="0.35" />
    </svg>
  );
}

const SUGGESTIONS = [
  'How do I get started with Zilliz Cloud?',
  'Search the documentation',
  'Show me the API reference',
];

function ZillizStarIcon({size = 24}: {size?: number}) {
  return <img src="/icons/zilliz-star.svg" width={size} height={size} aria-hidden="true" />;
}

function NotFoundChat() {
  const {messages, input, setInput, isStreaming, send, rateFeedback} = useChatContext();
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTo({top: el.scrollHeight, behavior: 'smooth'});
  }, [messages]);

  const hasMessages = messages.length > 0;

  return (
    <div className={styles.card}>
      {!hasMessages ? (
        <>
          <div className={styles.avatar}>
            <ZillizStarIcon />
          </div>
          <h1 className={styles.heading}>Page not found</h1>
          <p className={styles.subtitle}>I can help you find what you're looking for</p>

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
              aria-label="Send"
            >
              <Send size={15} strokeWidth={2.5} />
            </button>
          </div>

          <div className={styles.suggestions}>
            {SUGGESTIONS.map(q => (
              <button type="button" key={q} className={styles.suggestionBtn} onClick={() => send(q)}>
                <span>{q}</span>
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            ))}
          </div>

          <a href="/" className={styles.backLink}>
            <ArrowLeft size={14} />
            Back to documentation
          </a>
        </>
      ) : (
        <div className={styles.cardConversation}>
          <div className={styles.messages} ref={messagesRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`${styles.messageBubble} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}>
                {msg.role === 'assistant' && (
                  <div className={styles.assistantAvatar}><ZillizStarIcon size={14} /></div>
                )}
                <div className={msg.role === 'assistant' ? styles.markdownContent : undefined}>
                  {msg.role === 'assistant' ? (
                    isStreaming && i === messages.length - 1 && !msg.text ? (
                      <span className={styles.thinkingText}>thinking...</span>
                    ) : (
                      <Markdown remarkPlugins={[remarkGfm]}>{msg.text}</Markdown>
                    )
                  ) : (
                    <p>{msg.text}</p>
                  )}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className={styles.sourcesRow}>
                      {msg.sources.map((src, j) => (
                        <a
                          key={j}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.sourceChip}
                          title={src.title}
                        >
                          <FileText size={12} />
                          <span>{src.title}</span>
                        </a>
                      ))}
                    </div>
                  )}
                  {msg.role === 'assistant' && msg.text && !isStreaming && (
                    <div className={styles.feedbackRow}>
                      <button
                        type="button"
                        className={`${styles.feedbackBtn} ${msg.feedback === 'up' ? styles.feedbackBtnActive : ''}`}
                        onClick={() => rateFeedback(i, 'up')}
                        aria-label="Helpful"
                        title="Helpful"
                      >
                        <ThumbsUp size={13} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.feedbackBtn} ${msg.feedback === 'down' ? styles.feedbackBtnActive : ''}`}
                        onClick={() => rateFeedback(i, 'down')}
                        aria-label="Not helpful"
                        title="Not helpful"
                      >
                        <ThumbsDown size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

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
              aria-label="Send"
            >
              <Send size={15} strokeWidth={2.5} />
            </button>
          </div>

          <a href="/" className={styles.backLink}>
            <ArrowLeft size={14} />
            Back to documentation
          </a>
        </div>
      )}
    </div>
  );
}

function FallbackCard() {
  return (
    <div className={styles.card}>
      <h1 className={styles.heading}>Page not found</h1>
      <p className={styles.subtitle}>We couldn't find what you were looking for</p>
      <a href="/" className={styles.backLink}>
        <ArrowLeft size={14} />
        Back to documentation
      </a>
    </div>
  );
}

export default function NotFoundContent(): React.ReactElement {
  const {siteConfig} = useDocusaurusContext();
  const chatEndpoint = (siteConfig.customFields?.chatEndpoint as string) || DEFAULT_CHAT_ENDPOINT;
  const agentConfigCode = (siteConfig.customFields?.chatAgentConfigCode as string) || 'zilliz_agent_dev';
  const chatDebug = Boolean(siteConfig.customFields?.chatDebug);

  return (
    <div className={styles.pageWrapper}>
      <BgDecor />
      <BrowserOnly fallback={<FallbackCard />}>
        {() => (
          <ErrorBoundary fallback={() => <FallbackCard />}>
            <ChatProvider chatEndpoint={chatEndpoint} agentConfigCode={agentConfigCode} debugDefault={chatDebug}>
              <NotFoundChat />
            </ChatProvider>
          </ErrorBoundary>
        )}
      </BrowserOnly>
    </div>
  );
}
