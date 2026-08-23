import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it} from 'vitest';

const cliMain = path.resolve(import.meta.dirname, '../cli-main.ts');
const referenceSidebarNames = ['python', 'java', 'node', 'go', 'cpp', 'restful', 'cli'] as const;

function navigationConfig(landingPage = 'api/python/landing.md') {
  return {
    schemaVersion: 1,
    targets: [
      {manual: 'python', sidebarKey: 'pythonSidebar', sidebar: 'python'},
      {manual: 'java', sidebarKey: 'javaSidebar', sidebar: 'java'},
      {manual: 'node', sidebarKey: 'nodeSidebar', sidebar: 'node'},
      {manual: 'go', sidebarKey: 'goSidebar', sidebar: 'go'},
      {manual: 'cpp', sidebarKey: 'cppSidebar', sidebar: 'cpp'},
      {manual: 'rest', sidebarKey: 'restfulSidebar', sidebar: 'restful'},
      {manual: 'cli', sidebarKey: 'cliSidebar', sidebar: 'cli'},
    ].map(target => ({
      ...target,
      documentIdPrefix: 'api/python',
      landingPage,
      minimumProseCharacters: 1,
      minimumHeadingCount: 1,
      requireSourceDifference: false,
    })),
  };
}

function git(repositoryRoot: string, args: string[]): void {
  const result = spawnSync('git', args, {cwd: repositoryRoot, encoding: 'utf8'});
  if (result.status !== 0) throw new Error(result.stderr || `git ${args.join(' ')} failed`);
}

function gitOutput(repositoryRoot: string, args: string[]): string {
  const result = spawnSync('git', args, {cwd: repositoryRoot, encoding: 'utf8'});
  if (result.status !== 0) throw new Error(result.stderr || `git ${args.join(' ')} failed`);
  return result.stdout.trim();
}

function repository(): string {
  const root = mkdtempSync(path.join(tmpdir(), 'reference-cli-git-'));
  mkdirSync(path.join(root, 'content/en/reference/api/python'), {recursive: true});
  mkdirSync(path.join(root, 'content/zh-CN/reference/api/python'), {recursive: true});
  mkdirSync(path.join(root, 'config'), {recursive: true});
  mkdirSync(path.join(root, 'generated/en/sidebars'), {recursive: true});
  writeFileSync(path.join(root, 'content/en/reference/api/python/page.md'), '# source\n');
  writeFileSync(path.join(root, 'content/zh-CN/reference/api/python/page.md'), '# target\n');
  writeFileSync(path.join(root, 'content/en/reference/api/python/landing.md'), '---\nsidebar_label: English Landing\n---\n# English landing\n');
  writeFileSync(path.join(root, 'content/zh-CN/reference/api/python/landing.md'), '---\nsidebar_label: 中文首页\n---\n# 中文首页\n');
  for (const manual of referenceSidebarNames) {
    writeFileSync(path.join(root, `generated/en/sidebars/${manual}.sidebar.js`), 'module.exports = ["api/python/page"]\n');
  }
  writeFileSync(path.join(root, 'config/reference-navigation.json'), `${JSON.stringify(navigationConfig(), null, 2)}\n`);
  writeFileSync(path.join(root, 'config/reference-retirements.json'), '{\n  "schemaVersion": 2,\n  "retirements": []\n}\n');
  writeFileSync(path.join(root, '.gitignore'), '.DS_Store\n');
  git(root, ['init', '--quiet']);
  git(root, ['config', 'user.email', 'reference-test@example.invalid']);
  git(root, ['config', 'user.name', 'Reference Test']);
  git(root, ['add', '.']);
  git(root, ['commit', '--quiet', '-m', 'fixture']);
  return root;
}

function runReferenceManifest(repositoryRoot: string, args: readonly string[]) {
  return spawnSync(process.execPath, [
    '--experimental-strip-types', cliMain,
    ...args,
  ], {cwd: repositoryRoot, encoding: 'utf8'});
}

function generate(repositoryRoot: string) {
  return runReferenceManifest(repositoryRoot, [
    'reference-manifest', '--source', 'content/en/reference', '--target', 'content/zh-CN/reference', '--source-commit', 'HEAD', '--write',
  ]);
}

function generateWithWorkflowShorthand(repositoryRoot: string) {
  return runReferenceManifest(repositoryRoot, ['reference-manifest', '--write']);
}

function validateChinese(repositoryRoot: string) {
  return spawnSync(process.execPath, [
    '--experimental-strip-types', cliMain,
    'validate-reference', '--site', 'zh-CN',
  ], {cwd: repositoryRoot, encoding: 'utf8'});
}

function validateEnglish(repositoryRoot: string) {
  return spawnSync(process.execPath, [
    '--experimental-strip-types', cliMain,
    'validate-reference', '--site', 'en',
  ], {cwd: repositoryRoot, encoding: 'utf8'});
}

function retiredRepository(): string {
  const root = repository();
  rmSync(path.join(root, 'content/en/reference/api/python/page.md'));
  writeFileSync(path.join(root, 'config/reference-retirements.json'), JSON.stringify({
    schemaVersion: 2,
    retirements: [{
      manual: 'python',
      sourcePath: 'content/en/reference/api/python/page.md',
      targetPath: 'content/zh-CN/reference/api/python/page.md',
      changeKind: null,
      rationale: 'Fixture retirement',
    }],
  }, null, 2) + '\n');
  git(root, ['add', '-A']);
  git(root, ['commit', '--quiet', '-m', 'retire source']);
  expect(generate(root).status).toBe(0);
  return root;
}

describe('Reference manifest executable security boundary', () => {
  it('regenerates only the selected Chinese Reference group', () => {
    const root = repository();
    mkdirSync(path.join(root, 'content/en/reference/api/go'), {recursive: true});
    writeFileSync(path.join(root, 'content/en/reference/api/go/page.md'), '# Go source without a Chinese target\n');
    writeFileSync(path.join(root, 'generated/en/sidebars/go.sidebar.js'), 'module.exports = ["api/go/page"]\n');
    const javaSidebar = path.join(root, 'generated/zh-CN/sidebars/java.sidebar.js');
    mkdirSync(path.dirname(javaSidebar), {recursive: true});
    writeFileSync(javaSidebar, 'module.exports = ["sentinel"]\n');

    const result = runReferenceManifest(root, [
      'reference-sidebar', '--group', 'python', '--write',
    ]);

    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(readFileSync(path.join(root, 'generated/zh-CN/sidebars/python.sidebar.js'), 'utf8')).toContain('api/python/page');
    expect(readFileSync(javaSidebar, 'utf8')).toBe('module.exports = ["sentinel"]\n');
  });

  it('supports the exact workflow shorthand and publishes manifests plus all six sidebars', () => {
    const root = repository();

    const result = generateWithWorkflowShorthand(root);

    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(JSON.parse(readFileSync(path.join(root, 'generated/en/manifests/reference.json'), 'utf8')).records).toHaveLength(2);
    expect(JSON.parse(readFileSync(path.join(root, 'generated/zh-CN/manifests/reference-translations.json'), 'utf8')).records).toHaveLength(2);
    for (const manual of referenceSidebarNames) {
      expect(readFileSync(path.join(root, `generated/zh-CN/sidebars/${manual}.sidebar.js`), 'utf8')).toContain('module.exports');
    }
  });

  it('reconciles the failed REST publication as pending without creating a Chinese target or sidebar entry', () => {
    const root = repository();
    expect(generate(root).status).toBe(0);
    const sourcePath = 'content/en/reference/api/restful/restful/v2/control-plane/cloud-access-control-operations-v2/cloud-access-control-operations-v2.mdx';
    const targetPath = sourcePath.replace('content/en/', 'content/zh-CN/');
    const documentId = sourcePath.slice('content/en/reference/'.length).replace(/\.mdx?$/u, '');
    mkdirSync(path.dirname(path.join(root, sourcePath)), {recursive: true});
    writeFileSync(path.join(root, sourcePath), '# Cloud access control operations\n');
    writeFileSync(path.join(root, 'generated/en/sidebars/restful.sidebar.js'), `module.exports = ["api/python/page", "${documentId}"]\n`);
    const config = navigationConfig();
    writeFileSync(path.join(root, 'config/reference-navigation.json'), `${JSON.stringify({
      ...config,
      targets: config.targets.map(target => target.manual === 'rest' ? {...target, documentIdPrefix: 'api'} : target),
    }, null, 2)}\n`);
    git(root, ['add', '.']);
    git(root, ['commit', '--quiet', '-m', 'add REST source']);
    const sourceCommit = gitOutput(root, ['rev-parse', 'HEAD']);

    const result = generate(root);

    expect(result.status, result.stderr || result.stdout).toBe(0);
    const sourceManifest = JSON.parse(readFileSync(path.join(root, 'generated/en/manifests/reference.json'), 'utf8'));
    const translationManifest = JSON.parse(readFileSync(path.join(root, 'generated/zh-CN/manifests/reference-translations.json'), 'utf8'));
    expect(sourceManifest.sourceCommit).toBe(sourceCommit);
    expect(sourceManifest.records.find((record: {sourcePath: string}) => record.sourcePath === sourcePath)).toMatchObject({
      manual: 'rest',
      sourcePath,
    });
    expect(translationManifest.records.some((record: {sourcePath: string}) => record.sourcePath === sourcePath)).toBe(false);
    expect(translationManifest.pendingRecords).toContainEqual(expect.objectContaining({
      manual: 'rest',
      sourcePath,
      targetPath,
      sourceCommit,
    }));
    expect(existsSync(path.join(root, targetPath))).toBe(false);
    expect(readFileSync(path.join(root, 'generated/zh-CN/sidebars/restful.sidebar.js'), 'utf8')).not.toContain(documentId);
    const sidebarResult = runReferenceManifest(root, ['reference-sidebar', '--group', 'rest', '--write']);
    expect(sidebarResult.status, sidebarResult.stderr || sidebarResult.stdout).toBe(0);
    expect(readFileSync(path.join(root, 'generated/zh-CN/sidebars/restful.sidebar.js'), 'utf8')).not.toContain(documentId);
    const validation = validateChinese(root);
    expect(validation.status, validation.stderr || validation.stdout).toBe(0);

    const second = generate(root);
    expect(second.status, second.stderr || second.stdout).toBe(0);
    const secondManifest = JSON.parse(readFileSync(path.join(root, 'generated/zh-CN/manifests/reference-translations.json'), 'utf8'));
    expect(secondManifest.pendingRecords).toContainEqual(expect.objectContaining({sourcePath, targetPath, sourceCommit}));

    mkdirSync(path.dirname(path.join(root, targetPath)), {recursive: true});
    writeFileSync(path.join(root, targetPath), '# 云访问控制操作\n');
    git(root, ['add', '.']);
    git(root, ['commit', '--quiet', '-m', 'add REST target']);
    const materializedCommit = gitOutput(root, ['rev-parse', 'HEAD']);
    const materialized = generate(root);
    expect(materialized.status, materialized.stderr || materialized.stdout).toBe(0);
    const materializedManifest = JSON.parse(readFileSync(path.join(root, 'generated/zh-CN/manifests/reference-translations.json'), 'utf8'));
    expect(materializedManifest.pendingRecords ?? []).toEqual([]);
    expect(materializedManifest.records).toContainEqual(expect.objectContaining({
      sourcePath,
      targetPath,
      sourceCommit: materializedCommit,
      status: 'translated',
    }));
    expect(readFileSync(path.join(root, 'generated/zh-CN/sidebars/restful.sidebar.js'), 'utf8')).toContain(documentId);
    const materializedValidation = validateChinese(root);
    expect(materializedValidation.status, materializedValidation.stderr || materializedValidation.stdout).toBe(0);
  }, 15_000);

  it('publishes an explicit English-only REST page as language-excluded without dispatching translation', () => {
    const root = repository();
    expect(generate(root).status).toBe(0);
    const sourcePath = 'content/en/reference/api/restful/restful/v2/control-plane/project-operations-v2/upgrade-project-v2.mdx';
    const targetPath = sourcePath.replace('content/en/', 'content/zh-CN/');
    const documentId = sourcePath.slice('content/en/reference/'.length).replace(/\.mdx?$/u, '');
    mkdirSync(path.dirname(path.join(root, sourcePath)), {recursive: true});
    writeFileSync(path.join(root, sourcePath), [
      '# Upgrade Project',
      '',
      'export const specs = {"summary":"Upgrade Project","x-include-langs":["en-US"]}',
      'export const endpoint = "/v2/projects/{projectId}/plan"',
      'export const method = "patch"',
      '',
    ].join('\n'));
    writeFileSync(path.join(root, 'generated/en/sidebars/restful.sidebar.js'), `module.exports = ["api/python/page", "${documentId}"]\n`);
    const config = navigationConfig();
    writeFileSync(path.join(root, 'config/reference-navigation.json'), `${JSON.stringify({
      ...config,
      targets: config.targets.map(target => target.manual === 'rest' ? {...target, documentIdPrefix: 'api'} : target),
    }, null, 2)}\n`);
    git(root, ['add', '.']);
    git(root, ['commit', '--quiet', '-m', 'add English-only REST source']);
    const sourceCommit = gitOutput(root, ['rev-parse', 'HEAD']);

    const result = generate(root);

    expect(result.status, result.stderr || result.stdout).toBe(0);
    const translationManifest = JSON.parse(readFileSync(path.join(root, 'generated/zh-CN/manifests/reference-translations.json'), 'utf8'));
    expect(translationManifest.records.some((record: {sourcePath: string}) => record.sourcePath === sourcePath)).toBe(false);
    expect(translationManifest.pendingRecords ?? []).not.toContainEqual(expect.objectContaining({sourcePath}));
    expect(translationManifest.languageExcludedRecords).toContainEqual({
      manual: 'rest',
      sourcePath,
      targetPath,
      sourceCommit,
      sourceHash: expect.stringMatching(/^[a-f0-9]{64}$/u),
      locale: 'zh-CN',
      reason: 'x-include-langs',
    });
    expect(existsSync(path.join(root, targetPath))).toBe(false);
    expect(readFileSync(path.join(root, 'generated/zh-CN/sidebars/restful.sidebar.js'), 'utf8')).not.toContain(documentId);
    const validation = validateChinese(root);
    expect(validation.status, validation.stderr || validation.stdout).toBe(0);
  });

  it('fails closed when a previously active target disappears without retirement authorization', () => {
    const root = repository();
    expect(generate(root).status).toBe(0);
    rmSync(path.join(root, 'content/zh-CN/reference/api/python/page.md'));
    git(root, ['add', '-A']);
    git(root, ['commit', '--quiet', '-m', 'remove target without retirement']);

    const result = generate(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/explicit retirement/i);
  });

  it('fails closed when a historical target and its translation record are deleted together', () => {
    const root = repository();
    expect(generate(root).status).toBe(0);
    git(root, ['add', '.']);
    git(root, ['commit', '--quiet', '-m', 'persist Reference manifests']);
    rmSync(path.join(root, 'content/zh-CN/reference/api/python/page.md'));
    const manifestPath = path.join(root, 'generated/zh-CN/manifests/reference-translations.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    manifest.records = manifest.records.filter((record: {sourcePath: string}) => (
      record.sourcePath !== 'content/en/reference/api/python/page.md'
    ));
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    git(root, ['add', '-A']);
    git(root, ['commit', '--quiet', '-m', 'delete target and translation record']);

    const result = generate(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/historical source|translation record|explicit retirement/i);
    const sidebar = runReferenceManifest(root, ['reference-sidebar', '--group', 'python', '--write']);
    expect(sidebar.status).not.toBe(0);
    expect(sidebar.stderr).toMatch(/coverage|pending|translation record/i);
    const validation = validateChinese(root);
    expect(validation.status).not.toBe(0);
    expect(validation.stderr).toMatch(/coverage|pending|translation record/i);
  });

  it('authenticates previous source manifests before using prior translation state', () => {
    const root = repository();
    expect(generate(root).status).toBe(0);
    const manifestPath = path.join(root, 'generated/en/manifests/reference.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    manifest.records[0].sourceHash = 'f'.repeat(64);
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    const result = generate(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/source.*hash|declared snapshot|commit tree/i);
  });

  it('adds each configured landing once to English and Chinese sidebars and is idempotent', () => {
    const root = repository();
    writeFileSync(path.join(root, 'content/en/reference/api/python/landing-two.md'), [
      '---',
      'sidebar_label: English Landing',
      '---',
      '# English landing',
      '',
    ].join('\n'));
    writeFileSync(path.join(root, 'content/zh-CN/reference/api/python/landing-two.md'), [
      '---',
      'sidebar_label: 中文首页',
      '---',
      '# 中文首页',
      '',
    ].join('\n'));
    writeFileSync(path.join(root, 'config/reference-navigation.json'), `${JSON.stringify(navigationConfig('api/python/landing-two.md'), null, 2)}\n`);
    writeFileSync(path.join(root, 'generated/en/sidebars/python.sidebar.js'), [
      'module.exports = [',
      '  {type: "doc", id: "api/python/landing-two", label: "stale duplicate"},',
      '  "api/python/page",',
      '  "api/python/landing-two",',
      '  {type: "category", label: "Keep empty", items: []}',
      ']',
      '',
    ].join('\n'));
    git(root, ['add', '.']);
    git(root, ['commit', '--quiet', '-m', 'landing fixture']);

    const first = generateWithWorkflowShorthand(root);

    expect(first.status, first.stderr || first.stdout).toBe(0);
    const firstPublication = new Map<string, string>();
    for (const locale of ['en', 'zh-CN']) {
      for (const manual of referenceSidebarNames) {
        const relativePath = `generated/${locale}/sidebars/${manual}.sidebar.js`;
        const contents = readFileSync(path.join(root, relativePath), 'utf8');
        firstPublication.set(relativePath, contents);
        expect(contents.match(/api\/python\/landing-two/gu)).toHaveLength(1);
        expect(contents).toContain(locale === 'en' ? 'English Landing' : '中文首页');
        if (locale === 'en' && manual === 'python') expect(contents).toContain('Keep empty');
      }
    }

    const second = generateWithWorkflowShorthand(root);

    expect(second.status, second.stderr || second.stdout).toBe(0);
    for (const [relativePath, contents] of firstPublication) {
      expect(readFileSync(path.join(root, relativePath), 'utf8')).toBe(contents);
    }
  });

  it.each([
    ['reference-manifest'],
    ['reference-manifest', '--write', 'extra'],
    ['reference-manifest', '--source', 'content/en/reference', '--write'],
    ['reference-manifest', '--target', 'content/zh-CN/reference', '--write'],
    ['reference-manifest', '--source-commit', 'HEAD', '--write'],
  ])('rejects the noncanonical partial form %j', (...args) => {
    const root = repository();

    const result = runReferenceManifest(root, args);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/usage: docs-tooling reference-manifest/i);
  });

  it('requires English sidebar templates while bootstrapping manifests from content, commit, and the retirement registry', () => {
    const root = repository();
    rmSync(path.join(root, 'content/en/reference/api/python/page.md'));
    writeFileSync(path.join(root, 'config/reference-retirements.json'), JSON.stringify({
      schemaVersion: 2,
      retirements: [{
        manual: 'python',
        sourcePath: 'content/en/reference/api/python/page.md',
        targetPath: 'content/zh-CN/reference/api/python/page.md',
        changeKind: null,
        rationale: 'Fixture source was explicitly retired',
      }],
    }, null, 2) + '\n');
    git(root, ['add', '-A']);
    git(root, ['commit', '--quiet', '-m', 'retire source']);
    rmSync(path.join(root, 'generated/en/manifests'), {recursive: true, force: true});
    rmSync(path.join(root, 'generated/zh-CN'), {recursive: true, force: true});

    const result = generate(root);

    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(JSON.parse(readFileSync(path.join(root, 'generated/en/manifests/reference.json'), 'utf8')).records).toHaveLength(1);
    const translations = JSON.parse(readFileSync(path.join(root, 'generated/zh-CN/manifests/reference-translations.json'), 'utf8'));
    expect(translations.records).toHaveLength(2);
    expect(translations.records.find((record: {sourcePath: string}) => record.sourcePath.endsWith('/page.md'))?.status).toBe('retired');
  });

  it('generates a retired record when only the registered English source remains', () => {
    const root = repository();
    rmSync(path.join(root, 'content/zh-CN/reference/api/python/page.md'));
    writeFileSync(path.join(root, 'config/reference-retirements.json'), JSON.stringify({
      schemaVersion: 2,
      retirements: [{
        manual: 'python',
        sourcePath: 'content/en/reference/api/python/page.md',
        targetPath: 'content/zh-CN/reference/api/python/page.md',
        changeKind: null,
        rationale: 'Fixture target was explicitly retired',
      }],
    }, null, 2) + '\n');
    git(root, ['add', '-A']);
    git(root, ['commit', '--quiet', '-m', 'retire target']);

    const result = generate(root);

    expect(result.status, result.stderr || result.stdout).toBe(0);
    const translations = JSON.parse(readFileSync(path.join(root, 'generated/zh-CN/manifests/reference-translations.json'), 'utf8'));
    expect(translations.records.find((record: {sourcePath: string}) => record.sourcePath.endsWith('/page.md'))?.status).toBe('retired');
  });

  it('fails through the executable when an English Reference sidebar template is missing', () => {
    const root = repository();
    rmSync(path.join(root, 'generated/en/sidebars/python.sidebar.js'));

    const result = generate(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/cannot load English Reference sidebar template.*python\.sidebar\.js/i);
  });

  it('rejects an ignored source file absent from the declared commit tree', () => {
    const root = repository();
    writeFileSync(path.join(root, 'content/en/reference/.DS_Store'), 'ignored but unsafe\n');

    const result = generate(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/commit tree.*path set|declared snapshot/i);
  });

  it('does not overwrite an outside sentinel through a final manifest symlink', () => {
    const root = repository();
    const outside = path.join(mkdtempSync(path.join(tmpdir(), 'reference-output-sentinel-')), 'sentinel.json');
    writeFileSync(outside, 'sentinel\n');
    mkdirSync(path.join(root, 'generated/en/manifests'), {recursive: true});
    symlinkSync(outside, path.join(root, 'generated/en/manifests/reference.json'));

    const result = generate(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/symlink|manifest/i);
    expect(readFileSync(outside, 'utf8')).toBe('sentinel\n');
  });

  it('rejects canonically swapped targets through the executable validator', () => {
    const root = repository();
    writeFileSync(path.join(root, 'content/en/reference/api/python/second.md'), '# second source\n');
    writeFileSync(path.join(root, 'content/zh-CN/reference/api/python/second.md'), '# second target\n');
    git(root, ['add', '.']);
    git(root, ['commit', '--quiet', '-m', 'second page']);
    expect(generate(root).status).toBe(0);
    const manifestPath = path.join(root, 'generated/zh-CN/manifests/reference-translations.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const firstTarget = {path: manifest.records[0].targetPath, hash: manifest.records[0].targetHash};
    manifest.records[0].targetPath = manifest.records[1].targetPath;
    manifest.records[0].targetHash = manifest.records[1].targetHash;
    manifest.records[1].targetPath = firstTarget.path;
    manifest.records[1].targetHash = firstTarget.hash;
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    const result = validateChinese(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/canonical relative path|mapping/i);
  });

  it.each([
    ['empty', (root: string) => writeFileSync(path.join(root, 'config/reference-retirements.json'), '{"schemaVersion":2,"retirements":[]}\n')],
    ['missing', (root: string) => rmSync(path.join(root, 'config/reference-retirements.json'))],
    ['malformed', (root: string) => writeFileSync(path.join(root, 'config/reference-retirements.json'), '{not-json\n')],
    ['stale', (root: string) => writeFileSync(path.join(root, 'config/reference-retirements.json'), JSON.stringify({
      schemaVersion: 2,
      retirements: [{
        manual: 'python',
        sourcePath: 'content/en/reference/api/python/stale.md',
        targetPath: 'content/zh-CN/reference/api/python/stale.md',
        changeKind: null,
        rationale: 'Stale fixture retirement',
      }],
    }, null, 2) + '\n')],
  ])('rejects a %s retirement registry during Chinese executable validation', (_kind, mutate) => {
    const root = retiredRepository();
    mutate(root);

    const result = validateChinese(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/retirement|registry|missing|json/i);
  });

  it('ignores an obsolete retirement approval after both source and translation are restored', () => {
    const root = repository();
    expect(generate(root).status).toBe(0);
    writeFileSync(path.join(root, 'config/reference-retirements.json'), JSON.stringify({
      schemaVersion: 2,
      retirements: [{
        manual: 'python',
        sourcePath: 'content/en/reference/api/python/page.md',
        targetPath: 'content/zh-CN/reference/api/python/page.md',
        changeKind: null,
        rationale: 'Obsolete fixture retirement',
      }],
    }, null, 2) + '\n');

    const result = validateChinese(root);

    expect(result.status, result.stderr || result.stdout).toBe(0);
  });

  it('rejects a source manifest manual that does not match authoritative ownership', () => {
    const root = repository();
    expect(generate(root).status).toBe(0);
    const manifestPath = path.join(root, 'generated/en/manifests/reference.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    manifest.records[0].manual = 'aaa';
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    const result = validateEnglish(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/manual|ownership/i);
  });

  it('rejects a placeholder Chinese Reference landing page', () => {
    const root = repository();
    writeFileSync(path.join(root, 'content/zh-CN/reference/api/python/landing.md'), '# TODO\n');
    const config = navigationConfig();
    writeFileSync(path.join(root, 'config/reference-navigation.json'), `${JSON.stringify({
      ...config,
      targets: config.targets.map(target => ({...target, minimumProseCharacters: 20})),
    }, null, 2)}\n`);
    expect(generate(root).status).toBe(0);

    const result = validateChinese(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/landing page/i);
    expect(result.stderr).toMatch(/python/i);
  });
});
