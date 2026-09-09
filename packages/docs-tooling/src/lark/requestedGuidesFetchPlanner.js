'use strict'

const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')

const {
  canonicalRecordsFrom,
  extractContentLinks,
} = require('./canonicalLinkAuditor')
const {
  createGuidesNavigationState,
  createSourceSnapshot,
  validateCandidateSnapshot,
} = require('./sourceSnapshot')
const { hashSnapshot, validateSourceCompleteness } = require('./sourceCompleteness')
const { guidesCanonicalIsPublishable } = require('./guidesBaseRecordSemantics')
const {
  addReason,
  buildReferenceGraphs,
  canonicalTokenSet,
  compareRecord,
  expandReferences,
  guidesTableOwnership,
  snapshotRecordsById,
  snapshotRecordsByToken,
} = require('./incrementalFetchPlanner')

const REQUESTED_PLAN_SCHEMA_VERSION = 1
const REQUESTED_LIMITS = Object.freeze({
  maxRequestedTokens: 50,
  maxAffectedTables: 20,
})

const REQUESTED_ERROR_CODES = Object.freeze([
  'INVALID_REQUEST_SELECTOR',
  'REQUEST_NOT_CANONICAL',
  'REQUEST_NOT_PUBLISHABLE',
  'REQUEST_SITE_MISMATCH',
  'REQUESTED_BASELINE_UNTRUSTED',
  'REQUESTED_SCOPE_TOO_LARGE',
  'REQUESTED_SCOPE_CONFLICT',
  'SOURCE_REVISION_UNTRUSTED',
  'TABLE_SOURCE_INCOMPLETE',
  'REQUESTED_STATE_MERGE_INVALID',
  'CHECKPOINT_SCOPE_VIOLATION',
  'TARGET_DRIFT',
  'REMOTE_STATE_UNKNOWN',
])

class RequestedFetchError extends Error {
  constructor(code, message, details = {}) {
    super(message)
    this.name = 'RequestedFetchError'
    this.code = code
    this.details = details
  }

  toJSON() {
    return { code: this.code, message: this.message, details: this.details }
  }
}

function throwRequestedResolutionErrors(errors) {
  if (!Array.isArray(errors) || errors.length === 0) return
  const precedence = [
    'INVALID_REQUEST_SELECTOR',
    'REQUEST_SITE_MISMATCH',
    'REQUEST_NOT_PUBLISHABLE',
    'REQUEST_NOT_CANONICAL',
  ]
  const sorted = [...errors].sort((left, right) => {
    const leftIndex = precedence.indexOf(left.code)
    const rightIndex = precedence.indexOf(right.code)
    return (leftIndex === -1 ? precedence.length : leftIndex) - (rightIndex === -1 ? precedence.length : rightIndex) ||
      String(left.selector?.raw || '').localeCompare(String(right.selector?.raw || ''))
  })
  throw new RequestedFetchError(sorted[0].code, sorted.map(error => `${error.code}: ${error.message}`).join('; '), {
    errors: sorted.map(error => ({ code: error.code, message: error.message, selector: error.selector || null })),
  })
}

function assertTrustedRequestedBaseline(previousSnapshot) {
  const problems = []
  if (!previousSnapshot || typeof previousSnapshot !== 'object') {
    throw new RequestedFetchError('REQUESTED_BASELINE_UNTRUSTED', 'Requested planning requires a trusted baseline Guides snapshot; none was found.')
  }
  if (Number(previousSnapshot.schema_version || 1) < 3) problems.push('snapshot schema v3 required')
  if (!Array.isArray(previousSnapshot.records) || previousSnapshot.records.length === 0) problems.push('snapshot records missing')
  if (!Array.isArray(previousSnapshot.navigation_records)) problems.push('snapshot navigation records missing')
  if (!previousSnapshot.table_digests || typeof previousSnapshot.table_digests !== 'object' || Array.isArray(previousSnapshot.table_digests)) problems.push('snapshot table digests missing')
  if (problems.length > 0) {
    throw new RequestedFetchError('REQUESTED_BASELINE_UNTRUSTED', `Requested baseline snapshot is untrusted: ${problems.join('; ')}.`, { problems })
  }
}

function resolveRequestedSelectors({ selectors, records, previousSnapshot, site }) {
  const publishableByToken = new Map(canonicalRecordsFrom(records, { guidesPublishableOnly: true }).map(record => [record.doc_token, record]))
  const canonicalByToken = new Map(canonicalRecordsFrom(records, { guidesPublishableOnly: false }).map(record => [record.doc_token, record]))
  const baselineByToken = new Map((previousSnapshot?.records || []).map(record => [record.doc_token, record]))
  const baselineAliasByToken = new Map()
  for (const record of previousSnapshot?.records || []) {
    for (const alias of [record.node_token, record.origin_node_token, record.obj_token].filter(Boolean)) {
      if (!baselineAliasByToken.has(alias)) baselineAliasByToken.set(alias, record)
    }
  }

  const entries = []
  const errors = []
  const requestedTokens = new Set()
  for (const selector of Array.isArray(selectors) ? selectors : []) {
    const entry = {
      raw: selector.raw ?? selector.value,
      kind: selector.kind,
      selector: selector.value,
      site,
      status: 'resolved',
      token: null,
      title: null,
      table_id: null,
    }
    try {
      if (selector.kind !== 'doc_token' && selector.kind !== 'lark_url') {
        throw new RequestedFetchError('INVALID_REQUEST_SELECTOR', `Selector kind ${selector.kind} is not supported; use a Lark document URL or canonical token.`, { selector: entry })
      }
      const token = selector.token || (selector.kind === 'doc_token' ? selector.value : null)
      if (!token || !/^[A-Za-z0-9]+$/.test(token)) {
        throw new RequestedFetchError('INVALID_REQUEST_SELECTOR', `Selector does not contain a supported Lark token: ${selector.raw}`, { selector: entry })
      }
      const record = publishableByToken.get(token)
      if (!record) {
        const currentCanonical = canonicalByToken.get(token)
        if (currentCanonical) {
          throw new RequestedFetchError('REQUEST_NOT_PUBLISHABLE', `Canonical record ${currentCanonical.title || token} exists but is not publishable in the current Base.`, { selector: entry, token })
        }
        const baseline = baselineByToken.get(token) || baselineAliasByToken.get(token)
        if (baseline) {
          throw new RequestedFetchError('REQUEST_NOT_CANONICAL', `Record ${baseline.title || token} resolved only in the trusted baseline; it was removed or unpublished since the baseline.`, { selector: entry, token })
        }
        throw new RequestedFetchError('REQUEST_NOT_CANONICAL', `Selector did not resolve to a canonical Guides record for site ${site}: ${selector.raw}`, { selector: entry, token })
      }
      entry.token = record.doc_token
      entry.title = record.title
      entry.table_id = record.table_id
      if (requestedTokens.has(record.doc_token)) {
        entry.status = 'duplicate'
      } else {
        requestedTokens.add(record.doc_token)
      }
    } catch (error) {
      const typed = error instanceof RequestedFetchError ? error : new RequestedFetchError('INVALID_REQUEST_SELECTOR', error.message, { selector: entry })
      entry.status = 'failed'
      entry.code = typed.code
      entry.message = typed.message
      errors.push({ code: typed.code, message: typed.message, selector: entry })
    }
    entries.push(entry)
  }
  return { entries, errors, requestedTokens: [...requestedTokens].sort() }
}

function buildRequestedReferenceGraphs({ sourceByToken, previousSnapshot, canonicalTokens, refreshedTokens }) {
  const { outgoing, incoming } = buildReferenceGraphs({ sourceByToken, canonicalTokens })
  for (const record of previousSnapshot?.records || []) {
    const sourceToken = record.doc_token
    if (!sourceToken || !canonicalTokens.has(sourceToken)) continue
    if (outgoing.has(sourceToken)) continue
    if (refreshedTokens?.has(sourceToken)) continue
    const refs = (record.outgoing_tokens || []).filter(token => canonicalTokens.has(token))
    if (refs.length === 0) continue
    outgoing.set(sourceToken, new Set(refs))
    for (const targetToken of refs) {
      if (!incoming.has(targetToken)) incoming.set(targetToken, new Set())
      incoming.get(targetToken).add(sourceToken)
    }
  }
  return { outgoing, incoming }
}

function expandRequestedClosure({ requestedTokens, sourceByToken, previousSnapshot, canonicalTokens, refreshedTokens, maxReferenceDepth = 1, reasonsByToken = {} }) {
  const requestedSet = new Set(requestedTokens)
  const { outgoing, incoming } = buildRequestedReferenceGraphs({ sourceByToken, previousSnapshot, canonicalTokens, refreshedTokens })
  const closure = expandReferences({
    changedTokens: requestedTokens,
    outgoing,
    incoming,
    maxReferenceDepth: Number(maxReferenceDepth || 1),
    reasonsByToken,
  })
  const linkedTokens = closure.filter(token => !requestedSet.has(token))
  return { linkedTokens, outgoing, incoming }
}

function sortedSetDifference(left, right) {
  return [...left].filter(token => !right.has(token)).sort()
}

function deriveRequestedTableScope({
  requestedTokens,
  linkedTokens,
  canonicalRecords,
  guidesNavigation,
  previousSnapshot,
  currentOwnership,
  previousOwnership,
  limits = REQUESTED_LIMITS,
}) {
  const currentMembersByTable = new Map()
  for (const record of canonicalRecords) {
    if (!record.table_id) continue
    if (!currentMembersByTable.has(record.table_id)) currentMembersByTable.set(record.table_id, [])
    currentMembersByTable.get(record.table_id).push(record)
  }
  const previousMembersByTable = new Map()
  for (const record of previousSnapshot?.records || []) {
    if (!record.table_id) continue
    if (!previousMembersByTable.has(record.table_id)) previousMembersByTable.set(record.table_id, [])
    previousMembersByTable.get(record.table_id).push(record)
  }
  const currentTableByToken = new Map(canonicalRecords.map(record => [record.doc_token, record.table_id]))
  const previousTableByToken = new Map((previousSnapshot?.records || []).map(record => [record.doc_token, record.table_id]))
  const currentTableDigests = guidesNavigation?.tableDigests || {}
  const previousTableDigests = previousSnapshot?.table_digests || {}
  const requestedSet = new Set(requestedTokens)
  const linkedSet = new Set(linkedTokens)

  const affectedTables = new Set()
  const seedReasonsByTable = new Map()
  const seedTable = (token, reason) => {
    for (const tableId of [currentTableByToken.get(token), previousTableByToken.get(token)]) {
      if (!tableId) continue
      affectedTables.add(tableId)
      if (!seedReasonsByTable.has(tableId)) seedReasonsByTable.set(tableId, new Set())
      seedReasonsByTable.get(tableId).add(reason)
    }
  }
  for (const token of requestedTokens) seedTable(token, 'requested document')
  for (const token of linkedTokens) seedTable(token, 'linked document')

  const rebuildsByTable = new Map()
  const tableRefreshTokens = new Set()
  const removedTables = new Set()

  const sameTargets = (left, right) => left.length === right.length && left.every((value, index) => value === right[index])

  let grew = true
  while (grew) {
    grew = false
    for (const tableId of [...affectedTables].sort()) {
      const currentMembers = currentMembersByTable.get(tableId) || []
      const previousMembers = previousMembersByTable.get(tableId) || []
      const currentMemberTokens = new Set(currentMembers.map(record => record.doc_token))
      const previousMemberTokens = new Set(previousMembers.map(record => record.doc_token))
      const currentTargets = (currentOwnership.targets[tableId] || []).slice().sort()
      const previousTargets = (previousOwnership.targets[tableId] || []).slice().sort()
      const currentDigest = currentTableDigests[tableId] || null
      const previousDigest = previousTableDigests[tableId] || null

      if (currentMembers.length === 0 && previousMembers.length > 0) {
        removedTables.add(tableId)
        rebuildsByTable.set(tableId, {
          table_id: tableId,
          scope: 'full-table',
          reasons: ['table removed'],
          current_targets: [],
          previous_targets: previousTargets,
          cleanup: true,
        })
        for (const token of sortedSetDifference(previousMemberTokens, currentMemberTokens)) {
          const movedTo = currentTableByToken.get(token)
          if (movedTo && !affectedTables.has(movedTo)) {
            affectedTables.add(movedTo)
            grew = true
          }
        }
        continue
      }

      const reasons = []
      if (currentDigest !== previousDigest) reasons.push('outline changed')
      if (currentMemberTokens.size !== previousMemberTokens.size ||
        [...currentMemberTokens].some(token => !previousMemberTokens.has(token))) reasons.push('table membership changed')
      if (!sameTargets(currentTargets, previousTargets)) reasons.push('publish targets changed')

      if (reasons.length > 0) {
        for (const member of currentMembers) tableRefreshTokens.add(member.doc_token)
        rebuildsByTable.set(tableId, {
          table_id: tableId,
          scope: 'full-table',
          reasons,
          current_targets: currentTargets,
          previous_targets: previousTargets,
          cleanup: false,
        })
        for (const token of sortedSetDifference(previousMemberTokens, currentMemberTokens)) {
          const movedTo = currentTableByToken.get(token)
          if (movedTo && !affectedTables.has(movedTo)) {
            affectedTables.add(movedTo)
            grew = true
          }
        }
        for (const token of sortedSetDifference(currentMemberTokens, previousMemberTokens)) {
          const movedFrom = previousTableByToken.get(token)
          if (movedFrom && !affectedTables.has(movedFrom)) {
            affectedTables.add(movedFrom)
            grew = true
          }
        }
        continue
      }

      if (!rebuildsByTable.has(tableId)) {
        const seedReasons = [...(seedReasonsByTable.get(tableId) || [])].sort()
        rebuildsByTable.set(tableId, {
          table_id: tableId,
          scope: 'full-table',
          reasons: seedReasons.length > 0 ? seedReasons : ['reference closure'],
          current_targets: currentTargets,
          previous_targets: previousTargets,
          cleanup: false,
        })
      }
    }
  }

  if (affectedTables.size > Number(limits.maxAffectedTables)) {
    throw new RequestedFetchError(
      'REQUESTED_SCOPE_TOO_LARGE',
      `Requested closure affects ${affectedTables.size} tables which exceeds the limit of ${limits.maxAffectedTables}; run the ordinary Guides Fetch instead.`,
      { affected_tables: [...affectedTables].sort(), limit: limits.maxAffectedTables },
    )
  }

  return {
    affectedTables: [...affectedTables].sort(),
    rebuilds: [...rebuildsByTable.values()].sort((left, right) => left.table_id.localeCompare(right.table_id)),
    removedTables,
    tableRefreshTokens,
    currentMembersByTable,
  }
}

function detectRequestedScopeConflicts({
  changedRecords,
  removedRecords,
  reasonsByToken,
  requestedTokens,
  linkedTokens,
  affectedTables,
  removedTables,
  tableRefreshTokens,
  currentMembersByTable,
  currentTableDigests,
  previousTableDigests,
  sourceByToken,
  previousSnapshot,
  canonicalTokens,
  refreshedTokens,
}) {
  const allowedTokens = new Set([...requestedTokens, ...linkedTokens, ...tableRefreshTokens])
  for (const tableId of affectedTables) {
    if (removedTables.has(tableId)) continue
    for (const member of currentMembersByTable.get(tableId) || []) allowedTokens.add(member.doc_token)
  }

  const conflicts = []
  const warnings = []
  const previousCanonicalAliases = new Set()
  for (const record of previousSnapshot?.records || []) {
    previousCanonicalAliases.add(record.doc_token)
    for (const alias of [record.node_token, record.origin_node_token, record.obj_token].filter(Boolean)) previousCanonicalAliases.add(alias)
  }

  for (const record of changedRecords) {
    if (allowedTokens.has(record.doc_token)) continue
    conflicts.push({
      kind: 'record_changed_outside_scope',
      token: record.doc_token,
      table_id: record.table_id || null,
      reasons: [...record.reasons],
    })
  }
  for (const record of removedRecords) {
    if (record.table_id && affectedTables.includes(record.table_id)) continue
    conflicts.push({
      kind: 'record_removed_outside_scope',
      token: record.doc_token || null,
      table_id: record.table_id || null,
      reasons: ['record removed'],
    })
  }
  for (const tableId of [...new Set([...Object.keys(currentTableDigests || {}), ...Object.keys(previousTableDigests || {})])].sort()) {
    if (affectedTables.includes(tableId)) continue
    if ((currentTableDigests || {})[tableId] !== previousTableDigests[tableId]) {
      conflicts.push({
        kind: 'table_outline_outside_scope',
        token: null,
        table_id: tableId,
        reasons: ['outline changed'],
      })
    }
  }
  for (const record of changedRecords) {
    if (!(record.reasons || []).includes('wiki node metadata fetch failed')) continue
    if (!allowedTokens.has(record.doc_token)) continue
    throw new RequestedFetchError(
      'SOURCE_REVISION_UNTRUSTED',
      `Cannot prove a trusted wiki revision for closure record ${record.doc_token}; wiki node metadata fetch failed.`,
      { token: record.doc_token, table_id: record.table_id || null },
    )
  }
  for (const token of refreshedTokens || []) {
    const source = sourceByToken.get(token)
    if (!source) continue
    for (const link of extractContentLinks(source)) {
      if (canonicalTokens.has(link.token)) continue
      if (!previousCanonicalAliases.has(link.token)) {
        if (!warnings.includes(`Unresolved non-canonical link target ${link.token} from ${token}.`)) {
          warnings.push(`Unresolved non-canonical link target ${link.token} from ${token}.`)
        }
        continue
      }
      conflicts.push({
        kind: 'unresolved_canonical_link',
        token,
        table_id: null,
        reasons: [`link target ${link.token} was canonical at the baseline but is unresolved now`],
      })
    }
  }
  for (const [token, reasons] of Object.entries(reasonsByToken || {})) {
    if (!Array.isArray(reasons) || !reasons.includes('wiki node metadata fetch failed')) continue
    if (allowedTokens.has(token)) continue
    if (conflicts.some(conflict => conflict.kind === 'record_changed_outside_scope' && conflict.token === token)) continue
    conflicts.push({
      kind: 'wiki_metadata_unverifiable',
      token,
      table_id: null,
      reasons: ['wiki node metadata fetch failed'],
    })
  }

  conflicts.sort((left, right) =>
    left.kind.localeCompare(right.kind) ||
    String(left.token || '').localeCompare(String(right.token || '')) ||
    String(left.table_id || '').localeCompare(String(right.table_id || '')))
  return { conflicts, warnings }
}

function stablePlanValue(value) {
  if (Array.isArray(value)) return value.map(stablePlanValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, stablePlanValue(value[key])]))
  }
  return value
}

function requestedPlanIdentityHash(plan) {
  const projection = { ...plan }
  delete projection.generated_at
  delete projection.observation
  delete projection.plan_sha256
  return crypto.createHash('sha256').update(JSON.stringify(stablePlanValue(projection))).digest('hex')
}

const REQUESTED_STATE_MERGE_SCHEMA_VERSION = 1

function sortedUniqueStrings(value, label) {
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string' || !item) || new Set(value).size !== value.length) {
    throw new RequestedFetchError('REQUESTED_STATE_MERGE_INVALID', `${label} must be a sorted unique string array.`)
  }
  const sorted = [...value].sort()
  if (JSON.stringify(sorted) !== JSON.stringify(value)) {
    throw new RequestedFetchError('REQUESTED_STATE_MERGE_INVALID', `${label} must be sorted lexicographically.`)
  }
  return sorted
}

function validateRequestedPlanForArtifact(plan, { site = null, baselineSnapshot = null, expectedBaselineSha = null } = {}) {
  if (!plan || typeof plan !== 'object' || Array.isArray(plan)) {
    throw new RequestedFetchError('REQUESTED_STATE_MERGE_INVALID', 'Requested artifact production requires a plan object.')
  }
  const problems = []
  if (plan.schema_version !== REQUESTED_PLAN_SCHEMA_VERSION) problems.push(`schema_version must be ${REQUESTED_PLAN_SCHEMA_VERSION}`)
  if (plan.manual !== 'guides') problems.push('manual must be guides')
  if (site && plan.site !== site) problems.push(`site must be ${site}`)
  if (plan.mode !== 'incremental') problems.push('mode must remain incremental for requested plans')
  if (plan.selection_mode !== 'requested') problems.push('selection_mode must be requested')
  if (problems.length > 0) {
    throw new RequestedFetchError('REQUESTED_STATE_MERGE_INVALID', `Requested plan is not consumable: ${problems.join('; ')}.`, { problems })
  }
  sortedUniqueStrings(plan.requested_tokens || [], 'requested_tokens')
  sortedUniqueStrings(plan.linked_tokens || [], 'linked_tokens')
  sortedUniqueStrings(plan.table_refresh_tokens || [], 'table_refresh_tokens')
  sortedUniqueStrings(plan.expanded_tokens || [], 'expanded_tokens')
  const affectedTables = sortedUniqueStrings(plan.affected_tables || [], 'affected_tables')
  if (!Array.isArray(plan.table_rebuilds) || plan.table_rebuilds.length === 0) {
    throw new RequestedFetchError('REQUESTED_STATE_MERGE_INVALID', 'Requested plan must declare at least one table rebuild.')
  }
  const rebuildIds = plan.table_rebuilds.map(rebuild => rebuild.table_id)
  if (JSON.stringify([...new Set(rebuildIds)].sort()) !== JSON.stringify(affectedTables)) {
    throw new RequestedFetchError('REQUESTED_STATE_MERGE_INVALID', 'Requested table_rebuilds must cover exactly the affected_tables closure.')
  }
  for (const rebuild of plan.table_rebuilds) {
    if (rebuild.scope !== 'full-table') throw new RequestedFetchError('REQUESTED_STATE_MERGE_INVALID', `Rebuild scope must be full-table: ${rebuild.table_id}`)
    if (!Array.isArray(rebuild.reasons) || rebuild.reasons.length === 0) throw new RequestedFetchError('REQUESTED_STATE_MERGE_INVALID', `Rebuild requires reasons: ${rebuild.table_id}`)
    for (const key of ['current_targets', 'previous_targets']) {
      sortedUniqueStrings(rebuild[key] || [], `Rebuild ${rebuild.table_id} ${key}`)
    }
    if (typeof rebuild.cleanup !== 'boolean') throw new RequestedFetchError('REQUESTED_STATE_MERGE_INVALID', `Rebuild cleanup must be boolean: ${rebuild.table_id}`)
  }
  if (Array.isArray(plan.scope_conflicts) && plan.scope_conflicts.length > 0) {
    throw new RequestedFetchError('REQUESTED_SCOPE_CONFLICT', 'Requested artifact production requires a conflict-free plan.', {
      conflicts: plan.scope_conflicts,
    })
  }
  if (requestedPlanIdentityHash(plan) !== plan.plan_sha256) {
    throw new RequestedFetchError('REQUESTED_STATE_MERGE_INVALID', 'Requested plan hash does not match its contents; refusing to consume a mutated plan.')
  }
  if (baselineSnapshot) {
    const baselineHash = hashSnapshot(baselineSnapshot)
    if (plan.snapshot_basis?.snapshot_sha256 !== baselineHash) {
      throw new RequestedFetchError('REQUESTED_BASELINE_UNTRUSTED', 'Requested plan was not bound to the restored baseline snapshot.', {
        plan_snapshot_sha256: plan.snapshot_basis?.snapshot_sha256 || null,
        restored_snapshot_sha256: baselineHash,
      })
    }
  }
  if (expectedBaselineSha && plan.snapshot_basis?.commit_sha !== expectedBaselineSha) {
    throw new RequestedFetchError('REQUESTED_BASELINE_UNTRUSTED', 'Requested plan baseline commit does not match the resolved baseline SHA.', {
      plan_commit_sha: plan.snapshot_basis?.commit_sha || null,
      expected_commit_sha: expectedBaselineSha,
    })
  }
  return {
    requestedTokens: plan.requested_tokens,
    affectedTables,
    expandedTokens: plan.expanded_tokens,
  }
}

function compareRequestedPlans({ consumed, fresh }) {
  if (!Array.isArray(fresh.scope_conflicts) || fresh.scope_conflicts.length > 0) {
    throw new RequestedFetchError('REQUESTED_SCOPE_CONFLICT', 'The current Base state changed outside the requested closure since planning.', {
      conflicts: fresh.scope_conflicts,
    })
  }
  if (JSON.stringify(fresh.requested_tokens) !== JSON.stringify(consumed.requested_tokens)) {
    throw new RequestedFetchError('REQUESTED_STATE_MERGE_INVALID', 'Fresh planning produced different requested tokens; refusing to reinterpret selectors.')
  }
  if (JSON.stringify(fresh.affected_tables) !== JSON.stringify(consumed.affected_tables)) {
    throw new RequestedFetchError('REQUESTED_SCOPE_CONFLICT', 'The requested table closure drifted since planning.', {
      plan_affected_tables: consumed.affected_tables,
      fresh_affected_tables: fresh.affected_tables,
    })
  }
  if (fresh.snapshot_basis?.snapshot_sha256 !== consumed.snapshot_basis?.snapshot_sha256) {
    throw new RequestedFetchError('REQUESTED_BASELINE_UNTRUSTED', 'The baseline snapshot changed between planning and artifact production.', {
      plan_snapshot_sha256: consumed.snapshot_basis?.snapshot_sha256 || null,
      fresh_snapshot_sha256: fresh.snapshot_basis?.snapshot_sha256 || null,
    })
  }
  return { fresh }
}

function requestedRecordProjection(record) {
  return {
    record_id: record.record_id || null,
    table_id: record.table_id || null,
    placement_type: record.placement_type || null,
    title: record.title || null,
    slug: record.slug || null,
    doc_token: record.doc_token || null,
    source_file: record.source_file || null,
    source_hash: record.source_hash || null,
    publish_targets: [...(record.publish_targets || [])].sort(),
    outgoing_tokens: [...(record.outgoing_tokens || [])].sort(),
    node_token: record.node_token || null,
    origin_node_token: record.origin_node_token || null,
    obj_token: record.obj_token || null,
    obj_type: record.obj_type || null,
    obj_edit_time: record.obj_edit_time || null,
    revision_id: record.revision_id || null,
  }
}

function requestedStateMergeReceiptHash(receipt) {
  const projection = { ...receipt }
  delete projection.generated_at
  delete projection.receipt_sha256
  return crypto.createHash('sha256').update(JSON.stringify(stablePlanValue(projection))).digest('hex')
}

function mergeRequestedSnapshot({
  site,
  buildEnv,
  docSourceDir,
  rootToken,
  baseAppToken = null,
  records,
  nodeMetadataByToken = new Map(),
  previousSnapshot,
  plan,
  baselineCommitSha = null,
  generatedAt = new Date().toISOString(),
}) {
  const allowedTokens = new Set(plan.expanded_tokens || [])
  for (const record of canonicalRecordsFrom(records, { guidesPublishableOnly: true })) {
    if ((plan.affected_tables || []).includes(record.table_id)) allowedTokens.add(record.doc_token)
  }

  const candidate = createSourceSnapshot({
    manualName: 'guides',
    targetsBuilt: [],
    buildEnv,
    sourceBranch: null,
    publishUrl: null,
    linkCheckRemote: 'https://docs.zilliz.com',
    docSourceDir,
    baseAppToken,
    records,
    nodeMetadataByToken,
  })
  validateCandidateSnapshot(candidate, { manual: 'guides', buildEnv, sourceDir: docSourceDir, baseAppToken })

  const baselineById = new Map((previousSnapshot.records || []).map(record => [record.record_id, record]))
  const candidateIds = new Set(candidate.records.map(record => record.record_id))
  const inherited = []
  const replaced = []
  const added = []
  const violations = []
  for (const record of candidate.records) {
    const previous = baselineById.get(record.record_id)
    if (!previous) {
      added.push(record.doc_token)
      if (!allowedTokens.has(record.doc_token)) {
        violations.push({ kind: 'record_added_outside_closure', token: record.doc_token, table_id: record.table_id })
      }
      continue
    }
    const currentProjection = requestedRecordProjection(record)
    const previousProjection = requestedRecordProjection(previous)
    if (JSON.stringify(currentProjection) === JSON.stringify(previousProjection)) {
      inherited.push(record.doc_token)
    } else {
      replaced.push(record.doc_token)
      if (!allowedTokens.has(record.doc_token)) {
        violations.push({ kind: 'record_replaced_outside_closure', token: record.doc_token, table_id: record.table_id })
      }
    }
  }
  const removed = []
  for (const previous of previousSnapshot.records || []) {
    if (candidateIds.has(previous.record_id)) continue
    removed.push(previous.doc_token || previous.record_id)
    if (!(plan.affected_tables || []).includes(previous.table_id)) {
      violations.push({ kind: 'record_removed_outside_closure', token: previous.doc_token || null, table_id: previous.table_id })
    }
  }
  if (violations.length > 0) {
    violations.sort((left, right) => left.kind.localeCompare(right.kind) || String(left.token).localeCompare(String(right.token)))
    throw new RequestedFetchError('REQUESTED_STATE_MERGE_INVALID', 'Requested state merge produced changes outside the declared closure.', { violations })
  }

  const completeness = validateSourceCompleteness({
    manual: 'guides',
    buildEnv,
    rootToken,
    sourceDir: docSourceDir,
    snapshot: candidate,
  })
  if (!completeness.complete) {
    throw new RequestedFetchError('TABLE_SOURCE_INCOMPLETE', 'The merged table source graph is incomplete; refusing to assemble a partial table.', {
      valid: completeness.validCanonicalSources,
      expected: completeness.expectedCanonicalSources,
      missing: completeness.missingFiles.slice(0, 10),
      root_error: completeness.rootError,
    })
  }

  const receipt = {
    schema_version: REQUESTED_STATE_MERGE_SCHEMA_VERSION,
    generated_at: generatedAt,
    site,
    manual: 'guides',
    build_env: buildEnv,
    plan_sha256: plan.plan_sha256,
    baseline: {
      commit_sha: baselineCommitSha || plan.snapshot_basis?.commit_sha || null,
      snapshot_sha256: hashSnapshot(previousSnapshot),
      records: (previousSnapshot.records || []).length,
    },
    candidate: {
      snapshot_sha256: hashSnapshot(candidate),
      records: candidate.records.length,
    },
    closure: {
      requested_tokens: (plan.requested_tokens || []).length,
      linked_tokens: (plan.linked_tokens || []).length,
      expanded_tokens: (plan.expanded_tokens || []).length,
      affected_tables: [...(plan.affected_tables || [])],
    },
    merge: {
      inherited_records: inherited.sort().length,
      replaced_records: replaced.sort().length,
      added_records: added.sort().length,
      removed_records: removed.sort().length,
    },
    source_completeness: {
      complete: completeness.complete,
      valid: completeness.validCanonicalSources,
      expected: completeness.expectedCanonicalSources,
    },
    state_promotion: 'none',
  }
  receipt.receipt_sha256 = requestedStateMergeReceiptHash(receipt)
  return { candidate, receipt }
}

function verifyRequestedStateMergeReceipt({ receipt, plan, candidateSnapshot, baselineSnapshot }) {
  const problems = []
  if (!receipt || receipt.schema_version !== REQUESTED_STATE_MERGE_SCHEMA_VERSION) problems.push('receipt schema version must be 1')
  if (receipt?.manual !== 'guides') problems.push('receipt manual must be guides')
  if (receipt?.plan_sha256 !== plan?.plan_sha256) problems.push('receipt plan hash does not match the plan')
  if (receipt?.state_promotion !== 'none') problems.push('requested state promotion must stay none')
  if (receipt && requestedStateMergeReceiptHash(receipt) !== receipt.receipt_sha256) problems.push('receipt hash does not match its contents')
  if (receipt?.baseline?.snapshot_sha256 && baselineSnapshot && receipt.baseline.snapshot_sha256 !== hashSnapshot(baselineSnapshot)) {
    problems.push('receipt baseline hash does not match the restored baseline')
  }
  if (receipt?.candidate?.snapshot_sha256 && candidateSnapshot && receipt.candidate.snapshot_sha256 !== hashSnapshot(candidateSnapshot)) {
    problems.push('receipt candidate hash does not match the merged candidate snapshot')
  }
  if (receipt?.source_completeness?.complete !== true) problems.push('receipt must record a complete source graph')
  if (problems.length > 0) {
    throw new RequestedFetchError('REQUESTED_STATE_MERGE_INVALID', `Requested state-merge receipt failed verification: ${problems.join('; ')}.`, { problems })
  }
  return true
}

function planRequestedGuidesFetch({
  site,
  buildEnv,
  docSourceDir,
  records,
  previousSnapshot,
  currentNodeMetadataByToken,
  requestedTokens,
  selectionEntries = [],
  selectionInputSha256 = null,
  refreshedTokens = [],
  sourceByToken,
  maxReferenceDepth = 1,
  limits = REQUESTED_LIMITS,
  snapshotCommitSha = null,
  sourceCacheIdentity = null,
  observation = null,
  generatedAt = new Date().toISOString(),
}) {
  assertTrustedRequestedBaseline(previousSnapshot)
  if (!Array.isArray(requestedTokens) || requestedTokens.length === 0) {
    throw new RequestedFetchError('INVALID_REQUEST_SELECTOR', 'Requested planning requires at least one resolved selector token.')
  }
  if (requestedTokens.length > Number(limits.maxRequestedTokens)) {
    throw new RequestedFetchError(
      'REQUESTED_SCOPE_TOO_LARGE',
      `Requested token count ${requestedTokens.length} exceeds the limit of ${limits.maxRequestedTokens}; run the ordinary Guides Fetch instead.`,
      { requested_tokens: requestedTokens.length, limit: limits.maxRequestedTokens },
    )
  }

  const canonicalRecords = canonicalRecordsFrom(records, { guidesPublishableOnly: true })
  const guidesNavigation = createGuidesNavigationState(records)
  const currentOwnership = guidesTableOwnership(guidesNavigation?.navigationRecords)
  const previousOwnership = guidesTableOwnership(previousSnapshot.navigation_records)
  if (guidesNavigation.tableDigests && Object.keys(guidesNavigation.tableDigests).length === 0) {
    throw new RequestedFetchError('REQUESTED_BASELINE_UNTRUSTED', 'Current Guides navigation state has no tables; refusing to plan a requested run.')
  }

  const previousById = snapshotRecordsById(previousSnapshot)
  const currentRecordIds = new Set(canonicalRecords.map(record => record.record_id))
  const changedRecords = []
  const removedRecords = []
  const reasonsByToken = {}
  for (const record of canonicalRecords) {
    const reasons = compareRecord(record, previousById.get(record.record_id), sourceByToken, currentNodeMetadataByToken)
    if (reasons.length > 0) {
      changedRecords.push({ ...record, reasons })
      reasons.forEach(reason => addReason(reasonsByToken, record.doc_token, reason))
    }
  }
  for (const previous of previousSnapshot.records || []) {
    if (!currentRecordIds.has(previous.record_id)) {
      removedRecords.push(previous)
      if (previous.doc_token) addReason(reasonsByToken, previous.doc_token, 'record removed')
    }
  }

  const refreshedTokenSet = new Set(refreshedTokens)
  const canonicalTokens = canonicalTokenSet(canonicalRecords, sourceByToken)
  const { linkedTokens } = expandRequestedClosure({
    requestedTokens,
    sourceByToken,
    previousSnapshot,
    canonicalTokens,
    refreshedTokens: refreshedTokenSet,
    maxReferenceDepth,
    reasonsByToken,
  })

  const scope = deriveRequestedTableScope({
    requestedTokens,
    linkedTokens,
    canonicalRecords,
    guidesNavigation,
    previousSnapshot,
    currentOwnership,
    previousOwnership,
    limits,
  })

  const { conflicts, warnings } = detectRequestedScopeConflicts({
    changedRecords,
    removedRecords,
    reasonsByToken,
    requestedTokens,
    linkedTokens,
    affectedTables: scope.affectedTables,
    removedTables: scope.removedTables,
    tableRefreshTokens: scope.tableRefreshTokens,
    currentMembersByTable: scope.currentMembersByTable,
    currentTableDigests: guidesNavigation?.tableDigests || {},
    previousTableDigests: previousSnapshot.table_digests || {},
    sourceByToken,
    previousSnapshot,
    canonicalTokens,
    refreshedTokens: [...requestedTokens, ...linkedTokens],
  })

  const allowedTokens = new Set([...requestedTokens, ...linkedTokens, ...scope.tableRefreshTokens])
  for (const tableId of scope.affectedTables) {
    if (scope.removedTables.has(tableId)) continue
    for (const member of scope.currentMembersByTable.get(tableId) || []) allowedTokens.add(member.doc_token)
  }
  const expandedTokenSet = new Set([...requestedTokens, ...linkedTokens, ...scope.tableRefreshTokens])
  for (const token of changedRecords.map(record => record.doc_token)) {
    if (allowedTokens.has(token)) expandedTokenSet.add(token)
  }

  const plan = {
    schema_version: REQUESTED_PLAN_SCHEMA_VERSION,
    generated_at: generatedAt,
    manual: 'guides',
    site,
    build_env: buildEnv || null,
    mode: 'incremental',
    selection_mode: 'requested',
    source_dir: docSourceDir,
    selection: {
      input_sha256: selectionInputSha256,
      selectors: selectionEntries,
      requested_count: requestedTokens.length,
    },
    requested_tokens: [...new Set(requestedTokens)].sort(),
    linked_tokens: [...new Set(linkedTokens)].sort(),
    automatic_changed_tokens: changedRecords.map(record => record.doc_token).sort(),
    table_refresh_tokens: [...scope.tableRefreshTokens].sort(),
    expanded_tokens: [...expandedTokenSet].sort(),
    affected_tables: scope.affectedTables,
    table_rebuilds: scope.rebuilds,
    current_table_targets: currentOwnership.targets,
    current_table_names: currentOwnership.names,
    previous_table_targets: previousOwnership.targets,
    previous_table_names: previousOwnership.names,
    scope_conflicts: conflicts,
    snapshot_basis: {
      commit_sha: snapshotCommitSha || null,
      snapshot_sha256: hashSnapshot(previousSnapshot),
      snapshot_generated_at: previousSnapshot.generated_at || null,
      records: (previousSnapshot.records || []).length,
      source_cache_identity: sourceCacheIdentity || null,
    },
    observation: observation || null,
    warnings: warnings.sort(),
  }
  plan.plan_sha256 = requestedPlanIdentityHash(plan)
  return plan
}

function renderRequestedFetchPlanMarkdown(plan) {
  const lines = []
  lines.push(`# Guides Requested Fetch Plan (${plan.site})`, '')
  lines.push(`Generated: ${plan.generated_at}`)
  lines.push(`Mode: ${plan.mode}`)
  lines.push(`Selection mode: ${plan.selection_mode}`)
  lines.push(`Build env: ${plan.build_env || '(not specified)'}`)
  lines.push(`Plan SHA-256: \`${plan.plan_sha256}\``)
  if (plan.snapshot_basis?.commit_sha) {
    lines.push(`Baseline commit: ${plan.snapshot_basis.commit_sha}`)
  }
  if (plan.snapshot_basis?.snapshot_sha256) {
    lines.push(`Baseline snapshot SHA-256: \`${plan.snapshot_basis.snapshot_sha256}\``)
  }
  lines.push('', '## Selection', '')
  lines.push(`- Requested selectors: ${plan.selection.selectors.length}`)
  lines.push(`- Resolved requested tokens: ${plan.requested_tokens.length}`)
  for (const entry of plan.selection.selectors) {
    lines.push(`- ${entry.status === 'failed' ? 'FAILED' : entry.status}: ${entry.raw} (${entry.kind})${entry.token ? ` -> ${entry.token}` : ''}${entry.code ? ` [${entry.code}]` : ''}`)
  }

  lines.push('', '## Summary', '')
  lines.push(`- Requested tokens: ${plan.requested_tokens.length}`)
  lines.push(`- Linked tokens: ${plan.linked_tokens.length}`)
  lines.push(`- Automatic changed tokens (audit): ${plan.automatic_changed_tokens.length}`)
  lines.push(`- Table refresh tokens: ${plan.table_refresh_tokens.length}`)
  lines.push(`- Expanded tokens: ${plan.expanded_tokens.length}`)
  lines.push(`- Affected tables: ${plan.affected_tables.length}`)
  lines.push(`- Scope conflicts: ${plan.scope_conflicts.length}`)
  lines.push(`- Conclusion: ${plan.scope_conflicts.length > 0 ? 'blocked' : 'clean'}`)
  lines.push(`- Warnings: ${plan.warnings.length}`, '')

  lines.push('## Table Rebuilds', '')
  if (plan.table_rebuilds.length === 0) {
    lines.push('- None')
  } else {
    for (const rebuild of plan.table_rebuilds) {
      const cleanup = rebuild.cleanup ? ' [cleanup]' : ''
      lines.push(`- ${rebuild.table_id} (${rebuild.scope})${cleanup}: ${rebuild.reasons.join('; ') || '(no reasons)'}`)
      lines.push(`  - current targets: ${rebuild.current_targets.join(', ') || '(none)'}`)
      lines.push(`  - previous targets: ${rebuild.previous_targets.join(', ') || '(none)'}`)
    }
  }

  lines.push('', '## Scope Conflicts', '')
  if (plan.scope_conflicts.length === 0) {
    lines.push('- None')
  } else {
    for (const conflict of plan.scope_conflicts) {
      const identity = conflict.token || conflict.table_id || '(unknown)'
      lines.push(`- ${conflict.kind} ${identity}: ${conflict.reasons.join('; ')}`)
    }
  }

  lines.push('', '## Expanded Tokens', '')
  if (plan.expanded_tokens.length === 0) {
    lines.push('- None')
  } else {
    for (const token of plan.expanded_tokens) lines.push(`- ${token}`)
  }

  if (plan.warnings.length > 0) {
    lines.push('', '## Warnings', '')
    plan.warnings.forEach(warning => lines.push(`- ${warning}`))
  }
  return lines.join('\n')
}

function writeJsonReport(jsonPath, payload) {
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true })
  fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`)
}

function writeRequestedFetchPlanReports({ plan, selectionReceipt, outputPrefix }) {
  const jsonPath = `${outputPrefix}.json`
  const markdownPath = `${outputPrefix}.md`
  const selectionReceiptPath = `${outputPrefix}-selection.json`
  writeJsonReport(jsonPath, plan)
  fs.mkdirSync(path.dirname(markdownPath), { recursive: true })
  fs.writeFileSync(markdownPath, renderRequestedFetchPlanMarkdown(plan))
  writeJsonReport(selectionReceiptPath, {
    schema_version: REQUESTED_PLAN_SCHEMA_VERSION,
    generated_at: plan.generated_at,
    site: plan.site,
    plan_sha256: plan.plan_sha256,
    selection_input_sha256: selectionReceipt?.selection_input_sha256 || null,
    selectors: selectionReceipt?.selectors || plan.selection.selectors,
    requested_tokens: plan.requested_tokens,
    errors: selectionReceipt?.errors || [],
  })
  return { jsonPath, markdownPath, selectionReceiptPath }
}

function writeRequestedFetchErrorReports({ error, outputPrefix, site, generatedAt = new Date().toISOString() }) {
  const payload = {
    schema_version: REQUESTED_PLAN_SCHEMA_VERSION,
    generated_at: generatedAt,
    site,
    code: error?.code || 'REQUESTED_FETCH_FAILED',
    message: error?.message || String(error),
    details: error?.details || null,
  }
  const jsonPath = `${outputPrefix}-error.json`
  const markdownPath = `${outputPrefix}-error.md`
  writeJsonReport(jsonPath, payload)
  const lines = [
    `# Guides Requested Fetch Error (${site})`,
    '',
    `Generated: ${generatedAt}`,
    `Code: \`${payload.code}\``,
    '',
    payload.message,
    '',
  ]
  for (const item of payload.details?.errors || []) {
    lines.push(`- ${item.code}: ${item.message}`)
  }
  fs.mkdirSync(path.dirname(markdownPath), { recursive: true })
  fs.writeFileSync(markdownPath, `${lines.join('\n')}\n`)
  return { jsonPath, markdownPath }
}

module.exports = {
  REQUESTED_PLAN_SCHEMA_VERSION,
  REQUESTED_STATE_MERGE_SCHEMA_VERSION,
  REQUESTED_LIMITS,
  REQUESTED_ERROR_CODES,
  RequestedFetchError,
  resolveRequestedSelectors,
  assertTrustedRequestedBaseline,
  buildRequestedReferenceGraphs,
  expandRequestedClosure,
  deriveRequestedTableScope,
  detectRequestedScopeConflicts,
  planRequestedGuidesFetch,
  validateRequestedPlanForArtifact,
  compareRequestedPlans,
  mergeRequestedSnapshot,
  verifyRequestedStateMergeReceipt,
  requestedPlanIdentityHash,
  requestedStateMergeReceiptHash,
  renderRequestedFetchPlanMarkdown,
  writeRequestedFetchPlanReports,
  writeRequestedFetchErrorReports,
  throwRequestedResolutionErrors,
}
