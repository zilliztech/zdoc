'use strict'

const assert = require('node:assert/strict')
const { execFileSync, spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { createCheckpointArtifact } = require('./docs-workflow/create-checkpoint-artifact')

const scriptPath = path.resolve('scripts/restore-generated-state.sh')
const restorePaths = [
  'docs',
  'docs-byoc',
  'reference',
  'i18n',
  '.translation-cache',
  'config/generated',
  'plugins/lark-docs/meta/snapshots',
  'plugins/lark-docs/meta/assembly',
  'plugins/lark-docs/meta/reports',
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
    assert.equal(fs.readFileSync(path.join(fixture.work, 'docs-byoc/state.txt'), 'utf8'), 'old:docs-byoc\n')
    assert.match(result.stdout, /docs-byoc not found on origin\/dev; skipping/)
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true })
  }
})

test('exact immutable ref mode removes managed paths absent from the source commit', () => {
  const fixture = createFixture()
  try {
    fs.rmSync(path.join(fixture.source, 'config/generated'), { recursive: true })
    git(fixture.source, 'add', '-A')
    git(fixture.source, 'commit', '-m', 'remove generated config')
    const sourceSha = git(fixture.source, 'rev-parse', 'HEAD')
    git(fixture.source, 'push', 'origin', 'dev')

    assert.equal(fs.existsSync(path.join(fixture.work, 'config/generated/state.txt')), true)
    const result = run(fixture.work, ['--exact', '--ref', sourceSha])

    assert.equal(result.status, 0, result.stderr)
    assert.equal(fs.existsSync(path.join(fixture.work, 'config/generated')), false)
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true })
  }
})

test('exact restore carries the Guides descriptor and translation checkpoints do not delete it', async () => {
  const fixture = createFixture()
  const descriptor = 'plugins/lark-docs/meta/assembly/guides.json'
  try {
    write(fixture.source, descriptor, '{"schemaVersion":1}\n')
    git(fixture.source, 'add', descriptor)
    git(fixture.source, 'commit', '-m', 'add guides assembly descriptor')
    const sourceSha = git(fixture.source, 'rev-parse', 'HEAD')
    git(fixture.source, 'push', 'origin', 'dev')

    const restored = run(fixture.work, ['--exact', '--ref', sourceSha])
    assert.equal(restored.status, 0, restored.stderr)
    assert.equal(fs.readFileSync(path.join(fixture.work, descriptor), 'utf8'), '{"schemaVersion":1}\n')

    const baselineDir = path.join(fixture.root, 'checkpoint-baseline')
    const workspace = path.join(fixture.root, 'checkpoint-workspace')
    const output = path.join(fixture.root, 'checkpoint-artifact')
    const restoredDescriptor = fs.readFileSync(path.join(fixture.work, descriptor))
    for (const root of [baselineDir, workspace]) {
      write(root, descriptor, restoredDescriptor)
      write(root, '.translation-cache/ja-JP.json', '{"files":{}}')
    }
    const manifest = await createCheckpointArtifact({
      group: 'guides', masterSha: 'a'.repeat(40), devBaselineSha: sourceSha,
      baselineDir, workspace, output, includeTranslationCache: true,
    })
    assert.equal(manifest.files.some((file) => file.path === descriptor), true)
    assert.equal(manifest.deletions.includes(descriptor), false)
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true })
  }
})

test('exact restore carries Guides report payloads used by translation checkpoints', async () => {
  const fixture = createFixture()
  const report = 'plugins/lark-docs/meta/reports/guides-incremental-fetch-plan.json'
  try {
    write(fixture.source, report, '{"generated_at":"source"}\n')
    git(fixture.source, 'add', report)
    git(fixture.source, 'commit', '-m', 'advance guides report')
    const sourceSha = git(fixture.source, 'rev-parse', 'HEAD')
    git(fixture.source, 'push', 'origin', 'dev')

    write(fixture.work, report, '{"generated_at":"tooling"}\n')
    const result = run(fixture.work, ['--exact', '--ref', sourceSha])

    assert.equal(result.status, 0, result.stderr)
    assert.equal(fs.readFileSync(path.join(fixture.work, report), 'utf8'), '{"generated_at":"source"}\n')
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true })
  }
})

test('immutable ref restore preserves existing commit ancestry', () => {
  const fixture = createFixture()
  try {
    write(fixture.source, 'docs/state.txt', 'new:docs\n')
    git(fixture.source, 'add', 'docs/state.txt')
    git(fixture.source, 'commit', '-m', 'advance generated state')
    const sourceSha = git(fixture.source, 'rev-parse', 'HEAD')
    git(fixture.source, 'push', 'origin', 'dev')
    git(fixture.work, 'fetch', 'origin', 'dev')

    assert.equal(git(fixture.work, 'rev-parse', `${sourceSha}^`), fixture.oldSha)

    const result = run(fixture.work, ['--exact', '--ref', sourceSha])

    assert.equal(result.status, 0, result.stderr)
    assert.equal(git(fixture.work, 'rev-parse', `${sourceSha}^`), fixture.oldSha)
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
    for (const args of [['--ref'], ['--exact'], ['dev', 'extra'], ['--ref', 'dev', 'extra'], ['--ref', ''], ['--exact', '--exact', 'dev']]) {
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

test('refspec-like positional branches are rejected before fetch can create a local ref', () => {
  const fixture = createFixture()
  try {
    const result = run(fixture.work, ['dev:refs/heads/injected'])
    const injectedRef = spawnSync('git', ['show-ref', '--verify', '--quiet', 'refs/heads/injected'], {
      cwd: fixture.work,
      encoding: 'utf8',
    })

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /Usage:/)
    assert.equal(injectedRef.status, 1, 'fetch must not create refs/heads/injected')
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true })
  }
})
