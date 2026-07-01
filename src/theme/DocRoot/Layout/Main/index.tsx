import React, {type ReactNode, useRef, useEffect} from 'react';
import clsx from 'clsx';
import {useLocation} from '@docusaurus/router';
import {useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import type {Props} from '@theme/DocRoot/Layout/Main';

import styles from './styles.module.css';

export default function DocRootLayoutMain({
  hiddenSidebarContainer,
  children,
}: Props): ReactNode {
  const sidebar = useDocsSidebar();
  const mainRef = useRef<HTMLElement>(null);
  const {pathname} = useLocation();

  // This <main> is the scroll container (overflow-y: auto), so the window/native
  // scroll-to-top on route change doesn't reset it. Reset it ourselves on every
  // pathname change (clicking "Next", a sidebar item, etc.) — unless the URL has
  // a hash, in which case let the anchor scroll happen.
  useEffect(() => {
    if (!window.location.hash) {
      mainRef.current?.scrollTo({top: 0});
    }
  }, [pathname]);

  return (
    <main
      ref={mainRef}
      className={clsx(
        styles.docMainContainer,
        (hiddenSidebarContainer || !sidebar) && styles.docMainContainerEnhanced,
      )}>
      <div
        className={clsx(
          styles.docItemWrapper,
          hiddenSidebarContainer && styles.docItemWrapperEnhanced,
        )}>
        {children}
      </div>
    </main>
  );
}
