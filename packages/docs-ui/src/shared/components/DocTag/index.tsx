import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

interface TagDef {
  caption: string;
  color: string;
}

const TAG_REGISTRY: Record<string, TagDef> = {
  PRIVATE:          { caption: 'Private Preview',  color: '#d0714d' },
  'NEAR DEPRECATE': { caption: 'Near Deprecation', color: '#FF9500' },
  'CONTACT SALES':  { caption: 'Contact Sales',    color: '#9C27B0' },
  PUBLIC:           { caption: 'Public Preview',   color: '#6066fd' },
  BYOC:             { caption: 'BYOC',             color: '#00897B' },
  DEPRECATED:       { caption: 'Deprecated',       color: '#9E9E9E' },
};

// Chinese captions for the tags that have localized equivalents; other tags
// keep the English caption above.
const ZH_CAPTIONS: Record<string, string> = {
  PUBLIC: '公测版',
  PRIVATE: '内测版',
};

interface DocTagProps {
  type: string;
  link?: string;
}

export default function DocTag({ type, link }: DocTagProps): React.ReactElement | null {
  const {siteConfig} = useDocusaurusContext();
  const def = TAG_REGISTRY[type];
  if (!def) return null;

  const isChinese = siteConfig.customFields?.site === 'zh-CN';
  const caption = isChinese ? ZH_CAPTIONS[type] ?? def.caption : def.caption;

  const tag = (
    <span
      className={styles.tag}
      data-tag-type={type}
      style={{ color: def.color }}>
      {caption}
    </span>
  );

  return link ? <Link href={link}>{tag}</Link> : tag;
}
