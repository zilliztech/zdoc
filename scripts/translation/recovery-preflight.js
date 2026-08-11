#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')

const {
  discoverRecoveryArtifacts,
  promptContractSha256,
  restoreRecoveryFiles,
} = require('./recovery-artifact')
const {validateRecoveryCandidate} = require('./recoveryValidation')
const {MAX_SEMANTIC_CHECKPOINT_AGGREGATE_BYTES, semanticCheckpointBytes} = require('./semanticRecovery')

const SHA = /^[0-9a-f]{40}$/u
const SHA256 = /^[0-9a-f]{64}$/u

function candidateIdentity(candidate) {
  return `${candidate.sourcePath}\0${candidate.targetPath}`
}

function validateInput({manifest, promptContractSha256: contract, model, executionToolingSha, allowFullRetranslate}) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest) || !Array.isArray(manifest.items)) throw new Error('Recovery manifest is invalid')
  if (!['ja-JP', 'zh-CN-reference'].includes(manifest.target) || !['ja-JP', 'zh-CN'].includes(manifest.locale) || typeof manifest.group !== 'string' || !manifest.group) {
    throw new Error('Recovery manifest identity is invalid')
  }
  if (!SHA.test(manifest.sourceCheckpointSha || '')) throw new Error('Recovery source checkpoint SHA is invalid')
  if (!SHA256.test(contract || '')) throw new Error('Current recovery prompt contract is invalid')
  if (typeof model !== 'string' || !model) throw new Error('Current recovery model is invalid')
  if (!SHA.test(executionToolingSha || '')) throw new Error('Current recovery execution tooling SHA is invalid')
  if (typeof allowFullRetranslate !== 'boolean') throw new Error('Full retranslation authorization must be boolean')
  const identities = new Set()
  for (const candidate of manifest.items) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) throw new Error('Recovery candidate must be an object')
    if (typeof candidate.sourcePath !== 'string' || typeof candidate.targetPath !== 'string' || !SHA256.test(candidate.sourceHash || '')) {
      throw new Error('Recovery candidate identity is invalid')
    }
    const identity = candidateIdentity(candidate)
    if (identities.has(identity)) throw new Error('Recovery candidate identity is duplicated')
    identities.add(identity)
  }
}

function analyzeRecoveryCompatibility({siteDir, manifest, artifacts, promptContractSha256: contract, model, executionToolingSha, allowFullRetranslate, chunkOptions}) {
  validateInput({manifest, promptContractSha256: contract, model, executionToolingSha, allowFullRetranslate})
  if (!Array.isArray(artifacts) || !artifacts.length) throw new Error('Authenticated recovery artifacts are required for compatibility preflight')
  const recovery = restoreRecoveryFiles({
    siteDir,
    candidates: manifest.items,
    artifacts,
    identity: {
      target: manifest.target,
      locale: manifest.locale,
      group: manifest.group,
      promptContractSha256: contract,
      model,
      sourceSha: manifest.sourceCheckpointSha,
      toolingSha: executionToolingSha,
    },
    revalidate: input => validateRecoveryCandidate({...input, target: manifest.target, locale: manifest.locale}),
    chunkOptions,
  })
  const semanticRecoveryBytes = recovery.pending.reduce(
    (total, candidate) => total + semanticCheckpointBytes(candidate.recoverySemanticResume),
    0,
  )
  if (semanticRecoveryBytes > MAX_SEMANTIC_CHECKPOINT_AGGREGATE_BYTES) {
    throw new Error('Recovery semantic aggregate payload is oversized')
  }
  const restored = recovery.restored.map(result => ({
    sourcePath: result.sourcePath,
    targetPath: result.targetPath,
    sourceHash: result.sourceHash,
    targetHash: result.recoveryTargetHash,
    targetSize: result.recoveryTargetSize,
    compatibility: result.recoveryCompatibility || 'strict',
    ...(result.recoveryReviewReceipt ? {reviewReceipt: result.recoveryReviewReceipt} : {}),
  }))
  const pending = recovery.pending.map(candidate => ({
    sourcePath: candidate.sourcePath,
    targetPath: candidate.targetPath,
    sourceHash: candidate.sourceHash,
    ...(candidate.recoveryChunkResume ? {chunkResume: candidate.recoveryChunkResume} : {}),
    ...(candidate.recoverySemanticResume ? {semanticResume: candidate.recoverySemanticResume} : {}),
  }))
  const rejected = recovery.rejected.map(candidate => ({
    sourcePath: candidate.sourcePath,
    targetPath: candidate.targetPath,
    reason: candidate.recoveryReason,
  }))
  const candidateCount = manifest.items.length
  const resumableFileCount = pending.filter(candidate => candidate.chunkResume?.recoveredChunkCount > 0).length
  const recoveredChunkCount = pending.reduce((total, candidate) => total + (candidate.chunkResume?.recoveredChunkCount || 0), 0)
  const semanticResumableFileCount = pending.filter(candidate => candidate.semanticResume?.report?.entries?.length > 0).length
  const recoveredSemanticUnitCount = pending.reduce((total, candidate) => total + (candidate.semanticResume?.report?.entries?.length || 0), 0)
  const rejectedChunks = recovery.rejectedChunks || []
  const rejectedChunkCount = rejectedChunks.length
  const fullRetranslation = candidateCount > 0 && restored.length === 0 && pending.length === candidateCount &&
    resumableFileCount === 0 && semanticResumableFileCount === 0
  const analysis = Object.freeze({
    schemaVersion: 2,
    kind: 'translation-recovery-analysis',
    target: manifest.target,
    locale: manifest.locale,
    group: manifest.group,
    sourceCheckpointSha: manifest.sourceCheckpointSha,
    promptContractSha256: contract,
    model,
    executionToolingSha,
    candidateCount,
    recoveredCount: restored.length,
    pendingCount: pending.length,
    rejectedCount: rejected.length,
    resumableFileCount,
    recoveredChunkCount,
    rejectedChunkCount,
    semanticResumableFileCount,
    recoveredSemanticUnitCount,
    fullRetranslation,
    compatibilityMode: restored.some(item => item.compatibility === 'revalidated') ||
      pending.some(item => item.chunkResume?.compatibility === 'revalidated' || item.semanticResume?.compatibility === 'revalidated')
      ? 'revalidated'
      : restored.length || resumableFileCount || semanticResumableFileCount ? 'strict' : 'none',
    restored,
    pending,
    rejected,
    rejectedChunks,
  })
  if (fullRetranslation && !allowFullRetranslate) {
    const error = new Error('Recovery compatibility would require full retranslation; explicit advanced authorization is required')
    error.analysis = analysis
    throw error
  }
  return analysis
}

function writeAnalysis(output, analysis) {
  fs.mkdirSync(path.dirname(output), {recursive: true})
  fs.writeFileSync(output, `${JSON.stringify(analysis)}\n`)
}

function appendBlockedSummary(file, analysis) {
  if (!file) return
  const reasons = analysis.rejected.length
    ? analysis.rejected.map(item => `- ${item.sourcePath}: ${item.reason}`)
    : ['- None']
  fs.appendFileSync(file, [
    `## Recovery compatibility blocked: ${analysis.target}/${analysis.group}`, '',
    `- Current candidates: ${analysis.candidateCount}`,
    `- Recovered now: ${analysis.recoveredCount}`,
    `- Pending provider work: ${analysis.pendingCount}`,
    `- Rejected retained records: ${analysis.rejectedCount}`,
    `- Resumable files: ${analysis.resumableFileCount}`,
    `- Recovered chunks: ${analysis.recoveredChunkCount}`,
    `- Rejected chunks: ${analysis.rejectedChunkCount}`,
    `- Semantic-resumable files: ${analysis.semanticResumableFileCount}`,
    `- Recovered semantic units: ${analysis.recoveredSemanticUnitCount}`,
    '- Full retranslation: true',
    '- Authorization: missing',
    '', '### Compatibility reasons', ...reasons, '',
  ].join('\n'))
}

function parseArgs(argv) {
  const allowed = new Set(['--manifest', '--recovery-dir', '--output', '--execution-tooling-sha', '--allow-full-retranslate'])
  const values = {}
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!allowed.has(flag) || value === undefined || Object.hasOwn(values, flag)) throw new Error('Recovery preflight arguments are invalid or duplicated')
    values[flag] = value
  }
  for (const flag of allowed) if (!values[flag]) throw new Error(`${flag} is required`)
  if (!['true', 'false'].includes(values['--allow-full-retranslate'])) throw new Error('--allow-full-retranslate must be true or false')
  return values
}

function main(argv = process.argv.slice(2), env = process.env) {
  const args = parseArgs(argv)
  const siteDir = process.cwd()
  const manifest = JSON.parse(fs.readFileSync(path.resolve(siteDir, args['--manifest']), 'utf8'))
  const output = path.resolve(siteDir, args['--output'])
  let analysis
  try {
    analysis = analyzeRecoveryCompatibility({
      siteDir,
      manifest,
      artifacts: discoverRecoveryArtifacts(path.resolve(siteDir, args['--recovery-dir'])),
      promptContractSha256: promptContractSha256(manifest.target, siteDir),
      model: env.TRANSLATION_AGENT_MODEL,
      executionToolingSha: args['--execution-tooling-sha'],
      allowFullRetranslate: args['--allow-full-retranslate'] === 'true',
    })
  } catch (error) {
    if (error.analysis) {
      writeAnalysis(output, error.analysis)
      appendBlockedSummary(env.GITHUB_STEP_SUMMARY, error.analysis)
    }
    throw error
  }
  writeAnalysis(output, analysis)
  process.stdout.write(`${JSON.stringify(analysis)}\n`)
  return analysis
}

if (require.main === module) {
  try { main() }
  catch (error) { console.error(error.message); process.exitCode = 1 }
}

module.exports = {analyzeRecoveryCompatibility, main, parseArgs}
