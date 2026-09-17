import React, {useRef, useEffect} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {ThumbsUp, ThumbsDown, FileText, ArrowLeft} from 'lucide-react';
import AskAiComposer from '../../../components/AskAiComposer';
import {ChatProvider, useChatContext} from '../../../components/ChatPanel/ChatContext';
import {DEFAULT_CHAT_ENDPOINT} from '../../../components/ChatPanel/endpoints';
import {useDocsUiText} from '../../../i18n/uiText';
import styles from '../styles.module.css';

/* The panel's watermark bolt, for the card's empty middle — same path and
   hairline stroke, faded out towards the tail by the mask in .bolt. */
function BoltIcon() {
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

/* The Ask AI panel's header mark, verbatim: the rounded navy tile with the white
   bolt — the panel identifies itself in its header, so this card does the same. */
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

/* The same box as the dock at the foot of every doc page — same skin, same
   click-to-type, same send button. Only the ⌘I hint is dropped: that shortcut
   opens the doc-page chat pane, which does not exist here. */
function Composer() {
  const text = useDocsUiText();
  const {input, setInput, isStreaming, send} = useChatContext();

  return (
    <AskAiComposer
      inFlow
      /* The box is the point of this page, so it opens already focused —
         that is also what puts it in its selected (gradient stroke + ring) state. */
      autoFocus
      className={styles.askBox}
      value={input}
      onChange={setInput}
      onSubmit={() => send(input)}
      placeholder={text.chat.placeholder}
      sendLabel={text.chat.send}
      disabled={isStreaming}
    />
  );
}

function NotFoundChat() {
  const text = useDocsUiText();
  const {messages, send, isStreaming, rateFeedback} = useChatContext();
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTo({top: el.scrollHeight, behavior: 'smooth'});
  }, [messages]);

  const hasMessages = messages.length > 0;

  /* The panel's own header, minus its close button — there is no panel to close
     here, the card IS the page. */
  const askAiHeader = (
    <div className={styles.aiCardHeader}>
      <AskAiAvatarIcon />
      <span className={styles.aiCardTitle}>{text.chat.title}</span>
    </div>
  );

  const backLink = (
    <a href="/" className={styles.backLink}>
      <ArrowLeft size={14} />
      {text.notFound.backToHome}
    </a>
  );

  /* The page's own voice: what happened, and the way out. The assistant's
     opening line is NOT here — it belongs to the card, as its first message. */
  const pageColumn = (
    <div className={styles.pageColumn}>
      <div className={styles.code} aria-hidden="true">404</div>
      <h1 className={styles.heading}>{text.notFound.heading}</h1>
      {/* The sentence names where the card is, and the card moves: beside the
          message on wide screens, under it once the columns stack. Two whole
          strings rather than a spliced-in direction word, so each locale can
          put it wherever its grammar wants. CSS picks one. */}
      <p className={styles.subtitle}>{text.notFound.fallbackSubtitle}</p>
      <p className={`${styles.subtitle} ${styles.subtitleStacked}`}>
        {text.notFound.fallbackSubtitleStacked}
      </p>
      {backLink}
    </div>
  );

  /* The assistant opens the conversation instead of the page introducing it, and
     it opens with a QUESTION — a line that invites an answer rather than one
     that just announces a capability. Bubbled, mirroring the user's own. */
  const greeting = (
    <div className={`${styles.messageBubble} ${styles.assistantGreeting}`}>
      {text.notFound.assistantGreeting}
    </div>
  );

  if (!hasMessages) {
    return (
      <div className={styles.card}>
        {pageColumn}

        <div className={styles.aiCard}>
          {askAiHeader}

          <div className={styles.messages}>{greeting}</div>

          {/* The card stands taller than its content needs, and the watermark
              bolt fills the gap that leaves — it takes the slack, so the box
              and the links stay pinned to the bottom. */}
          <div className={styles.bolt}><BoltIcon /></div>

          {/* Above the box, not below it: the quick links are what you read
              before deciding to type, exactly as in the Ask AI panel. */}
          <div className={styles.suggestions}>
            {text.notFound.suggestions.map(q => (
              <button type="button" key={q} className={styles.suggestionBtn} onClick={() => send(q)}>
                {q}
              </button>
            ))}
          </div>

          <Composer />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      {pageColumn}

      <div className={styles.aiCard}>
        {askAiHeader}

        <div className={`${styles.messages} ${styles.messagesFilled}`} ref={messagesRef}>
          {greeting}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`${styles.messageBubble} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}>
              <div className={msg.role === 'assistant' ? styles.markdownContent : undefined}>
                {msg.role === 'assistant' ? (
                  isStreaming && i === messages.length - 1 && !msg.text ? (
                    <span className={styles.thinkingText}>{text.notFound.thinking}</span>
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
                      aria-label={text.chat.helpful}
                      title={text.chat.helpful}
                    >
                      <ThumbsUp size={13} />
                    </button>
                    <button
                      type="button"
                      className={`${styles.feedbackBtn} ${msg.feedback === 'down' ? styles.feedbackBtnActive : ''}`}
                      onClick={() => rateFeedback(i, 'down')}
                      aria-label={text.chat.notHelpful}
                      title={text.chat.notHelpful}
                    >
                      <ThumbsDown size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <Composer />
      </div>
    </div>
  );
}

/* Server render and the error path: the page column alone, no assistant. */
function FallbackCard() {
  const text = useDocsUiText();
  return (
    <div className={styles.card}>
      <div className={styles.pageColumn}>
        <div className={styles.code} aria-hidden="true">404</div>
        <h1 className={styles.heading}>{text.notFound.heading}</h1>
        <p className={styles.subtitle}>{text.notFound.fallbackSubtitle}</p>
        <p className={`${styles.subtitle} ${styles.subtitleStacked}`}>
          {text.notFound.fallbackSubtitleStacked}
        </p>
        <a href="/" className={styles.backLink}>
          <ArrowLeft size={14} />
          {text.notFound.backToHome}
        </a>
      </div>
    </div>
  );
}

export default function NotFoundContent(): React.ReactElement {
  const {siteConfig} = useDocusaurusContext();
  const chatEndpoint = (siteConfig.customFields?.chatEndpoint as string) || DEFAULT_CHAT_ENDPOINT;
  const chatDebug = Boolean(siteConfig.customFields?.chatDebug);

  // The 404 runs chrome-less: the topbar is hidden through this body class (see
  // :global(body.zd-notfound-page) in ../styles.module.css), removed again on
  // unmount so navigating away restores it.
  // It lives HERE and not in the NotFound wrapper because a miss under /docs is
  // rendered by the docs plugin's own route — the html still carries
  // `docs-wrapper plugin-docs` — which mounts this Content directly and never
  // renders @theme/NotFound at all.
  useEffect(() => {
    document.body.classList.add('zd-notfound-page');
    return () => document.body.classList.remove('zd-notfound-page');
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <BrowserOnly fallback={<FallbackCard />}>
        {() => (
          <ErrorBoundary fallback={() => <FallbackCard />}>
            <ChatProvider chatEndpoint={chatEndpoint} debugDefault={chatDebug}>
              <NotFoundChat />
            </ChatProvider>
          </ErrorBoundary>
        )}
      </BrowserOnly>
    </div>
  );
}
