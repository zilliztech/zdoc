import {describe, expect, it} from 'vitest';
import type {PropSidebarItem} from '@docusaurus/plugin-content-docs';

import {
  filterNextChannelPaginationLinks,
  filterNextChannelSidebarItems,
  filterRetiredChannelPaginationLinks,
  filterRetiredChannelSidebarItems,
  frontMatterReleaseChannel,
  isNextChannelSidebarItem,
  isRetiredChannelSidebarItem,
  normalizeReleaseChannel,
  runtimeReleaseChannel,
  sidebarPathIsNextChannel,
  sidebarPathIsRetiredChannel,
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

  it('accepts an explicit RETIRE-IN-NEXT value and nothing adjacent to it', () => {
    expect(normalizeReleaseChannel('RETIRE-IN-NEXT')).toBe('retire-in-next');
    expect(normalizeReleaseChannel(' retire-in-next ')).toBe('retire-in-next');
    expect(normalizeReleaseChannel('retire')).toBe('current');
    expect(normalizeReleaseChannel('to-retire')).toBe('current');
    expect(normalizeReleaseChannel('retired')).toBe('current');
  });
});

describe('frontMatterReleaseChannel', () => {
  it('reads the channel front matter key', () => {
    expect(frontMatterReleaseChannel({channel: 'next'})).toBe('next');
    expect(frontMatterReleaseChannel({channel: 'retire-in-next'})).toBe('retire-in-next');
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

  it('removes NEXT leaves nested below categories whose own child count is unchanged', () => {
    // Regression: the SSO leaf sits three levels deep, so every ancestor keeps
    // its direct child count while the filtered descendant disappears.
    const category = (label: string, items: PropSidebarItem[]): PropSidebarItem =>
      ({type: 'category', label, items}) as unknown as PropSidebarItem;

    const items: PropSidebarItem[] = [
      category('Management', [
        category('Identity Management', [
          category('Single Sign-on (SSO)', [
            docItem('sso/okta'),
            docItem('sso/ping-one', {customProps: {channel: 'next'}}),
            docItem('sso/other-idp'),
          ]),
        ]),
      ]),
    ];

    expect(filterNextChannelSidebarItems(items)).toEqual([
      category('Management', [
        category('Identity Management', [
          category('Single Sign-on (SSO)', [docItem('sso/okta'), docItem('sso/other-idp')]),
        ]),
      ]),
    ]);
  });

  it('drops a category emptied by a deeply nested removal, up to the top', () => {
    const items: PropSidebarItem[] = [
      {
        type: 'category',
        label: 'Outer',
        items: [
          {
            type: 'category',
            label: 'Inner',
            items: [docItem('outer/inner/only', {customProps: {channel: 'next'}})],
          } as unknown as PropSidebarItem,
          docItem('outer/keep'),
        ],
      } as unknown as PropSidebarItem,
    ];

    expect(filterNextChannelSidebarItems(items)).toEqual([
      {type: 'category', label: 'Outer', items: [docItem('outer/keep')]},
    ]);
  });

  it('keeps untouched subtrees reference-identical for React', () => {
    const untouched: PropSidebarItem = {
      type: 'category',
      label: 'Untouched',
      items: [docItem('untouched/a'), docItem('untouched/b')],
    } as unknown as PropSidebarItem;
    const items: PropSidebarItem[] = [
      untouched,
      {
        type: 'category',
        label: 'Touched',
        items: [docItem('touched/a'), docItem('touched/next', {customProps: {channel: 'next'}})],
      } as unknown as PropSidebarItem,
    ];

    const filtered = filterNextChannelSidebarItems(items);
    expect(filtered[0]).toBe(untouched);
    expect(filtered[1]).not.toBe(items[1]);
  });
});

describe('filterNextChannelPaginationLinks', () => {
  const sidebar: PropSidebarItem[] = [
    {type: 'link', key: 'a', href: '/docs/stable', label: 'Stable'} as unknown as PropSidebarItem,
    {
      type: 'link',
      key: 'b',
      href: '/docs/single-sign-on-with-ping-one',
      label: 'PingOne',
      customProps: {channel: 'next'},
    } as unknown as PropSidebarItem,
  ];

  it('drops pagination targets the sidebar hides on a CURRENT deployment', () => {
    const previous = {title: 'Google Workspace', permalink: '/docs/stable'};
    const next = {title: 'PingOne', permalink: '/docs/single-sign-on-with-ping-one'};

    expect(filterNextChannelPaginationLinks(previous, next, sidebar)).toEqual({
      previous,
      next: undefined,
    });
  });

  it('keeps every link on NEXT deployments, signalled by an absent sidebar', () => {
    const previous = {title: 'Google Workspace', permalink: '/docs/stable'};
    const next = {title: 'PingOne', permalink: '/docs/single-sign-on-with-ping-one'};

    expect(filterNextChannelPaginationLinks(previous, next, undefined)).toEqual({previous, next});
  });

  it('tolerates a trailing slash and a missing link', () => {
    const next = {title: 'PingOne', permalink: '/docs/single-sign-on-with-ping-one/'};

    expect(filterNextChannelPaginationLinks(undefined, next, sidebar)).toEqual({
      previous: undefined,
      next: undefined,
    });
    expect(filterNextChannelPaginationLinks(undefined, undefined, sidebar)).toEqual({
      previous: undefined,
      next: undefined,
    });
  });
});

describe('sidebarPathIsNextChannel', () => {
  const items: PropSidebarItem[] = [
    {type: 'doc', id: 'stable', label: 'Stable', href: '/docs/stable'} as unknown as PropSidebarItem,
    {
      type: 'doc',
      id: 'preview',
      label: 'Preview',
      href: '/docs/preview',
      customProps: {channel: 'next'},
    } as unknown as PropSidebarItem,
    {
      type: 'category',
      label: 'Unreleased',
      href: '/docs/unreleased',
      customProps: {channel: 'next'},
      items: [
        {type: 'doc', id: 'unreleased/landing', label: 'Landing', href: '/docs/unreleased'} as unknown as PropSidebarItem,
        {type: 'doc', id: 'unreleased/stable-child', label: 'Child', href: '/docs/unreleased/child'} as unknown as PropSidebarItem,
      ],
    } as unknown as PropSidebarItem,
  ];

  it('matches NEXT doc and NEXT category-landing paths for the docs shell gate', () => {
    expect(sidebarPathIsNextChannel(items, '/docs/preview')).toBe(true);
    expect(sidebarPathIsNextChannel(items, '/docs/preview/')).toBe(true);
    expect(sidebarPathIsNextChannel(items, '/docs/unreleased')).toBe(true);
    expect(sidebarPathIsNextChannel(items, '/docs/stable')).toBe(false);
  });

  it('stays page-exact: a CURRENT child of a NEXT category renders normally', () => {
    expect(sidebarPathIsNextChannel(items, '/docs/unreleased/child')).toBe(false);
  });
});

describe('filterRetiredChannelSidebarItems', () => {
  it('removes RETIRE-IN-NEXT entries while keeping NEXT ones for the preview', () => {
    const items: PropSidebarItem[] = [
      docItem('live'),
      docItem('split-successor', {customProps: {channel: 'next'}}),
      docItem('legacy-monolith', {customProps: {channel: 'retire-in-next'}}),
      {
        type: 'category',
        label: 'Restructured',
        customProps: {channel: 'retire-in-next'},
        link: {type: 'doc', id: 'legacy/landing'},
        items: [docItem('legacy/page')],
      } as unknown as PropSidebarItem,
      {
        type: 'category',
        label: 'Split',
        items: [
          docItem('split/part-a', {customProps: {channel: 'next'}}),
          docItem('split/part-b', {customProps: {channel: 'next'}}),
        ],
      } as unknown as PropSidebarItem,
    ];

    expect(filterRetiredChannelSidebarItems(items)).toEqual([
      docItem('live'),
      docItem('split-successor', {customProps: {channel: 'next'}}),
      {
        type: 'category',
        label: 'Split',
        items: [
          docItem('split/part-a', {customProps: {channel: 'next'}}),
          docItem('split/part-b', {customProps: {channel: 'next'}}),
        ],
      },
    ]);
    expect(isRetiredChannelSidebarItem(items[2]!)).toBe(true);
    expect(isRetiredChannelSidebarItem(items[1]!)).toBe(false);
    expect(isNextChannelSidebarItem(items[1]!)).toBe(true);
  });
});

describe('filterRetiredChannelPaginationLinks', () => {
  const sidebar: PropSidebarItem[] = [
    {type: 'link', key: 'a', href: '/docs/live', label: 'Live'} as unknown as PropSidebarItem,
    {
      type: 'link',
      key: 'b',
      href: '/docs/legacy-monolith',
      label: 'Legacy Monolith',
      customProps: {channel: 'retire-in-next'},
    } as unknown as PropSidebarItem,
  ];

  it('drops pagination targets the sidebar hides on a NEXT deployment', () => {
    const previous = {title: 'Legacy Monolith', permalink: '/docs/legacy-monolith'};
    const next = {title: 'Split Part A', permalink: '/docs/live'};

    expect(filterRetiredChannelPaginationLinks(previous, next, sidebar)).toEqual({
      previous: undefined,
      next,
    });
  });

  it('keeps every link without a sidebar signal', () => {
    const previous = {title: 'Legacy Monolith', permalink: '/docs/legacy-monolith'};
    const next = {title: 'Split Part A', permalink: '/docs/live'};

    expect(filterRetiredChannelPaginationLinks(previous, next, undefined)).toEqual({previous, next});
  });
});

describe('sidebarPathIsRetiredChannel', () => {
  const items: PropSidebarItem[] = [
    {type: 'doc', id: 'live', label: 'Live', href: '/docs/live'} as unknown as PropSidebarItem,
    {
      type: 'doc',
      id: 'legacy',
      label: 'Legacy',
      href: '/docs/legacy-monolith',
      customProps: {channel: 'retire-in-next'},
    } as unknown as PropSidebarItem,
  ];

  it('matches RETIRE-IN-NEXT paths for the docs shell gate on NEXT deployments', () => {
    expect(sidebarPathIsRetiredChannel(items, '/docs/legacy-monolith')).toBe(true);
    expect(sidebarPathIsRetiredChannel(items, '/docs/legacy-monolith/')).toBe(true);
    expect(sidebarPathIsRetiredChannel(items, '/docs/live')).toBe(false);
  });

  it('is independent of the NEXT predicate', () => {
    const nextOnly: PropSidebarItem[] = [
      {type: 'doc', id: 'preview', label: 'Preview', href: '/docs/preview', customProps: {channel: 'next'}} as unknown as PropSidebarItem,
    ];
    expect(sidebarPathIsRetiredChannel(nextOnly, '/docs/preview')).toBe(false);
    expect(sidebarPathIsNextChannel(items, '/docs/legacy-monolith')).toBe(false);
  });
});

describe('filterRetiredChannelSidebarItems at nesting depth', () => {
  // Regression guard for the PR #681 bug class, mirrored onto the retired
  // predicate: a leaf removed at depth >= 2 must not survive because every
  // ancestor keeps its direct child count.
  it('removes RETIRE-IN-NEXT leaves nested below categories whose own child count is unchanged', () => {
    const category = (label: string, items: PropSidebarItem[]): PropSidebarItem =>
      ({type: 'category', label, items}) as unknown as PropSidebarItem;

    const items: PropSidebarItem[] = [
      category('Management', [
        category('Identity Management', [
          category('Legacy Monolith Section', [
            docItem('legacy/keep'),
            docItem('legacy/old-split-target', {customProps: {channel: 'retire-in-next'}}),
            docItem('legacy/other'),
          ]),
        ]),
      ]),
    ];

    expect(filterRetiredChannelSidebarItems(items)).toEqual([
      category('Management', [
        category('Identity Management', [
          category('Legacy Monolith Section', [docItem('legacy/keep'), docItem('legacy/other')]),
        ]),
      ]),
    ]);
  });

  it('drops a fully retired branch emptied at depth, up to the top', () => {
    const category = (label: string, items: PropSidebarItem[]): PropSidebarItem =>
      ({type: 'category', label, items}) as unknown as PropSidebarItem;

    const items: PropSidebarItem[] = [
      docItem('live'),
      category('Outer', [
        category('Inner', [docItem('outer/inner/only', {customProps: {channel: 'retire-in-next'}})]),
      ]),
    ];

    expect(filterRetiredChannelSidebarItems(items)).toEqual([docItem('live')]);
  });

  it('keeps untouched subtrees reference-identical for React', () => {
    const untouched: PropSidebarItem = {
      type: 'category',
      label: 'Untouched',
      items: [docItem('untouched/a'), docItem('untouched/b')],
    } as unknown as PropSidebarItem;
    const items: PropSidebarItem[] = [
      untouched,
      {
        type: 'category',
        label: 'Touched',
        items: [docItem('touched/a'), docItem('touched/retired', {customProps: {channel: 'retire-in-next'}})],
      } as unknown as PropSidebarItem,
    ];

    const filtered = filterRetiredChannelSidebarItems(items);
    expect(filtered[0]).toBe(untouched);
    expect(filtered[1]).not.toBe(items[1]);
  });
});
