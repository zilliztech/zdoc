import React, {useEffect} from 'react';
// For the Chinese (local search) build this resolves to the
// @easyops-cn/docusaurus-search-local SearchBar; for the English build it is
// the null placeholder (en/theme/SearchBar), so rendering it is a no-op there.
import SearchBar from '@theme/SearchBar';
import styles from './LocalSearchModal.module.css';

type Props = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export default function LocalSearchModal({isOpen, onOpenChange}: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onOpenChange]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={() => onOpenChange(false)}>
      <div className={styles.modal} onClick={event => event.stopPropagation()} role="dialog" aria-modal="true">
        <SearchBar />
      </div>
    </div>
  );
}
