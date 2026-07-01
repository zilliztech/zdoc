import React, {useCallback, useEffect, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import ICONS from '../../utils/navIcons';
import {useDropdownClose} from '../../utils/useDropdownClose';
import styles from './styles.module.css';

// ── Types ─────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href?: string;
  prefix: string | null;
  icon: string;
  hidden?: boolean;
  items?: NavItem[];
}

/** Returns the prefix of the most-specific matching section, or null if none. */
function findActivePrefixes(items: NavItem[], pathname: string): Set<string> {
  const normalizedPathname = pathname.replace(/^\/ja-JP(?=\/)/, '');
  // Collect all leaf-level items (expand children)
  const leaves: NavItem[] = [];
  for (const item of items) {
    if (item.hidden) continue;
    if (item.items?.length) {
      // Include the dropdown parent's OWN prefix as a fallback leaf (e.g.
      // "API & SDK" → /reference) so paths under it that aren't an explicit
      // child (e.g. /reference/cpp) still resolve to it via longest-match.
      if (item.prefix) leaves.push(item);
      leaves.push(...item.items);
    } else {
      leaves.push(item);
    }
  }

  // Find the longest matching prefix
  let best: NavItem | null = null;
  for (const leaf of leaves) {
    if (!leaf.prefix) continue;
    const matches = normalizedPathname === leaf.prefix || normalizedPathname.startsWith(leaf.prefix + '/');
    if (!matches) continue;
    if (!best || leaf.prefix.length > (best.prefix?.length ?? 0)) {
      best = leaf;
    }
  }

  const active = new Set<string>();
  if (best?.prefix) active.add(best.prefix);
  return active;
}

function StableNavLabel({children}: {children: string}): React.ReactElement {
  return (
    <span className={styles.stableLabel}>
      <span className={styles.stableLabelSizer} aria-hidden="true">
        {children}
      </span>
      <span className={styles.stableLabelText}>{children}</span>
    </span>
  );
}

function DropdownChevron(): React.ReactElement {
  return (
    <svg
      className={styles.dropdownChevron}
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true">
      <path d="M2.25 3.75L5 6.25L7.75 3.75" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Dropdown nav item ─────────────────────────────────────────────────────────

function DropdownItem({item, activePrefixes}: {item: NavItem; activePrefixes: Set<string>}): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [pinnedOpen, setPinnedOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState<{top: number; left: number} | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isParentActive =
    (!!item.prefix && activePrefixes.has(item.prefix)) ||
    (item.items?.some(child => child.prefix && activePrefixes.has(child.prefix)) ?? false);

  useDropdownClose(open, setOpen, wrapperRef);

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  useEffect(() => {
    if (!open) setPinnedOpen(false);
  }, [open]);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const updatePanelPosition = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPanelPosition({
      top: rect.bottom + 6,
      left: rect.left,
    });
  }, []);

  const openDropdown = () => {
    clearCloseTimer();
    updatePanelPosition();
    setOpen(true);
  };

  const closeDropdownSoon = () => {
    if (pinnedOpen) return;
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    if (!open) return undefined;

    updatePanelPosition();
    window.addEventListener('resize', updatePanelPosition);
    window.addEventListener('scroll', updatePanelPosition, true);

    return () => {
      window.removeEventListener('resize', updatePanelPosition);
      window.removeEventListener('scroll', updatePanelPosition, true);
    };
  }, [open, updatePanelPosition]);

  return (
    <div
      ref={wrapperRef}
      className={styles.dropdownWrapper}
      onMouseEnter={openDropdown}
      onMouseLeave={closeDropdownSoon}
      onFocus={openDropdown}
      onBlur={event => {
        if (!pinnedOpen && !event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}>
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.item} ${styles.dropdownButton} ${isParentActive ? styles.itemActive : ''}`}
        onClick={() => {
          clearCloseTimer();
          updatePanelPosition();
          setPinnedOpen(true);
          setOpen(true);
        }}
        aria-expanded={open}>
        <StableNavLabel>{item.label}</StableNavLabel>
        <DropdownChevron />
      </button>

      {open && panelPosition && (
        <div
          className={styles.dropdownPanel}
          role="menu"
          style={{top: panelPosition.top, left: panelPosition.left}}>
          {item.items?.map(child => {
            const isActive = child.prefix ? activePrefixes.has(child.prefix) : false;
            return (
              <Link
                key={child.href ?? child.label}
                to={child.href!}
                role="menuitem"
                className={`${styles.dropdownPanelItem} ${isActive ? styles.dropdownPanelItemActive : ''}`}
                onClick={() => {
                  setPinnedOpen(false);
                  setOpen(false);
                }}>
                {child.icon && ICONS[child.icon]}
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Collapsed topbar (medium widths) ───────────────────────────────────────────

/** True on desktop/medium widths where the full tab row would start colliding
 *  with the right-hand controls (Search → Releases). Below 768 the mobile
 *  hamburger owns the nav, so this only applies in the [768, breakpoint] band. */
function useTopbarCollapsed(enabled: boolean): boolean {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(min-width: 768px) and (max-width: 1220px)');
    const update = () => setCollapsed(mq.matches || document.body.classList.contains('docs-nav-compact'));
    const mo = new MutationObserver(update);
    update();
    mq.addEventListener('change', update);
    mo.observe(document.body, {attributes: true, attributeFilter: ['class']});
    return () => {
      mq.removeEventListener('change', update);
      mo.disconnect();
    };
  }, [enabled]);
  return collapsed;
}

/** A single dropdown that stands in for the whole tab row when space is tight,
 *  so the tabs never get clipped under / covered by the Search box. */
function CollapsedTopbar({items, activePrefixes}: {items: NavItem[]; activePrefixes: Set<string>}): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState<{top: number; left: number} | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  useDropdownClose(open, setOpen, wrapperRef);

  const activeItem = items.find(it =>
    (!!it.prefix && activePrefixes.has(it.prefix)) ||
    (it.items?.some(c => c.prefix && activePrefixes.has(c.prefix)) ?? false),
  );
  const label = activeItem?.label ?? 'Menu';

  const updatePos = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) setPanelPosition({top: rect.bottom + 6, left: rect.left});
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    updatePos();
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [open, updatePos]);

  const renderLink = (item: NavItem) => {
    const isActive = item.prefix ? activePrefixes.has(item.prefix) : false;
    return (
      <Link
        key={(item.href ?? '') + item.label}
        to={item.href!}
        role="menuitem"
        className={`${styles.dropdownPanelItem} ${isActive ? styles.dropdownPanelItemActive : ''}`}
        onClick={() => setOpen(false)}>
        {item.icon && ICONS[item.icon]}
        {item.label}
      </Link>
    );
  };

  return (
    <div ref={wrapperRef} className={styles.dropdownWrapper}>
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.item} ${styles.dropdownButton} ${styles.itemActive} ${styles.collapsedTrigger}`}
        onClick={() => { updatePos(); setOpen(o => !o); }}
        aria-expanded={open}>
        {label}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease'}}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && panelPosition && (
        <div className={styles.dropdownPanel} role="menu" style={{top: panelPosition.top, left: panelPosition.left}}>
          {items.map(item =>
            item.items?.length ? (
              <div className={styles.collapsedGroup} key={item.label}>
                <div className={styles.collapsedGroupLabel}>{item.label}</div>
                {item.items.map(renderLink)}
              </div>
            ) : (
              <div className={styles.collapsedGroup} key={(item.href ?? '') + item.label}>
                {renderLink(item)}
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SecondaryNavbar({variant = 'bar'}: {variant?: 'bar' | 'topbar'}): React.ReactElement {
  const {pathname} = useLocation();
  const {siteConfig} = useDocusaurusContext();
  const navItems = (siteConfig.customFields?.secondaryNavbar ?? []) as NavItem[];

  const visibleItems = navItems.filter(item => !item.hidden);
  const activePrefixes = findActivePrefixes(navItems, pathname);
  const collapsed = useTopbarCollapsed(variant === 'topbar');

  if (collapsed) {
    return (
      <div className={styles.topbarNav}>
        <CollapsedTopbar items={visibleItems} activePrefixes={activePrefixes} />
      </div>
    );
  }

  return (
    <div className={variant === 'topbar' ? styles.topbarNav : styles.secondaryNavbar}>
      <div className={styles.items}>
        {visibleItems.map(item => {
          if (item.items?.length) {
            return <DropdownItem key={item.label} item={item} activePrefixes={activePrefixes} />;
          }

          const isActive = item.prefix
            ? activePrefixes.has(item.prefix)
            : activePrefixes.size === 0;

          return (
            <Link
              key={(item.href ?? '') + item.label}
              to={item.href!}
              className={`${styles.item} ${isActive ? styles.itemActive : ''}`}>
              <StableNavLabel>{item.label}</StableNavLabel>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
