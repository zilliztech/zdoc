import React, {useState} from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly';
import {CircleCheck, ThumbsUp, ThumbsDown} from 'lucide-react';
import styles from './index.module.css'
import Translate, {translate} from '@docusaurus/Translate';

export default function FeedbackBox() {
    const [voted, setVoted] = useState(null);

    const handleVote = (type) => {
      setVoted(type);
    };

    return (
      <BrowserOnly>
      {() => {
        const hostname = window.location.hostname;
        if (hostname.includes('cloud-uat') || hostname.includes('localhost')) {
          if (voted) {
            return (
              <div id="feedback-box" className={styles.feedbackBox} role="status" aria-live="polite">
                <div className={styles.confirmation}>
                  <CircleCheck size={20} />
                  <Translate id="feedbackBox.thanks" description="Feedback confirmation message">
                    Thanks for your feedback!
                  </Translate>
                </div>
              </div>
            );
          }

          return (
            <div
              id="feedback-box"
              className={styles.feedbackBox}
              role="group"
              aria-label={translate({id: 'feedbackBox.ariaLabel', message: 'Page feedback'})}
            >
              <div className={styles.feedbackPrompt}>
                <Translate id="feedbackBox.feedback" description="Feedback box text">
                  Was this page helpful?
                </Translate>
              </div>
              <div className={styles.feedbackButtons}>
                <button
                  className={styles.thumbButton}
                  onClick={() => handleVote('up')}
                  aria-label={translate({id: 'feedbackBox.thumbsUp', message: 'Yes, this page was helpful'})}
                >
                  <i className={styles.thumbIcon}>
                    <ThumbsUp size={18} />
                  </i>
                </button>
                <button
                  className={styles.thumbButton}
                  onClick={() => handleVote('down')}
                  aria-label={translate({id: 'feedbackBox.thumbsDown', message: 'No, this page was not helpful'})}
                >
                  <i className={styles.thumbIcon}>
                    <ThumbsDown size={18} />
                  </i>
                </button>
              </div>
            </div>
          );
        } else {
          return <></>
        }
      }}
      </BrowserOnly>
    )
  }
