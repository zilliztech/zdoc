import {mkdtempSync, mkdirSync, symlinkSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it, vi} from 'vitest';

import {executeDocsToolingCommand, parseCliArgs} from '../cli';
import {assertPublicationOwnership, assertSafeRepositoryRelativePath} from './ownership';
import {assertPathSetIntegrity, validateStageFilesystem} from './filesystem';

function temporaryRoot(): string {
  return mkdtempSync(path.join(tmpdir(), 'docs-tooling-validation-'));
}

describe('path ownership validation', () => {
  it.each([
    '/absolute',
    '../escape',
    'safe/../../escape',
    'safe\\windows',
    'safe//empty',
    'safe/./dot',
    'safe/NUL',
  ])('rejects unsafe repository paths: %s', value => {
    expect(() => assertSafeRepositoryRelativePath(value, 'fixture')).toThrow(/unsafe|normalized|reserved/i);
  });

  it('rejects publication ownership outside the selected site', () => {
    expect(() => assertPublicationOwnership('en', {
      enabled: true,
      source: 'canonical',
      outputDir: 'content/zh-CN/reference/python',
      contentRoot: 'content/en/reference',
      sidebarPath: 'generated/en/sidebars/python.sidebar.js',
      missingContent: 'error',
    })).toThrow(/site-owned/i);
  });
});

describe('stage filesystem validation', () => {
  it('returns a stable sorted inventory for an ordinary stage', () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'nested'));
    writeFileSync(path.join(root, 'z.mdx'), '# Z\n');
    writeFileSync(path.join(root, 'nested/a.md'), '# A\n');

    expect(validateStageFilesystem(root).files.map(file => file.path)).toEqual(['nested/a.md', 'z.mdx']);
  });

  it('fails closed on symlinks and filesystem collisions', () => {
    const symlinkRoot = temporaryRoot();
    writeFileSync(path.join(symlinkRoot, 'target.md'), '# Target\n');
    symlinkSync('target.md', path.join(symlinkRoot, 'alias.md'));
    expect(() => validateStageFilesystem(symlinkRoot)).toThrow(/symlink/i);

    expect(() => assertPathSetIntegrity(['Guide.md', 'guide.md'])).toThrow(/case collision/i);
  });

  it('rejects executable drift, CRLF, reserved names, and oversized files', () => {
    const executableRoot = temporaryRoot();
    writeFileSync(path.join(executableRoot, 'page.md'), '# page\n', {mode: 0o755});
    expect(() => validateStageFilesystem(executableRoot)).toThrow(/executable/i);

    const crlfRoot = temporaryRoot();
    writeFileSync(path.join(crlfRoot, 'page.md'), '# page\r\n');
    expect(() => validateStageFilesystem(crlfRoot)).toThrow(/CRLF/i);

    const reservedRoot = temporaryRoot();
    writeFileSync(path.join(reservedRoot, 'CON.md'), '# page\n');
    expect(() => validateStageFilesystem(reservedRoot)).toThrow(/reserved/i);

    const largeRoot = temporaryRoot();
    writeFileSync(path.join(largeRoot, 'page.md'), '12345');
    expect(() => validateStageFilesystem(largeRoot, {maxFileSize: 4})).toThrow(/size/i);
  });
});

describe('docs-tooling CLI boundary', () => {
  it('parses only the closed command shape', () => {
    expect(parseCliArgs(['validate', '--manual', 'python', '--site', 'en', '--stage', 'tmp/python'])).toEqual({
      command: 'validate',
      manual: 'python',
      site: 'en',
      stage: 'tmp/python',
    });
    expect(() => parseCliArgs(['remove', '--manual', 'python', '--site', 'en', '--stage', 'tmp/python'])).toThrow(/unknown command/i);
    expect(() => parseCliArgs(['validate', '--manual', 'python', '--site', 'fr', '--stage', 'tmp/python'])).toThrow(/unknown site/i);
    expect(() => parseCliArgs(['validate', '--manual', 'python', '--site', 'en', '--stage', '../escape'])).toThrow(/unsafe|normalized/i);
    expect(() => parseCliArgs(['validate', '--manual', 'python', '--site', 'en', '--stage', 'tmp/python', '--extra'])).toThrow(/unknown argument|usage/i);
  });

  it('fails closed on unknown manuals and missing local sources', async () => {
    const repositoryRoot = temporaryRoot();
    mkdirSync(path.join(repositoryRoot, 'tmp/python'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'tmp/python/page.md'), '# page\n');

    await expect(executeDocsToolingCommand(
      ['validate', '--manual', 'unknown', '--site', 'en', '--stage', 'tmp/python'],
      {repositoryRoot},
    )).rejects.toThrow(/unknown manual/i);

    await expect(executeDocsToolingCommand(
      ['fetch', '--manual', 'python', '--site', 'zh-CN', '--stage', 'tmp/python'],
      {repositoryRoot},
    )).rejects.toThrow(/source.*missing/i);
  });

  it('dispatches remote Lark sources to the moved generator with explicit identity and stage', async () => {
    const repositoryRoot = temporaryRoot();
    const spawnSync = vi.fn((command: string, args: readonly string[], options: {cwd: string}) => {
      expect(command).toBe(process.execPath);
      expect(args[0]).toBe(path.join(repositoryRoot, 'packages/docs-tooling/src/lark/cli.js'));
      expect(args).toEqual(expect.arrayContaining([
        '--manual', 'python',
        '--site', 'en',
        '--source', 'english-v3.0',
        '--source-type', 'drive',
        '--root', 'UxyTfjS3wl0TF8dn9tZcRT39nUe',
        '--base', 'Hk05b5eI6aXXSSsd6j9cqwwMn5a',
        '--source-dir', 'packages/docs-tooling/src/lark/meta/sources/python/v3.0.x',
        '--stage', 'tmp/python',
      ]));
      expect(options.cwd).toBe(repositoryRoot);
      mkdirSync(path.join(repositoryRoot, 'tmp/python'), {recursive: true});
      writeFileSync(path.join(repositoryRoot, 'tmp/python/page.md'), '# generated\n');
      return {status: 0};
    });

    await executeDocsToolingCommand(
      ['fetch', '--manual', 'python', '--site', 'en', '--stage', 'tmp/python'],
      {repositoryRoot, spawnSync},
    );

    expect(spawnSync).toHaveBeenCalledOnce();
  });

  it('preserves the Guides source-only snapshot stage without requiring a preexisting cache', async () => {
    const repositoryRoot = temporaryRoot();
    const sourceDir = path.join(repositoryRoot, 'packages/docs-tooling/src/lark/meta/sources/guides');
    const spawnSync = vi.fn((_command: string, args: readonly string[]) => {
      expect(args).toEqual(expect.arrayContaining([
        '--manual', 'guides',
        '--source-only',
        '--snapshot-candidate', 'packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-candidate.json',
      ]));
      mkdirSync(sourceDir, {recursive: true});
      writeFileSync(path.join(sourceDir, 'source.json'), '{}\n');
      return {status: 0};
    });

    await executeDocsToolingCommand(
      ['fetch', '--manual', 'guides', '--site', 'en', '--stage', 'tmp/guides-source'],
      {
        repositoryRoot,
        spawnSync,
        environment: {DOCS_TOOLING_GUIDES_STAGE: 'source'},
      },
    );

    expect(spawnSync).toHaveBeenCalledOnce();
    expect(() => validateStageFilesystem(path.join(repositoryRoot, 'tmp/guides-source'))).not.toThrow();
  });

  it('propagates remote generator failures without falling back to a cache copy', async () => {
    const repositoryRoot = temporaryRoot();
    const spawnSync = vi.fn(() => ({status: 7}));

    await expect(executeDocsToolingCommand(
      ['fetch', '--manual', 'python', '--site', 'en', '--stage', 'tmp/python'],
      {repositoryRoot, spawnSync},
    )).rejects.toThrow(/python.*generator.*status 7/i);
    expect(spawnSync).toHaveBeenCalledOnce();
  });

  it('dispatches the English REST source to the moved REST generator', async () => {
    const repositoryRoot = temporaryRoot();
    mkdirSync(path.join(repositoryRoot, 'packages/docs-tooling/src/reference/rest/meta/openapi'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'packages/docs-tooling/src/reference/rest/meta/openapi/spec.json'), '{}\n');
    const spawnSync = vi.fn((command: string, args: readonly string[]) => {
      expect(command).toBe(process.execPath);
      expect(args).toEqual([
        path.join(repositoryRoot, 'packages/docs-tooling/src/reference/rest/index.js'),
        '--specifications', path.join(repositoryRoot, 'packages/docs-tooling/src/reference/rest/meta/openapi'),
        '--output_path', path.join(repositoryRoot, 'tmp/rest'),
        '--lang', 'en-US',
        '--target', 'zilliz',
      ]);
      mkdirSync(path.join(repositoryRoot, 'tmp/rest'), {recursive: true});
      writeFileSync(path.join(repositoryRoot, 'tmp/rest/page.md'), '# generated\n');
      return {status: 0};
    });

    await executeDocsToolingCommand(
      ['fetch', '--manual', 'rest', '--site', 'en', '--stage', 'tmp/rest'],
      {repositoryRoot, spawnSync},
    );

    expect(spawnSync).toHaveBeenCalledOnce();
  });

  it('copies committed local sources without invoking a generator', async () => {
    const repositoryRoot = temporaryRoot();
    const source = path.join(repositoryRoot, 'content/zh-CN/reference/api/python/python');
    mkdirSync(source, {recursive: true});
    writeFileSync(path.join(source, 'page.md'), '# translated\n');
    const spawnSync = vi.fn();

    await executeDocsToolingCommand(
      ['fetch', '--manual', 'python', '--site', 'zh-CN', '--stage', 'tmp/python'],
      {repositoryRoot, spawnSync},
    );

    expect(spawnSync).not.toHaveBeenCalled();
  });

  it('validates stage integrity before invoking publication', async () => {
    const repositoryRoot = temporaryRoot();
    mkdirSync(path.join(repositoryRoot, 'tmp/python'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'tmp/python/target.md'), '# Target\n');
    symlinkSync('target.md', path.join(repositoryRoot, 'tmp/python/alias.md'));
    const publish = vi.fn();

    await expect(executeDocsToolingCommand(
      ['publish', '--manual', 'python', '--site', 'en', '--stage', 'tmp/python'],
      {repositoryRoot, publish},
    )).rejects.toThrow(/symlink/i);
    expect(publish).not.toHaveBeenCalled();
  });
});

describe('moved generator module boundaries', () => {
  it('keeps the Lark and REST internals loadable as CommonJS', () => {
    const require = createRequire(import.meta.url);
    expect(() => require('../lark/index.js')).not.toThrow();
    expect(() => require('../lark/cli.js')).not.toThrow();
    expect(() => require('../reference/rest/index.js')).not.toThrow();
  });

  it('allows a full Lark source fetch to start without a preexisting cache directory', () => {
    const require = createRequire(import.meta.url);
    const {resetSourceDirectory} = require('../lark/index.js');
    const sourceDir = path.join(temporaryRoot(), 'missing/source-cache');

    expect(() => resetSourceDirectory(sourceDir)).not.toThrow();
    writeFileSync(path.join(sourceDir, 'stale.json'), '{}\n');
    expect(() => resetSourceDirectory(sourceDir)).not.toThrow();
    expect(() => validateStageFilesystem(sourceDir)).not.toThrow();
  });

  it('keeps Lark stage paths repository-relative and rejects wrapper path escapes', () => {
    const require = createRequire(import.meta.url);
    const {parseArgs, runtimeInvocation, runtimeManual} = require('../lark/cli.js');
    const values = [
      '--manual', 'python',
      '--site', 'en',
      '--source', 'english-v3.0',
      '--source-type', 'drive',
      '--root', 'root-token',
      '--base', 'base-token',
      '--source-dir', 'packages/docs-tooling/src/lark/meta/sources/python/v3.0.x',
      '--stage', 'tmp/docs-tooling/en/python',
    ];
    const manual = runtimeManual(parseArgs(values));

    expect(manual.docSourceDir).toBe('packages/docs-tooling/src/lark/meta/sources/python/v3.0.x');
    expect(manual.targets.stage.outputDir).toBe('tmp/docs-tooling/en/python');
    expect(manual.targets.stage.imageDir).toBe('tmp/docs-tooling/en/python/.assets');
    const escaped = [...values];
    escaped[escaped.indexOf('tmp/docs-tooling/en/python')] = '../escape';
    expect(() => parseArgs(escaped)).toThrow(/repository-relative|escape/i);

    const sourceOnly = parseArgs([
      '--manual', 'guides',
      '--site', 'en',
      '--source', 'english',
      '--source-type', 'wiki',
      '--root', 'root-token',
      '--base', 'base-token:*',
      '--source-dir', 'packages/docs-tooling/src/lark/meta/sources/guides',
      '--stage', 'tmp/docs-tooling/en/guides',
      '--source-only',
      '--snapshot-candidate', 'packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-candidate.json',
      '--force-full-fetch',
    ]);
    expect(runtimeInvocation(sourceOnly)).toEqual({
      manualIdentity: 'guides',
      generatorArgs: [
        'fetch-lark-docs',
        '--manual', 'guides',
        '--sourceOnly',
        '--incremental',
        '--buildEnv', 'uat',
        '--snapshotCandidatePath', 'packages/docs-tooling/src/lark/meta/reports/guides-source-snapshot-candidate.json',
        '--forceFullFetch',
      ],
    });
  });
});
