import {mkdtempSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it, vi} from 'vitest';

import type {CliDependencies} from '../cli.ts';
import {ownedTreeCommit} from '../publication/atomicReplace.ts';
import {
  executePublicationGroup,
  parsePublishGroupArgs,
  serializeSourcePublicationManifest,
  writePublicationGroupDiagnostics,
} from './run.ts';

function temporaryRoot(): string {
  return mkdtempSync(path.join(tmpdir(), 'docs-tooling-group-'));
}

function write(root: string, relative: string, contents = 'x\n'): void {
  const target = path.join(root, relative);
  mkdirSync(path.dirname(target), {recursive: true});
  writeFileSync(target, contents);
}

function unsafeManifest(files: readonly string[]): string {
  return `${JSON.stringify({schemaVersion: 1, site: 'zh-CN', group: 'guides', files}, null, 2)}\n`;
}

describe('publish-group argument parsing', () => {
  it('requires a site, group, and closed stage', () => {
    expect(parsePublishGroupArgs(['publish-group', '--site', 'en', '--group', 'guides', '--stage', 'fetch'])).toEqual({
      site: 'en', group: 'guides', stage: 'fetch',
    });
    expect(() => parsePublishGroupArgs(['publish-group', '--group', 'guides', '--stage', 'fetch'])).toThrow(/--site/);
    expect(() => parsePublishGroupArgs(['publish-group', '--site', 'en', '--group', 'guides', '--stage', 'build'])).toThrow(/fetch.*validate.*publish/i);
  });
});

describe('typed publication group execution', () => {
  it('dispatches manual stages in-process using registry-derived canonical stages', async () => {
    const executeManual = vi.fn(async (_argv: readonly string[], _dependencies: CliDependencies) => undefined);
    await executePublicationGroup(
      {site: 'en', group: 'guides', stage: 'fetch'},
      {repositoryRoot: temporaryRoot(), environment: {BASE: 'yes'}, executeManual},
    );

    expect(executeManual).toHaveBeenCalledTimes(2);
    expect(executeManual.mock.calls[0][0]).toEqual([
      'fetch', '--manual', 'guides', '--site', 'en', '--stage', 'tmp/docs-tooling/en/guides',
    ]);
    expect(executeManual.mock.calls[1][0]).toEqual([
      'fetch', '--manual', 'guides-byoc', '--site', 'en', '--stage', 'tmp/docs-tooling/en/guides-byoc',
    ]);
    expect(executeManual.mock.calls[0][1].environment).toEqual({BASE: 'yes'});
    expect(executeManual.mock.calls[1][1].environment).toEqual({BASE: 'yes', DOCS_TOOLING_REUSE_LARK_SOURCE: '1'});
  });

  it('keeps the shared Guides source fetch as a single manual operation', async () => {
    const executeManual = vi.fn(async (_argv: readonly string[], _dependencies: CliDependencies) => undefined);
    await executePublicationGroup(
      {site: 'en', group: 'guides', stage: 'fetch'},
      {repositoryRoot: temporaryRoot(), environment: {DOCS_TOOLING_GUIDES_STAGE: 'source'}, executeManual},
    );
    expect(executeManual).toHaveBeenCalledOnce();
    expect(executeManual.mock.calls[0][0]).toContain('guides');
    expect(executeManual.mock.calls[0][0]).not.toContain('guides-byoc');
  });

  it('derives source snapshots without exposing legacy generator path maps', async () => {
    const executeManual = vi.fn(async (_argv: readonly string[], _dependencies: CliDependencies) => undefined);
    const result = await executePublicationGroup(
      {site: 'en', group: 'python', stage: 'validate'},
      {repositoryRoot: temporaryRoot(), executeManual},
    );
    expect(result.sourceSnapshots).toEqual(['packages/docs-tooling/src/lark/meta/snapshots/pymilvus30-uat-last-success.json']);
  });

  it('seeds canonical Guides stages from the immutable live baseline without publishing', async () => {
    const root = temporaryRoot();
    write(root, 'content/en/guides/tutorials/home.md', '# Home\n');
    write(root, 'content/en/guides/tutorials/a.md', '# A\n');
    write(root, 'content/en/byoc/tutorials/b.md', '# B\n');
    write(root, 'generated/en/sidebars/guides.sidebar.js', 'module.exports = []\n');
    write(root, 'generated/en/sidebars/guides-byoc.sidebar.js', 'module.exports = []\n');

    await executePublicationGroup(
      {site: 'en', group: 'guides', stage: 'fetch'},
      {repositoryRoot: root, environment: {DOCS_TOOLING_GUIDES_STAGE: 'baseline'}},
    );

    expect(readFileSync(path.join(root, 'tmp/docs-tooling/en/guides/content/en/guides/tutorials/a.md'), 'utf8')).toBe('# A\n');
    expect(readFileSync(path.join(root, 'tmp/docs-tooling/en/guides-byoc/content/en/byoc/tutorials/b.md'), 'utf8')).toBe('# B\n');
    expect(readFileSync(path.join(root, 'content/en/guides/tutorials/a.md'), 'utf8')).toBe('# A\n');
  });

  it('prepares drifted English Guides publication targets from the immutable baseline before seeding', async () => {
    const root = temporaryRoot();
    const baselineRoot = temporaryRoot();
    write(root, 'content/en/guides/tutorials/home.md', '# Current home\n');
    write(root, 'content/en/guides/tutorials/current.md', '# Current\n');
    write(root, 'content/en/byoc/tutorials/current.md', '# Current BYOC\n');
    write(root, 'generated/en/sidebars/guides.sidebar.js', 'module.exports = ["current"]\n');
    write(root, 'generated/en/sidebars/guides-byoc.sidebar.js', 'module.exports = ["current"]\n');
    write(baselineRoot, 'content/en/guides/tutorials/home.md', '# Baseline home\n');
    write(baselineRoot, 'content/en/guides/tutorials/baseline.md', '# Baseline\n');
    write(baselineRoot, 'content/en/byoc/tutorials/baseline.md', '# Baseline BYOC\n');
    write(baselineRoot, 'generated/en/sidebars/guides.sidebar.js', 'module.exports = ["baseline"]\n');
    write(baselineRoot, 'generated/en/sidebars/guides-byoc.sidebar.js', 'module.exports = ["baseline"]\n');

    await executePublicationGroup(
      {site: 'en', group: 'guides', stage: 'fetch'},
      {
        repositoryRoot: root,
        environment: {
          DOCS_TOOLING_GUIDES_STAGE: 'baseline',
          DOCS_TOOLING_BASELINE_ROOT: baselineRoot,
        },
      },
    );

    expect(readFileSync(path.join(root, 'content/en/guides/tutorials/baseline.md'), 'utf8')).toBe('# Baseline\n');
    expect(() => readFileSync(path.join(root, 'content/en/guides/tutorials/current.md'), 'utf8')).toThrow();
    expect(readFileSync(path.join(root, 'content/en/guides/tutorials/home.md'), 'utf8')).toBe('# Baseline home\n');
    expect(readFileSync(path.join(root, 'tmp/docs-tooling/en/guides/content/en/guides/tutorials/baseline.md'), 'utf8')).toBe('# Baseline\n');
  });
});

describe('Chinese Guides source publication', () => {
  it('prepares a drifted live baseline from manifest-owned files without touching protected Tools content', async () => {
    const root = temporaryRoot();
    const baselineRoot = temporaryRoot();
    const currentFiles = [
      'content/zh-CN/guides/tutorials/home.md',
      'content/zh-CN/guides/tutorials/current.md',
      'content/zh-CN/byoc/current.md',
      'generated/zh-CN/sidebars/guides.sidebar.js',
      'generated/zh-CN/sidebars/guides-byoc.sidebar.js',
    ];
    const baselineFiles = [
      'content/zh-CN/guides/tutorials/home.md',
      'content/zh-CN/guides/tutorials/baseline.md',
      'content/zh-CN/byoc/baseline.md',
      'generated/zh-CN/sidebars/guides.sidebar.js',
      'generated/zh-CN/sidebars/guides-byoc.sidebar.js',
    ];
    for (const file of currentFiles) write(root, file, `current ${file}\n`);
    for (const file of baselineFiles) write(baselineRoot, file, `baseline ${file}\n`);
    write(root, 'content/zh-CN/guides/tutorials/tools/keep.md', 'agent-owned live content\n');
    write(baselineRoot, 'content/zh-CN/guides/tutorials/tools/keep.md', 'stale protected baseline content\n');
    write(root, 'generated/zh-CN/manifests/guides-source-publication.json', serializeSourcePublicationManifest(currentFiles));
    write(baselineRoot, 'generated/zh-CN/manifests/guides-source-publication.json', serializeSourcePublicationManifest(baselineFiles));

    await executePublicationGroup(
      {site: 'zh-CN', group: 'guides', stage: 'fetch'},
      {
        repositoryRoot: root,
        environment: {
          DOCS_TOOLING_GUIDES_STAGE: 'baseline',
          DOCS_TOOLING_BASELINE_ROOT: baselineRoot,
        },
      },
    );

    expect(readFileSync(path.join(root, 'content/zh-CN/guides/tutorials/baseline.md'), 'utf8')).toContain('baseline');
    expect(() => readFileSync(path.join(root, 'content/zh-CN/guides/tutorials/current.md'), 'utf8')).toThrow();
    expect(readFileSync(path.join(root, 'content/zh-CN/guides/tutorials/tools/keep.md'), 'utf8')).toBe('agent-owned live content\n');
    expect(readFileSync(path.join(root, 'tmp/docs-tooling/zh-CN/guides/content/zh-CN/guides/tutorials/baseline.md'), 'utf8')).toContain('baseline');
  });

  it('publishes only manifest-owned files and preserves the Agent-owned Tools subtree', async () => {
    const root = temporaryRoot();
    const groupStage = 'tmp/docs-tooling/zh-CN/groups/guides';
    write(root, 'content/zh-CN/guides/tutorials/old.md', 'old\n');
    write(root, 'content/zh-CN/guides/tutorials/tools/keep.md', 'agent\n');
    write(root, 'content/zh-CN/byoc/old.md', 'old\n');
    write(root, 'generated/zh-CN/sidebars/guides.sidebar.js', 'old sidebar\n');
    write(root, 'generated/zh-CN/sidebars/guides-byoc.sidebar.js', 'old byoc sidebar\n');
    write(root, 'generated/zh-CN/manifests/tools-translations.json', '{}\n');
    write(root, 'generated/zh-CN/manifests/guides-source-publication.json', serializeSourcePublicationManifest([
      'content/zh-CN/guides/tutorials/old.md',
      'content/zh-CN/byoc/old.md',
      'generated/zh-CN/sidebars/guides.sidebar.js',
      'generated/zh-CN/sidebars/guides-byoc.sidebar.js',
    ]));
    write(root, 'tmp/docs-tooling/zh-CN/guides/content/zh-CN/guides/tutorials/new.md', 'new\n');
    write(root, 'tmp/docs-tooling/zh-CN/guides/generated/zh-CN/sidebars/guides.sidebar.js', 'new sidebar\n');
    write(root, 'tmp/docs-tooling/zh-CN/guides-byoc/content/zh-CN/byoc/new.md', 'new\n');
    write(root, 'tmp/docs-tooling/zh-CN/guides-byoc/generated/zh-CN/sidebars/guides-byoc.sidebar.js', 'new byoc sidebar\n');
    const nextFiles = [
      'content/zh-CN/guides/tutorials/new.md',
      'content/zh-CN/byoc/new.md',
      'generated/zh-CN/sidebars/guides.sidebar.js',
      'generated/zh-CN/sidebars/guides-byoc.sidebar.js',
    ];
    write(root, `${groupStage}/generated/zh-CN/manifests/guides-source-publication.json`, serializeSourcePublicationManifest(nextFiles));
    writePublicationGroupDiagnostics(root, 'zh-CN', 'guides');

    await executePublicationGroup(
      {site: 'zh-CN', group: 'guides', stage: 'publish'},
      {repositoryRoot: root, executeManual: vi.fn()},
    );

    expect(readFileSync(path.join(root, 'content/zh-CN/guides/tutorials/new.md'), 'utf8')).toBe('new\n');
    expect(readFileSync(path.join(root, 'content/zh-CN/guides/tutorials/tools/keep.md'), 'utf8')).toBe('agent\n');
    expect(readFileSync(path.join(root, 'generated/zh-CN/manifests/tools-translations.json'), 'utf8')).toBe('{}\n');
    expect(() => readFileSync(path.join(root, 'content/zh-CN/guides/tutorials/old.md'), 'utf8')).toThrow();
    expect(ownedTreeCommit(root, nextFiles)).toMatch(/^sha256:/);
  });

  it.each([
    'content/zh-CN/guides/tutorials/tools/new.md',
    'generated/zh-CN/sidebars/tools.sidebar.js',
    'generated/zh-CN/manifests/tools-translations.json',
  ])('rejects a staged write under protected Tools ownership: %s', async protectedPath => {
    const root = temporaryRoot();
    write(root, 'generated/zh-CN/manifests/guides-source-publication.json', serializeSourcePublicationManifest([]));
    write(root, `tmp/docs-tooling/zh-CN/groups/guides/generated/zh-CN/manifests/guides-source-publication.json`, unsafeManifest([protectedPath]));
    writePublicationGroupDiagnostics(root, 'zh-CN', 'guides');
    await expect(executePublicationGroup(
      {site: 'zh-CN', group: 'guides', stage: 'publish'},
      {repositoryRoot: root, executeManual: vi.fn()},
    )).rejects.toThrow(/protected.*Tools|Tools.*protected/i);
  });

  it('rejects an omit-delete claim inherited from a poisoned source manifest', async () => {
    const root = temporaryRoot();
    write(root, 'content/zh-CN/guides/tutorials/tools/keep.md', 'agent\n');
    write(root, 'generated/zh-CN/manifests/guides-source-publication.json', unsafeManifest([
      'content/zh-CN/guides/tutorials/tools/keep.md',
    ]));
    write(root, 'tmp/docs-tooling/zh-CN/groups/guides/generated/zh-CN/manifests/guides-source-publication.json', serializeSourcePublicationManifest([]));
    writePublicationGroupDiagnostics(root, 'zh-CN', 'guides');
    await expect(executePublicationGroup(
      {site: 'zh-CN', group: 'guides', stage: 'publish'},
      {repositoryRoot: root, executeManual: vi.fn()},
    )).rejects.toThrow(/protected.*Tools|Tools.*protected/i);
    expect(readFileSync(path.join(root, 'content/zh-CN/guides/tutorials/tools/keep.md'), 'utf8')).toBe('agent\n');
  });
});
