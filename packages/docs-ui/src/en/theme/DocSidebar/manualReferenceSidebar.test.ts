import {describe, expect, it, beforeEach} from 'vitest';
import {parseDocsRoute} from '../../../shared/navigation/docsRoute';
import {
  clearManualReferenceOrigin,
  getDefaultManualReferenceOrigin,
  getManualReferenceTarget,
  getReferenceNavigationHref,
  readManualReferenceOrigin,
  shouldClearManualReferenceOrigin,
  writeManualReferenceOrigin,
  type ManualReferenceOrigin,
} from './manualReferenceSidebar';

describe('manual reference sidebar helpers', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('detects supported reference sidebar targets', () => {
    expect(getManualReferenceTarget(parseDocsRoute('/reference/python', 'en'), 'en')).toMatchObject({
      kind: 'python',
      landingHref: '/reference/python',
    });
    expect(getManualReferenceTarget(parseDocsRoute('/reference/python/data-import', 'en'), 'en')).toMatchObject({
      kind: 'python',
      landingHref: '/reference/python',
    });
    expect(getManualReferenceTarget(parseDocsRoute('/reference/restful/list-collections-v2', 'en'), 'en')).toMatchObject({
      kind: 'restful',
      landingHref: '/reference/restful',
    });
    expect(getManualReferenceTarget(parseDocsRoute('/reference/cli/cli/overview', 'en'), 'en')).toMatchObject({
      kind: 'cli',
      landingHref: '/reference/cli',
    });
    expect(getManualReferenceTarget(parseDocsRoute('/reference/node/classes/MilvusClient', 'en'), 'en')).toMatchObject({
      kind: 'nodejs',
      landingHref: '/reference/nodejs',
    });
    expect(getManualReferenceTarget(parseDocsRoute('/ja-JP/reference/python', 'ja-JP'), 'en')).toMatchObject({
      kind: 'python',
      landingHref: '/reference/python',
    });
  });

  it('ignores unsupported reference paths without a sidebar', () => {
    expect(getManualReferenceTarget(parseDocsRoute('/reference/cpp', 'en'), 'en')).toBeUndefined();
    expect(getManualReferenceTarget(parseDocsRoute('/reference', 'en'), 'en')).toBeUndefined();
    expect(getManualReferenceTarget(parseDocsRoute('/docs/tutorials/client-libraries/install-sdks', 'en'), 'en')).toBeUndefined();
  });

  it('normalizes known reference entry links to routable docs pages', () => {
    const enRoute = parseDocsRoute('/reference/cli/overview', 'en');
    expect(getReferenceNavigationHref('/reference/cli/overview', enRoute, 'en')).toBe('/reference/cli/cli/overview');
    expect(getReferenceNavigationHref('/reference/cli/cli/overview', enRoute, 'en')).toBe('/reference/cli/cli/overview');
    expect(getReferenceNavigationHref('/reference/python', enRoute, 'en')).toBe('/reference/python');
  });

  it('localizes reference entry redirects after resolving them', () => {
    const route = parseDocsRoute('/ja-JP/reference/cli/overview', 'ja-JP');
    expect(getReferenceNavigationHref('/reference/cli/overview', route, 'en')).toBe('/ja-JP/reference/cli/cli/overview');
  });

  it('provides Cloud Guides defaults for direct reference entry', () => {
    const route = parseDocsRoute('/reference/python', 'en');
    expect(getDefaultManualReferenceOrigin('python', route, 'en')).toMatchObject({
      backHref: '/docs/install-sdks',
      backLabel: 'Client Libraries',
      selectedLabel: 'Client Libraries',
    });
    expect(getDefaultManualReferenceOrigin('restful', route, 'en')).toMatchObject({
      backHref: '/docs/install-sdks',
      backLabel: 'Client Libraries',
      selectedLabel: 'Client Libraries',
    });
    expect(getDefaultManualReferenceOrigin('cli', route, 'en')).toMatchObject({
      backHref: '/docs/agents-and-prompts',
      backLabel: 'Tools',
      selectedLabel: 'Tools',
    });
  });

  it('localizes the default origin for Japanese routes', () => {
    const route = parseDocsRoute('/ja-JP/reference/python', 'ja-JP');
    expect(getDefaultManualReferenceOrigin('python', route, 'en')).toMatchObject({
      backHref: '/ja-JP/docs/install-sdks',
      backLabel: 'Client Libraries',
      selectedLabel: 'Client Libraries',
    });
  });

  it('uses Chinese navigation labels and paths for the Chinese site', () => {
    const route = parseDocsRoute('/reference/python', 'zh-CN');
    const origin = getDefaultManualReferenceOrigin('python', route, 'zh-CN');

    expect(origin).toMatchObject({
      backHref: '/docs/install-sdks',
      backLabel: '客户端参考',
      selectedLabel: '客户端参考',
    });
    expect(origin.sidebar).toEqual(expect.arrayContaining([
      expect.objectContaining({label: '客户端参考', href: '/docs/install-sdks'}),
      expect.objectContaining({label: '工具', href: '/docs/agents-and-prompts'}),
    ]));
  });

  it('persists and reads the manual origin for reference routes', () => {
    const origin: ManualReferenceOrigin = {
      backHref: '/docs/tutorials/client-libraries/install-sdks',
      backLabel: 'Client Libraries',
      selectedLabel: 'Client Libraries',
      sidebar: [
        {type: 'category', label: 'Get Started', items: [], collapsed: false, collapsible: true},
        {type: 'category', label: 'Client Libraries', items: [], collapsed: false, collapsible: true},
      ],
    };

    writeManualReferenceOrigin(origin);

    expect(readManualReferenceOrigin()).toEqual(origin);
  });

  it('drops malformed persisted origins', () => {
    window.sessionStorage.setItem('zdoc.manualReferenceSidebarOrigin', JSON.stringify({
      backHref: '/docs/tutorials/client-libraries/install-sdks',
      selectedLabel: 'Client Libraries',
      sidebar: 'not an array',
    }));

    expect(readManualReferenceOrigin()).toBeUndefined();
  });

  it('clears origin outside reference routes and the stored back route', () => {
    const origin: ManualReferenceOrigin = {
      backHref: '/docs/tutorials/client-libraries/install-sdks',
      backLabel: 'Client Libraries',
      selectedLabel: 'Client Libraries',
      sidebar: [{type: 'category', label: 'Client Libraries', items: [], collapsed: false, collapsible: true}],
    };

    expect(shouldClearManualReferenceOrigin(parseDocsRoute('/reference/python/', 'en'), origin)).toBe(false);
    expect(shouldClearManualReferenceOrigin(parseDocsRoute('/docs/tutorials/client-libraries/install-sdks/', 'en'), origin)).toBe(false);
    expect(shouldClearManualReferenceOrigin(parseDocsRoute('/docs/tutorials/development/search', 'en'), origin)).toBe(true);
  });

  it('compares localized origins against the normalized route', () => {
    const origin: ManualReferenceOrigin = {
      backHref: '/ja-JP/docs/install-sdks',
      backLabel: 'Client Libraries',
      selectedLabel: 'Client Libraries',
      sidebar: [{type: 'category', label: 'Client Libraries', items: [], collapsed: false, collapsible: true}],
    };

    expect(shouldClearManualReferenceOrigin(parseDocsRoute('/ja-JP/reference/python', 'ja-JP'), origin)).toBe(false);
    expect(shouldClearManualReferenceOrigin(parseDocsRoute('/ja-JP/docs/install-sdks/', 'ja-JP'), origin)).toBe(false);
    expect(shouldClearManualReferenceOrigin(parseDocsRoute('/ja-JP/docs/single-vector-search', 'ja-JP'), origin)).toBe(true);
  });

  it('removes the persisted origin', () => {
    writeManualReferenceOrigin({
      backHref: '/docs/tutorials/client-libraries/install-sdks',
      backLabel: 'Client Libraries',
      selectedLabel: 'Client Libraries',
      sidebar: [{type: 'category', label: 'Client Libraries', items: [], collapsed: false, collapsible: true}],
    });

    clearManualReferenceOrigin();

    expect(readManualReferenceOrigin()).toBeUndefined();
  });
});
