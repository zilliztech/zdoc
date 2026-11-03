import React from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, render, screen} from '@testing-library/react';
import {renderToString} from 'react-dom/server';

const {pathState, localeState, frontMatterState} = vi.hoisted(() => ({
  pathState: {current: '/docs/release-notes-2610'},
  localeState: {current: 'en'},
  frontMatterState: {current: {} as Record<string, unknown> | null},
}));

vi.mock('@docusaurus/useDocusaurusContext', () => ({
  default: () => ({
    siteConfig: {customFields: {site: 'en'}},
    i18n: {currentLocale: localeState.current},
  }),
}));

vi.mock('@docusaurus/router', () => ({
  useLocation: () => ({pathname: pathState.current}),
}));

vi.mock('@docusaurus/plugin-content-docs/client', () => ({
  useDoc: () => ({frontMatter: frontMatterState.current}),
}));

import HeadingWrapper from './index';

function renderHeading(as: 'h1' | 'h2', children: React.ReactNode, id = 'some-heading') {
  return render(
    <HeadingWrapper as={as} id={id}>
      {children}
    </HeadingWrapper>,
  );
}

afterEach(() => {
  cleanup();
});

describe('HeadingWrapper tag rendering', () => {
  beforeEach(() => {
    pathState.current = '/docs/release-notes-2610';
    localeState.current = 'en';
    frontMatterState.current = {};
  });

  it('splits "| ON REQUEST" heading tags on en pages (existing behavior)', () => {
    renderHeading('h2', 'Zero Downtime Migration | ON REQUEST', 'zero-downtime-migration');
    expect(screen.getByRole('heading', {name: 'Zero Downtime Migration'})).toBeInTheDocument();
    const badge = screen.getByText('On Request');
    expect(badge.getAttribute('data-tag-type')).toBe('ON REQUEST');
    expect(badge.closest('a')?.getAttribute('href')).toBe('https://support.zilliz.com/hc/en-us');
  });

  it('splits heading tags on ja-JP pages too, where routes carry the locale prefix', () => {
    pathState.current = '/ja-JP/docs/release-notes-2610';
    localeState.current = 'ja-JP';
    renderHeading('h2', 'Zero Downtime Migration | ON REQUEST', 'zero-downtime-migration');
    expect(screen.getByRole('heading', {name: 'Zero Downtime Migration'})).toBeInTheDocument();
    const badge = screen.getByText('On Request');
    expect(badge.getAttribute('data-tag-type')).toBe('ON REQUEST');
    expect(badge.closest('a')?.getAttribute('href')).toBe('https://support.zilliz.com/hc/en-us');
  });

  it('prerenders the ja-JP split into the static HTML (SSG output is what ships)', () => {
    pathState.current = '/ja-JP/docs/release-notes-2610';
    localeState.current = 'ja-JP';
    const html = renderToString(
      <HeadingWrapper as="h2" id="zero-downtime-migration">
        Zero Downtime Migration | ON REQUEST
      </HeadingWrapper>,
    );
    expect(html).toContain('data-tag-type="ON REQUEST"');
    expect(html).not.toContain('| ON REQUEST');
  });

  it('renders h1 beta badges on ja-JP pages with the prefixed feature-availability link', () => {
    frontMatterState.current = {beta: 'PUBLIC'};
    pathState.current = '/ja-JP/docs/some-feature';
    localeState.current = 'ja-JP';
    renderHeading('h1', 'Some feature', 'some-feature');
    const badge = screen.getByText('Public Preview');
    expect(badge.closest('a')?.getAttribute('href')).toBe('/ja-JP/docs/feature-availability');
  });

  it('keeps BYOC h1 detection working under the locale prefix', () => {
    frontMatterState.current = {};
    pathState.current = '/ja-JP/docs/byoc/byoc-intro';
    localeState.current = 'ja-JP';
    renderHeading('h1', 'BYOC overview', 'byoc-overview');
    // CONTACT SALES is rendered by the TOC column, not inline next to the h1 —
    // the wrapper's job here is only to not crash on the byoc path.
    expect(screen.getByRole('heading', {name: 'BYOC overview'})).toBeInTheDocument();
    expect(screen.queryByText(/Contact Sales/i)).not.toBeInTheDocument();
  });

  it('leaves headings untouched outside doc, reference, and api paths', () => {
    pathState.current = '/ja-JP/blog/2026-11-03';
    localeState.current = 'ja-JP';
    renderHeading('h2', 'Zero Downtime Migration | ON REQUEST', 'zero-downtime-migration');
    expect(screen.getByRole('heading', {name: 'Zero Downtime Migration | ON REQUEST'})).toBeInTheDocument();
    expect(screen.queryByText('On Request')).not.toBeInTheDocument();
  });
});
