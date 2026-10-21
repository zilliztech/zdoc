import React, {useEffect, useState, type ReactNode} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useDocsUiText} from '../../i18n/uiText';
import styles from './styles.module.css';

const SUPPORT_URL = 'https://support.zilliz.com/hc/en-us';

/** Dismissal lives in module memory for the current page load: the notice
 * describes the whole ja-JP locale, not the current page, so closing it once
 * keeps it closed while the reader navigates client-side (remounts included);
 * a full reload shows it again. */
let dismissedForSession = false;

/** Test hook: forget the dismissal between scenarios. */
export function resetDismissedForSession(): void {
  dismissedForSession = false;
}

/** Floating machine-translation disclosure for ja-JP pages, mounted from
 * DocItem/Layout. Renders nothing for other locales and nothing until mount,
 * so the prerendered HTML never contains the notice. The support center is the
 * only link; the guidance mention stays plain text — readers type into the
 * input box below the content. */
export default function MachineTranslationToast(): ReactNode {
  const {i18n} = useDocusaurusContext();
  const text = useDocsUiText();
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (i18n.currentLocale !== 'ja-JP' || !mounted || dismissed || dismissedForSession) {
    return null;
  }

  const mt = text.machineTranslation;

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <span className={styles.badge} aria-hidden="true" />
      <p className={styles.message}>
        {mt.prefix}
        {mt.ask}
        {mt.middle}
        <a
          className={styles.action}
          href={SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer">
          {mt.contact}
        </a>
        {mt.suffix}
      </p>
      <button
        type="button"
        className={styles.close}
        aria-label={mt.dismiss}
        onClick={() => {
          dismissedForSession = true;
          setDismissed(true);
        }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
