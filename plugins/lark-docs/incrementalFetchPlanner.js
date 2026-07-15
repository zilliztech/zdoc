const fs = require('node:fs')
const path = require('node:path')
const {
  canonicalRecordsFrom,
  extractContentLinks,
  sourceTokenAliases,
} = require('./canonicalLinkAuditor')
const { sourceFilesByToken, createGuidesNavigationState } = require('./sourceSnapshot')
const { guidesCanonicalIsPublishable, guidesRecordPublishTargets } = require('./guidesBaseRecordSemantics')

const GUIDES_TARGETS = ['zilliz.paas', 'zilliz.saas']

function normalizeGuidesTarget(target) {
  const value = String(target || '').trim().toLowerCase()
  if (value === 'saas') return 'zilliz.saas'
  if (value === 'paas' || value === 'byoc' || value === 'zilliz.byoc') return 'zilliz.paas'
  return value
}

function guidesTableOwnership(navigationRecords) {
  const targetsByTable = new Map()
  const namesByTable = new Map()
  for (const record of navigationRecords || []) {
    if (record.table_id && record.table_name) namesByTable.set(record.table_id, record.table_name)
    if (!record.table_id || !guidesCanonicalIsPublishable(record)) continue
    const targets = guidesRecordPublishTargets(record).map(normalizeGuidesTarget).filter(target => GUIDES_TARGETS.includes(target))
    const effectiveTargets = targets.length > 0 ? targets : GUIDES_TARGETS
    if (!targetsByTable.has(record.table_id)) targetsByTable.set(record.table_id, new Set())
    effectiveTargets.forEach(target => targetsByTable.get(record.table_id).add(target))
  }
  return {
    targets: Object.fromEntries([...targetsByTable.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([tableId, targets]) => [tableId, [...targets].sort()])),
    names: Object.fromEntries([...namesByTable.entries()].sort(([a], [b]) => a.localeCompare(b))),
  }
}

function addReason(reasonsByToken, token, reason) {
  if (!token) return
  if (!reasonsByToken[token]) reasonsByToken[token] = []
  if (!reasonsByToken[token].includes(reason)) reasonsByToken[token].push(reason)
}

function snapshotRecordsById(snapshot) {
  return new Map((snapshot?.records || []).map(record => [record.record_id, record]))
}

function snapshotRecordsByToken(snapshot) {
  return new Map((snapshot?.records || []).map(record => [record.doc_token, record]))
}

function canonicalTokenSet(records, sourceByToken) {
  const tokens = new Set()
  for (const record of records) {
    tokens.add(record.doc_token)
    const source = sourceByToken.get(record.doc_token)
    if (source) {
      for (const alias of sourceTokenAliases(source)) tokens.add(alias)
    }
  }
  return tokens
}

function uniqueSources(sourceByToken) {
  return [...new Set(sourceByToken.values())]
}

function sourcePrimaryToken(source) {
  return source.node_token || source.origin_node_token || source.obj_token || source.token
}

function buildReferenceGraphs({ sourceByToken, canonicalTokens }) {
  const outgoing = new Map()
  const incoming = new Map()
  for (const source of uniqueSources(sourceByToken)) {
    const sourceToken = sourcePrimaryToken(source)
    if (!sourceToken || !canonicalTokens.has(sourceToken)) continue
    const refs = extractContentLinks(source)
      .map(link => link.token)
      .filter(token => canonicalTokens.has(token))
    outgoing.set(sourceToken, new Set(refs))
    for (const targetToken of refs) {
      if (!incoming.has(targetToken)) incoming.set(targetToken, new Set())
      incoming.get(targetToken).add(sourceToken)
    }
  }
  return { outgoing, incoming }
}

function mergeSnapshotReferenceGraphs({ outgoing, incoming, previousSnapshot, canonicalTokens }) {
  for (const record of previousSnapshot?.records || []) {
    const sourceToken = record.doc_token
    if (!sourceToken || !canonicalTokens.has(sourceToken)) continue
    const refs = (record.outgoing_tokens || []).filter(token => canonicalTokens.has(token))
    if (!outgoing.has(sourceToken)) outgoing.set(sourceToken, new Set())
    for (const targetToken of refs) {
      outgoing.get(sourceToken).add(targetToken)
      if (!incoming.has(targetToken)) incoming.set(targetToken, new Set())
      incoming.get(targetToken).add(sourceToken)
    }
  }
  return { outgoing, incoming }
}

function nodeRevisionValue(metadata) {
  return metadata?.revision_id || null
}

function nodeEditValue(metadata) {
  return metadata?.obj_edit_time || null
}

function previousNodeMetadata(previous) {
  if (!previous) return null
  return previous.node_metadata || {
    revision_id: previous.revision_id || null,
    obj_edit_time: previous.obj_edit_time || null,
    node_token: previous.node_token || null,
    obj_token: previous.obj_token || null,
    obj_type: previous.obj_type || null,
  }
}

function compareRecord(record, previous, sourceByToken, currentNodeMetadataByToken = new Map()) {
  const reasons = []
  if (!previous) {
    reasons.push('new canonical record')
    return reasons
  }
  const source = sourceByToken.get(record.doc_token)
  const currentNode = currentNodeMetadataByToken.get(record.doc_token)
  const previousNode = previousNodeMetadata(previous)
  if (record.doc_token !== previous.doc_token) reasons.push('doc token changed')
  if (record.title !== previous.title) reasons.push('title changed')
  if (record.slug !== previous.slug) reasons.push('slug changed')
  if (currentNode?.fetch_error) {
    reasons.push('wiki node metadata fetch failed')
  }
  if (currentNode && previousNode) {
    if (nodeRevisionValue(previousNode) && nodeRevisionValue(currentNode) && nodeRevisionValue(previousNode) !== nodeRevisionValue(currentNode)) {
      reasons.push('wiki node revision changed')
    } else if (nodeEditValue(previousNode) && nodeEditValue(currentNode) && nodeEditValue(previousNode) !== nodeEditValue(currentNode)) {
      reasons.push('wiki node edit time changed')
    }
  }
  if (source && previous.source_hash && source.__source_hash !== previous.source_hash) {
    reasons.push('source content changed')
  }
  return reasons
}

function expandReferences({ changedTokens, outgoing, incoming, maxReferenceDepth, reasonsByToken }) {
  const expanded = new Set(changedTokens)
  let frontier = new Set(changedTokens)

  for (let depth = 0; depth < maxReferenceDepth; depth++) {
    const next = new Set()
    for (const token of frontier) {
      for (const outgoingToken of outgoing.get(token) || []) {
        if (!expanded.has(outgoingToken)) {
          expanded.add(outgoingToken)
          next.add(outgoingToken)
          addReason(reasonsByToken, outgoingToken, `outgoing reference from ${token}`)
        }
      }
      for (const incomingToken of incoming.get(token) || []) {
        if (!expanded.has(incomingToken)) {
          expanded.add(incomingToken)
          next.add(incomingToken)
          addReason(reasonsByToken, incomingToken, `incoming reference to ${token}`)
        }
      }
    }
    frontier = next
    if (frontier.size === 0) break
  }

  return [...expanded].sort()
}

function fullPlan({ manualName, docSourceDir, canonicalRecords, buildEnv, warnings, reasonsByToken = {}, affectedTables = [], currentOwnership = { targets: {}, names: {} }, previousOwnership = { targets: {}, names: {} } }) {
  return {
    generated_at: new Date().toISOString(),
    manual: manualName,
    build_env: buildEnv || null,
    mode: 'full',
    source_dir: docSourceDir,
    changed_records: [],
    changed_tokens: [],
    expanded_tokens: canonicalRecords.map(record => record.doc_token).sort(),
    removed_records: [],
    removed_tokens: [],
    reasons_by_token: reasonsByToken,
    warnings,
    affected_tables: [...new Set(affectedTables)].sort(),
    current_table_targets: currentOwnership.targets,
    current_table_names: currentOwnership.names,
    previous_table_targets: previousOwnership.targets,
    previous_table_names: previousOwnership.names,
    snapshot_basis: null,
  }
}

function planIncrementalFetch({
  manualName,
  docSourceDir,
  records,
  previousSnapshot,
  buildEnv = null,
  maxReferenceDepth = 1,
  forceFull = false,
  fullFetchThreshold = 0.25,
  currentNodeMetadataByToken = new Map(),
  sourceCompleteness = null,
}) {
  const canonicalRecords = canonicalRecordsFrom(records, { guidesPublishableOnly: manualName === 'guides' })
  const guidesNavigation = manualName === 'guides' ? createGuidesNavigationState(records) : null
  const currentOwnership = guidesTableOwnership(guidesNavigation?.navigationRecords)
  const previousOwnership = guidesTableOwnership(previousSnapshot?.navigation_records)
  const currentNavigationTables = guidesNavigation ? Object.keys(guidesNavigation.tableDigests) : []
  if (forceFull) {
    return fullPlan({ manualName, docSourceDir, canonicalRecords, buildEnv, warnings: ['Forced full fetch requested.'], affectedTables: currentNavigationTables, currentOwnership, previousOwnership })
  }
  if (!previousSnapshot) {
    return fullPlan({ manualName, docSourceDir, canonicalRecords, buildEnv, warnings: ['No previous snapshot found.'], affectedTables: currentNavigationTables, currentOwnership, previousOwnership })
  }
  if (sourceCompleteness && !sourceCompleteness.complete) {
    const nonRenderableCount = sourceCompleteness.nonRenderableCanonicalFiles?.length || 0
    return fullPlan({
      manualName,
      docSourceDir,
      canonicalRecords,
      buildEnv,
      warnings: [`Source cache is incomplete (${sourceCompleteness.validCanonicalSources || 0}/${sourceCompleteness.expectedCanonicalSources || 0} canonical sources valid${nonRenderableCount ? `; ${nonRenderableCount} non-renderable canonical source${nonRenderableCount === 1 ? '' : 's'}` : ''}).`],
      affectedTables: currentNavigationTables,
      currentOwnership,
      previousOwnership,
    })
  }
  if (currentNodeMetadataByToken.size > 0 && Number(previousSnapshot.schema_version || 1) < 2) {
    return fullPlan({
      manualName,
      docSourceDir,
      canonicalRecords,
      buildEnv,
      warnings: ['Previous snapshot does not include wiki node metadata.'],
      affectedTables: currentNavigationTables,
      currentOwnership,
      previousOwnership,
    })
  }
  if (manualName === 'guides' && (Number(previousSnapshot.schema_version || 1) < 3 || !previousSnapshot.navigation_records || !previousSnapshot.table_digests)) {
    return fullPlan({
      manualName,
      docSourceDir,
      canonicalRecords,
      buildEnv,
      warnings: ['Previous Guides snapshot does not include navigation schema v3.'],
      affectedTables: currentNavigationTables,
      currentOwnership,
      previousOwnership,
    })
  }

  const warnings = []
  const reasonsByToken = {}
  let sourceByToken
  try {
    sourceByToken = sourceFilesByToken(docSourceDir)
  } catch (error) {
    return fullPlan({
      manualName,
      docSourceDir,
      canonicalRecords,
      buildEnv,
      warnings: [`Failed to read source graph: ${error.message}`],
      affectedTables: currentNavigationTables,
      currentOwnership,
      previousOwnership,
    })
  }

  const previousById = snapshotRecordsById(previousSnapshot)
  const previousByToken = snapshotRecordsByToken(previousSnapshot)
  const currentRecordIds = new Set(canonicalRecords.map(record => record.record_id))
  const changedRecords = []
  const removedRecords = []

  for (const record of canonicalRecords) {
    const reasons = compareRecord(record, previousById.get(record.record_id), sourceByToken, currentNodeMetadataByToken)
    if (reasons.length > 0) {
      changedRecords.push({ ...record, reasons })
      reasons.forEach(reason => addReason(reasonsByToken, record.doc_token, reason))
    }
  }

  for (const previous of previousSnapshot.records || []) {
    if (!currentRecordIds.has(previous.record_id)) {
      warnings.push(`Record removed since last snapshot: ${previous.title || previous.record_id}`)
      removedRecords.push(previous)
      if (previous.doc_token) addReason(reasonsByToken, previous.doc_token, 'record removed')
    }
  }

  const minimumFullFetchCount = 10
  const changedLimit = Math.max(minimumFullFetchCount, Math.ceil(canonicalRecords.length * fullFetchThreshold))
  if (changedRecords.length > changedLimit) {
    return fullPlan({
      manualName,
      docSourceDir,
      canonicalRecords,
      buildEnv,
      warnings: [`Changed record count ${changedRecords.length} exceeds full-fetch threshold ${changedLimit}.`],
      reasonsByToken,
      affectedTables: currentNavigationTables,
      currentOwnership,
      previousOwnership,
    })
  }

  const changedTokens = changedRecords.map(record => record.doc_token).sort()
  const removedTokens = removedRecords.map(record => record.doc_token).filter(Boolean).sort()
  const canonicalTokens = canonicalTokenSet(canonicalRecords, sourceByToken)
  const { outgoing, incoming } = mergeSnapshotReferenceGraphs({
    ...buildReferenceGraphs({ sourceByToken, canonicalTokens }),
    previousSnapshot,
    canonicalTokens,
  })
  const expandedTokens = expandReferences({
    changedTokens,
    outgoing,
    incoming,
    maxReferenceDepth: Number(maxReferenceDepth || 1),
    reasonsByToken,
  })
  const affectedTables = new Set()
  if (guidesNavigation) {
    const previousTableDigests = previousSnapshot.table_digests || {}
    for (const tableId of new Set([...Object.keys(guidesNavigation.tableDigests), ...Object.keys(previousTableDigests)])) {
      if (guidesNavigation.tableDigests[tableId] !== previousTableDigests[tableId]) affectedTables.add(tableId)
    }
  }
  for (const record of changedRecords) if (record.table_id) affectedTables.add(record.table_id)
  for (const record of removedRecords) if (record.table_id) affectedTables.add(record.table_id)
  const currentTableByToken = new Map(canonicalRecords.map(record => [record.doc_token, record.table_id]))
  const previousTableByToken = new Map((previousSnapshot.records || []).map(record => [record.doc_token, record.table_id]))
  for (const token of expandedTokens) {
    const tableId = currentTableByToken.get(token) || previousTableByToken.get(token)
    if (tableId) affectedTables.add(tableId)
  }

  return {
    generated_at: new Date().toISOString(),
    manual: manualName,
    build_env: buildEnv || null,
    mode: 'incremental',
    source_dir: docSourceDir,
    changed_records: changedRecords,
    changed_tokens: changedTokens,
    expanded_tokens: expandedTokens,
    removed_records: removedRecords,
    removed_tokens: removedTokens,
    reasons_by_token: reasonsByToken,
    warnings,
    affected_tables: [...affectedTables].sort(),
    current_table_targets: currentOwnership.targets,
    current_table_names: currentOwnership.names,
    previous_table_targets: previousOwnership.targets,
    previous_table_names: previousOwnership.names,
    snapshot_basis: {
      generated_at: previousSnapshot.generated_at || null,
      records: previousByToken.size,
    },
  }
}

function renderIncrementalFetchPlanMarkdown(plan) {
  const lines = []
  lines.push(`# ${plan.manual} Incremental Fetch Plan`, '')
  lines.push(`Generated: ${plan.generated_at}`)
  lines.push(`Mode: ${plan.mode}`)
  lines.push(`Build env: ${plan.build_env || '(not specified)'}`)
  lines.push(`Source dir: \`${plan.source_dir}\``)
  if (plan.snapshot_basis?.generated_at) {
    lines.push(`Previous snapshot: ${plan.snapshot_basis.generated_at}`)
  }
  lines.push('', '## Summary', '')
  lines.push(`- Changed docs: ${plan.changed_tokens.length}`)
  lines.push(`- Expanded docs: ${plan.expanded_tokens.length}`)
  lines.push(`- Removed docs: ${(plan.removed_tokens || []).length}`)
  lines.push(`- Warnings: ${plan.warnings.length}`, '')

  lines.push('## Changed Docs', '')
  if (plan.changed_records.length === 0) {
    lines.push('- None')
  } else {
    for (const record of plan.changed_records) {
      lines.push(`- ${record.title || record.doc_token} (${record.doc_token}): ${record.reasons.join('; ')}`)
    }
  }

  lines.push('', '## Expanded Tokens', '')
  if (plan.expanded_tokens.length === 0) {
    lines.push('- None')
  } else {
    for (const token of plan.expanded_tokens) {
      const reasons = plan.reasons_by_token[token] || []
      lines.push(`- ${token}${reasons.length ? `: ${reasons.join('; ')}` : ''}`)
    }
  }

  lines.push('', '## Removed Docs', '')
  if (!plan.removed_records || plan.removed_records.length === 0) {
    lines.push('- None')
  } else {
    for (const record of plan.removed_records) {
      lines.push(`- ${record.title || record.doc_token || record.record_id} (${record.doc_token || record.record_id})`)
    }
  }

  if (plan.warnings.length > 0) {
    lines.push('', '## Warnings', '')
    plan.warnings.forEach(warning => lines.push(`- ${warning}`))
  }
  return lines.join('\n')
}

function writeIncrementalFetchPlanReports(plan, outputPrefix) {
  fs.mkdirSync(path.dirname(outputPrefix), { recursive: true })
  const jsonPath = `${outputPrefix}.json`
  const markdownPath = `${outputPrefix}.md`
  fs.writeFileSync(jsonPath, JSON.stringify(plan, null, 2))
  fs.writeFileSync(markdownPath, renderIncrementalFetchPlanMarkdown(plan))
  return { jsonPath, markdownPath }
}

module.exports = {
  planIncrementalFetch,
  writeIncrementalFetchPlanReports,
  renderIncrementalFetchPlanMarkdown,
}
