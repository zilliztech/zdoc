import {describe, expect, it} from 'vitest';

import {listPublicationGroups, resolvePublicationGroup, resolvePublicationGroupWorkflow} from './groups.ts';

describe('site-owned publication groups', () => {
  it('defines the exact English Guides ownership contract', () => {
    expect(resolvePublicationGroup('en', 'guides')).toEqual({
      site: 'en',
      manuals: ['guides', 'guides-byoc'],
      ownedPaths: [
        'content/en/guides',
        'content/en/byoc',
        'generated/en/sidebars/guides.sidebar.js',
        'generated/en/sidebars/guides-byoc.sidebar.js',
      ],
    });
  });

  it('defines the exact Chinese Guides manifest-owned contract', () => {
    expect(resolvePublicationGroup('zh-CN', 'guides')).toEqual({
      site: 'zh-CN',
      manuals: ['guides', 'guides-byoc'],
      ownedPaths: [
        'content/zh-CN/guides',
        'content/zh-CN/byoc',
        'generated/zh-CN/sidebars/guides.sidebar.js',
        'generated/zh-CN/sidebars/guides-byoc.sidebar.js',
        'generated/zh-CN/sidebars/tools.sidebar.js',
      ],
      publicationManifest: 'generated/zh-CN/manifests/guides-source-publication.json',
    });
    expect(resolvePublicationGroupWorkflow('zh-CN', 'guides').checkpointPaths).toContain(
      'content/zh-CN/guides',
    );
  });

  it('keeps shared Guides diagnostics English-owned', () => {
    const english = resolvePublicationGroupWorkflow('en', 'guides').checkpointPaths;
    const chinese = resolvePublicationGroupWorkflow('zh-CN', 'guides').checkpointPaths;
    const sharedPaths = [
      'packages/docs-tooling/src/lark/meta/assembly/guides.json',
      'packages/docs-tooling/src/lark/meta/reports/guides-canonical-link-audit.json',
    ];

    for (const sharedPath of sharedPaths) {
      expect(english).toContain(sharedPath);
      expect(chinese).not.toContain(sharedPath);
    }
    expect(chinese).not.toContainEqual(
      expect.stringMatching(/^packages\/docs-tooling\/src\/lark\/meta\/reports\/guides-/),
    );
  });

  it('exposes Chinese On-premise and English Reference producers only', () => {
    expect(resolvePublicationGroup('zh-CN', 'onpremise')).toEqual({
      site: 'zh-CN',
      manuals: ['onpremise'],
      ownedPaths: [
        'content/zh-CN/onpremise',
        'generated/zh-CN/sidebars/onpremise.sidebar.js',
      ],
    });
    expect(resolvePublicationGroup('en', 'python')).toEqual({
      site: 'en',
      manuals: ['python'],
      ownedPaths: [
        'content/en/reference/api/python/python',
        'generated/en/sidebars/python.sidebar.js',
      ],
    });
    expect(listPublicationGroups('en')).toEqual(['guides', 'python', 'java', 'node', 'go', 'cli', 'rest']);
    expect(listPublicationGroups('zh-CN')).toEqual(['guides', 'onpremise']);
  });

  it('rejects Agent-produced Chinese Reference and Tools groups', () => {
    for (const group of ['python', 'java', 'node', 'go', 'cli', 'rest', 'reference']) {
      expect(() => resolvePublicationGroup('zh-CN', group)).toThrow(/Agent-produced Chinese Reference/i);
    }
    expect(() => resolvePublicationGroup('zh-CN', 'tools')).toThrow(/Agent-produced Chinese Tools/i);
  });

  it('returns deeply immutable registry values', () => {
    const group = resolvePublicationGroup('zh-CN', 'guides');
    expect(Object.isFrozen(group)).toBe(true);
    expect(Object.isFrozen(group.manuals)).toBe(true);
    expect(Object.isFrozen(group.ownedPaths)).toBe(true);
    expect(() => (group.manuals as string[]).push('other')).toThrow(TypeError);
  });

  it('checkpoints each English publication group revision inventory', () => {
    for (const group of ['guides', 'python', 'java', 'node', 'go', 'cli', 'rest']) {
      const revisionInventory = `generated/en/manifests/lark-revisions/${group}.json`;
      const checkpointPaths = resolvePublicationGroupWorkflow('en', group).checkpointPaths;
      expect(checkpointPaths.filter(path => path.startsWith('generated/en/manifests/lark-revisions/'))).toEqual([
        revisionInventory,
      ]);
    }
  });

  it('preserves hand-authored Reference landing pages inside generated output directories', () => {
    expect(resolvePublicationGroupWorkflow('en', 'python').preservedPaths).toEqual([
      'content/en/reference/api/python/python/python.md',
    ]);
    expect(resolvePublicationGroupWorkflow('en', 'node').preservedPaths).toEqual([
      'content/en/reference/api/nodejs/nodejs/nodejs.md',
    ]);
    expect(resolvePublicationGroupWorkflow('en', 'cli').preservedPaths).toEqual([
      'content/en/reference/cli/cli/Overview.md',
    ]);
    expect(resolvePublicationGroupWorkflow('en', 'rest').preservedPaths).toEqual([
      'content/en/reference/api/restful/restful/restful.md',
      'content/en/reference/api/restful/restful/versioning.md',
      'content/en/reference/api/restful/restful/v1/error-codes.md',
      'content/en/reference/api/restful/restful/v2/error-codes-v2.md',
    ]);
  });

  it('includes every preserved English path in its source checkpoint', () => {
    for (const group of listPublicationGroups('en')) {
      const workflow = resolvePublicationGroupWorkflow('en', group);
      for (const preservedPath of workflow.preservedPaths) {
        expect(workflow.checkpointPaths).toContain(preservedPath);
      }
    }
  });

  it('does not checkpoint English revision inventories for Chinese publication groups', () => {
    for (const group of ['guides', 'onpremise']) {
      expect(resolvePublicationGroupWorkflow('zh-CN', group).checkpointPaths).not.toContainEqual(
        expect.stringMatching(/^generated\/en\/manifests\/lark-revisions\//),
      );
    }
  });
});
