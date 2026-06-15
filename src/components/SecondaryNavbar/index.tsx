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
        {item.label}
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

// ── Component ─────────────────────────────────────────────────────────────────

export default function SecondaryNavbar({variant = 'bar'}: {variant?: 'bar' | 'topbar'}): React.ReactElement {
  const {pathname} = useLocation();
  const {siteConfig} = useDocusaurusContext();
  const navItems = (siteConfig.customFields?.secondaryNavbar ?? []) as NavItem[];

  const visibleItems = navItems.filter(item => !item.hidden);
  const activePrefixes = findActivePrefixes(navItems, pathname);

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
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
