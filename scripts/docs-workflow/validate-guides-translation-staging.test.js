'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { execFileSync, spawnSync } = require('node:child_process')

const { runGuidesTranslationValidation, writeValidationResult, VALIDATION_COMMANDS, RESTORE_PATHS } = require('./validate-guides-translation-staging')

const ROOT = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials'
const ENV = { ...process.env, GIT_AUTHOR_NAME: 'Test', GIT_AUTHOR_EMAIL: 'test@example.com', GIT_COMMITTER_NAME: 'Test', GIT_COMMITTER_EMAIL: 'test@example.com' }
function git(cwd, ...args) { return execFileSync('git', args, { cwd, encoding: 'utf8', env: ENV }).trim() }

function fixture() {
  const repository = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'validate-guides-staging-')))
  git(repository, 'init')
  const seeds = ['docs/index.md', 'docs-byoc/index.md', 'reference/index.md', 'reference/keep.md', `${ROOT}/a.md`, 'i18n/ja-JP/other.md', '.translation-cache/ja-JP.json', 'config/generated/guides.sidebar.js', 'plugins/lark-docs/meta/snapshots/guides.json', 'plugins/lark-docs/meta/assembly/guides.json']
  for (const relative of seeds) { fs.mkdirSync(path.dirname(path.join(repository, relative)), { recursive: true }); fs.writeFileSync(path.join(repository, relative), `${relative}\n`) }
  fs.writeFileSync(path.join(repository, 'tooling.js'), 'tooling\n')
  git(repository, 'add', '.')
  git(repository, 'commit', '-m', 'master tooling')
  const masterSha = git(repository, 'rev-parse', 'HEAD')
  git(repository, 'switch', '-c', 'staged')
  fs.writeFileSync(path.join(repository, ROOT, 'a.md'), '# translated\n')
  git(repository, 'add', ROOT)
  git(repository, 'commit', '-m', 'staged generated state')
  const stagedSha = git(repository, 'rev-parse', 'HEAD')
  git(repository, 'switch', '--detach', masterSha)
  git(repository, 'checkout', stagedSha, '--', ...RESTORE_PATHS)
  return { repository, masterSha, stagedSha }
}

test('runs only the seven hard-coded commands in exact order and returns immutable proof and receipts', () => {
  const state = fixture()
  const calls = []
  const result = runGuidesTranslationValidation({
    ...state,
    executor(command, args, options) {
      calls.push({ command, args, cwd: options.cwd, env: options.env })
      return { status: 0, signal: null, stderr: '' }
    },
  })
  assert.deepEqual(calls.map(call => [call.command, call.args]), VALIDATION_COMMANDS.map(item => [item.command, item.args]))
  assert.ok(calls.every(call => call.cwd === state.repository))
  assert.ok(calls.every(call => call.env.GIT_DIR === undefined && call.env.GIT_CONFIG_COUNT === undefined && call.env.CI === 'true'))
  assert.equal(result.result, 'success')
  assert.equal(result.receipts.length, 7)
  assert.deepEqual(result.receipts.map(item => item.result), Array(7).fill('success'))
  assert.equal(result.proof.repositoryHeadSha, state.masterSha)
  assert.equal(result.proof.stagedSha, state.stagedSha)
  assert.match(result.proof.generatedStateSha256, /^[0-9a-f]{64}$/)
  assert.equal(Object.isFrozen(result.receipts), true)
})

test('stops on the first nonzero command and records only commands actually executed', () => {
  const state = fixture()
  let count = 0
  const result = runGuidesTranslationValidation({
    ...state,
    executor() {
      count += 1
      return count === 3 ? { status: 7, signal: null, stderr: 'bad\n'.repeat(200) } : { status: 0, signal: null, stderr: '' }
    },
  })
  assert.equal(count, 3)
  assert.equal(result.result, 'failure')
  assert.deepEqual(result.receipts.map(item => item.result), ['success', 'success', 'failure'])
  assert.match(result.failureDetail, /exit 7/i)
  assert.ok(result.failureDetail.length <= 500)
})

test('distinguishes spawn errors and signals without claiming unexecuted commands', () => {
  const state = fixture()
  const spawn = runGuidesTranslationValidation({ ...state, executor() { throw new Error('spawn exploded') } })
  assert.equal(spawn.receipts.length, 1)
  assert.equal(spawn.receipts[0].result, 'failure')
  assert.match(spawn.failureDetail, /spawn/i)
  const signal = runGuidesTranslationValidation({ ...state, executor() { return { status: null, signal: 'SIGTERM', stderr: '' } } })
  assert.match(signal.failureDetail, /SIGTERM/)
})

test('rejects wrong HEAD, arbitrary dirty paths, mismatched restored state, and injected options', () => {
  const wrongHead = fixture()
  git(wrongHead.repository, 'switch', 'staged')
  assert.throws(() => runGuidesTranslationValidation({ ...wrongHead, executor() { return { status: 0, signal: null, stderr: '' } } }), /HEAD|master/i)

  const dirty = fixture()
  fs.writeFileSync(path.join(dirty.repository, 'tooling.js'), 'dirty outside\n')
  assert.throws(() => runGuidesTranslationValidation({ ...dirty, executor() { return { status: 0, signal: null, stderr: '' } } }), /outside|allowed|tooling/i)

  const mismatch = fixture()
  fs.writeFileSync(path.join(mismatch.repository, ROOT, 'a.md'), '# forged\n')
  assert.throws(() => runGuidesTranslationValidation({ ...mismatch, executor() { return { status: 0, signal: null, stderr: '' } } }), /restored|staged|match/i)

  const valid = fixture()
  assert.throws(() => runGuidesTranslationValidation({ ...valid, command: 'rm -rf .', executor() {} }), /keys|options/i)
  assert.throws(() => runGuidesTranslationValidation({ ...valid, executor() { return { status: 0, signal: null, stderr: '', extra: true } } }), /executor.*result|keys/i)
})

test('rejects untracked generated files, index contamination, and symlinked staged inventory', () => {
  const untracked = fixture()
  fs.appendFileSync(path.join(untracked.repository, '.git', 'info', 'exclude'), '\nextra.md\n')
  fs.writeFileSync(path.join(untracked.repository, ROOT, 'extra.md'), 'extra\n')
  assert.throws(() => runGuidesTranslationValidation({ ...untracked, executor() {} }), /untracked/i)

  const index = fixture()
  git(index.repository, 'reset', 'HEAD', '--', ROOT)
  assert.throws(() => runGuidesTranslationValidation({ ...index, executor() {} }), /index|staged/i)

  const symlink = fixture()
  git(symlink.repository, 'switch', 'staged')
  fs.symlinkSync('a.md', path.join(symlink.repository, ROOT, 'link.md'))
  git(symlink.repository, 'add', `${ROOT}/link.md`)
  git(symlink.repository, 'commit', '-m', 'inject generated symlink')
  symlink.stagedSha = git(symlink.repository, 'rev-parse', 'HEAD')
  git(symlink.repository, 'switch', '--detach', symlink.masterSha)
  git(symlink.repository, 'checkout', symlink.stagedSha, '--', ROOT)
  assert.throws(() => runGuidesTranslationValidation({ ...symlink, executor() {} }), /symlink|special/i)
})

test('rejects hybrid authoritative roots and executable-mode drift', () => {
  for (const relative of ['docs/extra.md', 'docs-byoc/extra.md', 'reference/extra.md', 'i18n/ja-JP/extra.md', '.translation-cache/extra.json', 'config/generated/extra.js', 'plugins/lark-docs/meta/snapshots/extra.json', 'plugins/lark-docs/meta/assembly/extra.json']) {
    const state = fixture()
    git(state.repository, 'switch', 'staged'); fs.writeFileSync(path.join(state.repository, relative), 'staged only\n'); git(state.repository, 'add', relative); git(state.repository, 'commit', '-m', `change ${relative}`); state.stagedSha = git(state.repository, 'rev-parse', 'HEAD')
    git(state.repository, 'switch', '--detach', state.masterSha); git(state.repository, 'checkout', state.stagedSha, '--', ROOT)
    assert.throws(() => runGuidesTranslationValidation({ ...state, executor() {} }), /restored|staged|index|root/i)
  }
  const mode = fixture(); git(mode.repository, 'config', 'core.fileMode', 'false'); fs.chmodSync(path.join(mode.repository, ROOT, 'a.md'), 0o755)
  assert.throws(() => runGuidesTranslationValidation({ ...mode, executor() {} }), /mode|executable/i)

  const deletion = fixture(); git(deletion.repository, 'switch', 'staged'); fs.unlinkSync(path.join(deletion.repository, 'reference', 'index.md')); git(deletion.repository, 'add', '-A', 'reference'); git(deletion.repository, 'commit', '-m', 'delete staged reference file'); deletion.stagedSha = git(deletion.repository, 'rev-parse', 'HEAD')
  git(deletion.repository, 'switch', '--detach', deletion.masterSha); git(deletion.repository, 'checkout', deletion.stagedSha, '--', ...RESTORE_PATHS); fs.unlinkSync(path.join(deletion.repository, 'reference', 'index.md')); git(deletion.repository, 'add', '-A', 'reference')
  assert.equal(fs.existsSync(path.join(deletion.repository, 'reference', 'index.md')), false)
  assert.equal(runGuidesTranslationValidation({ ...deletion, executor() { return { status: 0, signal: null, stderr: '' } } }).result, 'success')
})

test('validation writer rejects parent swaps without redirecting output', () => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'validation-parent-race-')))
  const parent = path.join(root, 'output'), parked = path.join(root, 'parked'), outside = path.join(root, 'outside')
  fs.mkdirSync(parent); fs.mkdirSync(outside); fs.writeFileSync(path.join(outside, 'sentinel'), 'outside\n')
  fs.chmodSync(parent, 0o700)
  assert.throws(() => writeValidationResult(path.join(parent, 'receipt.json'), { ok: true }, { trustedRoot: parent, beforeRename() { fs.renameSync(parent, parked); fs.symlinkSync(outside, parent) } }), /parent.*changed|identity/i)
  assert.equal(fs.readFileSync(path.join(outside, 'sentinel'), 'utf8'), 'outside\n')
  assert.equal(fs.existsSync(path.join(outside, 'receipt.json')), false)
})

test('sanitizes hostile Git, Node, shell, and package-manager environment before proof and execution', () => {
  const state = fixture()
  const saved = { GIT_DIR: process.env.GIT_DIR, GIT_INDEX_FILE: process.env.GIT_INDEX_FILE, GIT_CONFIG_COUNT: process.env.GIT_CONFIG_COUNT, GIT_CONFIG_KEY_0: process.env.GIT_CONFIG_KEY_0, GIT_CONFIG_VALUE_0: process.env.GIT_CONFIG_VALUE_0, NODE_OPTIONS: process.env.NODE_OPTIONS, NPM_CONFIG_USERCONFIG: process.env.NPM_CONFIG_USERCONFIG, YARN_ENABLE_SCRIPTS: process.env.YARN_ENABLE_SCRIPTS, BASH_ENV: process.env.BASH_ENV }
  process.env.GIT_DIR = path.join(state.repository, 'attacker.git')
  process.env.GIT_INDEX_FILE = path.join(state.repository, 'attacker-index')
  process.env.GIT_CONFIG_COUNT = '1'
  process.env.GIT_CONFIG_KEY_0 = 'core.hooksPath'
  process.env.GIT_CONFIG_VALUE_0 = '/attacker'
  process.env.NODE_OPTIONS = '--require=/attacker.js'
  process.env.NPM_CONFIG_USERCONFIG = '/attacker.npmrc'
  process.env.YARN_ENABLE_SCRIPTS = 'true'
  process.env.BASH_ENV = '/attacker-bash-env'
  let result
  try {
    result = runGuidesTranslationValidation({ ...state, executor(command, args, options) {
      assert.equal(options.env.GIT_DIR, undefined)
      assert.equal(options.env.GIT_INDEX_FILE, undefined)
      assert.equal(options.env.GIT_CONFIG_COUNT, undefined)
      assert.equal(options.env.NODE_OPTIONS, undefined)
      assert.notEqual(options.env.NPM_CONFIG_USERCONFIG, '/attacker.npmrc')
      assert.equal(fs.readFileSync(options.env.NPM_CONFIG_USERCONFIG, 'utf8'), '')
      assert.equal(options.env.YARN_ENABLE_SCRIPTS, undefined)
      assert.equal(options.env.BASH_ENV, undefined)
      return { status: 0, signal: null, stderr: '' }
    } })
  } finally {
    for (const [key, value] of Object.entries(saved)) value === undefined ? delete process.env[key] : process.env[key] = value
  }
  assert.equal(result.result, 'success')
  assert.equal(fs.existsSync(path.join(state.repository, 'attacker-index')), false)
})

test('rejects raw bytes hidden by autocrlf and ignores hostile global configs', () => {
  const state = fixture(); git(state.repository, 'config', 'core.autocrlf', 'true'); fs.writeFileSync(path.join(state.repository, ROOT, 'a.md'), '# translated\r\n')
  assert.throws(() => runGuidesTranslationValidation({ ...state, executor() {} }), /raw|bytes|content|staged/i)
  const clean = fixture(), hostileHome = fs.mkdtempSync(path.join(os.tmpdir(), 'hostile-home-'))
  fs.writeFileSync(path.join(hostileHome, '.gitconfig'), '[core]\n\tfsmonitor = /missing\n')
  const oldHome = process.env.HOME, oldXdg = process.env.XDG_CONFIG_HOME; process.env.HOME = hostileHome; process.env.XDG_CONFIG_HOME = hostileHome
  try { assert.equal(runGuidesTranslationValidation({ ...clean, executor(command, args, options) { assert.notEqual(options.env.HOME, hostileHome); assert.equal(options.env.GIT_CONFIG_NOSYSTEM, '1'); return { status: 0, signal: null, stderr: '' } } }).result, 'success') }
  finally { process.env.HOME = oldHome; oldXdg === undefined ? delete process.env.XDG_CONFIG_HOME : process.env.XDG_CONFIG_HOME = oldXdg }
})

test('CLI rejects a staged commit missing a required root', () => {
  const state = fixture(); git(state.repository, 'switch', 'staged'); fs.rmSync(path.join(state.repository, 'plugins/lark-docs/meta/snapshots'), { recursive: true }); git(state.repository, 'add', '-A'); git(state.repository, 'commit', '-m', 'remove root'); state.stagedSha = git(state.repository, 'rev-parse', 'HEAD'); git(state.repository, 'switch', '--detach', state.masterSha)
  const trusted = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'validation-cli-'))); fs.chmodSync(trusted, 0o700)
  const result = spawnSync(process.execPath, [path.join(__dirname, 'validate-guides-translation-staging.js'), '--repository', state.repository, '--master-sha', state.masterSha, '--staged-sha', state.stagedSha, '--output', path.join(trusted, 'result.json'), '--trusted-root', trusted], { encoding: 'utf8' })
  assert.notEqual(result.status, 0); assert.match(result.stderr, /required.*root/i); assert.equal(fs.existsSync(path.join(trusted, 'result.json')), false)
})
