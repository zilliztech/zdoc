import React, {type ReactNode} from 'react';
import {findFirstSidebarItemLink, useDoc, useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import {useLocation} from '@docusaurus/router';
import {useWindowSize} from '@docusaurus/theme-common';
import Head from '@docusaurus/Head';
import type {PropSidebarItem} from '@docusaurus/plugin-content-docs';
import DocVersionBanner from '@theme/DocVersionBanner';
import DocVersionBadge from '@theme/DocVersionBadge';
import DocItemFooter from '@theme/DocItem/Footer';
import DocItemPaginator from '@theme/DocItem/Paginator';
import DocItemContent from '@theme/DocItem/Content';
import DocItemTOCDesktop from '@theme/DocItem/TOC/Desktop';
import NotFoundContent from '@theme/NotFound/Content';
import CopyPageButton from '../../Heading/CopyPageButton';
import DocMetaTags, {hasDocMetaTags} from '../../Heading/DocMetaTags';
import NextChannelToast from '../../../components/NextChannelToast';
import {useDocsUiText, type DocsUiText} from '../../../i18n/uiText';
import {frontMatterReleaseChannel, useRuntimeReleaseChannel} from '../../../utils/releaseChannel';
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

function getSectionBreadcrumb(pathname: string, text: DocsUiText): BreadcrumbItem {
  const localePrefix = pathname.startsWith('/ja-JP/') ? '/ja-JP' : '';
  return {label: text.breadcrumbs.docsHome, href: `${localePrefix}/docs/home`};
}

function withLocalePrefix(pathname: string, href: string): string {
  return pathname.startsWith('/ja-JP/') ? `/ja-JP${href}` : href;
}

function getTopNavBreadcrumb(pathname: string, text: DocsUiText): BreadcrumbItem | null {
  const normalizedPathname = normalizePath(pathname.replace(/^\/ja-JP/, ''));

  if (normalizedPathname === '/docs/home') {
    return null;
  }

  if (normalizedPathname.startsWith('/docs/changelogs')) {
    return {label: text.breadcrumbs.releases, href: withLocalePrefix(pathname, '/docs/changelogs')};
  }

  if (normalizedPathname.startsWith('/docs/byoc')) {
    return {label: text.breadcrumbs.byoc, href: withLocalePrefix(pathname, '/docs/byoc/byoc-intro')};
  }

  if (normalizedPathname.startsWith('/reference/cli')) {
    return {label: 'CLI', href: withLocalePrefix(pathname, '/reference/cli/cli/overview')};
  }

  if (normalizedPathname.startsWith('/reference/python')) {
    return {label: 'Python SDK', href: withLocalePrefix(pathname, '/reference/python')};
  }

  if (normalizedPathname.startsWith('/reference/java')) {
    return {label: 'Java SDK', href: withLocalePrefix(pathname, '/reference/java')};
  }

  if (normalizedPathname.startsWith('/reference/node')) {
    return {label: 'Node SDK', href: withLocalePrefix(pathname, '/reference/node')};
  }

  if (normalizedPathname.startsWith('/reference/go')) {
    return {label: 'Go SDK', href: withLocalePrefix(pathname, '/reference/go')};
  }

  if (normalizedPathname.startsWith('/reference/restful')) {
    return {label: 'RESTful API', href: withLocalePrefix(pathname, '/reference/restful')};
  }

  if (normalizedPathname.startsWith('/reference')) {
    return {label: text.breadcrumbs.apiAndSdk, href: withLocalePrefix(pathname, '/reference/python')};
  }

  if (normalizedPathname.startsWith('/docs')) {
    return {label: text.breadcrumbs.managedCloud, href: withLocalePrefix(pathname, '/docs/register-with-zilliz-cloud')};
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
      // Match on the category's OWN href, not getItemHref's fallback. That
      // fallback resolves a link-less category to its first child, so a page
      // that happens to be first in its group (Dedicated Cluster > Create
      // Cluster) matched the category itself, the recursion stopped there, and
      // the group came back as the trail's last entry instead of an ancestor.
      if (item.href && normalizePath(item.href) === norm && label) return [{label, href}];
      const found = findBreadcrumbTrail(item.items, pathname);
      if (found && label) return [{label, href}, ...found];
    }
  }
  return null;
}

function PageBreadcrumbs({text}: {text: DocsUiText}): ReactNode {
  const sidebar = useDocsSidebar();
  const {pathname} = useLocation();
  // The home page is the root of the trail, so its only crumb would be a link
  // back to itself.
  const isHomePage = pathname.replace(/\/$/, '').endsWith('/docs/home');
  const trail = sidebar ? findBreadcrumbTrail(sidebar.items, pathname) ?? [] : [];
  const section = getSectionBreadcrumb(pathname, text);
  const topNavSection = getTopNavBreadcrumb(pathname, text);
  // findBreadcrumbTrail returns the whole chain, ending with the current page.
  // Only trail[0] used to be rendered, so everything the secondary sidebar adds
  // between the rail section and the page — Clusters, Dedicated Cluster, … — was
  // dropped, and a page four levels deep looked like it sat directly under
  // Management. Take the ancestors instead: the page itself stays out (the H1
  // right below already says it), so append `...trail` rather than
  // `...ancestors` if the current page should appear as a final crumb.
  const ancestors = trail.length > 1 ? trail.slice(0, -1) : trail;
  const items = [section, topNavSection, ...ancestors]
    .filter((item): item is BreadcrumbItem => Boolean(item))
    .filter((item, index, all) => {
      const prev = all[index - 1];
      return !prev || prev.label !== item.label;
    });

  if (isHomePage || items.length === 0) return null;

  return (
    <nav className={styles.pageBreadcrumbs} aria-label={text.breadcrumbs.ariaLabel}>
      {items.map((item, index) => {
        return (
          <React.Fragment key={`${item.label}-${index}`}>
            {index > 0 && <span className={styles.pageBreadcrumbSeparator}>/</span>}
            {item.href ? (
              <a
                className={styles.pageBreadcrumbLink}
                href={item.href}>
                {item.label}
              </a>
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
  const text = useDocsUiText();
  const {frontMatter, metadata, toc} = useDoc();
  const {pathname} = useLocation();
  const windowSize = useWindowSize();
  const runtimeChannel = useRuntimeReleaseChannel();
  const isNextChannelPage = frontMatterReleaseChannel(frontMatter) === 'next';
  const blockedByChannel = isNextChannelPage && runtimeChannel !== 'next';
  const hasTOC = toc.length > 0 && frontMatter.hide_table_of_contents !== true;
  // Desktop only: the TOC is always expanded; on mobile it disappears entirely.
  const showDesktopTOC = hasTOC && windowSize !== 'mobile';
  // BYOC / "beta: CONTACT SALES" pages show a Contact Sales CTA under Copy page.
  const beta = (frontMatter as {beta?: unknown}).beta;
  const betaRaw = typeof beta === 'string' ? beta : undefined;
  const showContactSales = pathname.startsWith('/docs/byoc') || betaRaw === 'CONTACT SALES';
  const isReference = pathname.startsWith('/reference');
  const showVersionInfo = isReference && hasDocMetaTags(frontMatter);

  if (blockedByChannel) {
    // Defense in depth: the docs shell (DocRoot/Layout) already swaps the
    // whole page for the shared 404 content via the sidebar customProps, but a
    // NEXT page missing from the active sidebar would still land here, so the
    // front-matter gate renders the same 404 content within the shell.
    return (
      <div className={styles.docItemContainer}>
        <ContentVisibility metadata={metadata} />
        <Head>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className={styles.docItemRow}>
          <div className={`${styles.docItemCol} ${styles.docItemColCentered}`}>
            <NotFoundContent />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.docItemContainer}>
      <ContentVisibility metadata={metadata} />
      {isNextChannelPage && (
        <Head>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
      )}
      <DocVersionBanner />
      <div className={styles.docItemRow}>
        <div className={`${styles.docItemCol} ${!showDesktopTOC ? styles.docItemColCentered : ''}`}>
          <article>
            <DocVersionBadge />
            {isNextChannelPage && (
              <NextChannelToast
                message={text.releaseChannel.banner}
                dismissLabel={text.releaseChannel.dismiss}
              />
            )}
            <PageBreadcrumbs text={text} />
            <DocItemContent>{children}</DocItemContent>
            <DocItemFooter />
          </article>
          <DocItemPaginator />
        </div>
        {showDesktopTOC && (
          <div className={styles.tocCol}>
            {showVersionInfo && (
              <div className={styles.tocMeta}>
                <DocMetaTags frontMatter={frontMatter} />
              </div>
            )}
            <div className={styles.tocCopyPage}>
              <CopyPageButton />
              {showContactSales && (
                <a
                  className={styles.tocContactSales}
                  href="https://zilliz.com/contact-sales"
                  target="_blank"
                  rel="noopener noreferrer">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {text.breadcrumbs.contactSales}
                </a>
              )}
            </div>
            <div className={styles.tocScroll}>
              <DocItemTOCDesktop />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
