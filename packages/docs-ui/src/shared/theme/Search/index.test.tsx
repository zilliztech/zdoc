import React from 'react';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, fireEvent, cleanup, act} from '@testing-library/react';

const {siteState} = vi.hoisted(() => ({siteState: {current: 'en'}}));

vi.mock('@docusaurus/useDocusaurusContext', () => ({
  default: () => ({
    siteConfig: {
      customFields: {
        chatEndpoint: '/api/chat',
        site: siteState.current,
      },
    },
    i18n: {currentLocale: 'en'},
  }),
}));

vi.mock('@docusaurus/router', () => ({
  useLocation: () => ({pathname: '/docs/home'}),
}));

import SearchModal from './index';

describe('SearchModal search_performed', () => {
  const results = [
    {title: 'Cluster Types', url: '/docs/cu-types-explained', section: 'docs'},
    {title: 'Home', url: '/docs/home', section: 'docs'},
  ];

  async function typeAndSettle(input: HTMLElement, value: string) {
    fireEvent.change(input, {target: {value}});
    await vi.advanceTimersByTimeAsync(700);
  }

  beforeEach(() => {
    window.dataLayer = [];
    window.localStorage.clear();
    vi.useFakeTimers({shouldAdvanceTime: true});
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ok: true, json: () => Promise.resolve({results})}))
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('fires once per settled query with the result count', async () => {
    render(<SearchModal onClose={vi.fn()} />);
    const input = screen.getByPlaceholderText('Search documentation...');
    await typeAndSettle(input, 'cluster');
    expect(window.dataLayer).toEqual([
      {event: 'search_performed', search_term: 'cluster', result_count: '2', surface: 'modal'},
    ]);
  });

  it('does not fire for intermediate strings within the debounce window', async () => {
    render(<SearchModal onClose={vi.fn()} />);
    const input = screen.getByPlaceholderText('Search documentation...');
    fireEvent.change(input, {target: {value: 'c'}});
    fireEvent.change(input, {target: {value: 'cl'}});
    fireEvent.change(input, {target: {value: 'cluster'}});
    await vi.advanceTimersByTimeAsync(700);
    const performed = window.dataLayer.filter(e => e.event === 'search_performed');
    expect(performed).toEqual([
      {event: 'search_performed', search_term: 'cluster', result_count: '2', surface: 'modal'},
    ]);
  });

  it('dedupes a repeated identical query within one modal session', async () => {
    render(<SearchModal onClose={vi.fn()} />);
    const input = screen.getByPlaceholderText('Search documentation...');
    await typeAndSettle(input, 'cluster');
    expect(window.dataLayer.filter(e => e.event === 'search_performed')).toHaveLength(1);
    window.dataLayer = [];
    await typeAndSettle(input, '');
    await typeAndSettle(input, 'cluster');
    expect(window.dataLayer.filter(e => e.event === 'search_performed')).toHaveLength(0);
  });

  it('attributes result_count to the current query when a stale response lands mid-flight', async () => {
    // 'mil' gets one (deferred) result, anything else two — so a stale
    // attribution is observable in result_count.
    let resolveFirst!: (value: unknown) => void;
    let call = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn((url: unknown) => {
        call += 1;
        const q = decodeURIComponent(String(url).split('q=')[1] || '');
        const body = q === 'mil'
          ? {results: [{title: 'mil-only', url: '/mil', section: 'docs'}]}
          : {results: [{title: 'a', url: '/a', section: 'docs'}, {title: 'b', url: '/b', section: 'docs'}]};
        if (call === 1) {
          return new Promise(resolve => {
            resolveFirst = resolve;
          });
        }
        return Promise.resolve({ok: true, json: () => Promise.resolve(body)});
      })
    );
    render(<SearchModal onClose={vi.fn()} />);
    const input = screen.getByPlaceholderText('Search documentation...');
    fireEvent.change(input, {target: {value: 'mil'}});
    await vi.advanceTimersByTimeAsync(450); // 'mil' fetch in flight
    fireEvent.change(input, {target: {value: 'mila'}});
    // The stale 'mil' response lands inside 'mila's debounce window.
    await act(async () => {
      resolveFirst({ok: true, json: () => Promise.resolve({results: [{title: 'mil-only', url: '/mil'}]})});
      await vi.advanceTimersByTimeAsync(50);
    });
    expect(window.dataLayer.filter(e => e.event === 'search_performed')).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(700); // 'mila' settles
    expect(window.dataLayer.filter(e => e.event === 'search_performed')).toEqual([
      {event: 'search_performed', search_term: 'mila', result_count: '2', surface: 'modal'},
    ]);
  });

  it('reports zero results when the endpoint errors', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ok: false})));
    render(<SearchModal onClose={vi.fn()} />);
    await typeAndSettle(screen.getByPlaceholderText('Search documentation...'), 'ghost');
    expect(window.dataLayer).toEqual([
      {event: 'search_performed', search_term: 'ghost', result_count: '0', surface: 'modal'},
    ]);
  });
});

describe('SearchModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    siteState.current = 'en';
    vi.useFakeTimers({shouldAdvanceTime: true});
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders input and close hint', () => {
    render(<SearchModal onClose={onClose} />);
    expect(screen.getByPlaceholderText('Search documentation...')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'ESC'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /Getting Started/})).toBeInTheDocument();
  });

  it('closes on Escape key', () => {
    render(<SearchModal onClose={onClose} />);
    fireEvent.keyDown(document, {key: 'Escape'});
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on overlay click', () => {
    render(<SearchModal onClose={onClose} />);
    const overlay = document.querySelector('[class*="searchOverlay"]');
    if (overlay) fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  it('shows Ask AI row when typing', () => {
    render(<SearchModal onClose={onClose} />);
    const input = screen.getByPlaceholderText('Search documentation...');
    fireEvent.change(input, {target: {value: 'test'}});
    expect(screen.getByText(/Ask AI:/)).toBeInTheDocument();
  });

  it('renders localized controls for the Chinese site', () => {
    siteState.current = 'zh-CN';
    render(<SearchModal onClose={onClose} />);
    const input = screen.getByPlaceholderText('搜索文档...');
    expect(screen.getByRole('button', {name: /快速开始/})).toBeInTheDocument();
    fireEvent.change(input, {target: {value: '索引'}});
    expect(screen.getByText('Ask AI：“索引”')).toBeInTheDocument();
  });

  it('navigates with arrow keys', () => {
    render(<SearchModal onClose={onClose} />);
    const input = screen.getByPlaceholderText('Search documentation...');
    fireEvent.keyDown(input, {key: 'ArrowDown'});
    fireEvent.keyDown(input, {key: 'Enter'});
    // Should trigger Ask AI or navigate; primarily testing no crash
    expect(input).toBeInTheDocument();
  });
});
