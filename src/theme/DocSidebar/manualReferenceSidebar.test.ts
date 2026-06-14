import {describe, expect, it, beforeEach} from 'vitest';
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
    expect(getManualReferenceTarget('/reference/python')).toEqual({
      kind: 'python',
      hrefPrefix: '/reference/python',
    });
    expect(getManualReferenceTarget('/reference/python/data-import')).toEqual({
      kind: 'python',
      hrefPrefix: '/reference/python',
    });
    expect(getManualReferenceTarget('/reference/restful/list-collections-v2')).toEqual({
      kind: 'restful',
      hrefPrefix: '/reference/restful',
    });
    expect(getManualReferenceTarget('/reference/cli/cli/overview')).toEqual({
      kind: 'cli',
      hrefPrefix: '/reference/cli',
    });
  });

  it('ignores unsupported reference paths without a sidebar', () => {
    expect(getManualReferenceTarget('/reference/cpp')).toBeUndefined();
    expect(getManualReferenceTarget('/reference')).toBeUndefined();
    expect(getManualReferenceTarget('/docs/tutorials/client-libraries/install-sdks')).toBeUndefined();
  });

  it('normalizes known reference entry links to routable docs pages', () => {
    expect(getReferenceNavigationHref('/reference/cli/overview')).toBe('/reference/cli/cli/overview');
    expect(getReferenceNavigationHref('/reference/cli/cli/overview')).toBe('/reference/cli/cli/overview');
    expect(getReferenceNavigationHref('/reference/python')).toBe('/reference/python');
  });

  it('provides Cloud Guides defaults for direct reference entry', () => {
    expect(getDefaultManualReferenceOrigin({kind: 'python', hrefPrefix: '/reference/python'})).toMatchObject({
      backHref: '/docs/install-sdks',
      backLabel: 'Client Libraries',
      selectedLabel: 'Client Libraries',
    });
    expect(getDefaultManualReferenceOrigin({kind: 'restful', hrefPrefix: '/reference/restful'})).toMatchObject({
      backHref: '/docs/install-sdks',
      backLabel: 'Client Libraries',
      selectedLabel: 'Client Libraries',
    });
    expect(getDefaultManualReferenceOrigin({kind: 'cli', hrefPrefix: '/reference/cli'})).toMatchObject({
      backHref: '/docs/agents-and-prompts',
      backLabel: 'Tools',
      selectedLabel: 'Tools',
    });
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

    expect(shouldClearManualReferenceOrigin('/reference/python', origin)).toBe(false);
    expect(shouldClearManualReferenceOrigin('/docs/tutorials/client-libraries/install-sdks', origin)).toBe(false);
    expect(shouldClearManualReferenceOrigin('/docs/tutorials/development/search', origin)).toBe(true);
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
