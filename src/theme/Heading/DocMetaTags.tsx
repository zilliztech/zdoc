import React from 'react';
import styles from './DocMetaTags.module.css';

// ── Icons ────────────────────────────────────────────────────────────────────

const AddedIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const ModifiedIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,7 12,12 15,14" />
  </svg>
);

const DeprecatedIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// ── Config ───────────────────────────────────────────────────────────────────

const META_DEFS = [
  { key: 'added_since',    label: 'Added',      Icon: AddedIcon,      state: 'added'      },
  { key: 'last_modified',  label: 'Modified',   Icon: ModifiedIcon,   state: 'modified'   },
  { key: 'deprecate_since',label: 'Deprecated', Icon: DeprecatedIcon, state: 'deprecated' },
] as const;

function isVisibleValue(value: unknown): boolean {
  if (value === undefined || value === null || value === false) return false;
  const text = String(value).trim().toLowerCase();
  return text !== '' && text !== 'false' && text !== 'undefined' && text !== 'null';
}

function versionRank(value: unknown): number {
  const match = String(value).match(/^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?/i);
  if (!match) return -1;
  const [, major = '0', minor = '0', patch = '0'] = match;
  return Number(major) * 10000 + Number(minor) * 100 + Number(patch);
}

// ── Component ────────────────────────────────────────────────────────────────

interface Props {
  frontMatter: Record<string, unknown>;
}

export default function DocMetaTags({ frontMatter }: Props): React.ReactElement | null {
  const entries = META_DEFS
    .filter(({ key }) => isVisibleValue(frontMatter[key]))
    .map((meta, index) => ({
      ...meta,
      value: String(frontMatter[meta.key]),
      rank: versionRank(frontMatter[meta.key]),
      sourceIndex: index,
    }))
    .sort((a, b) => {
      if (b.rank !== a.rank) return b.rank - a.rank;
      return a.sourceIndex - b.sourceIndex;
    });

  if (entries.length === 0) return null;

  return (
    <section className={styles.panel} aria-label="Version information">
      <div className={styles.heading}>Version info</div>
      <div className={styles.list}>
        {entries.map(({ key, label, Icon, state, value }, index) => (
          <div key={key} className={styles.item} data-state={state}>
            <span className={styles.value}>
              {value}
              {index === 0 && <span className={styles.latest}>Latest</span>}
            </span>
            <span className={styles.label}>
              <Icon />
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
