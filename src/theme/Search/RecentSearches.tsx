import React, {type ReactNode} from 'react';
import {Clock, X} from 'lucide-react';
import styles from './styles.module.css';

interface Props {
  items: string[];
  onSelect: (query: string) => void;
  onRemove: (query: string) => void;
  onClear: () => void;
}

export default function RecentSearches({items, onSelect, onRemove, onClear}: Props): ReactNode {
  if (items.length === 0) return null;
  return (
    <div>
      <div className={styles.searchSection}>
        Recent
        <button type="button" className={styles.clearAll} onClick={onClear}>
          Clear all
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
            aria-label={`Remove ${item}`}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
