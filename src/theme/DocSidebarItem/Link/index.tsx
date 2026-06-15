import React, {type ReactNode, useContext} from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {isActiveSidebarItem} from '@docusaurus/plugin-content-docs/client';
import Link from '@docusaurus/Link';
import isInternalUrl from '@docusaurus/isInternalUrl';
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

function SubnavArrow(): ReactNode {
  // A full arrow (shaft + head) — visually distinct from the expand/collapse chevrons.
  return (
    <span className={styles.subnavArrow} aria-hidden="true">
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <path d="M2.5 8h9M8 4.5L11.5 8 8 11.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
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
  const {href, label, className, autoAddBaseUrl} = item;
  const showSidebarIcons = useContext(SidebarIconVisibilityContext);
  const iconKey = item.customProps?.icon as string | undefined;
  const IconComponent = showSidebarIcons && iconKey ? CATEGORY_ICONS[iconKey] : undefined;
  const isActive = isActiveSidebarItem(item, activePath);
  const isInternalLink = isInternalUrl(href);
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
        {...(isInternalLink && {
          onClick: onItemClick ? () => onItemClick(item) : undefined,
        })}
        {...props}>
        {IconComponent && <span className={styles.categoryIcon} aria-hidden="true" title={label}><IconComponent size={20} /></span>}
        <span className={styles.categoryLinkLabel} data-sidebar-tooltip-label>{label}</span>
        {isSubnavEntry(href) && !(activePath || '').startsWith('/reference') && <SubnavArrow />}
        {!isInternalLink && <IconExternalLink />}
      </Link>
    </li>
  );
}
