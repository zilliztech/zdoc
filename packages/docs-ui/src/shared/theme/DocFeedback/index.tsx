import React, {useEffect, useState, type ReactNode} from 'react';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {ThumbsUp, ThumbsDown} from 'lucide-react';
import {resolveDocsUiSite, useDocsUiText} from '../../i18n/uiText';
import {trackEvent} from '../../utils/analytics';
import styles from './styles.module.css';

type Rating = 'up' | 'down';

/* One vote per page per browser. The GA4 `rating` parameter and the auto
 * pagePath on the hit are the whole record — there is no backend. */
const votedKey = (pathname: string) => `zd_doc_feedback_voted:${pathname}`;

function readVote(pathname: string): Rating | null {
  try {
    const raw = window.localStorage.getItem(votedKey(pathname));
    return raw === 'up' || raw === 'down' ? raw : null;
  } catch {
    return null;
  }
}

export default function DocFeedback(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const text = useDocsUiText();
  const {pathname} = useLocation();
  // First frame renders the voting buttons so server and client markup match;
  // a stored vote only takes over after mount.
  const [rating, setRating] = useState<Rating | null>(null);

  useEffect(() => {
    setRating(readVote(pathname));
  }, [pathname]);

  // zh-CN has no GA property (and no GA4 tag in its GTM container) — a vote
  // there would lock the browser out with no data going anywhere. Kept after
  // every hook so a future runtime-mutable gate can never trip React's
  // rendered-fewer-hooks invariant.
  if (resolveDocsUiSite(siteConfig.customFields?.site) !== 'en') {
    return null;
  }

  const vote = (value: Rating) => {
    if (rating) return;
    trackEvent('doc_feedback', {rating: value});
    try {
      window.localStorage.setItem(votedKey(pathname), value);
    } catch {
      // Storage can be unavailable (private mode); the event is already sent.
    }
    setRating(value);
  };

  return (
    <div className={styles.docFeedback}>
      {rating ? (
        <span className={styles.thanks}>{text.docFeedback.thanks}</span>
      ) : (
        <>
          <span className={styles.question}>{text.docFeedback.question}</span>
          <div className={styles.buttons}>
            <button
              type="button"
              className={styles.voteBtn}
              onClick={() => vote('up')}
              aria-label={text.docFeedback.helpful}
              title={text.docFeedback.helpful}>
              <ThumbsUp size={14} />
            </button>
            <button
              type="button"
              className={styles.voteBtn}
              onClick={() => vote('down')}
              aria-label={text.docFeedback.notHelpful}
              title={text.docFeedback.notHelpful}>
              <ThumbsDown size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
