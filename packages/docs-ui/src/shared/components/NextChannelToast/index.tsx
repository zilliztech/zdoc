import React, {useEffect, useState, type ReactNode} from 'react';
import {useLocation} from '@docusaurus/router';
import styles from './styles.module.css';

/** Dismissals live in module memory for the current page load: closing the
 * toast on one unreleased page keeps it closed while the reader navigates
 * client-side (remounts included), a full reload shows it again, and a
 * different unreleased page always shows it. */
const dismissedRoutes = new Set<string>();

/** Test hook: forget per-route dismissals between scenarios. */
export function resetDismissedRoutes(): void {
  dismissedRoutes.clear();
}

interface NextChannelToastProps {
  message: string;
  dismissLabel: string;
}

/** Floating unreleased-feature notice for NEXT-channel pages on next
 * deployments, mounted from DocItem/Layout. It renders nothing until mount,
 * so the prerendered HTML never contains the notice (fail closed, matching
 * the rest of the release-channel gate). */
export default function NextChannelToast({message, dismissLabel}: NextChannelToastProps): ReactNode {
  const {pathname} = useLocation();
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || dismissed || dismissedRoutes.has(pathname)) {
    return null;
  }

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <span className={styles.badge} aria-hidden="true" />
      <p className={styles.message}>{message}</p>
      <button
        type="button"
        className={styles.close}
        aria-label={dismissLabel}
        onClick={() => {
          dismissedRoutes.add(pathname);
          setDismissed(true);
        }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
