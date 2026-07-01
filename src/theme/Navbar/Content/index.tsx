import React, {type ReactNode, useState, useEffect, useLayoutEffect, useCallback, useMemo} from 'react';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import NavbarMobileSidebarToggle from '@theme/Navbar/MobileSidebar/Toggle';
import NavbarLogo from '@theme/Navbar/Logo';
import {InkeepModalSearchAndChat} from '@inkeep/cxkit-react';
import {Search, LifeBuoy, LogIn, Menu} from 'lucide-react';
import SecondaryNavbar from '@site/src/components/SecondaryNavbar';
import {inkeepSettings} from '../../../../config/inkeep.config';
import InkeepSearchEnhancer from './InkeepSearchEnhancer';
import styles from './styles.module.css';

type InkeepPluginOptions = {
  SearchBar?: {
    baseSettings?: {
      apiKey?: string;
    };
  };
};

declare global {
  interface Window {
    __ZDOC_ENV__?: {
      INKEEP_API_KEY?: string;
    };
  }
}

function isMac() {
  return typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

function getDocsHomePath(pathname: string) {
  return pathname.startsWith('/ja-JP/') ? '/ja-JP/docs/home' : '/docs/home';
}

const useBrowserLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function normalizeKeepOpenPath(path: string) {
  return path.replace(/\/$/, '') || '/';
}

function BoltIcon({width = 8.5, height = 14.9}: {width?: number; height?: number}) {
  return (
    <svg width={width} height={height} viewBox="0 0 8 14" fill="none" aria-hidden="true">
      <path d="M0 8.55556L5.6 0L4.8 5.64912H8L1.6 14L3.2 8.55556H0Z" fill="currentColor" />
    </svg>
  );
}

function MediumActionsDropdown(): ReactNode {
  return (
    <div className={`${styles.mediumActions} navbar-medium-actions`}>
      <button
        type="button"
        className={styles.mediumActionsTrigger}
        aria-haspopup="menu"
        aria-label="More actions">
        <Menu size={15} strokeWidth={1.8} aria-hidden="true" />
      </button>
      <div className={styles.mediumActionsMenu} role="menu">
        <a
          role="menuitem"
          href="https://support.zilliz.com/hc/en-us"
          className={styles.mediumActionsItem}
          target="_blank"
          rel="noopener noreferrer">
          <LifeBuoy size={14} strokeWidth={1.9} aria-hidden="true" />
          <span>Support</span>
        </a>
        <a
          role="menuitem"
          href="https://cloud.zilliz.com/login"
          className={styles.mediumActionsItem}
          target="_blank"
          rel="noopener noreferrer">
          <LogIn size={14} strokeWidth={2} aria-hidden="true" />
          <span>Log In</span>
        </a>
      </div>
    </div>
  );
}

export default function NavbarContent(): ReactNode {
  const mobileSidebar = useNavbarMobileSidebar();
  const {siteConfig} = useDocusaurusContext();
  const {pathname} = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [runtimeApiKey, setRuntimeApiKey] = useState<string | undefined>();
  const mod = isMac() ? '⌘' : 'Ctrl';
  const inkeepPlugin = siteConfig.plugins.find(plugin =>
    Array.isArray(plugin) && plugin[0] === '@inkeep/cxkit-docusaurus'
  );
  const inkeepPluginOptions = Array.isArray(inkeepPlugin)
    ? inkeepPlugin[1] as InkeepPluginOptions
    : undefined;
  const apiKey = inkeepPluginOptions?.SearchBar?.baseSettings?.apiKey || runtimeApiKey;

  const resetSearchInput = useCallback(() => {
    document.dispatchEvent(new CustomEvent('zdoc-search-reset'));
  }, []);

  const openSearch = useCallback(() => {
    resetSearchInput();
    setSearchOpen(true);
  }, [resetSearchInput]);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setSearchOpen(isOpen);
    if (isOpen) window.setTimeout(resetSearchInput, 0);
  }, [resetSearchInput]);

  const inkeepSearchConfig = useMemo(() => ({
    ...inkeepSettings,
    baseSettings: {
      ...inkeepSettings.baseSettings,
      apiKey,
    },
    modalSettings: {
      isOpen: searchOpen,
      onOpenChange: handleOpenChange,
    },
  }), [apiKey, handleOpenChange, searchOpen]);

  useEffect(() => {
    const handler = () => openSearch();
    document.addEventListener('open-mobile-search', handler);
    return () => document.removeEventListener('open-mobile-search', handler);
  }, [openSearch]);

  useEffect(() => {
    const handler = () => setSearchOpen(false);
    document.addEventListener('zdoc-close-search', handler);
    return () => document.removeEventListener('zdoc-close-search', handler);
  }, []);

  useEffect(() => {
    setRuntimeApiKey(window.__ZDOC_ENV__?.INKEEP_API_KEY);
  }, []);

  useBrowserLayoutEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth > 996) return undefined;
    let keepOpenTarget: string | null = null;
    let drillDirection: string | null = null;
    try {
      keepOpenTarget = window.sessionStorage.getItem('zdoc-mobile-nav-keep-open');
      drillDirection = window.sessionStorage.getItem('zdoc-mobile-nav-drill-direction');
    } catch {
      keepOpenTarget = null;
      drillDirection = null;
    }
    if (!keepOpenTarget) {
      document.documentElement.classList.remove('zdoc-mobile-nav-keep-visible');
      document.documentElement.classList.remove('zdoc-mobile-nav-drill-forward', 'zdoc-mobile-nav-drill-back');
      return undefined;
    }

    const normalizedTarget = normalizeKeepOpenPath(keepOpenTarget);
    const normalizedPathname = normalizeKeepOpenPath(pathname);
    if (normalizedTarget !== '1' && normalizedTarget !== normalizedPathname) return undefined;

    try {
      window.sessionStorage.removeItem('zdoc-mobile-nav-keep-open');
      window.sessionStorage.removeItem('zdoc-mobile-nav-drill-direction');
    } catch {
      // Ignore storage failures; the class cleanup below is enough visually.
    }

    const ensureOpen = () => {
      const isOpen = document.querySelector('.navbar')?.classList.contains('navbar-sidebar--show');
      if (!isOpen) mobileSidebar.toggle();
    };
    ensureOpen();
    const drillClass =
      drillDirection === 'back'
        ? 'zdoc-mobile-nav-drill-back'
        : drillDirection === 'forward'
          ? 'zdoc-mobile-nav-drill-forward'
          : null;
    if (drillClass) {
      document.documentElement.classList.remove('zdoc-mobile-nav-drill-forward', 'zdoc-mobile-nav-drill-back');
      // Force the animation to restart on the newly mounted route content.
      void document.documentElement.offsetWidth;
      document.documentElement.classList.add(drillClass);
    }
    const timers = [0, 16, 80, 180, 360, 720, 1000].map(delay => window.setTimeout(ensureOpen, delay));
    const removeForceVisible = window.setTimeout(() => {
      document.documentElement.classList.remove('zdoc-mobile-nav-keep-visible');
    }, 1200);
    const removeDrillClass = window.setTimeout(() => {
      document.documentElement.classList.remove('zdoc-mobile-nav-drill-forward', 'zdoc-mobile-nav-drill-back');
    }, 280);
    return () => {
      timers.forEach(timer => window.clearTimeout(timer));
      window.clearTimeout(removeForceVisible);
      window.clearTimeout(removeDrillClass);
    };
  }, [pathname, mobileSidebar]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => {
          if (!prev) resetSearchInput();
          return !prev;
        });
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [resetSearchInput]);

  return (
    <div className={styles.navbarInner}>
      <div className={styles.navbarLeft}>
        <NavbarLogo />
        <span className={styles.brandDivider} aria-hidden="true" />
        <a className={styles.docsLink} href={getDocsHomePath(pathname)}>Docs</a>
        <SecondaryNavbar variant="topbar" />
      </div>

      <div className={styles.navbarRight}>
        <span className={`${styles.navTipWrap} navbar-search-wrap`}>
          <button
            className={styles.searchBtn}
            onClick={openSearch}
            type="button"
            aria-label="Search documentation">
            <Search size={14} aria-hidden="true" />
            <span>Search</span>
          </button>
          <span className={styles.navTip} role="tooltip"><span className={styles.navTipLabel}>Search</span><kbd>{mod}</kbd><kbd>K</kbd></span>
        </span>

        <span className={`${styles.navTipWrap} navbar-askai-wrap`}>
          <button
            type="button"
            className="navbar-ask-ai-btn"
            onClick={() => document.dispatchEvent(new CustomEvent('toggle-chat'))}
            aria-label="Ask AI">
            <BoltIcon />
            <span>Ask AI</span>
          </button>
          <span className={styles.navTip} role="tooltip"><span className={styles.navTipLabel}>Ask AI</span><kbd>{mod}</kbd><kbd>I</kbd></span>
        </span>

        <span className={`${styles.navTipWrap} ${styles.mediumAskAiWrap} navbar-medium-askai-wrap`}>
          <button
            type="button"
            className={`${styles.mediumAskAi} navbar-medium-askai-btn`}
            onClick={() => document.dispatchEvent(new CustomEvent('toggle-chat'))}
            aria-label="Ask AI">
            <BoltIcon width={8.5} height={14.9} />
          </button>
          <span className={styles.navTip} role="tooltip"><span className={styles.navTipLabel}>Ask AI</span><kbd>{mod}</kbd><kbd>I</kbd></span>
        </span>

        <MediumActionsDropdown />

        <a href="https://support.zilliz.com/hc/en-us" className="navbar-support-link" target="_blank" rel="noopener noreferrer">
          <LifeBuoy size={14} strokeWidth={1.9} aria-hidden="true" />
          Support
        </a>
        <span className="navbar-action-divider" aria-hidden="true" />
        <a href="https://cloud.zilliz.com/login" className="navbar-login-link" target="_blank" rel="noopener noreferrer">
          Log In
        </a>
        <a href="https://cloud.zilliz.com/signup" className="navbar-signup-btn" target="_blank" rel="noopener noreferrer">
          Sign Up Free
        </a>
        {!mobileSidebar.disabled && <NavbarMobileSidebarToggle />}
      </div>

      {apiKey && (
        <>
          <InkeepModalSearchAndChat
            {...inkeepSearchConfig}
            defaultView="search"
            forceDefaultView
            shouldShowAskAICard
          />
          <InkeepSearchEnhancer />
        </>
      )}
    </div>
  );
}
