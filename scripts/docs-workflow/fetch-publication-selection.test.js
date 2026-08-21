'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {spawnSync} = require('node:child_process')
const test = require('node:test')

const {
  FETCH_UNIT_KEYS,
  buildFetchPublicationReady,
  buildFetchPublicationSelection,
  main,
} = require('./fetch-publication-selection')
const {readPublicationDocument} = require('./publication-contracts')

const SHA_A = 'a'.repeat(40)
const SHA_B = 'b'.repeat(40)
const SHA_C = 'c'.repeat(40)

function input(overrides = {}) {
  return {
    repository: 'zilliztech/zdoc',
    runId: 123,
    runAttempt: 2,
    toolingSha: SHA_A,
    targetBranch: 'dev',
    initialTargetSha: SHA_B,
    sourceBaselineSha: SHA_C,
    selectedGroup: 'all',
    publish: true,
    runTranslations: false,
    ...overrides,
  }
}

function checkpointFixture(options = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fetch-publication-selection-'))
  const archive = path.join(root, 'checkpoint-group.tar')
  const manifest = path.join(root, 'manifest.json')
  fs.writeFileSync(archive, 'archive bytes')
  fs.writeFileSync(manifest, `${JSON.stringify({
    schemaVersion: 1,
    stage: 'source',
    group: 'java',
    masterSha: SHA_A,
    devBaselineSha: SHA_C,
    createdAt: '2026-08-04T08:00:00.000Z',
    ownershipVersion: 1,
    files: options.files ?? [{path: 'reference/api/java/a.md', sha256: 'd'.repeat(64), size: 1}],
    deletions: options.deletions ?? [],
    snapshotManual: 'java',
    validation: {commands: [], passed: true},
  }, null, 2)}\n`)
  return {root, archive, manifest}
}

test('all selection contains the exact nine Fetch units in canonical business order', () => {
  const selection = buildFetchPublicationSelection(input())
  assert.deepEqual(FETCH_UNIT_KEYS, [
    'source/java', 'source/node', 'source/go', 'source/cli', 'source/cpp',
    'source/rest', 'source/python', 'source/guides-en', 'source/guides-zh-CN',
  ])
  assert.deepEqual(selection.units.map(unit => unit.unitKey), FETCH_UNIT_KEYS)
  assert.deepEqual(selection.units.map(unit => unit.producerJob), [
    'produce_java', 'produce_node', 'produce_go', 'produce_cli', 'produce_cpp',
    'produce_rest', 'produce_python', 'produce_guides', 'produce_zh_guides',
  ])
  assert.ok(selection.units.every(unit => unit.strategy === 'checkpoint'))
})

test('single groups select one unit while Guides selects both locale units', () => {
  for (const group of ['java', 'node', 'go', 'cli', 'cpp', 'rest', 'python']) {
    const selection = buildFetchPublicationSelection(input({selectedGroup: group}))
    assert.deepEqual(selection.units.map(unit => unit.unitKey), [`source/${group}`])
  }
  assert.deepEqual(buildFetchPublicationSelection(input({selectedGroup: 'guides'})).units.map(unit => unit.unitKey), [
    'source/guides-en', 'source/guides-zh-CN',
  ])
  assert.deepEqual(buildFetchPublicationSelection(input({selectedGroup: 'java,node'})).units.map(unit => unit.unitKey), [
    'source/java', 'source/node',
  ])
  assert.deepEqual(buildFetchPublicationSelection(input({selectedGroup: 'guides,python'})).units.map(unit => unit.unitKey), [
    'source/python', 'source/guides-en', 'source/guides-zh-CN',
  ])
  for (const selectedGroup of ['java node', 'unknown', '']) {
    assert.throws(() => buildFetchPublicationSelection(input({selectedGroup})), /group/i)
  }
})

test('selection binds run-scoped artifacts, commit messages, and existing publisher validation commands', () => {
  const selection = buildFetchPublicationSelection(input())
  const java = selection.units.find(unit => unit.unitKey === 'source/java')
  assert.deepEqual(java.artifacts, {checkpoint: 'docs-checkpoint-java-123', baseline: null})
  assert.equal(java.commitMessage, 'docs(java): publish SDK reference')
  for (const english of selection.units.filter(unit => unit.site === 'en')) {
    assert.deepEqual(english.validationCommands, [
      'node scripts/validate-generated-sidebars.js --site en',
    ], `${english.unitKey} must preserve the legacy publisher validation strength`)
  }
  const english = selection.units.find(unit => unit.unitKey === 'source/guides-en')
  assert.equal(english.artifacts.checkpoint, 'docs-checkpoint-guides-en-123')
  assert.deepEqual(english.environment, {ZDOC_SITE: 'en'})
})

test('Chinese Guides explicitly uses ZDOC_SITE=zh-CN and the site-qualified build', () => {
  const chinese = buildFetchPublicationSelection(input()).units.find(unit => unit.unitKey === 'source/guides-zh-CN')
  assert.deepEqual(chinese.environment, {ZDOC_SITE: 'zh-CN'})
  assert.deepEqual(chinese.validationCommands, [
    'node scripts/validate-generated-sidebars.js --site zh-CN',
    'pnpm run build:zh-CN:site',
  ])
  assert.equal(chinese.artifacts.checkpoint, 'docs-checkpoint-guides-zh-CN-123')
})

test('ready descriptors hash immutable archive/manifest bytes and derive candidate outcome', () => {
  const selection = buildFetchPublicationSelection(input({selectedGroup: 'java'}))
  const fixture = checkpointFixture()
  try {
    const ready = buildFetchPublicationReady({selection, unitKey: 'source/java', archive: fixture.archive, manifest: fixture.manifest})
    assert.equal(ready.outcome, 'candidate')
    assert.equal(ready.artifacts.checkpoint.archiveSha256, crypto.createHash('sha256').update(fs.readFileSync(fixture.archive)).digest('hex'))
    assert.equal(ready.artifacts.checkpoint.manifestSha256, crypto.createHash('sha256').update(fs.readFileSync(fixture.manifest)).digest('hex'))
    fs.writeFileSync(fixture.manifest, fs.readFileSync(fixture.manifest, 'utf8').replace('"files": [', '"files": [').replace(/\[\n      \{[\s\S]*?\n    \]/, '[]'))
    const manifest = JSON.parse(fs.readFileSync(fixture.manifest, 'utf8'))
    manifest.files = []
    manifest.deletions = []
    fs.writeFileSync(fixture.manifest, `${JSON.stringify(manifest, null, 2)}\n`)
    assert.equal(buildFetchPublicationReady({selection, unitKey: 'source/java', archive: fixture.archive, manifest: fixture.manifest}).outcome, 'no_changes_candidate')
  } finally {
    fs.rmSync(fixture.root, {recursive: true, force: true})
  }
})

test('ready descriptor refuses to redefine selection identity or accept mismatched manifests', () => {
  const selection = buildFetchPublicationSelection(input({selectedGroup: 'java'}))
  const fixture = checkpointFixture()
  try {
    const changed = JSON.parse(fs.readFileSync(fixture.manifest, 'utf8'))
    changed.group = 'node'
    fs.writeFileSync(fixture.manifest, `${JSON.stringify(changed)}\n`)
    assert.throws(() => buildFetchPublicationReady({selection, unitKey: 'source/java', archive: fixture.archive, manifest: fixture.manifest}), /group mismatch/i)
    assert.throws(() => buildFetchPublicationReady({selection, unitKey: 'source/node', archive: fixture.archive, manifest: fixture.manifest}), /not selected/i)
  } finally {
    fs.rmSync(fixture.root, {recursive: true, force: true})
  }
})

test('selection and ready CLI modes write validated documents from explicit facts', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fetch-publication-selection-cli-'))
  const selectionFile = path.join(root, 'publication-selection.json')
  const fixture = checkpointFixture()
  try {
    main(['selection',
      '--repository', 'zilliztech/zdoc', '--run-id', '123', '--run-attempt', '2',
      '--tooling-sha', SHA_A, '--target-branch', 'dev', '--initial-target-sha', SHA_B,
      '--source-baseline-sha', SHA_C, '--selected-group', 'java', '--publish', 'true',
      '--run-translations', 'false', '--output', selectionFile,
    ], {})
    const selected = readPublicationDocument(selectionFile, 'publication-selection')
    assert.deepEqual(selected.units.map(unit => unit.unitKey), ['source/java'])
    const readyFile = path.join(root, 'publication-ready.json')
    main(['ready', '--selection', selectionFile, '--unit-key', 'source/java', '--archive', fixture.archive, '--manifest', fixture.manifest, '--output', readyFile], {})
    assert.equal(readPublicationDocument(readyFile, 'publication-ready', {selection: selected}).unitKey, 'source/java')
  } finally {
    fs.rmSync(root, {recursive: true, force: true})
    fs.rmSync(fixture.root, {recursive: true, force: true})
  }
})

test('CLI help exposes only selection and ready modes', () => {
  const script = require.resolve('./fetch-publication-selection')
  const result = spawnSync(process.execPath, [script, '--help'], {encoding: 'utf8'})
  assert.equal(result.status, 0)
  assert.match(result.stdout, /selection/)
  assert.match(result.stdout, /ready/)
  assert.doesNotMatch(result.stdout, /progress|results/)
})
