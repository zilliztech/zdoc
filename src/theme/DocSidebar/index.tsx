import React, {type ReactNode, useEffect, useMemo, useRef, useState} from 'react';
import {useLocation, useHistory} from '@docusaurus/router';
import DocSidebarItems from '@theme/DocSidebarItems';
import DocSidebar from '@theme-original/DocSidebar';
import type DocSidebarType from '@theme/DocSidebar';
import type {WrapperProps} from '@docusaurus/types';
import type {PropSidebarItem, PropSidebarItemCategory} from '@docusaurus/plugin-content-docs';
import {findFirstSidebarItemLink, useAllDocsData} from '@docusaurus/plugin-content-docs/client';
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

// Some languages serve their docs under a URL slug that differs from the landing
// slug (e.g. Node.js landing is /reference/nodejs but its docs live under
// /reference/node/…). Map those doc slugs back so inner pages still resolve to
// the language — otherwise the sidebar drops out of the drill view on navigation.
const REF_SLUG_ALIASES: Record<string, string> = {
  node: 'nodejs',
};

export function getRefSubnavLabel(pathname: string): string | null {
  const m = pathname.match(/^\/reference\/([^/]+)/);
  if (!m) return null;
  const slug = REF_SLUG_ALIASES[m[1]] ?? m[1];
  return REF_SUBNAV_LABELS[slug] ?? null;
}

/** Parent panel of the Client Libraries drill: the landing + each
 *  language/protocol, in display order. */
const CLIENT_LIB_ITEMS: {label: string; href: string}[] = [
  {label: 'Install SDKs', href: '/docs/install-sdks'},
  ...Object.entries(REF_SUBNAV_LABELS).map(([key, label]) => ({label, href: `/reference/${key}`})),
];

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

/** Collapsed/merged state: driven solely by the topbar's `docs-nav-compact`
 *  signal so the sidebar and topbar switch to the compact form at the exact
 *  same breakpoint (and together while the AI panel is open). */
function useMergedMode(): boolean {
  // Seed from the current class so the first render of a freshly-mounted sidebar
  // (e.g. after navigating into /reference/*) is already in the right mode —
  // otherwise it renders large for one frame, then flips to merged = a flash.
  const [merged, setMerged] = useState(
    () => typeof document !== 'undefined' && document.body.classList.contains('docs-nav-compact'),
  );
  useEffect(() => {
    const compute = () => {
      const narrow = document.body.classList.contains('docs-nav-compact');
      setMerged(narrow);
    };
    compute();
    window.addEventListener('resize', compute);
    const wrapper = document.querySelector('[class*="docsWrapper"]');
    const bodyMo = new MutationObserver(compute);
    const mo = new MutationObserver(compute);
    if (wrapper) mo.observe(wrapper, {attributes: true, attributeFilter: ['class']});
    bodyMo.observe(document.body, {attributes: true, attributeFilter: ['class']});
    return () => {
      window.removeEventListener('resize', compute);
      mo.disconnect();
      bodyMo.disconnect();
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
  // Mirror the drill-in with a leftward slide when leaving a language reference.
  // The back link sets a sessionStorage flag (survives its full-page reload);
  // on the destination we play the slide once, then clear the flag.
  const [backAnim, setBackAnim] = useState(false);
  useEffect(() => {
    try {
      if (!subnavLabel && sessionStorage.getItem('zd-nav-back') === '1') {
        sessionStorage.removeItem('zd-nav-back');
        setBackAnim(true);
        const t = setTimeout(() => setBackAnim(false), 460);
        return () => clearTimeout(t);
      }
    } catch { /* sessionStorage unavailable — skip the back animation */ }
  }, [subnavLabel, pathname]);

  // ── Desktop drill (Client Libraries ⇄ a language reference) ──
  // The primary rail ALWAYS stays the guides sections; only the SECONDARY column
  // drills between the language list and a language's tree. Cross-plugin navigation
  // remounts the sidebar, so the slide is a mount-time keyframe driven by a
  // direction flag set on the triggering click (read once, synchronously).
  const isInstallSdks = normalizePath(pathname) === '/docs/install-sdks';
  const inRefContext = !!subnavLabel || isInstallSdks;
  const [pushNav] = useState<{dir: 'forward' | 'back'; label: string} | null>(() => {
    try {
      const dir = sessionStorage.getItem('zd-nav-dir');
      const label = sessionStorage.getItem('zd-nav-back-label') ?? '';
      if (dir) {
        sessionStorage.removeItem('zd-nav-dir');
        sessionStorage.removeItem('zd-nav-back-label');
      }
      if (dir === 'forward') return {dir: 'forward', label};
      if (dir === 'back') return {dir: 'back', label};
    } catch { /* sessionStorage unavailable */ }
    return null;
  });

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
    // Client-library reference pages (Python, Java, …) carry a language TREE, not
    // guides "sections" — merging by section collapses the tree to a single
    // "Overview" entry. Show the language title + the FULL tree instead so the nav
    // never disappears on narrow / zoomed viewports.
    const refMode = !!subnavLabel;
    const refDropdownIndex = clientLibsIndex >= 0 ? clientLibsIndex : 0;
    const mergedDropdownLabel = refMode && guidesRail.length > 0
      ? (guidesRail[refDropdownIndex]?.label ?? 'Client Libraries')
      : selectedLabel;
    return (
      <div className={styles.mergedSidebar}>
        <div className={styles.sectionDropdown} ref={dropdownRef}>
          <button
            type="button"
            className={styles.sectionDropdownTrigger}
            onClick={() => setDropdownOpen(o => !o)}
            aria-expanded={dropdownOpen}
            aria-haspopup="listbox">
            <span className={styles.sectionDropdownText}>{mergedDropdownLabel}</span>
            <ChevronDown size={16} className={dropdownOpen ? styles.sectionDropdownCaretOpen : styles.sectionDropdownCaret} />
          </button>
          {dropdownOpen && (
            <div className={styles.sectionDropdownMenu} role="listbox">
              {refMode && guidesRail.length > 0 ? (
                guidesRail.map((section, index) => {
                  const isActive = index === refDropdownIndex;
                  return (
                    <button
                      key={`${section.label}-${index}`}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      className={`${styles.sectionDropdownItem} ${isActive ? styles.sectionDropdownItemActive : ''}`}
                      onClick={() => {
                        setDropdownOpen(false);
                        if (section.href) history.push(section.href);
                      }}>
                      <span>{section.label}</span>
                    </button>
                  );
                })
              ) : (
                props.sidebar.map((item, index) => {
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
                })
              )}
            </div>
          )}
        </div>
        {refMode && (
          <a
            className={styles.refHeaderRow}
            href="/docs/install-sdks"
            aria-label="Back to Client Libraries"
            onClick={(e) => {
              e.preventDefault();
              try {
                sessionStorage.setItem('zd-nav-dir', 'back');
                sessionStorage.setItem('zd-nav-back-label', subnavLabel);
                sessionStorage.setItem('zd-nav-back', '1');
              } catch { /* ignore */ }
              history.push('/docs/install-sdks');
            }}>
            <svg className={styles.refHeaderRowArrow} width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M11 8H3M6.5 4.5L3 8 6.5 11.5" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeLinecap="butt" strokeLinejoin="miter" />
            </svg>
            <span className={styles.refHeaderRowTitle}>{subnavLabel}</span>
          </a>
        )}
        <section
          className={`${styles.secondaryPane} ${refMode ? styles.refEnter : (backAnim ? styles.backEnter : '')}`}
          key={refMode ? `ref-${subnavLabel}` : 'section'}
          aria-label="Documentation pages">
          <div className={styles.sidebarScroll}>
            <div className={styles.secondarySidebarContent}>
              <SidebarIconVisibilityContext.Provider value={false}>
                <ul className="menu__list">
                  <DocSidebarItems
                    items={refMode ? props.sidebar : secondarySidebar}
                    activePath={pathname}
                    level={1}
                    tabIndex={0}
                  />
                </ul>
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

  // Client-library reference (desktop): the guides sections ALWAYS stay as the
  // fixed left rail (Client Libraries active). Only the SECONDARY column drills
  // between the language LIST and a language's page TREE, with a "← Client
  // Libraries" back link — a quick Vercel-style crossfade (opacity + 8px slide +
  // 2px blur, 0.2s).
  if (inRefContext && guidesRail.length > 0) {
    // Only play the drill slide when an actual drill click set a direction flag.
    // On a plain load/refresh or a non-drill landing (e.g. clicking "Install
    // SDKs", the parent list itself), pushNav is null → no animation, no jitter.
    const animDir = pushNav?.dir === 'back' ? 'back' : pushNav?.dir === 'forward' ? 'fwd' : undefined;
    const childLabel = subnavLabel ?? (pushNav?.dir === 'back' ? pushNav.label : '');
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
	                  data-sidebar-tooltip={isActive ? undefined : section.label}
                  onClick={() => {
                    if (section.href) history.push(section.href);
                  }}
                  aria-current={isActive ? 'true' : undefined}>
                  <span className={styles.primaryRailLabel} data-sidebar-tooltip-label>
                    <span className={styles.primaryRailLabelSizer} aria-hidden="true">
                      {section.label}
                    </span>
                    <span className={styles.primaryRailLabelText}>{section.label}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <section className={styles.secondaryPane} aria-label="Documentation pages">
            <div className={styles.refViewport}>
              <div className={styles.refPane} data-anim={animDir} key={subnavLabel ?? 'parent'}>
                {subnavLabel ? (
                  <>
                    <a
                      className={styles.refHeaderRow}
                      href="/docs/install-sdks"
                      aria-label="Back to Client Libraries"
                      onClick={(e) => {
                        e.preventDefault();
                        try {
                          sessionStorage.setItem('zd-nav-dir', 'back');
                          sessionStorage.setItem('zd-nav-back-label', childLabel);
                        } catch { /* ignore */ }
                        history.push('/docs/install-sdks');
                      }}>
                      <svg className={styles.refHeaderRowArrow} width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M11 8H3M6.5 4.5L3 8 6.5 11.5" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeLinecap="butt" strokeLinejoin="miter" />
                      </svg>
                      <span className={styles.refHeaderRowTitle}>{childLabel}</span>
                    </a>
                    <div className={styles.refPanelScroll}>
                      <div className={styles.secondarySidebarContent}>
                        <SidebarIconVisibilityContext.Provider value={false}>
                          <ul className="menu__list">
                            <DocSidebarItems
                              items={props.sidebar}
                              activePath={pathname}
                              level={1}
                              tabIndex={0}
                            />
                          </ul>
                        </SidebarIconVisibilityContext.Provider>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className={styles.refPanelScroll}>
                    <div className={styles.secondarySidebarContent}>
                      <ul className="menu__list">
                        {CLIENT_LIB_ITEMS.map((it) => {
                          const active = normalizePath(it.href) === normalizePath(pathname);
                          return (
                            <li className="menu__list-item" key={it.href}>
                              <a
                                className={`menu__link${active ? ' menu__link--active' : ''}`}
                                href={it.href}
                                onClick={(e) => {
                                  e.preventDefault();
                                  // Only the language refs actually drill in; "Install SDKs" is
                                  // the parent list itself, so it must NOT trigger the drill
                                  // animation (that caused the jitter on click).
                                  if (it.href !== '/docs/install-sdks') {
                                    try { sessionStorage.setItem('zd-nav-dir', 'forward'); } catch { /* ignore */ }
                                  }
                                  history.push(it.href);
                                }}>
                                <span>{it.label}</span>
                                {it.href !== '/docs/install-sdks' && (
                                  <svg className={styles.refListCaret} width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path d="M5 8H13M9.5 4.5L13 8 9.5 11.5" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeLinecap="butt" strokeLinejoin="miter" />
                                  </svg>
                                )}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                )}
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
          <a className={styles.refBack} href="/docs/install-sdks" onClick={() => { try { sessionStorage.setItem('zd-nav-back', '1'); } catch { /* ignore */ } }}>
            <svg width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M11 8H3M6.5 4.5L3 8 6.5 11.5" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeLinecap="butt" strokeLinejoin="miter" />
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
	                data-sidebar-tooltip={isActive ? undefined : label}
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
                  <span className={styles.primaryRailLabelSizer} aria-hidden="true">
                    {label}
                  </span>
                  <span className={styles.primaryRailLabelText}>{label}</span>
                </span>
              </button>
            );
          })}
        </nav>

        {selectedHasChildren && (
          <section
            className={`${styles.secondaryPane} ${backAnim ? styles.backEnter : ''}`}
            aria-label="Documentation pages">
            <div className={styles.sidebarScroll}>
              <div className={styles.secondarySidebarContent}>
                <SidebarIconVisibilityContext.Provider value={false}>
                  <ul className="menu__list" key={selectedIndex}>
                    <DocSidebarItems
                      items={secondarySidebar}
                      activePath={pathname}
                      level={1}
                      tabIndex={0}
                    />
                  </ul>
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
  const {pathname} = useLocation();
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 767 : false,
  );

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 767);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

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
          <svg width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M11 8H3M6.5 4.5L3 8 6.5 11.5" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeLinecap="butt" strokeLinejoin="miter" />
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
