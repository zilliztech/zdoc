'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {finalizePublicationSelection} = require('./publication-contracts')
const {
  buildRecoveryHandoff,
  planTranslationRecovery,
  validateDownloadedArtifactTree,
} = require('./translation-recovery-planner')

const SHA = character => character.repeat(40)
const HASH = value => crypto.createHash('sha256').update(value).digest('hex')
const RUN_ID = 42001

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

function selection(runAttempt = 2) {
  const identities = [
    ['ja-JP', 'guides'],
    ['ja-JP', 'python'], ['zh-CN-reference', 'python'],
    ['ja-JP', 'java'], ['zh-CN-reference', 'java'],
    ['ja-JP', 'node'], ['zh-CN-reference', 'node'],
    ['ja-JP', 'go'], ['zh-CN-reference', 'go'],
    ['ja-JP', 'cli'], ['zh-CN-reference', 'cli'],
    ['ja-JP', 'rest'], ['zh-CN-reference', 'rest'],
  ]
  const units = identities.map(([target, group], order) => selectedUnit(target, group, order))
    .map(({publicationOrder: _ignored, ...unit}) => unit)
  return finalizePublicationSelection({
    schemaVersion: 1,
    document: 'publication-selection',
    workflow: 'translation',
    repository: 'zilliztech/zdoc',
    runId: RUN_ID,
    runAttempt,
    toolingSha: SHA('a'),
    targetBranch: 'dev',
    initialTargetSha: SHA('d'),
    sourceBaselineSha: SHA('d'),
    inputs: {selectedGroup: 'all', publish: true, runTranslations: true},
    units,
  })
}

function writeJson(root, relative, value) {
  const target = path.join(root, relative)
  fs.mkdirSync(path.dirname(target), {recursive: true})
  fs.writeFileSync(target, `${JSON.stringify(value)}\n`)
}

function reportArtifact(root, pending, target = 'ja-JP') {
  writeJson(root, 'translation-report.json', {
    target,
    locale: target === 'ja-JP' ? 'ja-JP' : 'zh-CN',
    results: [],
    checkpoint: {processed: 0, remaining: pending, translated: 0, failed: 0},
  })
  fs.writeFileSync(path.join(root, 'translation-report.md'), `### Translation report\n\n- Pending: ${pending}\n- Translated: 0\n- Failed: 0\n- Remaining: ${pending}\n`)
}

function recoveryArtifact(root, {target, group, translated = 1}) {
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
    toolingSha: SHA('a'),
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
  const selected = selection()
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
    artifact(`translation-report-${unit.target}-${unit.group}-${RUN_ID}`, directory => reportArtifact(directory, 1, unit.target))
    artifact(`translation-recovery-${unit.target}-${unit.group}-${RUN_ID}-0`, directory => recoveryArtifact(directory, {target: unit.target, group: unit.group}))
  }
  for (const batch of [1, 2]) {
    artifact(`translation-report-ja-JP-guides-${RUN_ID}-batch-${batch}`, directory => reportArtifact(directory, 1))
    artifact(`translation-recovery-ja-JP-guides-${RUN_ID}-${batch}`, directory => recoveryArtifact(directory, {target: 'ja-JP', group: 'guides'}))
  }
  const run = {
    id: RUN_ID, status: 'completed', conclusion: 'failure', run_attempt: 2,
    path: '.github/workflows/translate-codex.yml', repository: {id: 7, full_name: 'zilliztech/zdoc'}, head_sha: SHA('a'),
  }
  const attempts = new Map([
    [1, {...run, run_attempt: 1, status: 'completed', run_started_at: '2026-08-08T00:00:00.000Z', updated_at: '2026-08-08T00:59:00.000Z'}],
    [2, {...run, run_attempt: 2, status: 'completed', run_started_at: '2026-08-08T01:00:00.000Z', updated_at: '2026-08-08T02:00:00.000Z'}],
  ])
  const client = {
    async getRun() { return overrides.run || run },
    async getJob() { return overrides.job || null },
    async getAttempt(_runId, attempt) { return attempts.get(attempt) },
    async listArtifacts() { return overrides.artifacts || artifacts },
    async listJobs() { return overrides.jobs || [] },
    async downloadArtifact(record, destination) {
      fs.cpSync(payloads.get(record.id), destination, {recursive: true})
    },
  }
  return {root, artifacts, payloads, client, selected}
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
    targetBaselineSha: SHA('9'), publish: true, client: value.client,
  })
  assert.equal(planned.plan.previousRunId, RUN_ID)
  assert.equal(planned.plan.previousRunAttempt, 2)
  assert.equal(planned.plan.selectionSha256, value.selected.selectionSha256)
  assert.deepEqual(Object.keys(planned.plan.recoveryMap), value.selected.units.map(unit => `${unit.target}/${unit.group}`))
  assert.deepEqual(planned.plan.recoveryMap['ja-JP/guides'].artifacts.map(item => item.batchNumber), [1, 2])
  assert.equal(planned.plan.recoveredFileCount, 14)
  assert.equal(planned.plan.pendingFileCount, 0)
  assert.equal(planned.plan.paidModelCalls, false)
  assert.equal(planned.plan.publish, true)
  assert.equal(planned.handoff.targetBaselineSha, SHA('9'))
  assert.ok(planned.handoff.units.every(unit => unit.sourceCheckpointSha === SHA('c') && unit.targetBaselineSha === SHA('9')))
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

test('builds a new schema-v2 handoff from preserved source provenance and the queue-owned target baseline', () => {
  const handoff = buildRecoveryHandoff(selection(), SHA('9'))
  assert.equal(handoff.schemaVersion, 2)
  assert.equal(handoff.toolingSha, SHA('a'))
  assert.equal(handoff.targetBaselineSha, SHA('9'))
  assert.ok(handoff.units.every(unit => unit.sourceBaselineSha === SHA('b')))
  assert.ok(handoff.units.every(unit => unit.sourceCheckpointSha === SHA('c')))
  assert.ok(handoff.units.every(unit => unit.targetBaselineSha === SHA('9')))
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
