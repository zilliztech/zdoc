'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {execFileSync} = require('node:child_process');

const {
  bootstrapStatus,
  inspectSync,
  loadContract,
  pathMatches,
  verifySyncCandidate,
} = require('./master-tooling-sync');

const repositoryRoot = path.resolve(__dirname, '../..');
const contract = loadContract({cwd: repositoryRoot});

function git(cwd, ...args) {
  return execFileSync('git', args, {cwd, encoding: 'utf8'}).trim();
}

function write(root, relative, contents) {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, contents);
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zdoc-master-tooling-sync-'));
  git(root, 'init', '-q');
  git(root, 'config', 'user.name', 'Test');
  git(root, 'config', 'user.email', 'test@example.com');
  write(root, 'scripts/tool.js', 'base\n');
  write(root, 'content/en/page.md', 'base\n');
  write(root, 'config/reference-retirements.json', '{"schemaVersion":1}\n');
  write(root, 'deploy/contracts/master-tooling-sync.json', JSON.stringify(contract));
  git(root, 'add', '.');
  git(root, 'commit', '-qm', 'base');
  const base = git(root, 'rev-parse', 'HEAD');
  git(root, 'branch', 'dev');
  return {root, base};
}

function commit(root, branch, relative, contents, message) {
  git(root, 'switch', '-q', branch);
  write(root, relative, contents);
  git(root, 'add', relative);
  git(root, 'commit', '-qm', message);
  return git(root, 'rev-parse', 'HEAD');
}

test('matches repository roots without matching sibling prefixes', () => {
  assert.equal(pathMatches('content/en/page.md', 'content'), true);
  assert.equal(pathMatches('content-other/page.md', 'content'), false);
  assert.equal(pathMatches('config/reference-retirements.json', 'config/reference-retirements.json'), true);
});

test('accepts a normal tooling merge while preserving dev content byte-for-byte', () => {
  const {root} = fixture();
  const dev = commit(root, 'dev', 'content/en/page.md', 'dev content\n', 'publish content');
  const tooling = commit(root, 'master', 'scripts/tool.js', 'new tooling\n', 'update tooling');
  git(root, 'switch', '-q', 'dev');
  git(root, 'merge', '-q', '--no-ff', '-m', 'merge tooling', tooling);
  const candidate = git(root, 'rev-parse', 'HEAD');
  const inspected = inspectSync({cwd: root, devSha: dev, toolingSha: tooling, contract});
  assert.equal(inspected.needsSync, true);
  assert.deepEqual(inspected.toolingChanges, ['scripts/tool.js']);
  const verified = verifySyncCandidate({cwd: root, devSha: dev, toolingSha: tooling, candidateSha: candidate, contract});
  assert.deepEqual(verified.changedDevOwned, []);
  assert.deepEqual(verified.changedToolingOwned, []);
  assert.equal(fs.readFileSync(path.join(root, 'content/en/page.md'), 'utf8'), 'dev content\n');
});

test('rejects master history that modifies dev-owned content', () => {
  const {root, base} = fixture();
  const tooling = commit(root, 'master', 'content/en/page.md', 'wrong owner\n', 'modify content from master');
  assert.throws(
    () => inspectSync({cwd: root, devSha: base, toolingSha: tooling, contract}),
    /modifies dev-owned paths: content\/en\/page\.md/,
  );
});

test('rejects merge resolutions that change dev-owned content or retain dev tooling', () => {
  const first = fixture();
  const dev = commit(first.root, 'dev', 'content/en/page.md', 'dev content\n', 'publish content');
  const tooling = commit(first.root, 'master', 'scripts/tool.js', 'master tooling\n', 'update tooling');
  git(first.root, 'switch', '-q', 'dev');
  git(first.root, 'merge', '-q', '--no-ff', '-m', 'merge tooling', tooling);
  write(first.root, 'content/en/page.md', 'mutated candidate\n');
  git(first.root, 'add', '.');
  git(first.root, 'commit', '-qm', 'bad content resolution');
  assert.throws(
    () => verifySyncCandidate({cwd: first.root, devSha: dev, toolingSha: tooling, candidateSha: git(first.root, 'rev-parse', 'HEAD'), contract}),
    /changes dev-owned paths/,
  );

  const second = fixture();
  const secondDev = commit(second.root, 'dev', 'scripts/tool.js', 'dev tooling\n', 'diverge tooling');
  const secondTooling = commit(second.root, 'master', 'config/reference-retirements.json', '{"schemaVersion":2}\n', 'update retirements');
  git(second.root, 'switch', '-q', 'dev');
  git(second.root, 'merge', '-q', '--no-ff', '-m', 'merge tooling', secondTooling);
  assert.throws(
    () => verifySyncCandidate({cwd: second.root, devSha: secondDev, toolingSha: secondTooling, candidateSha: git(second.root, 'rev-parse', 'HEAD'), contract}),
    /does not match master outside dev-owned paths: scripts\/tool\.js/,
  );
});

test('treats the retirement registry as master-authoritative and requires bootstrap on dev', () => {
  const {root, base} = fixture();
  assert.equal(bootstrapStatus({cwd: root, devSha: base, contract}).bootstrapped, true);
  git(root, 'switch', '-q', 'dev');
  git(root, 'rm', '-q', 'deploy/contracts/master-tooling-sync.json');
  git(root, 'commit', '-qm', 'pre-bootstrap dev');
  assert.equal(bootstrapStatus({cwd: root, devSha: git(root, 'rev-parse', 'HEAD'), contract}).bootstrapped, false);
  const tooling = commit(root, 'master', 'config/reference-retirements.json', '{"schemaVersion":2}\n', 'update retirements');
  const inspected = inspectSync({cwd: root, devSha: base, toolingSha: tooling, contract});
  assert.deepEqual(inspected.toolingChanges, ['config/reference-retirements.json']);
});
