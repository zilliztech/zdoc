#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const slugify = require('slugify')
const { guidesCanonicalIsPublishable, guidesRecordPublishTargets } = require('../plugins/lark-docs/guidesBaseRecordSemantics')

function targetMatches(record, target) {
  const targets = guidesRecordPublishTargets(record)
  return targets.length === 0 || targets.includes(String(target).toLowerCase())
}

function collectSidebarEntries(sidebar) {
  const entries = []
  function visit(items) {
    for (const item of items || []) {
      entries.push(item)
      if (Array.isArray(item.items)) visit(item.items)
    }
  }
  visit(sidebar)
  return entries
}

function sourceToken(value) {
  if (!value) return null
  try { return new URL(value).pathname.split('/').filter(Boolean).pop() || null } catch (_) { return String(value) }
}

function validateGuidesSourceContract({ snapshot, target, outputDir, idPrefix = 'tutorials', sidebar }) {
  if (!snapshot || snapshot.manual !== 'guides' || snapshot.schema_version !== 3 || !Array.isArray(snapshot.navigation_records)) throw new Error('Guides source contract requires a schema v3 snapshot')
  const records = snapshot.navigation_records
  const byId = new Map(records.map(record => [record.record_id, record]))
  const children = new Map()
  for (const record of records) {
    for (const parentId of record.parent_record_ids || []) {
      if (!children.has(parentId)) children.set(parentId, [])
      children.get(parentId).push(record.record_id)
    }
  }
  const relativeDir = (record, seen = new Set()) => {
    if (seen.has(record.record_id)) throw new Error(`Guides navigation cycle at ${record.record_id}`)
    const tableSlug = slugify(record.table_name || record.table_id, { lower: true, strict: true })
    const parentId = (record.parent_record_ids || []).find(id => byId.has(id))
    if (!parentId) return tableSlug
    seen.add(record.record_id)
    const parent = byId.get(parentId)
    return path.posix.join(relativeDir(parent, seen), parent.slug)
  }
  const recordDocId = record => {
    const base = path.posix.join(idPrefix, relativeDir(record), record.slug)
    return (children.get(record.record_id) || []).length > 0 ? path.posix.join(base, record.slug) : base
  }
  const recordFile = record => {
    const base = path.join(outputDir, ...relativeDir(record).split('/'), record.slug)
    return (children.get(record.record_id) || []).length > 0 ? path.join(base, `${record.slug}.md`) : `${base}.md`
  }
  const hasMarkdown = file => fs.existsSync(file) || fs.existsSync(`${file}x`)
  const entries = collectSidebarEntries(sidebar)
  const canonicalByToken = new Map(records.filter(record => record.placement_type === 'canonical' && record.doc_token).map(record => [record.doc_token, record]))
  const errors = []
  let checkedRecords = 0

  for (const record of records) {
    if (!targetMatches(record, target)) continue
    if (record.placement_type === 'canonical' && !guidesCanonicalIsPublishable(record)) continue
    checkedRecords += 1
    const navPath = path.posix.join(idPrefix, relativeDir(record), record.slug)
    if (record.placement_type === 'canonical') {
      const id = recordDocId(record)
      if (!hasMarkdown(recordFile(record))) errors.push(`canonical ${record.record_id} missing file: ${id}`)
      const matches = entries.filter(item => (item.type === 'doc' && item.id === id) || (item.type === 'category' && item.link?.type === 'doc' && item.link.id === id))
      if (matches.length !== 1) errors.push(`canonical ${record.record_id} missing navigation or duplicated: ${id}`)
      continue
    }
    const key = `${record.placement_type === 'section' ? 'category' : record.placement_type}:${navPath}`
    if (record.placement_type === 'section') {
      if (!entries.some(item => item.type === 'category' && item.key === key)) errors.push(`section ${record.record_id} missing category: ${key}`)
      const leaf = path.join(outputDir, ...relativeDir(record).split('/'), `${record.slug}.md`)
      const nested = path.join(outputDir, ...relativeDir(record).split('/'), record.slug, `${record.slug}.md`)
      if (hasMarkdown(leaf) || hasMarkdown(nested)) errors.push(`section ${record.record_id} generated forbidden landing page`)
      continue
    }
    if (record.placement_type === 'link') {
      const expectedHref = record.ref_target || record.doc_link
      const item = entries.find(entry => entry.type === 'link' && entry.key === key)
      if (!item || item.href !== expectedHref) errors.push(`link ${record.record_id} href mismatch: expected ${expectedHref || '(missing)'}`)
      continue
    }
    if (record.placement_type === 'ref') {
      const targetToken = record.ref_target_token || sourceToken(record.ref_target)
      const canonical = canonicalByToken.get(targetToken)
      const expectedId = canonical ? recordDocId(canonical) : null
      const item = entries.find(entry => entry.type === 'ref' && entry.key === key)
      if (!expectedId || !item || item.id !== expectedId) errors.push(`ref ${record.record_id} target mismatch: ${targetToken || '(missing)'}`)
      const leaf = path.join(outputDir, ...relativeDir(record).split('/'), `${record.slug}.md`)
      const nested = path.join(outputDir, ...relativeDir(record).split('/'), record.slug, `${record.slug}.md`)
      if (hasMarkdown(leaf) || hasMarkdown(nested)) errors.push(`ref ${record.record_id} generated duplicate body`)
    }
  }

  if (errors.length) throw new Error(`Guides source contract failed:\n- ${errors.join('\n- ')}`)
  return { checkedRecords, errors }
}

module.exports = { collectSidebarEntries, validateGuidesSourceContract }
