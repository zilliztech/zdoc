'use strict';

const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  buildManualTranslationHandoff,
  resolvePublishedSourceUnit,
} = require('./build-manual-translation-handoff');

const GROUPS = Object.freeze(['guides', 'python', 'java', 'node', 'go', 'cli', 'cpp']);
const COMMIT_MESSAGES = Object.freeze({
  guides: 'docs(guides): publish fetched content',
  python: 'docs(python): publish SDK reference',
  java: 'docs(java): publish SDK reference',
  node: 'docs(node): publish SDK reference',
  go: 'docs(go): publish SDK reference',
  cli: 'docs(cli): publish CLI reference',
  cpp: 'docs(cpp): publish SDK reference',
});

function git(repository, ...args) {
  const result = spawnSync('git', ['-C', repository, ...args], {encoding: 'utf8'});
  if (result.status !== 0) throw new Error(result.stderr.trim() || `git ${args[0]} exited ${result.status}`);
  return result.stdout.trim();
}

// Builds a hermetic bare-remote repository whose `dev` branch carries one
// published English source commit per translatable group, plus a `master`
// tooling branch. Mirrors the real history: publish commits touch English
// source paths and carry the registry's fixed subject line.
function fixture(t, {omit = []} = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'manual-translation-handoff-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const remote = path.join(root, 'remote.git');
  const repository = path.join(root, 'repository');
  git(root, 'init', '--bare', remote);
  git(root, 'clone', remote, repository);
  git(repository, 'config', 'user.name', 'Manual Translation Test');
  git(repository, 'config', 'user.email', 'manual-translation@example.com');

  git(repository, 'switch', '-c', 'dev');
  fs.mkdirSync(path.join(repository, 'content/en'), {recursive: true});
  fs.writeFileSync(path.join(repository, 'content/en', 'base.md'), 'baseline\n');
  git(repository, 'add', 'content/en/base.md');
  git(repository, 'commit', '-m', 'baseline');

  git(repository, 'switch', '-c', 'master');
  fs.writeFileSync(path.join(repository, 'tooling.md'), 'tooling\n');
  git(repository, 'add', 'tooling.md');
  git(repository, 'commit', '-m', 'tooling baseline');
  const masterTip = git(repository, 'rev-parse', 'HEAD');
  git(repository, 'push', '-u', 'origin', 'master');

  git(repository, 'switch', 'dev');
  const publishes = {};
  for (const group of GROUPS) {
    if (omit.includes(group)) continue;
    const baseline = git(repository, 'rev-parse', 'HEAD');
    fs.writeFileSync(path.join(repository, `content/en/${group}.md`), `${group} published\n`);
    git(repository, 'add', `content/en/${group}.md`);
    git(repository, 'commit', '-m', COMMIT_MESSAGES[group], '-m', `group: ${group}\nstage: source`);
    publishes[group] = {checkpoint: git(repository, 'rev-parse', 'HEAD'), baseline};
  }
  const devTip = git(repository, 'rev-parse', 'HEAD');
  git(repository, 'push', '-u', 'origin', 'dev');
  return {root, repository, remote, masterTip, devTip, publishes};
}

test('derives a schema-v3 handoff from published dev history and self-validates', t => {
  const setup = fixture(t);
  const handoff = buildManualTranslationHandoff({
    repository: setup.repository, sourceBranch: 'dev', group: 'all', locale: 'all',
  });

  assert.equal(handoff.schemaVersion, 3);
  assert.equal(handoff.locale, 'all');
  assert.equal(handoff.group, 'all');
  assert.equal(handoff.toolingSha, setup.masterTip);
  assert.equal(handoff.targetBranch, 'dev');
  assert.equal(handoff.targetBaselineSha, setup.devTip);

  // ja-JP: guides + six SDK groups; zh-CN-reference: six SDK groups.
  const byUnit = new Map(handoff.units.map(unit => [`${unit.target}/${unit.group}`, unit]));
  assert.equal(handoff.units.length, 13);
  for (const group of GROUPS) {
    for (const target of group === 'guides' ? ['ja-JP'] : ['ja-JP', 'zh-CN-reference']) {
      const unit = byUnit.get(`${target}/${group}`);
      assert.ok(unit, `missing ${target}/${group}`);
      assert.equal(unit.sourceCheckpointSha, setup.publishes[group].checkpoint);
      assert.equal(unit.sourceBaselineSha, setup.publishes[group].baseline);
    }
  }
});

test('selects the most recent English Guides publish over a newer zh-CN publish', t => {
  const setup = fixture(t);
  // A newer zh-CN Guides publish shares the subject but must not be mistaken
  // for the English checkpoint.
  fs.mkdirSync(path.join(setup.repository, 'content/zh-CN'), {recursive: true});
  fs.writeFileSync(path.join(setup.repository, 'content/zh-CN/guides.md'), 'zh-CN guides\n');
  git(setup.repository, 'add', 'content/zh-CN/guides.md');
  git(setup.repository, 'commit', '-m', COMMIT_MESSAGES.guides, '-m', 'group: guides\nstage: source');
  const zhTip = git(setup.repository, 'rev-parse', 'HEAD');
  git(setup.repository, 'push', 'origin', 'dev');

  const resolved = resolvePublishedSourceUnit(setup.repository, 'guides', zhTip);
  assert.equal(resolved.sourceCheckpointSha, setup.publishes.guides.checkpoint);
  assert.equal(resolved.sourceBaselineSha, setup.publishes.guides.baseline);

  const handoff = buildManualTranslationHandoff({
    repository: setup.repository, sourceBranch: 'dev', group: 'guides', locale: 'ja-JP',
  });
  const unit = handoff.units[0];
  assert.equal(unit.target, 'ja-JP');
  assert.equal(unit.group, 'guides');
  assert.equal(unit.sourceCheckpointSha, setup.publishes.guides.checkpoint);
});

test('single-group selection yields only that group in both targets', t => {
  const setup = fixture(t);
  const handoff = buildManualTranslationHandoff({
    repository: setup.repository, sourceBranch: 'dev', group: 'python', locale: 'all',
  });
  assert.equal(handoff.group, 'python');
  assert.deepEqual(handoff.units.map(unit => `${unit.target}/${unit.group}`), [
    'ja-JP/python', 'zh-CN-reference/python',
  ]);
});

test('zh-CN locale excludes the English-only Guides group', t => {
  const setup = fixture(t);
  const handoff = buildManualTranslationHandoff({
    repository: setup.repository, sourceBranch: 'dev', group: 'all', locale: 'zh-CN',
  });
  assert.ok(handoff.units.length > 0);
  assert.ok(handoff.units.every(unit => unit.group !== 'guides'));
});

test('rejects a group with no published source commit', t => {
  const setup = fixture(t, {omit: ['cpp']});
  assert.throws(
    () => buildManualTranslationHandoff({repository: setup.repository, sourceBranch: 'dev', group: 'all', locale: 'all'}),
    /No published English source commit found for group cpp/,
  );
});

test('rejects master as the source branch and non-translatable groups', t => {
  const setup = fixture(t);
  assert.throws(
    () => buildManualTranslationHandoff({repository: setup.repository, sourceBranch: 'master', group: 'all', locale: 'all'}),
    /must target a content branch/,
  );
  assert.throws(
    () => buildManualTranslationHandoff({repository: setup.repository, sourceBranch: 'dev', group: 'rest', locale: 'all'}),
    /Unknown or non-translatable source group: rest/,
  );
  assert.throws(
    () => buildManualTranslationHandoff({repository: setup.repository, sourceBranch: 'dev', group: 'nope', locale: 'all'}),
    /Unknown or non-translatable source group: nope/,
  );
});
