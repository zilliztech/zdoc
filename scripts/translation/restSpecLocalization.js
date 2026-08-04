'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const {formatLocaleContract, loadLocaleContract, validateLocaleContractDraft} = require('./localeContract')
const {protectTranslationInput, restoreProtectedContent, validateProtectedContent} = require('./protectedContent')

const LOCALIZABLE_KEYS = new Set(['summary', 'description', 'title', 'label', 'prompt', 'content'])
const PRESERVED_SUBTREES = new Set(['example', 'examples', 'default', 'enum', 'enums', 'value'])

const PROMPTS_BY_TARGET = Object.freeze({
  'ja-JP': Object.freeze({
    translation: 'codex-translation-agent.ja-JP.md',
    review: 'codex-review-agent.ja-JP.md',
    correction: 'codex-correction-agent.md',
    rest: 'codex-rest-spec-translation-agent.ja-JP.md',
  }),
  'zh-CN-reference': Object.freeze({
    translation: 'codex-translation-agent.zh-CN-reference.md',
    review: 'codex-review-agent.zh-CN-reference.md',
    correction: 'codex-correction-agent.zh-CN-reference.md',
    rest: 'codex-rest-spec-translation-agent.zh-CN-reference.md',
  }),
})

function promptNamesFor(target) {
  const prompts = PROMPTS_BY_TARGET[target]
  if (!prompts) throw new Error(`Unsupported translation target: ${target}`)
  return prompts
}

function loadPrompt(name) {
  return fs.readFileSync(path.join(process.cwd(), '.github', 'prompts', name), 'utf8')
}

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

function parseTranslationEntries(text, expected, localeContract) {
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
    const translation = restoreProtectedContent(byId.get(entry.id), entry.protection.manifest)
    const protectedErrors = validateProtectedContent(entry.text, translation)
    if (protectedErrors.length) throw new Error(`REST translation changed protected content for ${entry.id}: ${protectedErrors.join('; ')}`)
    const localeIssues = validateLocaleContractDraft(entry.protection.content, protectTranslationInput(translation).content, localeContract)
    if (localeIssues.length) throw new Error(`REST translation violates locale contract for ${entry.id}: ${localeIssues.map(issue => issue.comment).join('; ')}`)
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
    const existingLocale = target['x-i18n'][locale]
    if (typeof existingLocale === 'string') target['x-i18n'][locale] = {description: existingLocale}
    else if (!existingLocale || typeof existingLocale !== 'object' || Array.isArray(existingLocale)) target['x-i18n'][locale] = {}
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

async function translateRestSpecs({ sourceSpecs, target, locale, callModel }) {
  const promptName = promptNamesFor(target).rest
  if (!promptName) throw new Error(`REST translation is unsupported for translation target ${target}`)
  const localeContract = loadLocaleContract(target)
  const systemPrompt = `${loadPrompt(promptName)}\n\n${formatLocaleContract(localeContract)}`
  const entries = collectLocalizableEntries(sourceSpecs)
  const translated = []
  for (const batch of batchEntries(entries)) {
    const protectedBatch = batch.map(entry => ({...entry, protection: protectTranslationInput(entry.text)}))
    const response = await callModel({
      agent: 'translation',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Locale: ${locale}\n\n${JSON.stringify(protectedBatch.map(({ id, protection }) => ({ id, text: protection.content })))}` },
      ],
    })
    translated.push(...parseTranslationEntries(response, protectedBatch, localeContract))
  }
  const localized = applyLocaleEntries(sourceSpecs, translated, locale)
  assert.deepEqual(removeLocale(localized, locale), removeLocale(sourceSpecs, locale), 'Localized REST specs changed non-locale data')
  return { localized, translatedCount: translated.length }
}

function assembleRestDocument({ translatedPrefix, localizedSpecs, suffix, locale }) {
  const prefix = translatedPrefix.replace(/lang=(['"])en-US\1/g, `lang="${locale}"`)
  return `${prefix}export const specs = ${JSON.stringify(localizedSpecs)}${suffix}`
}

module.exports = { applyLocaleEntries, assembleRestDocument, batchEntries, collectLocalizableEntries, loadPrompt, parseRestDocument, parseTranslationEntries, promptNamesFor, removeLocale, translateRestSpecs }
