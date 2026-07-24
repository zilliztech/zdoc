import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {chmodSync, mkdtempSync, mkdirSync, readFileSync, symlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import test from 'node:test';

import {scanIntegrity} from './integrity.mjs';

const digest = value => createHash('sha256').update(value).digest('hex');

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'integrity-'));
  mkdirSync(path.join(root, 'docs/sub'), {recursive: true});
  writeFileSync(path.join(root, '.gitattributes'), '*.bat text eol=crlf\n');
  writeFileSync(path.join(root, 'Readme.md'), 'one\n'); writeFileSync(path.join(root, 'README.md'), 'two\n');
  writeFileSync(path.join(root, 'docs/caf\u00e9.md'), 'nfc\n'); writeFileSync(path.join(root, 'docs/cafe\u0301.md'), 'nfd\n');
  writeFileSync(path.join(root, 'docs/sub/links.mdx'), [
    '[site](/docs/start) [home](/) [near-route](/docsish) [legal](../page.md) [escape](../../.env) [again](../../.env)',
    '[reference][unsafe] [duplicate](../../.env)',
    '[unsafe]: /opt/private.pem',
    '<file:///etc/passwd>',
    '<a href="/docs/reference">allowed HTML route</a>',
    '<img src="//server/share">',
    '<Card href="/root/key" image="/docs/image.png" />',
    '<a href={dynamicTarget}>dynamic JSX is out of scope</a>',
  ].join('\n'));
  writeFileSync(path.join(root, 'docs/bad.txt'), 'line\r\n'); writeFileSync(path.join(root, 'docs/large.bin'), Buffer.alloc(3000));
  writeFileSync(path.join(root, '.env.production'), 'SECRET=redacted\n');
  writeFileSync(path.join(root, 'docs/token.txt'), 'ghp_123456789012345678901234567890123456\n');
  writeFileSync(path.join(root, 'docs/key.pem'), '-----BEGIN PRIVATE KEY-----\nredacted\n');
  writeFileSync(path.join(root, 'docs/run.js'), 'console.log(1)\n'); chmodSync(path.join(root, 'docs/run.js'), 0o755);
  symlinkSync('/etc/passwd', path.join(root, 'docs/link'));
  spawnSync('git', ['init', '-q'], {cwd: root}); spawnSync('git', ['config', 'core.precomposeunicode', 'false'], {cwd: root});
  const blob = spawnSync('git', ['hash-object', '-w', 'Readme.md'], {cwd: root, encoding: 'utf8'}).stdout.trim();
  for (const name of ['Readme.md', 'README.md', 'docs/caf\u00e9.md', 'docs/cafe\u0301.md']) spawnSync('git', ['update-index', '--add', '--cacheinfo', `100644,${blob},${name}`], {cwd: root});
  spawnSync('git', ['add', 'docs/run.js'], {cwd: root}); spawnSync('git', ['update-index', '--chmod=-x', 'docs/run.js'], {cwd: root}); chmodSync(path.join(root, 'docs/run.js'), 0o755);
  return root;
}

test('detects integrity hazards, resolves links safely, and deduplicates targets', async () => {
  const report = await scanIntegrity(fixture(), {
    repository: 'zdoc',
    maxFileSize: 1024,
    contentRoots: ['docs'],
    allowedRoutePrefixes: ['/docs'],
    allowedExactRoutes: ['/'],
  });
  const rules = new Set(report.findings.map(item => item.rule));
  for (const rule of ['path.case-collision', 'path.unicode-collision', 'symlink.unapproved', 'mode.executable', 'mode.executable-drift', 'line-ending.crlf', 'link.absolute', 'link.traversal', 'file.too-large', 'secret.filename', 'secret.token-marker', 'secret.private-key-marker', 'secret.large-binary-quarantine']) assert.ok(rules.has(rule), rule);
  assert.equal(report.findings.filter(item => item.rule === 'link.traversal' && item.normalizedTarget === '.env').length, 1);
  for (const target of ['/docsish', '/opt/private.pem', '/root/key', '//server/share', 'file:///etc/passwd']) {
    assert.ok(report.findings.some(item => item.rule === 'link.absolute' && item.normalizedTarget === target), target);
  }
  assert.ok(!report.findings.some(item => ['/', '/docs/start', '/docs/reference', '/docs/image.png', 'docs/page.md'].includes(item.normalizedTarget)));
  assert.ok(!JSON.stringify(report).includes('dynamicTarget'));
  assert.deepEqual(report.policy.routePolicy.allowedRoutePrefixes, ['/docs']);
  assert.deepEqual(report.policy.routePolicy.allowedExactRoutes, ['/']);
  assert.match(report.policy.routePolicy.dynamicJsxExpressions, /out of scope/i);
  assert.equal(report.repository, 'zdoc'); assert.match(report.allowlistDigest, /^[0-9a-f]{64}$/);
  assert.doesNotMatch(JSON.stringify(report), /ghp_123456|SECRET=|redacted/);
});

test('detects ASCII secret markers in binary bytes and across read boundaries', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'integrity-binary-'));
  const token = 'ghp_123456789012345678901234567890123456';
  writeFileSync(path.join(root, 'invalid-before-token.bin'), Buffer.concat([Buffer.from([0xff]), Buffer.from(`\n${token}\n`)]));
  writeFileSync(path.join(root, 'small-key.bin'), Buffer.concat([Buffer.from([0]), Buffer.from('-----BEGIN PRIVATE KEY-----\n')]));
  writeFileSync(path.join(root, 'boundary.bin'), Buffer.concat([Buffer.alloc(64 * 1024 - 5, 0x20), Buffer.from(`${token}\n`)]));
  const report = await scanIntegrity(root, {repository: 'zdoc'});
  assert.ok(report.findings.some(item => item.path === 'invalid-before-token.bin' && item.rule === 'secret.token-marker'));
  assert.ok(report.findings.some(item => item.path === 'small-key.bin' && item.rule === 'secret.private-key-marker'));
  assert.ok(report.findings.some(item => item.path === 'boundary.bin' && item.rule === 'secret.token-marker'));
  assert.ok(!report.findings.some(item => item.path === 'small-key.bin' && item.rule === 'secret.large-binary-quarantine'));
});

test('scans critical markers beyond the size limit and CLI exits 2', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'integrity-large-'));
  const large = `${'x'.repeat(4096)}\nghp_123456789012345678901234567890123456\n-----BEGIN PRIVATE KEY-----\n`;
  writeFileSync(path.join(root, 'large.txt'), large);
  const report = await scanIntegrity(root, {repository: 'zdoc', maxFileSize: 32});
  assert.ok(report.findings.some(item => item.rule === 'secret.token-marker' && item.severity === 'critical'));
  assert.ok(report.findings.some(item => item.rule === 'secret.private-key-marker' && item.severity === 'critical'));
  const reportPath = path.join(root, 'report.json');
  const allowlistPath = path.join(root, 'allowlist.json'); writeFileSync(allowlistPath, '{"exceptions":[]}\n');
  const cli = spawnSync(process.execPath, [path.resolve('scripts/migration/integrity.mjs'), '--root', root, '--repository', 'zdoc', '--report', reportPath, '--allowlist', allowlistPath, '--max-file-size', '32'], {encoding: 'utf8'});
  assert.equal(cli.status, 2); assert.ok(JSON.parse(readFileSync(reportPath)).findings.some(item => item.rule === 'secret.token-marker'));
});

test('allowlist is scoped by repository and expected content hash', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'integrity-allow-'));
  symlinkSync('target', path.join(root, 'link'));
  const hash = digest('target');
  const exception = {sourceRepository: 'zdoc_cn', rule: 'symlink.unapproved', path: 'link', expectedSha256: hash, owner: 'tooling', reason: 'Reviewed fixture'};
  const cn = await scanIntegrity(root, {repository: 'zdoc_cn', allowlist: [exception]});
  assert.equal(cn.findings.find(item => item.rule === 'symlink.unapproved').status, 'allowed');
  const en = await scanIntegrity(root, {repository: 'zdoc', allowlist: [exception]});
  assert.equal(en.findings.find(item => item.rule === 'symlink.unapproved').status, 'unreviewed');
  const changed = await scanIntegrity(root, {repository: 'zdoc_cn', allowlist: [{...exception, expectedSha256: '0'.repeat(64)}]});
  assert.equal(changed.findings.find(item => item.rule === 'symlink.unapproved').status, 'unreviewed');
  assert.ok(changed.findings.some(item => item.rule === 'allowlist.stale-exception' && item.severity === 'critical'));
  await assert.rejects(() => scanIntegrity(root, {repository: 'zdoc_cn', allowlist: [{rule: 'symlink.unapproved', path: 'link'}]}), /sourceRepository/);
});

test('CLI loads a validated repository scan config and fails clearly when it is missing', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'integrity-config-'));
  mkdirSync(path.join(root, 'docs'), {recursive: true});
  writeFileSync(path.join(root, 'docs/index.md'), '[route](/docs/start) [hazard](/opt/private.pem)\n');
  const reportPath = path.join(root, 'report.json');
  const allowlistPath = path.join(root, 'allowlist.json');
  const configPath = path.join(root, 'scan-config.json');
  writeFileSync(allowlistPath, '{"exceptions":[]}\n');
  writeFileSync(configPath, `${JSON.stringify({schemaVersion: 1, repositories: [{id: 'zdoc', contentRoots: ['docs'], allowedRoutePrefixes: ['/docs'], allowedExactRoutes: ['/']}]})}\n`);
  const command = [path.resolve('scripts/migration/integrity.mjs'), '--root', root, '--repository', 'zdoc', '--report', reportPath, '--allowlist', allowlistPath];
  const configured = spawnSync(process.execPath, [...command, '--scan-config', configPath], {encoding: 'utf8'});
  assert.equal(configured.status, 0, configured.stderr);
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  assert.deepEqual(report.policy.contentRoots, ['docs']);
  assert.deepEqual(report.policy.routePolicy.allowedRoutePrefixes, ['/docs']);
  assert.ok(report.findings.some(item => item.normalizedTarget === '/opt/private.pem'));
  assert.ok(!report.findings.some(item => item.normalizedTarget === '/docs/start'));

  const missing = spawnSync(process.execPath, [...command, '--scan-config', path.join(root, 'missing.json')], {encoding: 'utf8'});
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /scan config.*not found/i);

  const invalidConfigPath = path.join(root, 'invalid-scan-config.json');
  writeFileSync(invalidConfigPath, '{"schemaVersion":1,"repositories":[{"id":"zdoc","contentRoots":["docs"],"allowedRoutePrefixes":["/docs"]}]}\n');
  const invalid = spawnSync(process.execPath, [...command, '--scan-config', invalidConfigPath], {encoding: 'utf8'});
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /must contain exactly.*allowedExactRoutes/i);
});
