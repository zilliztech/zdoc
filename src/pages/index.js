import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import MidNav from '@site/src/components/MidNav';
import ArticleLists from '@site/src/components/ArticleLists';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();

  return (
    <header className={clsx(styles.heroBanner)}>
      <div className={clsx(styles.heroBannerRow)}>
        <div className={clsx(styles.heroBannerColumn)}>
          <div></div>
          <div style={{display: "flex", flexDirection: "column", color: "#FFFFFF", marginTop: "2em"}}>
            <div style={{fontSize: "1.8em"}}>{siteConfig.title}</div>
            <div style={{fontSize: "1.2em", marginBottom: "2em"}}>{siteConfig.tagline}</div>
            <div style={{display: "flex", flexDirection: "row", gap: "10px"}}>
              <button style={{backgroundColor: "#FFFFFF", border: "none", borderRadius: "2px", color: "#000000", padding: "5px 10px", textAlign: "center", textDecoration: "none", display: "inline-block", fontSize: "0.9em", cursor: "pointer"}}>
                  <span style={{color: "#000000"}}><a style={{color: "#000000"}} href="/docs/release-notes">Release Notes</a></span>
              </button>
              <button style={{backgroundColor: "rgba(0,0,0,0)", border: "1px solid #FFFFFF", borderRadius: "2px", color: "#FFFFFF", padding: "5px 10px", textAlign: "center", textDecoration: "none", display: "inline-block", fontSize: "0.9em", cursor: "pointer"}}>
                  <span><a href="./docs/faqs" style={{color: "#FFFFFF"}}>FAQs</a></span>
              </button>
            </div>
          </div>
          <div style={{margin: "2.5em auto"}}>
            <img src="https://assets.zilliz.com/rdme_hero_img.png" style={{width: "100%", height: "auto"}} />
          </div>
          <div></div>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <main style={{marginBottom: "15px"}}>
        <HomepageHeader />
        <MidNav />
        <ArticleLists />
      </main>
    </Layout>
  );
}
