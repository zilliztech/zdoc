import React from 'react';
import clsx from 'clsx';
import Translate from '@docusaurus/Translate';
import Heading from '@theme-original/Heading';

export default function NotFoundContent({className}) {
  return (
    <main className={clsx('container margin-vert--xl', className)}>
      <div className="row">
        <div className="col col--6 col--offset-3" style={{textAlign: 'center'}}>
          <div style={{fontSize: '72px', marginBottom: '16px', opacity: 0.8}}>
            <span className="material-symbols-outlined" style={{fontSize: '72px', color: '#D0D6DF'}}>
              search_off
            </span>
          </div>
          <Heading as="h1" className="hero__title">
            <Translate
              id="theme.NotFound.title"
              description="The title of the 404 page">
              Page Not Found
            </Translate>
          </Heading>
          <p style={{color: '#475467', fontSize: '16px', lineHeight: '24px'}}>
            <Translate
              id="theme.NotFound.p1"
              description="The first paragraph of the 404 page">
              We could not find what you were looking for. The page may have been moved or no longer exists.
            </Translate>
          </p>

          <div style={{display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '32px', flexWrap: 'wrap'}}>
            <a className="button button--primary button--lg" href="/docs/home" style={{borderRadius: '8px', minWidth: '120px'}}>
              <span className="button__text button__text--primary">
                <Translate id="theme.NotFound.button.home" description="Home button on 404 page">
                  Home
                </Translate>
              </span>
            </a>
            <a className="button button--secondary button--lg" href="/docs/quick-start" style={{borderRadius: '8px', minWidth: '120px'}}>
              <span className="button__text button__text--secondary">
                <Translate id="theme.NotFound.button.quickstart" description="Quick Start button on 404 page">
                  Quick Start
                </Translate>
              </span>
            </a>
          </div>

          <div style={{marginTop: '48px', padding: '24px', background: '#F6F8FA', borderRadius: '12px', textAlign: 'left'}}>
            <p style={{fontSize: '14px', fontWeight: 600, color: '#24292f', marginBottom: '12px'}}>
              <Translate id="theme.NotFound.popular" description="Popular pages heading on 404">
                Popular pages
              </Translate>
            </p>
            <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px'}}>
              <li>
                <a href="/docs/quick-start" style={{color: '#175fff', fontSize: '14px', textDecoration: 'none'}}>
                  <Translate id="theme.NotFound.link.quickstart">Quick Start Guide</Translate>
                </a>
              </li>
              <li>
                <a href="/reference/restful" style={{color: '#175fff', fontSize: '14px', textDecoration: 'none'}}>
                  <Translate id="theme.NotFound.link.restapi">RESTful API Reference</Translate>
                </a>
              </li>
              <li>
                <a href="/reference/python" style={{color: '#175fff', fontSize: '14px', textDecoration: 'none'}}>
                  <Translate id="theme.NotFound.link.python">Python SDK Reference</Translate>
                </a>
              </li>
              <li>
                <a href="/docs/changelogs" style={{color: '#175fff', fontSize: '14px', textDecoration: 'none'}}>
                  <Translate id="theme.NotFound.link.releases">Release Notes</Translate>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
