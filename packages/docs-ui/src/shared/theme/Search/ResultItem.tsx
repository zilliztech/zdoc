import React, {type ReactNode} from 'react';
import styles from './styles.module.css';

export interface ResultItemData {
  title: string;
  url: string;
  section?: string;
  snippet?: string;
  highlightedSnippet?: string;
}

interface Props {
  item: ResultItemData;
  active: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

export default function ResultItem({item, active, onClick, onMouseEnter}: Props): ReactNode {
  return (
    <button
      type="button"
      className={`${styles.searchResultItem} ${active ? styles.searchResultActive : ''}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}>
      <div>
        <span>{item.title}</span>
        {item.section && <span className={styles.searchResultMeta}>{item.section}</span>}
      </div>
      {item.highlightedSnippet ? (
        <div
          className={styles.searchResultSnippet}
          dangerouslySetInnerHTML={{__html: item.highlightedSnippet}}
        />
      ) : item.snippet ? (
        <div className={styles.searchResultSnippet}>{item.snippet}</div>
      ) : null}
    </button>
  );
}
