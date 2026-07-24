import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, symlinkSync, writeFileSync, chmodSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import test from 'node:test';

import {scanIntegrity} from './integrity.mjs';

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'integrity-'));
  mkdirSync(path.join(root, 'docs'));
  writeFileSync(path.join(root, '.gitattributes'), '*.bat text eol=crlf\n');
  writeFileSync(path.join(root, 'Readme.md'), 'one\n');
  writeFileSync(path.join(root, 'README.md'), 'two\n');
  writeFileSync(path.join(root, '\u00df.md'), 'sharp s\n');
  writeFileSync(path.join(root, '\u1e9e.md'), 'capital sharp s\n');
  writeFileSync(path.join(root, 'docs', 'caf\u00e9.md'), 'nfc\n');
  writeFileSync(path.join(root, 'docs', 'cafe\u0301.md'), 'nfd\n');
  writeFileSync(path.join(root, 'docs', 'links.mdx'), '[absolute](/etc/passwd) [escape](../../secret.md)\n');
  writeFileSync(path.join(root, 'docs', 'bad.txt'), 'line\r\n');
  writeFileSync(path.join(root, 'docs', 'large.bin'), Buffer.alloc(33));
  writeFileSync(path.join(root, '.env.production'), 'SECRET=redacted\n');
  writeFileSync(path.join(root, 'docs', 'token.txt'), 'ghp_123456789012345678901234567890123456\n');
  writeFileSync(path.join(root, 'docs', 'key.pem'), '-----BEGIN PRIVATE KEY-----\nredacted\n');
  writeFileSync(path.join(root, 'docs', 'run.js'), 'console.log(1)\n');
  chmodSync(path.join(root, 'docs', 'run.js'), 0o755);
  symlinkSync('/etc/passwd', path.join(root, 'docs', 'link'));
  spawnSync('git', ['init', '-q'], {cwd: root});
  spawnSync('git', ['config', 'core.precomposeunicode', 'false'], {cwd: root});
  const blob = spawnSync('git', ['hash-object', '-w', 'Readme.md'], {cwd: root, encoding: 'utf8'}).stdout.trim();
  for (const name of ['Readme.md', 'README.md', 'docs/caf\u00e9.md', 'docs/cafe\u0301.md']) {
    spawnSync('git', ['update-index', '--add', '--cacheinfo', `100644,${blob},${name}`], {cwd: root});
  }
  spawnSync('git', ['add', 'docs/run.js'], {cwd: root});
  spawnSync('git', ['update-index', '--chmod=-x', 'docs/run.js'], {cwd: root});
  chmodSync(path.join(root, 'docs', 'run.js'), 0o755);
  return root;
}

test('detects repository integrity hazards without exposing secret values', async () => {
  const report = await scanIntegrity(fixture(), {maxFileSize: 32});
  const rules = new Set(report.findings.map(finding => finding.rule));
  for (const rule of ['path.case-collision', 'path.unicode-collision', 'symlink.unapproved',
    'mode.executable', 'mode.executable-drift', 'line-ending.crlf', 'link.absolute', 'link.traversal', 'file.too-large',
    'secret.filename', 'secret.token-marker', 'secret.private-key-marker']) assert.ok(rules.has(rule), rule);
  const serialized = JSON.stringify(report);
  assert.doesNotMatch(serialized, /ghp_123456|SECRET=|redacted/);
  assert.deepEqual(report.findings, [...report.findings].sort((a, b) =>
    `${a.severity}\0${a.rule}\0${a.path}`.localeCompare(`${b.severity}\0${b.rule}\0${b.path}`)));
  const symlink = report.findings.find(finding => finding.rule === 'symlink.unapproved');
  assert.match(symlink.sha256, /^[0-9a-f]{64}$/);
});

test('applies only explicit owner-and-reason allowlist entries', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'integrity-allow-'));
  symlinkSync('target', path.join(root, 'link'));
  const report = await scanIntegrity(root, {allowlist: [{rule: 'symlink.unapproved', path: 'link', owner: 'tooling', reason: 'Fixture exception'}]});
  assert.equal(report.findings[0].status, 'allowed');
  await assert.rejects(() => scanIntegrity(root, {allowlist: [{rule: 'symlink.unapproved', path: 'link'}]}), /owner/);
});
