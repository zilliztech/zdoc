import React, {type ReactNode, useEffect, useState} from 'react';
import {useLocation} from '@docusaurus/router';
import {useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import BackToTopButton from '@theme/BackToTopButton';
import DocRootLayoutMain from '@theme/DocRoot/Layout/Main';
import type {Props} from '@theme/DocRoot/Layout';
import SecondaryNavbar from '@site/src/components/SecondaryNavbar';
import ChatPanel, {ChatProvider} from '@site/src/components/ChatPanel';
import {useChatContext} from '@site/src/components/ChatPanel/ChatContext';
import {MessageSquare, Send} from 'lucide-react';
import DocRootLayoutSidebar from './Sidebar';

import styles from './styles.module.css';

let persistedHiddenContainer = false;
let persistedHidden = false;

function FloatingChatInput({
  onOpen,
  sidebarCollapsed,
}: {
  onOpen: () => void;
  sidebarCollapsed: boolean;
}): ReactNode {
  const {isStreaming, send} = useChatContext();
  const [query, setQuery] = useState('');

  const submit = () => {
    const text = query.trim();
    if (!text || isStreaming) return;
    onOpen();
    setQuery('');
    void send(text);
  };

  return (
    <form
      className={[
        styles.floatingChatInput,
        sidebarCollapsed ? styles.floatingChatInputSidebarCollapsed : '',
      ].filter(Boolean).join(' ')}
      onSubmit={event => {
        event.preventDefault();
        submit();
      }}>
      <MessageSquare size={17} aria-hidden="true" />
      <input
        type="text"
        value={query}
        onChange={event => setQuery(event.target.value)}
        placeholder="Ask Zilliz Copilot..."
        aria-label="Ask Zilliz Copilot"
        disabled={isStreaming}
      />
      <button type="submit" disabled={!query.trim() || isStreaming} aria-label="Send to Copilot">
        <Send size={15} strokeWidth={2.5} />
      </button>
    </form>
  );
}

function DocRootLayoutInner({children}: Props): ReactNode {
  const sidebar = useDocsSidebar();
  const {pathname} = useLocation();
  const [hiddenSidebarContainer, setHiddenSidebarContainerState] = useState(persistedHiddenContainer);
  const [hiddenSidebar, setHiddenSidebarState] = useState(persistedHidden);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);

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
    return () => document.removeEventListener('open-chat', handler);
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
      <SecondaryNavbar />

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

        {isChatOpen && (
          <aside className={styles.chatPane} aria-label="Zilliz Copilot">
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
