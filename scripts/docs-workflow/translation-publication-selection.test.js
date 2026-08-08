'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {
  TRANSLATION_UNIT_KEYS,
  buildTranslationPublicationReady,
  buildTranslationPublicationSelection,
} = require('./translation-publication-selection')

const SHA_A = 'a'.repeat(40)
const SHA_B = 'b'.repeat(40)
const SHA_C = 'c'.repeat(40)
const SHA_D = 'd'.repeat(40)
const RUN_ID = 30902650444

const EXPECTED_UNIT_KEYS = [
  'translation/ja-JP/guides',
  'translation/ja-JP/python', 'translation/zh-CN-reference/python',
  'translation/ja-JP/java', 'translation/zh-CN-reference/java',
  'translation/ja-JP/node', 'translation/zh-CN-reference/node',
  'translation/ja-JP/go', 'translation/zh-CN-reference/go',
  'translation/ja-JP/cli', 'translation/zh-CN-reference/cli',
  'translation/ja-JP/rest', 'translation/zh-CN-reference/rest',
  'translation/zh-CN-reference/reference-landings',
]

function handoff() {
  const groups = ['guides', 'python', 'java', 'node', 'go', 'cli', 'rest', 'reference-landings']
  const selectedUnitKeys = EXPECTED_UNIT_KEYS.slice(0, -1)
  return {
    schemaVersion: 2,
    locale: 'all',
    group: 'all',
    toolingSha: SHA_A,
    targetBranch: 'dev',
    targetBaselineSha: SHA_B,
    units: selectedUnitKeys.map((unitKey, index) => {
      const [, target, group] = unitKey.split('/')
      const groupIndex = groups.indexOf(group)
      return {
        target,
        group,
        sourceGroup: group,
      sourceBaselineSha: ['c', 'd', 'e', 'f', 'a', 'b', 'c', 'd'][groupIndex].repeat(40),
      sourceCheckpointSha: ['e', 'f', 'a', 'b', 'c', 'd', 'e', 'f'][groupIndex].repeat(40),
        targetBaselineSha: SHA_B,
        publicationOrder: index,
      }
    }),
  }
}

function selectionInput(overrides = {}) {
  return {
    handoff: handoff(),
    repository: 'zilliztech/zdoc',
    runId: RUN_ID,
    runAttempt: 2,
    publish: true,
    runTranslations: true,
    ...overrides,
  }
}

function checkpointFixture({schemaVersion = 1, translationTarget = 'ja-JP'} = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-publication-selection-'))
  const checkpointArchive = path.join(root, 'checkpoint-group.tar')
  const checkpointManifest = path.join(root, 'checkpoint-manifest.json')
  const baselineArchive = path.join(root, 'baseline-group.tar')
  const baselineManifest = path.join(root, 'baseline-manifest.json')
  fs.writeFileSync(checkpointArchive, 'checkpoint archive')
  fs.writeFileSync(baselineArchive, 'baseline archive')
  const manifest = {
    schemaVersion,
    stage: 'translation',
    group: 'python',
    masterSha: SHA_A,
    devBaselineSha: 'f'.repeat(40),
    translationTarget,
    sourceCheckpointSha: 'f'.repeat(40),
    toolingSha: SHA_A,
    files: [{path: 'i18n/ja-JP/python.md', sha256: SHA_A.repeat(2).slice(0, 64), size: 1}],
    deletions: [],
    validation: {commands: [], passed: true},
  }
  fs.writeFileSync(checkpointManifest, `${JSON.stringify(manifest)}\n`)
  fs.writeFileSync(baselineManifest, `${JSON.stringify(manifest)}\n`)
  return {root, checkpointArchive, checkpointManifest, baselineArchive, baselineManifest}
}

test('builds all Translation publication units in the canonical ready-descriptor order', () => {
  const selection = buildTranslationPublicationSelection(selectionInput())
  assert.deepEqual(TRANSLATION_UNIT_KEYS, EXPECTED_UNIT_KEYS)
  assert.equal(selection.schemaVersion, 1)
  assert.equal(selection.inputs.selectedGroup, 'all')
  assert.equal(selection.toolingSha, SHA_A)
  assert.equal(selection.initialTargetSha, SHA_B)
  assert.deepEqual(selection.units.map(unit => unit.unitKey), EXPECTED_UNIT_KEYS.slice(0, -1))

  for (const unit of selection.units) {
    const handoffUnit = handoff().units.find(candidate => candidate.target === unit.target && candidate.group === unit.group)
    assert.equal(unit.sourceBaselineSha, handoffUnit.sourceBaselineSha, unit.unitKey)
    assert.equal(unit.sourceCheckpointSha, handoffUnit.sourceCheckpointSha, unit.unitKey)
    assert.equal(unit.toolingSha, SHA_A, unit.unitKey)
    assert.equal(unit.targetBranch, 'dev', unit.unitKey)
    assert.equal(unit.artifacts.checkpoint, `translation-checkpoint-${unit.target}-${unit.group}-${RUN_ID}`, unit.unitKey)
    assert.equal(unit.artifacts.baseline, `translation-baseline-${unit.target}-${unit.group}-${RUN_ID}`, unit.unitKey)
    assert.ok(unit.commitMessage.length > 0, unit.unitKey)
    assert.ok(unit.validationCommands.length > 0, unit.unitKey)
    assert.equal(typeof unit.environment, 'object', unit.unitKey)
  }

  const guides = selection.units[0]
  assert.equal(guides.strategy, 'ja-guides')
  assert.equal(guides.producerJob, 'prepare_guides_publication_ready')
  assert.equal(selection.units[1].producerJob, 'translate:ja-JP/python')
  assert.deepEqual(selection.units[1].validationCommands, ['node scripts/translation/validate-group.js --target ja-JP --group python'])
  assert.deepEqual(selection.units.at(-1).environment, {ZDOC_SITE: 'zh-CN'})

  const referenceHandoff = {
    ...handoff(), locale: 'zh-CN', group: 'reference-landings',
    units: [{
      target: 'zh-CN-reference', group: 'reference-landings', sourceGroup: 'reference-landings',
      sourceBaselineSha: 'd'.repeat(40), sourceCheckpointSha: 'f'.repeat(40),
      targetBaselineSha: SHA_B, publicationOrder: 0,
    }],
  }
  const reference = buildTranslationPublicationSelection(selectionInput({handoff: referenceHandoff})).units[0]
  assert.equal(reference.unitKey, 'translation/zh-CN-reference/reference-landings')
  assert.equal(reference.producerJob, 'translate:zh-CN-reference/reference-landings')
  assert.deepEqual(reference.environment, {ZDOC_SITE: 'zh-CN'})
})

test('retains schema-v2 handoff identities without widening the handoff contract', () => {
  const value = buildTranslationPublicationSelection(selectionInput({handoff: handoff()}))
  assert.equal(handoff().schemaVersion, 2)
  assert.equal(value.initialTargetSha, handoff().targetBaselineSha)
  assert.equal(value.units.every(unit => 'targetBaselineSha' in unit), false)
})

test('binds exact operator recovery provenance into the immutable selection checksum', () => {
  const recoveryProvenance = {
    schemaVersion: 2,
    kind: 'operator-recovery',
    sourceRepository: 'zilliztech/zdoc',
    sourceWorkflow: '.github/workflows/translate-codex.yml',
    sourceRunId: 42,
    sourceRunAttempt: 2,
    sourceWorkflowSha: 'a'.repeat(40),
    sourceToolingSha: 'b'.repeat(40),
    executionToolingSha: 'c'.repeat(40),
    sourceSelectionSha256: 'e'.repeat(64),
    publicationEvidence: {publisherJob: null, progress: [], results: null, resultsAbsenceReason: 'publish_ready-absent'},
    artifacts: [{
      unit: 'ja-JP/guides', artifactId: 9, artifactName: 'translation-recovery-ja-JP-guides-42-1',
      artifactDigest: `sha256:${'f'.repeat(64)}`, batchNumber: 1, retainedFileCount: 3, sourceCandidateCount: 4,
    }],
  }
  const value = buildTranslationPublicationSelection(selectionInput({recoveryProvenance}))
  assert.deepEqual(value.inputs.recoveryProvenance, recoveryProvenance)
  assert.throws(() => buildTranslationPublicationSelection(selectionInput({
    recoveryProvenance: {...recoveryProvenance, artifacts: [{...recoveryProvenance.artifacts[0], artifactId: 0}]},
  })), /recovery provenance artifact/i)
  assert.throws(() => buildTranslationPublicationSelection(selectionInput({
    recoveryProvenance: {...recoveryProvenance, sourceRepository: 'other/zdoc'},
  })), /recovery source repository/i)
  assert.throws(() => buildTranslationPublicationSelection(selectionInput({
    recoveryProvenance: {...recoveryProvenance, sourceWorkflow: '.github/workflows/fetch-docs.yml'},
  })), /recovery source workflow/i)
})

test('accepts schema-v1 unnumbered translation manifests and hashes both immutable artifacts', () => {
  const pythonUnits = handoff().units.slice(1, 3).map((unit, publicationOrder) => ({...unit, publicationOrder}))
  const selection = buildTranslationPublicationSelection(selectionInput({handoff: {...handoff(), group: 'python', units: pythonUnits}}))
  const fixture = checkpointFixture()
  try {
    const ready = buildTranslationPublicationReady({
      selection,
      unitKey: 'translation/ja-JP/python',
      checkpointArchive: fixture.checkpointArchive,
      checkpointManifest: fixture.checkpointManifest,
      baselineArchive: fixture.baselineArchive,
      baselineManifest: fixture.baselineManifest,
    })
    assert.equal(ready.unitKey, 'translation/ja-JP/python')
    assert.equal(ready.outcome, 'candidate')
    assert.equal(ready.artifacts.checkpoint.name, `translation-checkpoint-ja-JP-python-${RUN_ID}`)
    assert.equal(ready.artifacts.baseline.name, `translation-baseline-ja-JP-python-${RUN_ID}`)
    assert.equal(ready.artifacts.checkpoint.archiveSha256, crypto.createHash('sha256').update(fs.readFileSync(fixture.checkpointArchive)).digest('hex'))
    assert.equal(ready.artifacts.baseline.manifestSha256, crypto.createHash('sha256').update(fs.readFileSync(fixture.baselineManifest)).digest('hex'))
  } finally {
    fs.rmSync(fixture.root, {recursive: true, force: true})
  }
})

test('rejects schema-v2 manifests for an unnumbered Translation checkpoint', () => {
  const pythonUnits = handoff().units.slice(1, 3).map((unit, publicationOrder) => ({...unit, publicationOrder}))
  const selection = buildTranslationPublicationSelection(selectionInput({handoff: {...handoff(), group: 'python', units: pythonUnits}}))
  const fixture = checkpointFixture({schemaVersion: 2})
  try {
    assert.throws(() => buildTranslationPublicationReady({
      selection,
      unitKey: 'translation/ja-JP/python',
      checkpointArchive: fixture.checkpointArchive,
      checkpointManifest: fixture.checkpointManifest,
      baselineArchive: fixture.baselineArchive,
      baselineManifest: fixture.baselineManifest,
    }), /checkpoint manifest.*selected identity/i)
  } finally {
    fs.rmSync(fixture.root, {recursive: true, force: true})
  }
})

test('rejects a Japanese checkpoint manifest for a selected Chinese Reference unit', () => {
  const pythonUnits = handoff().units.slice(1, 3).map((unit, publicationOrder) => ({...unit, publicationOrder}))
  const selection = buildTranslationPublicationSelection(selectionInput({handoff: {...handoff(), group: 'python', units: pythonUnits}}))
  const fixture = checkpointFixture({translationTarget: 'ja-JP'})
  try {
    assert.throws(() => buildTranslationPublicationReady({
      selection,
      unitKey: 'translation/zh-CN-reference/python',
      checkpointArchive: fixture.checkpointArchive,
      checkpointManifest: fixture.checkpointManifest,
      baselineArchive: fixture.baselineArchive,
      baselineManifest: fixture.baselineManifest,
    }), /translation target.*mismatch|checkpoint manifest.*selected identity/i)
  } finally {
    fs.rmSync(fixture.root, {recursive: true, force: true})
  }
})

test('builds a no-changes ready descriptor for an authenticated zero-batch Guides set', () => {
  const guideHandoff = {...handoff(), group: 'guides', units: [handoff().units[0]]}
  const selection = buildTranslationPublicationSelection(selectionInput({handoff: guideHandoff}))
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-publication-guides-empty-'))
  const checkpointArchive = path.join(root, 'checkpoint-group.tar')
  const baselineArchive = path.join(root, 'baseline-group.tar')
  const checkpointManifest = path.join(root, 'checkpoint-manifest.json')
  const baselineManifest = path.join(root, 'baseline-manifest.json')
  const manifest = {
    schemaVersion: 1,
    stage: 'translation-guides-batch-set',
    group: 'guides',
    runId: RUN_ID,
    runAttempt: 2,
    sourceCheckpointSha: 'e'.repeat(40),
    toolingSha: SHA_A,
    targetSha: SHA_B,
    batchCount: 0,
    pendingSetSha256: 'a'.repeat(64),
  }
  try {
    fs.writeFileSync(checkpointArchive, 'empty checkpoint archive')
    fs.writeFileSync(baselineArchive, 'empty baseline archive')
    fs.writeFileSync(checkpointManifest, `${JSON.stringify(manifest)}\n`)
    fs.writeFileSync(baselineManifest, `${JSON.stringify(manifest)}\n`)
    const ready = buildTranslationPublicationReady({selection, unitKey: 'translation/ja-JP/guides', checkpointArchive, checkpointManifest, baselineArchive, baselineManifest})
    assert.equal(ready.outcome, 'no_changes_candidate')
    assert.equal(ready.artifacts.checkpoint.name, `translation-checkpoint-ja-JP-guides-${RUN_ID}`)
    assert.equal(ready.artifacts.baseline.name, `translation-baseline-ja-JP-guides-${RUN_ID}`)
    assert.equal(ready.artifacts.checkpoint.manifestSha256, crypto.createHash('sha256').update(fs.readFileSync(checkpointManifest)).digest('hex'))
    assert.equal(ready.artifacts.baseline.manifestSha256, crypto.createHash('sha256').update(fs.readFileSync(baselineManifest)).digest('hex'))
    manifest.runAttempt = 3
    fs.writeFileSync(baselineManifest, `${JSON.stringify(manifest)}\n`)
    assert.throws(() => buildTranslationPublicationReady({selection, unitKey: 'translation/ja-JP/guides', checkpointArchive, checkpointManifest, baselineArchive, baselineManifest}), /batch-set manifest.*selected identity/i)
  } finally {
    fs.rmSync(root, {recursive: true, force: true})
  }
})
