'use strict'

const assert = require('node:assert/strict')
const { execFileSync, spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const scriptPath = path.resolve('scripts/restore-generated-state.sh')
const restorePaths = [
  'docs',
  'docs-byoc',
  'reference',
  'i18n',
  '.translation-cache',
  'config/generated',
  'plugins/lark-docs/meta/snapshots',
]

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim()
}

function write(root, relativePath, contents) {
  const target = path.join(root, relativePath)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, contents)
}

function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'restore-generated-state-'))
  const origin = path.join(root, 'origin.git')
  const source = path.join(root, 'source')
  const work = path.join(root, 'work')

  git(root, 'init', '--bare', origin)
  git(root, 'init', '-b', 'dev', source)
  git(source, 'config', 'user.name', 'Test User')
  git(source, 'config', 'user.email', 'test@example.com')
  git(source, 'remote', 'add', 'origin', origin)

  for (const restorePath of restorePaths) {
    write(source, path.join(restorePath, 'state.txt'), `old:${restorePath}\n`)
  }
  git(source, 'add', '.')
  git(source, 'commit', '-m', 'old generated state')
  const oldSha = git(source, 'rev-parse', 'HEAD')
  git(source, 'push', '-u', 'origin', 'dev')

  git(root, 'clone', '--branch', 'dev', origin, work)
  git(work, 'config', 'user.name', 'Test User')
  git(work, 'config', 'user.email', 'test@example.com')

  return { root, origin, source, work, oldSha }
}

function run(work, args = []) {
  return spawnSync('bash', [scriptPath, ...args], {
    cwd: work,
    encoding: 'utf8',
  })
}

test('source supports branch and immutable ref modes with one resolved ref', () => {
  const script = fs.readFileSync(scriptPath, 'utf8')

  assert.match(script, /--ref/)
  assert.match(script, /git fetch --depth=1 origin -- "\$\{?target_ref\}?"/)
  assert.match(script, /resolved_ref=["']?origin\/\$\{?target_branch\}?/)
  assert.match(script, /resolved_ref=["']?FETCH_HEAD/)
  assert.match(script, /git ls-tree --name-only "\$\{?resolved_ref\}?" -- "\$\{?restore_path\}?"/)
  assert.match(script, /git checkout "\$\{?resolved_ref\}?" -- "\$\{?restore_path\}?"/)
  assert.doesNotMatch(script, /\beval\b/)
})

test('source preserves the fixed restore path list exactly', () => {
  const script = fs.readFileSync(scriptPath, 'utf8')
  const match = script.match(/paths=\(\n([\s\S]*?)\n\)/)
  assert.ok(match)
  const actualPaths = [...match[1].matchAll(/^\s*"([^"]+)"\s*$/gm)].map((entry) => entry[1])
  assert.deepEqual(actualPaths, restorePaths)
})

test('default branch mode restores generated state from dev and skips missing paths', () => {
  const fixture = createFixture()
  try {
    write(fixture.source, 'docs/state.txt', 'new:docs\n')
    fs.rmSync(path.join(fixture.source, 'docs-byoc'), { recursive: true })
    git(fixture.source, 'add', '-A')
    git(fixture.source, 'commit', '-m', 'advance dev')
    git(fixture.source, 'push', 'origin', 'dev')

    write(fixture.work, 'docs/state.txt', 'local\n')
    const result = run(fixture.work)

    assert.equal(result.status, 0, result.stderr)
    assert.equal(fs.readFileSync(path.join(fixture.work, 'docs/state.txt'), 'utf8'), 'new:docs\n')
    assert.match(result.stdout, /docs-byoc not found on origin\/dev; skipping/)
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true })
  }
})

test('positional dev branch remains supported', () => {
  const fixture = createFixture()
  try {
    write(fixture.work, 'reference/state.txt', 'local\n')
    const result = run(fixture.work, ['dev'])
    assert.equal(result.status, 0, result.stderr)
    assert.equal(fs.readFileSync(path.join(fixture.work, 'reference/state.txt'), 'utf8'), 'old:reference\n')
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true })
  }
})

test('positional non-dev branch restores its content and populates the remote-tracking ref', () => {
  const fixture = createFixture()
  try {
    git(fixture.source, 'switch', '-c', 'generated-snapshot')
    write(fixture.source, 'reference/state.txt', 'snapshot:reference\n')
    git(fixture.source, 'add', 'reference/state.txt')
    git(fixture.source, 'commit', '-m', 'snapshot generated state')
    const snapshotSha = git(fixture.source, 'rev-parse', 'HEAD')
    git(fixture.source, 'push', 'origin', 'generated-snapshot')

    write(fixture.work, 'reference/state.txt', 'local\n')
    const result = run(fixture.work, ['generated-snapshot'])

    assert.equal(result.status, 0, result.stderr)
    assert.equal(fs.readFileSync(path.join(fixture.work, 'reference/state.txt'), 'utf8'), 'snapshot:reference\n')
    assert.equal(git(fixture.work, 'rev-parse', 'origin/generated-snapshot'), snapshotSha)
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true })
  }
})

test('immutable commit SHA restores old content after dev advances', () => {
  const fixture = createFixture()
  try {
    write(fixture.source, 'docs/state.txt', 'new:docs\n')
    git(fixture.source, 'add', 'docs/state.txt')
    git(fixture.source, 'commit', '-m', 'advance dev')
    git(fixture.source, 'push', 'origin', 'dev')
    write(fixture.work, 'docs/state.txt', 'local\n')

    const result = run(fixture.work, ['--ref', fixture.oldSha])

    assert.equal(result.status, 0, result.stderr)
    assert.equal(fs.readFileSync(path.join(fixture.work, 'docs/state.txt'), 'utf8'), 'old:docs\n')
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true })
  }
})

test('invalid argument forms fail with usage', () => {
  const fixture = createFixture()
  try {
    for (const args of [['--ref'], ['dev', 'extra'], ['--ref', 'dev', 'extra'], ['--ref', '']]) {
      const result = run(fixture.work, args)
      assert.notEqual(result.status, 0, `expected failure for ${JSON.stringify(args)}`)
      assert.match(result.stderr, /Usage:/)
    }
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true })
  }
})

test('ref values containing newlines fail before invoking git', () => {
  const fixture = createFixture()
  try {
    const result = run(fixture.work, ['--ref', 'bad\nref'])
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /must not contain/)
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true })
  }
})

test('dash-prefixed ref values are passed after the git option separator', () => {
  const fixture = createFixture()
  try {
    const result = run(fixture.work, ['--ref', '--not-a-ref'])
    assert.notEqual(result.status, 0)
    assert.doesNotMatch(result.stderr, /unknown option|ambiguous option/)
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true })
  }
})

test('dash-prefixed positional branches are rejected before git fetch', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'restore-generated-state-no-repo-'))
  try {
    const result = run(root, ['--upload-pack=/definitely/missing'])
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /Usage:/)
    assert.doesNotMatch(result.stderr, /not a git repository|definitely\/missing/)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})
