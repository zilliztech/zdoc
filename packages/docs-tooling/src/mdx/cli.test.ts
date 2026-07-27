import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {mkdtempSync, mkdirSync, readFileSync, symlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it} from 'vitest';

import * as mdxAdapter from './index.ts';

const require = createRequire(import.meta.url);
const mdxCore = require('./validate.cjs') as Record<string, unknown>;
const cliMain = path.resolve(import.meta.dirname, '../cli-main.ts');

function temporaryRoot(): string {
  return mkdtempSync(path.join(tmpdir(), 'docs-tooling-mdx-cli-'));
}

function run(repositoryRoot: string, ...args: string[]) {
  return spawnSync(process.execPath, ['--experimental-strip-types', cliMain, ...args], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: {...process.env},
  });
}

describe('docs-tooling validate-mdx', () => {
  it('exposes the CommonJS validator through the TypeScript adapter', async () => {
    expect(Object.keys(mdxAdapter).sort()).toEqual(Object.keys(mdxCore).sort());
    const fixture = '<p><code><i>http</i>s://{cluster-id}.example.com</code></p>';
    expect(await mdxAdapter.applyMdxPatches(fixture)).toBe(await (mdxCore.applyMdxPatches as (value: string) => Promise<string>)(fixture));
  });

  it('patches Markdown files recursively through the explicit CLI command', () => {
    const root = temporaryRoot();
    mkdirSync(path.join(root, 'content'), {recursive: true});
    writeFileSync(path.join(root, 'content/page.md'), '<!-- category: SDK -->\n');
    const result = run(root, 'validate-mdx', '--path', 'content');
    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(result.stdout).toMatch(/1\/1 files patched/);
    expect(readFileSync(path.join(root, 'content/page.md'), 'utf8')).toBe('{/* category: SDK */}\n');
  });

  it('rejects paths outside the repository', () => {
    const result = run(temporaryRoot(), 'validate-mdx', '--path', '../outside');
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/unsafe|repository-relative|outside/i);
  });

  it('rejects symlinked input directories', () => {
    const root = temporaryRoot();
    const outside = temporaryRoot();
    writeFileSync(path.join(outside, 'page.md'), '# outside\n');
    symlinkSync(outside, path.join(root, 'content'));
    const result = run(root, 'validate-mdx', '--path', 'content');
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/symlink/i);
    expect(readFileSync(path.join(outside, 'page.md'), 'utf8')).toBe('# outside\n');
  });
});

describe('docs-tooling check-links', () => {
  it('rejects unknown sites', () => {
    const result = run(temporaryRoot(), 'check-links', '--site', 'fr', '--output', 'tmp/report.md');
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/site.*en.*zh-CN/i);
  });

  it.each(['../report.md', 'tmp/report.json', '/tmp/report.md'])('rejects a malformed report target: %s', output => {
    const result = run(temporaryRoot(), 'check-links', '--site', 'en', '--output', output);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/output|report|unsafe|\.md/i);
  });
});

describe('docs-tooling report-card', () => {
  it.each(['create', 'advance', 'note', 'finish'])('exposes the %s action and fails closed without credentials', action => {
    const secret = 'super-secret-value';
    const result = spawnSync(process.execPath, [
      '--experimental-strip-types', cliMain, 'report-card', action,
      '--title', 'Build', '--stages', 'Build', '--message-id', 'om_1', '--file', 'missing.md',
    ], {
      cwd: temporaryRoot(),
      encoding: 'utf8',
      env: {...process.env, APP_ID: '', APP_SECRET: secret, FEISHU_HOST: ''},
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/APP_ID|FEISHU_HOST|credential/i);
    expect(result.stderr).not.toContain(secret);
    expect(result.stdout).not.toContain(secret);
  });

  it('rejects unknown report-card actions', () => {
    const result = run(temporaryRoot(), 'report-card', 'delete');
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/create.*advance.*note.*finish/i);
  });
});
