'use strict'

const assert = require('node:assert/strict')

const LOCALIZABLE_KEYS = new Set(['summary', 'description', 'title', 'label', 'prompt', 'content'])
const PRESERVED_SUBTREES = new Set(['example', 'examples', 'default', 'enum', 'enums', 'value'])

function parseRestDocument(content) {
  const marker = 'export const specs = '
  const start = content.indexOf(marker)
  if (start === -1) return null
  const suffixStart = content.indexOf('\nexport const endpoint', start + marker.length)
  if (suffixStart === -1) throw new Error('REST document has specs but no endpoint export')
  const sourceSpecs = JSON.parse(content.slice(start + marker.length, suffixStart))
  return { prefix: content.slice(0, start), sourceSpecs, suffix: content.slice(suffixStart) }
}

function collectLocalizableEntries(root) {
  const entries = []
  function visit(value, path = []) {
    if (!value || typeof value !== 'object') return
    if (Array.isArray(value)) {
      value.forEach((child, index) => visit(child, [...path, index]))
      return
    }
    for (const [key, child] of Object.entries(value)) {
      if (key === 'x-i18n') continue
      if (LOCALIZABLE_KEYS.has(key) && typeof child === 'string' && child.trim()) {
        entries.push({ id: JSON.stringify([...path, key]), text: child, objectPath: path, key })
      }
      if (!PRESERVED_SUBTREES.has(key)) visit(child, [...path, key])
    }
  }
  visit(root)
  return entries
}

function parseTranslationEntries(text, expected) {
  const cleaned = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const parsed = JSON.parse(cleaned)
  if (!Array.isArray(parsed) || parsed.length !== expected.length) throw new Error('REST translation response entry count mismatch')
  const byId = new Map()
  for (const entry of parsed) {
    if (!entry || typeof entry.id !== 'string' || typeof entry.text !== 'string' || byId.has(entry.id)) throw new Error('Invalid REST translation response entry')
    byId.set(entry.id, entry.text)
  }
  return expected.map(entry => {
    if (!byId.has(entry.id)) throw new Error(`Missing REST translation entry ${entry.id}`)
    const translation = byId.get(entry.id)
    const tokens = value => [
      ...(value.match(/`[^`]+`/g) || []),
      ...(value.match(/<[^>]+>/g) || []),
      ...(value.match(/\{\{[^}]+\}\}/g) || []),
      ...(value.match(/https?:\/\/[^\s)]+/g) || []),
    ].sort()
    const remaining = tokens(translation)
    for (const token of tokens(entry.text)) {
      const index = remaining.indexOf(token)
      if (index === -1) throw new Error(`REST translation changed a protected token for ${entry.id}`)
      remaining.splice(index, 1)
    }
    const safeAddedCodeFormatting = token => {
      const match = token.match(/^`([^`]+)`$/)
      return Boolean(match && entry.text.includes(match[1]))
    }
    if (remaining.some(token => !safeAddedCodeFormatting(token))) throw new Error(`REST translation changed a protected token for ${entry.id}`)
    return { ...entry, translation }
  })
}

function clone(value) { return JSON.parse(JSON.stringify(value)) }

function applyLocaleEntries(sourceSpecs, entries, locale) {
  const localized = clone(sourceSpecs)
  for (const entry of entries) {
    let target = localized
    for (const segment of entry.objectPath) target = target[segment]
    target['x-i18n'] ||= {}
    target['x-i18n'][locale] ||= {}
    target['x-i18n'][locale][entry.key] = entry.translation
  }
  return localized
}

function removeLocale(value, locale) {
  const result = clone(value)
  function visit(current) {
    if (!current || typeof current !== 'object') return
    if (Array.isArray(current)) return current.forEach(visit)
    if (current['x-i18n'] && typeof current['x-i18n'] === 'object') {
      delete current['x-i18n'][locale]
      if (Object.keys(current['x-i18n']).length === 0) delete current['x-i18n']
    }
    Object.values(current).forEach(visit)
  }
  visit(result)
  return result
}

function batchEntries(entries, maxChars = 12000) {
  const batches = []
  let batch = [], size = 0
  for (const entry of entries) {
    const entrySize = entry.id.length + entry.text.length
    if (batch.length && size + entrySize > maxChars) { batches.push(batch); batch = []; size = 0 }
    batch.push(entry); size += entrySize
  }
  if (batch.length) batches.push(batch)
  return batches
}

async function translateRestSpecs({ sourceSpecs, locale, callModel, systemPrompt }) {
  const entries = collectLocalizableEntries(sourceSpecs)
  const translated = []
  for (const batch of batchEntries(entries)) {
    const response = await callModel({
      agent: 'translation',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Locale: ${locale}\n\n${JSON.stringify(batch.map(({ id, text }) => ({ id, text })))}` },
      ],
    })
    translated.push(...parseTranslationEntries(response, batch))
  }
  const localized = applyLocaleEntries(sourceSpecs, translated, locale)
  assert.deepEqual(removeLocale(localized, locale), sourceSpecs, 'Localized REST specs changed non-locale data')
  return { localized, translatedCount: translated.length }
}

function assembleRestDocument({ translatedPrefix, localizedSpecs, suffix, locale }) {
  const prefix = translatedPrefix.replace(/lang=(['"])en-US\1/g, `lang="${locale}"`)
  return `${prefix}export const specs = ${JSON.stringify(localizedSpecs)}${suffix}`
}

module.exports = { applyLocaleEntries, assembleRestDocument, batchEntries, collectLocalizableEntries, parseRestDocument, parseTranslationEntries, removeLocale, translateRestSpecs }
