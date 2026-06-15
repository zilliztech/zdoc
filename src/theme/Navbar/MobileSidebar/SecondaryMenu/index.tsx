import React, {type ReactNode} from 'react';
import {useNavbarSecondaryMenu, useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';

function IconBolt() {
  return (
    <svg width="13" height="13" viewBox="0 0 8 14" fill="none" aria-hidden="true">
      <path d="M0 8.55556L5.6 0L4.8 5.64912H8L1.6 14L3.2 8.55556H0Z" fill="currentColor" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconSupport() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" strokeLinecap="round" />
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
  function openSearch() {
    document.dispatchEvent(new CustomEvent('open-mobile-search'));
  }

  return (
    <>
      <button
        type="button"
        className="mobile-action-search clean-btn"
        onClick={openSearch}
        aria-label="Search documentation">
        <IconSearch />
        <span>Search documentation…</span>
      </button>
    </>
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
        href="https://cloud.zilliz.com/login"
        className="mobile-action-link"
        target="_blank"
        rel="noopener noreferrer">
        <IconLogIn />
        Log In
      </a>
      <a
        href="https://support.zilliz.com/hc/en-us"
        className="mobile-action-link"
        target="_blank"
        rel="noopener noreferrer">
        <IconSupport />
        Support
      </a>
    </div>
  );
}

export default function NavbarMobileSidebarSecondaryMenu(): ReactNode {
  const secondaryMenu = useNavbarSecondaryMenu();
  return (
    <div className="mobile-secondary-menu-wrapper">
      <MobileActionToolbar />
      <div className="mobile-secondary-menu-content">
        {secondaryMenu.content}
      </div>
      <MobileActionLinks />
    </div>
  );
}
