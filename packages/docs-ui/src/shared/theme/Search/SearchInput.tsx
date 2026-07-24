import React, {type ReactNode, type RefObject} from 'react';
import {Search} from 'lucide-react';
import styles from './styles.module.css';

interface Props {
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClose: () => void;
}

export default function SearchInput({inputRef, value, onChange, onKeyDown, onClose}: Props): ReactNode {
  return (
    <div className={styles.searchInputRow}>
      <Search className={styles.searchIcon} size={16} />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search documentation..."
        className={styles.searchInput}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
      <button className={styles.searchClose} onClick={onClose} type="button">
        ESC
      </button>
    </div>
  );
}
