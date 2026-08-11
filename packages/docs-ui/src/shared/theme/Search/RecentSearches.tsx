import React, {type ReactNode} from 'react';
import {Clock, X} from 'lucide-react';
import {useDocsUiText} from '../../i18n/uiText';
import styles from './styles.module.css';

interface Props {
  items: string[];
  onSelect: (query: string) => void;
  onRemove: (query: string) => void;
  onClear: () => void;
}

export default function RecentSearches({items, onSelect, onRemove, onClear}: Props): ReactNode {
  const text = useDocsUiText();
  if (items.length === 0) return null;
  return (
    <div>
      <div className={styles.searchSection}>
        {text.search.recent}
        <button type="button" className={styles.clearAll} onClick={onClear}>
          {text.search.clearAll}
        </button>
      </div>
      {items.map(item => (
        <div key={item} className={styles.recentSearchItem} onClick={() => onSelect(item)}>
          <span style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <Clock size={14} color="var(--zd-gray-400)" />
            {item}
          </span>
          <button
            type="button"
            className={styles.recentSearchRemove}
            onClick={e => {
              e.stopPropagation();
              onRemove(item);
            }}
            aria-label={text.search.removeRecent(item)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
