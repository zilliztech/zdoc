import React, { type ReactNode } from 'react';
import Heading from '@theme-init/Heading';
import type HeadingType from '@theme/Heading';
import type { WrapperProps } from '@docusaurus/types';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import DocTag from '../../components/DocTag';
import {parseDocsRoute, type DocsLocale} from '../../navigation/docsRoute';
import {resolveTagLink} from './tagLinks';
import styles from './styles.module.css';

type Props = WrapperProps<typeof HeadingType>;

// useDoc only works on actual doc pages; on any other page the hook throws,
// so we catch that and treat the page as frontmatter-less.
function useDocFrontMatter(): Record<string, unknown> | null {
  try {
    const doc = useDoc();
    return (doc?.frontMatter as Record<string, unknown>) ?? null;
  } catch {
    return null;
  }
}

function isDocOrReferencePath(pathname: string): boolean {
  return (
    pathname.startsWith('/docs') ||
    pathname.startsWith('/reference') ||
    pathname.startsWith('/api')
  );
}

export default function HeadingWrapper(props: Props): ReactNode {
  const { pathname } = useLocation();
  const { siteConfig, i18n } = useDocusaurusContext();
  const site = siteConfig.customFields?.site;
  const frontMatter = useDocFrontMatter();

  // Docusaurus prefixes localized routes with the locale id — the en site's
  // ja-JP pages live under /ja-JP (zh-CN is a separate, unprefixed site). Doc
  // paths must be matched without the prefix: on ja-JP the raw check below
  // never matched, so "| ON REQUEST"-style heading tags stayed literal heading
  // text and h1 beta badges never rendered. Tag links keep the raw pathname —
  // their per-locale branches key off the prefix.
  const docPath = parseDocsRoute(pathname, i18n.currentLocale as DocsLocale).normalizedPathname;

  const onDocPage = isDocOrReferencePath(docPath) && frontMatter !== null;

  if (!onDocPage) {
    return <Heading {...props} />;
  }

  const { as: Tag, children, id, ...rest } = props as Props & {
    as: string;
    children: ReactNode;
    id?: string;
  };

  // ── h1: BYOC docs always get "CONTACT SALES"; others read frontmatter beta ─
  if (Tag === 'h1') {
    const isByoc = docPath.startsWith('/docs/byoc');
    const betaRaw = frontMatter.beta as string | undefined;
    const beta = isByoc
      ? 'CONTACT SALES'
      : betaRaw && betaRaw !== 'FALSE' ? betaRaw : null;
    const link = resolveTagLink(beta ?? '', pathname, site);

    return (
      <div className={styles.h1Container}>
        <div className={styles.h1Row}>
          <Heading as={Tag} id={id} {...rest}>
            {children}
          </Heading>
          {/* CONTACT SALES is rendered as a button under "Copy page" in the TOC column
              (see DocItem/Layout) — keep other beta tags inline next to the title. */}
          {beta && beta !== 'CONTACT SALES' && <DocTag type={beta} link={link} />}
        </div>
      </div>
    );
  }

  // ── h2–h6: tag embedded in heading text after "|" separator ─────────────
  if (/^h[2-6]$/.test(Tag) && typeof children === 'string' && children.includes('|')) {
    const pipeIdx = children.indexOf('|');
    const title = children.slice(0, pipeIdx).trim();
    const tagType = children.slice(pipeIdx + 1).trim();
    const link = resolveTagLink(tagType, pathname, site);

    return (
      <div className={styles.headingContainer}>
        <Heading as={Tag} id={id} {...rest}>
          {title}
        </Heading>
        <DocTag type={tagType} link={link} />
      </div>
    );
  }

  return <Heading {...props} />;
}
