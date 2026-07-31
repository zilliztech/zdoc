'use strict'

const PLACEMENTS = new Set(['canonical', 'section', 'link', 'ref'])
const PUBLISHABLE_PROGRESS = new Set(['draft', 'reviewed', 'published', 'approved', 'publish'])

function plain(value) {
  if (value == null) return null
  if (Array.isArray(value)) return plain(value[0])
  if (typeof value === 'object') {
    for (const key of ['text', 'name', 'value', 'link']) {
      if (value[key] != null) return plain(value[key])
    }
    return null
  }
  return String(value)
}

function fields(record) {
  return record?.fields || record || {}
}

function docsLink(record) {
  const value = fields(record).Docs
  if (value && typeof value === 'object' && !Array.isArray(value)) return plain(value.link)
  const text = plain(value)
  return text?.match(/https?:\/\/[^\s)]+/)?.[0] || null
}

function isFeishuDocumentLink(link) {
  if (!link) return false
  try {
    const url = new URL(link)
    const host = url.hostname.toLowerCase()
    if (!host.endsWith('feishu.cn') && !host.endsWith('larksuite.com')) return false
    return /^\/(?:wiki|doc|docs|docx)\//.test(url.pathname)
  } catch (_) {
    return false
  }
}

function guidesPlacementType(record, { guidesMode = false } = {}) {
  const source = record || {}
  const explicit = plain(source.base_placement_type ?? source.placement_type ?? fields(source)['Placement Type'])?.trim().toLowerCase()
  if (PLACEMENTS.has(explicit)) return explicit
  if (!guidesMode) return null
  return isFeishuDocumentLink(docsLink(source)) ? 'canonical' : 'section'
}

function guidesRecordCreatesPage(record, options) {
  return guidesPlacementType(record, options) === 'canonical'
}

function guidesRecordCreatesNavigation(record, options) {
  return PLACEMENTS.has(guidesPlacementType(record, options))
}

function guidesRecordPublishTargets(record) {
  const value = record?.base_targets ?? record?.targets ?? fields(record).Targets ?? fields(record)['Publish Targets']
  const values = Array.isArray(value) ? value : value == null ? [] : [value]
  return values.map(item => plain(item)?.trim().toLowerCase()).filter(Boolean)
}

function guidesCanonicalIsPublishable(record) {
  if (guidesPlacementType(record, { guidesMode: true }) !== 'canonical') return false
  const progress = plain(record?.base_status ?? record?.progress ?? fields(record).Progress ?? fields(record).Status)?.trim().toLowerCase()
  return PUBLISHABLE_PROGRESS.has(progress || '')
}

function guidesRecordRefTarget(record) {
  return plain(record?.base_ref_target_doc ?? fields(record)['Ref Target Doc'])
}

module.exports = {
  guidesPlacementType,
  guidesRecordCreatesNavigation,
  guidesRecordCreatesPage,
  guidesCanonicalIsPublishable,
  guidesRecordPublishTargets,
  guidesRecordRefTarget,
  isFeishuDocumentLink,
}
