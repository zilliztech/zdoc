'use strict'

const path = require('node:path')
const { loadTypeScript } = require('../../../../scripts/lib/load-typescript')

const sourceState = loadTypeScript(path.resolve(__dirname, '../localized-docs/core/handoff/source-state.ts'))
const routingCore = loadTypeScript(path.resolve(__dirname, '../localized-docs/core/handoff/routing.ts'))
const receiptCore = loadTypeScript(path.resolve(__dirname, '../localized-docs/core/handoff/receipt.ts'))
const promoteCore = loadTypeScript(path.resolve(__dirname, '../localized-docs/core/handoff/promote.ts'))
const routingAdapter = loadTypeScript(path.resolve(__dirname, '../localized-docs/adapters/handoff/routing.ts'))
const fetchBuildAdapter = loadTypeScript(path.resolve(__dirname, '../localized-docs/adapters/handoff/fetch-build.ts'))

function plain(value) {
  if (value == null) return ''
  if (Array.isArray(value)) return plain(value[0])
  if (typeof value === 'object') return plain(value.text ?? value.name ?? value.value ?? value.link ?? value.url)
  return String(value).trim()
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

/**
 * Extracts the canonical target `page_url` primary key for a localized Chinese
 * Guides record, completely independent of Feishu Base `record_id`.
 */
function recordPageUrl(record) {
  const raw =
    record?.page_url ||
    record?.localized_page?.page_url ||
    plain(record?.fields?.['Page URL']) ||
    plain(record?.fields?.['page_url']) ||
    plain(record?.fields?.Slug) ||
    record?.slug ||
    ''
  if (!raw) return ''
  return routingCore.tryNormalizeLocalizedPageUrl(raw) || String(raw).trim()
}

function createLocalizedRoutingContext(input) {
  const records = (input.records || []).map(record => ({
    ...(record.record_id !== undefined ? { record_id: record.record_id } : {}),
    placement_type: recordPlacement(record),
    page_url: recordPageUrl(record),
    doc_link: recordLink(record),
  }))
  return routingAdapter.createLocalizedFetchRoutingContext({
    ...input,
    site: input.site ?? 'zh-CN',
    records,
  })
}

function isLocalizedRoutingContext(routingContext) {
  return Boolean(routingContext && (routingContext.site === 'zh-CN' || routingContext.routesByPageUrl instanceof Map))
}

function routeForLocalizedRecord(record, routingContext = null) {
  const link = recordLink(record)
  const site = routingContext?.site ?? 'zh-CN'
  const observed = sourceState.classifyLocalizedSourceRoute(link, {
    site,
    availablePages: routingContext?.availablePages,
  })
  if (!routingContext) return observed

  const rawPageUrl = recordPageUrl(record)
  const normalizedUrl = routingCore.tryNormalizeLocalizedPageUrl(rawPageUrl)
  if (normalizedUrl && routingContext.activePageUrls?.has(normalizedUrl) && observed.kind === 'feishu') {
    const activeEntry = routingContext.activeByPageUrl?.get(normalizedUrl)
    throw Object.assign(
      new Error(`OWNERSHIP_REVERTED: activated page_url "${normalizedUrl}"${activeEntry ? ` (page "${activeEntry.page}")` : ''} cannot return to Feishu`),
      {
        code: 'OWNERSHIP_REVERTED',
        page_url: normalizedUrl,
        page: activeEntry?.page ?? null,
        record_id: record?.record_id ?? null,
      },
    )
  }

  if (normalizedUrl && routingContext.inspectedDocsByPageUrl?.has(normalizedUrl)) {
    if (routingContext.inspectedDocsByPageUrl.get(normalizedUrl) !== link) {
      return {
        kind: 'invalid',
        code: 'OWNERSHIP_CONFIG_MISSING',
        message: `Docs changed after route preflight for page_url "${normalizedUrl}"; repeat route preflight`,
      }
    }
    return routingContext.routesByPageUrl.get(normalizedUrl)
  }

  if (recordPlacement(record) === 'canonical') {
    return {
      kind: 'invalid',
      code: 'OWNERSHIP_CONFIG_MISSING',
      message: `Canonical record for page_url "${rawPageUrl || record?.record_id || '(missing)'}" was not inspected by localized route preflight`,
    }
  }
  return observed
}

function sourceFieldsForLocalizedRecord(record, routingContext = null) {
  const route = routeForLocalizedRecord(record, routingContext)
  if (route.kind === 'feishu') return {}
  if (route.kind === 'invalid') {
    return { routing_error: { code: route.code, message: route.message } }
  }
  const normalizedUrl = routingCore.tryNormalizeLocalizedPageUrl(recordPageUrl(record))
  const identity = normalizedUrl ? routingContext?.localizedInputsByPageUrl?.get(normalizedUrl) : null
  return {
    source_kind: 'localized-page',
    localized_page: identity || {
      locale: route.locale,
      group: route.group,
      page: route.page,
      page_url: normalizedUrl || route.page,
      record: receiptCore.localizedReceiptPath(route.locale, route.group, route.page),
    },
  }
}

function validateLocalizedPageIdentity(identity) {
  if (!identity || typeof identity !== 'object' || Array.isArray(identity)) {
    throw new Error('Localized snapshot identity must be an object')
  }
  if (identity.locale !== 'zh-CN') throw new Error(`Invalid localized snapshot locale: ${String(identity.locale)}`)
  if (identity.group !== 'guides') throw new Error(`Invalid localized snapshot group: ${String(identity.group)}`)
  const expectedRecord = receiptCore.localizedReceiptPath('zh-CN', 'guides', identity.page)
  const normalizedUrl = routingCore.normalizeLocalizedPageUrl(identity.page_url)
  if (normalizedUrl !== identity.page_url) {
    throw new Error(`Localized snapshot page_url must be canonical: ${identity.page_url}`)
  }
  if (identity.record !== expectedRecord) {
    throw new Error(`Localized snapshot receipt path mismatch: expected "${expectedRecord}", got "${String(identity.record)}"`)
  }
  if (identity.inputs_sha256 !== undefined && !sourceState.SHA256_HEX_RE.test(identity.inputs_sha256)) {
    throw new Error(`Localized snapshot inputs_sha256 is invalid for "${identity.page}"`)
  }
  return identity
}

function validateLocalizedSnapshotRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    throw new Error('Localized snapshot record must be an object')
  }
  if (record.source_kind !== 'localized-page') {
    throw new Error('Localized snapshot record requires source_kind "localized-page"')
  }
  validateLocalizedPageIdentity(record.localized_page)
  if (record.doc_token !== null && record.doc_token !== undefined) {
    throw new Error('Localized snapshot record must not carry a Feishu doc_token')
  }
  if (record.source_file !== null && record.source_file !== undefined) {
    throw new Error('Localized snapshot record must not carry a Feishu source_file')
  }
  if (record.source_hash !== null && record.source_hash !== undefined) {
    throw new Error('Localized snapshot record must not carry a Feishu source_hash')
  }
  if (Array.isArray(record.outgoing_tokens) && record.outgoing_tokens.length > 0) {
    throw new Error('Localized snapshot record must not carry Feishu outgoing_tokens')
  }
  return record
}

function localizedSourceProjection(record) {
  validateLocalizedSnapshotRecord(record)
  return {
    source_kind: 'localized-page',
    localized_page: {
      locale: record.localized_page.locale,
      group: record.localized_page.group,
      page: record.localized_page.page,
      page_url: record.localized_page.page_url,
      inputs_sha256: record.localized_page.inputs_sha256 ?? null,
      record: record.localized_page.record,
    },
  }
}

module.exports = {
  ...sourceState,
  ...routingCore,
  ...receiptCore,
  ...promoteCore,
  ...routingAdapter,
  ...fetchBuildAdapter,
  recordLink,
  recordPlacement,
  recordPageUrl,
  isLocalizedRoutingContext,
  createLocalizedRoutingContext,
  routeForLocalizedRecord,
  sourceFieldsForLocalizedRecord,
  validateLocalizedPageIdentity,
  validateLocalizedSnapshotRecord,
  localizedSourceProjection,
}
