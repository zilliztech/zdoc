'use strict'

const crypto = require('node:crypto')

const {chunkDocument} = require('./chunker')
const {loadLocaleContract} = require('./localeContract')
const {createArtifactExecution, validateArtifactExecution} = require('./chunkRecovery')
const {validateProtectedContent} = require('./protectedContent')
const {extractRestSpecDraft, parseRestDocument, validateRestSpecDraft} = require('./restSpecLocalization')
const {collectSemanticUnitsSync, deterministicSemanticIssues, protectSemanticUnits} = require('./semanticUnits')

const MAX_SEMANTIC_CHECKPOINTS_PER_FILE = 512
const MAX_SEMANTIC_CHECKPOINT_FILE_BYTES = 4 * 1024 * 1024
const MAX_REST_SPEC_DRAFT_ENTRIES = 8192

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

function isRestSourcePath(sourcePath) {
  return sourcePath.startsWith('content/en/reference/api/restful/restful/') ||
    sourcePath.startsWith('reference/api/restful/restful/')
}

function validateRestSpecDraftShape(draft) {
  exactKeys(draft, ['schemaVersion', 'entries'], 'REST recovery draft')
  if (draft.schemaVersion !== 1 || !Array.isArray(draft.entries) ||
      draft.entries.length > MAX_REST_SPEC_DRAFT_ENTRIES) {
    throw new Error('REST recovery draft schema is invalid')
  }
  const ids = new Set()
  let totalBytes = 0
  for (const entry of draft.entries) {
    exactKeys(entry, ['id', 'translation'], 'REST recovery draft entry')
    if (typeof entry.id !== 'string' || !entry.id || entry.id.length > 2000 ||
        typeof entry.translation !== 'string' || ids.has(entry.id)) {
      throw new Error('REST recovery draft entry is invalid')
    }
    ids.add(entry.id)
    totalBytes += Buffer.byteLength(entry.translation)
    if (totalBytes > MAX_SEMANTIC_CHECKPOINT_FILE_BYTES) throw new Error('REST recovery draft is oversized')
  }
  return totalBytes
}

function loadSemanticCheckpoints(report, item) {
  if (!report) return new Map()
  const identity = semanticCheckpointIdentity(item)
  const expectedKeys = [
    'schemaVersion', 'sourcePath', 'targetPath', 'sourceHash', 'target', 'locale', 'contractId', 'entries',
    ...(Object.hasOwn(report, 'restSpecDraft') ? ['restSpecDraft'] : []),
  ]
  if (!identity) throw new Error('Semantic checkpoint report identity or schema is invalid')
  exactKeys(report, expectedKeys, 'Semantic checkpoint report')
  if (Object.hasOwn(report, 'restSpecDraft') && !isRestSourcePath(item.sourcePath)) {
    throw new Error('REST recovery draft is only valid for REST source documents')
  }
  if (report.schemaVersion !== 1 || Object.entries(identity).some(([key, value]) => report[key] !== value) ||
      !Array.isArray(report.entries) || report.entries.length < 1 || report.entries.length > MAX_SEMANTIC_CHECKPOINTS_PER_FILE) {
    throw new Error('Semantic checkpoint report identity or schema is invalid')
  }
  const checkpoints = new Map()
  let totalBytes = report.restSpecDraft ? validateRestSpecDraftShape(report.restSpecDraft) : 0
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

function serializeRecoverySemanticCheckpoints(checkpoints, item, restSpecDraft = null) {
  const report = serializeSemanticCheckpoints(checkpoints, item)
  if (!report || !restSpecDraft) return report
  const completeReport = {...report, restSpecDraft: JSON.parse(JSON.stringify(restSpecDraft))}
  try {
    loadSemanticCheckpoints(completeReport, item)
  } catch (error) {
    if (/oversized/i.test(String(error?.message || error))) return null
    throw error
  }
  return completeReport
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
  const restDocument = isRestSourcePath(sourcePath) ? parseRestDocument(sourceContent) : null
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

function semanticCheckpointsFromCompleteTranslation({sourceContent, targetContent, item, chunkOptions}) {
  const {localeContract, sourceUnits} = collectProtectedSourceUnits(sourceContent, item.sourcePath, item.target, chunkOptions)
  const sourceRest = isRestSourcePath(item.sourcePath) ? parseRestDocument(sourceContent) : null
  const targetRest = sourceRest ? parseRestDocument(targetContent) : null
  if (sourceRest && !targetRest) throw new Error('Complete recovery target REST structure is invalid')
  const targetUnits = collectSemanticUnitsSync(targetRest?.prefix || targetContent, {idPrefix: 'document'})
  if (sourceUnits.length !== targetUnits.length) throw new Error('Complete recovery semantic unit count does not match the source')
  const checkpoints = new Map()
  for (let index = 0; index < sourceUnits.length; index += 1) {
    const sourceUnit = sourceUnits[index]
    const targetUnit = targetUnits[index]
    if (sourceUnit.kind !== targetUnit.kind) throw new Error(`Complete recovery semantic unit kind mismatch at position ${index + 1}`)
    checkpoints.set(sourceUnit.id, {
      id: sourceUnit.id,
      sourceHash: crypto.createHash('sha256').update(sourceUnit.source).digest('hex'),
      translation: targetUnit.source,
    })
  }
  const usable = filterUsableSemanticCheckpoints(checkpoints, sourceUnits, localeContract)
  if (usable.size !== sourceUnits.length) throw new Error('Complete recovery target does not satisfy current semantic checkpoint validation')
  const report = serializeSemanticCheckpoints(usable, item)
  if (!report || report.entries.length !== sourceUnits.length) throw new Error('Complete recovery target exceeds semantic checkpoint retention bounds')
  if (!sourceRest) return report
  const restSpecDraft = extractRestSpecDraft({
    sourceSpecs: sourceRest.sourceSpecs,
    localizedSpecs: targetRest.sourceSpecs,
    target: item.target,
    locale: item.locale,
    sourcePath: item.sourcePath,
  })
  const completeReport = {...report, restSpecDraft}
  loadSemanticCheckpoints(completeReport, item)
  return completeReport
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
    if (report.restSpecDraft) {
      const sourceRest = isRestSourcePath(candidate.sourcePath) ? parseRestDocument(sourceContent) : null
      if (!sourceRest) throw new Error('Retained REST recovery draft does not belong to a REST source document')
      validateRestSpecDraft({
        sourceSpecs: sourceRest.sourceSpecs,
        draft: report.restSpecDraft,
        target,
        locale: currentIdentity.locale,
        sourcePath: candidate.sourcePath,
      })
    }
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
  const report = value?.report
  if (!report) return 0
  const semanticBytes = report.entries?.reduce((total, entry) => total + Buffer.byteLength(entry?.translation || ''), 0) || 0
  const restSpecBytes = report.restSpecDraft?.entries?.reduce((total, entry) => total + Buffer.byteLength(entry?.translation || ''), 0) || 0
  return semanticBytes + restSpecBytes
}

module.exports = {
  MAX_SEMANTIC_CHECKPOINT_FILE_BYTES,
  MAX_SEMANTIC_CHECKPOINTS_PER_FILE,
  filterUsableSemanticCheckpoints,
  loadAnalysisSemanticResume,
  loadSemanticCheckpoints,
  persistSemanticCheckpoints,
  semanticCheckpointsFromCompleteTranslation,
  semanticCheckpointBytes,
  serializeRecoverySemanticCheckpoints,
  serializeSemanticCheckpoints,
  validatePersistedSemanticCheckpoints,
}
