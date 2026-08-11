#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {spawnSync} = require('node:child_process')

const {
  createModelCallCounter,
  loadRecoveryAnalysis,
  partitionRecoveryWork,
  processItemWithRetry,
  processManifestItem,
  translationManifestItemType,
  validateTranslationManifest,
} = require('./agentRunner')
const {loadChunkLimits} = require('./chunkLimits')
const {promptContractSha256} = require('./recovery-artifact')
const {analyzeRecoveryCompatibility} = require('./recovery-preflight')

const SHA = /^[0-9a-f]{40}$/u
const SHA256 = /^[0-9a-f]{64}$/u

function repositoryPath(value, label) {
  if (typeof value !== 'string' || !value || path.isAbsolute(value) || value.includes('\\') || value.includes('\0') ||
      path.posix.normalize(value) !== value || value.split('/').some(segment => !segment || segment === '.' || segment === '..')) {
    throw new Error(`${label} is not a safe repository-relative path`)
  }
  return value
}

function buildReplayCandidates({metadata, artifactManifest, target}) {
  if (metadata?.schemaVersion !== 2 || artifactManifest?.schemaVersion !== 2 ||
      !Array.isArray(artifactManifest.files) || !Array.isArray(artifactManifest.failures)) {
    throw new Error('Retained recovery artifact must be a schema-v2 artifact')
  }
  if (metadata.translated !== artifactManifest.files.length || metadata.failed !== artifactManifest.failures.length) {
    throw new Error('Retained recovery artifact translated/failed counts do not match its manifest arrays')
  }
  const records = [...artifactManifest.files, ...artifactManifest.failures]
  if (records.length === 0) throw new Error('Retained recovery artifact must contain at least one replay candidate')
  const bySourcePath = new Map()
  const byTargetPath = new Map()
  const candidates = []
  for (const record of records) {
    const sourcePath = repositoryPath(record?.sourcePath, 'Recovery record source path')
    const targetPath = repositoryPath(record?.targetPath, 'Recovery record target path')
    if (!SHA256.test(record?.sourceHash || '')) throw new Error('Recovery record source hash is invalid')
    const identity = {sourcePath, targetPath, sourceHash: record.sourceHash}
    const sourceIdentity = bySourcePath.get(sourcePath)
    const targetIdentity = byTargetPath.get(targetPath)
    if (sourceIdentity || targetIdentity) {
      const duplicate = sourceIdentity?.targetPath === targetPath && sourceIdentity?.sourceHash === record.sourceHash &&
        targetIdentity?.sourcePath === sourcePath && targetIdentity?.sourceHash === record.sourceHash
      throw new Error(`Recovery replay candidate has ${duplicate ? 'duplicate' : 'conflicting'} identity: ${sourcePath}`)
    }
    bySourcePath.set(sourcePath, identity)
    byTargetPath.set(targetPath, identity)
    candidates.push({
      ...identity,
      locale: metadata.locale,
      type: translationManifestItemType(target, sourcePath),
      reason: 'stale_source',
    })
  }
  return validateTranslationManifest({
    target,
    locale: metadata.locale,
    group: metadata.group,
    sourceCheckpointSha: metadata.sourceSha,
    items: candidates,
  }).items
}

function git(repository, args, options = {}) {
  const result = spawnSync('git', ['-C', repository, ...args], {encoding: options.encoding, maxBuffer: 32 * 1024 * 1024})
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(String(result.stderr || result.stdout || `git exited ${result.status}`).trim())
  return result.stdout
}

function writeSource(repository, sourceSha, workspace, sourcePath) {
  const relative = repositoryPath(sourcePath, 'Recovery source path')
  const bytes = git(repository, ['show', `${sourceSha}:${relative}`])
  const destination = path.join(workspace, ...relative.split('/'))
  fs.mkdirSync(path.dirname(destination), {recursive: true})
  fs.writeFileSync(destination, bytes)
}

function taggedJson(messages, tag) {
  const content = messages?.at(-1)?.content
  const match = typeof content === 'string' && content.match(new RegExp(`<${tag}>\\n([\\s\\S]*?)\\n</${tag}>`))
  if (!match) throw new Error(`Replay fake model request is missing ${tag}`)
  return JSON.parse(match[1])
}

function trailingJsonArray(messages) {
  const content = messages?.at(-1)?.content
  if (typeof content !== 'string') throw new Error('Replay fake model request is missing content')
  const start = content.lastIndexOf('\n\n[')
  if (start === -1) throw new Error('Replay fake REST translation request is missing entries')
  return JSON.parse(content.slice(start + 2))
}

function createReplayModelClient() {
  return async ({agent, messages}) => {
    if (agent === 'review') return JSON.stringify({pass: true, issues: []})
    if (agent === 'correction') throw new Error('Replay fake Correction Agent must not be called')
    if (agent !== 'translation') throw new Error(`Replay fake model does not support ${agent || 'missing'} agent`)
    const content = messages?.at(-1)?.content || ''
    if (content.includes('<semantic_units>')) {
      const units = taggedJson(messages, 'semantic_units')
      return JSON.stringify({translations: units.map(unit => ({id: unit.id, text: unit.text}))})
    }
    const entries = trailingJsonArray(messages)
    return JSON.stringify(entries.map(entry => ({id: entry.id, text: entry.text})))
  }
}

async function replayRetainedRecovery({repository, sourceSha, recoveryArtifact, executionToolingSha, executionModel, output, chunkOptions}) {
  const repositoryRoot = fs.realpathSync(repository)
  const artifactRoot = fs.realpathSync(recoveryArtifact)
  if (!SHA.test(sourceSha || '') || !SHA.test(executionToolingSha || '')) throw new Error('Replay SHAs must be exact lowercase commits')
  if (typeof executionModel !== 'string' || !executionModel.trim()) throw new Error('Replay execution model is required')
  const chunkLimits = chunkOptions || loadChunkLimits()
  git(repositoryRoot, ['cat-file', '-e', `${sourceSha}^{commit}`], {encoding: 'utf8'})
  const toolingCheckout = fs.realpathSync(process.cwd())
  const actualExecutionToolingSha = String(git(toolingCheckout, ['rev-parse', 'HEAD'], {encoding: 'utf8'})).trim()
  if (!SHA.test(actualExecutionToolingSha) || actualExecutionToolingSha !== executionToolingSha) {
    throw new Error(`Execution tooling checkout HEAD mismatch: expected ${executionToolingSha}, actual ${actualExecutionToolingSha || 'invalid'}`)
  }
  const metadata = JSON.parse(fs.readFileSync(path.join(artifactRoot, 'metadata.json'), 'utf8'))
  const artifactManifest = JSON.parse(fs.readFileSync(path.join(artifactRoot, 'manifest.json'), 'utf8'))
  if (metadata.sourceSha !== sourceSha) {
    throw new Error('Retained recovery artifact identity does not match the requested replay')
  }
  const target = metadata.locale === 'zh-CN' ? 'zh-CN-reference' : metadata.locale === 'ja-JP' ? 'ja-JP' : null
  if (!target || typeof metadata.group !== 'string' || typeof metadata.model !== 'string') throw new Error('Retained recovery locale, group, or model is invalid')
  const items = buildReplayCandidates({metadata, artifactManifest, target})
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-recovery-retained-replay.'))
  try {
    for (const sourcePath of new Set(items.map(item => item.sourcePath))) writeSource(repositoryRoot, sourceSha, workspace, sourcePath)
    const manifest = {target, locale: metadata.locale, group: metadata.group, sourceCheckpointSha: sourceSha, items}
    const currentPromptContractSha256 = promptContractSha256(target, process.cwd())
    const analysis = analyzeRecoveryCompatibility({
      siteDir: workspace,
      manifest,
      artifacts: [artifactRoot],
      promptContractSha256: currentPromptContractSha256,
      model: executionModel,
      executionToolingSha: actualExecutionToolingSha,
      allowFullRetranslate: false,
      chunkOptions: chunkLimits,
    })
    const analysisFile = path.join(workspace, 'recovery-analysis.json')
    fs.writeFileSync(analysisFile, `${JSON.stringify(analysis)}\n`)
    const loaded = loadRecoveryAnalysis({
      file: analysisFile,
      manifest,
      siteDir: workspace,
      identity: {
        promptContractSha256: currentPromptContractSha256,
        model: executionModel,
        toolingSha: actualExecutionToolingSha,
      },
      chunkOptions: chunkLimits,
    })
    const agentLoadedSemanticUnitCount = loaded.pending.reduce(
      (total, item) => total + (item.recoverySemanticCheckpoints?.entries?.length || 0),
      0,
    )
    const work = partitionRecoveryWork(manifest, loaded.restored, loaded.pending)
    const modelCalls = createModelCallCounter(createReplayModelClient())
    const agentResults = []
    for (const entry of work.pending) {
      const item = entry.item
      const targetItem = {...item, target: manifest.target}
      agentResults.push(await processItemWithRetry(targetItem, {
        maxRetries: 0,
        initialSemanticCheckpoints: item.recoverySemanticCheckpoints,
        initialChunkCheckpoints: item.recoveryChunkCheckpoints,
        fileTimeoutMs: 0,
        processItem: (_item, _attempt, retryFeedback, retryContext) => processManifestItem({
          siteDir: workspace,
          item: targetItem,
          callModel: modelCalls.callModel,
          maxReviewRounds: 0,
          chunkTargetChars: chunkLimits.targetChars,
          chunkMaxChars: chunkLimits.maxChars,
          chunkCheckpoint: retryContext.chunkCheckpoint,
          onChunkCompleted: retryContext.onChunkCompleted,
          signal: retryContext.signal,
          providerRetryBudget: retryContext.providerRetryBudget,
          adaptiveCallBudget: retryContext.adaptiveCallBudget,
          semanticCheckpoint: retryContext.semanticCheckpoint,
          restSpecDraft: retryContext.restSpecDraft,
          onSemanticUnitCompleted: retryContext.onSemanticUnitCompleted,
          retryFeedback,
        }),
      }))
    }
    const agentTranslatedCount = agentResults.filter(result => result.status === 'translated').length
    const agentFailedCount = agentResults.length - agentTranslatedCount
    if (agentFailedCount > 0) {
      const firstFailure = agentResults.find(result => result.status !== 'translated')
      throw new Error(`Replay Agent Runner boundary failed for ${firstFailure.sourcePath}: ${firstFailure.error || firstFailure.failureCategory || 'unknown failure'}`)
    }
    const modelCallCounts = modelCalls.snapshot()
    const first = items[0]
    let fullRetranslationGuardVerified = false
    let guardMessage = null
    try {
      analyzeRecoveryCompatibility({
        siteDir: workspace,
        manifest: {...manifest, items: [{...first, targetPath: `${first.targetPath}.guard-pending`}]},
        artifacts: [artifactRoot],
        promptContractSha256: currentPromptContractSha256,
        model: executionModel,
        executionToolingSha: actualExecutionToolingSha,
        allowFullRetranslate: false,
        chunkOptions: chunkLimits,
      })
    } catch (error) {
      guardMessage = String(error.message || error)
      fullRetranslationGuardVerified = Boolean(error.analysis?.fullRetranslation && /explicit.*authorization/i.test(guardMessage))
    }
    if (!fullRetranslationGuardVerified) throw new Error('Full-retranslation admission guard replay did not fail closed')
    const evidence = Object.freeze({
      schemaVersion: 1,
      kind: 'translation-recovery-retained-replay',
      sourceSha,
      artifactToolingSha: metadata.toolingSha,
      expectedExecutionToolingSha: executionToolingSha,
      executionToolingSha: actualExecutionToolingSha,
      artifactModel: metadata.model,
      executionModel,
      candidateCount: analysis.candidateCount,
      recoveredCount: analysis.recoveredCount,
      pendingCount: analysis.pendingCount,
      rejectedCount: analysis.rejectedCount,
      resumableFileCount: analysis.resumableFileCount,
      recoveredChunkCount: analysis.recoveredChunkCount,
      semanticResumableFileCount: analysis.semanticResumableFileCount,
      recoveredSemanticUnitCount: analysis.recoveredSemanticUnitCount,
      rejections: analysis.rejected.map(item => Object.freeze({sourcePath: item.sourcePath, reason: item.reason})),
      compatibilityMode: analysis.compatibilityMode,
      chunkTargetChars: chunkLimits.targetChars,
      chunkMaxChars: chunkLimits.maxChars,
      agentLoadVerified: true,
      agentLoadedRecoveredCount: loaded.restored.length,
      agentLoadedPendingCount: loaded.pending.length,
      agentLoadedSemanticUnitCount,
      agentBoundaryVerified: true,
      agentProcessedCount: agentResults.length,
      agentTranslatedCount,
      agentFailedCount,
      modelCallCounts,
      modelInvocationCount: modelCallCounts.total,
      fullRetranslationGuardVerified,
      guardMessage,
    })
    fs.mkdirSync(path.dirname(path.resolve(output)), {recursive: true})
    fs.writeFileSync(path.resolve(output), `${JSON.stringify(evidence, null, 2)}\n`)
    process.stdout.write(`${JSON.stringify(evidence)}\n`)
    return evidence
  } finally {
    fs.rmSync(workspace, {recursive: true, force: true})
  }
}

function parseArgs(argv) {
  const required = new Set(['--repository', '--source-sha', '--recovery-artifact', '--execution-tooling-sha', '--execution-model', '--output'])
  const allowed = new Set([...required, '--chunk-target-chars', '--chunk-max-chars'])
  const values = new Map()
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!allowed.has(flag) || value === undefined || values.has(flag)) throw new Error('Recovery replay arguments are invalid')
    values.set(flag, value)
  }
  for (const flag of required) if (!values.get(flag)) throw new Error(`${flag} is required`)
  return values
}

async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv)
  const chunkOptions = loadChunkLimits({
    TRANSLATION_CHUNK_TARGET_CHARS: args.get('--chunk-target-chars'),
    TRANSLATION_CHUNK_MAX_CHARS: args.get('--chunk-max-chars'),
  })
  return replayRetainedRecovery({
    repository: args.get('--repository'),
    sourceSha: args.get('--source-sha'),
    recoveryArtifact: args.get('--recovery-artifact'),
    executionToolingSha: args.get('--execution-tooling-sha'),
    executionModel: args.get('--execution-model'),
    output: args.get('--output'),
    chunkOptions,
  })
}

if (require.main === module) {
  main().catch(error => { console.error(error.message); process.exitCode = 1 })
}

module.exports = {buildReplayCandidates, parseArgs, replayRetainedRecovery}
