import React, {
  type ComponentProps,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import clsx from 'clsx';
import {
  ThemeClassNames,
  useThemeConfig,
  usePrevious,
  Collapsible,
  useCollapsible,
} from '@docusaurus/theme-common';
import {isSamePath} from '@docusaurus/theme-common/internal';
import {
  isActiveSidebarItem,
  findFirstSidebarItemLink,
  useDocSidebarItemsExpandedState,
  useVisibleSidebarItems,
} from '@docusaurus/plugin-content-docs/client';
import Link from '@docusaurus/Link';
import {translate} from '@docusaurus/Translate';
import useIsBrowser from '@docusaurus/useIsBrowser';
import DocSidebarItems from '@theme/DocSidebarItems';
import DocSidebarItemLink from '@theme/DocSidebarItem/Link';
import type {Props} from '@theme/DocSidebarItem/Category';
import type {
  PropSidebarItemCategory,
  PropSidebarItemLink,
} from '@docusaurus/plugin-content-docs';

import {
  Rocket,
  Database,
  Layers,
  Cloud,
  CloudUpload,
  Settings,
  CircleHelp,
  Search,
  Key,
  Code,
  Settings2,
  Split,
  Network,
  Workflow,
  Upload,
  HardDrive,
  Brain,
  ArrowDownWideNarrow,
  Globe,
  RefreshCw,
  Folder,
  RotateCw,
  Archive,
  BarChart3,
  CalendarDays,
  CreditCard,
  PieChart,
  Shield,
  Link as LinkIcon,
  User,
  Bookmark,
  BookOpen,
  Lightbulb,
  Server,
  Library,
  AlertTriangle,
  Table,
  ScanSearch,
  Camera,
  Lock,
  ListTree,
  type LucideProps,
} from 'lucide-react';

import styles from './styles.module.css';
import SidebarIconVisibilityContext from '../iconVisibility';

// ─── Icon map ────────────────────────────────────────────────────────────────

export const CATEGORY_ICONS: Record<string, React.ComponentType<LucideProps>> = {
  // Guides sidebar
  concepts:       Lightbulb,
  quickstarts:    Rocket,
  overview:       BookOpen,
  'collection-api': Layers,
  collection:     Folder,
  schema:         Table,
  platform:       Server,
  resources:      Library,
  'deploy-byoc':  CloudUpload,
  data:           Database,
  indexes:        ListTree,
  search:         Search,
  analyzer:       ScanSearch,
  infrastructure: Cloud,
  administration: Settings,
  faqs:           CircleHelp,
  snapshots:      Camera,
  security:       Lock,
  // SDK guide sections
  guides:         BookOpen,
  // Reference sidebar
  auth:              Key,
  'client-code':     Code,
  'collections-ref': Layers,
  'db-ref':          Database,
  mgmt:              Settings2,
  partition:         Split,
  'vector-ref':      Brain,
  'import-ref':      Upload,
  'storage-ref':     HardDrive,
  'embed-ref':       Brain,
  'rerank-ref':      ArrowDownWideNarrow,
  'cloud-ctrl':      Cloud,
  'data-plane':      Workflow,
  // REST API items
  'rest-cloud-meta': Globe,
  'rest-elt':        RefreshCw,
  'rest-project':    Folder,
  'rest-cluster':    Network,
  'rest-migrate':    RotateCw,
  'rest-backup':     Archive,
  'rest-metrics':    BarChart3,
  'rest-job':        CalendarDays,
  'rest-invoices':   CreditCard,
  'rest-usage':      PieChart,
  'rest-role':       Shield,
  'rest-alias':      LinkIcon,
  'rest-user':       User,
  'rest-index':      Bookmark,
  'limits-restrictions': AlertTriangle,
};

// ─── Internals (unchanged from Docusaurus source) ────────────────────────────

function useAutoExpandActiveCategory({
  isActive,
  collapsed,
  updateCollapsed,
  activePath,
}: {
  isActive: boolean;
  collapsed: boolean;
  updateCollapsed: (b: boolean) => void;
  activePath: string;
}) {
  const wasActive = usePrevious(isActive);
  const previousActivePath = usePrevious(activePath);
  useEffect(() => {
    const justBecameActive = isActive && !wasActive;
    const stillActiveButPathChanged =
      isActive && wasActive && activePath !== previousActivePath;
    if ((justBecameActive || stillActiveButPathChanged) && collapsed) {
      updateCollapsed(false);
    }
  }, [isActive, wasActive, collapsed, updateCollapsed, activePath, previousActivePath]);
}

function useCategoryHrefWithSSRFallback(item: Props['item']): string | undefined {
  const isBrowser = useIsBrowser();
  return useMemo(() => {
    if (item.href && !item.linkUnlisted) {
      return item.href;
    }
    if (isBrowser || !item.collapsible) {
      return undefined;
    }
    return findFirstSidebarItemLink(item);
  }, [item, isBrowser]);
}

function CollapseButton({
  collapsed,
  categoryLabel,
  onClick,
}: {
  collapsed: boolean;
  categoryLabel: string;
  onClick: ComponentProps<'button'>['onClick'];
}) {
  return (
    <button
      aria-label={
        collapsed
          ? translate(
              {
                id: 'theme.DocSidebarItem.expandCategoryAriaLabel',
                message: "Expand sidebar category '{label}'",
                description: 'The ARIA label to expand the sidebar category',
              },
              {label: categoryLabel},
            )
          : translate(
              {
                id: 'theme.DocSidebarItem.collapseCategoryAriaLabel',
                message: "Collapse sidebar category '{label}'",
                description: 'The ARIA label to collapse the sidebar category',
              },
              {label: categoryLabel},
            )
      }
      aria-expanded={!collapsed}
      type="button"
      className="clean-btn menu__caret"
      onClick={onClick}
    />
  );
}

function CategoryLinkLabel({
  label,
  IconComponent,
  showChildCaret,
  collapsed,
}: {
  label: string;
  IconComponent?: React.ComponentType<LucideProps>;
  showChildCaret?: boolean;
  collapsed?: boolean;
}) {
  return (
    <>
      {IconComponent && (
        <span className={styles.categoryIcon} aria-hidden="true" title={label}>
          <IconComponent size={20} />
        </span>
      )}
      <span title={label} className={styles.categoryLinkLabel}>
        {label}
      </span>
      {showChildCaret && (
        <span className={styles.childCaret} aria-hidden="true" data-collapsed={collapsed} />
      )}
    </>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function DocSidebarItemCategory(props: Props): ReactNode {
  const visibleChildren = useVisibleSidebarItems(props.item.items, props.activePath);
  if (visibleChildren.length === 0) {
    return <DocSidebarItemCategoryEmpty {...props} />;
  }
  return <DocSidebarItemCategoryCollapsible {...props} />;
}

function isCategoryWithHref(
  category: PropSidebarItemCategory,
): category is PropSidebarItemCategory & {href: string} {
  return typeof category.href === 'string';
}

function DocSidebarItemCategoryEmpty({item, ...props}: Props): ReactNode {
  if (!isCategoryWithHref(item)) {
    return null;
  }
  const {type, collapsed, collapsible, items, linkUnlisted, ...forwardableProps} = item;
  const linkItem: PropSidebarItemLink = {type: 'link', ...forwardableProps};
  return <DocSidebarItemLink item={linkItem} {...props} />;
}

function DocSidebarItemCategoryCollapsible({
  item,
  onItemClick,
  activePath,
  level,
  index,
  ...props
}: Props): ReactNode {
  const {items, label, collapsible, className, href} = item;
  const showSidebarIcons = useContext(SidebarIconVisibilityContext);
  const iconKey = item.customProps?.icon as string | undefined;
  const IconComponent = showSidebarIcons && iconKey ? CATEGORY_ICONS[iconKey] : undefined;

  const {
    docs: {
      sidebar: {autoCollapseCategories},
    },
  } = useThemeConfig();
  const hrefWithSSRFallback = useCategoryHrefWithSSRFallback(item);
  const isActive = isActiveSidebarItem(item, activePath);
  const isCurrentPage = isSamePath(href, activePath);

  const {collapsed, setCollapsed} = useCollapsible({
    initialState: () => {
      if (!collapsible) return false;
      return isActive ? false : item.collapsed;
    },
  });

  const {expandedItem, setExpandedItem} = useDocSidebarItemsExpandedState();
  const updateCollapsed = (toCollapsed: boolean = !collapsed) => {
    setExpandedItem(toCollapsed ? null : index);
    setCollapsed(toCollapsed);
  };
  useAutoExpandActiveCategory({isActive, collapsed, updateCollapsed, activePath});
  useEffect(() => {
    if (collapsible && expandedItem != null && expandedItem !== index && autoCollapseCategories) {
      setCollapsed(true);
    }
  }, [collapsible, expandedItem, index, setCollapsed, autoCollapseCategories]);

  const handleItemClick: ComponentProps<'a'>['onClick'] = (e) => {
    onItemClick?.(item);
    if (collapsible) {
      if (href) {
        if (isCurrentPage) {
          e.preventDefault();
          updateCollapsed();
        } else {
          updateCollapsed(false);
        }
      } else {
        e.preventDefault();
        updateCollapsed();
      }
    }
  };
  const showChildCaret = !showSidebarIcons && !href && !item.link && items.length > 0;

  return (
    <li
      className={clsx(
        ThemeClassNames.docs.docSidebarItemCategory,
        ThemeClassNames.docs.docSidebarItemCategoryLevel(level),
        'menu__list-item',
        {'menu__list-item--collapsed': collapsed},
        className,
      )}>
      <div
        className={clsx('menu__list-item-collapsible', {
          'menu__list-item-collapsible--active': isCurrentPage,
        })}>
        <Link
          className={clsx(styles.categoryLink, 'menu__link', {
            'menu__link--sublist': collapsible,
            'menu__link--sublist-caret': !href && collapsible && showSidebarIcons,
            'menu__link--active': isActive,
          })}
          onClick={handleItemClick}
          aria-current={isCurrentPage ? 'page' : undefined}
          role={collapsible && !href ? 'button' : undefined}
          aria-expanded={collapsible && !href ? !collapsed : undefined}
          href={collapsible ? hrefWithSSRFallback ?? '#' : hrefWithSSRFallback}
          {...props}>
          <CategoryLinkLabel
            label={label}
            IconComponent={IconComponent}
            showChildCaret={showChildCaret}
            collapsed={collapsible ? collapsed : false}
          />
        </Link>
        {href && collapsible && (
          <CollapseButton
            collapsed={collapsed}
            categoryLabel={label}
            onClick={(e) => {
              e.preventDefault();
              updateCollapsed();
            }}
          />
        )}
      </div>

      <Collapsible lazy as="ul" className="menu__list" collapsed={collapsed}>
        <DocSidebarItems
          items={items}
          tabIndex={collapsed ? -1 : 0}
          onItemClick={onItemClick}
          activePath={activePath}
          level={level + 1}
        />
      </Collapsible>
    </li>
  );
}
