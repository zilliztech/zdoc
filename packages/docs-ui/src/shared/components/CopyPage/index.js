import { useState, useRef, useEffect, useCallback } from 'react';
import { usePluginData } from '@docusaurus/useGlobalData';
import { Hourglass, CircleCheck, CircleAlert, Copy, FileCode, Eye, ChevronDown } from 'lucide-react';
import styles from './styles.module.css';

const CopyPage = () => {
  const pluginData = usePluginData('embed-markdown');
  const cursorMcpCommand = pluginData?.cursorMcpCommand || 'npx @zilliz/claude-context-mcp@latest';
  const markdownSources = pluginData?.sources || [];
  const enableSourceView = pluginData?.enableSourceView !== false && markdownSources.length > 0;

  const [isOpen, setIsOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const menuItemsRef = useRef([]);
  const errorTimeoutRef = useRef(null);

  const menuActions = [
    { id: 'copy-markdown', label: 'Copy page', action: 'copyMarkdown' },
    { id: 'view-source', label: 'View source', action: 'viewRawMarkdown' },
    { id: 'open-chatgpt', label: 'Open in ChatGPT', action: 'openInChatGPT' },
    { id: 'open-claude', label: 'Open in Claude', action: 'openInClaude' },
    { id: 'connect-cursor', label: 'Connect to Cursor', action: 'connectToCursor' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset copy success state after 2 seconds
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  // Clear error timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  // Focus menu item when focusedIndex changes
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && menuItemsRef.current[focusedIndex]) {
      menuItemsRef.current[focusedIndex].focus();
    }
  }, [focusedIndex, isOpen]);

  const showError = (message) => {
    setError(message);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    errorTimeoutRef.current = setTimeout(() => setError(null), 4000);
  };

  const getMarkdownSource = async () => {
    const currentPath = window.location.pathname;
    const markdownUrl = `${currentPath}.md`;

    console.log('[CopyPage] Fetching markdown from:', markdownUrl);

    try {
      const response = await fetch(markdownUrl);
      console.log('[CopyPage] Response status:', response.status, response.statusText);
      console.log('[CopyPage] Response content-type:', response.headers.get('content-type'));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const markdown = await response.text();
      console.log('[CopyPage] Successfully fetched markdown, length:', markdown.length);
      console.log('[CopyPage] First 200 chars:', markdown.substring(0, 200));

      // Verify we got markdown, not HTML
      if (markdown.trim().startsWith('<!DOCTYPE') || markdown.trim().startsWith('<html')) {
        throw new Error('Received HTML instead of markdown. The .md route is not configured correctly.');
      }

      return markdown;
    } catch (error) {
      console.error('[CopyPage] Failed to fetch markdown:', error);
      throw error;
    }
  };

  const copyMarkdownToClipboard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const markdown = await getMarkdownSource();

      if (!markdown) {
        showError('Source not found');
        setIsOpen(false);
        setIsLoading(false);
        return;
      }

      await navigator.clipboard.writeText(markdown);
      setCopySuccess(true);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      showError('Failed to copy. Please try again.');
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const openInChatGPT = () => {
    const currentPageUrl = encodeURIComponent(window.location.href);
    const chatGPTUrl = `https://chatgpt.com/?hints=search&q=Read%20from%20the%20'${currentPageUrl}' so%20I%20can%20ask%20questions%20about%20it`;
    window.open(chatGPTUrl, '_blank');
    setIsOpen(false);
  };

  const openInClaude = () => {
    const currentPageUrl = encodeURIComponent(window.location.href);
    const claudeUrl = `https://claude.ai/new?q=Read%20from%20the%20'${currentPageUrl}' so%20I%20can%20ask%20questions%20about%20it`;
    window.open(claudeUrl, '_blank');
    setIsOpen(false);
  };

  const connectToCursor = () => {
    const config = JSON.stringify({ command: cursorMcpCommand });
    const encodedConfig = Buffer.from(config).toString('base64');
    const deepLink = `cursor://anysphere.cursor-deeplink/mcp/install?name=zilliz-mcp-server&config=${encodedConfig}`;
    window.open(deepLink, '_blank');
    setIsOpen(false);
  };

  const viewRawMarkdown = () => {
    if (!enableSourceView) {
      showError('Source view is unavailable for this page.');
      return;
    }
    const currentPath = window.location.pathname;
    const markdownUrl = `${currentPath}.md`;
    window.open(markdownUrl, '_blank');
    setIsOpen(false);
  };

  const executeAction = useCallback((actionName) => {
    switch (actionName) {
      case 'copyMarkdown': copyMarkdownToClipboard(); break;
      case 'viewRawMarkdown': viewRawMarkdown(); break;
      case 'openInChatGPT': openInChatGPT(); break;
      case 'openInClaude': openInClaude(); break;
      case 'connectToCursor': connectToCursor(); break;
    }
    setFocusedIndex(-1);
  }, []);

  const handleTriggerKeyDown = (e) => {
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      setIsOpen(false);
      setFocusedIndex(-1);
    } else if (e.key === 'ArrowDown' && isOpen) {
      e.preventDefault();
      setFocusedIndex(0);
    } else if (e.key === 'ArrowDown' && !isOpen) {
      e.preventDefault();
      setIsOpen(true);
      setFocusedIndex(0);
    }
  };

  const handleMenuKeyDown = (e, index) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(Math.min(index + 1, menuActions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (index === 0) {
          setFocusedIndex(-1);
          dropdownRef.current?.querySelector('button')?.focus();
        } else {
          setFocusedIndex(index - 1);
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        executeAction(menuActions[index].action);
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        dropdownRef.current?.querySelector('button')?.focus();
        break;
      case 'Tab':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  return (
    <div id="copy-page-btn" className={styles.dropdownContainer} ref={dropdownRef}>
      <button
        className={`${styles.dropdownTrigger} ${copySuccess ? styles.copySuccess : ''} ${isLoading ? styles.loading : ''} ${error ? styles.error : ''}`}
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        onKeyDown={handleTriggerKeyDown}
        aria-label="Copy page options"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        disabled={isLoading}
      >
        <i className={styles.checkIcon}>
          {isLoading ? <Hourglass size={16} /> : copySuccess ? <CircleCheck size={16} /> : error ? <CircleAlert size={16} /> : <Copy size={16} />}
        </i>
        <span>{isLoading ? 'Copying...' : copySuccess ? 'Copied!' : error ? 'Failed' : 'Copy page'}</span>
        {!isLoading && (
          <ChevronDown size={12} className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
        )}
      </button>

      {error && (
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}

      {isOpen && !isLoading && (
        <div className={styles.dropdownMenu} role="menu" aria-label="Copy page options">
          <div
            className={styles.menuItem}
            role="menuitem"
            tabIndex={-1}
            ref={el => menuItemsRef.current[0] = el}
            onClick={() => executeAction('copyMarkdown')}
            onKeyDown={(e) => handleMenuKeyDown(e, 0)}
          >
            <i className={styles.menuIcon}>
              <FileCode size={18} />
            </i>
            <div className={styles.menuItemCaption}>
              <div className={styles.menuItemTitle}>Copy page</div>
              <div className={styles.menuItemDesc}>Copy page as Markdown for LLMs</div>
            </div>
          </div>

          <div
            className={styles.menuItem}
            role="menuitem"
            tabIndex={-1}
            ref={el => menuItemsRef.current[1] = el}
            onClick={() => executeAction('viewRawMarkdown')}
            onKeyDown={(e) => handleMenuKeyDown(e, 1)}
          >
            <i className={styles.menuIcon}>
              <Eye size={18} />
            </i>
            <div className={styles.menuItemCaption}>
              <div className={styles.menuItemTitle}>View source</div>
              <div className={styles.menuItemDesc}>Open raw markdown in new tab</div>
            </div>
          </div>

          <div
            className={styles.menuItem}
            role="menuitem"
            tabIndex={-1}
            ref={el => menuItemsRef.current[2] = el}
            onClick={() => executeAction('openInChatGPT')}
            onKeyDown={(e) => handleMenuKeyDown(e, 2)}
          >
            <i className={styles.menuIcon}>
              <svg fill="currentColor" fillRule="evenodd" height="1em" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg">
                <title>OpenAI</title>
                <path d="M21.55 10.004a5.416 5.416 0 00-.478-4.501c-1.217-2.09-3.662-3.166-6.05-2.66A5.59 5.59 0 0010.831 1C8.39.995 6.224 2.546 5.473 4.838A5.553 5.553 0 001.76 7.496a5.487 5.487 0 00.691 6.5 5.416 5.416 0 00.477 4.502c1.217 2.09 3.662 3.165 6.05 2.66A5.586 5.586 0 0013.168 23c2.443.006 4.61-1.546 5.361-3.84a5.553 5.553 0 003.715-2.66 5.488 5.488 0 00-.693-6.497v.001zm-8.381 11.558a4.199 4.199 0 01-2.675-.954c.034-.018.093-.05.132-.074l4.44-2.53a.71.71 0 00.364-.623v-6.176l1.877 1.069c.02.01.033.029.036.05v5.115c-.003 2.274-1.87 4.118-4.174 4.123zM4.192 17.78a4.059 4.059 0 01-.498-2.763c.032.02.09.055.131.078l4.44 2.53c.225.13.504.13.73 0l5.42-3.088v2.138a.068.068 0 01-.027.057L9.9 19.288c-1.999 1.136-4.552.46-5.707-1.51h-.001zM3.023 8.216A4.15 4.15 0 015.198 6.41l-.002.151v5.06a.711.711 0 00.364.624l5.42 3.087-1.876 1.07a.067.067 0 01-.063.005l-4.489-2.559c-1.995-1.14-2.679-3.658-1.53-5.63h.001zm15.417 3.54l-5.42-3.088L14.896 7.6a.067.067 0 01.063-.006l4.489 2.557c1.998 1.14 2.683 3.662 1.529 5.633a4.163 4.163 0 01-2.174 1.807V12.38a.71.71 0 00-.363-.623zm1.867-2.773a6.04 6.04 0 00-.132-.078l-4.44-2.53a.731.731 0 00-.729 0l-5.42 3.088V7.325a.068.068 0 01.027-.057L14.1 4.713c2-1.137 4.555-.46 5.707 1.513.487.833.664 1.809.499 2.757h.001zm-11.741 3.81l-1.877-1.068a.065.065 0 01-.036-.051V6.559c.001-2.277 1.873-4.122 4.181-4.12.976 0 1.92.338 2.671.954-.034.018-.092.05-.131.073l-4.44 2.53a.71.71 0 00-.365.623l-.003 6.173v.002zm1.02-2.168L12 9.25l2.414 1.375v2.75L12 14.75l-2.415-1.375v-2.75z"></path>
              </svg>
            </i>
            <div className={styles.menuItemCaption}>
              <div className={styles.menuItemTitle}>Open in ChatGPT</div>
              <div className={styles.menuItemDesc}>Ask questions about this page</div>
            </div>
          </div>

          <div
            className={styles.menuItem}
            role="menuitem"
            tabIndex={-1}
            ref={el => menuItemsRef.current[3] = el}
            onClick={() => executeAction('openInClaude')}
            onKeyDown={(e) => handleMenuKeyDown(e, 3)}
          >
            <i className={styles.menuIcon}>
              <svg fill="currentColor" fillRule="evenodd" height="1em" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg">
                <title>Anthropic</title>
                <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z"></path>
              </svg>
            </i>
            <div className={styles.menuItemCaption}>
              <div className={styles.menuItemTitle}>Open in Claude</div>
              <div className={styles.menuItemDesc}>Ask questions about this page</div>
            </div>
          </div>

          <div
            className={styles.menuItem}
            role="menuitem"
            tabIndex={-1}
            ref={el => menuItemsRef.current[4] = el}
            onClick={() => executeAction('connectToCursor')}
            onKeyDown={(e) => handleMenuKeyDown(e, 4)}
          >
            <i className={styles.menuIcon}>
              <svg fill="currentColor" fillRule="evenodd" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 466.7 532.1" width="1em">
                <path d="M457.4 126 244.4 3c-6.8-4-15.3-4-22.1 0L9.3 126A18.6 18.6 0 0 0 0 142v248c0 6.7 3.6 12.8 9.3 16.2l213 123c6.8 3.9 15.3 3.9 22.1 0l213-123c5.8-3.4 9.3-9.5 9.3-16.2V142c0-6.6-3.5-12.7-9.3-16Zm-13.3 26L238.4 508.2c-1.4 2.4-5 1.4-5-1.4V273.6c0-4.7-2.5-9-6.6-11.3l-202-116.6c-2.3-1.4-1.3-5 1.4-5h411.3c5.8 0 9.5 6.2 6.6 11.3Z" fill="currentColor"></path>
              </svg>
            </i>
            <div className={styles.menuItemCaption}>
              <div className={styles.menuItemTitle}>Connect to Cursor</div>
              <div className={styles.menuItemDesc}>Install MCP Server on Cursor</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CopyPage;
