import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';

export default function Hero () {
    const { siteConfig } = useDocusaurusContext();  

    return (
      <div className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroTextContainer}>
            <div className={styles.heroTitle}>
              <span>{siteConfig.title}</span>
            </div>
            <div className={styles.heroSubtitle}>
              <span>{siteConfig.tagline}</span>
            </div>
            <div className={styles.heroButtons}>
              <div className={styles.releaseNotesBtn}>
                  <span>
                    <Link to="/docs/release-notes">Release Notes</Link>
                  </span>
              </div>
              <div className={styles.faqsBtn}>
                  <span>
                      <Link to="/docs/faqs">FAQs</Link>
                  </span>
              </div>
            </div>
          </div>
          <div className={styles.heroImageContainer}>
            <img src="https://assets.zilliz.com/rdme_hero_img.png" className={styles.heroImage} alt="Zilliz Developer Hub"></img>
          </div>
        </div>
      </div>      
    )
}