'use strict'

const {guidesCanonicalIsPublishable, guidesRecordPublishTargets} = require('./guidesBaseRecordSemantics')
const {createGuidesNavigationState} = require('./sourceSnapshot')
const {validateGuidesTableNames} = require('./guidesTableSlugs')

const TARGETS = new Set(['zilliz.paas', 'zilliz.saas'])

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

  const navigation = createGuidesNavigationState(records).navigationRecords
  const recordIds = new Set(navigation.map(record => record.record_id))
  for (const record of navigation) {
    if (!tableIds.has(record.table_id)) throw new Error(`Guides Base record references an unknown table: ${record.table_id}`)
    for (const parentId of record.parent_record_ids) {
      if (!recordIds.has(parentId)) throw new Error(`Guides Base record ${record.record_id} references missing parent ${parentId}`)
    }
    const configuredTargets = guidesRecordPublishTargets(record).map(normalizeTarget)
    const unsupportedTarget = configuredTargets.find(target => !TARGETS.has(target))
    if (unsupportedTarget) throw new Error(`Guides Base record ${record.record_id} has unsupported publish target ${unsupportedTarget}`)
    if (!guidesCanonicalIsPublishable(record)) continue
    if (!record.slug) throw new Error(`Publishable Guides record ${record.record_id} is missing Slug`)
    if (!record.doc_token || !record.doc_link) throw new Error(`Publishable Guides record ${record.record_id} is missing a Feishu document link`)
  }

  return {tables: mappedTables.length, records: navigation.length}
}

module.exports = {validateGuidesBasePreflight}
