'use strict'

const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {
  createAdaptiveCallBudget,
  createProviderRetryBudget,
  loadRecoveryAnalysis,
  partitionRecoveryWork,
  processItemWithRetry,
  processManifestItem,
  validateTranslatedContent,
} = require('./agentRunner')
const {chunkDocument} = require('./chunker')
const {createRecoveryArtifact} = require('./recovery-artifact')
const {analyzeRecoveryCompatibility} = require('./recovery-preflight')
const {loadLocaleContract} = require('./localeContract')
const {validateProtectedContent} = require('./protectedContent')
const {collectSemanticUnits, deterministicSemanticIssues, protectSemanticUnits} = require('./semanticUnits')
const {loadSemanticCheckpoints, serializeSemanticCheckpoints} = require('./semanticRecovery')
const {
  MAX_PARTIAL_ARTIFACT_BYTES,
  MAX_PARTIAL_CHUNK_BYTES,
  createArtifactExecution,
} = require('./chunkRecovery')

const HASH = value => crypto.createHash('sha256').update(value).digest('hex')
const CHUNK_OPTIONS = {targetChars: 25, maxChars: 35}

function write(root, relativePath, content) {
  const target = path.join(root, relativePath)
  fs.mkdirSync(path.dirname(target), {recursive: true})
  fs.writeFileSync(target, content, 'utf8')
}

function taggedJsonContent(messages, tag) {
  const match = messages.at(-1).content.match(new RegExp(`<${tag}>\\n([\\s\\S]*?)<\\/${tag}>`))
  if (!match) throw new Error(`Missing <${tag}> boundary`)
  return JSON.parse(match[1])
}

function semanticTranslationResponse(messages, transform = text => text) {
  return JSON.stringify({
    translations: taggedJsonContent(messages, 'semantic_units').map(unit => ({
      id: unit.id,
      text: transform(unit.text, unit),
    })),
  })
}

function fixture(t) {
  const siteDir = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-chunk-recovery-site-'))
  const artifactDir = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-chunk-recovery-artifact-'))
  t.after(() => {
    fs.rmSync(siteDir, {recursive: true, force: true})
    fs.rmSync(artifactDir, {recursive: true, force: true})
  })
  const sourcePath = 'docs/large-guide.md'
  const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/large-guide.md'
  const source = '# One\n\nFirst paragraph.\n\n# Two\n\nSecond paragraph.\n\n# Three\n\nThird paragraph.\n'
  write(siteDir, sourcePath, source)
  const item = {target: 'ja-JP', sourcePath, targetPath, sourceHash: HASH(source), locale: 'ja-JP', type: 'guides'}
  const manifest = {target: 'ja-JP', locale: 'ja-JP', group: 'guides', sourceCheckpointSha: 'a'.repeat(40), items: [item]}
  const artifactIdentity = {
    locale: 'ja-JP', group: 'guides', promptContractSha256: 'b'.repeat(64), model: 'translation-model',
    sourceSha: manifest.sourceCheckpointSha, toolingSha: 'c'.repeat(40), mode: 'incremental',
  }
  const currentIdentity = {promptContractSha256: artifactIdentity.promptContractSha256, model: artifactIdentity.model, toolingSha: 'd'.repeat(40)}
  assert.equal(chunkDocument(source, CHUNK_OPTIONS).length, 3)
  return {siteDir, artifactDir, source, item, manifest, artifactIdentity, currentIdentity}
}

async function createTerminalPartialFailure(value) {
  const translationCalls = new Map()
  const result = await processItemWithRetry(value.item, {
    maxRetries: 0,
    processItem: (_item, _attempt, retryFeedback, retryContext) => processManifestItem({
      siteDir: value.siteDir,
      item: value.item,
      retryFeedback,
      ...CHUNK_OPTIONS,
      chunkTargetChars: CHUNK_OPTIONS.targetChars,
      chunkMaxChars: CHUNK_OPTIONS.maxChars,
      chunkCheckpoint: retryContext.chunkCheckpoint,
      onChunkCompleted: retryContext.onChunkCompleted,
      validate: async () => [],
      maxReviewRounds: 0,
      callModel: async ({agent, messages}) => {
        if (agent === 'review') return '{"pass":true,"issues":[]}'
        const unit = taggedJsonContent(messages, 'semantic_units')[0]
        const chunk = Number(unit.id.match(/chunk\.(\d+)/)?.[1] || 0)
        translationCalls.set(chunk, (translationCalls.get(chunk) || 0) + 1)
        if (chunk === 2) throw new Error('stream disconnected before completion: stream closed before response.completed')
        return semanticTranslationResponse(messages, text => `JA:${text}`)
      },
    }),
  })
  assert.equal(result.status, 'failed')
  assert.equal(translationCalls.get(1), 1)
  assert.equal(translationCalls.get(2), 1)
  return result
}

function createArtifactAndAnalysis(value, result, overrides = {}) {
  createRecoveryArtifact({
    siteDir: value.siteDir,
    outputDir: value.artifactDir,
    results: [result],
    identity: value.artifactIdentity,
  })
  return analyzeRecoveryCompatibility({
    siteDir: value.siteDir,
    manifest: value.manifest,
    artifacts: [value.artifactDir],
    promptContractSha256: value.currentIdentity.promptContractSha256,
    model: value.currentIdentity.model,
    executionToolingSha: value.currentIdentity.toolingSha,
    allowFullRetranslate: false,
    chunkOptions: CHUNK_OPTIONS,
    ...overrides,
  })
}

test('serializes a reviewed chunk prefix and resumes after a new recovery-analysis load boundary', async t => {
  const value = fixture(t)
  const failed = await createTerminalPartialFailure(value)
  assert.equal(failed.chunkCheckpoints.entries.length, 1)
  assert.equal(failed.chunkCheckpoints.entries[0].index, 0)

  const analysis = createArtifactAndAnalysis(value, failed)
  assert.equal(analysis.resumableFileCount, 1)
  assert.equal(analysis.recoveredChunkCount, 1)
  assert.equal(analysis.fullRetranslation, false)
  assert.equal(analysis.pending[0].chunkResume.chunks.length, 1)

  const analysisFile = path.join(value.siteDir, 'recovery-analysis.json')
  fs.writeFileSync(analysisFile, `${JSON.stringify(analysis)}\n`)
  const loaded = loadRecoveryAnalysis({
    file: analysisFile,
    manifest: value.manifest,
    siteDir: value.siteDir,
    identity: value.currentIdentity,
    chunkOptions: CHUNK_OPTIONS,
  })
  const work = partitionRecoveryWork(value.manifest, loaded.restored, loaded.pending)
  const calls = new Map()
  const result = await processItemWithRetry(work.pending[0].item, {
    maxRetries: 0,
    initialChunkCheckpoints: work.pending[0].item.recoveryChunkCheckpoints,
    processItem: (_item, _attempt, retryFeedback, retryContext) => processManifestItem({
      siteDir: value.siteDir,
      item: value.item,
      retryFeedback,
      chunkTargetChars: CHUNK_OPTIONS.targetChars,
      chunkMaxChars: CHUNK_OPTIONS.maxChars,
      chunkCheckpoint: retryContext.chunkCheckpoint,
      onChunkCompleted: retryContext.onChunkCompleted,
      validate: async () => [],
      maxReviewRounds: 0,
      callModel: async ({agent, messages}) => {
        if (agent === 'review') return '{"pass":true,"issues":[]}'
        const unit = taggedJsonContent(messages, 'semantic_units')[0]
        const chunk = Number(unit.id.match(/chunk\.(\d+)/)?.[1] || 0)
        calls.set(chunk, (calls.get(chunk) || 0) + 1)
        return semanticTranslationResponse(messages, text => `JA:${text}`)
      },
    }),
  })

  assert.equal(result.status, 'translated')
  assert.equal(calls.get(1) || 0, 0, 'recovered chunk 1 must not call the translation provider')
  assert.equal(calls.get(2), 1)
  assert.equal(calls.get(3), 1)
  assert.equal(result.chunks.reused, 1)
})

test('persists completed semantic children through artifact preflight and skips them after an analysis reload', async t => {
  const value = fixture(t)
  const units = await collectSemanticUnits(value.source)
  const completed = units[0]
  const semanticCheckpoints = {
    schemaVersion: 1,
    sourcePath: value.item.sourcePath,
    targetPath: value.item.targetPath,
    sourceHash: value.item.sourceHash,
    target: value.item.target,
    locale: value.item.locale,
    contractId: loadLocaleContract(value.item.target).contractId,
    entries: [{id: completed.id, sourceHash: HASH(completed.source), translation: completed.source}],
  }
  createRecoveryArtifact({
    siteDir: value.siteDir,
    outputDir: value.artifactDir,
    results: [{...value.item, status: 'failed', error: 'later semantic child failed', semanticCheckpoints}],
    identity: value.artifactIdentity,
  })
  const analysis = analyzeRecoveryCompatibility({
    siteDir: value.siteDir,
    manifest: value.manifest,
    artifacts: [value.artifactDir],
    promptContractSha256: value.currentIdentity.promptContractSha256,
    model: value.currentIdentity.model,
    executionToolingSha: value.currentIdentity.toolingSha,
    allowFullRetranslate: false,
    chunkOptions: {targetChars: 1000, maxChars: 2000},
  })
  assert.equal(analysis.semanticResumableFileCount, 1)
  assert.equal(analysis.recoveredSemanticUnitCount, 1)
  assert.equal(analysis.fullRetranslation, false)
  assert.equal(analysis.pending[0].semanticResume.report.entries[0].id, completed.id)

  const analysisFile = path.join(value.siteDir, 'semantic-recovery-analysis.json')
  fs.writeFileSync(analysisFile, `${JSON.stringify(analysis)}\n`)
  const loaded = loadRecoveryAnalysis({
    file: analysisFile,
    manifest: value.manifest,
    siteDir: value.siteDir,
    identity: value.currentIdentity,
    chunkOptions: {targetChars: 1000, maxChars: 2000},
  })
  const work = partitionRecoveryWork(value.manifest, loaded.restored, loaded.pending)
  assert.equal(work.pending[0].item.recoverySemanticCheckpoints.entries[0].id, completed.id)

  const requestedIds = []
  const result = await processItemWithRetry(work.pending[0].item, {
    maxRetries: 0,
    initialSemanticCheckpoints: work.pending[0].item.recoverySemanticCheckpoints,
    processItem: (_item, _attempt, retryFeedback, retryContext) => processManifestItem({
      siteDir: value.siteDir,
      item: value.item,
      retryFeedback,
      chunkTargetChars: 1000,
      chunkMaxChars: 2000,
      semanticCheckpoint: retryContext.semanticCheckpoint,
      onSemanticUnitCompleted: retryContext.onSemanticUnitCompleted,
      validate: async () => [],
      maxReviewRounds: 0,
      callModel: async ({agent, messages}) => {
        if (agent === 'review') return '{"pass":true,"issues":[]}'
        const requested = taggedJsonContent(messages, 'semantic_units')
        requestedIds.push(...requested.map(unit => unit.id))
        return semanticTranslationResponse(messages)
      },
    }),
  })

  assert.equal(result.status, 'translated')
  assert.equal(requestedIds.includes(completed.id), false, 'completed semantic child must not be resent after recovery')
  assert.deepEqual(new Set(requestedIds), new Set(units.slice(1).map(unit => unit.id)))
})

test('bounds semantic checkpoint entry counts and rejects unbounded retained identities', () => {
  const item = {
    target: 'ja-JP',
    sourcePath: 'docs/bounded.md',
    targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/bounded.md',
    sourceHash: 'a'.repeat(64),
    locale: 'ja-JP',
  }
  const checkpoints = new Map(Array.from({length: 300}, (_, index) => {
    const id = `document.paragraph.${String(index).padStart(4, '0')}`
    return [id, {id, sourceHash: HASH(`source-${index}`), translation: `translation-${index}`}]
  }))
  const report = serializeSemanticCheckpoints(checkpoints, item)
  assert.equal(report.entries.length, 256)
  assert.throws(() => loadSemanticCheckpoints({
    ...report,
    entries: [{...report.entries[0], id: 'x'.repeat(241)}],
  }, item), /entry is invalid/i)
})

test('rejects a semantic resume whose retained unit source identity is corrupt', async t => {
  const value = fixture(t)
  const [unit] = await collectSemanticUnits(value.source)
  createRecoveryArtifact({
    siteDir: value.siteDir,
    outputDir: value.artifactDir,
    results: [{
      ...value.item,
      status: 'failed',
      error: 'later semantic child failed',
      semanticCheckpoints: {
        schemaVersion: 1,
        sourcePath: value.item.sourcePath,
        targetPath: value.item.targetPath,
        sourceHash: value.item.sourceHash,
        target: value.item.target,
        locale: value.item.locale,
        contractId: loadLocaleContract(value.item.target).contractId,
        entries: [{id: unit.id, sourceHash: 'f'.repeat(64), translation: unit.source}],
      },
    }],
    identity: value.artifactIdentity,
  })
  const analysis = analyzeRecoveryCompatibility({
    siteDir: value.siteDir,
    manifest: value.manifest,
    artifacts: [value.artifactDir],
    promptContractSha256: value.currentIdentity.promptContractSha256,
    model: value.currentIdentity.model,
    executionToolingSha: value.currentIdentity.toolingSha,
    allowFullRetranslate: true,
    chunkOptions: {targetChars: 1000, maxChars: 2000},
  })
  assert.equal(analysis.semanticResumableFileCount, 0)
  assert.equal(analysis.recoveredSemanticUnitCount, 0)
  assert.equal(analysis.fullRetranslation, true)
  assert.match(analysis.rejected[0].reason, /semantic recovery checkpoint/i)
})

test('does not serialize semantic checkpoints for non-provider terminal failures', async () => {
  const item = {
    target: 'ja-JP',
    sourcePath: 'docs/non-provider.md',
    targetPath: 'i18n/ja-JP/docusaurus-plugin-content-docs/current/non-provider.md',
    sourceHash: 'a'.repeat(64),
    locale: 'ja-JP',
  }
  const checkpoint = {id: 'document.heading.0001', sourceHash: 'b'.repeat(64), translation: '見出し'}
  for (const failureCategory of [
    'review_failed',
    'locale_contract_failed',
    'protected_content_failed',
    'semantic_response_failed',
    'contract_conflict',
    'unknown',
  ]) {
    const checkpointSizesAtAttemptStart = []
    const result = await processItemWithRetry(item, {
      maxRetries: 1,
      processItem: (_item, _attempt, _feedback, retryContext) => {
        checkpointSizesAtAttemptStart.push(retryContext.semanticCheckpoint.size)
        retryContext.onSemanticUnitCompleted(checkpoint)
        return {...item, status: 'failed', failureCategory, error: `${failureCategory} terminal failure`}
      },
    })
    assert.equal(result.status, 'failed', failureCategory)
    assert.equal(result.failureCategory, failureCategory)
    assert.deepEqual(checkpointSizesAtAttemptStart, [0, 0], `${failureCategory} must clear checkpoints before file retry`)
    assert.equal(Object.hasOwn(result, 'semanticCheckpoints'), false, failureCategory)
  }
})

test('drops an invalid recovered semantic checkpoint after MDX failure so the next recovery retranslates it', async t => {
  const value = fixture(t)
  const chunkOptions = {targetChars: 1000, maxChars: 2000}
  const units = await collectSemanticUnits(value.source)
  const brokenUnit = units[0]
  const initialSemanticCheckpoints = {
    schemaVersion: 1,
    sourcePath: value.item.sourcePath,
    targetPath: value.item.targetPath,
    sourceHash: value.item.sourceHash,
    target: value.item.target,
    locale: value.item.locale,
    contractId: loadLocaleContract(value.item.target).contractId,
    entries: [{id: brokenUnit.id, sourceHash: HASH(brokenUnit.source), translation: '<Broken'}],
  }
  const firstRequestedIds = []
  const failed = await processItemWithRetry(value.item, {
    maxRetries: 0,
    initialSemanticCheckpoints,
    processItem: (_item, _attempt, retryFeedback, retryContext) => processManifestItem({
      siteDir: value.siteDir,
      item: value.item,
      retryFeedback,
      chunkTargetChars: chunkOptions.targetChars,
      chunkMaxChars: chunkOptions.maxChars,
      semanticCheckpoint: retryContext.semanticCheckpoint,
      onSemanticUnitCompleted: retryContext.onSemanticUnitCompleted,
      validate: validateTranslatedContent,
      maxReviewRounds: 0,
      callModel: async ({agent, messages}) => {
        if (agent === 'review') return '{"pass":true,"issues":[]}'
        const requested = taggedJsonContent(messages, 'semantic_units')
        firstRequestedIds.push(...requested.map(unit => unit.id))
        return semanticTranslationResponse(messages)
      },
    }),
  })
  assert.equal(failed.status, 'failed')
  assert.equal(failed.failureCategory, 'unknown')
  assert.match(failed.validationErrors.join('\n'), /MDX compile error/i)
  assert.equal(firstRequestedIds.includes(brokenUnit.id), false)
  assert.equal(Object.hasOwn(failed, 'semanticCheckpoints'), false)

  createRecoveryArtifact({siteDir: value.siteDir, outputDir: value.artifactDir, results: [failed], identity: value.artifactIdentity})
  const analysis = analyzeRecoveryCompatibility({
    siteDir: value.siteDir,
    manifest: value.manifest,
    artifacts: [value.artifactDir],
    promptContractSha256: value.currentIdentity.promptContractSha256,
    model: value.currentIdentity.model,
    executionToolingSha: value.currentIdentity.toolingSha,
    allowFullRetranslate: true,
    chunkOptions,
  })
  assert.equal(analysis.semanticResumableFileCount, 0)
  assert.equal(analysis.recoveredSemanticUnitCount, 0)
  assert.equal(analysis.fullRetranslation, true)

  const analysisFile = path.join(value.siteDir, 'invalid-semantic-recovery-analysis.json')
  fs.writeFileSync(analysisFile, `${JSON.stringify(analysis)}\n`)
  const loaded = loadRecoveryAnalysis({file: analysisFile, manifest: value.manifest, siteDir: value.siteDir, identity: value.currentIdentity, chunkOptions})
  const work = partitionRecoveryWork(value.manifest, loaded.restored, loaded.pending)
  const resumedRequestedIds = []
  const recovered = await processItemWithRetry({...work.pending[0].item, target: value.item.target}, {
    maxRetries: 0,
    processItem: (_item, _attempt, retryFeedback, retryContext) => processManifestItem({
      siteDir: value.siteDir,
      item: value.item,
      retryFeedback,
      chunkTargetChars: chunkOptions.targetChars,
      chunkMaxChars: chunkOptions.maxChars,
      semanticCheckpoint: retryContext.semanticCheckpoint,
      onSemanticUnitCompleted: retryContext.onSemanticUnitCompleted,
      validate: validateTranslatedContent,
      maxReviewRounds: 0,
      callModel: async ({agent, messages}) => {
        if (agent === 'review') return '{"pass":true,"issues":[]}'
        const requested = taggedJsonContent(messages, 'semantic_units')
        resumedRequestedIds.push(...requested.map(unit => unit.id))
        return semanticTranslationResponse(messages)
      },
    }),
  })
  assert.equal(recovered.status, 'translated')
  assert.ok(resumedRequestedIds.includes(brokenUnit.id), 'the invalid retained unit must be translated again')
  assert.deepEqual(await validateTranslatedContent(fs.readFileSync(path.join(value.siteDir, value.item.targetPath), 'utf8')), [])
})

test('resumes exact retained timeout content across the authenticated artifact boundary', async t => {
  const siteDir = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-semantic-retained-site-'))
  const artifactDir = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-semantic-retained-artifact-'))
  t.after(() => {
    fs.rmSync(siteDir, {recursive: true, force: true})
    fs.rmSync(artifactDir, {recursive: true, force: true})
  })
  const fixturePath = path.resolve(__dirname, 'fixtures/retained-timeout/external-collection-limits.md.base64')
  const source = Buffer.from(fs.readFileSync(fixturePath, 'utf8').trim(), 'base64').toString('utf8')
  const sourcePath = 'content/en/guides/tutorials/development/collection/external-collection-limits.md'
  const targetPath = 'i18n/ja-JP/docusaurus-plugin-content-docs/current/external-collection-limits.md'
  const item = {target: 'ja-JP', sourcePath, targetPath, sourceHash: HASH(source), locale: 'ja-JP', type: 'guides'}
  const manifest = {target: 'ja-JP', locale: 'ja-JP', group: 'guides', sourceCheckpointSha: 'a'.repeat(40), items: [item]}
  const artifactIdentity = {
    locale: 'ja-JP', group: 'guides', promptContractSha256: 'b'.repeat(64), model: 'translation-model',
    sourceSha: manifest.sourceCheckpointSha, toolingSha: 'c'.repeat(40), mode: 'incremental',
  }
  const currentIdentity = {promptContractSha256: artifactIdentity.promptContractSha256, model: artifactIdentity.model, toolingSha: artifactIdentity.toolingSha}
  const chunkOptions = {targetChars: 8000, maxChars: 12000}
  assert.equal(Buffer.byteLength(source), 8802)
  assert.equal(HASH(source), 'a34bf461c3bfb825ffbc70cd594b9f033fc16c69f5a654bb1fe3dc0073074897')
  assert.equal(chunkDocument(source, chunkOptions).length, 1)
  write(siteDir, sourcePath, source)
  const translate = text => text
    .replace(/collection/gi, 'コレクション')
    .replace(/cluster/gi, 'クラスター')
    .replace(/vector/gi, 'ベクトル')
    .replace(/scalar/gi, 'スカラー')
    .replace(/index/gi, 'インデックス')
    .replace(/schema/gi, 'スキーマ')
    .replace(/database/gi, 'データベース')
  let initialFailure = true
  let adaptiveChild = 0
  const failed = await processItemWithRetry(item, {
    maxRetries: 0,
    providerRetryBudget: createProviderRetryBudget(3),
    adaptiveCallBudget: createAdaptiveCallBudget(32),
    processItem: (_item, _attempt, retryFeedback, retryContext) => processManifestItem({
      siteDir,
      item,
      retryFeedback,
      chunkTargetChars: chunkOptions.targetChars,
      chunkMaxChars: chunkOptions.maxChars,
      providerRetryBudget: retryContext.providerRetryBudget,
      adaptiveCallBudget: retryContext.adaptiveCallBudget,
      semanticCheckpoint: retryContext.semanticCheckpoint,
      onSemanticUnitCompleted: retryContext.onSemanticUnitCompleted,
      validate: validateTranslatedContent,
      maxReviewRounds: 0,
      callModel: async ({agent, messages}) => {
        assert.equal(agent, 'translation')
        if (initialFailure) {
          initialFailure = false
          throw Object.assign(new Error('retained 240s timeout'), {
            failureCategory: 'provider_timeout', code: 'PROVIDER_TIMEOUT', providerAttempts: 1, adaptiveSubdivisionRecommended: true,
          })
        }
        adaptiveChild += 1
        if (adaptiveChild > 2) {
          throw Object.assign(new Error('later adaptive child transport failure'), {
            failureCategory: 'provider_transport', code: 'PROVIDER_TRANSPORT', providerAttempts: 2,
          })
        }
        return semanticTranslationResponse(messages, translate)
      },
    }),
  })
  assert.equal(failed.status, 'failed')
  assert.equal(failed.failureCategory, 'provider_transport')
  assert.ok(failed.semanticCheckpoints.entries.length > 0)
  const completedIds = new Set(failed.semanticCheckpoints.entries.map(entry => entry.id))

  createRecoveryArtifact({siteDir, outputDir: artifactDir, results: [failed], identity: artifactIdentity})
  const analysis = analyzeRecoveryCompatibility({
    siteDir,
    manifest,
    artifacts: [artifactDir],
    promptContractSha256: currentIdentity.promptContractSha256,
    model: currentIdentity.model,
    executionToolingSha: currentIdentity.toolingSha,
    allowFullRetranslate: false,
    chunkOptions,
  })
  assert.equal(analysis.semanticResumableFileCount, 1)
  assert.equal(analysis.recoveredSemanticUnitCount, completedIds.size)
  const analysisFile = path.join(siteDir, 'retained-timeout-semantic-recovery.json')
  fs.writeFileSync(analysisFile, `${JSON.stringify(analysis)}\n`)
  const loaded = loadRecoveryAnalysis({file: analysisFile, manifest, siteDir, identity: currentIdentity, chunkOptions})
  const work = partitionRecoveryWork(manifest, loaded.restored, loaded.pending)
  const requestedIds = []
  const recovered = await processItemWithRetry({...work.pending[0].item, target: item.target}, {
    maxRetries: 0,
    initialSemanticCheckpoints: work.pending[0].item.recoverySemanticCheckpoints,
    processItem: (_item, _attempt, retryFeedback, retryContext) => processManifestItem({
      siteDir,
      item,
      retryFeedback,
      chunkTargetChars: chunkOptions.targetChars,
      chunkMaxChars: chunkOptions.maxChars,
      semanticCheckpoint: retryContext.semanticCheckpoint,
      onSemanticUnitCompleted: retryContext.onSemanticUnitCompleted,
      validate: validateTranslatedContent,
      maxReviewRounds: 0,
      callModel: async ({agent, messages}) => {
        if (agent === 'review') return '{"pass":true,"issues":[]}'
        const requested = taggedJsonContent(messages, 'semantic_units')
        requestedIds.push(...requested.map(unit => unit.id))
        return semanticTranslationResponse(messages, translate)
      },
    }),
  })
  assert.equal(recovered.status, 'translated')
  assert.ok(requestedIds.length > 0)
  assert.ok(requestedIds.every(id => !completedIds.has(id)), 'completed retained semantic IDs must not be called again')
  const allIds = new Set((await collectSemanticUnits(source)).map(unit => unit.id))
  assert.deepEqual(new Set([...completedIds, ...requestedIds]), allIds)
  const translated = fs.readFileSync(path.join(siteDir, targetPath), 'utf8')
  assert.deepEqual(validateProtectedContent(source, translated, {sourcePath, targetPath}), [])
  const localeContract = loadLocaleContract('ja-JP')
  const protectedOptions = {literalTokens: localeContract.doNotTranslate}
  const sourceUnits = protectSemanticUnits(await collectSemanticUnits(source), unit => unit.source, protectedOptions)
  const draftUnits = protectSemanticUnits(await collectSemanticUnits(translated), unit => unit.source, protectedOptions)
  assert.deepEqual(deterministicSemanticIssues(sourceUnits, draftUnits, localeContract).issues, [])
  assert.deepEqual(await validateTranslatedContent(translated), [])
})

test('revalidates a partial prefix after prompt or model changes and truncates at the first invalid chunk', async t => {
  const value = fixture(t)
  const failed = await createTerminalPartialFailure(value)
  const changed = createArtifactAndAnalysis(value, failed, {
    promptContractSha256: 'e'.repeat(64),
    model: 'new-model',
  })
  assert.equal(changed.pending[0].chunkResume.compatibility, 'revalidated')
  assert.equal(changed.recoveredChunkCount, 1)

  const manifestPath = path.join(value.artifactDir, 'manifest.json')
  const artifactManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const checkpoint = artifactManifest.failures[0].chunkCheckpoints.entries[0]
  checkpoint.translatedContent = '`JA:# One`\n'
  checkpoint.targetHash = HASH(checkpoint.translatedContent)
  checkpoint.targetSize = Buffer.byteLength(checkpoint.translatedContent)
  fs.writeFileSync(manifestPath, JSON.stringify(artifactManifest))
  const invalid = analyzeRecoveryCompatibility({
    siteDir: value.siteDir,
    manifest: value.manifest,
    artifacts: [value.artifactDir],
    promptContractSha256: 'e'.repeat(64),
    model: 'new-model',
    executionToolingSha: value.currentIdentity.toolingSha,
    allowFullRetranslate: true,
    chunkOptions: CHUNK_OPTIONS,
  })
  assert.equal(invalid.resumableFileCount, 0)
  assert.equal(invalid.recoveredChunkCount, 0)
  assert.equal(invalid.rejectedChunkCount, 1)
  assert.match(invalid.rejectedChunks[0].reason, /revalidation.*protected/i)
})

test('tooling-only changes revalidate partial chunks with the current contract', async t => {
  const value = fixture(t)
  const failed = await createTerminalPartialFailure(value)
  createRecoveryArtifact({siteDir: value.siteDir, outputDir: value.artifactDir, results: [failed], identity: value.artifactIdentity})
  const manifestPath = path.join(value.artifactDir, 'manifest.json')
  const artifactManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const checkpoint = artifactManifest.failures[0].chunkCheckpoints.entries[0]
  checkpoint.translatedContent = '`JA:# One`\n'
  checkpoint.targetHash = HASH(checkpoint.translatedContent)
  checkpoint.targetSize = Buffer.byteLength(checkpoint.translatedContent)
  fs.writeFileSync(manifestPath, JSON.stringify(artifactManifest))

  const analysis = analyzeRecoveryCompatibility({
    siteDir: value.siteDir,
    manifest: value.manifest,
    artifacts: [value.artifactDir],
    promptContractSha256: value.artifactIdentity.promptContractSha256,
    model: value.artifactIdentity.model,
    executionToolingSha: value.currentIdentity.toolingSha,
    allowFullRetranslate: true,
    chunkOptions: CHUNK_OPTIONS,
  })
  assert.equal(analysis.resumableFileCount, 0)
  assert.equal(analysis.recoveredChunkCount, 0)
  assert.match(analysis.rejectedChunks[0].reason, /revalidation.*protected/i)
})

test('revalidates cross-version chunks again at the agent load boundary', async t => {
  const value = fixture(t)
  const failed = await createTerminalPartialFailure(value)
  const analysis = createArtifactAndAnalysis(value, failed, {
    promptContractSha256: 'e'.repeat(64),
    model: 'new-model',
  })
  const checkpoint = analysis.pending[0].chunkResume.chunks[0]
  checkpoint.translatedContent = '`JA:# One`\n'
  checkpoint.targetHash = HASH(checkpoint.translatedContent)
  checkpoint.targetSize = Buffer.byteLength(checkpoint.translatedContent)
  const file = path.join(value.siteDir, 'tampered-recovery-analysis.json')
  fs.writeFileSync(file, JSON.stringify(analysis))

  assert.throws(() => loadRecoveryAnalysis({
    file,
    manifest: value.manifest,
    siteDir: value.siteDir,
    identity: {promptContractSha256: 'e'.repeat(64), model: 'new-model', toolingSha: value.currentIdentity.toolingSha},
    chunkOptions: CHUNK_OPTIONS,
  }), /revalidation.*protected/i)
})

test('binds partial checkpoints to the manifest locale, group, and source checkpoint provenance', async t => {
  const value = fixture(t)
  const failed = await createTerminalPartialFailure(value)
  createRecoveryArtifact({siteDir: value.siteDir, outputDir: value.artifactDir, results: [failed], identity: value.artifactIdentity})
  const analysis = analyzeRecoveryCompatibility({
    siteDir: value.siteDir,
    manifest: {...value.manifest, sourceCheckpointSha: 'f'.repeat(40)},
    artifacts: [value.artifactDir],
    promptContractSha256: value.currentIdentity.promptContractSha256,
    model: value.currentIdentity.model,
    executionToolingSha: value.currentIdentity.toolingSha,
    allowFullRetranslate: true,
    chunkOptions: CHUNK_OPTIONS,
  })
  assert.equal(analysis.resumableFileCount, 0)
  assert.match(analysis.rejectedChunks[0].reason, /provenance.*locale.*group.*source checkpoint/i)
})

test('rejects per-chunk and total artifact payloads above the documented bounds', t => {
  const value = fixture(t)
  const oversizedChunk = {
    ...value.item,
    status: 'failed',
    error: 'timeout',
    chunkCheckpoints: {
      schemaVersion: 1,
      totalChunks: 1,
      entries: [{index: 0, sourceHash: HASH(value.source), translatedContent: 'x'.repeat(MAX_PARTIAL_CHUNK_BYTES + 1)}],
    },
  }
  assert.throws(() => createRecoveryArtifact({
    siteDir: value.siteDir,
    outputDir: value.artifactDir,
    results: [oversizedChunk],
    identity: value.artifactIdentity,
  }), /oversized/i)

  const perFileBytes = 4 * 1024 * 1024
  const chunks = Array.from({length: 16}, (_, index) => ({
    index,
    sourceHash: HASH(`${index}`),
    translatedContent: 'x'.repeat(perFileBytes / 16),
  }))
  const results = Array.from({length: Math.floor(MAX_PARTIAL_ARTIFACT_BYTES / perFileBytes) + 1}, (_, index) => {
    const sourcePath = `docs/large-${index}.md`
    const targetPath = `i18n/ja-JP/large-${index}.md`
    const source = `source-${index}`
    write(value.siteDir, sourcePath, source)
    return {
      target: 'ja-JP', sourcePath, targetPath, sourceHash: HASH(source), locale: 'ja-JP', type: 'guides',
      status: 'failed', error: 'timeout', chunkCheckpoints: {schemaVersion: 1, totalChunks: 16, entries: chunks},
    }
  })
  assert.throws(() => createRecoveryArtifact({siteDir: value.siteDir, outputDir: value.artifactDir, results, identity: value.artifactIdentity}), /artifact payload is oversized/i)
})

test('rejects a retained artifact whose declared aggregate chunk payload exceeds the total bound', async t => {
  const value = fixture(t)
  const failed = await createTerminalPartialFailure(value)
  createRecoveryArtifact({siteDir: value.siteDir, outputDir: value.artifactDir, results: [failed], identity: value.artifactIdentity})
  const manifestPath = path.join(value.artifactDir, 'manifest.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const template = manifest.failures[0]
  manifest.failures = Array.from({length: 5}, () => JSON.parse(JSON.stringify(template)))
  for (const failure of manifest.failures) {
    const entry = failure.chunkCheckpoints.entries[0]
    entry.translatedContent = 'x'.repeat(4 * 1024 * 1024)
    entry.targetHash = HASH(entry.translatedContent)
    entry.targetSize = 1
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest))

  const analysis = analyzeRecoveryCompatibility({
    siteDir: value.siteDir,
    manifest: value.manifest,
    artifacts: [value.artifactDir],
    promptContractSha256: value.currentIdentity.promptContractSha256,
    model: value.currentIdentity.model,
    executionToolingSha: value.currentIdentity.toolingSha,
    allowFullRetranslate: true,
    chunkOptions: CHUNK_OPTIONS,
  })
  assert.equal(analysis.resumableFileCount, 0)
  assert.match(analysis.rejected[0].reason, /corrupt recovery artifact.*oversized/i)
})

test('load boundary enforces the aggregate actual-byte limit across resumable files', t => {
  const value = fixture(t)
  const chunkOptions = {targetChars: 10, maxChars: 20}
  const items = []
  const pending = []
  const artifactExecution = createArtifactExecution({...value.artifactIdentity, toolingSha: value.currentIdentity.toolingSha})
  for (let fileIndex = 0; fileIndex < 5; fileIndex++) {
    const sourcePath = `docs/aggregate-${fileIndex}.md`
    const targetPath = `i18n/ja-JP/aggregate-${fileIndex}.md`
    const source = Array.from({length: 16}, (_, index) => `# H${index}\n\ntext${index}\n`).join('')
    write(value.siteDir, sourcePath, source)
    const chunks = chunkDocument(source, chunkOptions)
    assert.equal(chunks.length, 16)
    const item = {target: 'ja-JP', sourcePath, targetPath, sourceHash: HASH(source), locale: 'ja-JP', type: 'guides'}
    items.push(item)
    pending.push({
      sourcePath, targetPath, sourceHash: item.sourceHash,
      chunkResume: {
        schemaVersion: 1, compatibility: 'strict', totalChunks: chunks.length, recoveredChunkCount: chunks.length,
        artifactExecution,
        chunks: chunks.map(chunk => {
          const translatedContent = 'x'.repeat(MAX_PARTIAL_CHUNK_BYTES)
          return {
            index: chunk.index,
            sourceHash: HASH(chunk.source),
            translatedContent,
            targetHash: HASH(translatedContent),
            targetSize: Buffer.byteLength(translatedContent),
          }
        }),
      },
    })
  }
  const manifest = {...value.manifest, items}
  const analysis = {
    schemaVersion: 2, kind: 'translation-recovery-analysis', target: manifest.target, locale: manifest.locale, group: manifest.group,
    sourceCheckpointSha: manifest.sourceCheckpointSha, promptContractSha256: value.currentIdentity.promptContractSha256,
    model: value.currentIdentity.model, executionToolingSha: value.currentIdentity.toolingSha,
    candidateCount: items.length, recoveredCount: 0, pendingCount: items.length, rejectedCount: 0,
    resumableFileCount: items.length, recoveredChunkCount: items.length * 16, rejectedChunkCount: 0,
    fullRetranslation: false, compatibilityMode: 'strict', restored: [], pending, rejected: [], rejectedChunks: [],
  }
  const file = path.join(value.siteDir, 'aggregate-analysis.json')
  fs.writeFileSync(file, JSON.stringify(analysis))
  assert.throws(() => loadRecoveryAnalysis({
    file, manifest, siteDir: value.siteDir, identity: value.currentIdentity, chunkOptions,
  }), /aggregate.*chunk.*payload.*oversized/i)
})

test('rejects corrupt, duplicate, sparse, layout-incompatible, and schema-v1 partial checkpoints', async t => {
  for (const [label, mutate, options = {}] of [
    ['corrupt hash', manifest => { manifest.failures[0].chunkCheckpoints.entries[0].targetHash = 'f'.repeat(64) }],
    ['corrupt size', manifest => { manifest.failures[0].chunkCheckpoints.entries[0].targetSize += 1 }],
    ['duplicate', manifest => { manifest.failures[0].chunkCheckpoints.entries.push({...manifest.failures[0].chunkCheckpoints.entries[0]}) }],
    ['sparse', manifest => { manifest.failures[0].chunkCheckpoints.entries[0].index = 1 }],
    ['layout changed', () => {}, {chunkOptions: {targetChars: 80, maxChars: 100}}],
    ['schema v1', manifest => {
      manifest.schemaVersion = 1
      delete manifest.failures
    }, {schemaVersion: 1}],
  ]) {
    const value = fixture(t)
    const failed = await createTerminalPartialFailure(value)
    createRecoveryArtifact({siteDir: value.siteDir, outputDir: value.artifactDir, results: [failed], identity: value.artifactIdentity})
    const manifestPath = path.join(value.artifactDir, 'manifest.json')
    const metadataPath = path.join(value.artifactDir, 'metadata.json')
    const artifactManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    mutate(artifactManifest)
    fs.writeFileSync(manifestPath, JSON.stringify(artifactManifest))
    if (options.schemaVersion === 1) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
      metadata.schemaVersion = 1
      fs.writeFileSync(metadataPath, JSON.stringify(metadata))
    }
    const analysis = analyzeRecoveryCompatibility({
      siteDir: value.siteDir,
      manifest: value.manifest,
      artifacts: [value.artifactDir],
      promptContractSha256: value.currentIdentity.promptContractSha256,
      model: value.currentIdentity.model,
      executionToolingSha: value.currentIdentity.toolingSha,
      allowFullRetranslate: true,
      chunkOptions: options.chunkOptions || CHUNK_OPTIONS,
    })
    assert.equal(analysis.resumableFileCount, 0, label)
    assert.equal(analysis.recoveredChunkCount, 0, label)
    if (label !== 'schema v1') assert.ok(analysis.rejectedChunkCount > 0, label)
  }
})

test('recovery report exposes structured resumable and rejected chunk counts', async t => {
  const value = fixture(t)
  const failed = await createTerminalPartialFailure(value)
  const analysis = createArtifactAndAnalysis(value, failed)
  assert.deepEqual({
    resumableFileCount: analysis.resumableFileCount,
    recoveredChunkCount: analysis.recoveredChunkCount,
    rejectedChunkCount: analysis.rejectedChunkCount,
  }, {resumableFileCount: 1, recoveredChunkCount: 1, rejectedChunkCount: 0})
})
