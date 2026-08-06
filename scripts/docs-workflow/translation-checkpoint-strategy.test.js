'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const {execFileSync} = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {translationCheckpointStrategy} = require('./translation-checkpoint-strategy')
const {validateTranslationCheckpointPair} = require('./validate-checkpoint-artifact')

function git(cwd, ...args) {
  return execFileSync('git', args, {cwd, encoding: 'utf8'}).trim()
}

function put(root, relative, contents) {
  const file = path.join(root, relative)
  fs.mkdirSync(path.dirname(file), {recursive: true})
  fs.writeFileSync(file, contents)
}

function setup() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-checkpoint-strategy-'))
  const repository = path.join(root, 'repository')
  const runnerTemp = path.join(root, 'runner')
  fs.mkdirSync(repository)
  fs.mkdirSync(runnerTemp)
  git(repository, 'init')
  git(repository, 'config', 'user.name', 'Test')
  git(repository, 'config', 'user.email', 'test@example.com')
  put(repository, 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md', 'old\n')
  put(repository, '.translation-cache/ja-JP.json', `${JSON.stringify({files: {a: {sourceHash: 'old', targetPath: 'a.md', translatedAt: '2026-08-01T00:00:00.000Z'}}}, null, 2)}\n`)
  put(repository, 'tooling.txt', 'pinned\n')
  git(repository, 'add', '.')
  git(repository, 'commit', '-m', 'baseline')
  return {root, repository, runnerTemp, baselineSha: git(repository, 'rev-parse', 'HEAD')}
}

function manifestArtifact(fixture, name, values, overrides = {}) {
  const directory = path.join(fixture.root, name)
  const payload = path.join(directory, 'payload')
  const files = []
  for (const [relative, contents] of Object.entries(values).sort(([left], [right]) => left.localeCompare(right, 'en'))) {
    const bytes = Buffer.from(contents)
    put(payload, relative, bytes)
    files.push({path: relative, size: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex')})
  }
  const manifest = {
    schemaVersion: 1,
    stage: 'translation',
    group: 'guides',
    masterSha: fixture.baselineSha,
    devBaselineSha: fixture.baselineSha,
    createdAt: '2026-08-06T00:00:00.000Z',
    ownershipVersion: 1,
    files,
    deletions: [],
    snapshotManual: 'guides',
    translationTarget: 'ja-JP',
    sourceSite: 'en',
    targetSite: 'en',
    sourceCheckpointSha: fixture.baselineSha,
    toolingSha: fixture.baselineSha,
    validation: {commands: [], passed: true},
    ...overrides,
  }
  put(directory, 'manifest.json', `${JSON.stringify(manifest, null, 2)}\n`)
  return directory
}

function artifactValues(content = 'old\n', cache = null) {
  return {
    '.translation-cache/ja-JP.json': cache || `${JSON.stringify({files: {a: {sourceHash: 'old', targetPath: 'a.md', translatedAt: '2026-08-01T00:00:00.000Z'}}}, null, 2)}\n`,
    'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md': content,
  }
}

async function inputs(fixture, checkpointValues, baselineValues = artifactValues(), unitOverrides = {}, manifestOverrides = {}) {
  const checkpointDir = manifestArtifact(fixture, `checkpoint-${Math.random()}`, checkpointValues, manifestOverrides)
  const baselineDir = manifestArtifact(fixture, `baseline-${Math.random()}`, baselineValues, manifestOverrides)
  const authenticated = await validateTranslationCheckpointPair({checkpointDir, baselineDir})
  return {
    repositoryRoot: fixture.repository,
    dependencyRoot: fixture.repository,
    runnerTemp: fixture.runnerTemp,
    checkpoint: authenticated.checkpoint,
    baseline: authenticated.baseline,
    unit: {
      unitKey: 'translation/ja-JP/guides',
      strategy: 'checkpoint',
      target: 'ja-JP',
      group: 'guides',
      toolingSha: fixture.baselineSha,
      sourceCheckpointSha: fixture.baselineSha,
      targetBranch: 'dev',
      commitMessage: 'i18n(ja-JP): publish guides translations',
      validationCommands: ['test "$(cat i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md)" = new'],
      environment: {},
      ...unitOverrides,
    },
    now: () => new Date('2026-08-06T08:00:00.000Z'),
  }
}

test('compose applies checkpoint changes onto the latest dev tip as one detached commit with provenance', async t => {
  const fixture = setup()
  t.after(() => fs.rmSync(fixture.root, {recursive: true, force: true}))
  put(fixture.repository, 'latest.txt', 'preserve\n')
  git(fixture.repository, 'add', 'latest.txt')
  git(fixture.repository, 'commit', '-m', 'latest tip')
  const latestDevSha = git(fixture.repository, 'rev-parse', 'HEAD')

  const candidate = await translationCheckpointStrategy.compose({
    latestDevSha,
    inputs: await inputs(fixture, artifactValues('new\n')),
  })

  assert.equal(candidate.status, 'candidate')
  assert.match(candidate.candidateSha, /^[0-9a-f]{40}$/)
  assert.deepEqual(candidate.commitShas, [candidate.candidateSha])
  assert.equal(git(fixture.repository, 'rev-parse', `${candidate.candidateSha}^`), latestDevSha)
  assert.equal(git(fixture.repository, 'show', `${candidate.candidateSha}:latest.txt`), 'preserve')
  assert.equal(git(fixture.repository, 'show', `${candidate.candidateSha}:i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md`), 'new')
  assert.match(git(fixture.repository, 'show', '-s', '--format=%B', candidate.candidateSha), new RegExp(`sourceCheckpointSha: ${fixture.baselineSha}`))
  assert.match(git(fixture.repository, 'show', '-s', '--format=%B', candidate.candidateSha), new RegExp(`toolingSha: ${fixture.baselineSha}`))
})
test('compose performs a three-way translation cache merge', async t => {
  const fixture = setup()
  t.after(() => fs.rmSync(fixture.root, {recursive: true, force: true}))
  const producerCache = `${JSON.stringify({files: {
    a: {sourceHash: 'new', targetPath: 'a.md', translatedAt: '2026-08-06T00:00:00.000Z'},
  }}, null, 2)}\n`
  const targetCache = JSON.parse(fs.readFileSync(path.join(fixture.repository, '.translation-cache/ja-JP.json'), 'utf8'))
  targetCache.files.b = {sourceHash: 'parallel', targetPath: 'b.md', translatedAt: '2026-08-05T00:00:00.000Z'}
  put(fixture.repository, '.translation-cache/ja-JP.json', `${JSON.stringify(targetCache, null, 2)}\n`)
  git(fixture.repository, 'add', '.')
  git(fixture.repository, 'commit', '-m', 'parallel cache update')

  const candidate = await translationCheckpointStrategy.compose({
    latestDevSha: git(fixture.repository, 'rev-parse', 'HEAD'),
    inputs: await inputs(fixture, artifactValues('new\n', producerCache)),
  })
  const merged = JSON.parse(git(fixture.repository, 'show', `${candidate.candidateSha}:.translation-cache/ja-JP.json`))
  assert.equal(merged.files.a.sourceHash, 'new')
  assert.equal(merged.files.b.sourceHash, 'parallel')
})

test('compose rejects divergent content and translation cache conflicts', async t => {
  const fixture = setup()
  t.after(() => fs.rmSync(fixture.root, {recursive: true, force: true}))
  put(fixture.repository, 'i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md', 'parallel\n')
  git(fixture.repository, 'add', '.')
  git(fixture.repository, 'commit', '-m', 'parallel content update')
  await assert.rejects(translationCheckpointStrategy.compose({
    latestDevSha: git(fixture.repository, 'rev-parse', 'HEAD'),
    inputs: await inputs(fixture, artifactValues('new\n')),
  }), /content conflict/i)

  git(fixture.repository, 'reset', '--hard', fixture.baselineSha)
  const targetCache = JSON.parse(fs.readFileSync(path.join(fixture.repository, '.translation-cache/ja-JP.json'), 'utf8'))
  targetCache.files.a.sourceHash = 'parallel'
  put(fixture.repository, '.translation-cache/ja-JP.json', `${JSON.stringify(targetCache, null, 2)}\n`)
  git(fixture.repository, 'add', '.')
  git(fixture.repository, 'commit', '-m', 'parallel cache conflict')
  const producerCache = JSON.parse(fs.readFileSync(path.join(fixture.repository, '.translation-cache/ja-JP.json'), 'utf8'))
  producerCache.files.a.sourceHash = 'producer'
  await assert.rejects(translationCheckpointStrategy.compose({
    latestDevSha: git(fixture.repository, 'rev-parse', 'HEAD'),
    inputs: await inputs(fixture, artifactValues('old\n', `${JSON.stringify(producerCache, null, 2)}\n`)),
  }), /translation cache conflict/i)
})

test('compose returns the exact no_changes result when the checkpoint adds nothing to the latest tip', async t => {
  const fixture = setup()
  t.after(() => fs.rmSync(fixture.root, {recursive: true, force: true}))
  const result = await translationCheckpointStrategy.compose({
    latestDevSha: fixture.baselineSha,
    inputs: await inputs(fixture, artifactValues()),
  })
  assert.deepEqual(result, {status: 'no_changes'})
})

test('validate runs pinned commands against the candidate and returns exact receipts', async t => {
  const fixture = setup()
  t.after(() => fs.rmSync(fixture.root, {recursive: true, force: true}))
  const strategyInputs = await inputs(fixture, artifactValues('new\n'))
  const candidate = await translationCheckpointStrategy.compose({latestDevSha: fixture.baselineSha, inputs: strategyInputs})
  const validation = await translationCheckpointStrategy.validate({candidate})

  assert.deepEqual(validation.validationReceipts, [{
    command: strategyInputs.unit.validationCommands[0],
    exitCode: 0,
    startedAt: '2026-08-06T08:00:00.000Z',
    completedAt: '2026-08-06T08:00:00.000Z',
    candidateSha: candidate.candidateSha,
    target: 'ja-JP',
    group: 'guides',
    sourceCheckpointSha: fixture.baselineSha,
    toolingSha: fixture.baselineSha,
  }])
})

test('validate uses pinned tooling with the complete generated state from the exact candidate', async t => {
  const fixture = setup()
  t.after(() => fs.rmSync(fixture.root, {recursive: true, force: true}))
  put(fixture.repository, 'content/en/reference/latest-generated.md', 'latest generated\n')
  put(fixture.repository, 'tooling.txt', 'latest tooling\n')
  git(fixture.repository, 'add', '.')
  git(fixture.repository, 'commit', '-m', 'latest generated state and tooling')
  const latestDevSha = git(fixture.repository, 'rev-parse', 'HEAD')
  const strategyInputs = await inputs(fixture, artifactValues('new\n'), artifactValues(), {
    validationCommands: [
      'test "$(cat content/en/reference/latest-generated.md)" = "latest generated"',
      'test "$(cat tooling.txt)" = "pinned"',
      'test "$(cat i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/a.md)" = "new"',
    ],
  })
  const candidate = await translationCheckpointStrategy.compose({latestDevSha, inputs: strategyInputs})

  const validation = await translationCheckpointStrategy.validate({candidate})

  assert.deepEqual(validation.validationReceipts.map(receipt => receipt.exitCode), [0, 0, 0])
})

test('validate cleans the publication candidate when pinned tooling setup fails', async t => {
  const fixture = setup()
  t.after(() => fs.rmSync(fixture.root, {recursive: true, force: true}))
  const unavailableToolingSha = 'f'.repeat(40)
  const strategyInputs = await inputs(
    fixture,
    artifactValues('new\n'),
    artifactValues(),
    {toolingSha: unavailableToolingSha},
    {masterSha: unavailableToolingSha, toolingSha: unavailableToolingSha},
  )
  const candidate = await translationCheckpointStrategy.compose({
    latestDevSha: fixture.baselineSha,
    inputs: strategyInputs,
  })

  await assert.rejects(
    translationCheckpointStrategy.validate({candidate}),
    /invalid reference|not a valid object|unknown revision/i,
  )

  const registeredWorktrees = git(fixture.repository, 'worktree', 'list', '--porcelain')
  assert.equal(registeredWorktrees.includes(`worktree ${candidate.publicationWorktree}`), false)
})
