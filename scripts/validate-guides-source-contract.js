#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const slugify = require('slugify')
const yaml = require('js-yaml')
const { guidesCanonicalIsPublishable, guidesRecordPublishTargets } = require('../plugins/lark-docs/guidesBaseRecordSemantics')
const { canonicalizeInternalDocLink } = require('../plugins/lark-docs/internalDocLink')

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

function collectGeneratedDocsByToken(outputDir, idPrefix) {
  const docsByToken = new Map()
  function visit(relative = '') {
    const directory = path.join(outputDir, relative)
    if (!fs.existsSync(directory)) return
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const child = path.posix.join(relative.replaceAll(path.sep, '/'), entry.name)
      if (entry.isDirectory()) {
        visit(child)
        continue
      }
      if (!entry.isFile() || !/\.mdx?$/.test(entry.name)) continue
      const contents = fs.readFileSync(path.join(outputDir, child), 'utf8')
      const frontmatter = contents.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
      if (!frontmatter) continue
      const token = yaml.load(frontmatter[1])?.token
      if (!token) continue
      const id = path.posix.join(idPrefix, child.replace(/\.mdx?$/, ''))
      const key = String(token)
      if (!docsByToken.has(key)) docsByToken.set(key, [])
      docsByToken.get(key).push(id)
    }
  }
  visit()
  return docsByToken
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
  const recordSegment = record => record.slug || slugify(record.title || record.record_id, { lower: true, strict: true })
  const relativeDir = (record, seen = new Set()) => {
    if (seen.has(record.record_id)) throw new Error(`Guides navigation cycle at ${record.record_id}`)
    const tableSlug = slugify(record.table_name || record.table_id, { lower: true, strict: true })
    const parentId = (record.parent_record_ids || []).find(id => byId.has(id))
    if (!parentId) return tableSlug
    seen.add(record.record_id)
    const parent = byId.get(parentId)
    return path.posix.join(relativeDir(parent, seen), recordSegment(parent))
  }
  const entries = collectSidebarEntries(sidebar)
  const canonicalByToken = new Map(records.filter(record => record.placement_type === 'canonical' && record.doc_token).map(record => [record.doc_token, record]))
  const generatedDocsByToken = collectGeneratedDocsByToken(outputDir, idPrefix)
  const errors = []
  let checkedRecords = 0

  for (const record of records) {
    if (!targetMatches(record, target)) continue
    if (record.placement_type === 'canonical' && !guidesCanonicalIsPublishable(record)) continue
    checkedRecords += 1
    const segment = recordSegment(record)
    const navPath = path.posix.join(idPrefix, relativeDir(record), segment)
    if (record.placement_type === 'canonical') {
      const ids = generatedDocsByToken.get(record.doc_token) || []
      if (record.slug === 'faqs') {
        const categoryKey = `category:${navPath}`
        const category = entries.find(item => item.type === 'category' && item.key === categoryKey)
        if (!category) errors.push(`canonical ${record.record_id} missing FAQ category: ${categoryKey}`)
        else if (category.link) errors.push(`canonical ${record.record_id} FAQ category must not have a landing page link`)
        if (ids.length === 0) errors.push(`canonical ${record.record_id} missing expanded FAQ pages for token: ${record.doc_token || '(missing)'}`)
        if (ids.some(id => id.endsWith('/faqs/faqs'))) errors.push(`canonical ${record.record_id} generated forbidden FAQ landing page`)
        const faqEntries = collectSidebarEntries(category?.items || [])
        const missingFaqs = ids.filter(id => !faqEntries.some(item => item.type === 'doc' && item.id === id))
        if (missingFaqs.length) errors.push(`canonical ${record.record_id} expanded FAQ pages missing navigation: ${missingFaqs.join(', ')}`)
        continue
      }
      if (ids.length === 0) {
        errors.push(`canonical ${record.record_id} missing file for token: ${record.doc_token || '(missing)'}`)
        continue
      }
      if (ids.length > 1) errors.push(`canonical ${record.record_id} generated duplicate files: ${ids.join(', ')}`)
      const id = ids[0]
      const matches = entries.filter(item =>
        (item.type === 'doc' && item.id === id && !String(item.key || '').startsWith('ref:')) ||
        (item.type === 'category' && item.link?.type === 'doc' && item.link.id === id)
      )
      if (matches.length !== 1) errors.push(`canonical ${record.record_id} missing navigation or duplicated: ${id}`)
      continue
    }
    const key = `${record.placement_type === 'section' ? 'category' : record.placement_type}:${navPath}`
    if (record.placement_type === 'section') {
      const item = entries.find(entry => entry.type === 'category' && entry.key === key)
      if (!item) errors.push(`section ${record.record_id} missing category: ${key}`)
      else if (item.link) errors.push(`section ${record.record_id} generated forbidden landing page link`)
      continue
    }
    if (record.placement_type === 'link') {
      const expectedHref = canonicalizeInternalDocLink(record.ref_target || record.doc_link)
      const item = entries.find(entry => entry.type === 'link' && entry.key === key)
      if (!item || item.href !== expectedHref) errors.push(`link ${record.record_id} href mismatch: expected ${expectedHref || '(missing)'}`)
      continue
    }
    if (record.placement_type === 'ref') {
      const targetToken = record.ref_target_token || sourceToken(record.ref_target)
      const canonical = canonicalByToken.get(targetToken)
      const refSegment = record.slug || canonical?.slug || recordSegment(record)
      const refKey = `ref:${path.posix.join(idPrefix, relativeDir(record), refSegment)}`
      const targetPublishes = canonical && targetMatches(canonical, target) && guidesCanonicalIsPublishable(canonical)
      const item = entries.find(entry => entry.type === 'doc' && entry.key === refKey)
      if (!targetPublishes) {
        if (item) errors.push(`ref ${record.record_id} target is not publishable for ${target}: ${targetToken || '(missing)'}`)
        continue
      }
      const ids = generatedDocsByToken.get(targetToken) || []
      if (ids.length !== 1 || !item || item.id !== ids[0]) errors.push(`ref ${record.record_id} target mismatch: ${targetToken || '(missing)'}`)
    }
  }

  if (errors.length) throw new Error(`Guides source contract failed:\n- ${errors.join('\n- ')}`)
  return { checkedRecords, errors }
}

module.exports = { collectGeneratedDocsByToken, collectSidebarEntries, validateGuidesSourceContract }
