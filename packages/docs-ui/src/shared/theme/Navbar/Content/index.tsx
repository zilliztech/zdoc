import React, {type ReactNode, useState, useEffect, useLayoutEffect, useCallback, useMemo} from 'react';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import NavbarMobileSidebarToggle from '@theme/Navbar/MobileSidebar/Toggle';
import NavbarLogo from '@theme/Navbar/Logo';
import {InkeepModalSearchAndChat} from '@inkeep/cxkit-react';
import {Search, LifeBuoy, LogIn, Menu} from 'lucide-react';
import SecondaryNavbar from '../../../components/SecondaryNavbar';
import {inkeepSettings} from '../../../../en/inkeep.config';
import InkeepSearchEnhancer from './InkeepSearchEnhancer';
import styles from './styles.module.css';

type InkeepPluginOptions = {
  SearchBar?: {
    baseSettings?: {
      apiKey?: string;
      integrationId?: string;
      organizationId?: string;
    };
  };
};

declare global {
  interface Window {
    __ZDOC_ENV__?: {
      INKEEP_API_KEY?: string;
      INKEEP_INTEGRATION_ID?: string;
      INKEEP_ORGANIZATION_ID?: string;
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
  const [runtimeInkeep, setRuntimeInkeep] = useState<{
    apiKey?: string;
    integrationId?: string;
    organizationId?: string;
  }>({});
  const mod = isMac() ? '⌘' : 'Ctrl';
  const inkeepPlugin = siteConfig.plugins.find(plugin =>
    Array.isArray(plugin) && plugin[0] === '@inkeep/cxkit-docusaurus'
  );
  const inkeepPluginOptions = Array.isArray(inkeepPlugin)
    ? inkeepPlugin[1] as InkeepPluginOptions
    : undefined;
  const pluginBaseSettings = inkeepPluginOptions?.SearchBar?.baseSettings;
  const apiKey = pluginBaseSettings?.apiKey || runtimeInkeep.apiKey;
  const integrationId = pluginBaseSettings?.integrationId || runtimeInkeep.integrationId;
  const organizationId = pluginBaseSettings?.organizationId || runtimeInkeep.organizationId;

  const resetSearchInput = useCallback(() => {
    document.dispatchEvent(new CustomEvent('zdoc-search-reset'));
  }, []);

  const openSearch = useCallback(() => {
    resetSearchInput();
    setSearchOpen(true);
  }, [resetSearchInput]);

  const openAskAi = useCallback(() => {
    document.dispatchEvent(new CustomEvent('toggle-chat'));
  }, []);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setSearchOpen(isOpen);
    if (isOpen) window.setTimeout(resetSearchInput, 0);
  }, [resetSearchInput]);

  const inkeepSearchConfig = useMemo(() => ({
    ...inkeepSettings,
    baseSettings: {
      ...inkeepSettings.baseSettings,
      apiKey,
      integrationId,
      organizationId,
    },
    modalSettings: {
      isOpen: searchOpen,
      onOpenChange: handleOpenChange,
    },
  }), [apiKey, handleOpenChange, integrationId, organizationId, searchOpen]);

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
    setRuntimeInkeep({
      apiKey: window.__ZDOC_ENV__?.INKEEP_API_KEY,
      integrationId: window.__ZDOC_ENV__?.INKEEP_INTEGRATION_ID,
      organizationId: window.__ZDOC_ENV__?.INKEEP_ORGANIZATION_ID,
    });
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
    // Tolerate normalization differences (locale prefix like /ja-JP, trailing
    // slash) so a mismatch never silently skips re-opening the drilled menu.
    const arrivedAtTarget =
      normalizedTarget === '1' ||
      normalizedTarget === normalizedPathname ||
      normalizedPathname.endsWith(normalizedTarget) ||
      normalizedTarget.endsWith(normalizedPathname);
    if (!arrivedAtTarget) return undefined;

    // Re-open ONCE, judged by React's `shown` state — NOT the `.navbar-sidebar--show`
    // DOM class, which lags a frame behind the state. The old code fired 7 retry
    // timers + a MutationObserver that all called toggle() while reading that
    // lagging class, so within one frame several toggles stacked and net-closed the
    // sidebar (even number of flips). React `shown` is consistent within a render,
    // so re-runs never double-toggle: after we open, the next run sees shown=true.
    if (!mobileSidebar.shown) {
      mobileSidebar.toggle();
    }

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

    // Keep the flag alive for a short grace window (re-scheduled every run) so a
    // late cross-plugin remount that resets `shown` re-triggers this effect and
    // re-opens; then clear it. NOT consumed immediately — that was why a post-open
    // reset could never be recovered.
    const clearFlag = window.setTimeout(() => {
      try {
        window.sessionStorage.removeItem('zdoc-mobile-nav-keep-open');
        window.sessionStorage.removeItem('zdoc-mobile-nav-drill-direction');
      } catch {
        // ignore
      }
      document.documentElement.classList.remove(
        'zdoc-mobile-nav-keep-visible',
        'zdoc-mobile-nav-route-guard',
        'zdoc-mobile-nav-drill-forward',
        'zdoc-mobile-nav-drill-back'
      );
      document.getElementById('zdoc-mobile-nav-route-guard')?.remove();
    }, 900);
    const removeRouteGuard = window.setTimeout(() => {
      document.documentElement.classList.remove('zdoc-mobile-nav-route-guard');
      document.getElementById('zdoc-mobile-nav-route-guard')?.remove();
    }, 420);
    const removeDrillClass = window.setTimeout(() => {
      document.documentElement.classList.remove('zdoc-mobile-nav-drill-forward', 'zdoc-mobile-nav-drill-back');
    }, 280);
    return () => {
      window.clearTimeout(clearFlag);
      window.clearTimeout(removeRouteGuard);
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
            onClick={openAskAi}
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
            onClick={openAskAi}
            aria-label="Ask AI">
            <BoltIcon width={9} height={16} />
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
            {...(inkeepSearchConfig as any)}
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
