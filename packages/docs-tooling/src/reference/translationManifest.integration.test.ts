import {spawnSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it} from 'vitest';

const cliMain = path.resolve(import.meta.dirname, '../cli-main.ts');

function git(repositoryRoot: string, args: string[]): void {
  const result = spawnSync('git', args, {cwd: repositoryRoot, encoding: 'utf8'});
  if (result.status !== 0) throw new Error(result.stderr || `git ${args.join(' ')} failed`);
}

function repository(): string {
  const root = mkdtempSync(path.join(tmpdir(), 'reference-cli-git-'));
  mkdirSync(path.join(root, 'content/en/reference/api/python'), {recursive: true});
  mkdirSync(path.join(root, 'content/zh-CN/reference/api/python'), {recursive: true});
  mkdirSync(path.join(root, 'config'), {recursive: true});
  writeFileSync(path.join(root, 'content/en/reference/api/python/page.md'), '# source\n');
  writeFileSync(path.join(root, 'content/zh-CN/reference/api/python/page.md'), '# target\n');
  writeFileSync(path.join(root, 'config/reference-retirements.json'), '{\n  "schemaVersion": 1,\n  "retirements": []\n}\n');
  writeFileSync(path.join(root, '.gitignore'), '.DS_Store\n');
  git(root, ['init', '--quiet']);
  git(root, ['config', 'user.email', 'reference-test@example.invalid']);
  git(root, ['config', 'user.name', 'Reference Test']);
  git(root, ['add', '.']);
  git(root, ['commit', '--quiet', '-m', 'fixture']);
  return root;
}

function generate(repositoryRoot: string) {
  return spawnSync(process.execPath, [
    '--experimental-strip-types', cliMain,
    'reference-manifest', '--source', 'content/en/reference', '--target', 'content/zh-CN/reference', '--source-commit', 'HEAD', '--write',
  ], {cwd: repositoryRoot, encoding: 'utf8'});
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
    schemaVersion: 1,
    retirements: [{
      manual: 'python',
      sourcePath: 'content/en/reference/api/python/page.md',
      targetPath: 'content/zh-CN/reference/api/python/page.md',
      reason: 'Fixture retirement',
    }],
  }, null, 2) + '\n');
  git(root, ['add', '-A']);
  git(root, ['commit', '--quiet', '-m', 'retire source']);
  expect(generate(root).status).toBe(0);
  return root;
}

describe('Reference manifest executable security boundary', () => {
  it('bootstraps from content, commit, and the retirement registry without generated input', () => {
    const root = repository();
    rmSync(path.join(root, 'content/en/reference/api/python/page.md'));
    writeFileSync(path.join(root, 'config/reference-retirements.json'), JSON.stringify({
      schemaVersion: 1,
      retirements: [{
        manual: 'python',
        sourcePath: 'content/en/reference/api/python/page.md',
        targetPath: 'content/zh-CN/reference/api/python/page.md',
        reason: 'Fixture source was explicitly retired',
      }],
    }, null, 2) + '\n');
    git(root, ['add', '-A']);
    git(root, ['commit', '--quiet', '-m', 'retire source']);
    rmSync(path.join(root, 'generated'), {recursive: true, force: true});

    const result = generate(root);

    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(JSON.parse(readFileSync(path.join(root, 'generated/en/manifests/reference.json'), 'utf8')).records).toHaveLength(0);
    const translations = JSON.parse(readFileSync(path.join(root, 'generated/zh-CN/manifests/reference-translations.json'), 'utf8'));
    expect(translations.records).toHaveLength(1);
    expect(translations.records[0].status).toBe('retired');
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
    ['empty', (root: string) => writeFileSync(path.join(root, 'config/reference-retirements.json'), '{"schemaVersion":1,"retirements":[]}\n')],
    ['missing', (root: string) => rmSync(path.join(root, 'config/reference-retirements.json'))],
    ['malformed', (root: string) => writeFileSync(path.join(root, 'config/reference-retirements.json'), '{not-json\n')],
    ['stale', (root: string) => writeFileSync(path.join(root, 'config/reference-retirements.json'), JSON.stringify({
      schemaVersion: 1,
      retirements: [{
        manual: 'python',
        sourcePath: 'content/en/reference/api/python/stale.md',
        targetPath: 'content/zh-CN/reference/api/python/stale.md',
        reason: 'Stale fixture retirement',
      }],
    }, null, 2) + '\n')],
  ])('rejects a %s retirement registry during Chinese executable validation', (_kind, mutate) => {
    const root = retiredRepository();
    mutate(root);

    const result = validateChinese(root);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/retirement|registry|missing|json/i);
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
});
