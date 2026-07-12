'use strict';

const assert = require('node:assert/strict');
const { execFileSync, spawnSync } = require('node:child_process');
const { mkdtempSync, mkdirSync, writeFileSync, readFileSync } = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const script = path.join(__dirname, 'publish-checkpoint.sh');
function git(cwd, ...args) { return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim(); }
function setup() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'publish-checkpoint-'));
  const remote = path.join(root, 'remote.git'), seed = path.join(root, 'seed');
  git(root, 'init', '--bare', remote); git(root, 'init', seed);
  git(seed, 'config', 'user.name', 'Test'); git(seed, 'config', 'user.email', 'test@example.com');
  mkdirSync(path.join(seed, 'docs')); writeFileSync(path.join(seed, 'docs', 'a.md'), 'old\n');
  git(seed, 'add', '.'); git(seed, 'commit', '-m', 'seed'); git(seed, 'branch', '-M', 'dev'); git(seed, 'remote', 'add', 'origin', remote); git(seed, 'push', '-u', 'origin', 'dev');
  return { root, remote, seed };
}
function artifact(root, baseline, workspace, extra = []) {
  const out = path.join(root, `artifact-${Date.now()}-${Math.random()}`);
  execFileSync(process.execPath, [path.join(__dirname, 'create-checkpoint-artifact.js'), '--group', 'guides', '--master-sha', '1'.repeat(40), '--dev-baseline-sha', git(baseline, 'rev-parse', 'HEAD'), '--baseline-dir', baseline, '--workspace', workspace, '--output', out, ...extra]);
  return out;
}
function publish(cwd, args, env = {}) { return spawnSync('bash', [script, ...args], { cwd, encoding: 'utf8', env: { ...process.env, ...env } }); }
function args(a) { return ['--artifact', a, '--branch', 'dev', '--message', 'publish docs', '--max-attempts', '3', '--validate-command', 'test -f docs/a.md']; }

test('publishes a fast-forward checkpoint with the prior tip as parent', () => {
  const s = setup(), work = path.join(s.root, 'work'); execFileSync('cp', ['-R', s.seed, work]); writeFileSync(path.join(work, 'docs/a.md'), 'new\n');
  const prior = git(s.seed, 'rev-parse', 'HEAD'), a = artifact(s.root, s.seed, work), r = publish(s.seed, args(a));
  assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /status=published/);
  git(s.seed, 'fetch', 'origin', 'dev'); const tip = git(s.seed, 'rev-parse', 'origin/dev');
  assert.equal(git(s.seed, 'rev-parse', `${tip}^`), prior); assert.equal(git(s.seed, 'show', `${tip}:docs/a.md`), 'new');
});

test('strictly rejects invalid arguments and contains no force push', () => {
  for (const bad of [[], ['--artifact','x','--artifact','y'], args('x').flatMap(x => x === 'dev' ? ['--branch','-bad'] : [x]), [...args('x'),'extra'], [...args('x'),'--max-attempts','0']]) assert.notEqual(publish(process.cwd(), bad).status, 0);
  assert.doesNotMatch(readFileSync(script, 'utf8'), /git push[^\n]*(--force|-f\b|force-with-lease)/);
});

test('publishes owned deletions', () => {
  const s = setup(), work = path.join(s.root, 'work'); execFileSync('cp', ['-R', s.seed, work]); require('node:fs').unlinkSync(path.join(work, 'docs/a.md'));
  const publishArgs = args(artifact(s.root, s.seed, work)); publishArgs[publishArgs.indexOf('test -f docs/a.md')] = 'true';
  const r = publish(s.seed, publishArgs); assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`);
  git(s.seed, 'fetch', 'origin', 'dev'); assert.throws(() => git(s.seed, 'show', 'origin/dev:docs/a.md'));
});

test('returns no_changes without creating a commit', () => {
  const s = setup(), before = git(s.seed, 'rev-parse', 'HEAD'), r = publish(s.seed, args(artifact(s.root, s.seed, s.seed)));
  assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /status=no_changes/); git(s.seed, 'fetch', 'origin', 'dev'); assert.equal(git(s.seed, 'rev-parse', 'origin/dev'), before);
});

test('validation failure does not push', () => {
  const s = setup(), work = path.join(s.root, 'work'); execFileSync('cp', ['-R', s.seed, work]); writeFileSync(path.join(work, 'docs/a.md'), 'new\n');
  const before = git(s.seed, 'rev-parse', 'HEAD'), bad = args(artifact(s.root, s.seed, work)); bad[bad.indexOf('test -f docs/a.md')] = 'exit 7';
  const r = publish(s.seed, bad); assert.notEqual(r.status, 0); assert.equal(git(s.remote, 'rev-parse', 'refs/heads/dev'), before);
});

test('retries a non-fast-forward race and preserves the remote move', () => {
  const s = setup(), work = path.join(s.root, 'work'); execFileSync('cp', ['-R', s.seed, work]); writeFileSync(path.join(work, 'docs/a.md'), 'new\n');
  const hook = `if test ! -f '${s.root}/moved'; then touch '${s.root}/moved'; git -C '${s.seed}' reset --hard origin/dev; echo remote > '${s.seed}/remote.txt'; git -C '${s.seed}' add remote.txt; git -C '${s.seed}' commit -m remote; git -C '${s.seed}' push origin dev; fi`;
  const r = publish(s.seed, args(artifact(s.root, s.seed, work)), { NODE_ENV: 'test', DOCS_PUBLISH_BEFORE_PUSH_HOOK: hook }); assert.equal(r.status, 0, r.stderr);
  git(s.seed, 'fetch', 'origin', 'dev'); assert.equal(git(s.seed, 'show', 'origin/dev:remote.txt'), 'remote'); assert.equal(git(s.seed, 'show', 'origin/dev:docs/a.md'), 'new');
});
