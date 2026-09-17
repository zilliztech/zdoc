import {describe, expect, it, vi} from 'vitest';
import type {PropSidebarItem} from '@docusaurus/plugin-content-docs';

vi.mock('@docusaurus/useIsBrowser', () => ({default: () => true}));

import {
  filterNextChannelSidebarItems,
  frontMatterReleaseChannel,
  isNextChannelSidebarItem,
  normalizeReleaseChannel,
  runtimeReleaseChannel,
} from './releaseChannel';

describe('normalizeReleaseChannel', () => {
  it('accepts only an explicit NEXT value and fails closed otherwise', () => {
    expect(normalizeReleaseChannel('NEXT')).toBe('next');
    expect(normalizeReleaseChannel(' next ')).toBe('next');
    expect(normalizeReleaseChannel('current')).toBe('current');
    expect(normalizeReleaseChannel('CURRENT')).toBe('current');
    expect(normalizeReleaseChannel(undefined)).toBe('current');
    expect(normalizeReleaseChannel('beta')).toBe('current');
  });
});

describe('frontMatterReleaseChannel', () => {
  it('reads the channel front matter key', () => {
    expect(frontMatterReleaseChannel({channel: 'next'})).toBe('next');
    expect(frontMatterReleaseChannel({})).toBe('current');
    expect(frontMatterReleaseChannel(null)).toBe('current');
  });
});

describe('runtimeReleaseChannel', () => {
  it('reads the injected env and fails closed without one', () => {
    expect(runtimeReleaseChannel()).toBe('current');
    const original = window.__ZDOC_ENV__;
    try {
      (window as {__ZDOC_ENV__?: {RELEASE_CHANNEL?: unknown}}).__ZDOC_ENV__ = {RELEASE_CHANNEL: 'next'};
      expect(runtimeReleaseChannel()).toBe('next');
      (window as {__ZDOC_ENV__?: {RELEASE_CHANNEL?: unknown}}).__ZDOC_ENV__ = {};
      expect(runtimeReleaseChannel()).toBe('current');
    } finally {
      (window as {__ZDOC_ENV__?: {RELEASE_CHANNEL?: unknown}}).__ZDOC_ENV__ = original;
    }
  });
});

function docItem(id: string, extra: Record<string, unknown> = {}): PropSidebarItem {
  return {type: 'doc', id, label: id, ...extra} as unknown as PropSidebarItem;
}

describe('filterNextChannelSidebarItems', () => {
  it('removes NEXT docs, NEXT landing categories, and categories emptied by filtering', () => {
    const items: PropSidebarItem[] = [
      docItem('stable'),
      docItem('preview', {customProps: {channel: 'next'}}),
      {
        type: 'category',
        label: 'Security',
        items: [docItem('security/sso', {customProps: {channel: 'next'}})],
      } as unknown as PropSidebarItem,
      {
        type: 'category',
        label: 'Unreleased Section',
        customProps: {channel: 'next'},
        link: {type: 'doc', id: 'unreleased/landing'},
        items: [docItem('unreleased/page')],
      } as unknown as PropSidebarItem,
      {
        type: 'category',
        label: 'Pre-existing empty',
        items: [],
      } as unknown as PropSidebarItem,
    ];

    expect(filterNextChannelSidebarItems(items)).toEqual([
      docItem('stable'),
      {type: 'category', label: 'Pre-existing empty', items: []},
    ]);
    expect(isNextChannelSidebarItem(items[1]!)).toBe(true);
    expect(isNextChannelSidebarItem(items[0]!)).toBe(false);
  });

  it('keeps CURRENT categories that mix stable and NEXT children', () => {
    const items: PropSidebarItem[] = [
      {
        type: 'category',
        label: 'Mixed',
        items: [docItem('mixed/stable'), docItem('mixed/preview', {customProps: {channel: 'next'}})],
      } as unknown as PropSidebarItem,
    ];

    expect(filterNextChannelSidebarItems(items)).toEqual([
      {
        type: 'category',
        label: 'Mixed',
        items: [docItem('mixed/stable')],
      },
    ]);
  });
});
