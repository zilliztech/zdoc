import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { usePluginData } from '@docusaurus/useGlobalData';
import styles from './CopyPageButton.module.css';

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

// ── Icons ────────────────────────────────────────────────────────────────────

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2H3.5A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8.5L6.5 12L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"
    style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
    <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MarkdownIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 15V9l3 3 3-3v6M17 15l-2-3M17 15l2-3M17 15v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M2 12C2 12 5 6 12 6s10 6 10 6-3 6-10 6S2 12 2 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const OpenAIIcon = () => (
  <svg fill="currentColor" fillRule="evenodd" height="18" width="18" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.55 10.004a5.416 5.416 0 00-.478-4.501c-1.217-2.09-3.662-3.166-6.05-2.66A5.59 5.59 0 0010.831 1C8.39.995 6.224 2.546 5.473 4.838A5.553 5.553 0 001.76 7.496a5.487 5.487 0 00.691 6.5 5.416 5.416 0 00.477 4.502c1.217 2.09 3.662 3.165 6.05 2.66A5.586 5.586 0 0013.168 23c2.443.006 4.61-1.546 5.361-3.84a5.553 5.553 0 003.715-2.66 5.488 5.488 0 00-.693-6.497v.001zm-8.381 11.558a4.199 4.199 0 01-2.675-.954c.034-.018.093-.05.132-.074l4.44-2.53a.71.71 0 00.364-.623v-6.176l1.877 1.069c.02.01.033.029.036.05v5.115c-.003 2.274-1.87 4.118-4.174 4.123zM4.192 17.78a4.059 4.059 0 01-.498-2.763c.032.02.09.055.131.078l4.44 2.53c.225.13.504.13.73 0l5.42-3.088v2.138a.068.068 0 01-.027.057L9.9 19.288c-1.999 1.136-4.552.46-5.707-1.51h-.001zM3.023 8.216A4.15 4.15 0 015.198 6.41l-.002.151v5.06a.711.711 0 00.364.624l5.42 3.087-1.876 1.07a.067.067 0 01-.063.005l-4.489-2.559c-1.995-1.14-2.679-3.658-1.53-5.63h.001zm15.417 3.54l-5.42-3.088L14.896 7.6a.067.067 0 01.063-.006l4.489 2.557c1.998 1.14 2.683 3.662 1.529 5.633a4.163 4.163 0 01-2.174 1.807V12.38a.71.71 0 00-.363-.623zm1.867-2.773a6.04 6.04 0 00-.132-.078l-4.44-2.53a.731.731 0 00-.729 0l-5.42 3.088V7.325a.068.068 0 01.027-.057L14.1 4.713c2-1.137 4.555-.46 5.707 1.513.487.833.664 1.809.499 2.757h.001zm-11.741 3.81l-1.877-1.068a.065.065 0 01-.036-.051V6.559c.001-2.277 1.873-4.122 4.181-4.12.976 0 1.92.338 2.671.954-.034.018-.092.05-.131.073l-4.44 2.53a.71.71 0 00-.365.623l-.003 6.173v.002zm1.02-2.168L12 9.25l2.414 1.375v2.75L12 14.75l-2.415-1.375v-2.75z" />
  </svg>
);

const CursorIcon = () => (
  <svg fill="currentColor" fillRule="evenodd" height="18" width="18" viewBox="0 0 466.7 532.1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <path d="M457.4 126 244.4 3c-6.8-4-15.3-4-22.1 0L9.3 126A18.6 18.6 0 0 0 0 142v248c0 6.7 3.6 12.8 9.3 16.2l213 123c6.8 3.9 15.3 3.9 22.1 0l213-123c5.8-3.4 9.3-9.5 9.3-16.2V142c0-6.6-3.5-12.7-9.3-16Zm-13.3 26L238.4 508.2c-1.4 2.4-5 1.4-5-1.4V273.6c0-4.7-2.5-9-6.6-11.3l-202-116.6c-2.3-1.4-1.3-5 1.4-5h411.3c5.8 0 9.5 6.2 6.6 11.3Z" />
  </svg>
);

// Claude logo (official sunburst mark)
const ClaudeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="m3.127 10.604 3.135-1.76.053-.153-.053-.085H6.11l-.525-.032-1.791-.048-1.554-.065-1.505-.08-.38-.081L0 7.832l.036-.234.32-.214.455.04 1.009.069 1.513.105 1.097.064 1.626.17h.259l.036-.105-.089-.065-.068-.064-1.566-1.062-1.695-1.121-.887-.646-.48-.327-.243-.306-.104-.67.435-.48.585.04.15.04.593.456 1.267.981 1.654 1.218.242.202.097-.068.012-.049-.109-.181-.9-1.626-.96-1.655-.428-.686-.113-.411a2 2 0 0 1-.068-.484l.496-.674L4.446 0l.662.089.279.242.411.94.666 1.48 1.033 2.014.302.597.162.553.06.17h.105v-.097l.085-1.134.157-1.392.154-1.792.052-.504.25-.605.497-.327.387.186.319.456-.045.294-.19 1.23-.37 1.93-.243 1.29h.142l.161-.16.654-.868 1.097-1.372.484-.545.565-.601.363-.287h.686l.505.751-.226.775-.707.895-.585.759-.839 1.13-.524.904.048.072.125-.012 1.897-.403 1.024-.186 1.223-.21.553.258.06.263-.218.536-1.307.323-1.533.307-2.284.54-.028.02.032.04 1.029.098.44.024h1.077l2.005.15.525.346.315.424-.053.323-.807.411-3.631-.863-.872-.218h-.12v.073l.726.71 1.331 1.202 1.667 1.55.084.383-.214.302-.226-.032-1.464-1.101-.565-.497-1.28-1.077h-.084v.113l.295.432 1.557 2.34.08.718-.112.234-.404.141-.444-.08-.911-1.28-.94-1.44-.759-1.291-.093.053-.448 4.821-.21.246-.484.186-.403-.307-.214-.496.214-.98.258-1.28.21-1.016.19-1.263.112-.42-.008-.028-.092.012-.953 1.307-1.448 1.957-1.146 1.227-.274.109-.477-.247.045-.44.266-.39 1.586-2.018.956-1.25.617-.723-.004-.105h-.036l-4.212 2.736-.75.096-.324-.302.04-.496.154-.162 1.267-.871z" />
  </svg>
);

// Up-right arrow — marks actions that open in a new tab
const ExternalArrowIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5.5 10.5L10.5 5.5M10.5 5.5H6M10.5 5.5V10" />
  </svg>
);

// ── Types ────────────────────────────────────────────────────────────────────

type ActionId = 'copyMarkdown' | 'viewSource' | 'openChatGPT' | 'openClaude' | 'connectCursor';

interface MenuItem {
  id: ActionId;
  icon: React.ReactElement;
  title: string;
  desc: string;
  external?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'copyMarkdown',   icon: <CopyIcon />,     title: 'Copy page',          desc: 'Copy page as Markdown for LLMs' },
  { id: 'viewSource',     icon: <MarkdownIcon />, title: 'View source',        desc: 'Open raw markdown in new tab',  external: true },
  { id: 'openChatGPT',    icon: <OpenAIIcon />,   title: 'Open in ChatGPT',    desc: 'Ask questions about this page', external: true },
  { id: 'openClaude',     icon: <ClaudeIcon />,   title: 'Open in Claude',     desc: 'Ask questions about this page', external: true },
  { id: 'connectCursor',  icon: <CursorIcon />,   title: 'Connect to Cursor',  desc: 'Install MCP Server on Cursor',  external: true },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function CopyPageButton(): React.ReactElement {
  const pluginData = usePluginData('embed-markdown') as { cursorMcpCommand?: string } | undefined;
  const cursorMcpCommand = pluginData?.cursorMcpCommand ?? 'npx @zilliz/claude-context-mcp@latest';

  const { pathname } = useLocation();
  const { siteConfig } = useDocusaurusContext();

  const [isOpen, setIsOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const menuItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-clear copy success
  useEffect(() => {
    if (copySuccess) {
      const t = setTimeout(() => setCopySuccess(false), 2000);
      return () => clearTimeout(t);
    }
  }, [copySuccess]);

  // Cleanup error timer on unmount
  useEffect(() => () => { if (errorTimerRef.current) clearTimeout(errorTimerRef.current); }, []);

  // Focus menu item on keyboard nav
  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      menuItemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen]);

  const showError = (msg: string) => {
    setError(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setError(null), 4000);
  };

  const fetchMarkdown = async (): Promise<string> => {
    const url = `${pathname}.md`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (text.trimStart().startsWith('<')) throw new Error('Not a markdown response');
    return text;
  };

  const execute = useCallback(async (id: ActionId) => {
    setIsOpen(false);
    setFocusedIndex(-1);

    if (id === 'copyMarkdown') {
      setIsLoading(true);
      setError(null);
      try {
        const md = await fetchMarkdown();
        await navigator.clipboard.writeText(md);
        setCopySuccess(true);
      } catch {
        showError('Failed to copy. Please try again.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (id === 'viewSource') {
      window.open(`${pathname}.md`, '_blank');
      return;
    }

    if (id === 'openChatGPT') {
      const page = encodeURIComponent(siteConfig.url + pathname);
      window.open(`https://chatgpt.com/?hints=search&q=Read%20from%20the%20'${page}'%20so%20I%20can%20ask%20questions%20about%20it`, '_blank');
      return;
    }

    if (id === 'openClaude') {
      const page = encodeURIComponent(siteConfig.url + pathname);
      window.open(`https://claude.ai/new?q=Read%20from%20the%20'${page}'%20so%20I%20can%20ask%20questions%20about%20it`, '_blank');
      return;
    }

    if (id === 'connectCursor') {
      const config = JSON.stringify({ command: cursorMcpCommand });
      const encoded = btoa(config);
      window.open(`cursor://anysphere.cursor-deeplink/mcp/install?name=zilliz-mcp-server&config=${encoded}`, '_blank');
      return;
    }
  }, [pathname, siteConfig.url, cursorMcpCommand]);

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) { e.preventDefault(); setIsOpen(false); setFocusedIndex(-1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setIsOpen(true); setFocusedIndex(0); }
  };

  const handleItemKeyDown = (e: React.KeyboardEvent, idx: number) => {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setFocusedIndex(Math.min(idx + 1, MENU_ITEMS.length - 1)); break;
      case 'ArrowUp':   e.preventDefault(); idx === 0 ? (setFocusedIndex(-1), containerRef.current?.querySelector('button')?.focus()) : setFocusedIndex(idx - 1); break;
      case 'Enter': case ' ': e.preventDefault(); execute(MENU_ITEMS[idx].id); break;
      case 'Escape':    e.preventDefault(); setIsOpen(false); setFocusedIndex(-1); containerRef.current?.querySelector('button')?.focus(); break;
      case 'Tab':       setIsOpen(false); setFocusedIndex(-1); break;
    }
  };

  const triggerClass = [
    styles.trigger,
    copySuccess ? styles.success : '',
    isLoading   ? styles.loading : '',
    error       ? styles.errored : '',
  ].filter(Boolean).join(' ');

  return (
    <div id="copy-page-btn" className={styles.container} ref={containerRef}>
      <div className={triggerClass}>
        <button
          type="button"
          className={styles.triggerMain}
          onClick={() => !isLoading && execute('copyMarkdown')}
          aria-label="Copy page as Markdown"
          disabled={isLoading}>
          <span className={styles.triggerIcon}>
            {isLoading ? <SpinnerIcon /> : copySuccess ? <CheckIcon /> : error ? <ErrorIcon /> : <CopyIcon />}
          </span>
          <span className={styles.triggerLabel}>
            {isLoading ? 'Copying…' : copySuccess ? 'Copied!' : error ? 'Failed' : 'Copy page'}
          </span>
        </button>
        <span className={styles.triggerDivider} aria-hidden="true" />
        <button
          type="button"
          className={styles.triggerChevron}
          onClick={() => !isLoading && setIsOpen(v => !v)}
          onKeyDown={handleTriggerKeyDown}
          aria-label="More copy options"
          aria-expanded={isOpen}
          aria-haspopup="menu"
          disabled={isLoading}>
          <ChevronIcon open={isOpen} />
        </button>
      </div>

      {error && <div className={styles.errorToast} role="alert">{error}</div>}

      {isOpen && !isLoading && (
        <div className={styles.menu} role="menu" aria-label="Copy page options">
          {MENU_ITEMS.map((item, idx) => (
            <div
              key={item.id}
              className={styles.menuItem}
              role="menuitem"
              tabIndex={-1}
              ref={el => { menuItemRefs.current[idx] = el; }}
              onClick={() => execute(item.id)}
              onKeyDown={e => handleItemKeyDown(e, idx)}>
              <span className={styles.menuIcon}>{item.icon}</span>
              <span className={styles.menuCaption}>
                <span className={styles.menuTitle}>
                  {item.title}
                  {item.external && <span className={styles.menuArrow}><ExternalArrowIcon /></span>}
                </span>
                <span className={styles.menuDesc}>{item.desc}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Small helper icons not worth exporting
const SpinnerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ animation: 'spin 0.8s linear infinite' }}>
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="28" strokeDashoffset="10" strokeLinecap="round" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
