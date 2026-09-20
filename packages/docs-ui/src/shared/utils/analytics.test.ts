import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {durationBucket, normalizeAnalyticsParams, trackEvent} from './analytics';

describe('normalizeAnalyticsParams', () => {
  it('stringifies values and drops undefined and empty params', () => {
    expect(
      normalizeAnalyticsParams({
        str: 'value',
        count: 42,
        flag: true,
        missing: undefined,
        empty: '',
      }),
    ).toEqual({str: 'value', count: '42', flag: 'true'});
  });

  it('truncates values to the GA4 100-character cap', () => {
    const normalized = normalizeAnalyticsParams({path: 'a'.repeat(250)});
    expect(normalized.path).toHaveLength(100);
  });

  it('strips the reserved event key', () => {
    expect(normalizeAnalyticsParams({event: 'not-a-trigger', path: '/docs'})).toEqual({
      path: '/docs',
    });
  });

  it('treats missing params as empty', () => {
    expect(normalizeAnalyticsParams()).toEqual({});
  });
});

describe('trackEvent', () => {
  beforeEach(() => {
    delete window.dataLayer;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete window.dataLayer;
  });

  it('appends the event and normalized params to the existing dataLayer', () => {
    window.dataLayer = [{event: 'gtm.js'}];
    trackEvent('code_copy', {code_language: 'python', unused: undefined});
    expect(window.dataLayer).toEqual([
      {event: 'gtm.js'},
      {event: 'code_copy', code_language: 'python'},
    ]);
  });

  it('creates the dataLayer when GTM has not bootstrapped it', () => {
    trackEvent('cta_click', {cta_id: 'signup'});
    expect(window.dataLayer).toEqual([{event: 'cta_click', cta_id: 'signup'}]);
  });

  it('ignores empty event names', () => {
    trackEvent('   ');
    expect(window.dataLayer).toBeUndefined();
  });

  it('is a no-op without a window (SSR/prerender)', () => {
    vi.stubGlobal('window', undefined);
    expect(() => trackEvent('page_not_found', {requested_path: '/docs/x'})).not.toThrow();
  });
});

describe('durationBucket', () => {
  it('uses readable coarse buckets', () => {
    expect(durationBucket(400)).toBe('<1s');
    expect(durationBucket(1_000)).toBe('1-3s');
    expect(durationBucket(9_999)).toBe('3-10s');
    expect(durationBucket(29_999)).toBe('10-30s');
    expect(durationBucket(120_000)).toBe('>30s');
  });
});
