'use strict'

const crypto = require('node:crypto')

const {chunkDocument} = require('./chunker')

const SHA256 = /^[0-9a-f]{64}$/u
const COMMIT_SHA = /^[0-9a-f]{40}$/u
const MAX_PARTIAL_CHUNKS_PER_FILE = 128
const MAX_PARTIAL_CHUNK_BYTES = 256 * 1024
const MAX_PARTIAL_FILE_BYTES = 4 * 1024 * 1024
const MAX_PARTIAL_ARTIFACT_BYTES = 16 * 1024 * 1024

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex')
}

function exactKeys(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`)
  if (JSON.stringify(Object.keys(value).sort()) !== JSON.stringify([...keys].sort())) throw new Error(`${label} keys are invalid`)
}

function executionFields(identity) {
  return {
    locale: identity.locale,
    group: identity.group,
    promptContractSha256: identity.promptContractSha256,
    model: identity.model,
    sourceSha: identity.sourceSha,
    toolingSha: identity.toolingSha,
    mode: identity.mode || 'incremental',
  }
}

function executionDigest(fields) {
  return sha256(Buffer.from(JSON.stringify(Object.fromEntries(Object.entries(fields).sort(([left], [right]) => left.localeCompare(right))))))
}

function createArtifactExecution(identity) {
  const fields = executionFields(identity)
  return Object.freeze({...fields, executionSha256: executionDigest(fields)})
}

function validateArtifactExecution(execution, expected = null) {
  const keys = ['locale', 'group', 'promptContractSha256', 'model', 'sourceSha', 'toolingSha', 'mode', 'executionSha256']
  exactKeys(execution, keys, 'Chunk artifact execution identity')
  if (!['ja-JP', 'zh-CN'].includes(execution.locale) || typeof execution.group !== 'string' || !execution.group ||
      !SHA256.test(execution.promptContractSha256 || '') || typeof execution.model !== 'string' || !execution.model ||
      !COMMIT_SHA.test(execution.sourceSha || '') || !COMMIT_SHA.test(execution.toolingSha || '') ||
      typeof execution.mode !== 'string' || !execution.mode || !SHA256.test(execution.executionSha256 || '')) {
    throw new Error('Chunk artifact execution identity is invalid')
  }
  if (executionDigest(executionFields(execution)) !== execution.executionSha256) throw new Error('Chunk artifact execution identity hash is corrupt')
  if (expected && execution.executionSha256 !== createArtifactExecution(expected).executionSha256) throw new Error('Chunk artifact execution identity does not match metadata')
  return execution
}

function validateReportPrefix(value) {
  exactKeys(value, ['schemaVersion', 'totalChunks', 'entries'], 'Chunk checkpoint report')
  if (value.schemaVersion !== 1 || !Number.isSafeInteger(value.totalChunks) || value.totalChunks < 1 ||
      value.totalChunks > MAX_PARTIAL_CHUNKS_PER_FILE || !Array.isArray(value.entries) ||
      value.entries.length < 1 || value.entries.length > Math.min(value.totalChunks, MAX_PARTIAL_CHUNKS_PER_FILE)) {
    throw new Error('Chunk checkpoint report bounds are invalid')
  }
  let totalBytes = 0
  const entries = value.entries.map((entry, position) => {
    exactKeys(entry, ['index', 'sourceHash', 'translatedContent'], 'Chunk checkpoint report entry')
    if (entry.index !== position) throw new Error('Chunk checkpoint report must be a contiguous prefix starting at index 0')
    if (!SHA256.test(entry.sourceHash || '') || typeof entry.translatedContent !== 'string') throw new Error('Chunk checkpoint report entry identity is invalid')
    const targetSize = Buffer.byteLength(entry.translatedContent)
    if (targetSize < 1 || targetSize > MAX_PARTIAL_CHUNK_BYTES) throw new Error('Chunk checkpoint report entry payload is oversized or empty')
    totalBytes += targetSize
    if (totalBytes > MAX_PARTIAL_FILE_BYTES) throw new Error('Chunk checkpoint report file payload is oversized')
    return {index: entry.index, sourceHash: entry.sourceHash, translatedContent: entry.translatedContent}
  })
  return {totalChunks: value.totalChunks, entries, totalBytes}
}

function serializeCompletedChunkCheckpoints(checkpoints) {
  if (!(checkpoints instanceof Map) || checkpoints.size === 0) return null
  const values = [...checkpoints.values()].sort((left, right) => left.index - right.index)
  const totalChunks = values[0]?.total
  const entries = values.map((checkpoint, position) => {
    if (checkpoint.index !== position || checkpoint.total !== totalChunks || checkpoint.review?.pass !== true || typeof checkpoint.translatedContent !== 'string') {
      throw new Error('Completed chunk checkpoints are invalid or noncontiguous')
    }
    return {index: checkpoint.index, sourceHash: checkpoint.sourceHash, translatedContent: checkpoint.translatedContent}
  })
  const report = {schemaVersion: 1, totalChunks, entries}
  validateReportPrefix(report)
  return report
}

function persistChunkCheckpoints(report, identity) {
  if (!report) return null
  const validated = validateReportPrefix(report)
  const execution = createArtifactExecution(identity)
  return {
    schemaVersion: 1,
    totalChunks: validated.totalChunks,
    artifactExecution: execution,
    entries: validated.entries.map(entry => ({
      ...entry,
      targetHash: sha256(Buffer.from(entry.translatedContent)),
      targetSize: Buffer.byteLength(entry.translatedContent),
    })),
  }
}

function validatePersistedPrefix({value, artifactIdentity, currentIdentity, sourceContent, chunkOptions, revalidate}) {
  const rejected = []
  try {
    exactKeys(value, ['schemaVersion', 'totalChunks', 'artifactExecution', 'entries'], 'Persisted chunk checkpoints')
    if (value.schemaVersion !== 1 || !Number.isSafeInteger(value.totalChunks) || value.totalChunks < 1 ||
        value.totalChunks > MAX_PARTIAL_CHUNKS_PER_FILE || !Array.isArray(value.entries) ||
        value.entries.length < 1 || value.entries.length > Math.min(value.totalChunks, MAX_PARTIAL_CHUNKS_PER_FILE)) {
      throw new Error('Persisted chunk checkpoint bounds are invalid')
    }
    if (value.entries.some((entry, position) => entry?.index !== position)) throw new Error('Retained chunks must be a contiguous prefix without duplicate or sparse indexes')
    const execution = validateArtifactExecution(value.artifactExecution, artifactIdentity)
    if (execution.locale !== currentIdentity.locale || execution.group !== currentIdentity.group || execution.sourceSha !== currentIdentity.sourceSha) {
      throw new Error('Retained chunk execution provenance does not match current manifest locale, group, or source checkpoint')
    }
    const chunks = chunkDocument(sourceContent, chunkOptions)
    if (chunks.length !== value.totalChunks) throw new Error('Current chunk layout does not match retained checkpoint layout')
    const compatibility = execution.promptContractSha256 === currentIdentity.promptContractSha256 && execution.model === currentIdentity.model &&
      execution.toolingSha === currentIdentity.toolingSha
      ? 'strict'
      : 'revalidated'
    const accepted = []
    let totalBytes = 0
    for (let position = 0; position < value.entries.length; position++) {
      const entry = value.entries[position]
      try {
        exactKeys(entry, ['index', 'sourceHash', 'translatedContent', 'targetHash', 'targetSize'], 'Persisted chunk checkpoint entry')
        if (entry.index !== position) throw new Error('retained chunks must be a contiguous prefix starting at index 0')
        if (!SHA256.test(entry.sourceHash || '') || !SHA256.test(entry.targetHash || '') || typeof entry.translatedContent !== 'string' ||
            !Number.isSafeInteger(entry.targetSize) || entry.targetSize < 1 || entry.targetSize > MAX_PARTIAL_CHUNK_BYTES) {
          throw new Error('retained chunk identity or bounds are invalid')
        }
        const targetBytes = Buffer.from(entry.translatedContent)
        totalBytes += targetBytes.length
        if (totalBytes > MAX_PARTIAL_FILE_BYTES) throw new Error('retained chunk file payload is oversized')
        if (targetBytes.length !== entry.targetSize || sha256(targetBytes) !== entry.targetHash) throw new Error('retained chunk payload hash or size is corrupt')
        const chunk = chunks[position]
        if (sha256(Buffer.from(chunk.source)) !== entry.sourceHash) throw new Error('current chunk source hash does not match retained checkpoint')
        if (compatibility === 'revalidated') {
          if (typeof revalidate !== 'function') throw new Error('cross-version retained chunk requires current-contract revalidation')
          const errors = revalidate({sourceContent: chunk.source, targetContent: entry.translatedContent, chunkIndex: position})
          if (!Array.isArray(errors) || errors.length) throw new Error(`revalidation failed: ${(errors || ['validator did not return an error list']).join('; ')}`)
        }
        accepted.push({...entry})
      } catch (error) {
        rejected.push({index: Number.isSafeInteger(entry?.index) ? entry.index : position, reason: String(error?.message || error)})
        break
      }
    }
    if (!accepted.length) return {resume: null, rejected}
    return {
      resume: {
        schemaVersion: 1,
        compatibility,
        totalChunks: value.totalChunks,
        recoveredChunkCount: accepted.length,
        artifactExecution: execution,
        chunks: accepted,
      },
      rejected,
    }
  } catch (error) {
    rejected.push({index: 0, reason: String(error?.message || error)})
    return {resume: null, rejected}
  }
}

function loadAnalysisChunkResume({value, sourceContent, chunkOptions, currentIdentity, revalidate}) {
  exactKeys(value, ['schemaVersion', 'compatibility', 'totalChunks', 'recoveredChunkCount', 'artifactExecution', 'chunks'], 'Recovery analysis chunk resume')
  if (value.schemaVersion !== 1 || !['strict', 'revalidated'].includes(value.compatibility) ||
      !Number.isSafeInteger(value.recoveredChunkCount) || value.recoveredChunkCount < 1 ||
      value.recoveredChunkCount !== value.chunks?.length) throw new Error('Recovery analysis chunk resume header is invalid')
  const outcome = validatePersistedPrefix({
    value: {schemaVersion: 1, totalChunks: value.totalChunks, artifactExecution: value.artifactExecution, entries: value.chunks},
    artifactIdentity: value.artifactExecution,
    currentIdentity,
    sourceContent,
    chunkOptions,
    revalidate: value.compatibility === 'revalidated' ? revalidate : null,
  })
  if (!outcome.resume || outcome.rejected.length || outcome.resume.compatibility !== value.compatibility || outcome.resume.recoveredChunkCount !== value.recoveredChunkCount) {
    throw new Error(`Recovery analysis chunk resume payload is invalid: ${outcome.rejected[0]?.reason || 'identity mismatch'}`)
  }
  return outcome.resume.chunks.map(entry => ({
    index: entry.index,
    total: value.totalChunks,
    sourceHash: entry.sourceHash,
    translatedContent: entry.translatedContent,
    review: {pass: true, issues: []},
    semanticUnits: [],
  }))
}

module.exports = {
  MAX_PARTIAL_ARTIFACT_BYTES,
  MAX_PARTIAL_CHUNK_BYTES,
  MAX_PARTIAL_CHUNKS_PER_FILE,
  MAX_PARTIAL_FILE_BYTES,
  createArtifactExecution,
  loadAnalysisChunkResume,
  persistChunkCheckpoints,
  serializeCompletedChunkCheckpoints,
  validatePersistedPrefix,
}
