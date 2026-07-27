import {spawnSync} from 'node:child_process';
import {mkdtempSync, mkdirSync, readFileSync, symlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it} from 'vitest';

import {resolveManualPublication} from './manuals/registry.ts';
import {ownedTreeCommit} from './publication/atomicReplace.ts';
import {createPublicationDiagnostics, publicationOwnedTargets, writePublicationAnchor, writePublicationDiagnostics} from './publication/diagnostics.ts';

const cliMain = path.resolve(import.meta.dirname, 'cli-main.ts');

function temporaryRoot(): string {
  return mkdtempSync(path.join(tmpdir(), 'docs-tooling-cli-main-'));
}

function prepareChineseStage(repositoryRoot: string): void {
  const stage = 'tmp/docs-tooling/zh-CN/python';
  const resolved = resolveManualPublication('python', 'zh-CN');
  const output = path.join(repositoryRoot, stage, resolved.publication.outputDir);
  const sidebar = path.join(repositoryRoot, stage, resolved.publication.sidebarPath);
  mkdirSync(output, {recursive: true});
  writeFileSync(path.join(output, 'page.md'), '# staged\n');
  mkdirSync(path.dirname(sidebar), {recursive: true});
  writeFileSync(sidebar, 'module.exports = []\n');
  const identity = {site: 'zh-CN' as const, manual: 'python', stage, publication: resolved.publication, sourceChain: resolved.sourceChain};
  const diagnostics = createPublicationDiagnostics(identity, ownedTreeCommit(repositoryRoot, publicationOwnedTargets('zh-CN', resolved.publication)));
  writePublicationDiagnostics(repositoryRoot, path.join(repositoryRoot, stage), diagnostics);
  writePublicationAnchor(repositoryRoot, identity, diagnostics);
}

function run(repositoryRoot: string, provider?: string) {
  return spawnSync(process.execPath, [
    '--experimental-strip-types', cliMain,
    'validate', '--manual', 'python', '--site', 'zh-CN', '--stage', 'tmp/docs-tooling/zh-CN/python',
  ], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      DOCS_TOOLING_ALIYUN_VALIDATOR_PROVIDER: provider ?? '',
    },
  });
}

describe('docs-tooling executable composition root', () => {
  it('routes publish-group through the typed site-aware registry', () => {
    const repositoryRoot = temporaryRoot();
    const result = spawnSync(process.execPath, [
      '--experimental-strip-types', cliMain,
      'publish-group', '--site', 'zh-CN', '--group', 'tools', '--stage', 'fetch',
    ], {cwd: repositoryRoot, encoding: 'utf8', env: process.env});

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/Agent-produced Chinese Tools/i);
    expect(result.stderr).not.toMatch(/Unknown command/i);
  });

  it('loads the configured repository-local validator provider for Chinese validation', () => {
    const repositoryRoot = temporaryRoot();
    prepareChineseStage(repositoryRoot);
    mkdirSync(path.join(repositoryRoot, 'providers'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'providers/validator.mjs'), [
      'export function createAliyunOssValidator() {',
      '  return { async validatePublication(root, context) {',
      "    if (!root.endsWith('tmp/docs-tooling/zh-CN/python') || context.publicationRoot !== root) throw new Error('provider received an invalid publication root');",
      '  }};',
      '}',
      '',
    ].join('\n'));

    const result = run(repositoryRoot, 'providers/validator.mjs');

    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(readFileSync(path.join(repositoryRoot, 'tmp/docs-tooling/zh-CN/python/content/zh-CN/reference/api/python/python/page.md'), 'utf8')).toBe('# staged\n');
  });

  it.each([
    ['missing', undefined, /explicit Aliyun OSS validator injection/i],
    ['unsafe', '../validator.mjs', /unsafe|repository-relative/i],
    ['malformed', 'providers/malformed.mjs', /createAliyunOssValidator|factory/i],
  ])('fails closed for a %s production validator provider', (kind, provider, expected) => {
    const repositoryRoot = temporaryRoot();
    prepareChineseStage(repositoryRoot);
    if (kind === 'malformed') {
      mkdirSync(path.join(repositoryRoot, 'providers'), {recursive: true});
      writeFileSync(path.join(repositoryRoot, 'providers/malformed.mjs'), 'export const createAliyunOssValidator = 1;\n');
    }

    const result = run(repositoryRoot, provider);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(expected);
  });

  it('rejects a symlinked validator provider', () => {
    const repositoryRoot = temporaryRoot();
    prepareChineseStage(repositoryRoot);
    const outside = path.join(repositoryRoot, 'outside.mjs');
    writeFileSync(outside, 'export function createAliyunOssValidator() { return {validatePublication: async () => {}}; }\n');
    mkdirSync(path.join(repositoryRoot, 'providers'), {recursive: true});
    symlinkSync(outside, path.join(repositoryRoot, 'providers/validator.mjs'));

    const result = run(repositoryRoot, 'providers/validator.mjs');

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/symlink|regular file/i);
  });
});
