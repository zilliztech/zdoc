import React from 'react';
import styles from './DocMetaTags.module.css';

// ── Config ───────────────────────────────────────────────────────────────────

const META_DEFS = [
  { key: 'added_since' },
  { key: 'last_modified' },
  { key: 'deprecate_since' },
] as const;

function isVisibleValue(value: unknown): boolean {
  if (value === undefined || value === null || value === false) return false;
  const text = String(value).trim().toLowerCase();
  return text !== '' && text !== 'false' && text !== 'undefined' && text !== 'null';
}

export function hasDocMetaTags(frontMatter: Record<string, unknown>): boolean {
  return META_DEFS.some(({ key }) => isVisibleValue(frontMatter[key]));
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
  const latestEntry = META_DEFS
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
    })[0];

  if (!latestEntry) return null;

  return (
    <section className={styles.panel} aria-label="Version information">
      <span className={styles.heading}>Minimum SDK version</span>
      <span className={styles.value}>{latestEntry.value}</span>
    </section>
  );
}
