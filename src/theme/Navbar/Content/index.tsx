import React, {type ReactNode, useState, useEffect, useCallback, useMemo} from 'react';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import NavbarMobileSidebarToggle from '@theme/Navbar/MobileSidebar/Toggle';
import NavbarLogo from '@theme/Navbar/Logo';
import {InkeepModalSearch} from '@inkeep/cxkit-react';
import {Search} from 'lucide-react';
import SecondaryNavbar from '@site/src/components/SecondaryNavbar';
import {inkeepSettings} from '../../../../config/inkeep.config';
import styles from './styles.module.css';

type InkeepPluginOptions = {
  SearchBar?: {
    baseSettings?: {
      apiKey?: string;
    };
  };
};

function isMac() {
  return typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

function getDocsHomePath(pathname: string) {
  return pathname.startsWith('/ja-JP/') ? '/ja-JP/docs/home' : '/docs/home';
}

export default function NavbarContent(): ReactNode {
  const mobileSidebar = useNavbarMobileSidebar();
  const {siteConfig} = useDocusaurusContext();
  const {pathname} = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const mod = isMac() ? '⌘' : 'Ctrl';
  const inkeepPlugin = siteConfig.plugins.find(plugin =>
    Array.isArray(plugin) && plugin[0] === '@inkeep/cxkit-docusaurus'
  );
  const inkeepPluginOptions = Array.isArray(inkeepPlugin)
    ? inkeepPlugin[1] as InkeepPluginOptions
    : undefined;
  const apiKey = inkeepPluginOptions?.SearchBar?.baseSettings?.apiKey;

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setSearchOpen(isOpen);
  }, []);

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
    const handler = () => setSearchOpen(true);
    document.addEventListener('open-mobile-search', handler);
    return () => document.removeEventListener('open-mobile-search', handler);
  }, []);

  // Cmd+K / Ctrl+K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

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
            onClick={() => setSearchOpen(true)}
            type="button"
            aria-label="Search documentation">
            <Search size={14} aria-hidden="true" />
            <span>Search</span>
          </button>
          <span className={styles.navTip} role="tooltip"><kbd>{mod}</kbd><kbd>K</kbd></span>
        </span>

        <span className={styles.navTipWrap}>
          <button
            type="button"
            className="navbar-ask-ai-btn"
            onClick={() => document.dispatchEvent(new CustomEvent('toggle-chat'))}
            aria-label="Ask AI">
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true">
              <path d="M0 8.55556L5.6 0L4.8 5.64912H8L1.6 14L3.2 8.55556H0Z" fill="currentColor" />
            </svg>
            <span>Ask AI</span>
          </button>
          <span className={styles.navTip} role="tooltip"><kbd>{mod}</kbd><kbd>I</kbd></span>
        </span>

        <a href="https://cloud.zilliz.com/login" className="navbar-login-link" target="_blank" rel="noopener noreferrer">
          Log In
        </a>
        <a href="https://cloud.zilliz.com/signup" className="navbar-signup-btn" target="_blank" rel="noopener noreferrer">
          Sign Up Free
        </a>
        {!mobileSidebar.disabled && <NavbarMobileSidebarToggle />}
      </div>

      {apiKey && <InkeepModalSearch {...inkeepSearchConfig} />}
    </div>
  );
}
