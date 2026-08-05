'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {
  artifactNames,
  canonicalJson,
  finalizePublicationSelection,
  readPublicationDocument,
  unitToken,
  validatePublicationProgress,
  validatePublicationReady,
  validatePublicationResults,
  validatePublicationSelection,
  writePublicationDocument,
} = require('./publication-contracts')

const SHA_A = 'a'.repeat(40)
const SHA_B = 'b'.repeat(40)
const SHA_C = 'c'.repeat(40)
const SUM_A = 'a'.repeat(64)
const SUM_B = 'b'.repeat(64)
const COMPLETED_AT = '2026-08-04T08:00:00.000Z'

const fetchSelection = Object.freeze({
  schemaVersion: 1,
  document: 'publication-selection',
  workflow: 'fetch',
  repository: 'zilliztech/zdoc',
  runId: 987654,
  runAttempt: 2,
  toolingSha: SHA_A,
  targetBranch: 'dev',
  initialTargetSha: SHA_C,
  sourceBaselineSha: SHA_B,
  inputs: {selectedGroup: 'guides', publish: true, runTranslations: true},
  units: [{
    unitKey: 'source/guides-en',
    producerJob: 'produce_en_guides',
    strategy: 'checkpoint',
    site: 'en',
    group: 'guides',
    translationSourceGroup: 'guides',
    toolingSha: SHA_A,
    sourceBaselineSha: SHA_B,
    targetBranch: 'dev',
    artifacts: {
      checkpoint: 'docs-checkpoint-guides-en-987654',
      baseline: 'docs-baseline-guides-en-987654',
    },
    commitMessage: 'docs(guides): publish fetched content',
    validationCommands: ['pnpm validate:docs --site en'],
    environment: {},
  }],
  selectionSha256: '18da6f56ecc6230dc0ee3adc660449df1c9d96de69e7fcf7cc343a05e8a030ac',
})

const fetchReady = Object.freeze({
  schemaVersion: 1,
  document: 'publication-ready',
  workflow: 'fetch',
  repository: fetchSelection.repository,
  runId: fetchSelection.runId,
  runAttempt: fetchSelection.runAttempt,
  selectionSha256: fetchSelection.selectionSha256,
  unitKey: 'source/guides-en',
  producerJob: 'produce_en_guides',
  toolingSha: SHA_A,
  sourceBaselineSha: SHA_B,
  targetBranch: 'dev',
  artifacts: {
    checkpoint: {name: 'docs-checkpoint-guides-en-987654', archiveSha256: SUM_A, manifestSha256: SUM_B},
    baseline: {name: 'docs-baseline-guides-en-987654', archiveSha256: SUM_B, manifestSha256: SUM_A},
  },
  outcome: 'candidate',
})

const fetchProgress = Object.freeze({
  schemaVersion: 1,
  document: 'publication-progress',
  workflow: 'fetch',
  repository: fetchSelection.repository,
  runId: fetchSelection.runId,
  runAttempt: fetchSelection.runAttempt,
  selectionSha256: fetchSelection.selectionSha256,
  mode: 'publish',
  revision: 3,
  generatedAt: '2026-08-04T08:00:01.000Z',
  activeUnitKey: null,
  queue: ['source/guides-en'],
  units: [{
    unitKey: 'source/guides-en',
    state: 'ready',
    producerJobId: 456,
    producerCompletedAt: COMPLETED_AT,
    readyAt: '2026-08-04T08:00:01.000Z',
    sequence: 1,
    publishStartedAt: null,
    publishCompletedAt: null,
    baseSha: null,
    resultSha: null,
    commitShas: [],
    attempts: 0,
    failure: null,
  }],
})

const fetchResults = Object.freeze({
  schemaVersion: 1,
  document: 'publication-results',
  workflow: 'fetch',
  repository: fetchSelection.repository,
  runId: fetchSelection.runId,
  runAttempt: fetchSelection.runAttempt,
  selectionSha256: fetchSelection.selectionSha256,
  mode: 'publish',
  targetBranch: 'dev',
  initialTargetSha: SHA_C,
  finalTargetSha: SHA_A,
  startedAt: '2026-08-04T08:00:00.000Z',
  completedAt: '2026-08-04T08:00:04.000Z',
  overallStatus: 'success',
  units: [{
    unitKey: 'source/guides-en',
    producerJobId: 456,
    producerCompletedAt: COMPLETED_AT,
    readyAt: '2026-08-04T08:00:01.000Z',
    sequence: 1,
    publishStartedAt: '2026-08-04T08:00:02.000Z',
    publishCompletedAt: '2026-08-04T08:00:03.000Z',
    baseSha: SHA_C,
    resultSha: SHA_A,
    commitShas: [SHA_A],
    attempts: 1,
    status: 'published',
    failure: null,
  }],
  orchestratorFailure: null,
})

function selectionUnit(overrides = {}) {
  return {
    unitKey: 'source/java',
    producerJob: 'produce_java',
    strategy: 'checkpoint',
    site: null,
    group: 'java',
    translationSourceGroup: 'java',
    toolingSha: SHA_A,
    sourceBaselineSha: SHA_B,
    targetBranch: 'dev',
    artifacts: {checkpoint: 'docs-checkpoint-java-123', baseline: null},
    commitMessage: 'docs(java): publish fetched content',
    validationCommands: ['node scripts/validate-generated-sidebars.js --site en'],
    environment: {},
    ...overrides,
  }
}

function selection(overrides = {}) {
  return {
    schemaVersion: 1,
    document: 'publication-selection',
    workflow: 'fetch',
    repository: 'zilliztech/zdoc',
    runId: 123,
    runAttempt: 1,
    toolingSha: SHA_A,
    targetBranch: 'dev',
    initialTargetSha: SHA_C,
    sourceBaselineSha: SHA_B,
    inputs: {selectedGroup: 'java', publish: true, runTranslations: false},
    units: [selectionUnit()],
    selectionSha256: SUM_A,
    ...overrides,
  }
}

function finalizedSelection(overrides = {}) {
  const value = selection({...overrides, selectionSha256: undefined})
  delete value.selectionSha256
  return finalizePublicationSelection(value)
}

function ready(overrides = {}) {
  const selected = finalizedSelection()
  return {
    schemaVersion: 1,
    document: 'publication-ready',
    workflow: 'fetch',
    repository: selected.repository,
    runId: selected.runId,
    runAttempt: selected.runAttempt,
    selectionSha256: selected.selectionSha256,
    unitKey: 'source/java',
    producerJob: 'produce_java',
    toolingSha: SHA_A,
    sourceBaselineSha: SHA_B,
    targetBranch: 'dev',
    artifacts: {
      checkpoint: {name: 'docs-checkpoint-java-123', archiveSha256: SUM_A, manifestSha256: SUM_B},
      baseline: null,
    },
    outcome: 'candidate',
    ...overrides,
  }
}

function progressUnit(overrides = {}) {
  return {
    unitKey: 'source/java',
    state: 'ready',
    producerJobId: 456,
    producerCompletedAt: COMPLETED_AT,
    readyAt: '2026-08-04T08:00:01.000Z',
    sequence: 1,
    publishStartedAt: null,
    publishCompletedAt: null,
    baseSha: null,
    resultSha: null,
    commitShas: [],
    attempts: 0,
    failure: null,
    ...overrides,
  }
}

function progress(overrides = {}) {
  const selected = finalizedSelection()
  return {
    schemaVersion: 1,
    document: 'publication-progress',
    workflow: 'fetch',
    repository: selected.repository,
    runId: selected.runId,
    runAttempt: selected.runAttempt,
    selectionSha256: selected.selectionSha256,
    mode: 'publish',
    revision: 1,
    generatedAt: '2026-08-04T08:00:01.000Z',
    activeUnitKey: null,
    queue: ['source/java'],
    units: [progressUnit()],
    ...overrides,
  }
}

function resultUnit(overrides = {}) {
  return {
    unitKey: 'source/java',
    producerJobId: 456,
    producerCompletedAt: COMPLETED_AT,
    readyAt: '2026-08-04T08:00:01.000Z',
    sequence: 1,
    publishStartedAt: '2026-08-04T08:00:02.000Z',
    publishCompletedAt: '2026-08-04T08:00:03.000Z',
    baseSha: SHA_C,
    resultSha: SHA_A,
    commitShas: [SHA_A],
    attempts: 1,
    status: 'published',
    failure: null,
    ...overrides,
  }
}

function results(overrides = {}) {
  const selected = finalizedSelection()
  return {
    schemaVersion: 1,
    document: 'publication-results',
    workflow: 'fetch',
    repository: selected.repository,
    runId: selected.runId,
    runAttempt: selected.runAttempt,
    selectionSha256: selected.selectionSha256,
    mode: 'publish',
    targetBranch: 'dev',
    initialTargetSha: SHA_C,
    finalTargetSha: SHA_A,
    startedAt: '2026-08-04T08:00:00.000Z',
    completedAt: '2026-08-04T08:00:04.000Z',
    overallStatus: 'success',
    units: [resultUnit()],
    orchestratorFailure: null,
    ...overrides,
  }
}

test('all four publication documents start independently at schemaVersion 1', () => {
  const selected = finalizedSelection()
  assert.equal(validatePublicationSelection(selected).schemaVersion, 1)
  assert.equal(validatePublicationReady(ready(), {selection: selected}).schemaVersion, 1)
  assert.equal(validatePublicationProgress(progress(), {selection: selected}).schemaVersion, 1)
  assert.equal(validatePublicationResults(results(), {selection: selected}).schemaVersion, 1)
})

test('Fetch publication documents remain byte-identical after workflow adapter extraction', () => {
  assert.equal(canonicalJson(validatePublicationSelection(fetchSelection)), canonicalJson(fetchSelection))
  assert.equal(canonicalJson(validatePublicationReady(fetchReady, {selection: fetchSelection})), canonicalJson(fetchReady))
  assert.equal(canonicalJson(validatePublicationProgress(fetchProgress, {selection: fetchSelection})), canonicalJson(fetchProgress))
  assert.equal(canonicalJson(validatePublicationResults(fetchResults, {selection: fetchSelection})), canonicalJson(fetchResults))
})

test('selection checksum excludes only selectionSha256 and canonicalizes recursively', () => {
  const first = finalizedSelection({inputs: {publish: true, runTranslations: false, selectedGroup: 'java'}})
  const second = finalizedSelection({inputs: {selectedGroup: 'java', runTranslations: false, publish: true}})
  assert.equal(first.selectionSha256, second.selectionSha256)
  assert.equal(canonicalJson({z: 1, a: {y: 2, x: [3, {b: 2, a: 1}]}}), '{"a":{"x":[3,{"a":1,"b":2}],"y":2},"z":1}\n')
  assert.throws(() => validatePublicationSelection({...first, selectionSha256: SUM_B}), /checksum/i)
})

test('selection exact keys distinguish finalize and validate checksum phases', () => {
  const selected = finalizedSelection()
  assert.throws(() => finalizePublicationSelection(selected), /keys|selectionSha256/i)
  const withoutChecksum = {...selected}
  delete withoutChecksum.selectionSha256
  assert.throws(() => validatePublicationSelection(withoutChecksum), /keys|selectionSha256|checksum/i)
})

test('selection enforces exact roots, unit keys, canonical order, and unique artifacts', () => {
  const java = selectionUnit()
  const node = selectionUnit({
    unitKey: 'source/node', producerJob: 'produce_node', group: 'node', translationSourceGroup: 'node',
    artifacts: {checkpoint: 'docs-checkpoint-node-123', baseline: null},
  })
  assert.doesNotThrow(() => finalizedSelection({inputs: {selectedGroup: 'all', publish: true, runTranslations: false}, units: [java, node]}))
  assert.throws(() => finalizedSelection({units: [{...java, extra: true}]}), /keys/i)
  assert.throws(() => finalizedSelection({units: [node, java]}), /canonical order/i)
  assert.throws(() => finalizedSelection({units: [java, {...node, artifacts: java.artifacts}]}), /artifact.*unique/i)
  assert.throws(() => validatePublicationSelection({...finalizedSelection(), extra: true}), /keys/i)
})

test('selection validates lower-case identities and Chinese Guides environment', () => {
  assert.throws(() => finalizedSelection({toolingSha: SHA_A.toUpperCase()}), /tooling/i)
  assert.throws(() => finalizedSelection({units: [selectionUnit({toolingSha: SHA_C})]}), /tooling/i)
  const chinese = selectionUnit({
    unitKey: 'source/guides-zh-CN', producerJob: 'produce_zh_guides', site: 'zh-CN', group: 'guides',
    translationSourceGroup: null, artifacts: {checkpoint: 'docs-checkpoint-guides-zh-CN-123', baseline: null},
    environment: {},
  })
  assert.throws(() => finalizedSelection({inputs: {selectedGroup: 'guides', publish: true, runTranslations: false}, units: [chinese]}), /ZDOC_SITE/i)
})

test('ready descriptor binds repository, run, attempt, selection, producer, and artifact identity', () => {
  const selected = finalizedSelection()
  assert.doesNotThrow(() => validatePublicationReady(ready(), {selection: selected}))
  for (const mutation of [
    {repository: 'other/repo'}, {runId: 124}, {runAttempt: 2}, {selectionSha256: SUM_A},
    {unitKey: 'source/node'}, {producerJob: 'produce_node'}, {toolingSha: SHA_C},
    {sourceBaselineSha: SHA_C}, {targetBranch: 'other'},
  ]) assert.throws(() => validatePublicationReady(ready(mutation), {selection: selected}), /mismatch|selected|checksum|unit/i)
  assert.throws(() => validatePublicationReady({...ready(), extra: true}, {selection: selected}), /keys/i)
  assert.equal(validatePublicationReady(ready({outcome: 'no_changes_candidate'}), {selection: selected}).outcome, 'no_changes_candidate')
})

test('progress validates identity, revision, canonical units, active unit, and queue', () => {
  const selected = finalizedSelection()
  assert.doesNotThrow(() => validatePublicationProgress(progress(), {selection: selected, artifactRevision: 1}))
  assert.throws(() => validatePublicationProgress(progress({revision: 0}), {selection: selected}), /revision/i)
  assert.throws(() => validatePublicationProgress(progress({revision: 2}), {selection: selected, artifactRevision: 1}), /revision.*mismatch/i)
  assert.throws(() => validatePublicationProgress(progress({activeUnitKey: 'source/node'}), {selection: selected}), /active/i)
  assert.throws(() => validatePublicationProgress(progress({queue: ['source/java', 'source/java']}), {selection: selected}), /queue/i)
  assert.throws(() => validatePublicationProgress({...progress(), extra: true}, {selection: selected}), /keys/i)
})

test('results enforce mode-dependent statuses, successful SHAs, and structured failures', () => {
  const selected = finalizedSelection()
  assert.doesNotThrow(() => validatePublicationResults(results(), {selection: selected}))
  assert.throws(() => validatePublicationResults(results({units: [resultUnit({resultSha: null})]}), {selection: selected}), /resultSha/i)
  assert.throws(() => validatePublicationResults(results({units: [resultUnit({status: 'publish_failed', failure: null})], overallStatus: 'failure'}), {selection: selected}), /failure/i)
  assert.throws(() => validatePublicationResults(results({mode: 'artifact_only'}), {selection: selected}), /artifact_only|status/i)

  const artifactOnly = results({
    mode: 'artifact_only', finalTargetSha: SHA_C,
    units: [resultUnit({
      status: 'ready', publishStartedAt: null, publishCompletedAt: null, baseSha: null,
      resultSha: null, commitShas: [], attempts: 0,
    })],
  })
  assert.equal(validatePublicationResults(artifactOnly, {selection: selected}).overallStatus, 'success')
})

test('orchestrator_failed requires a structured orchestrator failure and permits unprocessed ready units', () => {
  const selected = finalizedSelection()
  const stopped = results({
    overallStatus: 'orchestrator_failed',
    units: [resultUnit({
      status: 'ready', publishStartedAt: null, publishCompletedAt: null, baseSha: null,
      resultSha: null, commitShas: [], attempts: 0,
    })],
    orchestratorFailure: {code: 'REMOTE_STATE_UNKNOWN', phase: 'push_probe', message: 'remote state unknown', retryable: false},
  })
  assert.equal(validatePublicationResults(stopped, {selection: selected}).overallStatus, 'orchestrator_failed')
  assert.throws(() => validatePublicationResults({...stopped, orchestratorFailure: null}, {selection: selected}), /orchestrator.*failure/i)
  assert.throws(() => validatePublicationResults(results({orchestratorFailure: stopped.orchestratorFailure}), {selection: selected}), /only.*orchestrator|must be null/i)
})

test('artifact naming and unit token reject unsafe identities', () => {
  assert.equal(unitToken('source/guides-zh-CN'), 'source-guides-zh-CN')
  assert.deepEqual(artifactNames({workflow: 'fetch', runId: 123, runAttempt: 2, unitKey: 'source/java', revision: 7}), {
    selection: 'publication-selection-fetch-123-2',
    ready: 'publication-ready-fetch-source-java-123-2',
    progress: 'publication-progress-fetch-123-2-7',
    results: 'publication-results-fetch-123-2',
  })
  for (const key of ['', '../source/java', 'source//java', 'source/java\n', 'source/java@{x}']) {
    assert.throws(() => unitToken(key), /unit/i)
  }
})

test('publication document file I/O is canonical, atomic, and revalidates the requested type', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'publication-contracts-'))
  const file = path.join(root, 'nested', 'publication-selection.json')
  const selected = finalizedSelection()
  writePublicationDocument(file, selected)
  assert.equal(fs.readFileSync(file, 'utf8'), canonicalJson(selected))
  assert.deepEqual(readPublicationDocument(file, 'publication-selection'), selected)
  assert.throws(() => readPublicationDocument(file, 'publication-results'), /document/i)
  assert.equal(fs.readdirSync(path.dirname(file)).filter(name => name.includes('.tmp-')).length, 0)
})
