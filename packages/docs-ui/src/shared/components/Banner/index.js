import React from 'react';
import styles from './styles.module.css';

export default function Banner({ bannerText, bannerLinkText }) {
    return (
        <div className={styles.container}>
            <div className={styles.banner}>
                <span className={styles.bannerText}>
                    { bannerText }
                </span>
                {/* A button, not a link: it opens the Ask AI panel in place.
                    It used to navigate to /docs/home?chat=1, which reloaded the
                    page you were already on just to set a query param. */}
                <button
                    type="button"
                    className={styles.bannerLink}
                    onClick={() => document.dispatchEvent(new CustomEvent('toggle-chat'))}
                >
                    {/* The same bolt the navbar's Ask AI button uses — one mark for
                        one action, on the same side of the label. */}
                    <svg width="8.5" height="14.9" viewBox="0 0 8 14" fill="none" aria-hidden="true">
                        <path d="M0 8.55556L5.6 0L4.8 5.64912H8L1.6 14L3.2 8.55556H0Z" fill="currentColor" />
                    </svg>
                    <span>{ bannerLinkText }</span>
                </button>
            </div>
        </div>
    )
}
