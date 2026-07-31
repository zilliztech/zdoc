'use strict'

const {
  guidesCanonicalIsPublishable,
  guidesPlacementType,
  guidesRecordPublishTargets,
} = require('./guidesBaseRecordSemantics')
const {createGuidesNavigationState} = require('./sourceSnapshot')
const {validateGuidesTableNames} = require('./guidesTableSlugs')

const TARGETS = new Set(['zilliz.paas', 'zilliz.saas'])

function plain(value) {
  if (value == null) return ''
  if (Array.isArray(value)) return plain(value[0])
  if (typeof value === 'object') return plain(value.text ?? value.name ?? value.value ?? value.link ?? value.url)
  return String(value).trim()
}

function recordContext(site, record) {
  const fields = record?.fields || {}
  return {
    site,
    table: record?.base_table_name || record?.base_table_id || '(missing)',
    record: record?.record_id || '(missing)',
    title: plain(fields.Labels ?? fields.Docs) || record?.record_id || '(missing)',
  }
}

function preflightError(site, record, {problem, field, value, fix}) {
  const context = recordContext(site, record)
  throw new Error([
    `[Guides Base preflight] ${problem}`,
    `Site: ${context.site}`,
    `Table: ${context.table}`,
    `Record: ${context.record}`,
    `Title: ${context.title}`,
    `Field: ${field}`,
    `Current value: ${value || '(empty)'}`,
    `How to fix: ${fix}`,
  ].join('\n'))
}

function normalizeTarget(target) {
  const value = String(target || '').trim().toLowerCase()
  if (value === 'saas') return 'zilliz.saas'
  if (value === 'paas' || value === 'byoc' || value === 'zilliz.byoc') return 'zilliz.paas'
  return value
}

function validateGuidesBasePreflight({site, tables, records}) {
  const mappedTables = validateGuidesTableNames(site, tables)
  const tableIds = new Set()
  const tableSlugs = new Map()
  for (const table of mappedTables) {
    if (!table.table_id || tableIds.has(table.table_id)) throw new Error(`Guides Base preflight found a missing or duplicate table ID: ${table.table_id || '(missing)'}`)
    tableIds.add(table.table_id)
    const owner = tableSlugs.get(table.table_slug)
    if (owner && owner !== table.table_id) throw new Error(`Guides Base preflight found duplicate English table slug ${table.table_slug}`)
    tableSlugs.set(table.table_slug, table.table_id)
  }

  for (const record of records || []) {
    const explicitPlacement = guidesPlacementType(record)
    if (!explicitPlacement) {
      preflightError(site, record, {
        problem: 'Placement Type is missing or unsupported',
        field: 'Placement Type',
        value: plain(record?.fields?.['Placement Type']),
        fix: 'Set Placement Type to exactly canonical, section, ref, or link.',
      })
    }
  }

  const navigation = createGuidesNavigationState(records).navigationRecords
  const recordIds = new Set(navigation.map(record => record.record_id))
  const canonicalByToken = new Map()
  for (const record of navigation) {
    if (record.placement_type !== 'canonical' || !record.doc_token) continue
    if (!canonicalByToken.has(record.doc_token)) canonicalByToken.set(record.doc_token, [])
    canonicalByToken.get(record.doc_token).push(record)
  }
  for (const [token, owners] of canonicalByToken) {
    if (owners.length <= 1) continue
    const owner = owners[1]
    preflightError(site, {
      record_id: owner.record_id,
      base_table_id: owner.table_id,
      base_table_name: owner.table_name,
      fields: {Labels: owner.labels || owner.title},
    }, {
      problem: `multiple canonical records own Feishu document ${token}`,
      field: 'Docs',
      value: token,
      fix: `Keep exactly one canonical owner for ${token}; change every other navigation occurrence to ref targeting that canonical.`,
    })
  }
  for (const record of navigation) {
    if (!tableIds.has(record.table_id)) throw new Error(`Guides Base record references an unknown table: ${record.table_id}`)
    for (const parentId of record.parent_record_ids) {
      if (!recordIds.has(parentId)) throw new Error(`Guides Base record ${record.record_id} references missing parent ${parentId}`)
    }
    const configuredTargets = guidesRecordPublishTargets(record).map(normalizeTarget)
    const unsupportedTarget = configuredTargets.find(target => !TARGETS.has(target))
    if (unsupportedTarget) throw new Error(`Guides Base record ${record.record_id} has unsupported publish target ${unsupportedTarget}`)
    if (record.placement_type === 'section' && !String(record.slug || '').trim()) {
      throw new Error(`Guides Base section ${record.record_id} is missing Slug`)
    }
    if (record.placement_type === 'ref') {
      const targetToken = record.ref_target_token
      const canonicalTargets = targetToken ? (canonicalByToken.get(targetToken) || []) : []
      if (canonicalTargets.length !== 1) {
        throw new Error(`Guides Base ref ${record.record_id} must resolve to exactly one canonical record for ${targetToken || '(missing Ref Target Doc)'}`)
      }
    }
    if (!guidesCanonicalIsPublishable(record)) continue
    if (!record.slug) throw new Error(`Publishable Guides record ${record.record_id} is missing Slug`)
    if (!record.doc_token || !record.doc_link) throw new Error(`Publishable Guides record ${record.record_id} is missing a Feishu document link`)
  }

  return {tables: mappedTables.length, records: navigation.length}
}

module.exports = {validateGuidesBasePreflight}
