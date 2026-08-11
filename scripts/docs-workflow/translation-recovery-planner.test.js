'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {finalizePublicationSelection, validatePublicationResults} = require('./publication-contracts')
const {
  buildRecoveryHandoff,
  extractArtifactZip,
  planTranslationRecovery,
  validateDownloadedArtifactTree,
} = require('./translation-recovery-planner')
const {buildTranslationPublicationSelection} = require('./translation-publication-selection')
const {buildSummary} = require('../translation/reportSummary')

const SHA = character => character.repeat(40)
const HASH = value => crypto.createHash('sha256').update(value).digest('hex')
const RUN_ID = 42001
const RETAINED_TOOLING_SHA = 'b05b782e903716222b3fa08ca939f19737f2ecbd'
const RETAINED_WORKFLOW_SHA = '3d80c942f12e5e6bdf429240621af1fc723432e5'
const EXECUTION_TOOLING_SHA = '9'.repeat(40)

function selectedUnit(target, group, order) {
  return {
    unitKey: `translation/${target}/${group}`,
    producerJob: group === 'guides' ? 'prepare_guides_publication_ready' : `translate:${target}/${group}`,
    strategy: group === 'guides' ? 'ja-guides' : 'checkpoint',
    target,
    group,
    sourceGroup: group,
    toolingSha: SHA('a'),
    sourceBaselineSha: SHA('b'),
    sourceCheckpointSha: SHA('c'),
    targetBranch: 'dev',
    artifacts: {
      checkpoint: `translation-checkpoint-${target}-${group}-${RUN_ID}`,
      baseline: `translation-baseline-${target}-${group}-${RUN_ID}`,
    },
    commitMessage: `publish ${target} ${group}`,
    validationCommands: [`validate ${target} ${group}`],
    environment: {},
    publicationOrder: order,
  }
}

function selection(runAttempt = 2, toolingSha = RETAINED_TOOLING_SHA, recoveryProvenance = null) {
  const identities = [
    ['ja-JP', 'guides'],
    ['ja-JP', 'python'], ['zh-CN-reference', 'python'],
    ['ja-JP', 'java'], ['zh-CN-reference', 'java'],
    ['ja-JP', 'node'], ['zh-CN-reference', 'node'],
    ['ja-JP', 'go'], ['zh-CN-reference', 'go'],
    ['ja-JP', 'cli'], ['zh-CN-reference', 'cli'],
    ['ja-JP', 'rest'], ['zh-CN-reference', 'rest'],
  ]
  const units = identities.map(([target, group], order) => ({...selectedUnit(target, group, order), toolingSha}))
    .map(({publicationOrder: _ignored, ...unit}) => unit)
  return finalizePublicationSelection({
    schemaVersion: 1,
    document: 'publication-selection',
    workflow: 'translation',
    repository: 'zilliztech/zdoc',
    runId: RUN_ID,
    runAttempt,
    toolingSha,
    targetBranch: 'dev',
    initialTargetSha: SHA('d'),
    sourceBaselineSha: SHA('d'),
    inputs: {selectedGroup: 'all', publish: true, runTranslations: true, ...(recoveryProvenance ? {recoveryProvenance} : {})},
    units,
  })
}

function sourceRecoveryProvenance(units = ['ja-JP/guides']) {
  return {
    schemaVersion: 2,
    kind: 'operator-recovery',
    sourceRepository: 'zilliztech/zdoc',
    sourceWorkflow: '.github/workflows/translate-codex.yml',
    sourceRunId: RUN_ID - 1,
    sourceRunAttempt: 1,
    sourceWorkflowSha: RETAINED_WORKFLOW_SHA,
    sourceToolingSha: RETAINED_TOOLING_SHA,
    executionToolingSha: RETAINED_TOOLING_SHA,
    sourceSelectionSha256: 'e'.repeat(64),
    publicationEvidence: {publisherJob: null, progress: [], results: null, resultsAbsenceReason: 'publish_ready-absent'},
    artifacts: units.map((unit, index) => ({
      unit,
      artifactId: 900 + index,
      artifactName: `translation-recovery-${unit.replace('/', '-')}-${RUN_ID - 1}-${index + 1}`,
      artifactDigest: `sha256:${'f'.repeat(64)}`,
      batchNumber: index + 1,
      retainedFileCount: 1,
      sourceCandidateCount: 1,
    })),
  }
}

function successfulPublicationResults(selected) {
  return validatePublicationResults({
    schemaVersion: 1,
    document: 'publication-results',
    workflow: 'translation',
    repository: selected.repository,
    runId: selected.runId,
    runAttempt: selected.runAttempt,
    selectionSha256: selected.selectionSha256,
    mode: 'publish',
    targetBranch: selected.targetBranch,
    initialTargetSha: selected.initialTargetSha,
    finalTargetSha: selected.initialTargetSha,
    startedAt: '2026-08-08T02:34:02.000Z',
    completedAt: '2026-08-08T02:35:19.000Z',
    overallStatus: 'success',
    units: selected.units.map((unit, index) => ({
      unitKey: unit.unitKey,
      producerJobId: index + 1000,
      producerCompletedAt: '2026-08-08T02:34:02.000Z',
      readyAt: '2026-08-08T02:34:02.000Z',
      sequence: index + 1,
      publishStartedAt: '2026-08-08T02:34:02.000Z',
      publishCompletedAt: '2026-08-08T02:35:19.000Z',
      baseSha: selected.initialTargetSha,
      resultSha: selected.initialTargetSha,
      commitShas: [],
      attempts: 1,
      status: 'no_changes',
      failure: null,
    })),
    orchestratorFailure: null,
  }, {selection: selected})
}

function writeJson(root, relative, value) {
  const target = path.join(root, relative)
  fs.mkdirSync(path.dirname(target), {recursive: true})
  fs.writeFileSync(target, `${JSON.stringify(value)}\n`)
}

function reportArtifact(root, candidateCount, target = 'ja-JP', group = 'guides', translated = candidateCount) {
  const locale = target === 'ja-JP' ? 'ja-JP' : 'zh-CN'
  const results = candidateCount === 0 ? [] : [{
    sourcePath: `content/en/${group}/source.md`,
    targetPath: target === 'ja-JP' ? `i18n/ja-JP/docusaurus-plugin-content-docs/current/${group}/source.md` : `content/zh-CN/reference/api/${group}/source.md`,
    sourceHash: 'f'.repeat(64), locale, target, status: translated ? 'translated' : 'failed',
    ...(translated ? {review: {pass: true, reviewerPass: true}, validationErrors: []} : {error: 'failed'}),
  }]
  writeJson(root, 'translation-report.json', {
    target, locale, results,
    checkpoint: {target, processed: candidateCount, remaining: 0, translated, failed: candidateCount - translated, generatedAt: '2026-08-08T01:59:00.000Z'},
  })
  fs.writeFileSync(path.join(root, 'translation-report.md'), `### Translation report\n\n- Pending: ${candidateCount}\n- Translated: ${translated}\n- Failed: ${candidateCount - translated}\n- Remaining: 0\n`)
}

function zeroWorkReportMarkdown(locale = 'ja-JP') {
  return buildSummary({manifest: {locale, items: []}})
}

function makeMarkdownOnlyZeroWork(value) {
  const report = value.artifacts.find(item => item.name === `translation-report-ja-JP-python-${RUN_ID}`)
  const reportRoot = value.payloads.get(report.id)
  fs.rmSync(path.join(reportRoot, 'translation-report.json'))
  fs.writeFileSync(path.join(reportRoot, 'translation-report.md'), zeroWorkReportMarkdown('ja-JP'))
  const recovery = value.artifacts.find(item => item.name === `translation-recovery-ja-JP-python-${RUN_ID}-0`)
  return {report, artifacts: value.artifacts.filter(artifact => artifact.id !== recovery.id)}
}

function recoveryArtifact(root, {target, group, translated = 1, toolingSha = RETAINED_TOOLING_SHA}) {
  const locale = target === 'ja-JP' ? 'ja-JP' : 'zh-CN'
  const sourcePath = `content/en/${group}/source.md`
  const targetPath = target === 'ja-JP' ? `i18n/ja-JP/docusaurus-plugin-content-docs/current/${group}/source.md` : `content/zh-CN/reference/api/${group}/source.md`
  const targetBytes = Buffer.from(`# ${target} ${group}\n`)
  writeJson(root, 'metadata.json', {
    schemaVersion: 1,
    locale,
    group,
    promptContractSha256: 'e'.repeat(64),
    model: 'translation-model',
    sourceSha: SHA('c'),
    toolingSha,
    translated,
  })
  const files = translated ? [{
    sourcePath,
    targetPath,
    sourceHash: 'f'.repeat(64),
    targetHash: HASH(targetBytes),
    targetSize: targetBytes.length,
    locale,
    group,
    promptContractSha256: 'e'.repeat(64),
    model: 'translation-model',
    status: 'translated',
  }] : []
  writeJson(root, 'manifest.json', {schemaVersion: 1, files})
  if (translated) {
    const translatedFile = path.join(root, 'translated-files', targetPath)
    fs.mkdirSync(path.dirname(translatedFile), {recursive: true})
    fs.writeFileSync(translatedFile, targetBytes)
  }
}

function fixture(t, overrides = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-recovery-plan-'))
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  const selected = selection(2, overrides.retainedToolingSha || RETAINED_TOOLING_SHA, overrides.recoveryProvenance || null)
  const payloads = new Map()
  const artifacts = []
  let nextId = 1
  function artifact(name, populate, extra = {}) {
    const directory = path.join(root, 'payloads', String(nextId))
    fs.mkdirSync(directory, {recursive: true})
    populate(directory)
    const record = {
      id: nextId++, name, expired: false, digest: `sha256:${'1'.repeat(64)}`,
      created_at: '2026-08-08T01:10:00.000Z', workflow_run: {id: RUN_ID, repository_id: 7, head_repository_id: 7},
      ...extra,
    }
    artifacts.push(record)
    payloads.set(record.id, directory)
    return record
  }
  artifact(`publication-selection-translation-${RUN_ID}-2`, directory => writeJson(directory, 'publication-selection.json', selected))
  for (const unit of selected.units.filter(unit => unit.strategy !== 'ja-guides')) {
    artifact(`translation-report-${unit.target}-${unit.group}-${RUN_ID}`, directory => reportArtifact(directory, 1, unit.target, unit.group))
    artifact(`translation-recovery-${unit.target}-${unit.group}-${RUN_ID}-0`, directory => recoveryArtifact(directory, {target: unit.target, group: unit.group, toolingSha: selected.toolingSha}))
  }
  for (const batch of [1, 2]) {
    artifact(`translation-report-ja-JP-guides-${RUN_ID}-batch-${batch}`, directory => reportArtifact(directory, 1, 'ja-JP', 'guides'))
    artifact(`translation-recovery-ja-JP-guides-${RUN_ID}-${batch}`, directory => recoveryArtifact(directory, {target: 'ja-JP', group: 'guides', toolingSha: selected.toolingSha}))
  }
  const run = {
    id: RUN_ID, status: 'completed', conclusion: 'failure', run_attempt: 2,
    path: '.github/workflows/translate-codex.yml', repository: {id: 7, full_name: 'zilliztech/zdoc'}, head_sha: RETAINED_WORKFLOW_SHA,
  }
  const attempts = new Map([
    [1, {...run, run_attempt: 1, status: 'completed', run_started_at: '2026-08-08T00:00:00.000Z', updated_at: '2026-08-08T00:59:00.000Z'}],
    [2, {...run, run_attempt: 2, status: 'completed', run_started_at: '2026-08-08T01:00:00.000Z', updated_at: '2026-08-08T02:00:00.000Z'}],
  ])
  const jobs = [{
    id: 100, name: 'prepare', run_attempt: 2, status: 'completed', conclusion: 'success',
    started_at: '2026-08-08T01:00:00.000Z', completed_at: '2026-08-08T01:05:00.000Z',
  }]
  let nextJobId = 101
  for (const unit of selected.units) {
    if (unit.strategy === 'ja-guides') {
      for (const batchNumber of [1, 2]) jobs.push({
        id: nextJobId++, name: `translate_guides_batches (${batchNumber - 1}, ${batchNumber}) / translate`,
        run_attempt: 2, status: 'completed', conclusion: 'failure',
        started_at: '2026-08-08T01:05:00.000Z', completed_at: '2026-08-08T02:00:00.000Z',
      })
    } else jobs.push({
      id: nextJobId++, name: `${unit.producerJob} / translate`, run_attempt: 2, status: 'completed', conclusion: 'failure',
      started_at: '2026-08-08T01:05:00.000Z', completed_at: '2026-08-08T02:00:00.000Z',
    })
  }
  const client = {
    async getRun() { return overrides.run || run },
    async getJob() { return overrides.job || null },
    async getAttempt(_runId, attempt) { return attempts.get(attempt) },
    async listArtifacts() { return overrides.artifacts || artifacts },
    async listJobs() { return overrides.jobs || jobs },
    async downloadArtifact(record, destination) {
      fs.cpSync(payloads.get(record.id), destination, {recursive: true})
    },
  }
  return {root, artifacts, payloads, client, selected, jobs, addArtifact: artifact}
}

test('rejects job IDs, wrong workflows, nonterminal attempts, expired selections, and ambiguous attempts before recovery planning', async t => {
  const base = fixture(t)
  await assert.rejects(() => planTranslationRecovery({repository: 'zilliztech/zdoc', previousRunId: RUN_ID, publish: 'true', outputRoot: path.join(base.root, 'publish-string'), targetBaselineSha: SHA('9'), client: base.client}), /publish must be a boolean/i)
  await assert.rejects(() => planTranslationRecovery({repository: 'zilliztech/zdoc', previousRunId: 99, outputRoot: path.join(base.root, 'job'), targetBaselineSha: SHA('9'), client: {...base.client, getRun: async () => null, getJob: async () => ({id: 99})}}), /job ID/i)
  await assert.rejects(() => planTranslationRecovery({repository: 'zilliztech/zdoc', previousRunId: RUN_ID, outputRoot: path.join(base.root, 'wrong'), targetBaselineSha: SHA('9'), client: {...base.client, getRun: async () => ({...(await base.client.getRun()), path: '.github/workflows/fetch-docs.yml'})}}), /allowlisted Translation workflow/i)
  await assert.rejects(() => planTranslationRecovery({repository: 'zilliztech/zdoc', previousRunId: RUN_ID, previousRunAttempt: 2, outputRoot: path.join(base.root, 'active'), targetBaselineSha: SHA('9'), client: {...base.client, getAttempt: async (_id, attempt) => ({...(await base.client.getAttempt(_id, attempt)), status: 'in_progress'})}}), /terminal/i)
  await assert.rejects(() => planTranslationRecovery({repository: 'zilliztech/zdoc', previousRunId: RUN_ID, previousRunAttempt: 1, outputRoot: path.join(base.root, 'rerunning'), targetBaselineSha: SHA('9'), client: {...base.client, getRun: async () => ({...(await base.client.getRun()), status: 'in_progress'})}}), /terminal/i)
  await assert.rejects(() => planTranslationRecovery({repository: 'zilliztech/zdoc', previousRunId: RUN_ID, previousRunAttempt: 2, outputRoot: path.join(base.root, 'expired'), targetBaselineSha: SHA('9'), client: {...base.client, listArtifacts: async () => base.artifacts.map((artifact, index) => index === 0 ? {...artifact, expired: true} : artifact)}}), /expired/i)
  await assert.rejects(() => planTranslationRecovery({repository: 'zilliztech/zdoc', previousRunId: RUN_ID, previousRunAttempt: 2, outputRoot: path.join(base.root, 'ambiguous'), targetBaselineSha: SHA('9'), client: {...base.client, listArtifacts: async () => [...base.artifacts, {...base.artifacts[0], id: 999}]}}), /ambiguous|exactly once/i)
})

test('authenticates the selection and exact artifact identities, generates the recovery map, and discovers every Guides batch', async t => {
  const value = fixture(t)
  const planned = await planTranslationRecovery({
    repository: 'zilliztech/zdoc', previousRunId: RUN_ID, outputRoot: path.join(value.root, 'output'),
    targetBaselineSha: SHA('8'), executionToolingSha: EXECUTION_TOOLING_SHA, publish: true, client: value.client,
  })
  assert.equal(planned.plan.previousRunId, RUN_ID)
  assert.equal(planned.plan.previousRunAttempt, 2)
  assert.equal(planned.plan.selectionSha256, value.selected.selectionSha256)
  assert.deepEqual(planned.plan.handoff, planned.handoff)
  assert.deepEqual(Object.keys(planned.plan.recoveryMap), value.selected.units.map(unit => `${unit.target}/${unit.group}`))
  assert.deepEqual(planned.plan.recoveryMap['ja-JP/guides'].artifacts.map(item => item.batchNumber), [1, 2])
  assert.equal(planned.plan.retainedFileCount, 14)
  assert.equal(planned.plan.sourceCandidateCount, 14)
  assert.equal(planned.plan.compatibilityStatus, 'pending-current-contract-preflight')
  assert.equal('paidModelCalls' in planned.plan, false)
  assert.equal('recoveredFileCount' in planned.plan, false)
  assert.equal(planned.plan.publish, true)
  assert.equal(planned.handoff.toolingSha, EXECUTION_TOOLING_SHA)
  assert.equal(planned.handoff.targetBaselineSha, SHA('8'))
  assert.ok(planned.handoff.units.every(unit => unit.sourceCheckpointSha === SHA('c') && unit.targetBaselineSha === SHA('8')))
  assert.deepEqual({
    sourceWorkflowSha: planned.plan.provenance.sourceWorkflowSha,
    sourceToolingSha: planned.plan.provenance.sourceToolingSha,
    executionToolingSha: planned.plan.provenance.executionToolingSha,
  }, {
    sourceWorkflowSha: RETAINED_WORKFLOW_SHA,
    sourceToolingSha: RETAINED_TOOLING_SHA,
    executionToolingSha: EXECUTION_TOOLING_SHA,
  })
})

test('uses current reviewed execution tooling while preserving exact b05 retained source provenance', async t => {
  const value = fixture(t)
  const planned = await planTranslationRecovery({
    repository: 'zilliztech/zdoc', previousRunId: RUN_ID, outputRoot: path.join(value.root, 'retained-boundary'),
    targetBaselineSha: SHA('8'), executionToolingSha: EXECUTION_TOOLING_SHA, client: value.client,
  })
  assert.equal(value.selected.toolingSha, RETAINED_TOOLING_SHA)
  assert.equal(planned.handoff.toolingSha, EXECUTION_TOOLING_SHA)
  assert.equal(planned.plan.provenance.sourceToolingSha, RETAINED_TOOLING_SHA)
  assert.equal(planned.plan.provenance.sourceWorkflowSha, RETAINED_WORKFLOW_SHA)
  assert.ok(planned.handoff.units.every((unit, index) => unit.sourceCheckpointSha === value.selected.units[index].sourceCheckpointSha))
})

test('authenticates exact producer identities through the operator recovery caller prefix', async t => {
  const authorizedUnits = selection().units.map(unit => `${unit.target}/${unit.group}`)
  const value = fixture(t, {recoveryProvenance: sourceRecoveryProvenance(authorizedUnits)})
  const run = {...(await value.client.getRun()), path: '.github/workflows/recover-translation.yml'}
  const jobs = value.jobs.map(job => ({...job, name: `run_translation / ${job.name}`}))
  const planned = await planTranslationRecovery({
    repository: 'zilliztech/zdoc', previousRunId: RUN_ID, outputRoot: path.join(value.root, 'nested-recovery'),
    targetBaselineSha: SHA('8'), executionToolingSha: EXECUTION_TOOLING_SHA,
    client: {...value.client, getRun: async () => run, listJobs: async () => jobs},
  })
  assert.equal(planned.plan.provenance.sourceWorkflow, '.github/workflows/recover-translation.yml')
})

test('rejects chained operator recovery when the immutable selection has no authenticated original recovery scope', async t => {
  const value = fixture(t)
  const run = {...(await value.client.getRun()), path: '.github/workflows/recover-translation.yml'}
  const jobs = value.jobs.map(job => ({...job, name: `run_translation / ${job.name}`}))
  await assert.rejects(() => planTranslationRecovery({
    repository: 'zilliztech/zdoc', previousRunId: RUN_ID, outputRoot: path.join(value.root, 'missing-chained-scope'),
    targetBaselineSha: SHA('8'), executionToolingSha: EXECUTION_TOOLING_SHA,
    client: {...value.client, getRun: async () => run, listJobs: async () => jobs},
  }), /operator recovery.*provenance|authenticated.*recovery scope/i)
})

test('keeps chained operator recovery inside the authenticated original recovery scope', async t => {
  const value = fixture(t, {recoveryProvenance: sourceRecoveryProvenance()})
  const run = {...(await value.client.getRun()), path: '.github/workflows/recover-translation.yml'}
  const jobs = value.jobs.map(job => ({...job, name: `run_translation / ${job.name}`}))
  const planned = await planTranslationRecovery({
    repository: 'zilliztech/zdoc', previousRunId: RUN_ID, outputRoot: path.join(value.root, 'chained-recovery-scope'),
    targetBaselineSha: SHA('8'), executionToolingSha: EXECUTION_TOOLING_SHA,
    client: {...value.client, getRun: async () => run, listJobs: async () => jobs},
  })

  assert.deepEqual(planned.handoff.units.map(unit => `${unit.target}/${unit.group}`), ['ja-JP/guides'])
  assert.deepEqual(Object.keys(planned.plan.recoveryMap), ['ja-JP/guides'])
  assert.equal(planned.plan.sourceCandidateCount, 2)
  assert.equal(planned.plan.retainedFileCount, 2)
})

test('rejects selection checksum or recovery identity mismatches and missing paid-work recovery artifacts', async t => {
  const checksum = fixture(t)
  const selectionPayload = checksum.payloads.get(checksum.artifacts[0].id)
  const tampered = JSON.parse(fs.readFileSync(path.join(selectionPayload, 'publication-selection.json'), 'utf8'))
  tampered.inputs.publish = false
  writeJson(selectionPayload, 'publication-selection.json', tampered)
  await assert.rejects(() => planTranslationRecovery({repository: 'zilliztech/zdoc', previousRunId: RUN_ID, outputRoot: path.join(checksum.root, 'checksum'), targetBaselineSha: SHA('9'), client: checksum.client}), /selection checksum mismatch/i)

  const identity = fixture(t)
  const recovery = identity.artifacts.find(item => item.name.includes('recovery-ja-JP-python'))
  const metadataFile = path.join(identity.payloads.get(recovery.id), 'metadata.json')
  const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'))
  metadata.sourceSha = SHA('8')
  writeJson(identity.payloads.get(recovery.id), 'metadata.json', metadata)
  await assert.rejects(() => planTranslationRecovery({repository: 'zilliztech/zdoc', previousRunId: RUN_ID, outputRoot: path.join(identity.root, 'identity'), targetBaselineSha: SHA('9'), client: identity.client}), /recovery artifact identity mismatch/i)

  const missing = fixture(t)
  await assert.rejects(() => planTranslationRecovery({repository: 'zilliztech/zdoc', previousRunId: RUN_ID, outputRoot: path.join(missing.root, 'missing'), targetBaselineSha: SHA('9'), client: {...missing.client, listArtifacts: async () => missing.artifacts.filter(item => !item.name.includes('recovery-ja-JP-python'))}}), /missing recovery artifact.*before model/i)
})

test('keeps a genuinely selected positive-candidate unit even when its authenticated recovery artifact retains zero files', async t => {
  const value = fixture(t)
  const recovery = value.artifacts.find(item => item.name === `translation-recovery-ja-JP-python-${RUN_ID}-0`)
  const recoveryRoot = value.payloads.get(recovery.id)
  fs.rmSync(recoveryRoot, {recursive: true, force: true})
  fs.mkdirSync(recoveryRoot, {recursive: true})
  recoveryArtifact(recoveryRoot, {target: 'ja-JP', group: 'python', translated: 0})

  const planned = await planTranslationRecovery({
    repository: 'zilliztech/zdoc', previousRunId: RUN_ID, outputRoot: path.join(value.root, 'zero-retained-selected'),
    targetBaselineSha: SHA('8'), executionToolingSha: EXECUTION_TOOLING_SHA, client: value.client,
  })

  assert.equal(planned.plan.recoveryMap['ja-JP/python'].artifacts.length, 1)
  assert.equal(planned.plan.recoveryMap['ja-JP/python'].artifacts[0].retainedFileCount, 0)
  assert.equal(planned.plan.recoveryMap['ja-JP/python'].artifacts[0].sourceCandidateCount, 1)
  assert.equal(planned.handoff.units.some(unit => unit.target === 'ja-JP' && unit.group === 'python'), true)
})

test('binds strict report JSON and exact producer job identity before accepting retained recovery', async t => {
  const missingJson = fixture(t)
  const report = missingJson.artifacts.find(item => item.name === `translation-report-ja-JP-python-${RUN_ID}`)
  fs.rmSync(path.join(missingJson.payloads.get(report.id), 'translation-report.json'))
  await assert.rejects(() => planTranslationRecovery({
    repository: 'zilliztech/zdoc', previousRunId: RUN_ID, outputRoot: path.join(missingJson.root, 'missing-report-json'),
    targetBaselineSha: SHA('8'), executionToolingSha: EXECUTION_TOOLING_SHA, client: missingJson.client,
  }), /translation report.*json|strict report|markdown-only.*zero work/i)

  const ambiguous = fixture(t)
  const duplicated = ambiguous.artifacts.find(item => item.name === `translation-report-ja-JP-python-${RUN_ID}`)
  await assert.rejects(() => planTranslationRecovery({
    repository: 'zilliztech/zdoc', previousRunId: RUN_ID, outputRoot: path.join(ambiguous.root, 'ambiguous-report'),
    targetBaselineSha: SHA('8'), executionToolingSha: EXECUTION_TOOLING_SHA,
    client: {...ambiguous.client, listArtifacts: async () => [...ambiguous.artifacts, {...duplicated, id: 9999}]},
  }), /translation report.*exactly once|ambiguous/i)

  const wrongJob = fixture(t)
  await assert.rejects(() => planTranslationRecovery({
    repository: 'zilliztech/zdoc', previousRunId: RUN_ID, outputRoot: path.join(wrongJob.root, 'wrong-job'),
    targetBaselineSha: SHA('8'), executionToolingSha: EXECUTION_TOOLING_SHA,
    client: {...wrongJob.client, listJobs: async () => wrongJob.jobs.filter(job => job.name !== 'translate:ja-JP/python / translate')},
  }), /producer job.*ja-JP\/python|job identity/i)

  const outsideWindow = fixture(t)
  const outsideReport = outsideWindow.artifacts.find(item => item.name === `translation-report-ja-JP-python-${RUN_ID}`)
  await assert.rejects(() => planTranslationRecovery({
    repository: 'zilliztech/zdoc', previousRunId: RUN_ID, outputRoot: path.join(outsideWindow.root, 'outside-job-window'),
    targetBaselineSha: SHA('8'), executionToolingSha: EXECUTION_TOOLING_SHA,
    client: {...outsideWindow.client, listArtifacts: async () => outsideWindow.artifacts.map(artifact => artifact.id === outsideReport.id ? {...artifact, created_at: '2026-08-08T02:30:00.000Z'} : artifact)},
  }), /producer job time window/i)
})

test('accepts the exact retained zero-work Markdown-only report without requiring a recovery artifact', async t => {
  const value = fixture(t)
  const zeroWork = makeMarkdownOnlyZeroWork(value)
  const planned = await planTranslationRecovery({
    repository: 'zilliztech/zdoc', previousRunId: RUN_ID, outputRoot: path.join(value.root, 'zero-work'),
    targetBaselineSha: SHA('8'), executionToolingSha: EXECUTION_TOOLING_SHA,
    client: {...value.client, listArtifacts: async () => zeroWork.artifacts},
  })
  assert.equal(planned.plan.sourceCandidateCount, 13)
  assert.equal(planned.plan.retainedFileCount, 13)
  assert.equal(planned.plan.recoveryMap['ja-JP/python'], undefined)
  assert.equal(planned.handoff.units.some(unit => unit.target === 'ja-JP' && unit.group === 'python'), false)
  assert.equal(planned.plan.rejectedRecoveryCount, 0)
})

test('scopes the recovery handoff to authenticated recoverable units and omits proven zero-work units', async t => {
  const value = fixture(t)
  const retainedArtifacts = [...value.artifacts]
  for (const unit of value.selected.units.filter(unit => unit.strategy !== 'ja-guides')) {
    const reportName = `translation-report-${unit.target}-${unit.group}-${RUN_ID}`
    const report = retainedArtifacts.find(artifact => artifact.name === reportName)
    const reportRoot = value.payloads.get(report.id)
    fs.rmSync(path.join(reportRoot, 'translation-report.json'))
    fs.writeFileSync(path.join(reportRoot, 'translation-report.md'), zeroWorkReportMarkdown(unit.target === 'ja-JP' ? 'ja-JP' : 'zh-CN'))
    const recoveryName = `translation-recovery-${unit.target}-${unit.group}-${RUN_ID}-0`
    const recoveryIndex = retainedArtifacts.findIndex(artifact => artifact.name === recoveryName)
    retainedArtifacts.splice(recoveryIndex, 1)
  }

  const planned = await planTranslationRecovery({
    repository: 'zilliztech/zdoc', previousRunId: RUN_ID, outputRoot: path.join(value.root, 'scoped-zero-work'),
    targetBaselineSha: SHA('8'), executionToolingSha: EXECUTION_TOOLING_SHA,
    client: {...value.client, listArtifacts: async () => retainedArtifacts},
  })

  assert.deepEqual(planned.handoff.units.map(unit => `${unit.target}/${unit.group}`), ['ja-JP/guides'])
  assert.deepEqual(Object.keys(planned.plan.recoveryMap), ['ja-JP/guides'])
  assert.equal(planned.handoff.units[0].sourceBaselineSha, value.selected.units[0].sourceBaselineSha)
  assert.equal(planned.handoff.units[0].sourceCheckpointSha, value.selected.units[0].sourceCheckpointSha)
  assert.equal(planned.handoff.units[0].publicationOrder, 0)
  assert.equal(planned.plan.sourceCandidateCount, 2)
  assert.equal(planned.plan.retainedFileCount, 2)
})

test('keeps artifact digest, envelope, producer, and time-window authentication mandatory for Markdown-only zero work', async t => {
  const mutations = [
    {
      label: 'digest',
      artifacts: (zeroWork) => zeroWork.artifacts.map(artifact => artifact.id === zeroWork.report.id ? {...artifact, digest: 'sha256:invalid'} : artifact),
      jobs: value => value.jobs,
      error: /translation report artifact identity is invalid/i,
    },
    {
      label: 'envelope',
      artifacts: (zeroWork) => zeroWork.artifacts.map(artifact => artifact.id === zeroWork.report.id ? {...artifact, workflow_run: {...artifact.workflow_run, id: RUN_ID + 1}} : artifact),
      jobs: value => value.jobs,
      error: /recovery artifact identity mismatch/i,
    },
    {
      label: 'producer',
      artifacts: zeroWork => zeroWork.artifacts,
      jobs: value => value.jobs.filter(job => job.name !== 'translate:ja-JP/python / translate'),
      error: /producer job.*ja-JP\/python|job identity/i,
    },
    {
      label: 'time-window',
      artifacts: (zeroWork) => zeroWork.artifacts.map(artifact => artifact.id === zeroWork.report.id ? {...artifact, created_at: '2026-08-08T02:30:00.000Z'} : artifact),
      jobs: value => value.jobs,
      error: /producer job time window/i,
    },
  ]
  for (const mutation of mutations) {
    const value = fixture(t)
    const zeroWork = makeMarkdownOnlyZeroWork(value)
    await assert.rejects(() => planTranslationRecovery({
      repository: 'zilliztech/zdoc', previousRunId: RUN_ID, outputRoot: path.join(value.root, `zero-work-${mutation.label}`),
      targetBaselineSha: SHA('8'), executionToolingSha: EXECUTION_TOOLING_SHA,
      client: {...value.client, listArtifacts: async () => mutation.artifacts(zeroWork), listJobs: async () => mutation.jobs(value)},
    }), mutation.error)
  }
})

test('rejects downloaded artifact bytes that do not match the authenticated digest', t => {
  const destination = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-recovery-digest-'))
  t.after(() => fs.rmSync(destination, {recursive: true, force: true}))
  assert.throws(() => extractArtifactZip(Buffer.from('not-the-authenticated-archive'), destination, `sha256:${'0'.repeat(64)}`), /downloaded artifact digest mismatch/i)
})

test('keeps strict JSON mandatory for nonzero Markdown-only reports', async t => {
  const value = fixture(t)
  const report = value.artifacts.find(item => item.name === `translation-report-ja-JP-python-${RUN_ID}`)
  fs.rmSync(path.join(value.payloads.get(report.id), 'translation-report.json'))
  await assert.rejects(() => planTranslationRecovery({
    repository: 'zilliztech/zdoc', previousRunId: RUN_ID, outputRoot: path.join(value.root, 'nonzero-markdown-only'),
    targetBaselineSha: SHA('8'), executionToolingSha: EXECUTION_TOOLING_SHA, client: value.client,
  }), /strict translation report json|markdown-only.*zero work/i)
})

test('rejects malformed or ambiguous zero-work Markdown-only reports', async t => {
  const mutations = [
    markdown => markdown.replace('- Pending: 0\n', '- Pending: 0\n- Pending: 0\n'),
    markdown => markdown.replace('- Translated: 0', '- Translated: 1'),
    markdown => markdown.replace('- Remaining: 0\n', ''),
    markdown => markdown.replace('\nNo documents require', '\n- Paid model calls: false\n\nNo documents require'),
  ]
  for (const [index, mutate] of mutations.entries()) {
    const value = fixture(t)
    const report = value.artifacts.find(item => item.name === `translation-report-ja-JP-python-${RUN_ID}`)
    const reportRoot = value.payloads.get(report.id)
    fs.rmSync(path.join(reportRoot, 'translation-report.json'))
    fs.writeFileSync(path.join(reportRoot, 'translation-report.md'), mutate(zeroWorkReportMarkdown('ja-JP')))
    await assert.rejects(() => planTranslationRecovery({
      repository: 'zilliztech/zdoc', previousRunId: RUN_ID, outputRoot: path.join(value.root, `malformed-zero-${index}`),
      targetBaselineSha: SHA('8'), executionToolingSha: EXECUTION_TOOLING_SHA, client: value.client,
    }), /markdown-only.*zero work|translation report.*ambiguous/i)
  }
})

test('authenticates optional progress/results and requires terminal results only after a successful publisher', async t => {
  const tamperedProgress = fixture(t)
  tamperedProgress.addArtifact(`publication-progress-translation-${RUN_ID}-2-1`, directory => writeJson(directory, 'publication-progress.json', {schemaVersion: 1, document: 'publication-progress'}))
  await assert.rejects(() => planTranslationRecovery({
    repository: 'zilliztech/zdoc', previousRunId: RUN_ID, outputRoot: path.join(tamperedProgress.root, 'tampered-progress'),
    targetBaselineSha: SHA('8'), executionToolingSha: EXECUTION_TOOLING_SHA, client: tamperedProgress.client,
  }), /publication-progress|progress.*identity/i)

  const ambiguousResults = fixture(t)
  const resultName = `publication-results-translation-${RUN_ID}-2`
  ambiguousResults.addArtifact(resultName, directory => writeJson(directory, 'publication-results.json', {bad: true}))
  ambiguousResults.addArtifact(resultName, directory => writeJson(directory, 'publication-results.json', {bad: true}))
  await assert.rejects(() => planTranslationRecovery({
    repository: 'zilliztech/zdoc', previousRunId: RUN_ID, outputRoot: path.join(ambiguousResults.root, 'ambiguous-results'),
    targetBaselineSha: SHA('8'), executionToolingSha: EXECUTION_TOOLING_SHA, client: ambiguousResults.client,
  }), /publication results.*exactly once|ambiguous/i)

  const missingRequired = fixture(t)
  const publishJob = {
    id: 999, name: 'publish_ready', run_attempt: 2, status: 'completed', conclusion: 'success',
    started_at: '2026-08-08T01:05:00.000Z', completed_at: '2026-08-08T02:00:00.000Z',
  }
  await assert.rejects(() => planTranslationRecovery({
    repository: 'zilliztech/zdoc', previousRunId: RUN_ID, outputRoot: path.join(missingRequired.root, 'missing-results'),
    targetBaselineSha: SHA('8'), executionToolingSha: EXECUTION_TOOLING_SHA,
    client: {...missingRequired.client, listJobs: async () => [...missingRequired.jobs, publishJob]},
  }), /terminal publication results.*required|missing.*publication results/i)
})

test('canonicalizes seconds-precision publisher timestamps before binding post-cutover recovery provenance', async t => {
  const value = fixture(t)
  const publisherJob = {
    id: 93046385588,
    name: 'publish_ready',
    run_attempt: 2,
    status: 'completed',
    conclusion: 'success',
    started_at: '2026-08-08T02:34:02Z',
    completed_at: '2026-08-08T02:35:19Z',
  }
  value.addArtifact(
    `publication-results-translation-${RUN_ID}-2`,
    directory => writeJson(directory, 'publication-results.json', successfulPublicationResults(value.selected)),
    {created_at: '2026-08-08T02:35:19.000Z'},
  )

  const planned = await planTranslationRecovery({
    repository: 'zilliztech/zdoc',
    previousRunId: RUN_ID,
    outputRoot: path.join(value.root, 'seconds-precision-publisher'),
    targetBaselineSha: SHA('8'),
    executionToolingSha: EXECUTION_TOOLING_SHA,
    publish: true,
    client: {...value.client, listJobs: async () => [...value.jobs, publisherJob]},
  })
  const recoveryPlanBytes = fs.readFileSync(path.join(planned.bundleRoot, 'recovery-plan.json'))
  const rebuilt = buildTranslationPublicationSelection({
    handoff: planned.handoff,
    repository: 'zilliztech/zdoc',
    runId: RUN_ID + 1,
    runAttempt: 1,
    publish: true,
    runTranslations: false,
    recoveryProvenance: planned.plan.provenance,
    recoveryPlanBytes,
    recoveryPlanSha256: planned.recoveryPlanSha256,
  })
  assert.deepEqual(planned.plan.provenance.publicationEvidence.publisherJob, {
    jobId: 93046385588,
    status: 'completed',
    conclusion: 'success',
    startedAt: '2026-08-08T02:34:02.000Z',
    completedAt: '2026-08-08T02:35:19.000Z',
  })
  assert.equal(rebuilt.inputs.recoveryProvenance.publicationEvidence.publisherJob.startedAt, '2026-08-08T02:34:02.000Z')
  assert.equal(rebuilt.inputs.recoveryProvenance.publicationEvidence.publisherJob.completedAt, '2026-08-08T02:35:19.000Z')
})

test('rejects missing, invalid, or reversed publisher timestamps at the Jobs API boundary', async t => {
  const cases = [
    {started_at: undefined, completed_at: '2026-08-08T02:35:19Z'},
    {started_at: 'not-a-timestamp', completed_at: '2026-08-08T02:35:19Z'},
    {started_at: '2026-08-08T02:35:20Z', completed_at: '2026-08-08T02:35:19Z'},
  ]
  for (const [index, timestamps] of cases.entries()) {
    const value = fixture(t)
    const publisherJob = {
      id: 93046385588 + index,
      name: 'publish_ready',
      run_attempt: 2,
      status: 'completed',
      conclusion: 'failure',
      ...timestamps,
    }
    await assert.rejects(() => planTranslationRecovery({
      repository: 'zilliztech/zdoc',
      previousRunId: RUN_ID,
      outputRoot: path.join(value.root, `invalid-publisher-time-${index}`),
      targetBaselineSha: SHA('8'),
      executionToolingSha: EXECUTION_TOOLING_SHA,
      client: {...value.client, listJobs: async () => [...value.jobs, publisherJob]},
    }), /publish_ready job timestamps are invalid/i)
  }
})

test('builds a new schema-v2 handoff from preserved source provenance and the queue-owned target baseline', () => {
  const selected = selection()
  const handoff = buildRecoveryHandoff(selected, SHA('9'), EXECUTION_TOOLING_SHA)
  assert.equal(handoff.schemaVersion, 2)
  assert.equal(handoff.toolingSha, EXECUTION_TOOLING_SHA)
  assert.equal(handoff.targetBaselineSha, SHA('9'))
  assert.ok(handoff.units.every(unit => unit.sourceBaselineSha === SHA('b')))
  assert.ok(handoff.units.every(unit => unit.sourceCheckpointSha === SHA('c')))
  assert.ok(handoff.units.every(unit => unit.targetBaselineSha === SHA('9')))

  const scoped = buildRecoveryHandoff(selected, SHA('9'), EXECUTION_TOOLING_SHA, [{
    ...selected.units[0],
    sourceBaselineSha: SHA('7'),
    sourceCheckpointSha: SHA('8'),
  }])
  assert.equal(scoped.units[0].sourceBaselineSha, selected.units[0].sourceBaselineSha)
  assert.equal(scoped.units[0].sourceCheckpointSha, selected.units[0].sourceCheckpointSha)
})

test('resolves the latest target baseline only after authenticating the previous selection', async t => {
  const value = fixture(t)
  const observed = []
  const planned = await planTranslationRecovery({
    repository: 'zilliztech/zdoc', previousRunId: RUN_ID, outputRoot: path.join(value.root, 'resolved'),
    client: value.client,
    targetResolver: async targetBranch => { observed.push(targetBranch); return SHA('9') },
  })
  assert.deepEqual(observed, ['dev'])
  assert.equal(planned.handoff.targetBaselineSha, SHA('9'))
})

test('rejects symlinks and duplicate recovery file identities', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-recovery-tree-'))
  t.after(() => fs.rmSync(root, {recursive: true, force: true}))
  recoveryArtifact(root, {target: 'ja-JP', group: 'python'})
  fs.symlinkSync('/private/tmp', path.join(root, 'translated-files', 'escape'))
  assert.throws(() => validateDownloadedArtifactTree(root), /symlink/i)
  fs.rmSync(path.join(root, 'translated-files', 'escape'))
  const manifestFile = path.join(root, 'manifest.json')
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'))
  manifest.files.push({...manifest.files[0]})
  writeJson(root, 'manifest.json', manifest)
  assert.throws(() => validateDownloadedArtifactTree(root), /duplicate/i)
})
