import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

interface TagDef {
  caption: string;
  color: string;
}

const TAG_REGISTRY: Record<string, TagDef> = {
  PRIVATE:          { caption: 'Private Beta',    color: '#d0714d' },
  'NEAR DEPRECATE': { caption: 'Near Deprecation', color: '#FF9500' },
  'CONTACT SALES':  { caption: 'Contact Sales',   color: '#9C27B0' },
  // Future-proofing entries (match zdoc)
  PUBLIC:           { caption: 'Public Beta',     color: '#6066fd' },
  BYOC:             { caption: 'BYOC',            color: '#00897B' },
  DEPRECATED:       { caption: 'Deprecated',      color: '#9E9E9E' },
};

interface DocTagProps {
  type: string;
  link?: string;
}

export default function DocTag({ type, link }: DocTagProps): React.ReactElement | null {
  const def = TAG_REGISTRY[type];
  if (!def) return null;

  const tag = (
    <span
      className={styles.tag}
      data-tag-type={type}
      style={{ color: def.color }}>
      {def.caption}
    </span>
  );

  return link ? <Link href={link}>{tag}</Link> : tag;
}
