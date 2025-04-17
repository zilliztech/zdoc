import React from 'react';
import styles from './styles.module.css';

export default function Banner({ bannerText, bannerLinkText }) {
    return (
        <div className={styles.container}>
            <div className={styles.banner}>
                <span className={styles.bannerText}>
                    { bannerText }
                </span>
                <span className={styles.bannerLink}>
                    <span>{ bannerLinkText }</span>
                    <img src='/icons/zilliz-star.svg' />
                </span>
            </div> 
        </div>
    )
}