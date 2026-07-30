import React, {type ReactNode, useRef, useState, useEffect, useCallback, useMemo} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useLocation} from '@docusaurus/router';
import SearchInput from './SearchInput';
import SearchResults from './SearchResults';
import {useSearch} from './useSearch';
import {useRecentSearches} from './useRecentSearches';
import {highlightMatches, groupBySection, type SearchResult} from './utils';
import {DEFAULT_CHAT_ENDPOINT, getSearchEndpoint} from '../../components/ChatPanel/endpoints';
import styles from './styles.module.css';

interface Props {
  onClose: () => void;
}

const POPULAR_PAGES: SearchResult[] = [
  {title: 'Getting Started', url: '/docs/create-cluster', section: 'Docs'},
  {title: 'API Reference', url: '/reference/restful', section: 'Reference'},
  {title: 'Python SDK', url: '/reference/python', section: 'Reference'},
  {title: 'Search Guide', url: '/docs/single-vector-search', section: 'Docs'},
];

export default function SearchModal({onClose}: Props): ReactNode {
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const {siteConfig} = useDocusaurusContext();
  const location = useLocation();

  const chatEndpoint = (siteConfig.customFields?.chatEndpoint as string) || DEFAULT_CHAT_ENDPOINT;
  const searchEndpoint = getSearchEndpoint(chatEndpoint);

  const {query, setQuery, results, loading} = useSearch(searchEndpoint);
  const {recent, add: addRecent, remove: removeRecent, clear: clearRecent} = useRecentSearches();

  const displayResults = useMemo(() => {
    const base = query.trim() ? results : POPULAR_PAGES;
    const grouped = groupBySection(base);
    return grouped.flatMap(g =>
      g.items.map(item => ({
        ...item,
        highlightedSnippet: item.snippet ? highlightMatches(query, item.snippet) : undefined,
      }))
    );
  }, [query, results]);

  const totalItems = (query.trim() ? 1 : 0) + displayResults.length;

  const askAi = useCallback(() => {
    onClose();
    const isDocsPage = /^\/(docs|reference)(\/|$)/.test(location.pathname);
    if (isDocsPage) {
      document.dispatchEvent(new CustomEvent('open-chat', {detail: {query}}));
    } else {
      window.location.href = `/docs/home?chat=${encodeURIComponent(query)}`;
    }
  }, [query, location.pathname, onClose]);

  const goTo = useCallback(
    (url: string) => {
      if (query.trim()) addRecent(query);
      onClose();
      window.location.href = url;
    },
    [query, addRecent, onClose]
  );

  const onSelectRecent = useCallback(
    (q: string) => {
      setQuery(q);
      inputRef.current?.focus();
    },
    [setQuery]
  );

  // Focus input and handle Escape
  useEffect(() => {
    inputRef.current?.focus();
    // Hide the floating "Ask a question" dock while the search modal is open.
    document.body.classList.add('zd-search-open');
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.classList.remove('zd-search-open');
    };
  }, [onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % totalItems);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + totalItems) % totalItems);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const hasQuery = query.trim().length > 0;
        if (activeIndex < 0) {
          if (hasQuery) askAi();
          return;
        }
        if (hasQuery && activeIndex === 0) {
          askAi();
        } else {
          const resultIndex = hasQuery ? activeIndex - 1 : activeIndex;
          const item = displayResults[resultIndex];
          if (item) goTo(item.url);
        }
      }
    },
    [totalItems, activeIndex, query, askAi, goTo, displayResults]
  );

  return (
    <div className={styles.searchOverlay} onClick={onClose}>
      <div className={styles.searchModal} onClick={e => e.stopPropagation()}>
        <SearchInput
          inputRef={inputRef}
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onClose={onClose}
        />
        <SearchResults
          query={query}
          results={displayResults}
          loading={loading}
          activeIndex={activeIndex}
          recentSearches={recent}
          onSelectResult={goTo}
          onSelectRecent={onSelectRecent}
          onRemoveRecent={removeRecent}
          onClearRecent={clearRecent}
          onAskAi={askAi}
          onSetActive={setActiveIndex}
        />
      </div>
    </div>
  );
}
