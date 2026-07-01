import React, {type ReactNode, useEffect, useLayoutEffect, useState} from 'react';
import {useNavbarSecondaryMenu, useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import {useHistory, useLocation} from '@docusaurus/router';
import {getRefSubnavLabel} from '@site/src/theme/DocSidebar';

const useBrowserLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function IconBolt() {
  return (
    <svg width="13" height="13" viewBox="0 0 8 14" fill="none" aria-hidden="true">
      <path d="M0 8.55556L5.6 0L4.8 5.64912H8L1.6 14L3.2 8.55556H0Z" fill="currentColor" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// Lifebuoy — matches the desktop navbar Support icon.
function IconLifeBuoy() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
      <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
      <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
      <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
    </svg>
  );
}

function IconLogIn() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}

function MobileActionToolbar() {
  const mobileSidebar = useNavbarMobileSidebar();

  function openSearch() {
    mobileSidebar.toggle();
    window.setTimeout(() => {
      document.dispatchEvent(new CustomEvent('open-mobile-search'));
    }, 80);
  }

  return (
    <div className="mobile-action-toolbar">
      <button
        type="button"
        className="mobile-action-search clean-btn"
        onClick={openSearch}
        aria-label="Search documentation">
        <IconSearch />
        <span>Search documentation…</span>
      </button>
    </div>
  );
}

function MobileActionLinks() {
  const mobileSidebar = useNavbarMobileSidebar();
  return (
    <div className="mobile-action-links">
      <button
        type="button"
        className="mobile-action-link"
        onClick={() => {
          mobileSidebar.toggle();
          document.dispatchEvent(new CustomEvent('toggle-chat'));
        }}>
        <IconBolt />
        Ask AI
      </button>
      <a
        href="https://support.zilliz.com/hc/en-us"
        className="mobile-action-link"
        target="_blank"
        rel="noopener noreferrer">
        <IconLifeBuoy />
        Support
      </a>
      <a
        href="https://cloud.zilliz.com/login"
        className="mobile-action-link"
        target="_blank"
        rel="noopener noreferrer">
        <IconLogIn />
        Log In
      </a>
    </div>
  );
}

function useMobileDrillDirection() {
  const {pathname} = useLocation();
  const [direction, setDirection] = useState<'forward' | 'back' | null>(null);

  useBrowserLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const value = document.documentElement.dataset.zdocMobileNavDrill;
    setDirection(value === 'forward' || value === 'back' ? value : null);
    return undefined;
  }, [pathname]);

  useEffect(() => {
    if (!direction) return undefined;
    const timer = window.setTimeout(() => {
      setDirection(null);
      delete document.documentElement.dataset.zdocMobileNavDrill;
    }, 260);
    return () => window.clearTimeout(timer);
  }, [direction]);

  return direction;
}

function seedMobileDrillDirection(direction: 'forward' | 'back') {
  if (typeof window === 'undefined') return;
  document.documentElement.dataset.zdocMobileNavDrill = direction;
  try {
    window.sessionStorage.setItem('zdoc-mobile-nav-drill-direction', direction);
  } catch {
    // Ignore storage failures; the dataset is enough for the current transition.
  }
}

function keepMobileNavOpenOnRouteChange(targetPath: string, direction: 'forward' | 'back' = 'forward') {
  if (typeof window === 'undefined' || window.innerWidth > 996) return;
  try {
    const target = new URL(targetPath, window.location.origin);
    window.sessionStorage.setItem('zdoc-mobile-nav-keep-open', target.pathname);
    seedMobileDrillDirection(direction);
    document.documentElement.classList.add('zdoc-mobile-nav-keep-visible');
    document.documentElement.classList.remove('zdoc-mobile-nav-drill-forward', 'zdoc-mobile-nav-drill-back');
    document.documentElement.classList.add(`zdoc-mobile-nav-drill-${direction}`);
  } catch {
    // Ignore storage failures; navigation should still proceed.
  }
}

function normalizeMobileNavPath(href: string) {
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    const pathname = url.pathname.replace(/^\/ja-JP(?=\/)/, '').replace(/\/$/, '') || '/';
    return {
      key: pathname,
      to: `${url.pathname}${url.search}${url.hash}`,
    };
  } catch {
    const [path = href] = href.split(/[?#]/);
    return {
      key: path.replace(/^\/ja-JP(?=\/)/, '').replace(/\/$/, '') || '/',
      to: href,
    };
  }
}

function shouldKeepLinkInsideMobileNav(link: HTMLAnchorElement) {
  if (link.target && link.target !== '_self') return false;
  const normalized = normalizeMobileNavPath(link.href);
  if (!normalized) return null;
  return normalized.key.startsWith('/docs/') || normalized.key.startsWith('/reference/');
}

// Inside a client-library reference (Python, Java, …) the mobile doc nav gets a
// back link to Client Libraries + the language title, mirroring desktop.
function MobileRefHeader() {
  const {pathname} = useLocation();
  const history = useHistory();
  const subnav = getRefSubnavLabel(pathname);
  if (!subnav) return null;

  const handleBackClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    keepMobileNavOpenOnRouteChange('/docs/install-sdks', 'back');
    history.push('/docs/install-sdks');
  };

  return (
    <div className="mobile-ref-header">
      <button
        type="button"
        className="mobile-ref-back clean-btn"
        onClick={handleBackClick}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M13 8H3.5M7 4.5L3.5 8l3.5 3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Client Libraries
      </button>
      <div className="mobile-ref-title">{subnav}</div>
    </div>
  );
}

export default function NavbarMobileSidebarSecondaryMenu(): ReactNode {
  const secondaryMenu = useNavbarSecondaryMenu();
  const history = useHistory();
  const drillDirection = useMobileDrillDirection();

  const keepDrillInNav = (event: React.MouseEvent<HTMLDivElement>) => {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');
    if (!link) return;
    const shouldKeep = shouldKeepLinkInsideMobileNav(link);
    if (!shouldKeep) return;
    const normalized = normalizeMobileNavPath(link.href);
    if (!normalized) return;

    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    keepMobileNavOpenOnRouteChange(normalized.to, 'forward');
    history.push(normalized.to);
  };

  return (
    <div className="mobile-secondary-menu-wrapper" onClickCapture={keepDrillInNav}>
      <MobileActionToolbar />
      <div className="mobile-secondary-menu-content">
        <div className={`mobile-secondary-menu-stage${drillDirection ? ` mobile-secondary-menu-stage--${drillDirection}` : ''}`}>
          <MobileRefHeader />
          {secondaryMenu.content}
        </div>
      </div>
      <MobileActionLinks />
    </div>
  );
}
