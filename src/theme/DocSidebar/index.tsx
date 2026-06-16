import React, {type ReactNode, useEffect, useMemo, useRef, useState} from 'react';
import {useLocation, useHistory} from '@docusaurus/router';
import {useWindowSize} from '@docusaurus/theme-common';
import DocSidebar from '@theme-original/DocSidebar';
import type DocSidebarType from '@theme/DocSidebar';
import type {WrapperProps} from '@docusaurus/types';
import type {PropSidebarItem, PropSidebarItemCategory} from '@docusaurus/plugin-content-docs';
import {findFirstSidebarItemLink, useAllDocsData} from '@docusaurus/plugin-content-docs/client';
// @ts-expect-error — generated CJS sidebar module, no type declarations
import guidesSidebarRaw from '@site/config/generated/guides.sidebar';
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
  ChevronDown,
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

import styles from './styles.module.css';

// Track whether the sidebar has ever been expanded (persists across remounts)
let hasEverExpanded = false;

type Props = WrapperProps<typeof DocSidebarType>;
type SidebarTooltipState = {
  label: string;
  top: number;
  left: number;
};

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

/** When inside a language/protocol sub-reference, the gray title shown atop the
 *  page list (e.g. /reference/java → "Java"). */
const REF_SUBNAV_LABELS: Record<string, string> = {
  restful: 'RESTful API',
  python: 'Python',
  java: 'Java',
  go: 'Go',
  nodejs: 'Node.js',
  cpp: 'C++',
};

function getRefSubnavLabel(pathname: string): string | null {
  const m = pathname.match(/^\/reference\/([^/]+)/);
  return m ? REF_SUBNAV_LABELS[m[1]] ?? null : null;
}

function getItemHref(item: PropSidebarItem): string | undefined {
  if (item.type === 'link') return item.href;
  if (item.type === 'category') return item.href || findFirstSidebarItemLink(item);
  return undefined;
}

// ── Guides primary rail on client-library reference pages ──
// The /reference/* languages live in a SEPARATE docs plugin, so its full sidebar
// tree isn't available on those pages. We import the guides sidebar config (top
// sections + structure) and resolve each section's landing URL from the guides
// plugin's doc list (id → path), so the left primary rail can stay fixed (with
// "Client Libraries" active) while a language's pages fill the secondary column.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RAW_GUIDES: any[] = Array.isArray(guidesSidebarRaw)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ? guidesSidebarRaw : (((guidesSidebarRaw as any)?.default) ?? []);

type RailSection = {label: string; href: string | undefined};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveFirstHref(item: any, docPath: Record<string, string>): string | undefined {
  if (!item) return undefined;
  if (item.type === 'link' && item.href) return item.href;
  if (item.type === 'doc' && item.id) return docPath[item.id];
  if (item.type === 'category') {
    if (item.href) return item.href;
    for (const child of item.items ?? []) {
      const h = resolveFirstHref(child, docPath);
      if (h) return h;
    }
  }
  return undefined;
}

function buildGuidesRail(docPath: Record<string, string>): RailSection[] {
  return RAW_GUIDES
    .filter(it => it && (it.type === 'category' || it.type === 'link') && typeof it.label === 'string')
    .map(it => ({label: it.label as string, href: resolveFirstHref(it, docPath)}));
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

/** Collapsed/merged state: narrow viewport (≤1100px) OR the AI chat panel open. */
function useMergedMode(): boolean {
  const [merged, setMerged] = useState(false);
  useEffect(() => {
    const compute = () => {
      const narrow = window.innerWidth <= 1100;
      const chatOpen = !!document.querySelector('.docs-chat-open');
      setMerged(narrow || chatOpen);
    };
    compute();
    window.addEventListener('resize', compute);
    const wrapper = document.querySelector('[class*="docsWrapper"]');
    const mo = new MutationObserver(compute);
    if (wrapper) mo.observe(wrapper, {attributes: true, attributeFilter: ['class']});
    return () => {
      window.removeEventListener('resize', compute);
      mo.disconnect();
    };
  }, []);
  return merged;
}

function TwoLevelSidebar(props: Props): ReactNode {
  const {pathname} = useLocation();
  const history = useHistory();
  const [tooltip, setTooltip] = useState<SidebarTooltipState | null>(null);
  const merged = useMergedMode();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeIndex = useMemo(() => {
    const found = props.sidebar.findIndex(item => itemContainsPath(item, pathname));
    return found >= 0 ? found : 0;
  }, [pathname, props.sidebar]);
  const [selectedIndex, setSelectedIndex] = useState(activeIndex);

  // Follow the active page on navigation — but if the currently-selected section
  // STILL contains the active page (same page duplicated across sections), keep
  // the user's section instead of jumping to the first match (no surprise jumps).
  useEffect(() => {
    setSelectedIndex(prev => {
      const cur = props.sidebar[prev];
      if (cur && itemContainsPath(cur, pathname)) return prev;
      return activeIndex;
    });
  }, [pathname, activeIndex, props.sidebar]);

  const selectedItem = props.sidebar[selectedIndex] ?? props.sidebar[0];
  const secondarySidebar = selectedItem?.type === 'category' ? selectedItem.items : selectedItem ? [selectedItem] : [];
  // Inside a language/protocol reference (Python, Java, …) the primary rail gets
  // a "back to Client Libraries" link + the language title on top; the tree
  // splits into the normal two-level (primary rail + secondary panel).
  const subnavLabel = getRefSubnavLabel(pathname);
  // Guides primary rail for client-library reference pages: resolve each guides
  // section's landing URL from the guides plugin's doc list (id → path). Plain,
  // non-throwing hooks so the sidebar never crashes if the data is absent.
  const allDocsData = useAllDocsData();
  const guidesRail = useMemo<RailSection[]>(() => {
    const guides = allDocsData?.default;
    if (!guides) return [];
    const latest = guides.versions.find(v => v.isLast) ?? guides.versions[0];
    const docPath: Record<string, string> = {};
    for (const d of latest?.docs ?? []) docPath[d.id] = d.path;
    return buildGuidesRail(docPath);
  }, [allDocsData]);
  const clientLibsIndex = guidesRail.findIndex(s => s.label === 'Client Libraries');
  // Only open a secondary panel when the selected primary item has children, so
  // flat leaf entries like "Overview" stay one-level (no empty second panel).
  const selectedHasChildren = selectedItem?.type === 'category' && selectedItem.items.length > 0;

  useEffect(() => { setDropdownOpen(false); }, [pathname]);
  useEffect(() => {
    if (!dropdownOpen) return;
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [dropdownOpen]);

  // Merged single-layer: section picker dropdown on top, current section's pages below.
  if (merged) {
    const selectedLabel = selectedItem && 'label' in selectedItem ? (selectedItem as {label: string}).label : 'Section';
    return (
      <div className={styles.mergedSidebar}>
        <div className={styles.sectionDropdown} ref={dropdownRef}>
          <button
            type="button"
            className={styles.sectionDropdownTrigger}
            onClick={() => setDropdownOpen(o => !o)}
            aria-expanded={dropdownOpen}
            aria-haspopup="listbox">
            <span className={styles.sectionDropdownText}>{selectedLabel}</span>
            <ChevronDown size={16} className={dropdownOpen ? styles.sectionDropdownCaretOpen : styles.sectionDropdownCaret} />
          </button>
          {dropdownOpen && (
            <div className={styles.sectionDropdownMenu} role="listbox">
              {props.sidebar.map((item, index) => {
                const label = 'label' in item ? item.label : `Section ${index + 1}`;
                const isActive = index === selectedIndex;
                return (
                  <button
                    key={`${label}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    className={`${styles.sectionDropdownItem} ${isActive ? styles.sectionDropdownItemActive : ''}`}
                    onClick={() => {
                      setSelectedIndex(index);
                      setDropdownOpen(false);
                      if (item.type === 'category' && item.items.length > 0) return;
                      const href = getItemHref(item);
                      if (href) history.push(href);
                    }}>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <section className={styles.secondaryPane} aria-label="Documentation pages">
          {subnavLabel && <div className={styles.subnavTitle}>{subnavLabel}</div>}
          <div className={styles.sidebarScroll}>
            <div className={styles.secondarySidebarContent}>
              <SidebarIconVisibilityContext.Provider value={false}>
                <DocSidebar key={selectedIndex} {...props} sidebar={secondarySidebar} />
              </SidebarIconVisibilityContext.Provider>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const showTooltipForTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return;
    const tooltipTarget = target.closest<HTMLElement>('[data-sidebar-tooltip]');
    if (!tooltipTarget) return;

    const labelTarget = tooltipTarget.querySelector<HTMLElement>('[data-sidebar-tooltip-label]') ?? tooltipTarget;
    if (labelTarget.offsetWidth <= 1 && labelTarget.offsetHeight <= 1) {
      setTooltip(null);
      return;
    }
    if (labelTarget.scrollWidth <= labelTarget.clientWidth + 1) {
      setTooltip(null);
      return;
    }

    const label = tooltipTarget.dataset.sidebarTooltip;
    if (!label) return;

    const rect = tooltipTarget.getBoundingClientRect();
    setTooltip({
      label,
      top: rect.top + rect.height / 2,
      left: rect.right + 8,
    });
  };
  const hideTooltip = () => setTooltip(null);

  // Client-library reference (desktop): the guides sections stay as the fixed
  // left rail (Client Libraries active); the language's own page tree fills the
  // secondary column under a back-link + language-title header (matches fig 4 —
  // the left primary nav doesn't move when drilling into a language).
  if (subnavLabel && guidesRail.length > 0) {
    return (
      <div
        className={styles.twoLevelSidebar}
        onMouseOver={(event) => showTooltipForTarget(event.target)}
        onFocus={(event) => showTooltipForTarget(event.target)}
        onMouseOut={(event) => {
          const tooltipTarget = (event.target as HTMLElement).closest?.('[data-sidebar-tooltip]');
          if (tooltipTarget?.contains(event.relatedTarget as Node | null)) return;
          hideTooltip();
        }}
        onBlur={hideTooltip}>
        <div className={styles.twoLevelBody}>
          <nav className={styles.primaryRail} aria-label="Documentation sections">
            {guidesRail.map((section, index) => {
              const isActive = index === clientLibsIndex;
              return (
                <button
                  key={`${section.label}-${index}`}
                  type="button"
                  className={`${styles.primaryRailItem} ${isActive ? styles.primaryRailItemActive : ''}`}
                  data-label={section.label}
                  data-sidebar-tooltip={section.label}
                  onClick={() => {
                    if (section.href) history.push(section.href);
                  }}
                  aria-current={isActive ? 'true' : undefined}>
                  <span className={styles.primaryRailLabel} data-sidebar-tooltip-label>
                    {section.label}
                  </span>
                </button>
              );
            })}
          </nav>

          <section className={styles.secondaryPane} aria-label="Documentation pages">
            <div className={styles.refHeader}>
              <a className={styles.refBack} href="/docs/install-sdks">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M13 8H3.5M7 4.5L3.5 8l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="miter" />
                </svg>
                Client Libraries
              </a>
              <div className={styles.refTitle}>{subnavLabel}</div>
            </div>
            <div className={styles.sidebarScroll}>
              <div className={styles.secondarySidebarContent}>
                <SidebarIconVisibilityContext.Provider value={false}>
                  <DocSidebar {...props} sidebar={props.sidebar} />
                </SidebarIconVisibilityContext.Provider>
              </div>
            </div>
          </section>
        </div>
        {tooltip && (
          <div
            className={styles.sidebarTooltip}
            style={{top: tooltip.top, left: tooltip.left}}>
            {tooltip.label}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={styles.twoLevelSidebar}
      onMouseOver={(event) => showTooltipForTarget(event.target)}
      onFocus={(event) => showTooltipForTarget(event.target)}
      onMouseOut={(event) => {
        const tooltipTarget = (event.target as HTMLElement).closest?.('[data-sidebar-tooltip]');
        if (tooltipTarget?.contains(event.relatedTarget as Node | null)) return;
        hideTooltip();
      }}
      onBlur={hideTooltip}>
      {subnavLabel && (
        <div className={styles.refHeaderBar}>
          <a className={styles.refBack} href="/docs/install-sdks">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M13 8H3.5M7 4.5L3.5 8l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
            Client Libraries
          </a>
          <div className={styles.refTitle}>{subnavLabel}</div>
        </div>
      )}

      <div className={styles.twoLevelBody}>
        <nav
          className={styles.primaryRail}
          aria-label="Documentation sections">
          {props.sidebar.map((item, index) => {
            const label = 'label' in item ? item.label : `Section ${index + 1}`;
            const isActive = index === selectedIndex;
            const icon = getSidebarSectionIcon(item, label);
            return (
              <button
                key={`${label}-${index}`}
                type="button"
                className={`${styles.primaryRailItem} ${isActive ? styles.primaryRailItemActive : ''}`}
                data-label={label}
                data-sidebar-tooltip={label}
                onClick={() => {
                  // Always update the rail selection — even for a leaf whose page
                  // is already open (history.push would be a no-op), so clicking
                  // e.g. "Overview" after another section always re-selects it.
                  setSelectedIndex(index);
                  if (item.type === 'category' && item.items.length > 0) return;
                  const href = getItemHref(item);
                  if (href) history.push(href);
                }}
                aria-current={isActive ? 'true' : undefined}>
                <span className={styles.primaryRailIcon} aria-hidden="true">
                  {icon}
                </span>
                <span className={styles.primaryRailLabel} data-sidebar-tooltip-label>
                  {label}
                </span>
              </button>
            );
          })}
        </nav>

        {selectedHasChildren && (
          <section className={styles.secondaryPane} aria-label="Documentation pages">
            <div className={styles.sidebarScroll}>
              <div className={styles.secondarySidebarContent}>
                <SidebarIconVisibilityContext.Provider value={false}>
                  <DocSidebar key={selectedIndex} {...props} sidebar={secondarySidebar} />
                </SidebarIconVisibilityContext.Provider>
              </div>
            </div>
          </section>
        )}
      </div>
      {tooltip && (
        <div
          className={styles.sidebarTooltip}
          style={{top: tooltip.top, left: tooltip.left}}>
          {tooltip.label}
        </div>
      )}
    </div>
  );
}

export default function DocSidebarWrapper(props: Props): ReactNode {
  const windowSize = useWindowSize();
  const {pathname} = useLocation();
  const isMobile = windowSize === 'mobile';

  // On mobile the sidebar renders inside the hamburger menu —
  // always show the full sidebar items, never the collapsed icon column.
  if (!isMobile && props.isHidden) {
    return <CollapsedIconColumn onExpand={props.onCollapse!} sidebar={props.sidebar} />;
  }

  if (!isMobile) {
    return <TwoLevelSidebar {...props} />;
  }

  // Inside a language/protocol reference on mobile, offer a way back to the
  // Client Libraries index (the desktop two-level layout's back link is absent here).
  const mobileSubnav = getRefSubnavLabel(pathname);
  return (
    <>
      {mobileSubnav && (
        <a className={styles.refBack} href="/docs/install-sdks" style={{padding: '12px 16px 4px'}}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M13 8H3.5M7 4.5L3.5 8l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="miter" />
          </svg>
          Client Libraries
        </a>
      )}
      <div className={styles.sidebarScroll}>
        <SidebarIconVisibilityContext.Provider value={false}>
          <DocSidebar {...props} />
        </SidebarIconVisibilityContext.Provider>
      </div>
    </>
  );
}
