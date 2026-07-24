import React from 'react';
import styles from './styles.module.css';

export default function Banner({ bannerText, bannerLinkText }) {
    return (
        <div className={styles.container}>
            <div className={styles.banner}>
                <span className={styles.bannerText}>
                    { bannerText }
                </span>
                <a href="/docs/home?chat=1" className={styles.bannerLink}>
                    <span>{ bannerLinkText }</span>
                    <i className={styles.zillizStar} />
                </a>
            </div>
        </div>
    )
}
