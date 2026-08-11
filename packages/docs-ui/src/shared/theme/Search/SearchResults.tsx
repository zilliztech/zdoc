import React, {type ReactNode} from 'react';
import ResultItem from './ResultItem';
import RecentSearches from './RecentSearches';
import type {ResultItemData} from './ResultItem';
import {useDocsUiText} from '../../i18n/uiText';
import styles from './styles.module.css';

interface Props {
  query: string;
  results: ResultItemData[];
  loading: boolean;
  activeIndex: number;
  recentSearches: string[];
  onSelectResult: (url: string) => void;
  onSelectRecent: (query: string) => void;
  onRemoveRecent: (query: string) => void;
  onClearRecent: () => void;
  onAskAi: () => void;
  onSetActive: (index: number) => void;
}

export default function SearchResults({
  query,
  results,
  loading,
  activeIndex,
  recentSearches,
  onSelectResult,
  onSelectRecent,
  onRemoveRecent,
  onClearRecent,
  onAskAi,
  onSetActive,
}: Props): ReactNode {
  const text = useDocsUiText();
  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;
  const askAiIndex = hasQuery ? 0 : -1;
  const resultOffset = hasQuery ? 1 : 0;

  return (
    <div className={styles.searchResults}>
      {!hasQuery && (
        <RecentSearches
          items={recentSearches}
          onSelect={onSelectRecent}
          onRemove={onRemoveRecent}
          onClear={onClearRecent}
        />
      )}

      {hasQuery && (
        <button
          type="button"
          className={`${styles.searchResultItem} ${styles.askAiRow} ${activeIndex === askAiIndex ? styles.searchResultActive : ''}`}
          onClick={onAskAi}
          onMouseEnter={() => onSetActive(askAiIndex)}>
          <svg width="10" height="16" viewBox="0 0 8 14" fill="none" aria-hidden="true" style={{flexShrink: 0}}>
            <path d="M0 8.55556L5.6 0L4.8 5.64912H8L1.6 14L3.2 8.55556H0Z" fill="currentColor" />
          </svg>
          <span>{text.search.askAi(trimmedQuery)}</span>
        </button>
      )}

      {loading && <p className={styles.searchLoading}>{text.search.searching}</p>}

      {!loading && hasQuery && results.length === 0 && (
        <p className={styles.noResults}>{text.search.noResults(trimmedQuery)}</p>
      )}

      {!loading && !hasQuery && results.length === 0 && (
        <p className={styles.searchSection}>{text.search.popularPages}</p>
      )}

      {!loading &&
        results.map((item, i) => {
          const idx = i + resultOffset;
          return (
            <ResultItem
              key={item.url + i}
              item={item}
              active={activeIndex === idx}
              onClick={() => onSelectResult(item.url)}
              onMouseEnter={() => onSetActive(idx)}
            />
          );
        })}

    </div>
  );
}
