import React, {useState, useRef, useEffect, type ReactNode} from 'react';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import {stripDocHeadingTag} from '../../../../utils/docHeadingTags';
import {useDocsUiText} from '../../../../i18n/uiText';
import styles from './styles.module.css';

type TOCItem = {
  readonly value: string;
  readonly id: string;
  readonly level: number;
};

function TocItem({item, onClick}: {item: TOCItem; onClick: () => void}) {
  const isH3 = item.level === 3;
  const value = stripDocHeadingTag(item.value);
  return (
    <li className={styles.tocItem} style={{paddingLeft: isH3 ? '0.875rem' : 0}}>
      <a
        href={`#${item.id}`}
        className={styles.tocLink}
        onClick={onClick}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{__html: value}}
      />
    </li>
  );
}

export default function DocItemTOCMobile(): ReactNode {
  const text = useDocsUiText();
  const {toc} = useDoc();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!toc.length) return null;

  return (
    <div ref={ref} className={styles.wrapper}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-label={text.toc.onThisPage}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="16" y2="12" />
          <line x1="3" y1="18" x2="11" y2="18" />
        </svg>
      </button>

      {open && (
        <div className={styles.dropdown}>
          <p className={styles.label}>{text.toc.onThisPage}</p>
          <ul className={styles.tocList}>
            {toc.map(item => (
              <TocItem key={item.id} item={item} onClick={() => setOpen(false)} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
