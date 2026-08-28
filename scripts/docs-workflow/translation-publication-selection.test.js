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
  'translation/ja-JP/cpp', 'translation/zh-CN-reference/cpp',
  'translation/zh-CN-reference/reference-landings',
]

function handoff() {
  const groups = ['guides', 'python', 'java', 'node', 'go', 'cli', 'cpp', 'rest', 'reference-landings']
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
      sourceBaselineSha: ['c', 'd', 'e', 'f', 'a', 'b', 'c', 'd', 'e'][groupIndex].repeat(40),
      sourceCheckpointSha: ['e', 'f', 'a', 'b', 'c', 'd', 'e', 'f', 'a'][groupIndex].repeat(40),
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

function operatorRecoveryProvenance(overrides = {}) {
  return {
    schemaVersion: 2,
    kind: 'operator-recovery',
    sourceRepository: 'zilliztech/zdoc',
    sourceWorkflow: '.github/workflows/translate-codex.yml',
    sourceRunId: 42,
    sourceRunAttempt: 2,
    sourceWorkflowSha: 'a'.repeat(40),
    sourceToolingSha: 'b'.repeat(40),
    executionToolingSha: SHA_A,
    sourceSelectionSha256: 'e'.repeat(64),
    publicationEvidence: {publisherJob: null, progress: [], results: null, resultsAbsenceReason: 'publish_ready-absent'},
    artifacts: [{
      unit: 'ja-JP/guides', artifactId: 9, artifactName: 'translation-recovery-ja-JP-guides-42-1',
      artifactDigest: `sha256:${'f'.repeat(64)}`, batchNumber: 1, retainedFileCount: 3, sourceCandidateCount: 4,
    }],
    ...overrides,
  }
}

function recoveryPlanBytes({boundHandoff = handoff(), provenance = operatorRecoveryProvenance(), publish = true, overrides = {}} = {}) {
  const recoveryMap = Object.fromEntries(boundHandoff.units.map(unit => {
    const identity = `${unit.target}/${unit.group}`
    return [identity, {
      unitToken: identity.replaceAll('/', '-'),
      artifacts: provenance.artifacts.filter(artifact => artifact.unit === identity).map(({unit: _unit, ...artifact}) => artifact),
    }]
  }))
  const plan = {
    schemaVersion: 2,
    repository: 'zilliztech/zdoc',
    previousRunId: provenance.sourceRunId,
    previousRunAttempt: provenance.sourceRunAttempt,
    selectionSha256: provenance.sourceSelectionSha256,
    targetBranch: boundHandoff.targetBranch,
    targetBaselineSha: boundHandoff.targetBaselineSha,
    handoff: boundHandoff,
    recoveryMap,
    retainedFileCount: provenance.artifacts.reduce((sum, artifact) => sum + artifact.retainedFileCount, 0),
    sourceCandidateCount: provenance.artifacts.reduce((sum, artifact) => sum + artifact.sourceCandidateCount, 0),
    compatibilityStatus: 'pending-current-contract-preflight',
    rejectedRecoveryCount: 0,
    rejected: [],
    publish,
    provenance,
    ...overrides,
  }
  return Buffer.from(`${JSON.stringify(plan)}\n`)
}

function recoverySelectionInput(overrides = {}) {
  const recoveryProvenance = overrides.recoveryProvenance || operatorRecoveryProvenance()
  const recoveryPlan = overrides.recoveryPlanBytes || recoveryPlanBytes({provenance: recoveryProvenance})
  return selectionInput({
    recoveryProvenance,
    recoveryPlanBytes: recoveryPlan,
    recoveryPlanSha256: crypto.createHash('sha256').update(recoveryPlan).digest('hex'),
    ...overrides,
  })
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
    ...(schemaVersion === 3 ? {reconciliation: {contractVersion: 1, plan: null, approval: null, result: null}} : {}),
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
  assert.deepEqual(selection.units[1].validationCommands, ['node scripts/translation/validate-group.js --target ja-JP --group python --allow-pending'])
  assert.deepEqual(selection.units.find(unit => unit.unitKey === 'translation/zh-CN-reference/python').environment, {ZDOC_SITE: 'zh-CN'})
  assert.deepEqual(selection.units.find(unit => unit.unitKey === 'translation/ja-JP/cpp').environment, {})

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
  assert.deepEqual(reference.validationCommands, ['node scripts/translation/validate-group.js --target zh-CN-reference --group reference-landings'])
  assert.deepEqual(reference.environment, {ZDOC_SITE: 'zh-CN'})
})

test('retains schema-v2 handoff identities without widening the handoff contract', () => {
  const value = buildTranslationPublicationSelection(selectionInput({handoff: handoff()}))
  assert.equal(handoff().schemaVersion, 2)
  assert.equal(value.initialTargetSha, handoff().targetBaselineSha)
  assert.equal(value.units.every(unit => 'targetBaselineSha' in unit), false)
})

test('rejects an injected Chinese REST unit even if it claims a canonical schema-v2 handoff', () => {
  const invalid = handoff()
  invalid.units.push({
    target: 'zh-CN-reference', group: 'rest', sourceGroup: 'rest',
    sourceBaselineSha: 'c'.repeat(40), sourceCheckpointSha: 'e'.repeat(40),
    targetBaselineSha: SHA_B, publicationOrder: invalid.units.length,
  })
  assert.throws(() => buildTranslationPublicationSelection(selectionInput({handoff: invalid})), /canonical translation selection/i)
})

test('binds exact operator recovery provenance into the immutable selection checksum', () => {
  const recoveryProvenance = operatorRecoveryProvenance()
  const value = buildTranslationPublicationSelection(recoverySelectionInput({recoveryProvenance}))
  assert.deepEqual(value.inputs.recoveryProvenance, recoveryProvenance)
  const invalidArtifact = {...recoveryProvenance, artifacts: [{...recoveryProvenance.artifacts[0], artifactId: 0}]}
  assert.throws(() => buildTranslationPublicationSelection(recoverySelectionInput({
    recoveryProvenance: invalidArtifact,
    recoveryPlanBytes: recoveryPlanBytes({provenance: invalidArtifact}),
  })), /recovery provenance artifact/i)
  const wrongRepository = {...recoveryProvenance, sourceRepository: 'other/zdoc'}
  assert.throws(() => buildTranslationPublicationSelection(recoverySelectionInput({
    recoveryProvenance: wrongRepository,
    recoveryPlanBytes: recoveryPlanBytes({provenance: wrongRepository}),
  })), /recovery provenance source identity|recovery source repository/i)
  const wrongWorkflow = {...recoveryProvenance, sourceWorkflow: '.github/workflows/fetch-docs.yml'}
  assert.throws(() => buildTranslationPublicationSelection(recoverySelectionInput({
    recoveryProvenance: wrongWorkflow,
    recoveryPlanBytes: recoveryPlanBytes({provenance: wrongWorkflow}),
  })), /recovery source workflow/i)
})

test('carries an authenticated multi-group recovery subset through the publication-selection boundary', () => {
  const complete = handoff()
  const scopedHandoff = {
    ...complete,
    locale: 'ja-JP',
    group: 'all',
    units: [{...complete.units[1], publicationOrder: 0}, {...complete.units[3], publicationOrder: 1}],
  }
  const recoveryProvenance = operatorRecoveryProvenance({
    artifacts: scopedHandoff.units.map((unit, index) => ({
      unit: `${unit.target}/${unit.group}`,
      artifactId: 20 + index,
      artifactName: `translation-recovery-${unit.target}-${unit.group}-42-0`,
      artifactDigest: `sha256:${String(index + 1).repeat(64)}`,
      batchNumber: 0,
      retainedFileCount: 1,
      sourceCandidateCount: 2,
    })),
  })
  const recoveryPlan = recoveryPlanBytes({boundHandoff: scopedHandoff, provenance: recoveryProvenance})
  const selection = buildTranslationPublicationSelection(recoverySelectionInput({
    handoff: scopedHandoff,
    recoveryProvenance,
    recoveryPlanBytes: recoveryPlan,
  }))

  assert.deepEqual(selection.units.map(unit => unit.unitKey), [
    'translation/ja-JP/python',
    'translation/ja-JP/java',
  ])
  assert.deepEqual(selection.inputs.recoveryProvenance, recoveryProvenance)
})

test('rejects tampered claimed recovery provenance while the checksum-authenticated plan stays unchanged', () => {
  const provenance = operatorRecoveryProvenance()
  const planBytes = recoveryPlanBytes({provenance})
  const cases = [
    {...provenance, sourceRunId: provenance.sourceRunId + 1},
    {...provenance, executionToolingSha: SHA_C},
    {...provenance, sourceSelectionSha256: 'd'.repeat(64)},
    {...provenance, artifacts: [{...provenance.artifacts[0], artifactId: 10}]},
  ]
  for (const recoveryProvenance of cases) {
    assert.throws(() => buildTranslationPublicationSelection(recoverySelectionInput({recoveryProvenance, recoveryPlanBytes: planBytes})), /authenticated recovery plan.*provenance|recovery provenance.*plan/i)
  }
})

test('binds tooling, handoff target and unit identities, and publish mode to the authenticated recovery plan', () => {
  const provenance = operatorRecoveryProvenance()
  const planBytes = recoveryPlanBytes({provenance})
  const changedBaseline = {...handoff(), targetBaselineSha: SHA_C, units: handoff().units.map(unit => ({...unit, targetBaselineSha: SHA_C}))}
  const cases = [
    selectionInput({handoff: {...handoff(), targetBranch: 'release'}, recoveryProvenance: provenance}),
    selectionInput({handoff: changedBaseline, recoveryProvenance: provenance}),
    selectionInput({handoff: {...handoff(), units: handoff().units.map(unit => unit.group === 'python' ? {...unit, sourceCheckpointSha: SHA_D} : unit)}, recoveryProvenance: provenance}),
    selectionInput({publish: false, recoveryProvenance: provenance}),
  ]
  for (const input of cases) {
    assert.throws(() => buildTranslationPublicationSelection({
      ...input,
      recoveryPlanBytes: planBytes,
      recoveryPlanSha256: crypto.createHash('sha256').update(planBytes).digest('hex'),
    }), /authenticated recovery plan.*handoff|handoff.*plan|publish.*plan/i)
  }

  const mismatchedToolingProvenance = operatorRecoveryProvenance({executionToolingSha: SHA_C})
  const mismatchedToolingPlan = recoveryPlanBytes({provenance: mismatchedToolingProvenance})
  assert.throws(() => buildTranslationPublicationSelection(recoverySelectionInput({
    recoveryProvenance: mismatchedToolingProvenance,
    recoveryPlanBytes: mismatchedToolingPlan,
  })), /execution tooling.*selection tooling|tooling.*authenticated recovery plan/i)
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

test('accepts schema-v3 unnumbered translation manifests', () => {
  const pythonUnits = handoff().units.slice(1, 3).map((unit, publicationOrder) => ({...unit, publicationOrder}))
  const selection = buildTranslationPublicationSelection(selectionInput({handoff: {...handoff(), group: 'python', units: pythonUnits}}))
  const fixture = checkpointFixture({schemaVersion: 3})
  try {
    const ready = buildTranslationPublicationReady({
      selection,
      unitKey: 'translation/ja-JP/python',
      checkpointArchive: fixture.checkpointArchive,
      checkpointManifest: fixture.checkpointManifest,
      baselineArchive: fixture.baselineArchive,
      baselineManifest: fixture.baselineManifest,
    })
    assert.equal(ready.outcome, 'candidate')
    assert.equal(ready.artifacts.checkpoint.name, `translation-checkpoint-ja-JP-python-${RUN_ID}`)
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
