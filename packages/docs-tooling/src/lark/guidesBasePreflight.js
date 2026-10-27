'use strict'

const {
  guidesCanonicalIsPublishable,
  guidesPlacementType,
  guidesRecordPublishTargets,
} = require('./guidesBaseRecordSemantics')
const {createGuidesNavigationState} = require('./sourceSnapshot')
const {validateGuidesTableNames} = require('./guidesTableSlugs')

const {createRoutingContext} = require('./sharedPageRouting')

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

function validateGuidesBasePreflight({site, tables, records, routingContext = null}) {
  routingContext ||= createRoutingContext({records})
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
    const rawChannel = plain(record?.fields?.['Release Channel'])
    if (rawChannel && !['CURRENT', 'NEXT', 'RETIRE-IN-NEXT'].includes(rawChannel.toUpperCase())) {
      preflightError(site, record, {
        problem: 'Release Channel is not a supported option',
        field: 'Release Channel',
        value: rawChannel,
        fix: 'Set Release Channel to exactly CURRENT, NEXT, or RETIRE-IN-NEXT, or clear the field to fall back to CURRENT.',
      })
    }
  }

  const navigation = createGuidesNavigationState(records, {routingContext}).navigationRecords
  const recordIds = new Set(navigation.map(record => record.record_id))
  const canonicalByToken = new Map()
  const sharedOwners = new Map()
  for (const record of navigation.filter(entry => entry.placement_type === 'canonical' && entry.source_kind === 'shared-page')) {
    const key = `${record.shared_page.group}/${record.shared_page.page}`
    if (sharedOwners.has(key)) throw new Error(`Guides Base preflight: multiple canonical records own shared page ${key}`)
    sharedOwners.set(key, record.record_id)
  }
  for (const record of navigation) {
    if (record.placement_type !== 'canonical' || !record.doc_token) continue
    if (!canonicalByToken.has(record.doc_token)) canonicalByToken.set(record.doc_token, [])
    canonicalByToken.get(record.doc_token).push(record)
  }
  for (const [token, recordId] of routingContext.aliasesByToken) {
    const record = navigation.find(entry => entry.record_id === recordId && entry.placement_type === 'canonical')
    if (!record) continue
    if (!canonicalByToken.has(token)) canonicalByToken.set(token, [])
    canonicalByToken.get(token).push(record)
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
      preflightError(site, {
        record_id: record.record_id,
        base_table_id: record.table_id,
        base_table_name: record.table_name,
        fields: {Labels: record.labels || record.title, Slug: record.slug},
      }, {
        problem: 'section is missing Slug',
        field: 'Slug',
        value: record.slug,
        fix: 'Set a stable English kebab-case Slug matching the corresponding English section.',
      })
    }
    if (record.placement_type === 'ref') {
      const targetToken = record.ref_target_token
      const canonicalTargets = targetToken ? (canonicalByToken.get(targetToken) || []) : []
      if (canonicalTargets.length !== 1) {
        preflightError(site, {
          record_id: record.record_id,
          base_table_id: record.table_id,
          base_table_name: record.table_name,
          fields: {Labels: record.labels || record.title, 'Ref Target Doc': targetToken},
        }, {
          problem: 'ref must resolve to exactly one canonical record',
          field: 'Ref Target Doc',
          value: targetToken,
          fix: 'Set Ref Target Doc to a Feishu document owned by exactly one canonical record in this Base. Ref records cannot target sections, links, or other refs.',
        })
      }
    }
    if (!guidesCanonicalIsPublishable(record)) continue
    if (!record.slug) throw new Error(`Publishable Guides record ${record.record_id} is missing Slug`)
    // Invalid ownership is reported per page; structural Base errors still fail preflight.
    if (record.routing_error) continue
    if (record.source_kind !== 'shared-page' && (!record.doc_token || !record.doc_link)) throw new Error(`Publishable Guides record ${record.record_id} is missing a Feishu document link`)
  }

  return {tables: mappedTables.length, records: navigation.length, ...(routingContext.errors.length ? {routing_errors: routingContext.errors} : {})}
}

module.exports = {validateGuidesBasePreflight}
