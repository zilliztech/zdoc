import React, { type ReactNode } from 'react';
import Heading from '@theme-original/Heading';
import type HeadingType from '@theme/Heading';
import type { WrapperProps } from '@docusaurus/types';
import { useLocation } from '@docusaurus/router';
import DocTag from '@site/src/components/DocTag';
import DocMetaTags from './DocMetaTags';
import styles from './styles.module.css';

type Props = WrapperProps<typeof HeadingType>;

// Lazy import useDoc so it only runs on actual doc pages.
// On non-doc pages the hook throws, so we catch that below.
function useDocFrontMatter(): Record<string, unknown> | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useDoc } = require('@docusaurus/plugin-content-docs/client');
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

const CONTACT_SALES_URL = 'https://zilliz.com/contact-sales';

export default function HeadingWrapper(props: Props): ReactNode {
  const { pathname } = useLocation();
  const frontMatter = useDocFrontMatter();

  const onDocPage = isDocOrReferencePath(pathname) && frontMatter !== null;

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
    const isByoc = pathname.startsWith('/docs/byoc');
    const isReference = pathname.startsWith('/reference');
    const betaRaw = frontMatter.beta as string | undefined;
    const beta = isByoc
      ? 'CONTACT SALES'
      : betaRaw && betaRaw !== 'FALSE' ? betaRaw : null;
    const link = beta === 'CONTACT SALES' ? CONTACT_SALES_URL : undefined;

    return (
      <div className={styles.h1Container}>
        <div className={styles.h1Row}>
          <Heading as={Tag} id={id} {...rest}>
            {children}
          </Heading>
        </div>
        {/* CONTACT SALES is rendered as a button under "Copy page" in the TOC column
            (see DocItem/Layout) — keep other beta tags inline next to the title. */}
        {beta && beta !== 'CONTACT SALES' && <DocTag type={beta} link={link} />}
        {isReference && <DocMetaTags frontMatter={frontMatter} />}
      </div>
    );
  }

  // ── h2–h6: tag embedded in heading text after "|" separator ─────────────
  if (/^h[2-6]$/.test(Tag) && typeof children === 'string' && children.includes('|')) {
    const pipeIdx = children.indexOf('|');
    const title = children.slice(0, pipeIdx).trim();
    const tagType = children.slice(pipeIdx + 1).trim();
    const link = tagType === 'CONTACT SALES' ? CONTACT_SALES_URL : undefined;

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
