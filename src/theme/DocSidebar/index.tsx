import React, {type ReactNode, useEffect, useMemo, useState} from 'react';
import {useLocation, useHistory} from '@docusaurus/router';
import {useWindowSize} from '@docusaurus/theme-common';
import DocSidebar from '@theme-original/DocSidebar';
import type DocSidebarType from '@theme/DocSidebar';
import type {WrapperProps} from '@docusaurus/types';
import type {PropSidebarItem, PropSidebarItemCategory} from '@docusaurus/plugin-content-docs';
import {findFirstSidebarItemLink} from '@docusaurus/plugin-content-docs/client';
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
  ChevronRight,
  Home,
  BookOpen,
  Lightbulb,
  Server,
  Library,
  AlertTriangle,
  Wrench,
} from 'lucide-react';
import IconButton from '../../components/IconButton';
import SidebarIconVisibilityContext from '../DocSidebarItem/iconVisibility';
import {
  clearManualReferenceOrigin,
  getDefaultManualReferenceOrigin,
  getManualReferenceTarget,
  getReferenceNavigationHref,
  readManualReferenceOrigin,
  shouldClearManualReferenceOrigin,
  writeManualReferenceOrigin,
  type ManualReferenceOrigin,
} from './manualReferenceSidebar';

import styles from './styles.module.css';

// Track whether the sidebar has ever been expanded (persists across remounts)
let hasEverExpanded = false;

type Props = WrapperProps<typeof DocSidebarType>;

/** All known sidebar section icon keys → icon element.
 *  New section icons should be added here as they appear in sidebar customProps.
 */
const SIDEBAR_ICON_MAP: Record<string, React.ReactNode> = {
  home:           <Home size={18} />,
  concepts:       <Lightbulb size={18} />,
  quickstarts:    <Rocket size={18} />,
  overview:       <BookOpen size={18} />,
  'collection-api': <Layers size={18} />,
  platform:       <Server size={18} />,
  resources:      <Library size={18} />,
  'deploy-byoc':  <CloudUpload size={18} />,
  data:           <Database size={18} />,
  indexes:        <Layers size={18} />,
  search:         <Search size={18} />,
  infrastructure: <Cloud size={18} />,
  administration: <Settings size={18} />,
  faqs:           <CircleHelp size={18} />,
  // SDK guide section icons
  guides:          <BookOpen size={18} />,
  // Reference doc section icons
  auth:            <Key size={18} />,
  'client-code':   <Code size={18} />,
  'collections-ref': <Layers size={18} />,
  'db-ref':        <Database size={18} />,
  mgmt:            <Settings2 size={18} />,
  partition:       <Split size={18} />,
  'vector-ref':    <Brain size={18} />,
  'import-ref':    <Upload size={18} />,
  'storage-ref':   <HardDrive size={18} />,
  'embed-ref':     <Brain size={18} />,
  'rerank-ref':    <ArrowDownWideNarrow size={18} />,
  'cloud-ctrl':    <Cloud size={18} />,
  'data-plane':    <Workflow size={18} />,
  // REST API items
  'rest-cloud-meta': <Globe size={18} />,
  'rest-elt':        <RefreshCw size={18} />,
  'rest-project':    <Folder size={18} />,
  'rest-cluster':    <Network size={18} />,
  'rest-migrate':    <RotateCw size={18} />,
  'rest-backup':     <Archive size={18} />,
  'rest-metrics':    <BarChart3 size={18} />,
  'rest-job':        <CalendarDays size={18} />,
  'rest-invoices':   <CreditCard size={18} />,
  'rest-usage':      <PieChart size={18} />,
  'rest-role':       <Shield size={18} />,
  'rest-alias':      <LinkIcon size={18} />,
  'rest-user':       <User size={18} />,
  'rest-index':      <Bookmark size={18} />,
  'limits-restrictions': <AlertTriangle size={18} />,
};

const SIDEBAR_LABEL_ICON_MAP: Record<string, React.ReactNode> = {
  'get started': <Rocket size={18} />,
  development: <Code size={18} />,
  management: <Settings size={18} />,
  tools: <Wrench size={18} />,
  'ai models': <Brain size={18} />,
  'cloud management': <Cloud size={18} />,
  configuration: <Settings2 size={18} />,
  'data operations': <Database size={18} />,
};

function getSidebarSectionIcon(item: PropSidebarItem, label: string): React.ReactNode {
  const iconKey = (item as {customProps?: {icon?: string}}).customProps?.icon;
  const keyedIcon = iconKey ? SIDEBAR_ICON_MAP[iconKey] : undefined;
  return keyedIcon ?? SIDEBAR_LABEL_ICON_MAP[label.toLowerCase()] ?? <BookOpen size={18} />;
}

function CollapsedIconColumn({
  onExpand,
  sidebar,
}: {
  onExpand: () => void;
  sidebar: Props['sidebar'];
}): ReactNode {
  const history = useHistory();
  const [showToast, setShowToast] = useState(!hasEverExpanded);

  const handleExpand = () => {
    hasEverExpanded = true;
    setShowToast(false);
    onExpand();
  };

  // Derive entries dynamically from the live sidebar, preserving order.
  // Base-generated sections may not have custom icons, so keep a neutral fallback.
  const iconEntries = React.useMemo(() => {
    const entries: {key: string; label: string; href: string | undefined; icon: React.ReactNode}[] = [];
    for (let i = 0; i < sidebar.length; i++) {
      const item = sidebar[i];
      const key = (item as {customProps?: {icon?: string}}).customProps?.icon;
      const icon = key ? SIDEBAR_ICON_MAP[key] : undefined;
      const label = (item as {label?: string}).label ?? key;
      let href: string | undefined;
      if (item.type === 'category') {
        href = findFirstSidebarItemLink(item as PropSidebarItemCategory);
      } else if (item.type === 'link') {
        href = (item as {href: string}).href;
      } else {
        continue;
      }
      entries.push({key: key ?? `${label}-${i}`, label, href, icon: icon ?? <BookOpen size={18} />});
    }
    return entries;
  }, [sidebar]);

  return (
    <div className={styles.collapsedColumn}>
      <div className={styles.collapsedHeader}>
        <IconButton
          size="sm"
          variant="outlined"
          onClick={handleExpand}
          title="Expand sidebar"
          aria-label="Expand sidebar">
          <ChevronRight size={16} />
        </IconButton>
        {showToast && (
          <span className={styles.sidebarToast}>Sidebar</span>
        )}
      </div>
      <div className={styles.collapsedIcons}>
        {iconEntries.map(({key, label, href, icon}) => (
          <IconButton
            key={key}
            activePrimary
            onClick={() => {
              if (href) history.push(href);
              handleExpand();
            }}
            title={label}
            aria-label={label}>
            {icon}
          </IconButton>
        ))}
      </div>
    </div>
  );
}

function normalizePath(path: string): string {
  return path.replace(/\/$/, '');
}

function getItemHref(item: PropSidebarItem): string | undefined {
  if (item.type === 'link') return item.href;
  if (item.type === 'category') return item.href || findFirstSidebarItemLink(item);
  return undefined;
}

function itemContainsPath(item: PropSidebarItem, pathname: string): boolean {
  const normalizedPathname = normalizePath(pathname);
  const href = getItemHref(item);
  if (href && normalizePath(href) === normalizedPathname) return true;

  if (item.type === 'category') {
    return item.items.some(child => itemContainsPath(child, pathname));
  }

  return false;
}

function TwoLevelSidebar(props: Props): ReactNode {
  const {pathname} = useLocation();
  const history = useHistory();
  const referenceTarget = getManualReferenceTarget(pathname);
  const [manualReferenceOrigin, setManualReferenceOrigin] = useState<ManualReferenceOrigin | undefined>(() => {
    const origin = readManualReferenceOrigin();
    if (origin && referenceTarget) return origin;
    return referenceTarget ? getDefaultManualReferenceOrigin(referenceTarget) : undefined;
  });

  useEffect(() => {
    setManualReferenceOrigin(current => {
      if (!current && referenceTarget) {
        const origin = getDefaultManualReferenceOrigin(referenceTarget);
        writeManualReferenceOrigin(origin);
        return origin;
      }

      if (shouldClearManualReferenceOrigin(pathname, current)) {
        clearManualReferenceOrigin();
        return undefined;
      }
      return current;
    });
  }, [pathname, referenceTarget]);

  const isManualReferenceMode = Boolean(manualReferenceOrigin && referenceTarget);
  const primarySidebar = isManualReferenceMode ? manualReferenceOrigin!.sidebar : props.sidebar;

  const activeIndex = useMemo(() => {
    if (isManualReferenceMode) {
      const found = primarySidebar.findIndex(
        item => 'label' in item && item.label === manualReferenceOrigin!.selectedLabel,
      );
      return found >= 0 ? found : 0;
    }

    const found = primarySidebar.findIndex(item => itemContainsPath(item, pathname));
    return found >= 0 ? found : 0;
  }, [isManualReferenceMode, manualReferenceOrigin, pathname, primarySidebar]);
  const [selectedIndex, setSelectedIndex] = useState(activeIndex);

  useEffect(() => {
    setSelectedIndex(activeIndex);
  }, [activeIndex]);

  const selectedItem = primarySidebar[selectedIndex] ?? primarySidebar[0];
  const secondarySidebar = isManualReferenceMode
    ? props.sidebar
    : selectedItem?.type === 'category'
      ? selectedItem.items
      : selectedItem
        ? [selectedItem]
        : [];

  return (
    <div className={styles.twoLevelSidebar}>
      <nav className={styles.primaryRail} aria-label="Documentation sections">
        {primarySidebar.map((item, index) => {
          const label = 'label' in item ? item.label : `Section ${index + 1}`;
          const isActive = index === selectedIndex;
          const icon = getSidebarSectionIcon(item, label);
          return (
            <button
              key={`${label}-${index}`}
              type="button"
              className={`${styles.primaryRailItem} ${isActive ? styles.primaryRailItemActive : ''}`}
              title={label}
              data-label={label}
              onClick={() => {
                if (isManualReferenceMode) {
                  const href = label === manualReferenceOrigin!.selectedLabel
                    ? manualReferenceOrigin!.backHref
                    : getItemHref(item);
                  clearManualReferenceOrigin();
                  setManualReferenceOrigin(undefined);
                  if (href) history.push(href);
                  return;
                }

                if (item.type === 'category' && item.items.length > 0) {
                  setSelectedIndex(index);
                  return;
                }
                const href = getItemHref(item);
                if (href) history.push(href);
              }}
              aria-current={isActive ? 'true' : undefined}>
              <span className={styles.primaryRailIcon} aria-hidden="true">
                {icon}
              </span>
              <span className={styles.primaryRailLabel}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      <section
        className={styles.secondaryPane}
        aria-label="Documentation pages"
        onClickCapture={event => {
          if (isManualReferenceMode) return;
          const target = event.target as HTMLElement | null;
          const link = target?.closest('a[href^="/reference/"]') as HTMLAnchorElement | null;
          if (!link) return;
          const href = link.getAttribute('href') ?? '';
          if (!getManualReferenceTarget(href)) return;

          const selectedLabel = selectedItem && 'label' in selectedItem ? selectedItem.label : 'Documentation';
          const origin: ManualReferenceOrigin = {
            backHref: selectedItem ? getItemHref(selectedItem) ?? pathname : pathname,
            backLabel: selectedLabel,
            selectedLabel,
            sidebar: primarySidebar,
          };
          writeManualReferenceOrigin(origin);
          setManualReferenceOrigin(origin);
          const navigationHref = getReferenceNavigationHref(href);
          if (navigationHref !== href) {
            event.preventDefault();
            history.push(navigationHref);
          }
        }}>
        <div className={styles.sidebarScroll}>
          <div className={styles.secondarySidebarContent}>
            {isManualReferenceMode && manualReferenceOrigin && (
              <button
                type="button"
                className={styles.backToManualButton}
                onClick={() => {
                  clearManualReferenceOrigin();
                  setManualReferenceOrigin(undefined);
                  history.push(manualReferenceOrigin.backHref);
                }}>
                Back to {manualReferenceOrigin.backLabel}
              </button>
            )}
            <SidebarIconVisibilityContext.Provider value={false}>
              <DocSidebar {...props} sidebar={secondarySidebar} />
            </SidebarIconVisibilityContext.Provider>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function DocSidebarWrapper(props: Props): ReactNode {
  const windowSize = useWindowSize();
  const isMobile = windowSize === 'mobile';

  // On mobile the sidebar renders inside the hamburger menu —
  // always show the full sidebar items, never the collapsed icon column.
  if (!isMobile && props.isHidden) {
    return <CollapsedIconColumn onExpand={props.onCollapse!} sidebar={props.sidebar} />;
  }

  if (!isMobile) {
    return <TwoLevelSidebar {...props} />;
  }

  return (
    <>
      <div className={styles.sidebarScroll}>
        <DocSidebar {...props} />
      </div>
    </>
  );
}
