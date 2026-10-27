import React, {type ReactNode, useRef, useEffect} from 'react';
import clsx from 'clsx';
import {useLocation} from '@docusaurus/router';
import {useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import type {Props} from '@theme/DocRoot/Layout/Main';

import styles from './styles.module.css';

// NEXT-channel gated content (NextChannel include blocks) is absent from the
// static HTML and mounts one commit after hydration, once the client resolves
// the deployment channel. Native anchor scrolling and Docusaurus's own
// route-update scroll each look up the hash target exactly once, so a heading
// inside gated content is missed and nothing retries. Keep re-checking for the
// target while this navigation is current; the cleanup (hash/pathname change or
// unmount) cancels the pending attempts.
const HASH_TARGET_RETRY_INTERVAL_MS = 100;
const HASH_TARGET_RETRY_WINDOW_MS = 10_000;

function hashTargetId(hash: string): string | undefined {
  const raw = hash.slice(1);
  if (!raw) return undefined;
  try {
    return decodeURIComponent(raw);
  } catch {
    return undefined;
  }
}

export default function DocRootLayoutMain({
  hiddenSidebarContainer,
  children,
}: Props): ReactNode {
  const sidebar = useDocsSidebar();
  const mainRef = useRef<HTMLElement>(null);
  const {pathname, hash} = useLocation();

  // This <main> is the scroll container (overflow-y: auto), so the window/native
  // scroll-to-top on route change doesn't reset it. Reset it ourselves on every
  // pathname change (clicking "Next", a sidebar item, etc.) — unless the URL has
  // a hash, in which case scroll the anchor in instead, retrying while its
  // heading mounts late behind the channel gate.
  useEffect(() => {
    if (!hash) {
      mainRef.current?.scrollTo({top: 0});
      return undefined;
    }
    const targetId = hashTargetId(hash);
    if (!targetId) return undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const deadline = Date.now() + HASH_TARGET_RETRY_WINDOW_MS;
    const attempt = () => {
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView();
        return;
      }
      if (Date.now() >= deadline) return;
      timer = setTimeout(attempt, HASH_TARGET_RETRY_INTERVAL_MS);
    };
    attempt();
    return () => clearTimeout(timer);
  }, [pathname, hash]);

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
