import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';

// chatSurface lives in ChatContext, whose module graph reaches
// @docusaurus/core client code with JSX in .js — mock the context first.
vi.mock('@docusaurus/useDocusaurusContext', () => ({
  default: () => ({siteConfig: {customFields: {}}, i18n: {currentLocale: 'en'}}),
}));

import {trackAiSourceClick} from './sourceAnalytics';

describe('trackAiSourceClick', () => {
  beforeEach(() => {
    window.dataLayer = [];
    document.body.classList.remove('zd-notfound-page');
  });

  afterEach(() => {
    document.body.classList.remove('zd-notfound-page');
  });

  it('sends a 1-based index and the external host', () => {
    trackAiSourceClick('https://docs.zilliz.com/docs/home', 0);
    expect(window.dataLayer).toEqual([
      {event: 'ai_source_click', surface: 'panel', source_index: '1', source_host: 'docs.zilliz.com'},
    ]);
  });

  it('resolves relative citation URLs against the current origin', () => {
    trackAiSourceClick('/docs/cu-types-explained', 2);
    expect(window.dataLayer).toEqual([
      {event: 'ai_source_click', surface: 'panel', source_index: '3', source_host: window.location.hostname},
    ]);
  });

  it('reports the notfound surface on the 404 page', () => {
    document.body.classList.add('zd-notfound-page');
    trackAiSourceClick('/docs/x', 0);
    expect(window.dataLayer[0]).toMatchObject({event: 'ai_source_click', surface: 'notfound'});
  });

  it('survives an unparseable URL with an empty host', () => {
    trackAiSourceClick('http://[', 0);
    // An empty host is dropped by the params contract (GA4 shows (not set)).
    expect(window.dataLayer).toEqual([
      {event: 'ai_source_click', surface: 'panel', source_index: '1'},
    ]);
  });
});
