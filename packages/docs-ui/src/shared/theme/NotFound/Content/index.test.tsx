import React from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {cleanup, render} from '@testing-library/react';

const routeState = vi.hoisted(() => ({
  pathname: '/docs/migrate-from-pinecone',
  search: '',
  hash: '',
}));
const redirectDataState = vi.hoisted(() => ({
  rules: undefined as Array<{from: string; to: string}> | undefined,
}));
const siteState = vi.hoisted(() => ({baseUrl: '/'}));
const redirects = vi.hoisted(() => [] as string[]);

vi.mock('@docusaurus/router', () => ({
  Redirect: (props: {to: string}) => {
    redirects.push(props.to);
    return null;
  },
  useLocation: () => ({pathname: routeState.pathname, search: routeState.search, hash: routeState.hash}),
}));
vi.mock('@docusaurus/useGlobalData', () => ({
  usePluginData: () => (redirectDataState.rules === undefined ? undefined : {rules: redirectDataState.rules}),
}));
vi.mock('@docusaurus/useDocusaurusContext', () => ({
  default: () => ({
    siteConfig: {baseUrl: siteState.baseUrl, customFields: {}},
    i18n: {currentLocale: 'en', defaultLocale: 'en', localeConfigs: {en: {htmlLang: 'en'}}},
  }),
}));
vi.mock('@docusaurus/BrowserOnly', () => ({
  default: ({children}: {children: () => React.ReactNode}) => <>{children()}</>,
}));
vi.mock('@docusaurus/ErrorBoundary', () => ({
  default: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));
vi.mock('../../../components/AskAiComposer', () => ({default: () => null}));
vi.mock('../../../components/ChatPanel/ChatContext', () => ({
  ChatProvider: ({children}: {children: React.ReactNode}) => <>{children}</>,
  useChatContext: () => ({
    input: '',
    setInput: () => undefined,
    isStreaming: false,
    send: () => undefined,
    messages: [],
    rateFeedback: () => undefined,
  }),
}));
vi.mock('../../../utils/analytics', () => ({trackEvent: vi.fn()}));

import NotFoundContent from './index';
import {spaRedirectTarget} from './spaRedirectMap';

const RULES = [
  {from: '/docs/migrate-from-pinecone', to: '/docs/migrate-from-qdrant'},
  {from: '/docs/data-import', to: '/docs/data-import-zero-to-hero'},
];

describe('spaRedirectTarget', () => {
  it('maps an exact miss to its live successor', () => {
    expect(spaRedirectTarget('/docs/migrate-from-pinecone', '', '', RULES, '/')).toBe('/docs/migrate-from-qdrant');
  });

  it('carries query and hash across the hop', () => {
    expect(spaRedirectTarget('/docs/data-import', '?lang=zh', '#setup', RULES, '/')).toBe(
      '/docs/data-import-zero-to-hero?lang=zh#setup',
    );
  });

  it('normalizes a trailing slash on the requested path', () => {
    expect(spaRedirectTarget('/docs/migrate-from-pinecone/', '', '', RULES, '/')).toBe('/docs/migrate-from-qdrant');
  });

  it('strips and re-attaches a non-root baseUrl', () => {
    expect(spaRedirectTarget('/preview/docs/data-import', '', '', RULES, '/preview/')).toBe(
      '/preview/docs/data-import-zero-to-hero',
    );
  });

  it('keeps an unmapped or rule-less miss on the 404 page', () => {
    expect(spaRedirectTarget('/docs/never-existed', '', '', RULES, '/')).toBeNull();
    expect(spaRedirectTarget('/docs/migrate-from-pinecone', '', '', undefined, '/')).toBeNull();
    expect(spaRedirectTarget('/docs/migrate-from-pinecone', '', '', [], '/')).toBeNull();
  });
});

describe('NotFoundContent redirect', () => {
  afterEach(() => {
    cleanup();
    redirects.length = 0;
    document.body.classList.remove('zd-notfound-page');
    routeState.pathname = '/docs/migrate-from-pinecone';
    routeState.search = '';
    routeState.hash = '';
    redirectDataState.rules = undefined;
    siteState.baseUrl = '/';
  });

  it('redirects a mapped miss instead of rendering the 404 UI', () => {
    redirectDataState.rules = RULES;
    render(<NotFoundContent />);
    expect(redirects).toEqual(['/docs/migrate-from-qdrant']);
    expect(document.body.classList.contains('zd-notfound-page')).toBe(false);
  });

  it('keeps the chrome-less 404 page for an unmapped miss', () => {
    render(<NotFoundContent />);
    expect(redirects).toEqual([]);
    expect(document.body.classList.contains('zd-notfound-page')).toBe(true);
  });
});
