import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Hero from '@site/src/components/Hero';
import MidNavbar from '@site/src/components/MidNavbar';
import ArticleLists from '../components/ArticleLists';

export default function Home() {
  const {siteConfig} = useDocusaurusContext();

  return (
    <Layout style= {{ fontFamily: "font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"}}
      title={siteConfig.title}
      description={siteConfig.tagline}>
      <main>
        <Hero />
        <MidNavbar />
        <ArticleLists />
      </main>
    </Layout>
  );
}
