'use strict'
const path = require('node:path')
const {loadTypeScript} = require('../../../../scripts/lib/load-typescript')
const core = loadTypeScript(path.resolve(__dirname, '../shared-docs/core/handoff/source-state.ts'))
const adapter = loadTypeScript(path.resolve(__dirname, '../shared-docs/adapters/handoff/routing.ts'))
const {isLocalizedDocsUrl} = loadTypeScript(path.resolve(__dirname, '../localized-docs/core/handoff/source-state.ts'))

const LOCALIZED_ON_EN_MESSAGE = 'localized-docs URLs are exclusive to Chinese localized pages and cannot be routed on site "en"'

function classifySourceRoute(value, context = {}) {
  if (isLocalizedDocsUrl(value)) {
    return {kind: 'invalid', code: 'OWNERSHIP_PATH_MISMATCH', message: LOCALIZED_ON_EN_MESSAGE}
  }
  return core.classifySourceRoute(value, context)
}

function recordLink(record) {
  const field = record?.fields?.Docs ?? record?.fields?.Doc
  const value = Array.isArray(field) ? field[0] : field
  if (value && typeof value === 'object') return value.link || value.url || ''
  if (typeof value === 'string') return value.match(/\[[^\]]*\]\(([^)]+)\)/)?.[1] || value
  return record?.doc_link || ''
}
function recordPlacement(record) {
  const value = record?.base_placement_type ?? record?.placement_type ?? record?.fields?.['Placement Type']
  return String(typeof value === 'object' ? value?.text || value?.name || '' : value || '').trim().toLowerCase()
}
function createRoutingContext(input) {
  const mappedRecords = (input.records || []).map(record => ({
    record_id: record.record_id, placement_type: recordPlacement(record), doc_link: recordLink(record),
  }))
  const context = adapter.createRoutingContext({...input, records: mappedRecords})
  for (const record of mappedRecords) {
    if (!isLocalizedDocsUrl(record.doc_link)) continue
    if (context.routesByRecordId.has(record.record_id)) {
      context.routesByRecordId.set(record.record_id, {
        kind: 'invalid', code: 'OWNERSHIP_PATH_MISMATCH', message: LOCALIZED_ON_EN_MESSAGE,
      })
    }
    for (const error of context.errors) {
      if (error.record_id === record.record_id) {
        error.code = 'OWNERSHIP_PATH_MISMATCH'
        error.message = LOCALIZED_ON_EN_MESSAGE
      }
    }
  }
  return context
}
function routeForRecord(record, routingContext = null) {
  if (routingContext && (routingContext.site === 'zh-CN' || routingContext.routesByPageUrl instanceof Map)) {
    return require('./localizedPageRouting').routeForLocalizedRecord(record, routingContext)
  }
  const link = recordLink(record)
  const observed = classifySourceRoute(link, routingContext || {})
  if (!routingContext) return observed
  if (routingContext.activeRecordIds.has(record.record_id) && observed.kind === 'feishu') {
    throw Object.assign(new Error(`OWNERSHIP_REVERTED: activated record ${record.record_id} cannot return to Feishu`),
      {code: 'OWNERSHIP_REVERTED', record_id: record.record_id})
  }
  const inspected = routingContext.inspectedDocsByRecordId
  if (inspected.has(record.record_id)) {
    if (inspected.get(record.record_id) !== link) return {kind: 'invalid', code: 'OWNERSHIP_CONFIG_MISSING',
      message: `Docs changed after route preflight for ${record.record_id}; repeat route preflight`}
    return routingContext.routesByRecordId.get(record.record_id)
  }
  if (recordPlacement(record) === 'canonical') return {kind: 'invalid', code: 'OWNERSHIP_CONFIG_MISSING',
    message: `Canonical record ${record.record_id} was not inspected by route preflight`}
  return observed
}
function sourceFieldsForRecord(record, routingContext = null) {
  if (routingContext && (routingContext.site === 'zh-CN' || routingContext.routesByPageUrl instanceof Map)) {
    return require('./localizedPageRouting').sourceFieldsForLocalizedRecord(record, routingContext)
  }
  const route = routeForRecord(record, routingContext)
  if (route.kind === 'feishu') return {}
  if (route.kind === 'invalid') return {routing_error: {code: route.code, message: route.message}}
  return {source_kind: 'shared-page', shared_page: routingContext?.sharedInputsByRecordId?.get(record.record_id)
    || {group: route.group, page: route.page}}
}
module.exports = {...core, ...adapter, classifySourceRoute, createRoutingContext, routeForRecord, sourceFieldsForRecord, recordLink}
