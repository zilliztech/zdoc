import React, {type ReactNode} from 'react';
import {findFirstSidebarItemLink, useDoc, useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import {useLocation} from '@docusaurus/router';
import {useWindowSize} from '@docusaurus/theme-common';
import type {PropSidebarItem} from '@docusaurus/plugin-content-docs';
import DocVersionBanner from '@theme/DocVersionBanner';
import DocVersionBadge from '@theme/DocVersionBadge';
import DocItemFooter from '@theme/DocItem/Footer';
import DocItemContent from '@theme/DocItem/Content';
import DocItemTOCDesktop from '@theme/DocItem/TOC/Desktop';
import CopyPageButton from '@site/src/theme/Heading/CopyPageButton';
import ContentVisibility from '@theme/ContentVisibility';
import type {Props} from '@theme/DocItem/Layout';
import styles from './styles.module.css';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

function normalizePath(path: string): string {
  return path.replace(/\/$/, '');
}

function getSectionBreadcrumb(pathname: string): BreadcrumbItem {
  const localePrefix = pathname.startsWith('/ja-JP/') ? '/ja-JP' : '';
  return {label: 'Docs Home', href: `${localePrefix}/docs/home`};
}

function withLocalePrefix(pathname: string, href: string): string {
  return pathname.startsWith('/ja-JP/') ? `/ja-JP${href}` : href;
}

function getTopNavBreadcrumb(pathname: string): BreadcrumbItem | null {
  const normalizedPathname = normalizePath(pathname.replace(/^\/ja-JP/, ''));

  if (normalizedPathname === '/docs/home') {
    return null;
  }

  if (normalizedPathname.startsWith('/docs/byoc/changelogs')) {
    return {label: 'Releases', href: withLocalePrefix(pathname, '/docs/byoc/changelogs')};
  }

  if (normalizedPathname.startsWith('/docs/byoc')) {
    return {label: 'BYOC Guides', href: withLocalePrefix(pathname, '/docs/byoc/byoc-intro')};
  }

  if (normalizedPathname.startsWith('/reference/cli')) {
    return {label: 'CLI', href: withLocalePrefix(pathname, '/reference/cli/cli/overview')};
  }

  if (normalizedPathname.startsWith('/reference')) {
    return {label: 'API & SDK', href: withLocalePrefix(pathname, '/reference/python')};
  }

  if (normalizedPathname.startsWith('/docs')) {
    return {label: 'Cloud Guides', href: withLocalePrefix(pathname, '/docs/register-with-zilliz-cloud')};
  }

  return null;
}

function getItemHref(item: PropSidebarItem): string | undefined {
  if (item.type === 'link') return item.href;
  if (item.type === 'category') return item.href || findFirstSidebarItemLink(item);
  return undefined;
}

function findBreadcrumbTrail(
  items: PropSidebarItem[],
  pathname: string,
): BreadcrumbItem[] | null {
  const norm = normalizePath(pathname);
  for (const item of items) {
    const label = 'label' in item ? item.label : undefined;
    const href = getItemHref(item);

    if (item.type === 'link') {
      if (normalizePath(item.href) === norm && label) return [{label, href: item.href}];
    } else if (item.type === 'category') {
      if (href && normalizePath(href) === norm && label) return [{label, href}];
      const found = findBreadcrumbTrail(item.items, pathname);
      if (found && label) return [{label, href}, ...found];
    }
  }
  return null;
}

function PageBreadcrumbs(): ReactNode {
  const sidebar = useDocsSidebar();
  const {pathname} = useLocation();
  const trail = sidebar ? findBreadcrumbTrail(sidebar.items, pathname) ?? [] : [];
  const section = getSectionBreadcrumb(pathname);
  const topNavSection = getTopNavBreadcrumb(pathname);
  const items = [section, topNavSection, trail[0]]
    .filter((item): item is BreadcrumbItem => Boolean(item))
    .filter((item, index, all) => {
      const prev = all[index - 1];
      return !prev || prev.label !== item.label;
    });

  if (items.length === 0) return null;

  return (
    <nav className={styles.pageBreadcrumbs} aria-label="Breadcrumb">
      {items.map((item, index) => {
        return (
          <React.Fragment key={`${item.label}-${index}`}>
            {index > 0 && <span className={styles.pageBreadcrumbSeparator}>/</span>}
            {item.href ? (
              <a className={styles.pageBreadcrumbLink} href={item.href}>{item.label}</a>
            ) : (
              <span className={styles.pageBreadcrumbMuted}>{item.label}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default function DocItemLayout({children}: Props): ReactNode {
  const {frontMatter, metadata, toc} = useDoc();
  const {pathname} = useLocation();
  const windowSize = useWindowSize();
  const hasTOC = toc.length > 0 && frontMatter.hide_table_of_contents !== true;
  // Desktop only: the TOC is always expanded; on mobile it disappears entirely.
  const showDesktopTOC = hasTOC && windowSize !== 'mobile';
  // BYOC / "beta: CONTACT SALES" pages show a Contact Sales CTA under Copy page.
  const frontMatterWithBeta = frontMatter as typeof frontMatter & {beta?: unknown};
  const betaRaw = typeof frontMatterWithBeta.beta === 'string' ? frontMatterWithBeta.beta : undefined;
  const showContactSales = pathname.startsWith('/docs/byoc') || betaRaw === 'CONTACT SALES';

  return (
    <div className={styles.docItemContainer}>
      <ContentVisibility metadata={metadata} />
      <DocVersionBanner />
      <div className={styles.docItemRow}>
        <div className={`${styles.docItemCol} ${!showDesktopTOC ? styles.docItemColCentered : ''}`}>
          <article>
            <DocVersionBadge />
            <PageBreadcrumbs />
            <DocItemContent>{children}</DocItemContent>
            <DocItemFooter />
          </article>
        </div>
        {showDesktopTOC && (
          <div className={styles.tocCol}>
            <div className={styles.tocScroll}>
              <DocItemTOCDesktop />
            </div>
            <div className={styles.tocCopyPage}>
              <CopyPageButton />
              {showContactSales && (
                <a
                  className={styles.tocContactSales}
                  href="https://zilliz.com/contact-sales"
                  target="_blank"
                  rel="noopener noreferrer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Contact Sales
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
