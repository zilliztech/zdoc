'use strict'

const crypto = require('node:crypto')

const {chunkDocument} = require('./chunker')
const {loadLocaleContract} = require('./localeContract')
const {createArtifactExecution, validateArtifactExecution} = require('./chunkRecovery')
const {validateProtectedContent} = require('./protectedContent')
const {parseRestDocument} = require('./restSpecLocalization')
const {collectSemanticUnitsSync, deterministicSemanticIssues, protectSemanticUnits} = require('./semanticUnits')

const MAX_SEMANTIC_CHECKPOINTS_PER_FILE = 256
const MAX_SEMANTIC_CHECKPOINT_FILE_BYTES = 4 * 1024 * 1024

function exactKeys(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`)
  if (JSON.stringify(Object.keys(value).sort()) !== JSON.stringify([...keys].sort())) throw new Error(`${label} keys are invalid`)
}

function semanticCheckpointIdentity(item) {
  if (!item?.target || !item?.sourcePath || !item?.targetPath || !item?.sourceHash || !item?.locale) return null
  return {
    sourcePath: item.sourcePath,
    targetPath: item.targetPath,
    sourceHash: item.sourceHash,
    target: item.target,
    locale: item.locale,
    contractId: loadLocaleContract(item.target).contractId,
  }
}

function loadSemanticCheckpoints(report, item) {
  if (!report) return new Map()
  const identity = semanticCheckpointIdentity(item)
  const expectedKeys = ['schemaVersion', 'sourcePath', 'targetPath', 'sourceHash', 'target', 'locale', 'contractId', 'entries']
  if (!identity) throw new Error('Semantic checkpoint report identity or schema is invalid')
  exactKeys(report, expectedKeys, 'Semantic checkpoint report')
  if (report.schemaVersion !== 1 || Object.entries(identity).some(([key, value]) => report[key] !== value) ||
      !Array.isArray(report.entries) || report.entries.length < 1 || report.entries.length > MAX_SEMANTIC_CHECKPOINTS_PER_FILE) {
    throw new Error('Semantic checkpoint report identity or schema is invalid')
  }
  const checkpoints = new Map()
  let totalBytes = 0
  for (const entry of report.entries) {
    exactKeys(entry, ['id', 'sourceHash', 'translation'], 'Semantic checkpoint entry')
    if (typeof entry.id !== 'string' || !entry.id || entry.id.length > 240 || !/^[0-9a-f]{64}$/u.test(entry.sourceHash || '') ||
        typeof entry.translation !== 'string') {
      throw new Error('Semantic checkpoint entry is invalid')
    }
    totalBytes += Buffer.byteLength(entry.translation)
    if (totalBytes > MAX_SEMANTIC_CHECKPOINT_FILE_BYTES || checkpoints.has(entry.id)) {
      throw new Error('Semantic checkpoint report is duplicate or oversized')
    }
    checkpoints.set(entry.id, {...entry})
  }
  return checkpoints
}

function serializeSemanticCheckpoints(checkpoints, item) {
  const identity = semanticCheckpointIdentity(item)
  if (!identity || !(checkpoints instanceof Map) || checkpoints.size === 0) return null
  const entries = []
  let totalBytes = 0
  for (const entry of [...checkpoints.values()].sort((left, right) => left.id.localeCompare(right.id))) {
    const entryBytes = Buffer.byteLength(entry.translation || '')
    if (entries.length >= MAX_SEMANTIC_CHECKPOINTS_PER_FILE || totalBytes + entryBytes > MAX_SEMANTIC_CHECKPOINT_FILE_BYTES) break
    entries.push({...entry})
    totalBytes += entryBytes
  }
  if (!entries.length) return null
  const report = {schemaVersion: 1, ...identity, entries}
  loadSemanticCheckpoints(report, item)
  return report
}

function persistSemanticCheckpoints(report, identity, item) {
  if (!report) return null
  loadSemanticCheckpoints(report, item)
  if (report.locale !== identity.locale) throw new Error('Semantic checkpoint locale does not match artifact identity')
  return {
    schemaVersion: 1,
    artifactExecution: createArtifactExecution(identity),
    report: JSON.parse(JSON.stringify(report)),
  }
}

function filterUsableSemanticCheckpoints(checkpoints, sourceUnits, localeContract) {
  const sourceUnitById = new Map(sourceUnits.map(unit => [unit.id, unit]))
  const protectedOptions = {literalTokens: localeContract.doNotTranslate}
  const usable = new Map()
  for (const [id, checkpoint] of checkpoints || []) {
    const unit = sourceUnitById.get(id)
    if (!unit || checkpoint.sourceHash !== crypto.createHash('sha256').update(unit.source).digest('hex') ||
        validateProtectedContent(unit.source, checkpoint.translation).length) continue
    const draftUnit = protectSemanticUnits([{...unit, source: checkpoint.translation}], value => value.source, protectedOptions)[0]
    if (deterministicSemanticIssues([unit], [draftUnit], localeContract).issues.length) continue
    usable.set(id, checkpoint)
  }
  return usable
}

function collectProtectedSourceUnits(sourceContent, sourcePath, target, chunkOptions) {
  const localeContract = loadLocaleContract(target)
  const protectedOptions = {literalTokens: localeContract.doNotTranslate}
  const restDocument = (
    sourcePath.startsWith('content/en/reference/api/restful/restful/') ||
    sourcePath.startsWith('reference/api/restful/restful/')
  ) ? parseRestDocument(sourceContent) : null
  const semanticSource = restDocument?.prefix || sourceContent
  const chunks = !restDocument && chunkOptions ? chunkDocument(semanticSource, chunkOptions) : []
  const units = []
  if (chunks.length > 1) {
    for (const chunk of chunks) {
      units.push(...collectSemanticUnitsSync(chunk.source, {idPrefix: `chunk.${String(chunk.index + 1).padStart(4, '0')}`}))
    }
  } else {
    units.push(...collectSemanticUnitsSync(semanticSource, {idPrefix: 'document'}))
  }
  return {localeContract, sourceUnits: protectSemanticUnits(units, unit => unit.source, protectedOptions)}
}

function validatePersistedSemanticCheckpoints({value, artifactIdentity, currentIdentity, candidate, target, sourceContent, chunkOptions}) {
  exactKeys(value, ['schemaVersion', 'artifactExecution', 'report'], 'Persisted semantic checkpoints')
  if (value.schemaVersion !== 1) throw new Error('Persisted semantic checkpoint schema is invalid')
  const execution = validateArtifactExecution(value.artifactExecution, artifactIdentity)
  if (execution.locale !== currentIdentity.locale || execution.group !== currentIdentity.group || execution.sourceSha !== currentIdentity.sourceSha) {
    throw new Error('Retained semantic execution provenance does not match current manifest locale, group, or source checkpoint')
  }
  const checkpoints = loadSemanticCheckpoints(value.report, {...candidate, target, locale: currentIdentity.locale})
  let report = value.report
  if (typeof sourceContent === 'string') {
    const {localeContract, sourceUnits} = collectProtectedSourceUnits(sourceContent, candidate.sourcePath, target, chunkOptions)
    const usable = filterUsableSemanticCheckpoints(checkpoints, sourceUnits, localeContract)
    if (!usable.size) throw new Error('Retained semantic checkpoint entries do not match current semantic units')
    report = {...value.report, entries: [...usable.values()].sort((left, right) => left.id.localeCompare(right.id)).map(entry => ({...entry}))}
  }
  const compatibility = execution.promptContractSha256 === currentIdentity.promptContractSha256 && execution.model === currentIdentity.model &&
    execution.toolingSha === currentIdentity.toolingSha
    ? 'strict'
    : 'revalidated'
  return {
    schemaVersion: 1,
    compatibility,
    artifactExecution: execution,
    report: JSON.parse(JSON.stringify(report)),
  }
}

function loadAnalysisSemanticResume({value, currentIdentity, candidate, target, sourceContent, chunkOptions}) {
  exactKeys(value, ['schemaVersion', 'compatibility', 'artifactExecution', 'report'], 'Recovery analysis semantic resume')
  if (value.schemaVersion !== 1 || !['strict', 'revalidated'].includes(value.compatibility)) {
    throw new Error('Recovery analysis semantic resume header is invalid')
  }
  const resume = validatePersistedSemanticCheckpoints({
    value: {schemaVersion: 1, artifactExecution: value.artifactExecution, report: value.report},
    artifactIdentity: value.artifactExecution,
    currentIdentity,
    candidate,
    target,
    sourceContent,
    chunkOptions,
  })
  if (resume.compatibility !== value.compatibility) throw new Error('Recovery analysis semantic resume compatibility is invalid')
  return resume.report
}

function semanticCheckpointBytes(value) {
  return value?.report?.entries?.reduce((total, entry) => total + Buffer.byteLength(entry?.translation || ''), 0) || 0
}

module.exports = {
  MAX_SEMANTIC_CHECKPOINT_FILE_BYTES,
  MAX_SEMANTIC_CHECKPOINTS_PER_FILE,
  filterUsableSemanticCheckpoints,
  loadAnalysisSemanticResume,
  loadSemanticCheckpoints,
  persistSemanticCheckpoints,
  semanticCheckpointBytes,
  serializeSemanticCheckpoints,
  validatePersistedSemanticCheckpoints,
}
