'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { execFileSync } = require('node:child_process')

const {
  deterministicStagingRef,
  prepareStagingWorktree,
  commitAppliedBatch,
  pushStagingRef,
  promoteStaging,
  deleteStagingWithLease,
} = require('./translation-staging')

const SHA256 = '0123456789abcdef'.repeat(4)
const TRANSLATION = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md'
const GIT_ENV = {
  ...process.env,
  GIT_AUTHOR_NAME: 'Test Author',
  GIT_AUTHOR_EMAIL: 'author@example.com',
  GIT_COMMITTER_NAME: 'Test Committer',
  GIT_COMMITTER_EMAIL: 'committer@example.com',
}

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', env: GIT_ENV }).trim()
}

function setup() {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'translation-staging-')))
  const remote = path.join(root, 'remote.git')
  const repository = path.join(root, 'repository')
  execFileSync('git', ['init', '--bare', remote], { env: GIT_ENV })
  execFileSync('git', ['clone', remote, repository], { env: GIT_ENV })
  git(repository, 'switch', '-c', 'docs-dev')
  fs.mkdirSync(path.join(repository, 'sdk'), { recursive: true })
  fs.writeFileSync(path.join(repository, 'sdk', 'client.md'), 'sdk v1\n')
  fs.writeFileSync(path.join(repository, 'README.md'), 'docs\n')
  git(repository, 'add', 'README.md', 'sdk/client.md')
  git(repository, 'commit', '-m', 'seed')
  git(repository, 'push', '-u', 'origin', 'HEAD:refs/heads/docs-dev')
  return { root, remote, repository, targetSha: git(repository, 'rev-parse', 'HEAD') }
}

function addTranslation(worktree, text) {
  const file = path.join(worktree, TRANSLATION)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, text)
}

function remoteSha(repository, ref) {
  const output = git(repository, 'ls-remote', '--refs', 'origin', ref)
  return output ? output.split(/\s+/)[0] : null
}

function withGitWrapper(root, mode, callback) {
  const bin = path.join(root, `git-wrapper-${mode}`)
  fs.mkdirSync(bin)
  const wrapper = path.join(bin, 'git')
  fs.writeFileSync(wrapper, `#!/usr/bin/env node
const fs = require('node:fs')
const { spawnSync } = require('node:child_process')
const args = process.argv.slice(2)
const worktree = args.indexOf('worktree')
const add = worktree >= 0 && args[worktree + 1] === 'add'
const destination = add ? args[args.indexOf('--detach') + 1] : null
if (process.env.WRAPPER_MODE === 'add-fail' && add) {
  fs.mkdirSync(destination, { recursive: true })
  fs.writeFileSync(require('node:path').join(destination, 'partial'), 'partial\\n')
  process.exit(42)
}
const result = spawnSync(process.env.REAL_GIT, args, { stdio: 'inherit', env: process.env })
if (result.status !== 0) process.exit(result.status || 1)
if (process.env.WRAPPER_MODE === 'postcondition-fail' && add) {
  fs.writeFileSync(require('node:path').join(destination, 'injected-dirty-file'), 'dirty\\n')
}
if (process.env.WRAPPER_MODE === 'delete-reported-failure' && args.includes('push') && args.some(value => value.startsWith(':refs/heads/docs-translation-staging/guides/'))) process.exit(43)
process.exit(0)
`)
  fs.chmodSync(wrapper, 0o755)
  const saved = { PATH: process.env.PATH, REAL_GIT: process.env.REAL_GIT, WRAPPER_MODE: process.env.WRAPPER_MODE }
  process.env.REAL_GIT = execFileSync('which', ['git'], { encoding: 'utf8', env: { ...process.env, PATH: saved.PATH } }).trim()
  process.env.WRAPPER_MODE = mode
  process.env.PATH = `${bin}:${saved.PATH}`
  try { return callback() } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
}

function stagedBatch(state, count = 1) {
  const worktree = path.join(state.root, `staging-${Math.random().toString(16).slice(2)}`)
  prepareStagingWorktree({ repository: state.repository, expectedTargetSha: state.targetSha, worktree })
  addTranslation(worktree, '# 翻訳\n')
  const result = commitAppliedBatch({ worktree, batchNumber: 1, batchCount: count })
  return { worktree, stagedSha: result.stagedSha }
}

test('builds only the fixed deterministic Guides staging ref from bounded run identity', () => {
  assert.equal(
    deterministicStagingRef({ runId: '123456', runAttempt: 2, pendingSetSha256: SHA256 }),
    'refs/heads/docs-translation-staging/guides/123456-2-0123456789ab',
  )
  for (const options of [
    { runId: '0', runAttempt: 1, pendingSetSha256: SHA256 },
    { runId: '01', runAttempt: 1, pendingSetSha256: SHA256 },
    { runId: '1/evil', runAttempt: 1, pendingSetSha256: SHA256 },
    { runId: Number.MAX_SAFE_INTEGER + 1, runAttempt: 1, pendingSetSha256: SHA256 },
    { runId: 1, runAttempt: 0, pendingSetSha256: SHA256 },
    { runId: 1, runAttempt: '1.lock', pendingSetSha256: SHA256 },
    { runId: 1, runAttempt: 1, pendingSetSha256: SHA256.toUpperCase() },
    { runId: 1, runAttempt: 1, pendingSetSha256: `${SHA256}:refs/heads/main` },
    { runId: 1, runAttempt: 1, pendingSetSha256: 'a'.repeat(63) },
    { runId: 1, runAttempt: 1, pendingSetSha256: SHA256, namespace: 'refs/heads/main' },
  ]) assert.throws(() => deterministicStagingRef(options), /run|attempt|sha256|keys/i)
})

test('prepares one detached clean worktree at the exact target while retaining unrelated SDK commits', () => {
  const state = setup()
  fs.writeFileSync(path.join(state.repository, 'sdk', 'client.md'), 'sdk v2\n')
  git(state.repository, 'add', 'sdk/client.md')
  git(state.repository, 'commit', '-m', 'unrelated sdk update')
  git(state.repository, 'push', 'origin', 'HEAD:refs/heads/docs-dev')
  state.targetSha = git(state.repository, 'rev-parse', 'HEAD')
  const worktree = path.join(state.root, 'staging')
  const result = prepareStagingWorktree({ repository: state.repository, expectedTargetSha: state.targetSha, worktree })
  assert.deepEqual(result, { worktree, headSha: state.targetSha, created: true, detached: true })
  assert.equal(git(worktree, 'rev-parse', 'HEAD'), state.targetSha)
  assert.throws(() => git(worktree, 'symbolic-ref', '-q', 'HEAD'))
  assert.equal(git(worktree, 'status', '--porcelain=v1', '--untracked-files=all'), '')
  assert.equal(fs.readFileSync(path.join(worktree, 'sdk', 'client.md'), 'utf8'), 'sdk v2\n')
  assert.throws(() => prepareStagingWorktree({ repository: state.repository, expectedTargetSha: state.targetSha, worktree }), /destination|exists|empty/i)

  const nonempty = path.join(state.root, 'nonempty')
  fs.mkdirSync(nonempty)
  fs.writeFileSync(path.join(nonempty, 'sentinel'), 'keep\n')
  assert.throws(() => prepareStagingWorktree({ repository: state.repository, expectedTargetSha: state.targetSha, worktree: nonempty }), /empty|destination/i)
  assert.equal(fs.readFileSync(path.join(nonempty, 'sentinel'), 'utf8'), 'keep\n')

  const realParent = path.join(state.root, 'real-parent')
  const linkedParent = path.join(state.root, 'linked-parent')
  fs.mkdirSync(realParent)
  fs.symlinkSync(realParent, linkedParent)
  assert.throws(() => prepareStagingWorktree({ repository: state.repository, expectedTargetSha: state.targetSha, worktree: path.join(linkedParent, 'child') }), /symlink|real path/i)
})

test('rejects worktree overlap in both directions before changing the repository or destination', () => {
  const state = setup()
  const beforeHead = git(state.repository, 'rev-parse', 'HEAD')
  const beforeStatus = git(state.repository, 'status', '--porcelain=v1', '--untracked-files=all')
  const nestedAbsent = path.join(state.repository, '.translation-staging-worktree')
  assert.throws(() => prepareStagingWorktree({ repository: state.repository, expectedTargetSha: state.targetSha, worktree: nestedAbsent }), /overlap/i)
  assert.equal(fs.existsSync(nestedAbsent), false)

  const nestedEmpty = path.join(state.repository, '.empty-staging-worktree')
  fs.mkdirSync(nestedEmpty)
  assert.throws(() => prepareStagingWorktree({ repository: state.repository, expectedTargetSha: state.targetSha, worktree: nestedEmpty }), /overlap/i)
  assert.equal(fs.existsSync(nestedEmpty), true)
  assert.deepEqual(fs.readdirSync(nestedEmpty), [])

  assert.throws(() => prepareStagingWorktree({ repository: state.repository, expectedTargetSha: state.targetSha, worktree: state.root }), /overlap/i)
  assert.equal(fs.readFileSync(path.join(state.repository, 'README.md'), 'utf8'), 'docs\n')
  assert.equal(git(state.repository, 'rev-parse', 'HEAD'), beforeHead)
  assert.equal(git(state.repository, 'status', '--porcelain=v1', '--untracked-files=all'), beforeStatus)
})

test('worktree preparation rolls back add and postcondition failures transactionally', () => {
  const state = setup()
  const beforeHead = git(state.repository, 'rev-parse', 'HEAD')
  const beforeStatus = git(state.repository, 'status', '--porcelain=v1', '--untracked-files=all')
  const beforeWorktrees = git(state.repository, 'worktree', 'list', '--porcelain')

  const existingEmpty = path.join(state.root, 'existing-empty')
  fs.mkdirSync(existingEmpty, { mode: 0o1750 })
  fs.chmodSync(existingEmpty, 0o1750)
  withGitWrapper(state.root, 'add-fail', () => {
    assert.throws(() => prepareStagingWorktree({ repository: state.repository, expectedTargetSha: state.targetSha, worktree: existingEmpty }), /prepare|worktree|failed/i)
  })
  assert.equal(fs.existsSync(existingEmpty), true)
  assert.deepEqual(fs.readdirSync(existingEmpty), [])
  assert.equal(fs.statSync(existingEmpty).mode & 0o7777, 0o1750)
  assert.equal(git(state.repository, 'worktree', 'list', '--porcelain'), beforeWorktrees)

  const absent = path.join(state.root, 'postcondition-failure')
  withGitWrapper(state.root, 'postcondition-fail', () => {
    assert.throws(() => prepareStagingWorktree({ repository: state.repository, expectedTargetSha: state.targetSha, worktree: absent }), /clean|postcondition|prepare/i)
  })
  assert.equal(fs.existsSync(absent), false)
  assert.equal(git(state.repository, 'worktree', 'list', '--porcelain'), beforeWorktrees)
  assert.equal(git(state.repository, 'rev-parse', 'HEAD'), beforeHead)
  assert.equal(git(state.repository, 'status', '--porcelain=v1', '--untracked-files=all'), beforeStatus)
})

test('sanitizes hostile Git repository, index, object, and config environment overrides', () => {
  const state = setup()
  const attackerGit = path.join(state.root, 'attacker.git')
  const attackerWorktree = path.join(state.root, 'attacker-worktree')
  const attackerIndex = path.join(state.root, 'attacker-index')
  const attackerObjects = path.join(state.root, 'attacker-objects')
  const attackerHooks = path.join(state.root, 'attacker-hooks')
  execFileSync('git', ['init', '--bare', attackerGit], { env: GIT_ENV })
  fs.mkdirSync(attackerWorktree)
  fs.mkdirSync(attackerObjects)
  fs.mkdirSync(attackerHooks)
  fs.writeFileSync(path.join(attackerWorktree, 'sentinel'), 'untouched\n')
  fs.writeFileSync(path.join(attackerHooks, 'pre-commit'), '#!/bin/sh\nexit 1\n')
  fs.chmodSync(path.join(attackerHooks, 'pre-commit'), 0o755)

  const hostile = {
    GIT_DIR: attackerGit,
    GIT_WORK_TREE: attackerWorktree,
    GIT_INDEX_FILE: attackerIndex,
    GIT_COMMON_DIR: attackerGit,
    GIT_OBJECT_DIRECTORY: attackerObjects,
    GIT_ALTERNATE_OBJECT_DIRECTORIES: attackerObjects,
    GIT_CONFIG_COUNT: '1',
    GIT_CONFIG_KEY_0: 'core.hooksPath',
    GIT_CONFIG_VALUE_0: attackerHooks,
    GIT_NAMESPACE: 'attacker',
    GIT_SHALLOW_FILE: path.join(state.root, 'attacker-shallow'),
  }
  const saved = Object.fromEntries(Object.keys(hostile).map(key => [key, process.env[key]]))
  Object.assign(process.env, hostile)
  let stagedSha, stagingRef
  try {
    const worktree = path.join(state.root, 'staging')
    prepareStagingWorktree({ repository: state.repository, expectedTargetSha: state.targetSha, worktree })
    addTranslation(worktree, '# sanitized\n')
    stagedSha = commitAppliedBatch({ worktree, batchNumber: 1, batchCount: 1 }).stagedSha
    stagingRef = deterministicStagingRef({ runId: 80, runAttempt: 1, pendingSetSha256: SHA256 })
    pushStagingRef({ repository: state.repository, worktree, stagingRef, stagedSha })
    promoteStaging({ repository: state.repository, targetBranch: 'docs-dev', expectedTargetSha: state.targetSha, stagedSha })
    assert.equal(deleteStagingWithLease({ repository: state.repository, stagingRef, stagedSha }).deleted, true)
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
  assert.equal(remoteSha(state.repository, 'refs/heads/docs-dev'), stagedSha)
  assert.equal(remoteSha(state.repository, stagingRef), null)
  assert.equal(fs.readFileSync(path.join(attackerWorktree, 'sentinel'), 'utf8'), 'untouched\n')
  assert.equal(fs.existsSync(attackerIndex), false)
  assert.deepEqual(fs.readdirSync(attackerObjects), [])
})

test('creates deterministic commits for nonempty batches and retains combined batch history', () => {
  const state = setup()
  const worktree = path.join(state.root, 'staging')
  prepareStagingWorktree({ repository: state.repository, expectedTargetSha: state.targetSha, worktree })
  addTranslation(worktree, '# 一\n')
  const first = commitAppliedBatch({ worktree, batchNumber: 1, batchCount: 2 })
  assert.equal(first.committed, true)
  assert.equal(git(worktree, 'show', '-s', '--format=%s', first.stagedSha), 'docs(i18n): apply Guides translation batch 1/2')
  assert.equal(git(worktree, 'show', '-s', '--format=%an <%ae>|%cn <%ce>', first.stagedSha), 'Zilliz Docs Translation Bot <docs@zilliz.com>|Zilliz Docs Translation Bot <docs@zilliz.com>')
  assert.deepEqual(git(worktree, 'diff-tree', '--no-commit-id', '--name-only', '-r', first.stagedSha).split('\n'), [TRANSLATION])
  assert.equal(git(worktree, 'status', '--porcelain=v1', '--untracked-files=all'), '')

  addTranslation(worktree, '# 二\n')
  const second = commitAppliedBatch({ worktree, batchNumber: 2, batchCount: 2 })
  assert.equal(git(worktree, 'rev-parse', `${second.stagedSha}^`), first.stagedSha)
  assert.equal(git(worktree, 'show', `${second.stagedSha}:${TRANSLATION}`), '# 二')
  assert.equal(git(worktree, 'show', `${first.stagedSha}:${TRANSLATION}`), '# 一')
})

test('deterministic batch commits ignore rejecting ambient hooks and signing configuration', () => {
  const state = setup()
  const worktree = path.join(state.root, 'staging')
  prepareStagingWorktree({ repository: state.repository, expectedTargetSha: state.targetSha, worktree })
  const hooks = path.join(state.root, 'rejecting-hooks')
  fs.mkdirSync(hooks)
  fs.writeFileSync(path.join(hooks, 'pre-commit'), '#!/bin/sh\nexit 1\n')
  fs.chmodSync(path.join(hooks, 'pre-commit'), 0o755)
  git(worktree, 'config', 'core.hooksPath', hooks)
  git(worktree, 'config', 'commit.gpgSign', 'true')
  addTranslation(worktree, '# 翻訳\n')
  assert.equal(commitAppliedBatch({ worktree, batchNumber: 1, batchCount: 1 }).committed, true)
})

test('does not create empty commits or stage unrelated and pre-staged changes', () => {
  const state = setup()
  const worktree = path.join(state.root, 'staging')
  prepareStagingWorktree({ repository: state.repository, expectedTargetSha: state.targetSha, worktree })
  const empty = commitAppliedBatch({ worktree, batchNumber: 1, batchCount: 1 })
  assert.deepEqual(empty, { committed: false, stagedSha: state.targetSha, batchNumber: 1, batchCount: 1 })
  assert.equal(remoteSha(state.repository, 'refs/heads/docs-translation-staging/guides/1-1-0123456789ab'), null)

  addTranslation(worktree, '# 翻訳\n')
  fs.writeFileSync(path.join(worktree, 'README.md'), 'unrelated\n')
  assert.throws(() => commitAppliedBatch({ worktree, batchNumber: 1, batchCount: 1 }), /outside.*translation|unrelated/i)
  assert.equal(git(worktree, 'diff', '--cached', '--name-only'), '')
  fs.writeFileSync(path.join(worktree, 'README.md'), 'docs\n')
  git(worktree, 'add', TRANSLATION)
  assert.throws(() => commitAppliedBatch({ worktree, batchNumber: 1, batchCount: 1 }), /index.*clean|pre-staged/i)
  assert.equal(git(worktree, 'rev-parse', 'HEAD'), state.targetSha)
})

test('pushes only the exact clean detached staged SHA and is idempotent at the same remote SHA', () => {
  const state = setup()
  const { worktree, stagedSha } = stagedBatch(state)
  const stagingRef = deterministicStagingRef({ runId: 77, runAttempt: 3, pendingSetSha256: SHA256 })
  const pushed = pushStagingRef({ repository: state.repository, worktree, stagingRef, stagedSha })
  assert.deepEqual(pushed, { stagingRef, stagedSha, remoteSha: stagedSha, pushed: true })
  assert.equal(remoteSha(state.repository, stagingRef), stagedSha)
  assert.deepEqual(pushStagingRef({ repository: state.repository, worktree, stagingRef, stagedSha }), { stagingRef, stagedSha, remoteSha: stagedSha, pushed: false })

  assert.throws(() => pushStagingRef({ repository: state.repository, worktree, stagingRef, stagedSha: state.targetSha }), /HEAD.*staged|mismatch/i)
  fs.writeFileSync(path.join(worktree, TRANSLATION), '# dirty\n')
  assert.throws(() => pushStagingRef({ repository: state.repository, worktree, stagingRef, stagedSha }), /clean|dirty/i)
})

test('pushes a valid target-descendant staging candidate when the primary checkout is on sibling tooling history', () => {
  const state = setup()
  fs.mkdirSync(path.join(state.repository, 'tooling'))
  fs.writeFileSync(path.join(state.repository, 'tooling', 'workflow.js'), 'tooling only\n')
  git(state.repository, 'add', 'tooling/workflow.js')
  git(state.repository, 'commit', '-m', 'tooling commit pinned by primary checkout')
  const toolingSha = git(state.repository, 'rev-parse', 'HEAD')

  const worktree = path.join(state.root, 'staging')
  prepareStagingWorktree({ repository: state.repository, expectedTargetSha: state.targetSha, worktree })
  addTranslation(worktree, '# target translation\n')
  const stagedSha = commitAppliedBatch({ worktree, batchNumber: 1, batchCount: 1 }).stagedSha
  assert.throws(() => git(state.repository, 'merge-base', '--is-ancestor', toolingSha, stagedSha))

  const stagingRef = deterministicStagingRef({ runId: 79, runAttempt: 1, pendingSetSha256: SHA256 })
  assert.deepEqual(pushStagingRef({ repository: state.repository, worktree, stagingRef, stagedSha }), { stagingRef, stagedSha, remoteSha: stagedSha, pushed: true })
  assert.equal(remoteSha(state.repository, stagingRef), stagedSha)
})

test('rejects ambiguous exact remote-ref lookup output', () => {
  const state = setup()
  const { worktree, stagedSha } = stagedBatch(state)
  const stagingRef = deterministicStagingRef({ runId: 78, runAttempt: 1, pendingSetSha256: SHA256 })
  pushStagingRef({ repository: state.repository, worktree, stagingRef, stagedSha })
  const bin = path.join(state.root, 'bin')
  fs.mkdirSync(bin)
  const wrapper = path.join(bin, 'git')
  fs.writeFileSync(wrapper, '#!/bin/sh\nif [ "$3" = "ls-remote" ]; then\n  output=$("$REAL_GIT" "$@") || exit $?\n  printf "%s\\n%s\\n" "$output" "$output"\n  exit 0\nfi\nexec "$REAL_GIT" "$@"\n')
  fs.chmodSync(wrapper, 0o755)
  const beforePath = process.env.PATH
  const beforeGit = process.env.REAL_GIT
  process.env.PATH = `${bin}:${beforePath}`
  process.env.REAL_GIT = execFileSync('which', ['git'], { encoding: 'utf8', env: { ...process.env, PATH: beforePath } }).trim()
  try {
    assert.throws(() => pushStagingRef({ repository: state.repository, worktree, stagingRef, stagedSha }), /ambiguous/i)
  } finally {
    process.env.PATH = beforePath
    if (beforeGit === undefined) delete process.env.REAL_GIT
    else process.env.REAL_GIT = beforeGit
  }
})

test('rejects an existing remote staging ref at another SHA', () => {
  const state = setup()
  const one = stagedBatch(state)
  const ref = deterministicStagingRef({ runId: 8, runAttempt: 1, pendingSetSha256: SHA256 })
  git(state.repository, 'push', 'origin', `${state.targetSha}:${ref}`)
  assert.throws(() => pushStagingRef({ repository: state.repository, worktree: one.worktree, stagingRef: ref, stagedSha: one.stagedSha }), /remote staging ref.*different|wrong SHA/i)
})

test('promotes the exact staged SHA with a normal push and rejects target movement or invalid lineage', () => {
  const state = setup()
  const { stagedSha } = stagedBatch(state)
  const result = promoteStaging({ repository: state.repository, targetBranch: 'docs-dev', expectedTargetSha: state.targetSha, stagedSha })
  assert.deepEqual(result, { targetBranch: 'docs-dev', previousSha: state.targetSha, publishedSha: stagedSha, promoted: true })
  assert.equal(remoteSha(state.repository, 'refs/heads/docs-dev'), stagedSha)

  const moved = setup()
  const staged = stagedBatch(moved)
  fs.writeFileSync(path.join(moved.repository, 'sdk', 'client.md'), 'sdk moved\n')
  git(moved.repository, 'add', 'sdk/client.md')
  git(moved.repository, 'commit', '-m', 'target moved')
  git(moved.repository, 'push', 'origin', 'HEAD:refs/heads/docs-dev')
  assert.throws(() => promoteStaging({ repository: moved.repository, targetBranch: 'docs-dev', expectedTargetSha: moved.targetSha, stagedSha: staged.stagedSha }), /target.*moved|expected target/i)
  assert.throws(() => promoteStaging({ repository: moved.repository, targetBranch: 'refs/heads/docs-dev', expectedTargetSha: moved.targetSha, stagedSha: staged.stagedSha }), /target branch|invalid/i)
  assert.throws(() => promoteStaging({ repository: moved.repository, targetBranch: '-force', expectedTargetSha: moved.targetSha, stagedSha: staged.stagedSha }), /target branch|invalid/i)

  const unrelated = setup()
  const orphan = path.join(unrelated.root, 'orphan')
  execFileSync('git', ['init', orphan], { env: GIT_ENV })
  fs.writeFileSync(path.join(orphan, 'orphan.md'), 'orphan\n')
  git(orphan, 'add', 'orphan.md')
  git(orphan, 'commit', '-m', 'unrelated publication candidate')
  const orphanSha = git(orphan, 'rev-parse', 'HEAD')
  git(unrelated.repository, 'fetch', orphan, orphanSha)
  assert.throws(() => promoteStaging({ repository: unrelated.repository, targetBranch: 'docs-dev', expectedTargetSha: unrelated.targetSha, stagedSha: orphanSha }), /descend.*expected target/i)
})

test('ignores stale remote tracking state and rejects target movement injected during the normal promotion push', () => {
  const state = setup()
  const staged = stagedBatch(state)
  git(state.repository, 'update-ref', 'refs/remotes/origin/docs-dev', staged.stagedSha)
  promoteStaging({ repository: state.repository, targetBranch: 'docs-dev', expectedTargetSha: state.targetSha, stagedSha: staged.stagedSha })
  assert.equal(remoteSha(state.repository, 'refs/heads/docs-dev'), staged.stagedSha)

  const racing = setup()
  const candidate = stagedBatch(racing)
  const racer = path.join(racing.root, 'racer')
  execFileSync('git', ['clone', racing.remote, racer], { env: GIT_ENV })
  git(racer, 'switch', '-c', 'race', racing.targetSha)
  fs.writeFileSync(path.join(racer, 'sdk', 'client.md'), 'racing sdk\n')
  git(racer, 'add', 'sdk/client.md')
  git(racer, 'commit', '-m', 'concurrent target movement')
  const movedSha = git(racer, 'rev-parse', 'HEAD')
  git(racer, 'push', 'origin', `${movedSha}:refs/heads/race-candidate`)

  const bin = path.join(racing.root, 'bin')
  fs.mkdirSync(bin)
  const wrapper = path.join(bin, 'git')
  fs.writeFileSync(wrapper, '#!/bin/sh\ncase " $* " in\n  *" push "*"refs/heads/docs-dev"*)\n    "$REAL_GIT" --git-dir="$RACE_REMOTE" update-ref refs/heads/docs-dev "$RACE_SHA" || exit $?\n    ;;\nesac\nexec "$REAL_GIT" "$@"\n')
  fs.chmodSync(wrapper, 0o755)
  const saved = { PATH: process.env.PATH, REAL_GIT: process.env.REAL_GIT, RACE_REMOTE: process.env.RACE_REMOTE, RACE_SHA: process.env.RACE_SHA }
  process.env.REAL_GIT = execFileSync('which', ['git'], { encoding: 'utf8' }).trim()
  process.env.RACE_REMOTE = racing.remote
  process.env.RACE_SHA = movedSha
  process.env.PATH = `${bin}:${saved.PATH}`
  try {
    assert.throws(() => promoteStaging({ repository: racing.repository, targetBranch: 'docs-dev', expectedTargetSha: racing.targetSha, stagedSha: candidate.stagedSha }), /promotion|push failed|moved/i)
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
  assert.equal(remoteSha(racing.repository, 'refs/heads/docs-dev'), movedSha)
})

test('cleanup uses an exact lease and returns nonfatal structured debt for races and command failure', () => {
  const state = setup()
  const { worktree, stagedSha } = stagedBatch(state, 2)
  const stagingRef = deterministicStagingRef({ runId: 91, runAttempt: 1, pendingSetSha256: SHA256 })
  pushStagingRef({ repository: state.repository, worktree, stagingRef, stagedSha })
  addTranslation(worktree, '# later\n')
  const laterSha = commitAppliedBatch({ worktree, batchNumber: 2, batchCount: 2 }).stagedSha
  git(worktree, 'push', 'origin', `${laterSha}:${stagingRef}`)
  const raced = deleteStagingWithLease({ repository: state.repository, stagingRef, stagedSha })
  assert.equal(raced.deleted, false)
  assert.deepEqual(raced.cleanupDebt, { kind: 'lease_mismatch', stagingRef, expectedSha: stagedSha, actualSha: laterSha })
  assert.equal(remoteSha(state.repository, stagingRef), laterSha)

  const absentRef = deterministicStagingRef({ runId: 92, runAttempt: 1, pendingSetSha256: SHA256 })
  assert.deepEqual(deleteStagingWithLease({ repository: state.repository, stagingRef: absentRef, stagedSha }), { stagingRef: absentRef, stagedSha, deleted: false, cleanupDebt: null, reason: 'absent' })

  const failing = setup()
  const staged = stagedBatch(failing)
  const failingRef = deterministicStagingRef({ runId: 93, runAttempt: 1, pendingSetSha256: SHA256 })
  pushStagingRef({ repository: failing.repository, worktree: staged.worktree, stagingRef: failingRef, stagedSha: staged.stagedSha })
  const hook = path.join(failing.remote, 'hooks', 'pre-receive')
  fs.writeFileSync(hook, '#!/bin/sh\nwhile read old new ref; do\n  if [ "$new" = "0000000000000000000000000000000000000000" ]; then exit 1; fi\ndone\n')
  fs.chmodSync(hook, 0o755)
  const debt = deleteStagingWithLease({ repository: failing.repository, stagingRef: failingRef, stagedSha: staged.stagedSha })
  assert.equal(debt.deleted, false)
  assert.equal(debt.cleanupDebt.kind, 'delete_failed')
  assert.equal(debt.cleanupDebt.stagingRef, failingRef)
  assert.match(debt.cleanupDebt.message, /delete|push|failed/i)
  assert.ok(debt.cleanupDebt.message.length <= 240)
  assert.equal(remoteSha(failing.repository, failingRef), staged.stagedSha)
})

test('cleanup remote lookup failure is bounded structured debt rather than an exception', () => {
  const state = setup()
  const stagingRef = deterministicStagingRef({ runId: 94, runAttempt: 1, pendingSetSha256: SHA256 })
  git(state.repository, 'remote', 'set-url', 'origin', path.join(state.root, 'missing.git'))
  const result = deleteStagingWithLease({ repository: state.repository, stagingRef, stagedSha: state.targetSha })
  assert.equal(result.deleted, false)
  assert.equal(result.cleanupDebt.kind, 'lookup_failed')
  assert.ok(result.cleanupDebt.message.length <= 240)
})

test('cleanup post-delete verification failure is also nonfatal structured debt', () => {
  const state = setup()
  const staged = stagedBatch(state)
  const stagingRef = deterministicStagingRef({ runId: 95, runAttempt: 1, pendingSetSha256: SHA256 })
  pushStagingRef({ repository: state.repository, worktree: staged.worktree, stagingRef, stagedSha: staged.stagedSha })
  const bin = path.join(state.root, 'bin')
  const counter = path.join(state.root, 'ls-remote-count')
  fs.mkdirSync(bin)
  fs.writeFileSync(path.join(bin, 'git'), '#!/bin/sh\nif [ "$3" = "ls-remote" ]; then\n  count=0\n  [ -f "$COUNT_FILE" ] && count=$(cat "$COUNT_FILE")\n  count=$((count + 1))\n  printf "%s" "$count" > "$COUNT_FILE"\n  [ "$count" -ge 2 ] && exit 128\nfi\nexec "$REAL_GIT" "$@"\n')
  fs.chmodSync(path.join(bin, 'git'), 0o755)
  const saved = { PATH: process.env.PATH, REAL_GIT: process.env.REAL_GIT, COUNT_FILE: process.env.COUNT_FILE }
  process.env.REAL_GIT = execFileSync('which', ['git'], { encoding: 'utf8' }).trim()
  process.env.COUNT_FILE = counter
  process.env.PATH = `${bin}:${saved.PATH}`
  let result
  try {
    result = deleteStagingWithLease({ repository: state.repository, stagingRef, stagedSha: staged.stagedSha })
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
  assert.equal(result.deleted, false)
  assert.equal(result.cleanupDebt.kind, 'lookup_failed')
  assert.ok(result.cleanupDebt.message.length <= 240)
})

test('cleanup reports success when delete command fails but exact verification proves the ref absent', () => {
  const state = setup()
  const staged = stagedBatch(state)
  const stagingRef = deterministicStagingRef({ runId: 96, runAttempt: 1, pendingSetSha256: SHA256 })
  pushStagingRef({ repository: state.repository, worktree: staged.worktree, stagingRef, stagedSha: staged.stagedSha })
  const result = withGitWrapper(state.root, 'delete-reported-failure', () => deleteStagingWithLease({ repository: state.repository, stagingRef, stagedSha: staged.stagedSha }))
  assert.equal(result.deleted, true)
  assert.equal(result.reason, 'deleted')
  assert.equal(result.cleanupDebt, null)
  assert.match(result.commandWarning, /failed|status|command/i)
  assert.ok(result.commandWarning.length <= 240)
  assert.equal(remoteSha(state.repository, stagingRef), null)
})

test('production Git invocation contains no shell execution and remote-ref force is isolated to leased cleanup', () => {
  const source = fs.readFileSync(path.join(__dirname, 'translation-staging.js'), 'utf8')
  assert.doesNotMatch(source, /execSync|spawnSync|shell\s*:/)
  assert.equal((source.match(/--force-with-lease/g) || []).length, 1)
  assert.equal((source.match(/\['worktree', 'remove', '--force'/g) || []).length, 1)
  assert.doesNotMatch(source.replace(/--force-with-lease/g, '').replace(/\['worktree', 'remove', '--force'/g, ''), /--force\b|['"]-f['"]/)
})

test('deletes the exact staging ref after publication without changing the published target', () => {
  const state = setup()
  const { worktree, stagedSha } = stagedBatch(state)
  const stagingRef = deterministicStagingRef({ runId: 101, runAttempt: 1, pendingSetSha256: SHA256 })
  pushStagingRef({ repository: state.repository, worktree, stagingRef, stagedSha })
  promoteStaging({ repository: state.repository, targetBranch: 'docs-dev', expectedTargetSha: state.targetSha, stagedSha })
  assert.deepEqual(deleteStagingWithLease({ repository: state.repository, stagingRef, stagedSha }), { stagingRef, stagedSha, deleted: true, cleanupDebt: null, reason: 'deleted' })
  assert.equal(remoteSha(state.repository, stagingRef), null)
  assert.equal(remoteSha(state.repository, 'refs/heads/docs-dev'), stagedSha)
})
