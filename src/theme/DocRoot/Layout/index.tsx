import React, {type ReactNode, useEffect, useRef, useState} from 'react';
import {useLocation} from '@docusaurus/router';
import {useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import BackToTopButton from '@theme/BackToTopButton';
import DocRootLayoutSidebar from '@theme/DocRoot/Layout/Sidebar';
import DocRootLayoutMain from '@theme/DocRoot/Layout/Main';
import type {Props} from '@theme/DocRoot/Layout';
import ChatPanel, {ChatProvider} from '@site/src/components/ChatPanel';
import {useChatContext} from '@site/src/components/ChatPanel/ChatContext';
import {ArrowUp} from 'lucide-react';

import styles from './styles.module.css';

let persistedHiddenContainer = false;
let persistedHidden = false;

function isMacPlatform() {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}

function FloatingChatInput({
  onOpen,
  sidebarCollapsed,
}: {
  onOpen: () => void;
  sidebarCollapsed: boolean;
}): ReactNode {
  const {isStreaming, send} = useChatContext();
  const [query, setQuery] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const submit = () => {
    const text = query.trim();
    if (!text || isStreaming) return;
    onOpen();
    setQuery('');
    void send(text);
  };

  const collapsedClass = sidebarCollapsed ? styles.floatingChatInputSidebarCollapsed : '';

  return (
    <>
      {/* White backdrop sitting BEHIND the input (below its z-index) so scrolling
          document content disappears from just above the box down to the floor,
          without ever covering the input's own border. */}
      <div
        className={[styles.floatingChatBackdrop, collapsedClass].filter(Boolean).join(' ')}
        aria-hidden="true"
      />
      <form
        ref={formRef}
        className={[styles.floatingChatInput, collapsedClass].filter(Boolean).join(' ')}
        onSubmit={event => {
          event.preventDefault();
          submit();
        }}>
        <input
          type="text"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Ask a question..."
          aria-label="Ask a question"
          disabled={isStreaming}
        />
        <div className={styles.floatingFooter}>
          <kbd className={styles.chatKbd}>{isMacPlatform() ? '⌘I' : 'Ctrl I'}</kbd>
          <button type="submit" disabled={!query.trim() || isStreaming} aria-label="Send question">
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </>
  );
}

function SelectionAskAiButton(): ReactNode {
  const [pos, setPos] = useState<{x: number; y: number} | null>(null);
  const textRef = useRef('');

  useEffect(() => {
    const onUp = () => {
      // Defer one tick so the browser finalizes the selection first.
      setTimeout(() => {
        const sel = window.getSelection();
        const text = sel ? sel.toString().trim() : '';
        const article = document.querySelector('article');
        if (!sel || sel.isCollapsed || !text || text.length < 2 || !article) {
          setPos(null);
          return;
        }
        const anchor = sel.anchorNode;
        if (!anchor || !article.contains(anchor)) {
          setPos(null);
          return;
        }
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        if (!rect || (rect.width === 0 && rect.height === 0)) {
          setPos(null);
          return;
        }
        textRef.current = text;
        setPos({x: rect.left + rect.width / 2, y: rect.top});
      }, 0);
    };
    const onDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement)?.closest?.('[data-selection-ask-ai]')) return;
      setPos(null);
    };
    document.addEventListener('mouseup', onUp);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('mousedown', onDown);
    };
  }, []);

  if (!pos) return null;
  return (
    <button
      type="button"
      data-selection-ask-ai=""
      className={styles.selectionAskAi}
      style={{left: pos.x, top: pos.y}}
      onMouseDown={e => e.preventDefault()}
      onClick={() => {
        const text = textRef.current;
        if (!text) return;
        document.dispatchEvent(new CustomEvent('open-chat'));
        document.dispatchEvent(new CustomEvent('ask-ai-context', {detail: {kind: 'text', content: text, label: text}}));
        window.getSelection()?.removeAllRanges();
        setPos(null);
      }}>
      <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true">
        <path d="M0 8.55556L5.6 0L4.8 5.64912H8L1.6 14L3.2 8.55556H0Z" fill="currentColor" />
      </svg>
      Ask AI
    </button>
  );
}

function DocRootLayoutInner({children}: Props): ReactNode {
  const sidebar = useDocsSidebar();
  const {pathname} = useLocation();
  const [hiddenSidebarContainer, setHiddenSidebarContainerState] = useState(persistedHiddenContainer);
  const [hiddenSidebar, setHiddenSidebarState] = useState(persistedHidden);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [chatWidth, setChatWidth] = useState<number | null>(null);
  // Keep the pane mounted briefly after close so it can play a slide-out
  // (the mirror of the open animation) instead of vanishing instantly.
  const [chatRender, setChatRender] = useState(false);
  const [chatClosing, setChatClosing] = useState(false);
  useEffect(() => {
    if (isChatOpen) {
      setChatRender(true);
      setChatClosing(false);
      return;
    }
    setChatClosing(true);
    const t = setTimeout(() => setChatRender(false), 320);
    return () => clearTimeout(t);
  }, [isChatOpen]);

  const startChatResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const pane = (e.currentTarget as HTMLElement).parentElement;
    if (!pane) return;
    const startX = e.clientX;
    const startWidth = pane.getBoundingClientRect().width;
    const onMove = (ev: MouseEvent) => {
      // dragging left widens the panel
      const next = Math.min(Math.round(window.innerWidth * 0.6), Math.max(320, startWidth + (startX - ev.clientX)));
      setChatWidth(next);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.userSelect = 'none';
  };

  const setHiddenSidebarContainer = (value: boolean | ((prev: boolean) => boolean)) => {
    setHiddenSidebarContainerState(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      persistedHiddenContainer = next;
      return next;
    });
  };

  const setHiddenSidebar = (value: boolean | ((prev: boolean) => boolean)) => {
    setHiddenSidebarState(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      persistedHidden = next;
      return next;
    });
  };

  useEffect(() => {
    setIsChatExpanded(false);
  }, [pathname]);

  useEffect(() => {
    const handler = (event: Event) => {
      const query = (event as CustomEvent).detail?.query;
      setIsChatOpen(true);
      if (query) {
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent('chat-send', {detail: {query}}));
        }, 100);
      }
    };
    document.addEventListener('open-chat', handler);
    const toggleHandler = () => setIsChatOpen(prev => !prev);
    document.addEventListener('toggle-chat', toggleHandler);
    return () => {
      document.removeEventListener('open-chat', handler);
      document.removeEventListener('toggle-chat', toggleHandler);
    };
  }, []);

  // Cmd/Ctrl+I opens the right chat panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'i' || e.key === 'I')) {
        e.preventDefault();
        setIsChatOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('chat')) return;

    setIsChatOpen(true);
    const query = params.get('chat');
    if (query && query !== '1') {
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('chat-send', {detail: {query}}));
      }, 300);
    }

    const url = new URL(window.location.href);
    url.searchParams.delete('chat');
    window.history.replaceState({}, '', url.toString());
  }, []);

  const openChat = () => setIsChatOpen(true);

  return (
    <div className={[styles.docsWrapper, isChatOpen ? 'docs-chat-open' : ''].filter(Boolean).join(' ')}>
      <BackToTopButton />
      <SelectionAskAiButton />

      <div className={styles.docRoot}>
        {sidebar && (
          <DocRootLayoutSidebar
            sidebar={sidebar.items}
            hiddenSidebarContainer={hiddenSidebarContainer}
            setHiddenSidebarContainer={setHiddenSidebarContainer}
            hiddenSidebar={hiddenSidebar}
            setHiddenSidebar={setHiddenSidebar}
          />
        )}

        <DocRootLayoutMain hiddenSidebarContainer={hiddenSidebarContainer}>
          {children}
        </DocRootLayoutMain>

        {chatRender && (
          <aside
            className={[styles.chatPane, chatClosing ? styles.chatPaneClosing : ''].filter(Boolean).join(' ')}
            aria-label="Zilliz Copilot"
            style={chatWidth ? {flex: `0 0 ${chatWidth}px`, width: `${chatWidth}px`, maxWidth: 'none'} : undefined}>
            <div className={styles.chatResizer} onMouseDown={startChatResize} role="separator" aria-orientation="vertical">
              <span className={styles.chatResizerGrip} />
            </div>
            <ChatPanel
              isExpanded={false}
              onToggle={() => setIsChatOpen(false)}
              toggleMode="minimize"
            />
          </aside>
        )}
      </div>

      {isChatExpanded && (
        <div className={styles.chatOverlay}>
          <ChatPanel
            isExpanded={true}
            onToggle={() => setIsChatExpanded(false)}
          />
        </div>
      )}

      {!isChatOpen && (
        <FloatingChatInput
          onOpen={openChat}
          sidebarCollapsed={hiddenSidebarContainer || !sidebar}
        />
      )}
    </div>
  );
}

export default function DocRootLayout(props: Props): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const chatEndpoint = (siteConfig.customFields?.chatEndpoint as string) || '/api/chat';
  const chatDebug = Boolean(siteConfig.customFields?.chatDebug);

  return (
    <ChatProvider chatEndpoint={chatEndpoint} debugDefault={chatDebug}>
      <DocRootLayoutInner {...props} />
    </ChatProvider>
  );
}
