import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync} from 'node:fs';
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

function writeJson(repositoryRoot: string, relativePath: string, value: unknown): void {
  const absolutePath = path.join(repositoryRoot, relativePath);
  mkdirSync(path.dirname(absolutePath), {recursive: true});
  writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`);
}

function runCli(repositoryRoot: string, args: string[]) {
  return spawnSync(process.execPath, ['--experimental-strip-types', cliMain, ...args], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: process.env,
  });
}

function revisionInventory(group: string, records: unknown[] = []) {
  return {
    schemaVersion: 1,
    group,
    complete: true,
    generatedAt: '2026-07-28T00:00:00.000Z',
    sourceRunId: 'baseline-run',
    records,
  };
}

const revisionRecord = (canonicalToken: string, revisionId = '1') => ({
  canonicalToken,
  title: `Title ${canonicalToken}`,
  contentPath: `content/${canonicalToken}.md`,
  objectToken: `object-${canonicalToken}`,
  parentToken: 'parent',
  revisionId,
  objectEditTime: '1785254400',
});

const sourceRecord = (docToken: string, revisionId = '1', fetchError?: string) => ({
  doc_token: docToken,
  title: `Title ${docToken}`,
  output_paths: [`content/${docToken}.md`],
  node_metadata: {
    obj_token: `object-${docToken}`,
    parent_node_token: 'parent',
    revision_id: revisionId,
    obj_edit_time: '1785254400',
    ...(fetchError ? {fetch_error: fetchError} : {}),
  },
});

function revisionBuildArgs(group: string, extra: string[] = []): string[] {
  return [
    'revision-inventory', 'build', '--group', group,
    '--baseline', `generated/en/manifests/lark-revisions/${group}.json`,
    '--output', `generated/en/manifests/lark-revisions/${group}.json`,
    '--report-dir', 'tmp/revision-reports',
    '--source-run-id', 'candidate-run',
    '--generated-at', '2026-07-29T12:00:00.000Z',
    ...extra,
  ];
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
    'validate', '--manual', 'python', '--group', 'python', '--site', 'zh-CN', '--stage', 'tmp/docs-tooling/zh-CN/python',
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
  it('preflights the Chinese publication validator while leaving English provider-free', () => {
    const repositoryRoot = temporaryRoot();
    mkdirSync(path.join(repositoryRoot, 'providers'), {recursive: true});
    writeFileSync(path.join(repositoryRoot, 'providers/validator.mjs'), [
      'export function createAliyunOssValidator() {',
      "  if (!process.env.IMAGE_BED_URL) throw new Error('IMAGE_BED_URL is required');",
      '  return {validatePublication: async () => {}};',
      '}',
      '',
    ].join('\n'));

    const chinese = spawnSync(process.execPath, [
      '--experimental-strip-types', cliMain, 'validate-publication-provider', '--site', 'zh-CN',
    ], {
      cwd: repositoryRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        DOCS_TOOLING_ALIYUN_VALIDATOR_PROVIDER: 'providers/validator.mjs',
        IMAGE_BED_URL: 'https://docs-images.oss-cn-hangzhou.aliyuncs.com',
      },
    });
    expect(chinese.status, chinese.stderr || chinese.stdout).toBe(0);
    expect(chinese.stdout).toMatch(/Chinese publication validator is ready/i);

    const english = runCli(repositoryRoot, ['validate-publication-provider', '--site', 'en']);
    expect(english.status, english.stderr || english.stdout).toBe(0);
    expect(english.stdout).toMatch(/does not require/i);
  });

  it('uses only the declared Node 22.6 runtime surface for revision inventory loading', () => {
    const source = readFileSync(cliMain, 'utf8');
    expect(source).not.toMatch(/stripTypeScriptTypes/u);
  });

  it('builds an updated revision inventory and deterministic JSON and Markdown reports', () => {
    const repositoryRoot = temporaryRoot();
    writeJson(repositoryRoot, 'generated/en/manifests/lark-revisions/python.json', revisionInventory('python', [revisionRecord('a')]));
    writeJson(repositoryRoot, 'tmp/snapshots/python.json', {records: [sourceRecord('a', '2'), sourceRecord('b')]});

    const result = runCli(repositoryRoot, revisionBuildArgs('python', ['--snapshot', 'tmp/snapshots/python.json']));

    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(JSON.parse(readFileSync(path.join(repositoryRoot, 'generated/en/manifests/lark-revisions/python.json'), 'utf8'))).toMatchObject({
      group: 'python', complete: true, generatedAt: '2026-07-29T12:00:00.000Z', sourceRunId: 'candidate-run',
    });
    expect(JSON.parse(readFileSync(path.join(repositoryRoot, 'tmp/revision-reports/python.json'), 'utf8'))).toMatchObject({
      group: 'python',
      changes: [{type: 'updated', canonicalToken: 'a'}, {type: 'created', canonicalToken: 'b'}],
      editedToday: [{canonicalToken: 'a'}, {canonicalToken: 'b'}],
    });
    expect(readFileSync(path.join(repositoryRoot, 'tmp/revision-reports/python.md'), 'utf8')).toContain('| updated | Title a | 1 | 2 |');
  });

  it('builds an initial inventory when the safe baseline path is absent', () => {
    const repositoryRoot = temporaryRoot();
    writeJson(repositoryRoot, 'tmp/snapshots/guides.json', {records: [sourceRecord('guide')]});

    const result = runCli(repositoryRoot, revisionBuildArgs('guides', ['--snapshot', 'tmp/snapshots/guides.json']));

    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(JSON.parse(readFileSync(path.join(repositoryRoot, 'tmp/revision-reports/guides.json'), 'utf8')).changes)
      .toMatchObject([{type: 'created', canonicalToken: 'guide'}]);
  });

  it('builds a complete empty REST inventory without snapshots', () => {
    const repositoryRoot = temporaryRoot();
    const result = runCli(repositoryRoot, revisionBuildArgs('rest'));

    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(JSON.parse(readFileSync(path.join(repositoryRoot, 'generated/en/manifests/lark-revisions/rest.json'), 'utf8')))
      .toMatchObject({group: 'rest', complete: true, records: []});
  });

  it('rejects snapshots for the deterministic empty REST inventory', () => {
    const repositoryRoot = temporaryRoot();
    writeJson(repositoryRoot, 'tmp/snapshots/rest.json', {records: [sourceRecord('unexpected')]});

    const result = runCli(repositoryRoot, revisionBuildArgs('rest', ['--snapshot', 'tmp/snapshots/rest.json']));

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/rest.*snapshot|snapshot.*rest/i);
  });

  it('refuses to infer deletion from an incomplete snapshot candidate', () => {
    const repositoryRoot = temporaryRoot();
    writeJson(repositoryRoot, 'generated/en/manifests/lark-revisions/java.json', revisionInventory('java', [revisionRecord('missing')]));
    writeJson(repositoryRoot, 'tmp/snapshots/java.json', {records: [sourceRecord('failed', '1', 'rate limited')]});

    const result = runCli(repositoryRoot, revisionBuildArgs('java', ['--snapshot', 'tmp/snapshots/java.json']));

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/incomplete.*deletion/i);
  });

  it.each([
    ['absolute snapshot', ['--snapshot', '/tmp/snapshot.json']],
    ['traversing baseline', ['--snapshot', 'tmp/snapshot.json', '--baseline', '../baseline.json']],
  ])('rejects an unsafe %s path', (_label, extra) => {
    const repositoryRoot = temporaryRoot();
    writeJson(repositoryRoot, 'tmp/snapshot.json', {records: []});
    const args = revisionBuildArgs('python', extra);
    const result = runCli(repositoryRoot, args);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/unsafe|repository-relative/i);
  });

  it('rejects a symlinked snapshot path', () => {
    const repositoryRoot = temporaryRoot();
    writeJson(repositoryRoot, 'outside.json', {records: []});
    mkdirSync(path.join(repositoryRoot, 'tmp'), {recursive: true});
    symlinkSync(path.join(repositoryRoot, 'outside.json'), path.join(repositoryRoot, 'tmp/snapshot.json'));

    const result = runCli(repositoryRoot, revisionBuildArgs('python', ['--snapshot', 'tmp/snapshot.json']));

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/symlink/i);
  });

  it('validates all seven committed English revision inventories', () => {
    const repositoryRoot = temporaryRoot();
    for (const group of ['guides', 'python', 'java', 'node', 'go', 'cli', 'rest']) {
      writeJson(repositoryRoot, `generated/en/manifests/lark-revisions/${group}.json`, revisionInventory(group));
    }

    const result = runCli(repositoryRoot, ['validate-revision-inventory', '--site', 'en']);

    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(result.stdout).toMatch(/validated/i);
  });

  it.each([
    ['missing', undefined, /missing|does not exist/i],
    ['malformed', '{', /json|unexpected|property/i],
    ['wrong group', revisionInventory('java'), /group/i],
  ])('fails revision inventory validation for a %s file', (_kind, replacement, expected) => {
    const repositoryRoot = temporaryRoot();
    for (const group of ['guides', 'python', 'java', 'node', 'go', 'cli', 'rest']) {
      writeJson(repositoryRoot, `generated/en/manifests/lark-revisions/${group}.json`, revisionInventory(group));
    }
    const target = path.join(repositoryRoot, 'generated/en/manifests/lark-revisions/python.json');
    if (replacement === undefined) {
      rmSync(target);
    } else if (typeof replacement === 'string') {
      writeFileSync(target, replacement);
    } else {
      writeFileSync(target, `${JSON.stringify(replacement)}\n`);
    }

    const result = runCli(repositoryRoot, ['validate-revision-inventory', '--site', 'en']);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(expected);
  });

  it('rejects revision inventory validation for sites other than English', () => {
    const result = runCli(temporaryRoot(), ['validate-revision-inventory', '--site', 'zh-CN']);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/site.*en/i);
  });

  it('writes site-qualified Guides source configuration for workflows', () => {
    const repositoryRoot = temporaryRoot();
    const output = path.join(repositoryRoot, 'github-output');
    const result = runCli(repositoryRoot, ['guides-source-config', '--site', 'zh-CN', '--github-output', output]);
    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(readFileSync(output, 'utf8')).toBe([
      'site=zh-CN',
      'root_token=XyeFwdx6kiK9A6kq3yIcLNdEnDd',
      'source_dir=packages/docs-tooling/src/lark/meta/sources/guides-zh-CN',
      'snapshot_path=packages/docs-tooling/src/lark/meta/snapshots/guides-zh-CN-uat-last-success.json',
      'source_manifest_path=packages/docs-tooling/src/lark/meta/source-cache/guides-zh-CN-manifest.json',
      'media_manifest_path=packages/docs-tooling/src/lark/meta/media-cache/guides-zh-CN.json',
      '',
    ].join('\n'));
  });

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
