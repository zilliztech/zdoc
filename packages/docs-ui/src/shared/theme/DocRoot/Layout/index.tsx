import React, {type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {useLocation} from '@docusaurus/router';
import {useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import BackToTopButton from '@theme/BackToTopButton';
import DocRootLayoutSidebar from './Sidebar';
import DocRootLayoutMain from '@theme/DocRoot/Layout/Main';
import NotFoundContent from '@theme/NotFound/Content';
import Head from '@docusaurus/Head';
import type {Props} from '@theme/DocRoot/Layout';
import ChatPanel, {ChatProvider} from '../../../components/ChatPanel';
import AskAiComposer from '../../../components/AskAiComposer';
import {useChatContext} from '../../../components/ChatPanel/ChatContext';
import {DEFAULT_CHAT_ENDPOINT} from '../../../components/ChatPanel/endpoints';
import {useDocsUiText} from '../../../i18n/uiText';
import {sidebarPathIsNextChannel, sidebarPathIsRetiredChannel, useRuntimeReleaseChannel} from '../../../utils/releaseChannel';

import styles from './styles.module.css';

let persistedHiddenContainer = false;
let persistedHidden = false;
const NAV_COMPACT_ENTER_WIDTH = 1260;
const NAV_COMPACT_EXIT_WIDTH = 1300;
const NAV_MOBILE_ENTER_WIDTH = 760;
const NAV_MOBILE_EXIT_WIDTH = 800;
const CHAT_MIN_WIDTH = 320;
const CHAT_PANE_ANIMATION_MS = 320;
const useBrowserLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function isMacPlatform() {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}

function getDefaultChatPaneWidth(viewportWidth: number) {
  return Math.min(544, Math.max(384, Math.round(viewportWidth * 0.3)));
}

function getMaxChatPaneWidth(viewportWidth: number) {
  return Math.max(CHAT_MIN_WIDTH, Math.round(viewportWidth * 0.5));
}

function FloatingChatInput({
  onOpen,
  sidebarCollapsed,
}: {
  onOpen: () => void;
  sidebarCollapsed: boolean;
}): ReactNode {
  const text = useDocsUiText();
  const {isStreaming, send} = useChatContext();
  const {pathname} = useLocation();
  const [query, setQuery] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // `navigator` is unavailable during server-side render, so the SSR hint must
  // match the first client render exactly: start from the platform-neutral
  // text and swap in the platform hint only after hydration. A server/client
  // text mismatch here fails the whole root's hydration (React #425/#423) and
  // forces a full client-side re-render that races the Inkeep search modal —
  // the modal "closes" mid-interaction, the commit throws
  // NotFoundError: removeChild, and the navbar is left dead until reload.
  const [kbdHint, setKbdHint] = useState('Ctrl I');
  useEffect(() => {
    if (isMacPlatform()) setKbdHint('⌘I');
  }, []);
  // Align the box with the actual doc content column (so it tracks the column at
  // every width — incl. when the content is centred on wide screens or on pages
  // with a different layout like Releases). CSS calc() can't follow that.
  const [box, setBox] = useState<{left: number; width: number} | null>(null);
  // The home page replaces its old "Can't find…" banner with a plate wrapped
  // around this composer, so the dock has to know it is on the home page.
  const isHome = /\/docs\/home\/?$/.test(pathname);
  const [formHeight, setFormHeight] = useState(0);
  // The plate belongs to the foot of the page, not to hover: hovering the
  // composer anywhere still just lights its own gradient ring.
  const [atBottom, setAtBottom] = useState(false);
  useEffect(() => {
    const measure = () => {
      if (typeof window === 'undefined' || window.innerWidth < 768) {
        setBox(null);
        return;
      }
      const col = document.querySelector<HTMLElement>('[class*="docItemCol"]');
      const article = col?.querySelector('article') ?? document.querySelector('article');
      const target = article ?? col;
      if (!target) {
        setBox(null);
        return;
      }
      const r = target.getBoundingClientRect();
      if (r.width === 0) return; // not laid out yet — keep the last good value
      setBox({left: Math.round(r.left), width: Math.round(r.width)});
      if (formRef.current) setFormHeight(Math.round(formRef.current.getBoundingClientRect().height));
    };
    measure();
    const raf = requestAnimationFrame(() => requestAnimationFrame(measure));
    window.addEventListener('resize', measure);
    const main = document.querySelector('[class*="docMainContainer"]');
    const ro = new ResizeObserver(measure);
    if (main) ro.observe(main);
    if (formRef.current) ro.observe(formRef.current);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      ro.disconnect();
    };
  }, [pathname, sidebarCollapsed]);
  // The dock floats over scrolling content. Sized to exactly the content column,
  // a card or table border sits on the very same pixel column as the box's own
  // edge and flickers through as it scrolls past. One pixel of overhang per side
  // puts the white face — and the backdrop behind it — over that column.
  // Reaching the foot of the home page is the moment the old banner used to
  // ask its question, so the composer takes focus there instead. It re-arms
  // only after scrolling away, and never steals focus from another control.
  // NOTE: the document itself does not scroll — `main.docMainContainer` is the
  // scroller, so a window scroll listener never fires here.
  useEffect(() => {
    if (!isHome || typeof window === 'undefined') return;
    let armed = true;
    let scroller: HTMLElement | null = null;
    const onScroll = () => {
      if (!scroller) return;
      // Guard against first paint, before the article has been laid out.
      if (scroller.scrollHeight <= scroller.clientHeight + 200) return;
      const bottomed = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 8;
      setAtBottom(bottomed);
      if (!bottomed) {
        armed = true;
        return;
      }
      if (!armed) return;
      armed = false;
      const active = document.activeElement;
      if (active && active !== document.body && active !== document.documentElement) return;
      inputRef.current?.focus({preventScroll: true});
    };
    // The scroller is mounted by the time this runs on a client navigation, but
    // not always on a cold load, so poll a few frames for it.
    let tries = 0;
    let raf = 0;
    const attach = () => {
      scroller = document.querySelector<HTMLElement>('[class*="docMainContainer"]');
      if (scroller) {
        scroller.addEventListener('scroll', onScroll, {passive: true});
        return;
      }
      if (tries++ < 60) raf = requestAnimationFrame(attach);
    };
    attach();
    return () => {
      cancelAnimationFrame(raf);
      scroller?.removeEventListener('scroll', onScroll);
    };
  }, [isHome]);

  const DOCK_OVERHANG = 1;
  // Gap between the plate's edge and the composer inside it.
  // Sides and bottom hug the composer; the top strip is deeper because it
  // carries the question.
  const DOCK_PLATE_PAD = 3;
  const DOCK_PLATE_HEADING = 34;
  // Exposed to CSS so the backdrop can grow by exactly the plate's extra height.
  const plateExtra = DOCK_PLATE_PAD * 2 + DOCK_PLATE_HEADING;
  const boxStyle: React.CSSProperties | undefined = box
    ? {left: box.left - DOCK_OVERHANG, width: box.width + DOCK_OVERHANG * 2, right: 'auto'}
    : undefined;
  // Rendered as soon as it can be measured, then faded in — mounting it on
  // hover made it pop in with no transition to animate.
  const plateReady = isHome && !!box && formHeight > 0;
  const showPlate = plateReady && atBottom;
  const plateStyle: React.CSSProperties | undefined = box
    ? {
        left: box.left - DOCK_OVERHANG - DOCK_PLATE_PAD,
        width: box.width + DOCK_OVERHANG * 2 + DOCK_PLATE_PAD * 2,
        right: 'auto',
        // Collapsed to exactly the composer's height when hidden: the plate
        // then grows upward from behind it instead of appearing all at once.
        height: showPlate ? formHeight + plateExtra : formHeight,
        ['--dock-form-h' as string]: `${formHeight}px`,
        ['--dock-plate-pad' as string]: `${DOCK_PLATE_PAD}px`,
      }
    : undefined;

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
        className={[
          styles.floatingChatBackdrop,
          showPlate ? styles.floatingChatBackdropPlated : '',
          collapsedClass,
        ]
          .filter(Boolean)
          .join(' ')}
        /* With a plate the white fade has to clear the plate's own top edge and
           side overhang, or document content shows through right against it. */
        style={showPlate ? {left: plateStyle!.left, width: plateStyle!.width, right: 'auto'} : boxStyle}
        aria-hidden="true"
      />
      {plateReady && (
        <div
          className={[styles.dockPlate, showPlate ? styles.dockPlateVisible : '', collapsedClass]
            .filter(Boolean)
            .join(' ')}
          aria-hidden={!showPlate}
          style={plateStyle}>
          <span className={styles.dockPlateHeading}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="6.1" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6.3 6.25a1.75 1.75 0 1 1 1.75 1.9v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8.05" cy="11.15" r="0.7" fill="currentColor" />
            </svg>
            {text.chat.dockPrompt}
          </span>
        </div>
      )}
      {/* Skin, click-to-type and send button come from the shared composer; this
          file keeps only what makes THIS instance a dock — the fixed position
          and the measured content-column alignment. */}
      <AskAiComposer
        formRef={formRef}
        inputRef={inputRef}
        value={query}
        onChange={setQuery}
        onSubmit={submit}
        placeholder={text.chat.placeholder}
        sendLabel={text.chat.sendQuestion}
        disabled={isStreaming}
        flat={showPlate}
        hint={kbdHint}
        className={[styles.floatingChatInput, collapsedClass].filter(Boolean).join(' ')}
        style={boxStyle}
      />
    </>
  );
}

function SelectionAskAiButton(): ReactNode {
  const text = useDocsUiText();
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
      {text.chat.askAi}
    </button>
  );
}

function DocRootLayoutInner({children}: Props): ReactNode {
  const text = useDocsUiText();
  const sidebar = useDocsSidebar();
  const {pathname} = useLocation();
  // The Docs Home landing page renders full-width (no left sidebar).
  const isHomePage = pathname.replace(/\/$/, '') === '/docs/home';
  const [hiddenSidebarContainer, setHiddenSidebarContainerState] = useState(persistedHiddenContainer);
  const [hiddenSidebar, setHiddenSidebarState] = useState(persistedHidden);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [chatWidth, setChatWidth] = useState<number | null>(null);
  const navCompactRef = useRef(false);
  const chatCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Pre-mount the pane offscreen so opening only transitions transform instead
  // of waiting for the full chat tree to mount after the click.
  const [chatRender, setChatRender] = useState(false);
  const [chatClosing, setChatClosing] = useState(false);
  const navMobileRef = useRef(false);

  useEffect(() => {
    setChatRender(true);
  }, []);
  useBrowserLayoutEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousRootHeight = root.style.height;
    const previousBodyHeight = body.style.height;
    document.documentElement.classList.add('zdoc-docs-page');
    document.body.classList.add('zdoc-docs-page');
    root.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    root.style.height = '100%';
    body.style.height = '100%';
    return () => {
      document.documentElement.classList.remove('zdoc-docs-page');
      document.body.classList.remove('zdoc-docs-page');
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      root.style.height = previousRootHeight;
      body.style.height = previousBodyHeight;
    };
  }, []);
  const clearChatCloseTimer = useCallback(() => {
    if (!chatCloseTimerRef.current) return;
    clearTimeout(chatCloseTimerRef.current);
    chatCloseTimerRef.current = null;
  }, []);
  const openChat = useCallback(() => {
    clearChatCloseTimer();
    setChatRender(true);
    setChatClosing(false);
    setIsChatOpen(true);
  }, [clearChatCloseTimer]);
  const closeChat = useCallback(() => {
    clearChatCloseTimer();
    setIsChatOpen(false);
    setChatClosing(true);
    chatCloseTimerRef.current = setTimeout(() => {
      setChatClosing(false);
      chatCloseTimerRef.current = null;
    }, CHAT_PANE_ANIMATION_MS);
  }, [clearChatCloseTimer]);
  const toggleChat = useCallback(() => {
    if (isChatOpen) closeChat();
    else openChat();
  }, [closeChat, isChatOpen, openChat]);
  const isChatVisible = isChatOpen || chatClosing;
  const isChatLayoutReserved = isChatOpen;

  useEffect(() => () => clearChatCloseTimer(), [clearChatCloseTimer]);

  // Mirror chat-open onto <body> so the navbar (outside the docs wrapper) can be
  // compressed to the panel's left edge, and expose the pane width as a root var.
  useBrowserLayoutEffect(() => {
    document.body.classList.toggle('docs-chat-open', isChatLayoutReserved);
    return () => document.body.classList.remove('docs-chat-open');
  }, [isChatLayoutReserved]);
  const updateNavCompact = useCallback((paneWidthOverride?: number) => {
    const viewportWidth = window.innerWidth;
    const paneWidth = isChatLayoutReserved
      ? (paneWidthOverride ?? chatWidth ?? getDefaultChatPaneWidth(viewportWidth))
      : 0;
    const availableWidth = viewportWidth - paneWidth;
    const next = navCompactRef.current
      ? availableWidth < NAV_COMPACT_EXIT_WIDTH
      : availableWidth <= NAV_COMPACT_ENTER_WIDTH;
    const nextMobile = navMobileRef.current
      ? isChatLayoutReserved && viewportWidth < NAV_MOBILE_EXIT_WIDTH
      : isChatLayoutReserved && viewportWidth <= NAV_MOBILE_ENTER_WIDTH;
    navCompactRef.current = next;
    navMobileRef.current = nextMobile;
    document.body.classList.toggle('docs-nav-compact', next);
    document.body.classList.toggle('docs-nav-mobile', nextMobile);
  }, [chatWidth, isChatLayoutReserved]);
  useBrowserLayoutEffect(() => {
    const updateIfNotResizing = () => {
      if (document.body.classList.contains('docs-chat-resizing')) return;
      updateNavCompact();
    };
    updateIfNotResizing();
    window.addEventListener('resize', updateIfNotResizing);
    return () => {
      window.removeEventListener('resize', updateIfNotResizing);
    };
  }, [updateNavCompact]);
  useEffect(() => () => {
    document.body.classList.remove('docs-nav-compact');
    document.body.classList.remove('docs-nav-mobile');
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    if (chatWidth) root.style.setProperty('--chat-pane-w', `${chatWidth}px`);
    else root.style.removeProperty('--chat-pane-w');
  }, [chatWidth]);
  useEffect(() => {
    if (!isChatOpen) return;
    const clampChatWidth = () => {
      const maxWidth = getMaxChatPaneWidth(window.innerWidth);
      const currentWidth = chatWidth ?? getDefaultChatPaneWidth(window.innerWidth);
      if (currentWidth > maxWidth) setChatWidth(maxWidth);
    };
    clampChatWidth();
    window.addEventListener('resize', clampChatWidth);
    return () => window.removeEventListener('resize', clampChatWidth);
  }, [chatWidth, isChatOpen]);

  const startChatResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const root = document.documentElement;
    const navbarRight = document.querySelector<HTMLElement>('[class*="navbarRight"]');
    const navbarRightRect = navbarRight?.getBoundingClientRect();
    if (navbarRightRect) {
      root.style.setProperty('--navbar-right-freeze-left', `${navbarRightRect.left}px`);
      root.style.setProperty('--navbar-right-freeze-top', `${navbarRightRect.top}px`);
      root.style.setProperty('--navbar-right-freeze-width', `${navbarRightRect.width}px`);
      root.style.setProperty('--navbar-right-freeze-height', `${navbarRightRect.height}px`);
    }
    document.body.classList.add('docs-chat-resizing');
    const pane = (e.currentTarget as HTMLElement).parentElement;
    if (!pane) {
      document.body.classList.remove('docs-chat-resizing');
      root.style.removeProperty('--navbar-right-freeze-left');
      root.style.removeProperty('--navbar-right-freeze-top');
      root.style.removeProperty('--navbar-right-freeze-width');
      root.style.removeProperty('--navbar-right-freeze-height');
      return;
    }
    const startX = e.clientX;
    const startWidth = pane.getBoundingClientRect().width;
    let lastWidth = startWidth;
    const onMove = (ev: MouseEvent) => {
      // dragging left widens the panel
      const maxWidth = getMaxChatPaneWidth(window.innerWidth);
      const next = Math.min(maxWidth, Math.max(CHAT_MIN_WIDTH, startWidth + (startX - ev.clientX)));
      lastWidth = next;
      setChatWidth(next);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
      document.body.classList.remove('docs-chat-resizing');
      root.style.removeProperty('--navbar-right-freeze-left');
      root.style.removeProperty('--navbar-right-freeze-top');
      root.style.removeProperty('--navbar-right-freeze-width');
      root.style.removeProperty('--navbar-right-freeze-height');
      updateNavCompact(lastWidth);
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
      openChat();
      if (query) {
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent('chat-send', {detail: {query}}));
        }, 100);
      }
    };
    document.addEventListener('open-chat', handler);
    const toggleHandler = () => toggleChat();
    document.addEventListener('toggle-chat', toggleHandler);
    return () => {
      document.removeEventListener('open-chat', handler);
      document.removeEventListener('toggle-chat', toggleHandler);
    };
  }, [openChat, toggleChat]);

  // Cmd/Ctrl+I opens the right chat panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'i' || e.key === 'I')) {
        e.preventDefault();
        toggleChat();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [toggleChat]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('chat')) return;

    openChat();
    const query = params.get('chat');
    if (query && query !== '1') {
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('chat-send', {detail: {query}}));
      }, 300);
    }

    const url = new URL(window.location.href);
    url.searchParams.delete('chat');
    window.history.replaceState({}, '', url.toString());
  }, [openChat]);

  return (
    <div className={[styles.docsWrapper, isChatLayoutReserved ? 'docs-chat-open' : '', isHomePage ? 'docs-home' : ''].filter(Boolean).join(' ')}>
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
            className={[
              styles.chatPane,
              !isChatVisible ? styles.chatPaneIdle : '',
              chatClosing ? styles.chatPaneClosing : '',
            ].filter(Boolean).join(' ')}
            aria-label={text.chat.panelLabel}
            aria-hidden={!isChatVisible}>
            <div className={styles.chatResizer} onMouseDown={startChatResize} role="separator" aria-orientation="vertical">
              <span className={styles.chatResizerGrip} />
            </div>
            <ChatPanel
              isExpanded={false}
              onToggle={closeChat}
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

      {!isChatVisible && (
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
  const chatEndpoint = (siteConfig.customFields?.chatEndpoint as string) || DEFAULT_CHAT_ENDPOINT;
  const chatDebug = Boolean(siteConfig.customFields?.chatDebug);
  // A page on the deployment's hidden channel renders the shared 404 page in
  // place of the whole docs shell — the exact presentation of a native miss
  // under /docs (no sidebar, chrome-less), not an in-page variant of it. A
  // NEXT page on a CURRENT deployment hides unreleased content; a
  // RETIRE-IN-NEXT page on a NEXT deployment hides the page the upcoming
  // release removes, so the next channel previews the post-split world. The
  // sidebar entry's customProps carry the channel here because the doc front
  // matter is only available below this layout.
  const runtimeChannel = useRuntimeReleaseChannel();
  const sidebar = useDocsSidebar();
  const {pathname} = useLocation();
  if (
    runtimeChannel !== 'next'
      && sidebar
      && sidebarPathIsNextChannel(sidebar.items, pathname)
  ) {
    return (
      <>
        <Head>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <NotFoundContent />
      </>
    );
  }
  if (
    runtimeChannel === 'next'
      && sidebar
      && sidebarPathIsRetiredChannel(sidebar.items, pathname)
  ) {
    return (
      <>
        <Head>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <NotFoundContent />
      </>
    );
  }

  return (
    <ChatProvider chatEndpoint={chatEndpoint} debugDefault={chatDebug}>
      <DocRootLayoutInner {...props} />
    </ChatProvider>
  );
}
