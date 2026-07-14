'use strict';

const assert = require('node:assert/strict');
const { execFileSync, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const creator = path.join(__dirname, 'create-checkpoint-artifact.js');
const publisher = path.join(__dirname, 'publish-checkpoint.sh');
function git(cwd, ...args) { return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim(); }
function assertGitObjectMissing(cwd, object) {
  const result = spawnSync('git', ['cat-file', '-e', object], { cwd, encoding: 'utf8' });
  assert.notEqual(result.status, 0);
}
function put(root, rel, value) { const file = path.join(root, rel); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, value); }
function copy(from, to) { fs.cpSync(from, to, { recursive: true }); }
function setup() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'checkpoint-contention-'));
  const remote = path.join(root, 'remote.git'), seed = path.join(root, 'seed');
  git(root, 'init', '--bare', remote); git(root, 'init', seed);
  git(seed, 'config', 'user.name', 'Test'); git(seed, 'config', 'user.email', 'test@example.com');
  return { root, remote, seed };
}
function commitSeed(s) {
  git(s.seed, 'add', '.'); git(s.seed, 'commit', '-m', 'baseline'); git(s.seed, 'branch', '-M', 'dev');
  git(s.seed, 'remote', 'add', 'origin', s.remote); git(s.seed, 'push', '-u', 'origin', 'dev');
  return git(s.seed, 'rev-parse', 'HEAD');
}
function artifact(s, group, baseline, workspace, translation = false) {
  const output = path.join(s.root, `artifact-${group}-${Math.random()}`);
  const args = [creator, '--group', group, '--master-sha', '1'.repeat(40), '--dev-baseline-sha', git(baseline, 'rev-parse', 'HEAD'), '--baseline-dir', baseline, '--workspace', workspace, '--output', output];
  if (translation) args.push('--include-translation-cache');
  execFileSync(process.execPath, args);
  return output;
}
function publish(s, artifactDir, baseline) {
  const args = [publisher, '--artifact', artifactDir, '--branch', 'dev', '--message', 'publish checkpoint', '--max-attempts', '3', '--validate-command', 'true'];
  if (baseline) args.push('--baseline-dir', baseline);
  return spawnSync('bash', args, { cwd: s.seed, encoding: 'utf8' });
}

test('sequential stale Python and Java source artifacts preserve remote and each other', () => {
  const s = setup();
  try {
    put(s.seed, 'reference/api/python/python/keep.md', 'python old\n'); put(s.seed, 'reference/api/python/python/delete.md', 'delete\n');
    put(s.seed, 'reference/api/java/java/v2/keep.md', 'java old\n'); put(s.seed, 'reference/api/java/java/v2/delete.md', 'delete\n');
    put(s.seed, 'config/generated/python.sidebar.js', 'python old sidebar\n'); put(s.seed, 'config/generated/java.sidebar.js', 'java old sidebar\n');
    put(s.seed, 'plugins/lark-docs/meta/snapshots/pymilvus30-uat-last-success.json', '{"old":true}\n');
    put(s.seed, 'plugins/lark-docs/meta/snapshots/javaV230-uat-last-success.json', '{"old":true}\n');
    put(s.seed, 'docs/unrelated.md', 'guide old\n');
    const baselineSha = commitSeed(s), baseline = path.join(s.root, 'baseline'), python = path.join(s.root, 'python'), java = path.join(s.root, 'java');
    copy(s.seed, baseline); copy(s.seed, python); copy(s.seed, java);
    put(python, 'reference/api/python/python/keep.md', 'python new\n'); fs.unlinkSync(path.join(python, 'reference/api/python/python/delete.md'));
    put(python, 'config/generated/python.sidebar.js', 'python new sidebar\n'); put(python, 'plugins/lark-docs/meta/snapshots/pymilvus30-uat-last-success.json', '{"python":true}\n');
    put(java, 'reference/api/java/java/v2/keep.md', 'java new\n'); fs.unlinkSync(path.join(java, 'reference/api/java/java/v2/delete.md'));
    put(java, 'config/generated/java.sidebar.js', 'java new sidebar\n'); put(java, 'plugins/lark-docs/meta/snapshots/javaV230-uat-last-success.json', '{"java":true}\n');
    const pythonArtifact = artifact(s, 'python', baseline, python), javaArtifact = artifact(s, 'java', baseline, java);
    put(s.seed, 'docs/unrelated.md', 'guide remote\n'); git(s.seed, 'add', '.'); git(s.seed, 'commit', '-m', 'remote guide'); git(s.seed, 'push', 'origin', 'dev');
    const remoteGuideSha = git(s.seed, 'rev-parse', 'HEAD');
    for (const a of [pythonArtifact, javaArtifact]) { const result = publish(s, a); assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`); }
    git(s.seed, 'fetch', 'origin', 'dev');
    assert.equal(git(s.seed, 'show', 'origin/dev:docs/unrelated.md'), 'guide remote');
    assert.equal(git(s.seed, 'show', 'origin/dev:reference/api/python/python/keep.md'), 'python new');
    assert.equal(git(s.seed, 'show', 'origin/dev:reference/api/java/java/v2/keep.md'), 'java new');
    assertGitObjectMissing(s.seed, 'origin/dev:reference/api/python/python/delete.md');
    assertGitObjectMissing(s.seed, 'origin/dev:reference/api/java/java/v2/delete.md');
    assert.equal(git(s.seed, 'show', 'origin/dev:config/generated/python.sidebar.js'), 'python new sidebar');
    assert.equal(git(s.seed, 'show', 'origin/dev:config/generated/java.sidebar.js'), 'java new sidebar');
    assert.equal(git(s.seed, 'show', 'origin/dev:plugins/lark-docs/meta/snapshots/pymilvus30-uat-last-success.json'), '{"python":true}');
    assert.equal(git(s.seed, 'show', 'origin/dev:plugins/lark-docs/meta/snapshots/javaV230-uat-last-success.json'), '{"java":true}');
    const commits = git(s.seed, 'rev-list', '--first-parent', 'origin/dev', `^${baselineSha}`).split('\n');
    assert.equal(commits.length, 3); assert.equal(git(s.seed, 'rev-parse', `${commits[1]}^`), remoteGuideSha); assert.equal(git(s.seed, 'rev-parse', `${commits[0]}^`), commits[1]);
  } finally { fs.rmSync(s.root, { recursive: true, force: true }); }
});

test('translation cache three-way merges disjoint stale artifacts and rejects a same-key conflict', () => {
  const s = setup();
  try {
    put(s.seed, '.translation-cache/ja-JP.json', JSON.stringify({ files: { shared: 'base', python: 'base', java: 'base', remote: 'base' } }) + '\n');
    put(s.seed, 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/python/python/page.md', 'python old\n');
    put(s.seed, 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/java/java/v2/page.md', 'java old\n');
    commitSeed(s);
    const baseline = path.join(s.root, 'baseline'), python = path.join(s.root, 'python'), java = path.join(s.root, 'java'); copy(s.seed, baseline); copy(s.seed, python); copy(s.seed, java);
    put(python, '.translation-cache/ja-JP.json', JSON.stringify({ files: { shared: 'base', python: 'new', java: 'base', remote: 'base' } }) + '\n');
    put(python, 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/python/python/page.md', 'python new\n');
    put(java, '.translation-cache/ja-JP.json', JSON.stringify({ files: { shared: 'base', python: 'base', java: 'new', remote: 'base' } }) + '\n');
    put(java, 'i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/java/java/v2/page.md', 'java new\n');
    const pa = artifact(s, 'python', baseline, python, true), ja = artifact(s, 'java', baseline, java, true);
    put(s.seed, '.translation-cache/ja-JP.json', JSON.stringify({ files: { shared: 'base', python: 'base', java: 'base', remote: 'remote-new' } }) + '\n'); git(s.seed, 'add', '.'); git(s.seed, 'commit', '-m', 'remote cache'); git(s.seed, 'push', 'origin', 'dev');
    for (const a of [pa, ja]) { const result = publish(s, a, baseline); assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`); }
    git(s.seed, 'fetch', 'origin', 'dev');
    assert.deepEqual(JSON.parse(git(s.seed, 'show', 'origin/dev:.translation-cache/ja-JP.json')), { files: { shared: 'base', python: 'new', java: 'new', remote: 'remote-new' } });
    assert.equal(git(s.seed, 'show', 'origin/dev:i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/python/python/page.md'), 'python new');
    assert.equal(git(s.seed, 'show', 'origin/dev:i18n/ja-JP/docusaurus-plugin-content-docs-reference/current/api/java/java/v2/page.md'), 'java new');
    const conflictWork = path.join(s.root, 'conflict'); copy(baseline, conflictWork);
    put(conflictWork, '.translation-cache/ja-JP.json', JSON.stringify({ files: { shared: 'second', python: 'base', java: 'base', remote: 'base' } }) + '\n');
    const conflict = artifact(s, 'python', baseline, conflictWork, true), firstTip = git(s.remote, 'rev-parse', 'refs/heads/dev');
    const firstWork = path.join(s.root, 'first'); copy(s.seed, firstWork); put(firstWork, '.translation-cache/ja-JP.json', JSON.stringify({ files: { shared: 'first', python: 'new', java: 'new', remote: 'remote-new' } }) + '\n');
    const currentBase = path.join(s.root, 'current-base'); copy(s.seed, currentBase); const first = artifact(s, 'python', currentBase, firstWork, true);
    let result = publish(s, first, currentBase); assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    const afterFirst = git(s.remote, 'rev-parse', 'refs/heads/dev'); assert.notEqual(afterFirst, firstTip);
    result = publish(s, conflict, baseline); assert.notEqual(result.status, 0); assert.equal(git(s.remote, 'rev-parse', 'refs/heads/dev'), afterFirst);
    assert.equal(JSON.parse(git(s.remote, 'show', 'refs/heads/dev:.translation-cache/ja-JP.json')).files.shared, 'first');
  } finally { fs.rmSync(s.root, { recursive: true, force: true }); }
});
