'use strict';

const assert = require('node:assert/strict');
const { execFileSync, spawnSync, spawn } = require('node:child_process');
const { mkdtempSync, mkdirSync, writeFileSync, readFileSync, chmodSync, readdirSync, realpathSync } = require('node:fs');
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
function repeatedDeletionScenario() {
  const fixture = setup();
  const baseline = path.join(fixture.root, 'baseline');
  const batchOne = path.join(fixture.root, 'batch-one');
  const batchTwo = path.join(fixture.root, 'batch-two');
  execFileSync('cp', ['-R', fixture.seed, baseline]);
  execFileSync('cp', ['-R', fixture.seed, batchOne]);
  execFileSync('cp', ['-R', fixture.seed, batchTwo]);
  require('node:fs').unlinkSync(path.join(batchOne, 'docs/a.md'));
  require('node:fs').unlinkSync(path.join(batchTwo, 'docs/a.md'));
  writeFileSync(path.join(batchTwo, 'docs/batch-two.md'), 'translated\n');
  const batchOneArtifact = artifact(fixture.root, baseline, batchOne);
  const batchTwoArtifact = artifact(fixture.root, baseline, batchTwo);

  const firstArgs = args(batchOneArtifact);
  firstArgs[firstArgs.indexOf('test -f docs/a.md')] = 'test ! -e docs/a.md';
  const first = publish(fixture.seed, firstArgs);
  assert.equal(first.status, 0, `${first.stdout}\n${first.stderr}`);

  const secondArgs = args(batchTwoArtifact);
  secondArgs[secondArgs.indexOf('test -f docs/a.md')] = 'test ! -e docs/a.md && test -f docs/batch-two.md';
  const second = publish(fixture.seed, secondArgs);
  return { fixture, batchTwoArtifact, secondArgs, second };
}
function gitWrapper(root, mode, moveRepo) {
  const bin = path.join(root, 'bin'); mkdirSync(bin); const wrapper = path.join(bin, 'git');
  writeFileSync(wrapper, `#!/usr/bin/env bash\nset -eu\nif [[ " $* " == *" push "* ]]; then\n  echo push >> "$WRAPPER_LOG"\n  n=$(wc -l < "$WRAPPER_LOG" | tr -d ' ')\n  if [[ "$WRAPPER_MODE" == reject ]]; then echo 'remote: permission denied' >&2; exit 1; fi\n  if [[ "$WRAPPER_MODE" == race-once && "$n" == 1 || "$WRAPPER_MODE" == race-always ]]; then\n    "$REAL_GIT" -C "$MOVE_REPO" fetch origin dev >/dev/null 2>&1\n    "$REAL_GIT" -C "$MOVE_REPO" reset --hard origin/dev >/dev/null\n    echo "$n" >> "$MOVE_REPO/remote.txt"\n    "$REAL_GIT" -C "$MOVE_REPO" add remote.txt\n    "$REAL_GIT" -C "$MOVE_REPO" commit -m "remote move $n" >/dev/null\n    "$REAL_GIT" -C "$MOVE_REPO" push origin dev >/dev/null\n  fi\nfi\nexec "$REAL_GIT" "$@"\n`); chmodSync(wrapper, 0o755);
  const log = path.join(root, 'push.log'); writeFileSync(log, '');
  return { PATH: `${bin}:${process.env.PATH}`, REAL_GIT: execFileSync('which', ['git'], { encoding: 'utf8' }).trim(), WRAPPER_MODE: mode, WRAPPER_LOG: log, MOVE_REPO: moveRepo, log };
}

test('publishes a fast-forward checkpoint with the prior tip as parent', () => {
  const s = setup(), work = path.join(s.root, 'work'); execFileSync('cp', ['-R', s.seed, work]); writeFileSync(path.join(work, 'docs/a.md'), 'new\n');
  const prior = git(s.seed, 'rev-parse', 'HEAD'), a = artifact(s.root, s.seed, work), r = publish(s.seed, args(a));
  assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /status=published/);
  git(s.seed, 'fetch', 'origin', 'dev'); const tip = git(s.seed, 'rev-parse', 'origin/dev');
  assert.equal(git(s.seed, 'rev-parse', `${tip}^`), prior); assert.equal(git(s.seed, 'show', `${tip}:docs/a.md`), 'new');
});

test('strictly rejects invalid arguments and contains no force push', () => {
  for (const bad of [[], ['--artifact','x','--artifact','y'], args('x').flatMap(x => x === 'dev' ? ['--branch','-bad'] : [x]), [...args('x'),'extra'], [...args('x'),'--max-attempts','0'], [...args('x'),'--max-attempts','11'], [...args('x'),'--max-attempts','x'], [...args('x'),'--remote','--upload-pack'], ['--help','x']]) assert.notEqual(publish(process.cwd(), bad).status, 0);
  const help = publish(process.cwd(), ['--help']); assert.equal(help.status, 0); assert.match(help.stdout, /Usage:/);
  assert.doesNotMatch(readFileSync(script, 'utf8'), /git push[^\n]*(--force|-f\b|force-with-lease)/);
  assert.doesNotMatch(readFileSync(script, 'utf8'), /DOCS_PUBLISH_BEFORE_PUSH_HOOK|NODE_ENV/);
});

test('preserves an unrelated commit already on the remote', () => {
  const s = setup(), base = path.join(s.root, 'base'), work = path.join(s.root, 'work'); execFileSync('cp', ['-R', s.seed, base]); execFileSync('cp', ['-R', s.seed, work]); writeFileSync(path.join(work, 'docs/a.md'), 'new\n');
  writeFileSync(path.join(s.seed, 'remote.txt'), 'keep\n'); git(s.seed, 'add', 'remote.txt'); git(s.seed, 'commit', '-m', 'remote unrelated'); git(s.seed, 'push', 'origin', 'dev');
  const r = publish(s.seed, args(artifact(s.root, base, work))); assert.equal(r.status, 0, r.stderr); git(s.seed, 'fetch', 'origin', 'dev'); assert.equal(git(s.seed, 'show', 'origin/dev:remote.txt'), 'keep'); assert.equal(git(s.seed, 'show', 'origin/dev:docs/a.md'), 'new');
});

test('every failure emits exactly one failed status and empty commit SHA', () => {
  const r = publish(process.cwd(), []);
  assert.deepEqual(r.stdout.match(/^status=.*$/gm), ['status=failed']);
  assert.match(r.stdout, /^commit_sha=$/m);
});

test('publishes owned deletions', () => {
  const s = setup(), work = path.join(s.root, 'work'); execFileSync('cp', ['-R', s.seed, work]); require('node:fs').unlinkSync(path.join(work, 'docs/a.md'));
  const publishArgs = args(artifact(s.root, s.seed, work)); publishArgs[publishArgs.indexOf('test -f docs/a.md')] = 'true';
  const r = publish(s.seed, publishArgs); assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`);
  git(s.seed, 'fetch', 'origin', 'dev'); assert.throws(() => git(s.seed, 'show', 'origin/dev:docs/a.md'));
});

test('publishes a later batch when its source deletion was already committed', () => {
  const { fixture, second } = repeatedDeletionScenario();

  assert.equal(second.status, 0, `${second.stdout}\n${second.stderr}`);
  assert.match(second.stdout, /status=published/);
  git(fixture.seed, 'fetch', 'origin', 'dev');
  assert.equal(git(fixture.seed, 'show', 'origin/dev:docs/batch-two.md'), 'translated');
  assert.throws(() => git(fixture.seed, 'show', 'origin/dev:docs/a.md'));
});

test('reapplying a batch with an already-applied deletion returns no_changes', () => {
  const { fixture, second, secondArgs } = repeatedDeletionScenario();
  assert.equal(second.status, 0, `${second.stdout}\n${second.stderr}`);
  git(fixture.seed, 'fetch', 'origin', 'dev');
  const before = git(fixture.seed, 'rev-parse', 'origin/dev');

  const replay = publish(fixture.seed, secondArgs);

  assert.equal(replay.status, 0, `${replay.stdout}\n${replay.stderr}`);
  assert.match(replay.stdout, /status=no_changes/);
  assert.match(replay.stdout, new RegExp(`commit_sha=${before}`));
});

test('returns no_changes without creating a commit', () => {
  const s = setup(), before = git(s.seed, 'rev-parse', 'HEAD'), r = publish(s.seed, args(artifact(s.root, s.seed, s.seed)));
  assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /status=no_changes/); git(s.seed, 'fetch', 'origin', 'dev'); assert.equal(git(s.seed, 'rev-parse', 'origin/dev'), before);
});

test('validation failure does not push', () => {
  const s = setup(), work = path.join(s.root, 'work'); execFileSync('cp', ['-R', s.seed, work]); writeFileSync(path.join(work, 'docs/a.md'), 'new\n');
  const before = git(s.seed, 'rev-parse', 'HEAD'), bad = args(artifact(s.root, s.seed, work)); bad[bad.indexOf('test -f docs/a.md')] = 'exit 7';
  const env = gitWrapper(s.root, 'pass', s.seed), r = publish(s.seed, bad, env); assert.notEqual(r.status, 0); assert.equal(git(s.remote, 'rev-parse', 'refs/heads/dev'), before); assert.equal(readFileSync(env.log, 'utf8'), '');
});

test('validation worktree can use dependencies installed in the publisher checkout', () => {
  const s = setup(), work = path.join(s.root, 'work');
  mkdirSync(path.join(s.seed, 'node_modules', '.bin'), { recursive: true });
  writeFileSync(path.join(s.seed, 'node_modules', '.bin', 'docusaurus'), '#!/usr/bin/env bash\nexit 0\n');
  chmodSync(path.join(s.seed, 'node_modules', '.bin', 'docusaurus'), 0o755);
  execFileSync('cp', ['-R', s.seed, work]);
  writeFileSync(path.join(work, 'docs/a.md'), 'new\n');
  const publishArgs = args(artifact(s.root, s.seed, work));
  publishArgs[publishArgs.indexOf('test -f docs/a.md')] = 'test -x node_modules/.bin/docusaurus';

  const result = publish(s.seed, publishArgs);

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /status=published/);
});

test('checksum failure happens before fetch or push', () => {
  const s = setup(), work = path.join(s.root, 'work'); execFileSync('cp', ['-R', s.seed, work]); writeFileSync(path.join(work, 'docs/a.md'), 'new\n'); const a = artifact(s.root, s.seed, work);
  writeFileSync(path.join(realpathSync(a), 'payload/docs/a.md'), 'tampered\n'); const env = gitWrapper(s.root, 'pass', s.seed), r = publish(s.seed, args(a), env);
  assert.notEqual(r.status, 0); assert.match(r.stdout, /status=failed/); assert.equal(readFileSync(env.log, 'utf8'), '');
});

test('non-NFF push rejection is not retried', () => {
  const s = setup(), work = path.join(s.root, 'work'); execFileSync('cp', ['-R', s.seed, work]); writeFileSync(path.join(work, 'docs/a.md'), 'new\n'); const env = gitWrapper(s.root, 'reject', s.seed), r = publish(s.seed, args(artifact(s.root, s.seed, work)), env);
  assert.notEqual(r.status, 0); assert.equal(readFileSync(env.log, 'utf8').trim().split('\n').length, 1); assert.match(r.stdout, /status=failed/);
});

test('repeated remote moves exhaust max attempts', () => {
  const s = setup(), work = path.join(s.root, 'work'); execFileSync('cp', ['-R', s.seed, work]); writeFileSync(path.join(work, 'docs/a.md'), 'new\n'); const env = gitWrapper(s.root, 'race-always', s.seed), a = args(artifact(s.root, s.seed, work)); a[a.indexOf('3')] = '2';
  const r = publish(s.seed, a, env); assert.notEqual(r.status, 0); assert.equal(readFileSync(env.log, 'utf8').trim().split('\n').length, 2); assert.deepEqual(r.stdout.match(/^status=.*$/gm), ['status=failed']);
});

test('cleans temporary worktrees and scratch files after success and failure', () => {
  for (const fail of [false, true]) { const s = setup(), temp = path.join(s.root, 'runner'); mkdirSync(temp); const work = path.join(s.root, 'work'); execFileSync('cp', ['-R', s.seed, work]); writeFileSync(path.join(work, 'docs/a.md'), 'new\n'); const a = args(artifact(s.root, s.seed, work)); if (fail) a[a.indexOf('test -f docs/a.md')] = 'false'; const r = publish(s.seed, a, { RUNNER_TEMP: temp }); assert.equal(r.status === 0, !fail); assert.deepEqual(readdirSync(temp), []); assert.doesNotMatch(git(s.seed, 'worktree', 'list'), /docs-publish/); }
});

test('SIGTERM cleans the active temporary worktree', async () => {
  const s = setup(), temp = path.join(s.root, 'runner'), marker = path.join(s.root, 'validating'); mkdirSync(temp); const work = path.join(s.root, 'work'); execFileSync('cp', ['-R', s.seed, work]); writeFileSync(path.join(work, 'docs/a.md'), 'new\n');
  const a = args(artifact(s.root, s.seed, work)); a[a.indexOf('test -f docs/a.md')] = `touch '${marker}'; sleep 30`;
  const child = spawn('bash', [script, ...a], { cwd: s.seed, env: { ...process.env, RUNNER_TEMP: temp }, stdio: 'ignore', detached: true });
  for (let i = 0; i < 100 && !require('node:fs').existsSync(marker); i++) await new Promise(resolve => setTimeout(resolve, 25));
  assert.equal(require('node:fs').existsSync(marker), true); process.kill(-child.pid, 'SIGTERM'); await new Promise(resolve => child.once('exit', resolve));
  assert.deepEqual(readdirSync(temp), []); assert.doesNotMatch(git(s.seed, 'worktree', 'list'), /docs-publish/);
});

test('publishes translation cache through baseline three-way merge', () => {
  const s = setup(); mkdirSync(path.join(s.seed, '.translation-cache')); writeFileSync(path.join(s.seed, '.translation-cache/ja-JP.json'), '{"base":"v1","remote":"v1"}\n'); git(s.seed, 'add', '.translation-cache'); git(s.seed, 'commit', '-m', 'cache'); git(s.seed, 'push', 'origin', 'dev');
  const base = path.join(s.root, 'base'), work = path.join(s.root, 'work'); execFileSync('cp', ['-R', s.seed, base]); execFileSync('cp', ['-R', s.seed, work]); writeFileSync(path.join(work, '.translation-cache/ja-JP.json'), '{"base":"v2","remote":"v1"}\n');
  writeFileSync(path.join(s.seed, '.translation-cache/ja-JP.json'), '{"base":"v1","remote":"v2"}\n'); git(s.seed, 'add', '.translation-cache'); git(s.seed, 'commit', '-m', 'remote cache'); git(s.seed, 'push', 'origin', 'dev');
  const a = artifact(s.root, base, work, ['--include-translation-cache']), pa = args(a); pa.push('--baseline-dir', base); const r = publish(s.seed, pa); assert.equal(r.status, 0, r.stderr); git(s.seed, 'fetch', 'origin', 'dev'); assert.deepEqual(JSON.parse(git(s.seed, 'show', 'origin/dev:.translation-cache/ja-JP.json')), { base: 'v2', remote: 'v2' });
});

test('retries a non-fast-forward race and preserves the remote move', () => {
  const s = setup(), work = path.join(s.root, 'work'); execFileSync('cp', ['-R', s.seed, work]); writeFileSync(path.join(work, 'docs/a.md'), 'new\n');
  const env = gitWrapper(s.root, 'race-once', s.seed), r = publish(s.seed, args(artifact(s.root, s.seed, work)), env); assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`);
  git(s.seed, 'fetch', 'origin', 'dev'); assert.match(git(s.seed, 'show', 'origin/dev:remote.txt'), /1/); assert.equal(git(s.seed, 'show', 'origin/dev:docs/a.md'), 'new'); assert.equal(readFileSync(env.log, 'utf8').trim().split('\n').length, 2);
});
