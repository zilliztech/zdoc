import React, {type ReactNode, useContext} from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {isActiveSidebarItem} from '@docusaurus/plugin-content-docs/client';
import Link from '@docusaurus/Link';
import isInternalUrl from '@docusaurus/isInternalUrl';
import {useHistory} from '@docusaurus/router';
import IconExternalLink from '@theme/Icon/ExternalLink';
import type {Props} from '@theme/DocSidebarItem/Link';
import {CATEGORY_ICONS} from '../Category';
import SidebarIconVisibilityContext from '../iconVisibility';

import styles from '../Category/styles.module.css';

/** Top-level language/protocol entries that drill into their own sub-reference. */
const SUBNAV_ENTRY_HREFS = new Set([
  '/reference/restful',
  '/reference/python',
  '/reference/java',
  '/reference/go',
  '/reference/nodejs',
  '/reference/cpp',
]);

function isSubnavEntry(href?: string): boolean {
  if (!href) return false;
  return SUBNAV_ENTRY_HREFS.has(href.replace(/\/$/, ''));
}

/** Short uppercase label for an HTTP method badge in the API nav. */
const METHOD_LABEL: Record<string, string> = {
  get: 'GET',
  post: 'POST',
  put: 'PUT',
  patch: 'PATCH',
  delete: 'DEL',
  head: 'HEAD',
  options: 'OPT',
};

function MethodBadge({badges}: {badges?: unknown}): ReactNode {
  const list = Array.isArray(badges) ? (badges as string[]) : [];
  if (!list.length) return null;
  const m = String(list[0]).toLowerCase();
  return (
    <span className={`zd-method zd-method--${m}`} aria-hidden="true">
      {METHOD_LABEL[m] ?? m.toUpperCase()}
    </span>
  );
}

function keepMobileNavOpenOnRouteChange(targetPath: string) {
  if (typeof window === 'undefined' || window.innerWidth > 996) return;
  try {
    const target = new URL(targetPath, window.location.origin);
    window.sessionStorage.setItem('zdoc-mobile-nav-keep-open', target.pathname);
    window.sessionStorage.setItem('zdoc-mobile-nav-drill-direction', 'forward');
    document.documentElement.dataset.zdocMobileNavDrill = 'forward';
    document.documentElement.classList.add('zdoc-mobile-nav-keep-visible');
    document.documentElement.classList.remove('zdoc-mobile-nav-drill-forward', 'zdoc-mobile-nav-drill-back');
    document.documentElement.classList.add('zdoc-mobile-nav-drill-forward');
  } catch {
    // sessionStorage can be unavailable in private browsing; default navigation still works.
  }
}

function SubnavArrow(): ReactNode {
  // A full arrow (shaft + head) — visually distinct from the expand/collapse chevrons.
  return (
    <span className={styles.subnavArrow} aria-hidden="true">
      <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
        <path d="M5 8H13M9.5 4.5L13 8 9.5 11.5" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeLinecap="butt" strokeLinejoin="miter" />
      </svg>
    </span>
  );
}

export default function DocSidebarItemLink({
  item,
  onItemClick,
  activePath,
  level,
  index,
  ...props
}: Props): ReactNode {
  const history = useHistory();
  const {href, label, className, autoAddBaseUrl} = item;
  const showSidebarIcons = useContext(SidebarIconVisibilityContext);
  const iconKey = item.customProps?.icon as string | undefined;
  const IconComponent = showSidebarIcons && iconKey ? CATEGORY_ICONS[iconKey] : undefined;
  const isActive = isActiveSidebarItem(item, activePath);
  const isInternalLink = isInternalUrl(href);
  const subnavEntry = isSubnavEntry(href);

  const handleInternalClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (subnavEntry && typeof window !== 'undefined' && window.innerWidth <= 767) {
      event.preventDefault();
      event.stopPropagation();
      event.nativeEvent.stopImmediatePropagation();
      keepMobileNavOpenOnRouteChange(href);
      history.push(href);
      return;
    }

    if (subnavEntry) keepMobileNavOpenOnRouteChange(href);
    onItemClick?.(item);
  };

  return (
    <li
      className={clsx(
        ThemeClassNames.docs.docSidebarItemLink,
        ThemeClassNames.docs.docSidebarItemLinkLevel(level),
        'menu__list-item',
        className,
      )}>
      <Link
        className={clsx('menu__link', {
          'menu__link--active': isActive,
        })}
        autoAddBaseUrl={autoAddBaseUrl}
        aria-current={isActive ? 'page' : undefined}
        data-sidebar-tooltip={label}
        to={href}
        {...props}
        {...(isInternalLink && {
          onClick: handleInternalClick,
        })}>
        {IconComponent && <span className={styles.categoryIcon} aria-hidden="true" title={label}><IconComponent size={20} /></span>}
        <span className={styles.categoryLinkLabel} data-sidebar-tooltip-label>
          <span className={styles.categoryLinkLabelSizer} aria-hidden="true">
            {label}
          </span>
          <span className={styles.categoryLinkLabelText}>{label}</span>
        </span>
        <MethodBadge badges={item.customProps?.badges} />
        {subnavEntry && !(activePath || '').startsWith('/reference') && <SubnavArrow />}
        {!isInternalLink && <IconExternalLink />}
      </Link>
    </li>
  );
}
